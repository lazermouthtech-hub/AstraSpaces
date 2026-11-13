import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocFromServer,
  collection,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, UserSavedProject, CustomizationState, HomeModelId } from '../types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// CRITICAL: Specify firestoreDatabaseId so Firestore connects to the provisioned named database
// Uses Firebase default WebChannel + experimentalAutoDetectLongPolling instead of forcing long polling
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
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    // If the server responded with permission-denied, the connection is confirmed and active
    if (code === 'permission-denied') {
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Strip undefined properties recursively so Firestore setDoc/updateDoc never rejects optional fields
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        cleaned[k] = stripUndefined(v);
      }
    }
    return cleaned as T;
  }
  return value;
}

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
  const fullName = (
    profileData?.fullName ||
    fbUser.displayName ||
    fbUser.email?.split('@')[0] ||
    '10Apples Customer'
  )
    .trim()
    .slice(0, 128) || '10Apples Customer';
  const email = (fbUser.email || '').trim().slice(0, 256);
  const phone = profileData?.phone?.trim().slice(0, 32);

  const docPayload = {
    id: fbUser.uid,
    fullName,
    email,
    ...(phone ? { phone } : {}),
    role: 'customer',
    createdAt: (fbUser.metadata.creationTime || new Date().toISOString()).slice(0, 64),
    updatedAt: new Date().toISOString(),
  };

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, docPayload, { merge: true });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
    console.warn('Could not sync user profile to Firestore (may be offline):', error);
  }

  // Fetch saved projects
  const projects = await fetchUserProjectsFromFirestore(fbUser.uid);
  return mapFirebaseUserToAccount(fbUser, {
    fullName,
    phone,
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
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, projectsPath);
    }
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
  const cleanedState = stripUndefined(project.state);

  const savedItem: UserSavedProject = {
    id: projectId,
    name: `${project.modelName} Custom Build`.slice(0, 128),
    modelId: project.modelId,
    modelName: project.modelName.slice(0, 128),
    totalPrice: Math.max(0, Number(project.totalPrice) || 0),
    currency: (project.currency || 'USD').slice(0, 10),
    savedAt: now,
    state: cleanedState,
  };

  const firestoreData = {
    id: projectId,
    userId,
    name: savedItem.name,
    modelId: String(savedItem.modelId).slice(0, 64),
    modelName: savedItem.modelName,
    totalPrice: savedItem.totalPrice,
    currency: savedItem.currency,
    savedAt: now,
    state: cleanedState,
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
  const cleanedUpdates = stripUndefined(updates);
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await updateDoc(projectRef, cleanedUpdates as Record<string, unknown>);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, projectsPath);
  }
}
