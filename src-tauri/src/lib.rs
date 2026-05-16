mod vault;

use std::sync::Mutex;

pub use vault::{PasswordEntryInput, VaultEntryInput, VaultSnapshot, VaultState};

pub type SharedVaultState = Mutex<VaultState>;

fn map_vault_result<T>(result: vault::VaultResult<T>) -> Result<T, String> {
    result.map_err(|error| error.to_string())
}

fn with_vault_state<T>(
    state: tauri::State<'_, SharedVaultState>,
    operation: impl FnOnce(&mut VaultState) -> vault::VaultResult<T>,
) -> Result<T, String> {
    let mut vault = state
        .lock()
        .map_err(|_| "保险库状态已损坏，请重启应用".to_string())?;
    map_vault_result(operation(&mut vault))
}

#[tauri::command]
fn create_vault(
    path: String,
    master_password: String,
    state: tauri::State<'_, SharedVaultState>,
) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| vault.create_vault(path, master_password))
}

#[tauri::command]
fn open_vault(
    path: String,
    master_password: String,
    state: tauri::State<'_, SharedVaultState>,
) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| vault.open_vault(path, master_password))
}

#[tauri::command]
fn add_password_entry(
    input: PasswordEntryInput,
    state: tauri::State<'_, SharedVaultState>,
) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.add_password_entry(input)?;
        vault.save()
    })
}

#[tauri::command]
fn add_entry(input: VaultEntryInput, state: tauri::State<'_, SharedVaultState>) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.add_entry(input)?;
        vault.save()
    })
}

#[tauri::command]
fn update_entry(
    id: String,
    input: VaultEntryInput,
    state: tauri::State<'_, SharedVaultState>,
) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.update_entry_data(id, input)?;
        vault.save()
    })
}

#[tauri::command]
fn delete_entry(id: String, state: tauri::State<'_, SharedVaultState>) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.delete_entry(id)?;
        vault.save()
    })
}

#[tauri::command]
fn restore_entry(id: String, state: tauri::State<'_, SharedVaultState>) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.restore_entry(id)?;
        vault.save()
    })
}

#[tauri::command]
fn purge_entry(id: String, state: tauri::State<'_, SharedVaultState>) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.purge_entry(id)?;
        vault.save()
    })
}

#[tauri::command]
fn set_favorite(
    id: String,
    favorite: bool,
    state: tauri::State<'_, SharedVaultState>,
) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| {
        vault.set_favorite(id, favorite)?;
        vault.save()
    })
}

#[tauri::command]
fn save_vault(state: tauri::State<'_, SharedVaultState>) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| vault.save())
}

#[tauri::command]
fn lock_vault(state: tauri::State<'_, SharedVaultState>) -> Result<VaultSnapshot, String> {
    with_vault_state(state, |vault| Ok(vault.lock()))
}

pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(VaultState::default()))
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            create_vault,
            open_vault,
            add_entry,
            update_entry,
            add_password_entry,
            delete_entry,
            restore_entry,
            purge_entry,
            set_favorite,
            lock_vault,
            save_vault
        ])
        .run(tauri::generate_context!())
        .expect("failed to run password vault app");
}

#[cfg(test)]
mod vault_tests;
