import { db } from "./config.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const addDocument = async (collectionName, data) => {
  const collectionRef = collection(db, collectionName);
  return await addDoc(collectionRef, data);
};

export const getDocuments = async (collectionName) => {
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const queryDocuments = async (collectionName, field, operator, value) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};