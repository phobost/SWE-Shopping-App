import React, { createContext, useContext, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SetOptions,
  Transaction,
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

  const firestoreAccessorsUtil = {
    getNewRef: () => {
      return doc(firestoreAccessorsUtil.getCollection());
    },
    getRef: (id: string) => {
      return doc(
        firestore,
        collectionName,
        ...collectionPathSegments,
        id,
      ).withConverter(dataConverter);
    },
    getCollection: () => {
      return collection(
        firestore,
        collectionName,
        ...collectionPathSegments,
      ).withConverter(dataConverter);
    },
    create: async (item: FirestoreDataTypeWithoutId) => {
      const id = (await addDoc(firestoreAccessorsUtil.getCollection(), item))
        .id;

      return {
        ...item,
        id,
      } as FirestoreDataType;
    },
    get: async (id: string) => {
      const ref = firestoreAccessorsUtil.getRef(id);
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
    transact: (transaction: Transaction) => {
      return {
        set: (data: FirestoreDataTypeOptionalId, options?: SetOptions) => {
          let ref = undefined;
          let dataWithoutId: FirestoreDataTypeWithoutId | undefined = undefined;
          if (data.id) {
            const { id, ...rest } = data;
            ref = firestoreAccessorsUtil.getRef(id);
            dataWithoutId = rest as unknown as FirestoreDataTypeWithoutId;
          } else {
            ref = firestoreAccessorsUtil.getNewRef();
            dataWithoutId = data;
          }
          if (options) {
            return transaction.set(ref, dataWithoutId, options);
          } else {
            return transaction.set(ref, dataWithoutId);
          }
        },
        create: (data: FirestoreDataTypeOptionalId, options?: SetOptions) => {
          const ref = firestoreAccessorsUtil.getNewRef();
          let dataWithoutId: FirestoreDataTypeWithoutId | undefined = undefined;
          if (data.id) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = data;
            dataWithoutId = rest as unknown as FirestoreDataTypeWithoutId;
          } else {
            dataWithoutId = data;
          }

          const created = {
            id: ref.id,
            ...dataWithoutId,
          } as FirestoreDataType;
          if (options) {
            return {
              created,
              res: transaction.set(ref, dataWithoutId, options),
            };
          } else {
            return { created, res: transaction.set(ref, dataWithoutId) };
          }
        },
        get: (id: string) => {
          return transaction.get(firestoreAccessors.getRef(id));
        },
        update: (data: FirestoreDataType) => {
          const { id, ...rest } = data;
          return transaction.update(firestoreAccessors.getRef(id), rest);
        },
        delete: (id: string) => {
          return transaction.delete(firestoreAccessors.getRef(id));
        },
      };
    },
  };

  const firestoreAccessors = {
    ...firestoreAccessorsUtil,
  };

  interface FirestoreDataContextType {
    data: FirestoreDataType[];
    loading: boolean;
    snapshot: DataQuerySnapshot | undefined;
    error: string | null;
    firestore: typeof firestoreAccessors;
    refresh: () => Promise<void>;
  }

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
