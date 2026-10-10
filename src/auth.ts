import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google OAuth Provider
const provider = new GoogleAuthProvider();

// Request full Drive, Sheets, and Gmail scopes requested by Noemi
provider.addScope("https://www.googleapis.com/auth/drive");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/drive.readonly");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/spreadsheets.readonly");
provider.addScope("https://www.googleapis.com/auth/gmail.modify");

// MASTER_ADMIN_EMAIL: The primary owner who can manage permissions
import { AuthorizedUser, UserRole } from "./types";

export const MASTER_ADMIN_EMAIL = "noemicarvallo1972@gmail.com";

// Local storage backup for whitelisted emails to prevent any firestore-blocked access crashes
const LOCAL_STORAGE_WHITELIST_KEY = "martin_sistema_authorized_emails_fallback";
const LOCAL_STORAGE_USERS_KEY = "martin_sistema_authorized_users_fallback";

const getLocalFallbackWhitelist = (): string[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_WHITELIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalFallbackWhitelist = (list: string[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_WHITELIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

const getLocalFallbackUsers = (): AuthorizedUser[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalFallbackUsers = (list: AuthorizedUser[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

// Fetch authorized users from memory/localStorage
export const getWhitelistedUsers = async (): Promise<AuthorizedUser[]> => {
  let locals = getLocalFallbackUsers();
  let modified = false;

  if (locals.length === 0) {
    const defaultUsers: AuthorizedUser[] = [
      {
        email: MASTER_ADMIN_EMAIL,
        role: "owner",
        name: "Noemí Carvallo",
        customCode: "DUEÑO2026",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      },
      {
        email: "martin.analista@gmail.com",
        role: "analista",
        name: "Martín Analista",
        customCode: "MARTIN2026",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      },
      {
        email: "martin.desarrollador@gmail.com",
        role: "desarrollador",
        name: "Martín Desarrollador",
        customCode: "MARTINDEVS",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      },
      {
        email: "martin.auditor@gmail.com",
        role: "auditor",
        name: "Martín Auditor",
        customCode: "MARTINAUDIT",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      }
    ];
    saveLocalFallbackUsers(defaultUsers);
    saveLocalFallbackWhitelist(defaultUsers.map(u => u.email));
    return defaultUsers;
  } else {
    // Check if Martin roles are missing and inject them to support Noemi's requested testing environment
    const hasAnalyst = locals.some(u => u.email.toLowerCase().trim() === "martin.analista@gmail.com");
    const hasDev = locals.some(u => u.email.toLowerCase().trim() === "martin.desarrollador@gmail.com");
    const hasAudit = locals.some(u => u.email.toLowerCase().trim() === "martin.auditor@gmail.com");
    
    // Also, if the existing analyst has supervisor role, upgrade it to "analista"
    locals = locals.map(u => {
      if (u.email.toLowerCase().trim() === "martin.analista@gmail.com" && u.role !== "analista") {
        modified = true;
        return { ...u, role: "analista" };
      }
      return u;
    });

    if (!hasAnalyst) {
      locals.push({
        email: "martin.analista@gmail.com",
        role: "analista",
        name: "Martín Analista",
        customCode: "MARTIN2026",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      });
      modified = true;
    }
    if (!hasDev) {
      locals.push({
        email: "martin.desarrollador@gmail.com",
        role: "desarrollador",
        name: "Martín Desarrollador",
        customCode: "MARTINDEVS",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      });
      modified = true;
    }
    if (!hasAudit) {
      locals.push({
        email: "martin.auditor@gmail.com",
        role: "auditor",
        name: "Martín Auditor",
        customCode: "MARTINAUDIT",
        addedAt: new Date().toISOString(),
        authorizedBy: MASTER_ADMIN_EMAIL
      });
      modified = true;
    }
  }

  if (modified) {
    saveLocalFallbackUsers(locals);
    saveLocalFallbackWhitelist(locals.map(u => u.email));
  }

  return locals;
};

// Fetch authorized emails from memory/localStorage
export const getWhitelistedEmails = async (): Promise<string[]> => {
  const users = await getWhitelistedUsers();
  return users.map(u => u.email);
};

// Add or update authorized user
export const addOrUpdateWhitelistedUser = async (userObj: AuthorizedUser): Promise<boolean> => {
  const cleanEmail = userObj.email.toLowerCase().trim();
  if (!cleanEmail) return false;
  
  const current = getLocalFallbackUsers();
  const filtered = current.filter(u => u.email.toLowerCase().trim() !== cleanEmail);
  const updatedUsersList = [...filtered, { 
    ...userObj, 
    email: cleanEmail,
    addedAt: userObj.addedAt || new Date().toISOString(),
    authorizedBy: auth.currentUser?.email || MASTER_ADMIN_EMAIL
  }];
  saveLocalFallbackUsers(updatedUsersList);
  saveLocalFallbackWhitelist(updatedUsersList.map(u => u.email));
  return true;
};

// Add authorized email (Legacy wrapper for backwards-compatibility)
export const addWhitelistedEmail = async (email: string): Promise<boolean> => {
  const cleanEmail = email.toLowerCase().trim();
  return addOrUpdateWhitelistedUser({
    email: cleanEmail,
    role: "owner",
    name: cleanEmail.split("@")[0],
    customCode: ""
  });
};

// Remove authorized user
export const removeWhitelistedUser = async (email: string): Promise<boolean> => {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return false;
  
  const current = getLocalFallbackUsers();
  const updatedUsersList = current.filter(u => u.email.toLowerCase().trim() !== cleanEmail);
  saveLocalFallbackUsers(updatedUsersList);
  saveLocalFallbackWhitelist(updatedUsersList.map(u => u.email));
  return true;
};

// Remove authorized email (Legacy wrapper)
export const removeWhitelistedEmail = async (email: string): Promise<boolean> => {
  return removeWhitelistedUser(email);
};


// Helper check
export const isUserAuthorized = async (email: string | null | undefined): Promise<boolean> => {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  
  // The primary administrator is ALWAYS authorized
  if (cleanEmail === MASTER_ADMIN_EMAIL) return true;
  
  const whitelist = await getWhitelistedEmails();
  return whitelist.includes(cleanEmail);
};

// In-memory token cache (never persisted in local/sessionStorage as per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we have a user but no cached token, they need to sign in again to obtain a fresh token
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in via Popup (returns user and access token)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) {
    console.warn("⚠️ Ya hay un proceso de inicio de sesión de Google en curso.");
    return null;
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("No se pudo obtener el Token de Acceso desde Firebase Auth");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === "auth/popup-blocked") {
      console.warn("⚠️ Ventana emergente bloqueada por el navegador o iframe (auth/popup-blocked).");
      return null;
    }
    if (error?.code === "auth/cancelled-popup-request") {
      console.warn("⚠️ Solicitud de inicio de sesión cancelada por superposición (auth/cancelled-popup-request).");
      return null;
    }
    console.error("Error de autenticación Google:", error);
    return null;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
