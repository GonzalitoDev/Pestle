import { collection, addDoc, getDoc, doc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from './firebase';
import { Paste } from '../types';

const LOCAL_STORAGE_KEY = 'pestle_mock_pastes';

/**
 * Mock implementation using LocalStorage
 */
const mockDb = {
  async addPaste(paste: Omit<Paste, 'id'>): Promise<string> {
    const pastes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const id = Math.random().toString(36).substring(2, 11);
    const newPaste = { ...paste, id };
    pastes.push(newPaste);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pastes));
    return id;
  },
  async getPaste(id: string): Promise<Paste | null> {
    const pastes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return pastes.find((p: Paste) => p.id === id) || null;
  },
  async getUserPastes(userId: string): Promise<Paste[]> {
    const pastes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return pastes.filter((p: Paste) => p.userId === userId).sort((a: Paste, b: Paste) => b.createdAt - a.createdAt);
  }
};

/**
 * Real Firebase implementation
 */
const firebaseDb = {
  async addPaste(paste: Omit<Paste, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'pastes'), paste);
    return docRef.id;
  },
  async getPaste(id: string): Promise<Paste | null> {
    const docSnap = await getDoc(doc(db, 'pastes', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Paste;
    }
    return null;
  },
  async getUserPastes(userId: string): Promise<Paste[]> {
    const q = query(
      collection(db, 'pastes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paste));
  }
};

export const pasteService = IS_MOCK_MODE ? mockDb : firebaseDb;
