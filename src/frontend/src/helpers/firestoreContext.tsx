import React, { createContext, useContext, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  setDoc,
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import firebase from "firebase/compat/app";
import { PartialKeys } from "@tanstack/react-table";

export const createFirestoreContext = function <DataType extends DocumentData>(
  collectionName: string,
  ...collectionPathSegments: string[]
) {
  const fullCollectionPath = `${collectionName}${collectionPathSegments.length > 0 ? "/" + collectionPathSegments.join("/") : ""}`;
  console.log(`Got full collection path as: ${fullCollectionPath}`);
  type DataQuerySnapshot = QuerySnapshot<
    DataType,
    firebase.firestore.DocumentData
  >;

  type FirestoreDataType = DataType & {
    id: string;
  };

  type FirestoreDataTypeOptionalId = PartialKeys<FirestoreDataType, "id">;
  type FirestoreDataTypeWithoutId = Omit<FirestoreDataType, "id">;

  interface FirestoreAccessors {
    getRef: (id: string) => DocumentReference<DocumentData, DocumentData>;
    getCollection: () => CollectionReference<
      FirestoreDataType,
      firebase.firestore.DocumentData
    >;
    create: (item: FirestoreDataTypeWithoutId) => Promise<FirestoreDataType>;
    set: (
      item: FirestoreDataTypeOptionalId | FirestoreDataType,
    ) => Promise<FirestoreDataType>;
    get: (id: string) => Promise<
      | {
          data: FirestoreDataType;
          doc: DocumentSnapshot<DocumentData, DocumentData>;
        }
      | undefined
    >;
  }

  interface FirestoreDataContextType {
    data: FirestoreDataType[];
    loading: boolean;
    snapshot: DataQuerySnapshot | undefined;
    error: string | null;
    firestore: FirestoreAccessors;
    refresh: () => Promise<void>;
  }

  const dataConverter = {
    toFirestore(item: FirestoreDataType): firebase.firestore.DocumentData {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...itemWithoutId } = item;
      return itemWithoutId;
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>,
      options?: firebase.firestore.SnapshotOptions,
    ): FirestoreDataType {
      const data = snapshot.data(options);
      data.id = snapshot.id;
      return data as FirestoreDataType;
    },
  };

  const firestoreAccessors: FirestoreAccessors = {
    getRef: (id: string) => {
      return doc(firestore, collectionName, ...collectionPathSegments, id);
    },
    getCollection: () => {
      return collection(
        firestore,
        collectionName,
        ...collectionPathSegments,
      ).withConverter(dataConverter);
    },
    create: async (item: FirestoreDataTypeWithoutId) => {
      const id = (await addDoc(firestoreAccessors.getCollection(), item)).id;

      return {
        ...item,
        id,
      } as FirestoreDataType;
    },
    get: async (id: string) => {
      const ref = firestoreAccessors.getRef(id);
      const docRef = await getDoc(ref);
      if (docRef.exists() && docRef.id != id) {
        throw new Error(
          `The document id for the firestore item '${id}' in collection '${fullCollectionPath}' did not match, id was '${docRef.id}' expected '${id}'`,
        );
      }

      if (!docRef.exists()) {
        return undefined;
      }

      const data = docRef.data();
      const item = {
        ...data,
        id,
      } as FirestoreDataType;

      return { data: item, doc: docRef };
    },
    set: async (item: FirestoreDataTypeOptionalId | FirestoreDataType) => {
      if (item.id) {
        const { id, ...itemWithoutId } = item as FirestoreDataType;
        await setDoc(firestoreAccessors.getRef(id), itemWithoutId);
      } else {
        item = await firestoreAccessors.create(item);
      }
      return item as FirestoreDataType;
    },
  };

  const FirestoreDataContext = createContext<
    FirestoreDataContextType | undefined
  >(undefined);

  const DataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [data, setData] = useState<FirestoreDataType[]>([]);
    const [snapshot, setSnapshot] = useState<DataQuerySnapshot | undefined>(
      undefined,
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dataCollection = firestoreAccessors.getCollection();
        const dataSnapshot = await getDocs(dataCollection);
        setSnapshot(dataSnapshot);

        const dataList: FirestoreDataType[] = dataSnapshot.docs.map((doc) =>
          doc.data(),
        );

        setData(dataList);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to load data from collection '${collectionName}'`,
        );
        console.error(
          `Error loading data from collection '${collectionName}':`,
          err,
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const dataCollection = firestoreAccessors.getCollection();
      const q = query(dataCollection);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const dataList: FirestoreDataType[] = snapshot.docs.map(
            (doc) => doc.data() as FirestoreDataType,
          );

          setSnapshot(snapshot);
          setData(dataList);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          console.error(`Error in '${collectionName}' snapshot:`, err);
        },
      );

      return () => unsubscribe();
    }, []);

    const value: FirestoreDataContextType = {
      data,
      loading,
      error,
      snapshot,
      firestore: firestoreAccessors,
      refresh: async () => {
        await loadData();
      },
    };

    return (
      <FirestoreDataContext.Provider value={value}>
        {children}
      </FirestoreDataContext.Provider>
    );
  };

  const useDataContext = () => {
    const context = useContext(FirestoreDataContext);
    if (context === undefined) {
      throw new Error(
        `useDataContext must be used within the FirestoreContextProvider for the '${collectionName}' collection`,
      );
    }
    return context;
  };

  return {
    provider: DataProvider,
    useContext: useDataContext,
  };
};
