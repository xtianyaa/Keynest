export type AppSettings = {
  clipboardClearSeconds: number;
  autoLockMinutes: number;
  windowsHelloEnabled: boolean;
};

type SettingsPanelProps = {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onLock: () => void;
};

export function SettingsPanel({ settings, onChange, onLock }: SettingsPanelProps) {
  function updateNumber(field: "clipboardClearSeconds" | "autoLockMinutes", value: string) {
    const parsed = Number(value);
    onChange({
      ...settings,
      [field]: Number.isFinite(parsed) ? parsed : 0
    });
  }

  return (
    <section className="settings-panel" aria-label="设置">
      <header>
        <h2>设置</h2>
        <button type="button" className="danger-action" onClick={onLock}>
          锁定保险库
        </button>
      </header>

      <div className="settings-grid">
        <label>
          <span>剪贴板清除秒数</span>
          <input
            type="number"
            min={5}
            max={300}
            value={settings.clipboardClearSeconds}
            onChange={(event) => updateNumber("clipboardClearSeconds", event.target.value)}
          />
        </label>
        <label>
          <span>自动锁定分钟数</span>
          <input
            type="number"
            min={1}
            max={120}
            value={settings.autoLockMinutes}
            onChange={(event) => updateNumber("autoLockMinutes", event.target.value)}
          />
        </label>
      </div>

      <div className="settings-note">
        <strong>Windows Hello</strong>
        <p>当前构建未启用 Windows Hello。主密码仍是根解锁方式，后续可接入设备本地快速解锁。</p>
      </div>
    </section>
  );
}
