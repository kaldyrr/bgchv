import { create } from 'zustand';
import { nanoid } from 'nanoid';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Contact, Company, Deal } from './types';

export type CRMState = {
  ready: boolean;
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  addContact: (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  addCompany: (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  removeDeal: (id: string) => void;
};

type Collections = {
  contacts: Y.Map<Y.Map<any>>;
  companies: Y.Map<Y.Map<any>>;
  deals: Y.Map<Y.Map<any>>;
};

const ensureCollections = (doc: Y.Doc): Collections => {
  const root = doc.getMap('crm');
  const getOr = (key: string) => {
    let val = root.get(key) as Y.Map<Y.Map<any>> | undefined;
    if (!val) {
      val = new Y.Map();
      root.set(key, val);
    }
    return val;
  };
  return {
    contacts: getOr('contacts'),
    companies: getOr('companies'),
    deals: getOr('deals')
  };
};

const ymapToList = <T>(m: Y.Map<Y.Map<any>>): T[] => {
  return Array.from(m.entries()).map(([id, y]) => ({ id, ...(Object.fromEntries(y.entries()) as any) }));
};

export const createCRMStore = (opts?: { room?: string; wsUrl?: string; persist?: boolean }) => {
  const doc = new Y.Doc();
  const room = opts?.room || 'crm';
  const wsUrl = opts?.wsUrl || (typeof window !== 'undefined' ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/yjs` : 'ws://localhost:3000/yjs');
  const provider = new WebsocketProvider(wsUrl, room, doc);

  let idb: any | undefined;
  if (opts?.persist !== false && typeof window !== 'undefined') {
    idb = new IndexeddbPersistence(room, doc);
  }

  const collections = ensureCollections(doc);

  const useStore = create<CRMState>((set, get) => ({
    ready: false,
    contacts: [],
    companies: [],
    deals: [],
    addContact: (c) => {
      const id = nanoid();
      doc.transact(() => {
        const y = new Y.Map<any>();
        const now = Date.now();
        y.set('createdAt', now);
        y.set('updatedAt', now);
        y.set('firstName', c.firstName);
        y.set('lastName', c.lastName);
        if (c.email) y.set('email', c.email);
        if (c.phone) y.set('phone', c.phone);
        if (c.companyId) y.set('companyId', c.companyId);
        collections.contacts.set(id, y);
      });
      return id;
    },
    updateContact: (id, patch) => {
      doc.transact(() => {
        const y = collections.contacts.get(id);
        if (!y) return;
        Object.entries(patch).forEach(([k, v]) => y.set(k, v));
        y.set('updatedAt', Date.now());
      });
    },
    removeContact: (id) => {
      doc.transact(() => collections.contacts.delete(id));
    },
    addCompany: (c) => {
      const id = nanoid();
      doc.transact(() => {
        const y = new Y.Map<any>();
        const now = Date.now();
        y.set('createdAt', now);
        y.set('updatedAt', now);
        y.set('name', c.name);
        collections.companies.set(id, y);
      });
      return id;
    },
    updateCompany: (id, patch) => {
      doc.transact(() => {
        const y = collections.companies.get(id);
        if (!y) return;
        Object.entries(patch).forEach(([k, v]) => y.set(k, v));
        y.set('updatedAt', Date.now());
      });
    },
    removeCompany: (id) => doc.transact(() => collections.companies.delete(id)),
    addDeal: (d) => {
      const id = nanoid();
      doc.transact(() => {
        const y = new Y.Map<any>();
        const now = Date.now();
        y.set('createdAt', now);
        y.set('updatedAt', now);
        y.set('title', d.title);
        y.set('value', d.value ?? 0);
        y.set('status', d.status ?? 'open');
        if (d.companyId) y.set('companyId', d.companyId);
        if (d.contactId) y.set('contactId', d.contactId);
        collections.deals.set(id, y);
      });
      return id;
    },
    updateDeal: (id, patch) => {
      doc.transact(() => {
        const y = collections.deals.get(id);
        if (!y) return;
        Object.entries(patch).forEach(([k, v]) => y.set(k, v));
        y.set('updatedAt', Date.now());
      });
    },
    removeDeal: (id) => doc.transact(() => collections.deals.delete(id))
  }));

  const refresh = () => {
    useStore.setState({
      contacts: ymapToList<Contact>(collections.contacts),
      companies: ymapToList<Company>(collections.companies),
      deals: ymapToList<Deal>(collections.deals)
    });
  };

  const setReady = () => useStore.setState({ ready: true });

  // Listen to Yjs updates and refresh derived Zustand state
  doc.on('update', () => refresh());
  provider.on('status', (e: any) => {
    // status: { status: 'connected' | 'disconnected' }
    if (e.status === 'connected') setReady();
  });

  // initialize
  refresh();

  return { useStore, doc, provider };
};
