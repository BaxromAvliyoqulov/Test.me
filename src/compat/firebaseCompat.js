// src/compat/firebaseCompat.js
// Zero-dependency Supabase bridge replacing the 1.2MB Firebase SDK bundle.
import { supabase } from '@/config/supabase';

// Helper: map Firestore collection names to Supabase tables
function mapCollectionName(pathSegments) {
  if (Array.isArray(pathSegments)) {
    if (pathSegments.length === 1) {
      const col = pathSegments[0];
      if (col === 'users') return { table: 'profiles' };
      if (col === 'subjects') return { table: 'subjects' };
      if (col === 'notifications') return { table: 'notifications' };
      if (col === 'friend_requests') return { table: 'friend_requests' };
      if (col === 'duels') return { table: 'duels' };
      if (col === 'chats') return { table: 'chats' };
      if (col === 'shop_items') return { table: 'shop_items' };
      return { table: col };
    }
    // Subcollections like 'subjects', subjectId, 'levels', levelId, 'tests'
    if (pathSegments[0] === 'subjects' && pathSegments.includes('tests')) {
      const subjectId = pathSegments[1];
      const levelId = pathSegments[3];
      return { 
        table: 'tests', 
        filter: { subject_id: subjectId, level_id: levelId } 
      };
    }
    // 'users', userId, 'friends'
    if (pathSegments[0] === 'users' && pathSegments[2] === 'friends') {
      return { table: 'friends', filter: { user_id: pathSegments[1] } };
    }
    return { table: pathSegments[pathSegments.length - 1] };
  }
  return { table: String(pathSegments) };
}

export class CollectionReference {
  constructor(pathSegments) {
    this.pathSegments = pathSegments;
    const { table, filter } = mapCollectionName(pathSegments);
    this.table = table;
    this.defaultFilter = filter || {};
    this.constraints = [];
  }
}

export class DocumentReference {
  constructor(pathSegments) {
    this.pathSegments = pathSegments;
    this.id = pathSegments[pathSegments.length - 1];
    const collSegments = pathSegments.slice(0, -1);
    const { table, filter } = mapCollectionName(collSegments.length ? collSegments : [pathSegments[0]]);
    this.table = table;
    this.defaultFilter = filter || {};
  }
}

export class QueryReference {
  constructor(collectionRef, constraints = []) {
    this.collectionRef = collectionRef;
    this.table = collectionRef.table;
    this.defaultFilter = collectionRef.defaultFilter || {};
    this.constraints = constraints;
  }
}

export const collection = (dbInstance, ...paths) => {
  const segments = [];
  paths.forEach(p => {
    if (typeof p === 'string') segments.push(...p.split('/').filter(Boolean));
    else if (p && p.pathSegments) segments.push(...p.pathSegments);
  });
  return new CollectionReference(segments);
};

export const doc = (dbOrColl, ...paths) => {
  const segments = [];
  if (dbOrColl && dbOrColl.pathSegments) {
    segments.push(...dbOrColl.pathSegments);
  }
  paths.forEach(p => {
    if (typeof p === 'string') segments.push(...p.split('/').filter(Boolean));
  });
  if (segments.length === 0) {
    segments.push(Math.random().toString(36).substring(2, 12));
  }
  return new DocumentReference(segments);
};

export const query = (collectionRef, ...constraints) => {
  return new QueryReference(collectionRef, constraints);
};

export const where = (field, op, value) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field, direction = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const limit = (num) => {
  return { type: 'limit', value: num };
};

export const serverTimestamp = () => new Date().toISOString();

export const increment = (val) => val;

export const getDoc = async (docRef) => {
  try {
    const { data, error } = await supabase
      .from(docRef.table)
      .select('*')
      .eq('id', docRef.id)
      .maybeSingle();

    if (error || !data) {
      return {
        exists: () => false,
        data: () => ({}),
        id: docRef.id
      };
    }
    return {
      exists: () => true,
      data: () => data,
      id: docRef.id,
      ...data
    };
  } catch (e) {
    return { exists: () => false, data: () => ({}), id: docRef.id };
  }
};

export const getDocs = async (queryOrColl) => {
  try {
    const table = queryOrColl.table;
    let req = supabase.from(table).select('*');

    // Apply default filters
    if (queryOrColl.defaultFilter) {
      for (const [k, v] of Object.entries(queryOrColl.defaultFilter)) {
        req = req.eq(k, v);
      }
    }

    // Apply query constraints
    const constraints = queryOrColl.constraints || [];
    for (const c of constraints) {
      if (c.type === 'where') {
        if (c.op === '==' || c.op === 'eq') req = req.eq(c.field, c.value);
        else if (c.op === '!=') req = req.neq(c.field, c.value);
        else if (c.op === '>') req = req.gt(c.field, c.value);
        else if (c.op === '>=') req = req.gte(c.field, c.value);
        else if (c.op === '<') req = req.lt(c.field, c.value);
        else if (c.op === '<=') req = req.lte(c.field, c.value);
      } else if (c.type === 'orderBy') {
        req = req.order(c.field, { ascending: c.direction !== 'desc' });
      } else if (c.type === 'limit') {
        req = req.limit(c.value);
      }
    }

    const { data, error } = await req;
    if (error) {
      console.warn(`getDocs [${table}] note:`, error.message);
      return { docs: [], empty: true, size: 0, forEach: () => {} };
    }

    const docs = (data || []).map(row => ({
      id: row.id || row.uid || '',
      exists: () => true,
      data: () => row,
      ...row
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (cb) => docs.forEach(cb)
    };
  } catch (err) {
    console.warn(`getDocs error:`, err);
    return { docs: [], empty: true, size: 0, forEach: () => {} };
  }
};

export const addDoc = async (collRef, data) => {
  const payload = { ...collRef.defaultFilter, ...data };
  const { data: inserted, error } = await supabase
    .from(collRef.table)
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    console.warn(`addDoc [${collRef.table}] error:`, error.message);
    return { id: Math.random().toString(36).substring(2, 10) };
  }
  return { id: inserted?.id };
};

export const setDoc = async (docRef, data, options = {}) => {
  const payload = { id: docRef.id, ...docRef.defaultFilter, ...data };
  const { error } = await supabase
    .from(docRef.table)
    .upsert(payload);
  if (error) console.warn(`setDoc [${docRef.table}] note:`, error.message);
  return true;
};

export const updateDoc = async (docRef, data) => {
  const { error } = await supabase
    .from(docRef.table)
    .update(data)
    .eq('id', docRef.id);
  if (error) console.warn(`updateDoc [${docRef.table}] note:`, error.message);
  return true;
};

export const deleteDoc = async (docRef) => {
  const { error } = await supabase
    .from(docRef.table)
    .delete()
    .eq('id', docRef.id);
  if (error) console.warn(`deleteDoc [${docRef.table}] note:`, error.message);
  return true;
};

export const getCountFromServer = async (queryOrColl) => {
  try {
    let req = supabase.from(queryOrColl.table).select('*', { count: 'exact', head: true });
    if (queryOrColl.defaultFilter) {
      for (const [k, v] of Object.entries(queryOrColl.defaultFilter)) {
        req = req.eq(k, v);
      }
    }
    const { count, error } = await req;
    return {
      data: () => ({ count: count || 0 })
    };
  } catch {
    return { data: () => ({ count: 0 }) };
  }
};

export const writeBatch = (dbInstance) => {
  const operations = [];
  return {
    set(docRef, data) {
      operations.push({ type: 'upsert', table: docRef.table, data: { id: docRef.id, ...docRef.defaultFilter, ...data } });
    },
    update(docRef, data) {
      operations.push({ type: 'update', table: docRef.table, id: docRef.id, data });
    },
    delete(docRef) {
      operations.push({ type: 'delete', table: docRef.table, id: docRef.id });
    },
    async commit() {
      // Group upserts by table for bulk insert
      const byTable = {};
      operations.forEach(op => {
        if (op.type === 'upsert') {
          if (!byTable[op.table]) byTable[op.table] = [];
          byTable[op.table].push(op.data);
        }
      });
      for (const [table, rows] of Object.entries(byTable)) {
        try {
          await supabase.from(table).upsert(rows);
        } catch (e) {
          console.warn(`Batch upsert [${table}] note:`, e);
        }
      }
      return true;
    }
  };
};

export const onSnapshot = (queryOrRef, onNext, onError) => {
  // Initial immediate fetch
  if (queryOrRef instanceof DocumentReference) {
    getDoc(queryOrRef).then(snap => onNext && onNext(snap)).catch(onError);
  } else {
    getDocs(queryOrRef).then(snap => onNext && onNext(snap)).catch(onError);
  }
  // Return dummy unsubscribe function
  return () => {};
};

// Auth Shim
export const getAuth = () => {
  return {
    get currentUser() {
      const user = supabase.auth.getUser ? null : null;
      return null;
    },
    onAuthStateChanged(callback) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const u = session?.user;
        if (u) {
          callback({
            uid: u.id,
            id: u.id,
            email: u.email,
            displayName: u.user_metadata?.full_name || u.email?.split('@')[0]
          });
        } else {
          callback(null);
        }
      });
      // Trigger initial check
      supabase.auth.getSession().then(({ data: { session } }) => {
        const u = session?.user;
        if (u) {
          callback({
            uid: u.id,
            id: u.id,
            email: u.email,
            displayName: u.user_metadata?.full_name || u.email?.split('@')[0]
          });
        } else {
          callback(null);
        }
      });
      return () => subscription?.unsubscribe();
    },
    signOut() {
      return supabase.auth.signOut();
    }
  };
};

export const sendPasswordResetEmail = async (authInstance, email) => {
  return supabase.auth.resetPasswordForEmail(email);
};

// App Shim
export const initializeApp = () => ({ name: '[DEFAULT]' });
export const getAnalytics = () => ({});
export const getFirestore = () => ({});
export const enableIndexedDbPersistence = async () => true;
export const getStorage = () => ({});
export const getFunctions = () => ({});
export const getMessaging = () => ({});
export const isSupported = async () => false;

export const db = {};
export const auth = getAuth();
export const storage = {};
export const functions = {};
export const messaging = null;

export default {
  db,
  auth,
  storage,
  functions,
  messaging,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  writeBatch,
  onSnapshot,
  getAuth,
  sendPasswordResetEmail,
  initializeApp,
  getAnalytics,
  getFirestore,
  enableIndexedDbPersistence,
  getStorage,
  getFunctions,
  getMessaging,
  isSupported
};
