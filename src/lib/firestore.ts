import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timbratura } from "@/types/timbratura";

function timbraturaPath(uid: string, data: string) {
  return doc(db, "users", uid, "timbrature", data);
}

export async function getTimbrattureMese(
  uid: string,
  anno: number,
  mese: number
): Promise<Record<string, Timbratura>> {
  const inizio = `${anno}-${String(mese).padStart(2, "0")}-01`;
  const fine   = `${anno}-${String(mese).padStart(2, "0")}-31`;

  const q = query(
    collection(db, "users", uid, "timbrature"),
    where("__name__", ">=", inizio),
    where("__name__", "<=", fine),
    orderBy("__name__", "asc")
  );

  const snap = await getDocs(q);
  const result: Record<string, Timbratura> = {};
  snap.forEach((d) => { result[d.id] = d.data() as Timbratura; });
  return result;
}

export async function getTutteLeTimbrature(
  uid: string
): Promise<Record<string, Timbratura>> {
  const q = query(
    collection(db, "users", uid, "timbrature"),
    orderBy("__name__", "asc")
  );
  const snap = await getDocs(q);
  const result: Record<string, Timbratura> = {};
  snap.forEach((d) => { result[d.id] = d.data() as Timbratura; });
  return result;
}

export async function getTimbratura(uid: string, data: string): Promise<Timbratura | null> {
  const snap = await getDoc(timbraturaPath(uid, data));
  return snap.exists() ? (snap.data() as Timbratura) : null;
}

export async function setTimbratura(uid: string, data: string, t: Timbratura): Promise<void> {
  await setDoc(timbraturaPath(uid, data), t);
}

export async function deleteTimbratura(uid: string, data: string): Promise<void> {
  await deleteDoc(timbraturaPath(uid, data));
}
