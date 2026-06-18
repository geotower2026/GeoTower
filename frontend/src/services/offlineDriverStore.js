const DB_NAME = 'geo-driver-offline';
const DB_VERSION = 1;
const PROGRAMACOES_KEY = 'assigned';

const STORE_PROGRAMACOES = 'programacoes';
const STORE_DELIVERIES = 'deliveries';
const STORE_QUEUE = 'queue';

const openDb = () => new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('IndexedDB indisponivel neste dispositivo'));
    return;
  }

  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_PROGRAMACOES)) {
      db.createObjectStore(STORE_PROGRAMACOES, { keyPath: 'key' });
    }
    if (!db.objectStoreNames.contains(STORE_DELIVERIES)) {
      db.createObjectStore(STORE_DELIVERIES, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_QUEUE)) {
      const queue = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
      queue.createIndex('createdAt', 'createdAt');
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const txStore = async (storeName, mode = 'readonly') => {
  const db = await openDb();
  const tx = db.transaction(storeName, mode);
  return { db, tx, store: tx.objectStore(storeName) };
};

const requestToPromise = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const completeTx = (tx) => new Promise((resolve, reject) => {
  tx.oncomplete = resolve;
  tx.onerror = () => reject(tx.error);
  tx.onabort = () => reject(tx.error);
});

const safeRun = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (err) {
    console.warn('[offlineDriverStore]', err);
    return fallback;
  }
};

const normalizeKey = (value) => String(value || '').trim().toUpperCase();

export const offlineDriverStore = {
  cacheProgramacoes: (programacoes) => safeRun(async () => {
    const { db, tx, store } = await txStore(STORE_PROGRAMACOES, 'readwrite');
    store.put({
      key: PROGRAMACOES_KEY,
      programacoes,
      cachedAt: new Date().toISOString()
    });
    await completeTx(tx);
    db.close();
  }),

  getCachedProgramacoes: () => safeRun(async () => {
    const { db, store } = await txStore(STORE_PROGRAMACOES);
    const result = await requestToPromise(store.get(PROGRAMACOES_KEY));
    db.close();
    return result || null;
  }),

  cacheDelivery: (delivery) => safeRun(async () => {
    if (!delivery?._id) return;
    const { db, tx, store } = await txStore(STORE_DELIVERIES, 'readwrite');
    store.put({
      id: String(delivery._id),
      delivery,
      cachedAt: new Date().toISOString()
    });
    if (delivery.deliveryNumber) {
      store.put({
        id: `number:${normalizeKey(delivery.deliveryNumber)}`,
        delivery,
        cachedAt: new Date().toISOString()
      });
    }
    if (delivery.programacaoId) {
      store.put({
        id: `programacao:${String(delivery.programacaoId)}`,
        delivery,
        cachedAt: new Date().toISOString()
      });
    }
    if (delivery.linkedProgramacaoId) {
      store.put({
        id: `programacao:${String(delivery.linkedProgramacaoId)}`,
        delivery,
        cachedAt: new Date().toISOString()
      });
    }
    await completeTx(tx);
    db.close();
  }),

  getCachedDelivery: (id) => safeRun(async () => {
    if (!id) return null;
    const { db, store } = await txStore(STORE_DELIVERIES);
    const result = await requestToPromise(store.get(String(id)));
    db.close();
    return result?.delivery || null;
  }),

  getCachedDeliveryByNumber: (deliveryNumber) => safeRun(async () => {
    const key = normalizeKey(deliveryNumber);
    if (!key) return null;
    const { db, store } = await txStore(STORE_DELIVERIES);
    const result = await requestToPromise(store.get(`number:${key}`));
    db.close();
    return result?.delivery || null;
  }),

  getCachedDeliveryByProgramacao: (programacaoId) => safeRun(async () => {
    if (!programacaoId) return null;
    const { db, store } = await txStore(STORE_DELIVERIES);
    const result = await requestToPromise(store.get(`programacao:${String(programacaoId)}`));
    db.close();
    return result?.delivery || null;
  }),

  updateCachedProgramacao: (programacaoId, updates) => safeRun(async () => {
    if (!programacaoId) return;
    const { db, tx, store } = await txStore(STORE_PROGRAMACOES, 'readwrite');
    const result = await requestToPromise(store.get(PROGRAMACOES_KEY));
    if (result?.programacoes) {
      result.programacoes = result.programacoes.map((item) =>
        String(item._id) === String(programacaoId) ? { ...item, ...updates } : item
      );
      result.cachedAt = new Date().toISOString();
      store.put(result);
    }
    await completeTx(tx);
    db.close();
  }),

  queueAction: (action) => safeRun(async () => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const { db, tx, store } = await txStore(STORE_QUEUE, 'readwrite');
    store.put({
      id,
      createdAt: new Date().toISOString(),
      attempts: 0,
      ...action
    });
    await completeTx(tx);
    db.close();
    window.dispatchEvent(new Event('driver-offline-queue:changed'));
    return id;
  }),

  getQueue: () => safeRun(async () => {
    const { db, store } = await txStore(STORE_QUEUE);
    const result = await requestToPromise(store.getAll());
    db.close();
    return (result || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, []),

  removeAction: (id) => safeRun(async () => {
    const { db, tx, store } = await txStore(STORE_QUEUE, 'readwrite');
    store.delete(id);
    await completeTx(tx);
    db.close();
    window.dispatchEvent(new Event('driver-offline-queue:changed'));
  }),

  countQueue: () => safeRun(async () => {
    const { db, store } = await txStore(STORE_QUEUE);
    const count = await requestToPromise(store.count());
    db.close();
    return count || 0;
  }, 0),

  syncQueue: async (deliveryService) => {
    const queue = await offlineDriverStore.getQueue();
    let synced = 0;

    for (const action of queue) {
      let deliveryId = action.deliveryId;
      if (String(deliveryId || '').startsWith('offline:')) {
        throw new Error('Entrega offline sem ID do servidor. Abra/inicie a entrega com internet antes de trabalhar offline.');
      }

      if (action.type === 'uploadAndUpdate') {
        await deliveryService.uploadDocumentAndUpdate(
          deliveryId,
          action.documentType,
          action.files || [],
          action.statusUpdate || {}
        );
      } else if (action.type === 'updateDelivery') {
        await deliveryService.updateDelivery(deliveryId, action.data || {});
      } else if (action.type === 'submitDelivery') {
        await deliveryService.submitDelivery(deliveryId, action.data || {});
      }

      await offlineDriverStore.removeAction(action.id);
      synced += 1;
    }

    return synced;
  }
};

export const isNetworkError = (err) => {
  if (!navigator.onLine) return true;
  if (!err) return false;
  return !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
};
