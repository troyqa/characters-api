import admin from 'firebase-admin';
import { db } from '../firebase';

export const getAll = async () => {
  const snapshot = await db.collection('characters').get();

  return snapshot.docs.map((doc) => doc);
};

export const getById = async (id: string) => {
  const ref = db.collection('characters').doc(id);
  const snap = await ref.get();

  if (!snap.exists) return null;

  return snap;
};

interface ICharacterInput {
  name: string;
  description: string;
  skills: string[];
  avatarUrl?: string;
}

export const create = async (body: ICharacterInput) => {
  const {
    name, description, skills, avatarUrl,
  } = body;

  if (!name || !description || !skills) {
    throw {
      status: 400, message: 'Missing required fields',
    };
  }

  if (!Array.isArray(skills)) {
    throw {
      status: 400, message: 'Skills must be an array',
    };
  }

  const docRef = await db.collection('characters').add({
    name,
    description,
    skills,
    avatarUrl,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const snap = await docRef.get();

  return snap;
};

export const update = async (id: string, body: Partial<ICharacterInput>) => {
  const ref = db.collection('characters').doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    throw {
      status: 404, message: 'Character not found',
    };
  }

  const forbidden = ['id', 'createdAt'];

  for (const field of Object.keys(body)) {
    if (forbidden.includes(field)) {
      throw {
        status: 400, message: `Field "${field}" cannot be updated`,
      };
    }
  }

  await ref.update({
    ...body,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedSnap = await ref.get();

  return updatedSnap;
};

export const remove = async (id: string) => {
  const ref = db.collection('characters').doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    throw {
      status: 404, message: 'Character not found',
    };
  }

  const data = snap.data();

  await ref.delete();

  return {
    id, deleted: true, ...data,
  };
};
