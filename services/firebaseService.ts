
import { 
  collection, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  setDoc
} from "firebase/firestore";
import { db_fs } from "./firebaseConfig";
import { Project, ProjectStatus, PaymentStatus } from "../types";

const PROJECTS_COLLECTION = "projects";
const SETTINGS_COLLECTION = "settings";

export interface PortfolioSettings {
  netlifyToken: string;
  hiddenSiteIds: string[];
}

const mapProject = (id: string, data: any): Project => ({
  id,
  userId: data.userId || '',
  userEmail: data.userEmail || '',
  userName: data.userName || '',
  contactEmail: data.contactEmail || data.userEmail || '',
  title: data.title || 'Untitled Project',
  description: data.description || '',
  budget: data.budget || 0,
  status: (data.status as ProjectStatus) || ProjectStatus.PENDING,
  paymentStatus: (data.paymentStatus as PaymentStatus) || PaymentStatus.UNPAID,
  createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
  techStack: data.techStack || [],
  paymentMethod: data.paymentMethod,
  senderName: data.senderName,
  transactionId: data.transactionId,
  isFreeTrial: data.isFreeTrial
});

export const db = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const q = query(collection(db_fs, PROJECTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => mapProject(d.id, d.data())).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      console.error("Firestore error in getProjects:", error);
      throw error;
    }
  },

  getUserProjects: async (userId: string): Promise<Project[]> => {
    try {
      const q = query(collection(db_fs, PROJECTS_COLLECTION), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => mapProject(d.id, d.data())).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      console.error("Firestore error in getUserProjects:", error);
      throw error;
    }
  },

  getProjectById: async (projectId: string): Promise<Project | null> => {
    try {
      const docRef = doc(db_fs, PROJECTS_COLLECTION, projectId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? mapProject(docSnap.id, docSnap.data()) : null;
    } catch (error: any) {
      console.error("Firestore error in getProjectById:", error);
      throw error;
    }
  },

  createProject: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    try {
      const docRef = await addDoc(collection(db_fs, PROJECTS_COLLECTION), {
        ...project,
        createdAt: serverTimestamp()
      });
      return { ...project, id: docRef.id, createdAt: new Date().toISOString() };
    } catch (error: any) {
      console.error("Firestore error in createProject:", error);
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      const docRef = doc(db_fs, PROJECTS_COLLECTION, id);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      console.error("Firestore error in updateProject:", error);
      throw error;
    }
  },

  updateProjectStatus: async (id: string, status: ProjectStatus, paymentStatus?: PaymentStatus) => {
    try {
      const docRef = doc(db_fs, PROJECTS_COLLECTION, id);
      const updates: any = { status };
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      await updateDoc(docRef, updates);
    } catch (error: any) {
      console.error("Firestore error in updateProjectStatus:", error);
      throw error;
    }
  },

  // Portfolio Settings Methods
  getPortfolioSettings: async (): Promise<PortfolioSettings> => {
    try {
      const docRef = doc(db_fs, SETTINGS_COLLECTION, "portfolio");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as PortfolioSettings;
      }
      return { netlifyToken: '', hiddenSiteIds: [] };
    } catch (error: any) {
      // Silence permission errors for public users on landing page
      if (error.code === 'permission-denied') {
        console.warn("Firestore permissions blocked settings read. Returning defaults.");
        return { netlifyToken: '', hiddenSiteIds: [] };
      }
      console.error("Error fetching portfolio settings:", error);
      throw error;
    }
  },

  savePortfolioSettings: async (settings: PortfolioSettings) => {
    try {
      const docRef = doc(db_fs, SETTINGS_COLLECTION, "portfolio");
      await setDoc(docRef, settings);
    } catch (error: any) {
      console.error("Error saving portfolio settings:", error);
      throw error;
    }
  }
};
