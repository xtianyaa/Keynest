import { useState } from "react";
import * as vaultApi from "./vaultApi";
import type { VaultEntry } from "./domain";

type VaultStatus = "locked" | "open" | "busy";

type VaultState = {
  status: VaultStatus;
  path: string;
  entries: VaultEntry[];
  error: string;
};

const initialState: VaultState = {
  status: "locked",
  path: "",
  entries: [],
  error: ""
};

export function useVault() {
  const [state, setState] = useState<VaultState>(initialState);

  async function applySnapshot(operation: () => Promise<vaultApi.VaultSnapshot>) {
    setState((current) => ({ ...current, status: "busy", error: "" }));
    try {
      const snapshot = await operation();
      setState({
        status: "open",
        path: snapshot.path,
        entries: snapshot.entries,
        error: ""
      });
      return snapshot;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState((current) => ({
        ...current,
        status: current.path ? "open" : "locked",
        error: message
      }));
      throw error;
    }
  }

  async function lock() {
    await vaultApi.lockVault();
    setState(initialState);
  }

  return {
    ...state,
    create: (path: string, masterPassword: string) =>
      applySnapshot(() => vaultApi.createVault(path, masterPassword)),
    open: (path: string, masterPassword: string) =>
      applySnapshot(() => vaultApi.openVault(path, masterPassword)),
    addEntry: (input: vaultApi.VaultEntryInput) => applySnapshot(() => vaultApi.addEntry(input)),
    updateEntry: (id: string, input: vaultApi.VaultEntryInput) =>
      applySnapshot(() => vaultApi.updateEntry(id, input)),
    addPassword: (input: vaultApi.PasswordEntryInput) =>
      applySnapshot(() => vaultApi.addPasswordEntry(input)),
    deleteEntry: (id: string) => applySnapshot(() => vaultApi.deleteEntry(id)),
    restoreEntry: (id: string) => applySnapshot(() => vaultApi.restoreEntry(id)),
    purgeEntry: (id: string) => applySnapshot(() => vaultApi.purgeEntry(id)),
    setFavorite: (id: string, favorite: boolean) =>
      applySnapshot(() => vaultApi.setFavorite(id, favorite)),
    save: () => applySnapshot(() => vaultApi.saveVault()),
    lock
  };
}
