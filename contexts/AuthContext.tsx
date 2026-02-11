
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, OnboardingProfile } from '../types';
import { useToast } from './ToastContext';
import { INITIAL_INVENTORY, KIDS_INVENTORY } from '../constants';
import { auth, googleProvider } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  hasOnboarded: boolean;
  isDarkMode: boolean;
  roommates: string[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  upgradeToPremium: () => void;
  completeOnboarding: (profile: OnboardingProfile, setInventoryCallback: (items: any) => void) => void;
  toggleDarkMode: () => void;
  addRoommate: (name: string) => void;
  removeRoommate: (name: string) => void;
  hasSeenTutorial: boolean;
  completeTutorial: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('has-onboarded-v1') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('dark-mode') === 'true';
  });

  const [roommates, setRoommates] = useState<string[]>(() => {
    const saved = localStorage.getItem('roommates-list');
    return saved ? JSON.parse(saved) : [];
  });

  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(() => {
    return localStorage.getItem('has-seen-tutorial') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Utilisateur',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.email || 'User'}`,
          isPremium: false,
          memberSince: new Date()
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('roommates-list', JSON.stringify(roommates));
  }, [roommates]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Bienvenue !", "success");
    } catch (error: any) {
      console.error(error);
      showToast("Vérifiez que Google Auth est activé dans votre console Firebase.", "error");
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast("Connexion réussie", "success");
    } catch (error: any) {
      let msg = "Erreur de connexion";
      if (error.code === 'auth/user-not-found') msg = "Utilisateur inconnu";
      if (error.code === 'auth/wrong-password') msg = "Mot de passe incorrect";
      showToast(msg, "error");
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      showToast("Compte créé avec succès !", "success");
    } catch (error: any) {
      let msg = "Erreur d'inscription";
      if (error.code === 'auth/email-already-in-use') msg = "Email déjà utilisé";
      if (error.code === 'auth/weak-password') msg = "Mot de passe trop court (6 min)";
      showToast(msg, "error");
      throw error;
    }
  };

  const logout = async () => {
    if (window.confirm("Se déconnecter ?")) {
      try {
        await signOut(auth);
        setUser(null);
        showToast("À bientôt !", "info");
      } catch (error) {
        showToast("Erreur lors de la déconnexion", "error");
      }
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
      showToast("Profil mis à jour", "success");
    }
  };

  const upgradeToPremium = () => {
    if (user) setUser({ ...user, isPremium: true });
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addRoommate = (name: string) => {
    if (!roommates.includes(name)) {
      setRoommates([...roommates, name]);
      showToast(`${name} ajouté(e) !`, "success");
    }
  };

  const removeRoommate = (name: string) => {
    setRoommates(prev => prev.filter(r => r !== name));
    showToast(`${name} retiré(e).`, "info");
  };

  const completeOnboarding = (profile: OnboardingProfile, setInventoryCallback: (items: any) => void) => {
    let scaledInventory = [...INITIAL_INVENTORY];
    if (profile.type === 'family') {
      scaledInventory = [...scaledInventory, ...KIDS_INVENTORY];
    }
    setInventoryCallback(scaledInventory);
    setHasOnboarded(true);
    localStorage.setItem('has-onboarded-v1', 'true');
    if (user) setUser({ ...user, name: profile.name });
  };

  const completeTutorial = () => {
    setHasSeenTutorial(true);
    localStorage.setItem('has-seen-tutorial', 'true');
  };

  return (
    <AuthContext.Provider value={{
      user, firebaseUser, hasOnboarded, isDarkMode, roommates, 
      loginWithGoogle, loginWithEmail, registerWithEmail,
      logout, updateUser, upgradeToPremium, completeOnboarding, 
      toggleDarkMode, addRoommate, removeRoommate, hasSeenTutorial, completeTutorial
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
