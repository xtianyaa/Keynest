import { useState, type ReactNode } from "react";
import type { ApiKeyEntry, PasswordEntry, VaultEntry } from "../domain";

type EntryDetailProps = {
  entry: VaultEntry | undefined;
  onCopy: (value: string, message: string) => void;
  onEdit?: (entryId: string) => void;
  onDelete?: (entryId: string) => void;
  onRestore?: (entryId: string) => void;
  onPurge?: (entryId: string) => void;
  onFavorite?: (entryId: string, favorite: boolean) => void;
  onSave?: () => void;
};

function SensitiveField({
  label,
  value,
  onCopy
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="info-row sensitive-row">
      <dt>{label}</dt>
      <dd>
        <code className="secret-preview">
          {revealed ? value : "•".repeat(Math.min(value.length, 18))}
        </code>
        <div className="field-actions">
          <button type="button" onClick={() => setRevealed((current) => !current)}>
            {revealed ? `隐藏 ${label}` : `显示 ${label}`}
          </button>
          <button type="button" onClick={onCopy}>
            复制 {label}
          </button>
        </div>
      </dd>
    </div>
  );
}

function PasswordFields({
  entry,
  onCopy
}: {
  entry: PasswordEntry;
  onCopy: EntryDetailProps["onCopy"];
}) {
  return (
    <>
      <InfoRow label="网站" value={entry.website || "未填写"} />
      <InfoRow label="用户名" value={entry.username || "未填写"} />
      <SensitiveField
        label="密码"
        value={entry.password}
        onCopy={() => onCopy(entry.password, "已复制密码")}
      />
    </>
  );
}

function ApiKeyFields({
  entry,
  onCopy
}: {
  entry: ApiKeyEntry;
  onCopy: EntryDetailProps["onCopy"];
}) {
  const envLine = `${entry.envVar}=${entry.secret}`;

  return (
    <>
      <InfoRow label="服务商" value={entry.provider || "未填写"} />
      <InfoRow label="环境变量" value={entry.envVar || "未填写"} />
      <InfoRow label="项目" value={entry.project || "未填写"} />
      <InfoRow label="过期时间" value={entry.expiresAt || "未填写"} />
      <SensitiveField label="Key" value={entry.secret} onCopy={() => onCopy(entry.secret, "已复制 API Key")} />
      <div className="info-row">
        <dt>.env</dt>
        <dd>
          <code className="env-preview">{entry.envVar || "API_KEY"}=••••••••••••</code>
          <div className="field-actions">
            <button type="button" onClick={() => onCopy(envLine, "已复制 .env 行")}>
              复制 .env
            </button>
          </div>
        </dd>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function EntryDetail({
  entry,
  onCopy,
  onEdit,
  onDelete,
  onRestore,
  onPurge,
  onFavorite,
  onSave
}: EntryDetailProps) {
  if (!entry) {
    return (
      <section className="detail-panel empty-detail">
        <p>选择一个条目查看详情</p>
      </section>
    );
  }

  return (
    <section className="detail-panel" aria-label="条目详情">
      <header className="detail-header">
        <div>
          <p className="eyebrow">{entry.type}</p>
          <h2>{entry.title}</h2>
          <span>{entry.subtitle}</span>
        </div>
        {entry.favorite ? <span className="favorite-pill">收藏</span> : null}
      </header>

      <dl className="info-grid">
        {entry.type === "password" ? <PasswordFields entry={entry as PasswordEntry} onCopy={onCopy} /> : null}
        {entry.type === "api-key" ? <ApiKeyFields entry={entry as ApiKeyEntry} onCopy={onCopy} /> : null}
        {entry.type === "secure-note" ? <InfoRow label="内容" value={entry.body || "未填写"} /> : null}
        {entry.type === "identity" ? (
          <>
            <InfoRow label="姓名" value={entry.fullName || "未填写"} />
            <InfoRow label="邮箱" value={entry.email || "未填写"} />
            <InfoRow label="电话" value={entry.phone || "未填写"} />
            <InfoRow label="地址" value={entry.address || "未填写"} />
          </>
        ) : null}
        {entry.notes ? <InfoRow label="备注" value={entry.notes} /> : null}
      </dl>

      <footer className="detail-actions">
        {onSave ? (
          <button type="button" onClick={onSave}>
            保存保险库
          </button>
        ) : null}
        {onEdit && !entry.deleted ? (
          <button type="button" onClick={() => onEdit(entry.id)}>
            编辑条目
          </button>
        ) : null}
        {onFavorite && !entry.deleted ? (
          <button type="button" onClick={() => onFavorite(entry.id, !entry.favorite)}>
            {entry.favorite ? "取消收藏" : "收藏条目"}
          </button>
        ) : null}
        {entry.deleted && onRestore ? (
          <button type="button" onClick={() => onRestore(entry.id)}>
            恢复条目
          </button>
        ) : null}
        {entry.deleted && onPurge ? (
          <button type="button" className="danger-action" onClick={() => onPurge(entry.id)}>
            永久删除
          </button>
        ) : null}
        {onDelete && !entry.deleted ? (
          <button type="button" className="danger-action" onClick={() => onDelete(entry.id)}>
            移到回收站
          </button>
        ) : null}
      </footer>
    </section>
  );
}
