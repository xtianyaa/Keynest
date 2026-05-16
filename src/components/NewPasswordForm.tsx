import { useState, type FormEvent } from "react";
import type { PasswordEntryInput } from "../vaultApi";

type NewPasswordFormProps = {
  onSubmit: (input: PasswordEntryInput) => Promise<unknown>;
  onCancel: () => void;
};

const emptyInput: PasswordEntryInput = {
  title: "",
  website: "",
  username: "",
  password: "",
  notes: ""
};

export function NewPasswordForm({ onSubmit, onCancel }: NewPasswordFormProps) {
  const [input, setInput] = useState(emptyInput);

  function updateField(field: keyof PasswordEntryInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(input);
    setInput(emptyInput);
  }

  return (
    <form className="new-entry-form" aria-label="新增账号密码" onSubmit={submit}>
      <label>
        <span>标题</span>
        <input
          value={input.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
        />
      </label>
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
      <label>
        <span>密码</span>
        <input
          value={input.password}
          onChange={(event) => updateField("password", event.target.value)}
          type="password"
          required
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
        <button type="submit">保存条目</button>
      </div>
    </form>
  );
}
