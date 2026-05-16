import { useEffect, useMemo, useState } from "react";
import { EntryDetail } from "./components/EntryDetail";
import { EntryList } from "./components/EntryList";
import { BrandMark } from "./components/BrandMark";
import { NewEntryForm } from "./components/NewEntryForm";
import { SearchBar } from "./components/SearchBar";
import { SettingsPanel, type AppSettings } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { UnlockPanel } from "./components/UnlockPanel";
import {
  categories,
  categoryForEntry,
  filterEntries,
  type CategoryId,
  type EntryType,
  type VaultEntry
} from "./domain";
import { useVault } from "./useVault";

const defaultSettings: AppSettings = {
  clipboardClearSeconds: 60,
  autoLockMinutes: 15,
  windowsHelloEnabled: false
};

const RECENT_VAULTS_KEY = "keynest:recent-vaults";

function readRecentVaults() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_VAULTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function rememberVault(path: string, current: string[]) {
  const trimmed = path.trim();
  if (!trimmed) return current;
  const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 5);
  localStorage.setItem(RECENT_VAULTS_KEY, JSON.stringify(next));
  return next;
}

function buildCounts(entries: VaultEntry[]): Record<CategoryId, number> {
  const counts = Object.fromEntries(categories.map((category) => [category.id, 0])) as Record<
    CategoryId,
    number
  >;

  for (const entry of entries) {
    if (!entry.deleted) counts.all += 1;
    counts[categoryForEntry(entry)] += 1;
    if (entry.favorite && !entry.deleted) counts.favorites += 1;
  }

  return counts;
}

function categoryToEntryType(category: CategoryId): EntryType {
  if (category === "api-keys") return "api-key";
  if (category === "secure-notes") return "secure-note";
  if (category === "identity") return "identity";
  return "password";
}

async function writeClipboard(value: string, clearAfterSeconds: number) {
  const clipboard = navigator.clipboard;
  if (!clipboard?.writeText) return;

  await clipboard.writeText(value);
  window.setTimeout(async () => {
    try {
      if ((await clipboard.readText?.()) === value) {
        await clipboard.writeText("");
      }
    } catch {
      await clipboard.writeText("");
    }
  }, clearAfterSeconds * 1000);
}

export default function App() {
  const vault = useVault();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState("");
  const [settings, setSettings] = useState(defaultSettings);
  const [recentVaults, setRecentVaults] = useState(readRecentVaults);

  const visibleEntries = useMemo(
    () => filterEntries(vault.entries, activeCategory, query),
    [activeCategory, query, vault.entries]
  );

  const selectedEntry =
    visibleEntries.find((entry) => entry.id === selectedEntryId) ?? visibleEntries[0];
  const editingEntry = vault.entries.find((entry) => entry.id === editingEntryId);
  const counts = useMemo(() => buildCounts(vault.entries), [vault.entries]);

  useEffect(() => {
    if (!selectedEntry && visibleEntries[0]) {
      setSelectedEntryId(visibleEntries[0].id);
    }
  }, [selectedEntry, visibleEntries]);

  useEffect(() => {
    if (vault.status !== "open" || settings.autoLockMinutes <= 0) return;

    let timer = window.setTimeout(() => {
      void vault.lock();
    }, settings.autoLockMinutes * 60 * 1000);

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void vault.lock();
      }, settings.autoLockMinutes * 60 * 1000);
    };

    window.addEventListener("keydown", reset);
    window.addEventListener("pointerdown", reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("pointerdown", reset);
    };
  }, [settings.autoLockMinutes, vault]);

  async function handleCreate(path: string, masterPassword: string) {
    await vault.create(path, masterPassword);
    setRecentVaults((current) => rememberVault(path, current));
  }

  async function handleOpen(path: string, masterPassword: string) {
    await vault.open(path, masterPassword);
    setRecentVaults((current) => rememberVault(path, current));
  }

  if (vault.status === "locked" || (vault.status === "busy" && !vault.path)) {
    return (
      <UnlockPanel
        busy={vault.status === "busy"}
        error={vault.error}
        recentVaults={recentVaults}
        onCreate={handleCreate}
        onOpen={handleOpen}
      />
    );
  }

  function handleSelectCategory(category: CategoryId) {
    setActiveCategory(category);
    setQuery("");
    setAddingEntry(false);
    setEditingEntryId("");
    const nextEntries = filterEntries(vault.entries, category, "");
    setSelectedEntryId(nextEntries[0]?.id ?? "");
  }

  async function handleAddEntry(input: Parameters<typeof vault.addEntry>[0]) {
    const snapshot = await vault.addEntry(input);
    const created = snapshot.entries.find((entry) => entry.title === input.title && entry.type === input.type);
    setAddingEntry(false);
    setActiveCategory(
      input.type === "api-key"
        ? "api-keys"
        : input.type === "secure-note"
          ? "secure-notes"
          : input.type === "identity"
            ? "identity"
            : "passwords"
    );
    setSelectedEntryId(created?.id ?? "");
    setToastMessage("已保存条目");
  }

  async function handleUpdateEntry(input: Parameters<typeof vault.addEntry>[0]) {
    if (!editingEntry) return;
    await vault.updateEntry(editingEntry.id, input);
    setSelectedEntryId(editingEntry.id);
    setEditingEntryId("");
    setToastMessage("已更新条目");
  }

  async function handleDeleteEntry(entryId: string) {
    await vault.deleteEntry(entryId);
    setActiveCategory("trash");
    setSelectedEntryId(entryId);
    setEditingEntryId("");
    setToastMessage("已移到回收站");
  }

  async function handleRestoreEntry(entryId: string) {
    await vault.restoreEntry(entryId);
    setActiveCategory("all");
    setSelectedEntryId(entryId);
    setToastMessage("已恢复条目");
  }

  async function handlePurgeEntry(entryId: string) {
    await vault.purgeEntry(entryId);
    setSelectedEntryId("");
    setEditingEntryId("");
    setToastMessage("已永久删除");
  }

  async function handleSave() {
    await vault.save();
    setToastMessage("保险库已保存");
  }

  async function handleCopy(value: string, message: string) {
    await writeClipboard(value, settings.clipboardClearSeconds);
    setToastMessage(message);
  }

  const showSettings = activeCategory === "settings";
  const activeCategoryLabel =
    categories.find((category) => category.id === activeCategory)?.label ?? "全部条目";
  const showForm = addingEntry || Boolean(editingEntry);

  return (
    <main className="app-shell">
      <div className="window-frame">
        <header className="window-titlebar">
          <div className="window-title">
            <BrandMark />
            <strong>Keynest</strong>
            <span>{vault.path || "钥巢本地保险库"}</span>
          </div>
          <div className="window-status">
            <span>已解锁</span>
            <span>{counts.all} 个条目</span>
          </div>
        </header>

        <div className="app-frame">
          <Sidebar
            categories={categories}
            activeCategory={activeCategory}
            counts={counts}
            onSelectCategory={handleSelectCategory}
          />

          <section className="workspace">
            <header className="topbar">
              <div className="toolbar-left">
                <span className="toolbar-label">{activeCategoryLabel}</span>
                <SearchBar value={query} onChange={setQuery} />
              </div>
              <div className="toolbar-actions">
                <button type="button" onClick={handleSave}>
                  保存
                </button>
                {!showSettings ? (
                  <button
                    className="primary-action"
                    type="button"
                    onClick={() => {
                      setEditingEntryId("");
                      setAddingEntry(true);
                    }}
                  >
                    新增条目
                  </button>
                ) : null}
              </div>
            </header>

            {vault.error ? <p className="form-error">{vault.error}</p> : null}

            {showSettings ? (
              <SettingsPanel settings={settings} onChange={setSettings} onLock={vault.lock} />
            ) : (
              <div className={showForm ? "workbench with-form" : "workbench"}>
                {showForm ? (
                  <NewEntryForm
                    initialType={editingEntry?.type ?? categoryToEntryType(activeCategory)}
                    initialEntry={editingEntry}
                    onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
                    onCancel={() => {
                      setAddingEntry(false);
                      setEditingEntryId("");
                    }}
                  />
                ) : null}

                <div className="content-grid">
                  <EntryList
                    entries={visibleEntries}
                    selectedEntryId={selectedEntry?.id ?? ""}
                    onSelectEntry={setSelectedEntryId}
                  />
                  <EntryDetail
                    entry={selectedEntry}
                    onCopy={handleCopy}
                    onEdit={(entryId) => {
                      setAddingEntry(false);
                      setEditingEntryId(entryId);
                    }}
                    onDelete={handleDeleteEntry}
                    onRestore={handleRestoreEntry}
                    onPurge={handlePurgeEntry}
                    onFavorite={vault.setFavorite}
                    onSave={handleSave}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="statusbar">
          <span>KDBX 本地文件</span>
          <span>剪贴板 {settings.clipboardClearSeconds}s 清除</span>
          <span>自动锁定 {settings.autoLockMinutes}m</span>
          <span>最近 {recentVaults.length}</span>
        </footer>
      </div>

      <Toast message={toastMessage} />
    </main>
  );
}
