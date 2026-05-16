use super::vault::{EntryType, VaultEntryInput, VaultState};

#[test]
fn creates_saves_and_reopens_password_entry() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("demo.kdbx");

    let mut state = VaultState::default();
    state
        .create_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::Password,
            title: "Gmail".into(),
            website: "https://mail.google.com".into(),
            username: "me@example.com".into(),
            password: "secret".into(),
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
            tags: vec!["personal".into()],
            notes: "2FA enabled".into(),
        })
        .unwrap();
    state.save().unwrap();

    let mut reopened = VaultState::default();
    let snapshot = reopened
        .open_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();

    assert_eq!(snapshot.entries.len(), 1);
    assert_eq!(snapshot.entries[0].title, "Gmail");
    assert_eq!(snapshot.entries[0].username, "me@example.com");
    assert_eq!(snapshot.entries[0].password, "secret");
    assert_eq!(snapshot.entries[0].notes, "2FA enabled");
    assert_eq!(snapshot.entries[0].tags, vec!["personal"]);
}

#[test]
fn wrong_password_returns_unlock_error() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("demo.kdbx");

    let mut state = VaultState::default();
    state
        .create_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    state.save().unwrap();

    let mut reopened = VaultState::default();
    let error = reopened
        .open_vault(path.to_string_lossy().to_string(), "wrong".to_string())
        .unwrap_err();

    assert!(error.to_string().contains("无法打开保险库"));
}

#[test]
fn delete_entry_marks_entry_deleted_and_persists() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("demo.kdbx");

    let mut state = VaultState::default();
    state
        .create_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    let snapshot = state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::Password,
            title: "GitHub".into(),
            website: "https://github.com".into(),
            username: "dev".into(),
            password: "secret".into(),
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
            notes: "".into(),
        })
        .unwrap();
    state.delete_entry(snapshot.entries[0].id.clone()).unwrap();
    state.save().unwrap();

    let mut reopened = VaultState::default();
    let snapshot = reopened
        .open_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();

    assert_eq!(snapshot.entries.len(), 1);
    assert!(snapshot.entries[0].deleted);
}

#[test]
fn saves_and_reopens_api_key_note_and_identity_entries() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("full.kdbx");

    let mut state = VaultState::default();
    state
        .create_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();

    state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::ApiKey,
            title: "OpenAI API Key".into(),
            provider: "OpenAI".into(),
            secret: "sk-test".into(),
            env_var: "OPENAI_API_KEY".into(),
            project: "Prototype".into(),
            expires_at: "2026-12-31".into(),
            notes: "dev only".into(),
            tags: vec!["AI".into(), "dev".into()],
            website: String::new(),
            username: String::new(),
            password: String::new(),
            body: String::new(),
            full_name: String::new(),
            email: String::new(),
            phone: String::new(),
            address: String::new(),
        })
        .unwrap();

    state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::SecureNote,
            title: "Router".into(),
            body: "192.168.1.1".into(),
            tags: vec!["home".into()],
            website: String::new(),
            username: String::new(),
            password: String::new(),
            provider: String::new(),
            secret: String::new(),
            env_var: String::new(),
            project: String::new(),
            expires_at: String::new(),
            full_name: String::new(),
            email: String::new(),
            phone: String::new(),
            address: String::new(),
            notes: String::new(),
        })
        .unwrap();

    state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::Identity,
            title: "Personal".into(),
            full_name: "Zhang San".into(),
            email: "me@example.com".into(),
            phone: "13800000000".into(),
            address: "Shanghai".into(),
            notes: "common profile".into(),
            website: String::new(),
            username: String::new(),
            password: String::new(),
            provider: String::new(),
            secret: String::new(),
            env_var: String::new(),
            project: String::new(),
            expires_at: String::new(),
            body: String::new(),
            tags: Vec::new(),
        })
        .unwrap();
    state.save().unwrap();

    let mut reopened = VaultState::default();
    let snapshot = reopened
        .open_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();

    let api_key = snapshot.entries.iter().find(|entry| entry.title == "OpenAI API Key").unwrap();
    assert_eq!(api_key.entry_type, EntryType::ApiKey);
    assert_eq!(api_key.secret, "sk-test");
    assert_eq!(api_key.env_var, "OPENAI_API_KEY");
    assert_eq!(api_key.project, "Prototype");
    assert_eq!(api_key.expires_at, "2026-12-31");
    assert_eq!(api_key.tags, vec!["AI", "dev"]);

    let note = snapshot.entries.iter().find(|entry| entry.title == "Router").unwrap();
    assert_eq!(note.entry_type, EntryType::SecureNote);
    assert_eq!(note.body, "192.168.1.1");

    let identity = snapshot.entries.iter().find(|entry| entry.title == "Personal").unwrap();
    assert_eq!(identity.entry_type, EntryType::Identity);
    assert_eq!(identity.full_name, "Zhang San");
    assert_eq!(identity.email, "me@example.com");
}

#[test]
fn favorite_restore_and_purge_are_persisted() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("trash.kdbx");

    let mut state = VaultState::default();
    state
        .create_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    let snapshot = state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::Password,
            title: "GitHub".into(),
            website: "https://github.com".into(),
            username: "dev".into(),
            password: "secret".into(),
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
            notes: String::new(),
        })
        .unwrap();
    let id = snapshot.entries[0].id.clone();

    state.set_favorite(id.clone(), true).unwrap();
    assert!(state.snapshot().entries[0].favorite);

    state.delete_entry(id.clone()).unwrap();
    assert!(state.snapshot().entries[0].deleted);

    state.restore_entry(id.clone()).unwrap();
    assert!(!state.snapshot().entries[0].deleted);

    state.delete_entry(id.clone()).unwrap();
    state.purge_entry(id).unwrap();
    state.save().unwrap();

    let mut reopened = VaultState::default();
    let snapshot = reopened
        .open_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    assert!(snapshot.entries.is_empty());
}

#[test]
fn updates_entry_fields_and_persists_them() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("edit.kdbx");

    let mut state = VaultState::default();
    state
        .create_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    let snapshot = state
        .add_entry(VaultEntryInput {
            entry_type: EntryType::Password,
            title: "Gmail".into(),
            website: "https://mail.google.com".into(),
            username: "me@example.com".into(),
            password: "old-secret".into(),
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
            tags: vec!["personal".into()],
            notes: "old note".into(),
        })
        .unwrap();
    let id = snapshot.entries[0].id.clone();

    state.set_favorite(id.clone(), true).unwrap();
    state
        .update_entry_data(
            id.clone(),
            VaultEntryInput {
                entry_type: EntryType::Password,
                title: "GitHub".into(),
                website: "https://github.com".into(),
                username: "dev@example.com".into(),
                password: "new-secret".into(),
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
                tags: vec!["work".into()],
                notes: "updated note".into(),
            },
        )
        .unwrap();
    state.save().unwrap();

    let mut reopened = VaultState::default();
    let snapshot = reopened
        .open_vault(path.to_string_lossy().to_string(), "master-pass".to_string())
        .unwrap();
    let entry = &snapshot.entries[0];

    assert_eq!(entry.id, id);
    assert_eq!(entry.title, "GitHub");
    assert_eq!(entry.website, "https://github.com");
    assert_eq!(entry.username, "dev@example.com");
    assert_eq!(entry.password, "new-secret");
    assert_eq!(entry.notes, "updated note");
    assert_eq!(entry.tags, vec!["work"]);
    assert!(entry.favorite);
    assert!(!entry.deleted);
}
