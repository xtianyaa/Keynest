export type CategoryId =
  | "all"
  | "passwords"
  | "api-keys"
  | "secure-notes"
  | "identity"
  | "favorites"
  | "trash"
  | "settings";

export type EntryType = "password" | "api-key" | "secure-note" | "identity";

export type Category = {
  id: CategoryId;
  label: string;
};

export type VaultEntry = {
  id: string;
  type: EntryType;
  title: string;
  subtitle: string;
  tags: string[];
  favorite: boolean;
  deleted: boolean;
  updatedAt: string;
  notes: string;
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
};

export type PasswordEntry = VaultEntry & { type: "password" };
export type ApiKeyEntry = VaultEntry & { type: "api-key" };
export type SecureNoteEntry = VaultEntry & { type: "secure-note" };
export type IdentityEntry = VaultEntry & { type: "identity" };

export const categories: Category[] = [
  { id: "all", label: "全部条目" },
  { id: "passwords", label: "账号密码" },
  { id: "api-keys", label: "API Key" },
  { id: "secure-notes", label: "安全笔记" },
  { id: "identity", label: "身份信息" },
  { id: "favorites", label: "收藏" },
  { id: "trash", label: "回收站" },
  { id: "settings", label: "设置" }
];

export const demoEntries: VaultEntry[] = [
  {
    id: "openai-api",
    type: "api-key",
    title: "OpenAI API Key",
    subtitle: "OPENAI_API_KEY",
    provider: "OpenAI",
    secret: "sk-proj-1234567890abcdef",
    envVar: "OPENAI_API_KEY",
    project: "AI 产品原型",
    expiresAt: "2026-12-31",
    tags: ["AI", "开发"],
    favorite: true,
    deleted: false,
    updatedAt: "2026-05-15",
    notes: "用于本地开发环境。",
    website: "",
    username: "",
    password: "",
    body: "",
    fullName: "",
    email: "",
    phone: "",
    address: ""
  },
  {
    id: "gmail",
    type: "password",
    title: "Gmail",
    subtitle: "me@example.com",
    website: "https://mail.google.com",
    username: "me@example.com",
    password: "correct horse battery staple",
    tags: ["个人"],
    favorite: true,
    deleted: false,
    updatedAt: "2026-05-10",
    notes: "已开启两步验证。",
    provider: "",
    secret: "",
    envVar: "",
    project: "",
    expiresAt: "",
    body: "",
    fullName: "",
    email: "",
    phone: "",
    address: ""
  }
];

export function categoryForEntry(entry: VaultEntry): CategoryId {
  if (entry.deleted) return "trash";
  if (entry.type === "password") return "passwords";
  if (entry.type === "api-key") return "api-keys";
  if (entry.type === "secure-note") return "secure-notes";
  return "identity";
}

export function filterEntries(
  source: VaultEntry[],
  categoryId: CategoryId,
  query: string
): VaultEntry[] {
  if (categoryId === "settings") return [];

  const normalizedQuery = query.trim().toLowerCase();

  return source.filter((entry) => {
    const categoryMatches =
      (categoryId === "all" && !entry.deleted) ||
      (categoryId === "favorites" && entry.favorite && !entry.deleted) ||
      categoryForEntry(entry) === categoryId;

    if (!categoryMatches) return false;
    if (!normalizedQuery) return true;

    const searchable = [
      entry.title,
      entry.subtitle,
      entry.tags.join(" "),
      entry.notes,
      entry.provider,
      entry.envVar,
      entry.project,
      entry.website,
      entry.username,
      entry.body,
      entry.fullName,
      entry.email,
      entry.phone,
      entry.address
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}
