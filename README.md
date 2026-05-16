# Keynest 钥巢

Keynest，中文名“钥巢”，是一款本地优先、免费开源的桌面密码与密钥管理工具。它用于保存账号密码、API Key、安全笔记和身份信息，设计目标是足够轻量、无账号、无云依赖、普通用户也能直接上手。

## 为什么做 Keynest

很多密码管理工具功能强，但对普通用户来说过重；KeePass 生态可靠，但初次使用门槛仍然偏高。Keynest 希望保留“本地文件 + 主密码 + 可备份”的可靠模型，同时把常见操作做得更直接。

除了传统账号密码，Keynest 也把现代开发场景里的 API Key 当作一等数据类型处理，支持服务商、项目、环境变量名、过期时间和一键复制 `.env` 行。

## 当前 MVP 功能

- 创建、打开、保存和锁定由本应用创建的 `.kdbx` 本地保险库文件。
- 存储和编辑四类条目：账号密码、API Key、安全笔记、身份信息。
- 生成强密码，支持长度配置和强度提示。
- API Key 条目支持服务商、项目、过期时间、环境变量名、密钥值和一键复制 `.env` 行。
- 支持按标题、副标题、标签、备注、服务商、环境变量、网站、用户名、笔记正文和身份字段搜索。
- 支持收藏条目。
- 支持移入回收站、恢复条目和永久删除。
- 支持配置剪贴板清理时间和自动锁定时间。
- 解锁页会记住最近打开过的保险库路径，方便桌面使用。
- 基于 Tauri 构建桌面窗口，已配置应用标识、窗口尺寸和版本元数据。
- 在没有 Tauri 运行时的情况下，也可通过浏览器回退模式运行前端测试。

## 当前边界

- 当前版本主要支持本应用创建的 `.kdbx` 文件。
- 不保证完整兼容并安全改写任意第三方 KeePass/KeePassXC 数据库，因为当前 Rust 依赖的 KDBX4 写入支持仍带实验性质。
- 导入和迁移暂不在 MVP 范围内。
- 暂不包含云同步、移动端、浏览器自动填充扩展、团队共享和安装包签名。
- Windows Hello 作为未来安全能力展示在设置中，但当前构建尚未实现。
- 剪贴板清理是尽力而为，实际效果取决于操作系统和浏览器/运行时权限。

## 技术栈

- 前端：React、TypeScript、Vite
- 桌面端：Tauri 2
- 本地存储：KDBX 文件格式
- 测试：Vitest、Testing Library、Rust 单元测试

## 开发

安装依赖：

```powershell
npm install
```

启动前端开发服务器：

```powershell
npm run dev
```

启动 Tauri 桌面应用：

```powershell
npm run tauri:dev
```

运行前端测试：

```powershell
npm test
```

运行 Rust 保险库测试：

```powershell
cargo test --manifest-path src-tauri\Cargo.toml
```

构建前端：

```powershell
npm run build
```

构建桌面应用但不生成安装包：

```powershell
npm run tauri -- build --debug --no-bundle
```

## 项目文档

- [产品设计](docs/product-design.md)
- [安全模型](docs/security-model.md)
- [安全政策](SECURITY.md)
- [贡献指南](CONTRIBUTING.md)

## 安全说明

在把 Keynest 用于敏感生产密钥前，请先阅读 [SECURITY.md](SECURITY.md) 和 [docs/security-model.md](docs/security-model.md)。当前项目仍处于 MVP 阶段，尚未经过独立安全审计。

请勿把真实主密码、API Key、保险库文件、截图或日志中的敏感内容提交到 Issue、PR、聊天工具或公开仓库。

## 贡献

欢迎提交问题和改进建议。贡献前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

Keynest 的产品方向是本地优先、无账号、默认无云依赖。涉及云同步、遥测、团队协作或主安全边界变化的功能，需要先进行设计讨论。

## 开源协议

Keynest 使用 [MIT License](LICENSE) 开源。
