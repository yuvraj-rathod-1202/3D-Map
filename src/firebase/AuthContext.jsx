import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase.config";
import {
  GoogleAuthProvider,
  onAuthStateChanged,  
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { addUser } from "./firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // Sign in with Google
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await addUser(user);
  };

  // Logout the user
  const logout = () => {
    return signOut(auth);
  };

  // Manage user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { email, displayName, photoURL, uid } = user;
        setCurrentUser({
          email,
          username: displayName,
          photo: photoURL,
          uid: uid,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;