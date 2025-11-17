import * as React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import { IdTokenResult, User } from "@shared/types/user";

export interface AuthContext {
  user: User | null;
  userData: UserData | null;
  token: IdTokenResult | null;
  loading: boolean;
  isAdmin: () => boolean;
}

interface UserData {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  base64Image?: string | null;
  // Add any other user fields you want to track
}

const AuthContext = React.createContext<AuthContext>({
  user: null,
  userData: null,
  token: null,
  loading: true,
  isAdmin: () => {
    return false;
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => React.useContext<AuthContext>(AuthContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [token, setToken] = React.useState<IdTokenResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function getToken(user: User) {
    const fbToken = await user.getIdTokenResult();
    setToken(fbToken);
  }

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setUserData(null);
        setToken(null);
        setLoading(false);
      } else {
        getToken(user);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  React.useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    if (user?.uid) {
      const userRef = doc(firestore, "users", user.uid);
      unsubscribeFirestore = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        } else {
          // Initialize user document if it doesn't exist
          setUserData({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });
        }
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user?.displayName, user?.email, user?.photoURL, user?.uid]);

  const isAdmin = () => {
    return (token && token.claims.role === "admin") || false;
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, token, isAdmin }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
