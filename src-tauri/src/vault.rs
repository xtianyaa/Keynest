use std::{
    fs::File,
    path::{Path, PathBuf},
};

use chrono::Utc;
use keepass::{
    db::{fields, EntryRef},
    Database, DatabaseKey,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

const APP_NAME: &str = "Keynest";
const FIELD_ID: &str = "pv_id";
const FIELD_ENTRY_TYPE: &str = "entry_type";
const FIELD_FAVORITE: &str = "pv_favorite";
const FIELD_DELETED: &str = "pv_deleted";
const FIELD_UPDATED_AT: &str = "pv_updated_at";
const FIELD_ENV_VAR: &str = "env_var";
const FIELD_PROJECT: &str = "project";
const FIELD_EXPIRES_AT: &str = "expires_at";
const FIELD_BODY: &str = "body";
const FIELD_FULL_NAME: &str = "full_name";
const FIELD_EMAIL: &str = "email";
const FIELD_PHONE: &str = "phone";
const FIELD_ADDRESS: &str = "address";

pub type VaultResult<T> = Result<T, VaultError>;

#[derive(Debug, Error)]
pub enum VaultError {
    #[error("保险库路径不能为空")]
    EmptyPath,
    #[error("主密码不能为空")]
    EmptyPassword,
    #[error("尚未打开保险库")]
    Locked,
    #[error("条目标题不能为空")]
    EmptyTitle,
    #[error("敏感内容不能为空")]
    EmptySecret,
    #[error("找不到条目")]
    EntryNotFound,
    #[error("无法打开保险库：{0}")]
    Open(String),
    #[error("无法保存保险库：{0}")]
    Save(String),
    #[error("无法访问保险库文件：{0}")]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum EntryType {
    Password,
    ApiKey,
    SecureNote,
    Identity,
}

impl EntryType {
    fn as_str(&self) -> &'static str {
        match self {
            EntryType::Password => "password",
            EntryType::ApiKey => "api-key",
            EntryType::SecureNote => "secure-note",
            EntryType::Identity => "identity",
        }
    }

    fn from_str(value: &str) -> Self {
        match value {
            "api-key" => EntryType::ApiKey,
            "secure-note" => EntryType::SecureNote,
            "identity" => EntryType::Identity,
            _ => EntryType::Password,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct VaultSnapshot {
    pub path: String,
    pub entries: Vec<VaultEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct VaultEntry {
    pub id: String,
    #[serde(rename = "type")]
    pub entry_type: EntryType,
    pub title: String,
    pub subtitle: String,
    pub website: String,
    pub username: String,
    pub password: String,
    pub provider: String,
    pub secret: String,
    pub env_var: String,
    pub project: String,
    pub expires_at: String,
    pub body: String,
    pub full_name: String,
    pub email: String,
    pub phone: String,
    pub address: String,
    pub tags: Vec<String>,
    pub notes: String,
    pub favorite: bool,
    pub deleted: bool,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct VaultEntryInput {
    #[serde(rename = "type")]
    pub entry_type: EntryType,
    pub title: String,
    pub website: String,
    pub username: String,
    pub password: String,
    pub provider: String,
    pub secret: String,
    pub env_var: String,
    pub project: String,
    pub expires_at: String,
    pub body: String,
    pub full_name: String,
    pub email: String,
    pub phone: String,
    pub address: String,
    pub tags: Vec<String>,
    pub notes: String,
}

#[derive(Debug, Default)]
pub struct VaultState {
    path: Option<PathBuf>,
    master_password: Option<String>,
    entries: Vec<VaultEntry>,
}

impl VaultState {
    pub fn create_vault(&mut self, path: String, master_password: String) -> VaultResult<VaultSnapshot> {
        let path = parse_path(path)?;
        validate_master_password(&master_password)?;

        self.path = Some(path);
        self.master_password = Some(master_password);
        self.entries.clear();
        self.save()
    }

    pub fn open_vault(&mut self, path: String, master_password: String) -> VaultResult<VaultSnapshot> {
        let path = parse_path(path)?;
        validate_master_password(&master_password)?;

        let mut file = File::open(&path)?;
        let key = DatabaseKey::new().with_password(&master_password);
        let db = Database::open(&mut file, key).map_err(|error| VaultError::Open(error.to_string()))?;

        self.entries = entries_from_database(&db);
        self.path = Some(path);
        self.master_password = Some(master_password);
        Ok(self.snapshot())
    }

    pub fn add_entry(&mut self, input: VaultEntryInput) -> VaultResult<VaultSnapshot> {
        self.ensure_open()?;
        let entry = entry_from_input(input)?;
        self.entries.push(entry);
        Ok(self.snapshot())
    }

    pub fn add_password_entry(&mut self, input: PasswordEntryInput) -> VaultResult<VaultSnapshot> {
        self.add_entry(VaultEntryInput {
            entry_type: EntryType::Password,
            title: input.title,
            website: input.website,
            username: input.username,
            password: input.password,
            notes: input.notes,
            provider: String::new(),
            secret: String::new(),
            env_var: String::new(),
            project: String::new(),
            expires_at: String::new(),
            body: String::new(),
            full_name: String::new(),
            email: String::new(),
            phone: String::new(),
            address: String::new(),
            tags: Vec::new(),
        })
    }

    pub fn update_entry_data(&mut self, id: String, input: VaultEntryInput) -> VaultResult<VaultSnapshot> {
        self.ensure_open()?;
        let replacement = entry_from_input_with_id(input, id.clone())?;
        let entry = self.entries.iter_mut().find(|entry| entry.id == id);
        match entry {
            Some(entry) => {
                let favorite = entry.favorite;
                let deleted = entry.deleted;
                *entry = VaultEntry {
                    favorite,
                    deleted,
                    ..replacement
                };
                Ok(self.snapshot())
            }
            None => Err(VaultError::EntryNotFound),
        }
    }

    pub fn set_favorite(&mut self, id: String, favorite: bool) -> VaultResult<VaultSnapshot> {
        self.update_entry(id, |entry| {
            entry.favorite = favorite;
            entry.updated_at = today();
        })
    }

    pub fn delete_entry(&mut self, id: String) -> VaultResult<VaultSnapshot> {
        self.update_entry(id, |entry| {
            entry.deleted = true;
            entry.updated_at = today();
        })
    }

    pub fn restore_entry(&mut self, id: String) -> VaultResult<VaultSnapshot> {
        self.update_entry(id, |entry| {
            entry.deleted = false;
            entry.updated_at = today();
        })
    }

    pub fn purge_entry(&mut self, id: String) -> VaultResult<VaultSnapshot> {
        self.ensure_open()?;
        let original_len = self.entries.len();
        self.entries.retain(|entry| entry.id != id);
        if self.entries.len() == original_len {
            return Err(VaultError::EntryNotFound);
        }
        Ok(self.snapshot())
    }

    pub fn lock(&mut self) -> VaultSnapshot {
        self.master_password = None;
        self.entries.clear();
        self.path = None;
        self.snapshot()
    }

    pub fn save(&self) -> VaultResult<VaultSnapshot> {
        let path = self.path.as_ref().ok_or(VaultError::Locked)?;
        let master_password = self.master_password.as_ref().ok_or(VaultError::Locked)?;

        let mut db = Database::new();
        db.meta.generator = Some(APP_NAME.to_string());
        db.meta.database_name = Some(APP_NAME.to_string());
        db.root_mut().edit(|group| {
            group.name = APP_NAME.to_string();
            for entry in &self.entries {
                group.add_entry().edit(|kdbx_entry| {
                    kdbx_entry.set_unprotected(fields::TITLE, entry.title.clone());
                    kdbx_entry.set_unprotected(fields::URL, url_field(entry));
                    kdbx_entry.set_unprotected(fields::USERNAME, username_field(entry));
                    kdbx_entry.set_protected(fields::PASSWORD, secret_field(entry));
                    kdbx_entry.set_unprotected(fields::NOTES, entry.notes.clone());
                    kdbx_entry.tags = entry.tags.clone();
                    kdbx_entry.set_unprotected(FIELD_ID, entry.id.clone());
                    kdbx_entry.set_unprotected(FIELD_ENTRY_TYPE, entry.entry_type.as_str());
                    kdbx_entry.set_unprotected(FIELD_FAVORITE, entry.favorite.to_string());
                    kdbx_entry.set_unprotected(FIELD_DELETED, entry.deleted.to_string());
                    kdbx_entry.set_unprotected(FIELD_UPDATED_AT, entry.updated_at.clone());
                    kdbx_entry.set_unprotected(FIELD_ENV_VAR, entry.env_var.clone());
                    kdbx_entry.set_unprotected(FIELD_PROJECT, entry.project.clone());
                    kdbx_entry.set_unprotected(FIELD_EXPIRES_AT, entry.expires_at.clone());
                    kdbx_entry.set_unprotected(FIELD_BODY, entry.body.clone());
                    kdbx_entry.set_unprotected(FIELD_FULL_NAME, entry.full_name.clone());
                    kdbx_entry.set_unprotected(FIELD_EMAIL, entry.email.clone());
                    kdbx_entry.set_unprotected(FIELD_PHONE, entry.phone.clone());
                    kdbx_entry.set_unprotected(FIELD_ADDRESS, entry.address.clone());
                });
            }
        });

        let mut file = File::create(path)?;
        db.save(&mut file, DatabaseKey::new().with_password(master_password))
            .map_err(|error| VaultError::Save(error.to_string()))?;

        Ok(self.snapshot())
    }

    pub fn snapshot(&self) -> VaultSnapshot {
        let mut entries = self.entries.clone();
        entries.sort_by(|left, right| {
            left.deleted
                .cmp(&right.deleted)
                .then_with(|| left.title.to_lowercase().cmp(&right.title.to_lowercase()))
        });

        VaultSnapshot {
            path: self
                .path
                .as_ref()
                .map(|path| path.to_string_lossy().to_string())
                .unwrap_or_default(),
            entries,
        }
    }

    fn ensure_open(&self) -> VaultResult<()> {
        self.path.as_ref().ok_or(VaultError::Locked)?;
        self.master_password.as_ref().ok_or(VaultError::Locked)?;
        Ok(())
    }

    fn update_entry(
        &mut self,
        id: String,
        update: impl FnOnce(&mut VaultEntry),
    ) -> VaultResult<VaultSnapshot> {
        self.ensure_open()?;
        let entry = self.entries.iter_mut().find(|entry| entry.id == id);
        match entry {
            Some(entry) => {
                update(entry);
                Ok(self.snapshot())
            }
            None => Err(VaultError::EntryNotFound),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PasswordEntryInput {
    pub title: String,
    pub website: String,
    pub username: String,
    pub password: String,
    pub notes: String,
}

fn entry_from_input(input: VaultEntryInput) -> VaultResult<VaultEntry> {
    entry_from_input_with_id(input, Uuid::new_v4().to_string())
}

fn entry_from_input_with_id(input: VaultEntryInput, id: String) -> VaultResult<VaultEntry> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err(VaultError::EmptyTitle);
    }

    if matches!(input.entry_type, EntryType::Password) && input.password.trim().is_empty() {
        return Err(VaultError::EmptySecret);
    }
    if matches!(input.entry_type, EntryType::ApiKey) && input.secret.trim().is_empty() {
        return Err(VaultError::EmptySecret);
    }

    let subtitle = match input.entry_type {
        EntryType::Password => input.username.trim().to_string(),
        EntryType::ApiKey => input.env_var.trim().to_string(),
        EntryType::SecureNote => "安全笔记".to_string(),
        EntryType::Identity => input.email.trim().to_string(),
    };

    Ok(VaultEntry {
        id,
        entry_type: input.entry_type,
        title: title.to_string(),
        subtitle,
        website: input.website.trim().to_string(),
        username: input.username.trim().to_string(),
        password: input.password,
        provider: input.provider.trim().to_string(),
        secret: input.secret,
        env_var: input.env_var.trim().to_string(),
        project: input.project.trim().to_string(),
        expires_at: input.expires_at.trim().to_string(),
        body: input.body,
        full_name: input.full_name.trim().to_string(),
        email: input.email.trim().to_string(),
        phone: input.phone.trim().to_string(),
        address: input.address.trim().to_string(),
        tags: input.tags,
        notes: input.notes.trim().to_string(),
        favorite: false,
        deleted: false,
        updated_at: today(),
    })
}

fn parse_path(path: String) -> VaultResult<PathBuf> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err(VaultError::EmptyPath);
    }
    Ok(Path::new(trimmed).to_path_buf())
}

fn validate_master_password(master_password: &str) -> VaultResult<()> {
    if master_password.is_empty() {
        Err(VaultError::EmptyPassword)
    } else {
        Ok(())
    }
}

fn entries_from_database(db: &Database) -> Vec<VaultEntry> {
    let mut entries: Vec<VaultEntry> = db.iter_all_entries().map(vault_entry_from_kdbx).collect();
    entries.sort_by(|left, right| left.title.to_lowercase().cmp(&right.title.to_lowercase()));
    entries
}

fn vault_entry_from_kdbx(entry: EntryRef<'_>) -> VaultEntry {
    let entry_type = EntryType::from_str(&field(&entry, FIELD_ENTRY_TYPE).unwrap_or_default());
    let username = field(&entry, fields::USERNAME).unwrap_or_default();
    let url = field(&entry, fields::URL).unwrap_or_default();
    let secret = field(&entry, fields::PASSWORD).unwrap_or_default();
    let title = field(&entry, fields::TITLE).unwrap_or_else(|| "未命名条目".to_string());
    let email = field(&entry, FIELD_EMAIL).unwrap_or_default();
    let env_var = field(&entry, FIELD_ENV_VAR).unwrap_or_default();

    VaultEntry {
        id: field(&entry, FIELD_ID).unwrap_or_else(|| entry.id().to_string()),
        entry_type: entry_type.clone(),
        title,
        subtitle: subtitle_for(&entry_type, &username, &env_var, &email),
        website: if matches!(entry_type, EntryType::Password) {
            url.clone()
        } else {
            String::new()
        },
        username: if matches!(entry_type, EntryType::Password) {
            username.clone()
        } else {
            String::new()
        },
        password: if matches!(entry_type, EntryType::Password) {
            secret.clone()
        } else {
            String::new()
        },
        provider: if matches!(entry_type, EntryType::ApiKey) {
            url
        } else {
            String::new()
        },
        secret: if matches!(entry_type, EntryType::ApiKey) {
            secret
        } else {
            String::new()
        },
        env_var,
        project: field(&entry, FIELD_PROJECT).unwrap_or_default(),
        expires_at: field(&entry, FIELD_EXPIRES_AT).unwrap_or_default(),
        body: field(&entry, FIELD_BODY).unwrap_or_default(),
        full_name: field(&entry, FIELD_FULL_NAME).unwrap_or_default(),
        email,
        phone: field(&entry, FIELD_PHONE).unwrap_or_default(),
        address: field(&entry, FIELD_ADDRESS).unwrap_or_default(),
        tags: entry.tags.clone(),
        notes: field(&entry, fields::NOTES).unwrap_or_default(),
        favorite: parse_bool(&field(&entry, FIELD_FAVORITE).unwrap_or_default()),
        deleted: parse_bool(&field(&entry, FIELD_DELETED).unwrap_or_default()),
        updated_at: field(&entry, FIELD_UPDATED_AT).unwrap_or_else(today),
    }
}

fn url_field(entry: &VaultEntry) -> String {
    match entry.entry_type {
        EntryType::Password => entry.website.clone(),
        EntryType::ApiKey => entry.provider.clone(),
        _ => String::new(),
    }
}

fn username_field(entry: &VaultEntry) -> String {
    match entry.entry_type {
        EntryType::Password => entry.username.clone(),
        EntryType::Identity => entry.email.clone(),
        _ => String::new(),
    }
}

fn secret_field(entry: &VaultEntry) -> String {
    match entry.entry_type {
        EntryType::Password => entry.password.clone(),
        EntryType::ApiKey => entry.secret.clone(),
        _ => String::new(),
    }
}

fn subtitle_for(entry_type: &EntryType, username: &str, env_var: &str, email: &str) -> String {
    match entry_type {
        EntryType::Password => username.to_string(),
        EntryType::ApiKey => env_var.to_string(),
        EntryType::SecureNote => "安全笔记".to_string(),
        EntryType::Identity => email.to_string(),
    }
}

fn field(entry: &EntryRef<'_>, key: &str) -> Option<String> {
    entry.get(key).map(ToString::to_string)
}

fn parse_bool(value: &str) -> bool {
    value.eq_ignore_ascii_case("true")
}

fn today() -> String {
    Utc::now().date_naive().to_string()
}
