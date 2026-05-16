# 贡献指南

感谢你愿意帮助改进 Keynest。

## 开发环境

1. 安装 Node.js 和 Rust。
2. 安装依赖：

```powershell
npm install
```

3. 启动 Web UI：

```powershell
npm run dev
```

4. 启动桌面应用：

```powershell
npm run tauri:dev
```

## 提交前检查

提交变更前建议运行：

```powershell
npm test
npm run build
cargo test --manifest-path src-tauri\Cargo.toml
npm run tauri -- build --debug --no-bundle
```

如果只修改文档，可以只检查文档链接、格式和 Git 差异；如果修改功能、存储、安全逻辑或桌面配置，需要运行完整检查。

## 贡献原则

- 默认保持本地优先，保险库数据应由用户自己掌控。
- 不要在没有设计讨论的情况下加入遥测、账号系统或云同步。
- 不要记录密钥、主密码、剪贴板内容或原始保险库数据。
- UI 改动应保持桌面工具风格：紧凑、可扫描、适合反复使用。
- 涉及保险库数据、条目编辑、密码生成或安全行为的改动，应增加聚焦测试。
- 避免把构建产物、依赖目录、本地 `.kdbx` 文件、`.env` 文件或日志提交到仓库。

## 安全相关变更

如果你要修复漏洞，请不要在公开 Issue 中提前披露可利用细节。请先阅读 [SECURITY.md](SECURITY.md)，并优先使用私密渠道报告。
