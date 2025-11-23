import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import firebase from "firebase/compat/app";

export const createFirestoreContext = function <DataType extends DocumentData>(
  collectionName: string,
) {
  type DataQuerySnapshot = QuerySnapshot<
    DataType,
    firebase.firestore.DocumentData
  >;

  type FirestoreDataType = DataType & {
    id: string;
  };

  interface FirestoreDataContextType {
    data: FirestoreDataType[];
    loading: boolean;
    snapshot: DataQuerySnapshot | undefined;
    error: string | null;
    refresh: () => Promise<void>;
  }

  const FirestoreDataContext = createContext<
    FirestoreDataContextType | undefined
  >(undefined);

  interface FirestoreDataProviderProps {
    children: React.ReactNode;
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

  const DataProvider: React.FC<FirestoreDataProviderProps> = ({ children }) => {
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

        const dataCollection = collection(
          firestore,
          collectionName,
        ).withConverter(dataConverter);
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
      const dataCollection = collection(
        firestore,
        collectionName,
      ).withConverter(dataConverter);
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
