import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Helper function to handle errors
const handleError = (error) => {
  console.error('Firebase Error:', error);
  throw new Error(error.message || 'An error occurred');
};

// Orders API
export const ordersApi = {
  create: async (orderData) => {
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      return { id: orderRef.id, ...orderData };
    } catch (error) {
      handleError(error);
    }
  },

  getAll: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Order not found');
    } catch (error) {
      handleError(error);
    }
  }
};

// Tables API
export const tablesApi = {
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tables'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const tableRef = doc(db, 'tables', id);
      await updateDoc(tableRef, data);
      return { id, ...data };
    } catch (error) {
      handleError(error);
    }
  }
};

// Menu Items API
export const menuItemsApi = {
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'menuItems', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Menu item not found');
    } catch (error) {
      handleError(error);
    }
  }
};

// Export a default object with all APIs
const api = {
  orders: ordersApi,
  tables: tablesApi,
  menuItems: menuItemsApi
};

export default api;
