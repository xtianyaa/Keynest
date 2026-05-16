import type { VaultEntry } from "../domain";

type EntryListProps = {
  entries: VaultEntry[];
  selectedEntryId: string;
  onSelectEntry: (entryId: string) => void;
};

function entryKindLabel(entry: VaultEntry) {
  if (entry.type === "api-key") return "API";
  if (entry.type === "secure-note") return "NOTE";
  if (entry.type === "identity") return "ID";
  return "PWD";
}

export function EntryList({ entries, selectedEntryId, onSelectEntry }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <section className="entry-list empty-list">
        <p>没有匹配的条目</p>
      </section>
    );
  }

  return (
    <section className="entry-list" aria-label="条目列表">
      <div className="entry-list-head" aria-hidden="true">
        <span>名称</span>
        <span>类型</span>
        <span>更新</span>
      </div>
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={entry.id === selectedEntryId ? "entry-row active" : "entry-row"}
          onClick={() => onSelectEntry(entry.id)}
        >
          <span className="entry-primary">
            <span className="entry-title">{entry.title}</span>
            <span className="entry-subtitle">{entry.subtitle}</span>
          </span>
          <span className="entry-kind">{entryKindLabel(entry)}</span>
          <span className="entry-meta">{entry.updatedAt}</span>
        </button>
      ))}
    </section>
  );
}
