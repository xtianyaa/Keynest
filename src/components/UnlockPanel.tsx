import { useState } from "react";
import { BrandMark } from "./BrandMark";

type UnlockPanelProps = {
  busy: boolean;
  error: string;
  recentVaults: string[];
  onCreate: (path: string, masterPassword: string) => Promise<unknown>;
  onOpen: (path: string, masterPassword: string) => Promise<unknown>;
};

export function UnlockPanel({ busy, error, recentVaults, onCreate, onOpen }: UnlockPanelProps) {
  const [path, setPath] = useState(recentVaults[0] ?? "demo.kdbx");
  const [masterPassword, setMasterPassword] = useState("");

  async function submit(action: "create" | "open") {
    if (action === "create") {
      await onCreate(path, masterPassword);
      return;
    }
    await onOpen(path, masterPassword);
  }

  return (
    <main className="unlock-frame">
      <section className="unlock-panel" aria-label="打开本地保险库">
        <div className="unlock-brand">
          <BrandMark size="large" />
          <div>
            <h1>Keynest 钥巢</h1>
            <p>本地优先的轻量密码与 API Key 管理工具</p>
          </div>
        </div>

        {recentVaults.length > 0 ? (
          <div className="recent-vaults">
            <strong>最近保险库</strong>
            <div>
              {recentVaults.map((recentPath) => (
                <button key={recentPath} type="button" onClick={() => setPath(recentPath)}>
                  {recentPath}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <label>
          <span>保险库文件</span>
          <input value={path} onChange={(event) => setPath(event.target.value)} />
        </label>

        <label>
          <span>主密码</span>
          <input
            value={masterPassword}
            onChange={(event) => setMasterPassword(event.target.value)}
            type="password"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="unlock-actions">
          <button type="button" onClick={() => submit("create")} disabled={busy}>
            创建保险库
          </button>
          <button type="button" onClick={() => submit("open")} disabled={busy}>
            打开保险库
          </button>
        </div>
      </section>
    </main>
  );
}
