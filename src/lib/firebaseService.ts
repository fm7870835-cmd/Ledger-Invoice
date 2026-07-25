import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  getDoc,
  query,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Invoice, UserProfile } from '../types';
import { SAMPLE_INVOICES, INITIAL_USER_PROFILE } from '../data/initialInvoices';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// 1. Save or Update Single Invoice in Firestore
export async function saveInvoiceToFirestore(invoice: Invoice): Promise<void> {
  const path = `invoices/${invoice.id}`;
  try {
    const docRef = doc(db, 'invoices', invoice.id);
    await setDoc(docRef, { ...invoice, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`Successfully saved invoice ${invoice.id} to Firebase Firestore!`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Batch Save Multiple Invoices
export async function saveMultipleInvoicesToFirestore(invoices: Invoice[]): Promise<void> {
  for (const inv of invoices) {
    await saveInvoiceToFirestore(inv);
  }
}

// 3. Subscribe to Invoices Realtime
export function subscribeToInvoices(
  onUpdate: (invoices: Invoice[]) => void,
  onError?: (err: any) => void
) {
  const collectionRef = collection(db, 'invoices');
  return onSnapshot(
    collectionRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial sample invoices if collection is empty
        console.log('Firestore invoices collection is empty. Seeding sample invoices...');
        await saveMultipleInvoicesToFirestore(SAMPLE_INVOICES);
        onUpdate(SAMPLE_INVOICES);
      } else {
        const loadedInvoices: Invoice[] = [];
        snapshot.forEach((docSnap) => {
          loadedInvoices.push(docSnap.data() as Invoice);
        });
        onUpdate(loadedInvoices);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'invoices');
      if (onError) onError(error);
    }
  );
}

// 4. Save User Profile / Settings to Firestore
export async function saveUserProfileToFirestore(
  profile: UserProfile,
  userId?: string
): Promise<void> {
  const uid = userId || auth.currentUser?.uid || 'default_user';
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`Successfully saved user profile to Firebase Firestore (${uid})!`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. Subscribe to User Profile Realtime
export function subscribeToUserProfile(
  onUpdate: (profile: UserProfile) => void,
  userId?: string
) {
  const uid = userId || auth.currentUser?.uid || 'default_user';
  const docRef = doc(db, 'users', uid);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        // Seed initial user profile if missing
        console.log('User profile does not exist in Firestore. Creating default profile...');
        await saveUserProfileToFirestore(INITIAL_USER_PROFILE, uid);
        onUpdate(INITIAL_USER_PROFILE);
      } else {
        onUpdate(snapshot.data() as UserProfile);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  );
}
