import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { EntryType, VaultEntry } from "../domain";
import { calculatePasswordStrength, generatePassword } from "../passwordGenerator";
import type { VaultEntryInput } from "../vaultApi";

type NewEntryFormProps = {
  initialType: EntryType;
  initialEntry?: VaultEntry;
  onSubmit: (input: VaultEntryInput) => Promise<unknown>;
  onCancel: () => void;
};

function emptyInput(type: EntryType): VaultEntryInput {
  return {
    type,
    title: "",
    website: "",
    username: "",
    password: "",
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
    tags: [],
    notes: ""
  };
}

function inputFromEntry(entry: VaultEntry): VaultEntryInput {
  return {
    type: entry.type,
    title: entry.title,
    website: entry.website,
    username: entry.username,
    password: entry.password,
    provider: entry.provider,
    secret: entry.secret,
    envVar: entry.envVar,
    project: entry.project,
    expiresAt: entry.expiresAt,
    body: entry.body,
    fullName: entry.fullName,
    email: entry.email,
    phone: entry.phone,
    address: entry.address,
    tags: entry.tags,
    notes: entry.notes
  };
}

function tagsFromText(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function tagsToText(tags: string[]) {
  return tags.join(", ");
}

export function NewEntryForm({ initialType, initialEntry, onSubmit, onCancel }: NewEntryFormProps) {
  const [input, setInput] = useState(() =>
    initialEntry ? inputFromEntry(initialEntry) : emptyInput(initialType)
  );
  const [generatorLength, setGeneratorLength] = useState(20);
  const editing = Boolean(initialEntry);

  useEffect(() => {
    setInput(initialEntry ? inputFromEntry(initialEntry) : emptyInput(initialType));
  }, [initialEntry, initialType]);

  const typeOptions = useMemo(
    () =>
      [
        ["password", "账号密码"],
        ["api-key", "API Key"],
        ["secure-note", "安全笔记"],
        ["identity", "身份信息"]
      ] as const,
    []
  );

  function updateField(field: keyof VaultEntryInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
  }

  function updateType(type: EntryType) {
    setInput((current) => ({ ...emptyInput(type), title: current.title, notes: current.notes }));
  }

  function fillGeneratedPassword() {
    const password = generatePassword({
      length: generatorLength,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    });
    updateField("password", password);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(input);
    if (!editing) {
      setInput(emptyInput(input.type));
    }
  }

  const passwordStrength = calculatePasswordStrength(input.password);

  return (
    <form className="new-entry-form" aria-label={editing ? "编辑条目" : "新增条目"} onSubmit={submit}>
      <label>
        <span>类型</span>
        <select value={input.type} onChange={(event) => updateType(event.target.value as EntryType)}>
          {typeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>标题</span>
        <input
          value={input.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
        />
      </label>

      {input.type === "password" ? (
        <>
          <label>
            <span>网站</span>
            <input value={input.website} onChange={(event) => updateField("website", event.target.value)} />
          </label>
          <label>
            <span>用户名</span>
            <input
              value={input.username}
              onChange={(event) => updateField("username", event.target.value)}
            />
          </label>
          <label className="password-field">
            <span>密码</span>
            <input
              value={input.password}
              onChange={(event) => updateField("password", event.target.value)}
              type="password"
              required
            />
          </label>
          <div className="generator-controls">
            <label>
              <span>长度</span>
              <input
                type="number"
                min={8}
                max={64}
                value={generatorLength}
                onChange={(event) => setGeneratorLength(Number(event.target.value))}
              />
            </label>
            <button type="button" onClick={fillGeneratedPassword}>
              生成密码
            </button>
            <span className={`strength-pill strength-${passwordStrength.label}`}>
              {passwordStrength.label}
            </span>
          </div>
        </>
      ) : null}

      {input.type === "api-key" ? (
        <>
          <label>
            <span>服务商</span>
            <input value={input.provider} onChange={(event) => updateField("provider", event.target.value)} />
          </label>
          <label>
            <span>Key</span>
            <input
              value={input.secret}
              onChange={(event) => updateField("secret", event.target.value)}
              type="password"
              required
            />
          </label>
          <label>
            <span>环境变量</span>
            <input value={input.envVar} onChange={(event) => updateField("envVar", event.target.value)} />
          </label>
          <label>
            <span>项目</span>
            <input value={input.project} onChange={(event) => updateField("project", event.target.value)} />
          </label>
          <label>
            <span>过期时间</span>
            <input
              value={input.expiresAt}
              onChange={(event) => updateField("expiresAt", event.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </label>
        </>
      ) : null}

      {input.type === "secure-note" ? (
        <label className="full-row">
          <span>内容</span>
          <textarea value={input.body} onChange={(event) => updateField("body", event.target.value)} />
        </label>
      ) : null}

      {input.type === "identity" ? (
        <>
          <label>
            <span>姓名</span>
            <input value={input.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
          </label>
          <label>
            <span>邮箱</span>
            <input value={input.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            <span>电话</span>
            <input value={input.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label>
            <span>地址</span>
            <input value={input.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>
        </>
      ) : null}

      <label>
        <span>标签</span>
        <input
          value={tagsToText(input.tags)}
          onChange={(event) => setInput((current) => ({ ...current, tags: tagsFromText(event.target.value) }))}
          placeholder="多个标签用英文逗号分隔"
        />
      </label>
      <label className="full-row">
        <span>备注</span>
        <textarea value={input.notes} onChange={(event) => updateField("notes", event.target.value)} />
      </label>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          取消
        </button>
        <button type="submit">{editing ? "保存修改" : "保存条目"}</button>
      </div>
    </form>
  );
}
