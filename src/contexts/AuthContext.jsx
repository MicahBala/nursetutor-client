import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() { 
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    // 1. We now hold TWO pieces of user data
    const [currentUser, setCurrentUser] = useState(null); // The Google ID
    const [dbUser, setDbUser] = useState(null);           // The MongoDB Profile (Credits, Courses)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken();

                    const response = await fetch('http://localhost:5000/api/users/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const dbUserData = await response.json();
                        setCurrentUser(user);
                        setDbUser(dbUserData); 
                    } else {
                        console.error("Failed to sync user with database");
                        setCurrentUser(user); // Still log them in via Firebase as a fallback
                    }
                } catch (error) {
                    console.error("Error communicating with backend:", error);
                    setCurrentUser(user);
                }
            } else {
                // If they logged out, clear everything
                setCurrentUser(null);
                setDbUser(null);
            }
            
            setLoading(false); 
        });

        return unsubscribe; 
    }, []);
    
    const logout = () => {
        return signOut(auth);
    };

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const value = {
        currentUser,
        dbUser,      // <-- Now your whole app can access dbUser.mockExamCredits!
        logout,
        loginWithGoogle 
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}