// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::fs;

#[derive(Serialize)]
struct MediaItem {
    name: String,
    path: String,
}

#[tauri::command]
fn get_media_structure(path: String) -> Vec<MediaItem> {
    let mut items = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() || metadata.is_dir() {
                    items.push(MediaItem {
                        name: entry.file_name().to_string_lossy().into_owned(),
                        path: entry.path().to_string_lossy().into_owned(),
                    });
                }
            }
        }
    }
    items
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_media_structure])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
