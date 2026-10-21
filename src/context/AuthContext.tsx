import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  syncUserProfileToFirestore,
  fetchUserProjectsFromFirestore,
  saveProjectDocumentToFirestore,
  deleteProjectDocumentFromFirestore,
  updateProjectDocumentInFirestore,
} from '../lib/firebase';
import { UserAccount, UserSavedProject, CustomizationState, HomeModelId } from '../types';
import {
  setCurrentUser,
  AUTH_CHANGE_EVENT,
  deleteProjectForCurrentUser as localDeleteProject,
  renameProjectForCurrentUser as localRenameProject,
  duplicateProjectForCurrentUser as localDuplicateProject,
} from '../utils/authManager';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserAccount | null;
  loading: boolean;
  signInWithGoogle: (projectToSave?: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  }) => Promise<{ success: boolean; user?: UserAccount; error?: string; code?: string }>;
  loginWithEmail: (
    email: string,
    password?: string,
    projectToSave?: {
      modelId: HomeModelId;
      modelName: string;
      totalPrice: number;
      currency: string;
      state: CustomizationState;
    }
  ) => Promise<{ success: boolean; user?: UserAccount; error?: string; code?: string }>;
  registerWithEmail: (
    fullName: string,
    email: string,
    password?: string,
    phone?: string,
    projectToSave?: {
      modelId: HomeModelId;
      modelName: string;
      totalPrice: number;
      currency: string;
      state: CustomizationState;
    }
  ) => Promise<{ success: boolean; user?: UserAccount; error?: string; code?: string }>;
  logout: () => Promise<void>;
  saveCurrentProject: (project: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  }) => Promise<UserSavedProject | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  renameProject: (projectId: string, newName: string) => Promise<boolean>;
  duplicateProject: (projectId: string) => Promise<UserSavedProject | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const account = await syncUserProfileToFirestore(user);
          setCurrentUserState(account);
          setCurrentUser(account);
        } catch (e) {
          console.error('Error syncing user onAuthStateChanged', e);
        }
      } else {
        setCurrentUserState(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In (Primary Firebase Auth Flow)
  const signInWithGoogle = async (projectToSave?: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  }) => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const account = await syncUserProfileToFirestore(res.user);
      
      if (projectToSave) {
        const savedProject = await saveProjectDocumentToFirestore(res.user.uid, projectToSave);
        account.savedProjects = [savedProject, ...(account.savedProjects || [])];
      }

      setCurrentUserState(account);
      setCurrentUser(account);
      return { success: true, user: account };
    } catch (err: any) {
      console.warn('Google Sign In notice:', err?.message || err);
      return {
        success: false,
        code: err?.code,
        error: err?.message || 'Google sign-in was cancelled or encountered an error.',
      };
    }
  };

  // Email / Password Login
  const loginWithEmail = async (
    email: string,
    password?: string,
    projectToSave?: {
      modelId: HomeModelId;
      modelName: string;
      totalPrice: number;
      currency: string;
      state: CustomizationState;
    }
  ) => {
    try {
      const pass = password || 'welcome123';
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const account = await syncUserProfileToFirestore(res.user);

      if (projectToSave) {
        const savedProject = await saveProjectDocumentToFirestore(res.user.uid, projectToSave);
        account.savedProjects = [savedProject, ...(account.savedProjects || [])];
      }

      setCurrentUserState(account);
      setCurrentUser(account);
      return { success: true, user: account };
    } catch (err: any) {
      console.warn('Email sign in notice:', err?.code || err?.message);
      let errorMsg = 'Failed to sign in. Please verify your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg = 'No account found with this email or invalid password.';
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Access temporarily disabled due to multiple failed attempts. Try again later.';
      }
      return { success: false, code: err?.code, error: errorMsg };
    }
  };

  // Email / Password Registration
  const registerWithEmail = async (
    fullName: string,
    email: string,
    password?: string,
    phone?: string,
    projectToSave?: {
      modelId: HomeModelId;
      modelName: string;
      totalPrice: number;
      currency: string;
      state: CustomizationState;
    }
  ) => {
    try {
      const pass = password || 'welcome123';
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Update display name on Firebase User profile
      await updateProfile(res.user, { displayName: fullName.trim() });

      // Sync Firestore profile
      const account = await syncUserProfileToFirestore(res.user, {
        fullName: fullName.trim(),
        phone: phone?.trim(),
      });

      if (projectToSave) {
        const savedProject = await saveProjectDocumentToFirestore(res.user.uid, projectToSave);
        account.savedProjects = [savedProject, ...(account.savedProjects || [])];
      }

      setCurrentUserState(account);
      setCurrentUser(account);
      return { success: true, user: account };
    } catch (err: any) {
      console.warn('Email registration status:', err?.code || err?.message);

      // If email is already in use, attempt automatic sign-in with the provided credentials
      if (err.code === 'auth/email-already-in-use') {
        try {
          const pass = password || 'welcome123';
          const autoRes = await signInWithEmailAndPassword(auth, email.trim(), pass);
          const account = await syncUserProfileToFirestore(autoRes.user);

          if (projectToSave) {
            const savedProject = await saveProjectDocumentToFirestore(autoRes.user.uid, projectToSave);
            account.savedProjects = [savedProject, ...(account.savedProjects || [])];
          }

          setCurrentUserState(account);
          setCurrentUser(account);
          return { success: true, user: account };
        } catch (autoErr: any) {
          // If auto sign-in with this password failed, return a user-friendly instruction to sign in
          return {
            success: false,
            code: 'auth/email-already-in-use',
            error: 'This email is already registered. Please sign in with your password.',
          };
        }
      }

      let errorMsg = err.message || 'Registration failed.';
      if (err.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please provide a valid email address.';
      }
      return { success: false, code: err?.code, error: errorMsg };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUserState(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Save current project configuration to Firestore
  const saveCurrentProject = async (project: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  }): Promise<UserSavedProject | null> => {
    if (!firebaseUser) return null;
    try {
      const saved = await saveProjectDocumentToFirestore(firebaseUser.uid, project);
      if (currentUser) {
        const updatedList = [saved, ...(currentUser.savedProjects || []).filter((p) => p.modelId !== project.modelId)];
        const updatedAccount = { ...currentUser, savedProjects: updatedList };
        setCurrentUserState(updatedAccount);
        setCurrentUser(updatedAccount);
      }
      return saved;
    } catch (err) {
      console.error('Error saving project to Firestore:', err);
      return null;
    }
  };

  // Delete project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    if (firebaseUser) {
      try {
        await deleteProjectDocumentFromFirestore(firebaseUser.uid, projectId);
      } catch (err) {
        console.warn('Could not delete from Firestore:', err);
      }
    }
    localDeleteProject(projectId);
    if (currentUser) {
      const updatedList = (currentUser.savedProjects || []).filter((p) => p.id !== projectId);
      const updatedAccount = { ...currentUser, savedProjects: updatedList };
      setCurrentUserState(updatedAccount);
      setCurrentUser(updatedAccount);
    }
    return true;
  };

  // Rename project
  const renameProject = async (projectId: string, newName: string): Promise<boolean> => {
    if (firebaseUser) {
      try {
        await updateProjectDocumentInFirestore(firebaseUser.uid, projectId, { name: newName });
      } catch (err) {
        console.warn('Could not rename in Firestore:', err);
      }
    }
    localRenameProject(projectId, newName);
    if (currentUser) {
      const updatedList = (currentUser.savedProjects || []).map((p) =>
        p.id === projectId ? { ...p, name: newName } : p
      );
      const updatedAccount = { ...currentUser, savedProjects: updatedList };
      setCurrentUserState(updatedAccount);
      setCurrentUser(updatedAccount);
    }
    return true;
  };

  // Duplicate project
  const duplicateProject = async (projectId: string): Promise<UserSavedProject | null> => {
    const target = currentUser?.savedProjects?.find((p) => p.id === projectId);
    if (!target) return null;

    if (firebaseUser) {
      try {
        const duplicated = await saveProjectDocumentToFirestore(firebaseUser.uid, {
          modelId: target.modelId,
          modelName: `${target.modelName} (Copy)`,
          totalPrice: target.totalPrice,
          currency: target.currency,
          state: target.state,
        });
        if (currentUser) {
          const updatedList = [duplicated, ...(currentUser.savedProjects || [])];
          const updatedAccount = { ...currentUser, savedProjects: updatedList };
          setCurrentUserState(updatedAccount);
          setCurrentUser(updatedAccount);
        }
        return duplicated;
      } catch (err) {
        console.warn('Could not duplicate in Firestore:', err);
      }
    }

    const localDup = localDuplicateProject(projectId);
    if (localDup && currentUser) {
      const updatedList = [localDup, ...(currentUser.savedProjects || [])];
      const updatedAccount = { ...currentUser, savedProjects: updatedList };
      setCurrentUserState(updatedAccount);
      setCurrentUser(updatedAccount);
    }
    return localDup;
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        saveCurrentProject,
        deleteProject,
        renameProject,
        duplicateProject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
