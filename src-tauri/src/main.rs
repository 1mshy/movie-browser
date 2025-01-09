// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::fs::{self, Metadata};
use std::io;
use std::path::{Path, PathBuf};
use tauri_plugin_opener::open_path;

#[derive(Serialize)]
struct MediaItem {
    name: String,
    path: String,
}

#[tauri::command]
async fn close_window(application_window: tauri::Window) -> Result<(), tauri::Error> {
    application_window.destroy()
}

#[tauri::command]
fn get_media_structure(path: String) -> Vec<MediaItem> {
    let mut items = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                let name = entry.file_name().to_string_lossy().into_owned();
                // Skip hidden files
                if name.starts_with('_') || name.starts_with('.') {
                    continue;
                }
                if metadata.is_file() {
                    items.push(MediaItem {
                        name,
                        path: entry.path().to_string_lossy().into_owned(),
                    });
                } else {
                    match find_largest_file(entry.path().as_path()) {
                        Ok(res) => match res {
                            Some((largest_file, size)) => {
                                items.push(MediaItem {
                                    name,
                                    path: largest_file.as_path().to_string_lossy().into_owned(),
                                });
                            }
                            None => {
                                println!("No largest file in {:?}", entry);
                            }
                        },
                        Err(_) => {
                            println!("No largest file in {:?}", entry);
                        }
                    }
                }
            }
        }
    }
    items
}

fn find_largest_file(dir: &Path) -> io::Result<Option<(PathBuf, u64)>> {
    let mut largest_file: Option<(PathBuf, u64)> = None;

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        let metadata = entry.metadata()?;

        if metadata.is_file() {
            let file_size = metadata.len();
            if let Some((_, largest_size)) = &largest_file {
                if file_size > *largest_size {
                    largest_file = Some((path, file_size));
                }
            } else {
                largest_file = Some((path, file_size));
            }
        } else if metadata.is_dir() {
            if let Some((nested_largest_file, nested_size)) = find_largest_file(&path)? {
                if let Some((_, largest_size)) = &largest_file {
                    if nested_size > *largest_size {
                        largest_file = Some((nested_largest_file, nested_size));
                    }
                } else {
                    largest_file = Some((nested_largest_file, nested_size));
                }
            }
        }
    }

    Ok(largest_file)
}

#[tauri::command]
fn open_video(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    if path.exists() && path.is_file() {
        open_path(path.to_str().unwrap(), None::<&str>).map_err(|e| e.to_string())
    } else {
        Err("File does not exist or is not a valid file".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_media_structure,
            close_window,
            open_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
