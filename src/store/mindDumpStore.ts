/**
 * Mind dump entries stored under 'minddump:{timestamp}' keys.
 * timestamp = Date.now() at creation time.
 * The id field = String(timestamp) for easy key reconstruction.
 */
import { create } from "zustand";
import { MindDumpEntry } from "../types";
import {
  loadAllMindDumps, saveMindDump, updateMindDump, deleteMindDump,
} from "../utils/storage";

const FREE_LIMIT = 10;

interface MindDumpState {
  entries: MindDumpEntry[];
  isLoading: boolean;
  load: () => Promise<void>;
  createEntry: (content: string) => Promise<{ entry: MindDumpEntry; hitLimit: boolean }>;
  updateEntry: (id: string, content: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  canCreate: (isPremium: boolean) => boolean;
  entryCount: () => number;
}

export const useMindDumpStore = create<MindDumpState>((set, get) => ({
  entries: [],
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const entries = await loadAllMindDumps();
    set({ entries, isLoading: false });
  },

  createEntry: async (content) => {
    const ts = Date.now();
    const now = new Date().toISOString();
    const entry: MindDumpEntry = {
      id: String(ts),
      content,
      createdAt: now,
      updatedAt: now,
    };
    await saveMindDump(entry);

    const newEntries = [entry, ...get().entries];
    set({ entries: newEntries });

    // hitLimit = this new entry pushed us OVER the free limit
    const hitLimit = newEntries.length === FREE_LIMIT + 1;
    return { entry, hitLimit };
  },

  updateEntry: async (id, content) => {
    const { entries } = get();
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;

    const updated: MindDumpEntry = {
      ...existing,
      content,
      updatedAt: new Date().toISOString(),
    };
    await updateMindDump(updated);
    set({
      entries: entries.map((e) => (e.id === id ? updated : e)),
    });
  },

  deleteEntry: async (id) => {
    await deleteMindDump(id);
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  canCreate: (isPremium) => {
    const { entries } = get();
    return isPremium || entries.length < FREE_LIMIT;
  },

  entryCount: () => get().entries.length,
}));
