import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocFromServer,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, UserSavedProject, CustomizationState, HomeModelId } from '../types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore with experimentalForceLongPolling to ensure reliable HTTPS connectivity in iframe/sandbox environments
try {
  initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  // If already initialized, continue
}

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standardized Operation Types & Error Handling per Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // If the server responded with permission-denied, the connection is confirmed and active
    if (error?.code === 'permission-denied') {
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client operating in offline mode.');
    }
  }
}
testConnection();

// Convert Firebase User to App UserAccount
export const mapFirebaseUserToAccount = (
  fbUser: FirebaseUser,
  extra?: { phone?: string; fullName?: string; projects?: UserSavedProject[] }
): UserAccount => {
  return {
    id: fbUser.uid,
    fullName: extra?.fullName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Modular Builder',
    email: fbUser.email || '',
    phone: extra?.phone || fbUser.phoneNumber || undefined,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    savedProjects: extra?.projects || [],
  };
};

// Sync User Profile Document to Firestore (/users/{userId})
export async function syncUserProfileToFirestore(
  fbUser: FirebaseUser,
  profileData?: { fullName?: string; phone?: string }
): Promise<UserAccount> {
  const userPath = `users/${fbUser.uid}`;
  const fullName = profileData?.fullName || fbUser.displayName || fbUser.email?.split('@')[0] || '10Apples Customer';
  const email = fbUser.email || '';

  const docPayload = {
    id: fbUser.uid,
    fullName,
    email,
    ...(profileData?.phone ? { phone: profileData.phone } : {}),
    role: 'customer',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, docPayload, { merge: true });
  } catch (error) {
    console.warn('Could not sync user profile to Firestore (may be offline):', error);
  }

  // Fetch saved projects
  const projects = await fetchUserProjectsFromFirestore(fbUser.uid);
  return mapFirebaseUserToAccount(fbUser, {
    fullName,
    phone: profileData?.phone,
    projects,
  });
}

// Fetch User Projects from Firestore (/users/{userId}/projects)
export async function fetchUserProjectsFromFirestore(userId: string): Promise<UserSavedProject[]> {
  const projectsPath = `users/${userId}/projects`;
  try {
    const projectsCol = collection(db, 'users', userId, 'projects');
    const snapshot = await getDocs(projectsCol);
    const list: UserSavedProject[] = [];
    snapshot.forEach((snapDoc) => {
      const data = snapDoc.data();
      list.push({
        id: snapDoc.id,
        name: data.name || `${data.modelName || 'Custom'} Build`,
        modelId: data.modelId,
        modelName: data.modelName || 'Modular Home',
        totalPrice: Number(data.totalPrice) || 0,
        currency: data.currency || 'USD',
        savedAt: data.savedAt || new Date().toISOString(),
        state: data.state || ({} as CustomizationState),
      });
    });
    return list;
  } catch (error) {
    console.warn('Could not fetch user projects from Firestore:', error);
    return [];
  }
}

// Save Project Document to Firestore (/users/{userId}/projects/{projectId})
export async function saveProjectDocumentToFirestore(
  userId: string,
  project: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  }
): Promise<UserSavedProject> {
  const projectId = `proj-${Date.now()}`;
  const projectsPath = `users/${userId}/projects/${projectId}`;
  const now = new Date().toISOString();

  const savedItem: UserSavedProject = {
    id: projectId,
    name: `${project.modelName} Custom Build`,
    modelId: project.modelId,
    modelName: project.modelName,
    totalPrice: project.totalPrice,
    currency: project.currency,
    savedAt: now,
    state: project.state,
  };

  const firestoreData = {
    id: projectId,
    userId,
    name: savedItem.name,
    modelId: savedItem.modelId,
    modelName: savedItem.modelName,
    totalPrice: savedItem.totalPrice,
    currency: savedItem.currency,
    savedAt: now,
    state: savedItem.state,
  };

  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await setDoc(projectRef, firestoreData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, projectsPath);
  }

  return savedItem;
}

// Delete Project Document from Firestore (/users/{userId}/projects/{projectId})
export async function deleteProjectDocumentFromFirestore(
  userId: string,
  projectId: string
): Promise<void> {
  const projectsPath = `users/${userId}/projects/${projectId}`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, projectsPath);
  }
}

// Update Project Document in Firestore
export async function updateProjectDocumentInFirestore(
  userId: string,
  projectId: string,
  updates: Partial<UserSavedProject>
): Promise<void> {
  const projectsPath = `users/${userId}/projects/${projectId}`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await updateDoc(projectRef, updates as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, projectsPath);
  }
}

