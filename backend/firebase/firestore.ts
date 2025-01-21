import { db } from "./config";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const addDocument = async (collectionName: string, data: any) => {
  const collectionRef = collection(db, collectionName);
  return await addDoc(collectionRef, data);
};

export const getDocuments = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const queryDocuments = async (
  collectionName: string,
  field: string,
  operator: any,
  value: any
) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};