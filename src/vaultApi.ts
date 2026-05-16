import { invoke } from "@tauri-apps/api/core";
import type { EntryType, VaultEntry } from "./domain";

export type VaultEntryInput = {
  type: EntryType;
  title: string;
  website: string;
  username: string;
  password: string;
  provider: string;
  secret: string;
  envVar: string;
  project: string;
  expiresAt: string;
  body: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  notes: string;
};

export type PasswordEntryInput = Pick<
  VaultEntryInput,
  "title" | "website" | "username" | "password" | "notes"
>;

export type VaultSnapshot = {
  path: string;
  entries: VaultEntry[];
};

type TauriWindow = Window & {
  __TAURI_INTERNALS__?: unknown;
};

let fallbackPath = "";
let fallbackEntries: VaultEntry[] = [];

function hasTauriRuntime() {
  return typeof window !== "undefined" && Boolean((window as TauriWindow).__TAURI_INTERNALS__);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function subtitleFor(input: VaultEntryInput) {
  if (input.type === "password") return input.username.trim();
  if (input.type === "api-key") return input.envVar.trim();
  if (input.type === "identity") return input.email.trim();
  return "安全笔记";
}

function fallbackSnapshot(path = fallbackPath): VaultSnapshot {
  fallbackPath = path;
  return {
    path: fallbackPath,
    entries: [...fallbackEntries].sort((left, right) =>
      Number(left.deleted) - Number(right.deleted) || left.title.localeCompare(right.title)
    )
  };
}

function fallbackEntry(input: VaultEntryInput): VaultEntry {
  return {
    id: makeId(),
    type: input.type,
    title: input.title.trim(),
    subtitle: subtitleFor(input),
    website: input.website.trim(),
    username: input.username.trim(),
    password: input.password,
    provider: input.provider.trim(),
    secret: input.secret,
    envVar: input.envVar.trim(),
    project: input.project.trim(),
    expiresAt: input.expiresAt.trim(),
    body: input.body,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    tags: input.tags,
    notes: input.notes.trim(),
    favorite: false,
    deleted: false,
    updatedAt: today()
  };
}

export async function createVault(path: string, masterPassword: string): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("create_vault", { path, masterPassword });
  }

  fallbackEntries = [];
  return fallbackSnapshot(path);
}

export async function openVault(path: string, masterPassword: string): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("open_vault", { path, masterPassword });
  }

  return fallbackSnapshot(path);
}

export async function addEntry(input: VaultEntryInput): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("add_entry", { input });
  }

  fallbackEntries.push(fallbackEntry(input));
  return fallbackSnapshot();
}

export async function updateEntry(id: string, input: VaultEntryInput): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("update_entry", { id, input });
  }

  const replacement = fallbackEntry(input);
  fallbackEntries = fallbackEntries.map((entry) =>
    entry.id === id
      ? {
          ...replacement,
          id,
          favorite: entry.favorite,
          deleted: entry.deleted,
          updatedAt: today()
        }
      : entry
  );
  return fallbackSnapshot();
}

export async function addPasswordEntry(input: PasswordEntryInput): Promise<VaultSnapshot> {
  return addEntry({
    type: "password",
    title: input.title,
    website: input.website,
    username: input.username,
    password: input.password,
    notes: input.notes,
    provider: "",
    secret: "",
    envVar: "",
    project: "",
    expiresAt: "",
    body: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    tags: []
  });
}

export async function deleteEntry(id: string): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("delete_entry", { id });
  }

  fallbackEntries = fallbackEntries.map((entry) =>
    entry.id === id ? { ...entry, deleted: true, updatedAt: today() } : entry
  );
  return fallbackSnapshot();
}

export async function restoreEntry(id: string): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("restore_entry", { id });
  }

  fallbackEntries = fallbackEntries.map((entry) =>
    entry.id === id ? { ...entry, deleted: false, updatedAt: today() } : entry
  );
  return fallbackSnapshot();
}

export async function purgeEntry(id: string): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("purge_entry", { id });
  }

  fallbackEntries = fallbackEntries.filter((entry) => entry.id !== id);
  return fallbackSnapshot();
}

export async function setFavorite(id: string, favorite: boolean): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("set_favorite", { id, favorite });
  }

  fallbackEntries = fallbackEntries.map((entry) =>
    entry.id === id ? { ...entry, favorite, updatedAt: today() } : entry
  );
  return fallbackSnapshot();
}

export async function lockVault(): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("lock_vault");
  }

  fallbackPath = "";
  fallbackEntries = [];
  return fallbackSnapshot();
}

export async function saveVault(): Promise<VaultSnapshot> {
  if (hasTauriRuntime()) {
    return invoke<VaultSnapshot>("save_vault");
  }

  return fallbackSnapshot();
}
