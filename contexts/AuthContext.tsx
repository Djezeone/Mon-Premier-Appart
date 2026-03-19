
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User, OnboardingProfile } from '../types';
import { useToast } from './ToastContext';
import { INITIAL_INVENTORY, KIDS_INVENTORY } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
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

// Mapping des codes d'erreur Supabase Auth vers des messages utilisateurs
const SUPABASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': 'Email ou mot de passe incorrect',
  'user_already_exists': 'Un compte existe déjà avec cet email',
  'email_not_confirmed': "Confirmez votre email avant de vous connecter",
  'weak_password': 'Mot de passe trop court (6 caractères minimum)',
  'over_email_send_rate_limit': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'user_not_found': 'Utilisateur inconnu',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
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

  // Helper: convertit un SupabaseUser en User applicatif
  const mapSupabaseUser = (sbUser: SupabaseUser): User => ({
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Utilisateur',
    email: sbUser.email || '',
    avatar: sbUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email || 'User'}`,
    isPremium: false,
    memberSince: new Date(sbUser.created_at),
  });

  // --- INIT AUTH ---
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Lecture de la session existante
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser(mapSupabaseUser(session.user));
        }
        setIsLoading(false);
      });

      // Écoute des changements d'état
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser(mapSupabaseUser(session.user));
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // MODE DÉMO LOCAL
      const savedUser = localStorage.getItem('demo_user_session');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, memberSince: new Date(parsedUser.memberSince) });
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('roommates-list', JSON.stringify(roommates));
  }, [roommates]);

  // --- ACTIONS ---

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: { prompt: 'select_account' },
          },
        });
        if (error) throw error;
        // La redirection OAuth gère la suite ; showToast après retour dans onAuthStateChange
      } catch (error: any) {
        console.error('Google Auth Error:', error);
        const msg = SUPABASE_AUTH_ERROR_MESSAGES[error.code] || 'Erreur de connexion Google';
        showToast(msg, 'error');
      }
    } else {
      // Mock Google Login
      const mockUser: User = {
        id: 'demo-google-id',
        name: 'Demo Google',
        email: 'demo@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Demo+Google&background=random',
        isPremium: true,
        memberSince: new Date(),
      };
      setUser(mockUser);
      localStorage.setItem('demo_user_session', JSON.stringify(mockUser));
      showToast('Mode Démo : Connexion simulée', 'success');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        showToast('Connexion réussie', 'success');
      } catch (error: any) {
        const msg = SUPABASE_AUTH_ERROR_MESSAGES[error.code] || error.message || 'Erreur de connexion';
        showToast(msg, 'error');
        throw error;
      }
    } else {
      // Mock Email Login
      const mockUser: User = {
        id: 'demo-email-id',
        name: email.split('@')[0],
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${email}`,
        isPremium: false,
        memberSince: new Date(),
      };
      setUser(mockUser);
      localStorage.setItem('demo_user_session', JSON.stringify(mockUser));
      showToast('Mode Démo : Connexion locale', 'success');
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
        showToast('Compte créé ! Vérifiez votre email pour confirmer.', 'success');
      } catch (error: any) {
        const msg = SUPABASE_AUTH_ERROR_MESSAGES[error.code] || error.message || "Erreur d'inscription";
        showToast(msg, 'error');
        throw error;
      }
    } else {
      // Mock Register
      loginWithEmail(email, pass);
    }
  };

  const logout = async () => {
    if (window.confirm('Se déconnecter ?')) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
          setUser(null);
          showToast('À bientôt !', 'info');
        } catch (error) {
          showToast('Erreur lors de la déconnexion', 'error');
        }
      } else {
        // Mock Logout
        localStorage.removeItem('demo_user_session');
        setUser(null);
        showToast('Déconnexion locale effectuée', 'info');
        window.location.reload();
      }
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      if (!isSupabaseConfigured) {
        localStorage.setItem('demo_user_session', JSON.stringify(updated));
      }
      showToast('Profil mis à jour', 'success');
    }
  };

  const upgradeToPremium = () => {
    if (user) updateUser({ isPremium: true });
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addRoommate = (name: string) => {
    if (!roommates.includes(name)) {
      setRoommates([...roommates, name]);
      showToast(`${name} ajouté(e) !`, 'success');
    }
  };

  const removeRoommate = (name: string) => {
    setRoommates(prev => prev.filter(r => r !== name));
    showToast(`${name} retiré(e).`, 'info');
  };

  const completeOnboarding = (profile: OnboardingProfile, setInventoryCallback: (items: any) => void) => {
    let scaledInventory = [...INITIAL_INVENTORY];
    if (profile.type === 'family') {
      scaledInventory = [...scaledInventory, ...KIDS_INVENTORY];
    }
    setInventoryCallback(scaledInventory);
    setHasOnboarded(true);
    localStorage.setItem('has-onboarded-v1', 'true');
    if (user) updateUser({ name: profile.name });
  };

  const completeTutorial = () => {
    setHasSeenTutorial(true);
    localStorage.setItem('has-seen-tutorial', 'true');
  };

  return (
    <AuthContext.Provider value={{
      user, supabaseUser, hasOnboarded, isDarkMode, roommates,
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
