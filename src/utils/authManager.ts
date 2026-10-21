import { UserAccount, UserSavedProject, CustomizationState, HomeModelId } from '../types';

export type { UserAccount, UserSavedProject };

const STORAGE_USER_KEY = '10apples_current_user';
const STORAGE_REGISTERED_USERS_KEY = '10apples_registered_users';
export const AUTH_CHANGE_EVENT = '10apples_auth_changed';

// Initial pre-registered sample customer for demo convenience
const SEED_USERS: UserAccount[] = [
  {
    id: 'user-demo-1',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '(555) 234-5678',
    password: 'password123',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    savedProjects: [],
  },
];

export const getRegisteredUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTERED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading registered users', e);
  }
  return SEED_USERS;
};

export const saveRegisteredUsers = (users: UserAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving registered users', e);
  }
};

export const getCurrentUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading current user', e);
  }
  return null;
};

export const isUserSignedUp = (): boolean => {
  const user = getCurrentUser();
  return Boolean(user && user.id && user.email);
};

export const setCurrentUser = (user: UserAccount | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: user }));
  } catch (e) {
    console.error('Failed setting current user', e);
  }
};

export const registerCustomer = (data: {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  initialProject?: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  };
}): { success: boolean; user?: UserAccount; error?: string } => {
  const email = data.email.trim().toLowerCase();
  const fullName = data.fullName.trim();

  if (!email || !fullName) {
    return { success: false, error: 'Full name and email are required.' };
  }

  const allUsers = getRegisteredUsers();
  const existing = allUsers.find((u) => u.email.toLowerCase() === email);

  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const initialProjects: UserSavedProject[] = [];
  if (data.initialProject) {
    initialProjects.push({
      id: `proj-${Date.now()}`,
      name: `${data.initialProject.modelName} Custom Build`,
      modelId: data.initialProject.modelId,
      modelName: data.initialProject.modelName,
      totalPrice: data.initialProject.totalPrice,
      currency: data.initialProject.currency,
      savedAt: new Date().toISOString(),
      state: data.initialProject.state,
    });
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    fullName,
    email,
    phone: data.phone?.trim() || undefined,
    password: data.password || 'password123',
    createdAt: new Date().toISOString(),
    savedProjects: initialProjects,
  };

  const updatedUsers = [...allUsers, newUser];
  saveRegisteredUsers(updatedUsers);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
};

export const loginCustomer = (
  emailInput: string,
  passwordInput?: string,
  currentProjectToSave?: {
    modelId: HomeModelId;
    modelName: string;
    totalPrice: number;
    currency: string;
    state: CustomizationState;
  }
): { success: boolean; user?: UserAccount; error?: string } => {
  const email = emailInput.trim().toLowerCase();
  if (!email) {
    return { success: false, error: 'Please enter your email address.' };
  }

  const allUsers = getRegisteredUsers();
  let user = allUsers.find((u) => u.email.toLowerCase() === email);

  // If user doesn't exist, we can gracefully create them or check password
  if (!user) {
    // If they provided password/details, offer easy auto-registration
    const autoUser: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Modular Enthusiast',
      email,
      phone: undefined,
      password: passwordInput || 'welcome123',
      createdAt: new Date().toISOString(),
      savedProjects: [],
    };
    user = autoUser;
    saveRegisteredUsers([...allUsers, user]);
  } else if (passwordInput && user.password && user.password !== passwordInput && passwordInput !== 'password123') {
    // Optional password check (we allow demo bypass with standard password)
    return { success: false, error: 'Invalid password. Please try again.' };
  }

  // Save current project if supplied
  if (currentProjectToSave) {
    const newProj: UserSavedProject = {
      id: `proj-${Date.now()}`,
      name: `${currentProjectToSave.modelName} Custom Build`,
      modelId: currentProjectToSave.modelId,
      modelName: currentProjectToSave.modelName,
      totalPrice: currentProjectToSave.totalPrice,
      currency: currentProjectToSave.currency,
      savedAt: new Date().toISOString(),
      state: currentProjectToSave.state,
    };
    user = {
      ...user,
      savedProjects: [newProj, ...(user.savedProjects || []).filter((p) => p.modelId !== currentProjectToSave.modelId)],
    };
    saveRegisteredUsers(allUsers.map((u) => (u.id === user?.id ? user! : u)));
  }

  setCurrentUser(user);
  return { success: true, user };
};

export const logoutCustomer = (): void => {
  setCurrentUser(null);
};

export const saveProjectForCurrentUser = (project: {
  modelId: HomeModelId;
  modelName: string;
  totalPrice: number;
  currency: string;
  state: CustomizationState;
}): UserSavedProject | null => {
  const user = getCurrentUser();
  if (!user) return null;

  const newProj: UserSavedProject = {
    id: `proj-${Date.now()}`,
    name: `${project.modelName} Design`,
    modelId: project.modelId,
    modelName: project.modelName,
    totalPrice: project.totalPrice,
    currency: project.currency,
    savedAt: new Date().toISOString(),
    state: project.state,
  };

  const updatedProjects = [
    newProj,
    ...(user.savedProjects || []).filter((p) => p.modelId !== project.modelId),
  ];

  const updatedUser: UserAccount = {
    ...user,
    savedProjects: updatedProjects,
  };

  const allUsers = getRegisteredUsers();
  saveRegisteredUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  setCurrentUser(updatedUser);

  return newProj;
};

export const deleteProjectForCurrentUser = (projectId: string): boolean => {
  const user = getCurrentUser();
  if (!user || !user.savedProjects) return false;

  const updatedProjects = user.savedProjects.filter((p) => p.id !== projectId);
  const updatedUser: UserAccount = {
    ...user,
    savedProjects: updatedProjects,
  };

  const allUsers = getRegisteredUsers();
  saveRegisteredUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  setCurrentUser(updatedUser);
  return true;
};

export const renameProjectForCurrentUser = (projectId: string, newName: string): boolean => {
  const user = getCurrentUser();
  if (!user || !user.savedProjects) return false;

  const updatedProjects = user.savedProjects.map((p) =>
    p.id === projectId ? { ...p, name: newName } : p
  );
  const updatedUser: UserAccount = {
    ...user,
    savedProjects: updatedProjects,
  };

  const allUsers = getRegisteredUsers();
  saveRegisteredUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  setCurrentUser(updatedUser);
  return true;
};

export const duplicateProjectForCurrentUser = (projectId: string): UserSavedProject | null => {
  const user = getCurrentUser();
  if (!user || !user.savedProjects) return null;

  const target = user.savedProjects.find((p) => p.id === projectId);
  if (!target) return null;

  const duplicated: UserSavedProject = {
    ...target,
    id: `proj-${Date.now()}`,
    name: `${target.name} (Copy)`,
    savedAt: new Date().toISOString(),
  };

  const updatedProjects = [duplicated, ...user.savedProjects];
  const updatedUser: UserAccount = {
    ...user,
    savedProjects: updatedProjects,
  };

  const allUsers = getRegisteredUsers();
  saveRegisteredUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  setCurrentUser(updatedUser);
  return duplicated;
};

export const updateCurrentUserProfile = (data: { fullName?: string; phone?: string }): UserAccount | null => {
  const user = getCurrentUser();
  if (!user) return null;

  const updatedUser: UserAccount = {
    ...user,
    ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
    ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
  };

  const allUsers = getRegisteredUsers();
  saveRegisteredUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  setCurrentUser(updatedUser);
  return updatedUser;
};

