// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use tauri_plugin_opener::open_path;
use tauri_plugin_updater::UpdaterExt;

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
                            Some((largest_file, _size)) => {
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

#[tauri::command]
fn get_shows_structure(shows_path: String) -> HashMap<String, HashMap<String, Vec<String>>> {
    let mut shows_map = HashMap::new();

    if let Ok(shows) = fs::read_dir(&shows_path) {
        for show in shows.flatten() {
            if show.metadata().map(|m| m.is_dir()).unwrap_or(false) {
                let show_name = show.file_name().to_string_lossy().into_owned();
                let mut seasons_map = HashMap::new();

                if let Ok(seasons) = fs::read_dir(show.path()) {
                    for season in seasons.flatten() {
                        if season.metadata().map(|m| m.is_dir()).unwrap_or(false) {
                            let season_name = season.file_name().to_string_lossy().to_string();
                            let mut video_files = Vec::new();

                            if let Ok(files) = fs::read_dir(season.path()) {
                                for file in files.flatten() {
                                    if file.metadata().map(|m| m.is_file()).unwrap_or(false) {
                                        let name =
                                            file.file_name().into_string().to_owned().unwrap();
                                        if name.ends_with("mp4") || name.ends_with("mkv") {
                                            video_files.push(
                                                file.file_name().to_string_lossy().into_owned(),
                                            );
                                        }
                                    }
                                }
                            }

                            seasons_map.insert(season_name, video_files);
                        }
                    }
                }

                shows_map.insert(show_name, seasons_map);
            }
        }
    }

    shows_map
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<String, String> {
    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => {
                let version = update.version.clone();
                Ok(format!("Update available: {}", version))
            }
            Ok(None) => Ok("No updates available".to_string()),
            Err(e) => Err(format!("Failed to check for updates: {}", e)),
        },
        Err(e) => Err(format!("Updater error: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Only check for updates in release builds
            #[cfg(not(debug_assertions))]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(updater) = handle.updater() {
                        match updater.check().await {
                            Ok(Some(update)) => {
                                println!("Update available: {}", update.version);
                                if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
                                    eprintln!("Failed to download and install update: {}", e);
                                }
                            }
                            Ok(None) => println!("No updates available"),
                            Err(e) => eprintln!("Failed to check for updates: {}", e),
                        }
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_media_structure,
            close_window,
            open_video,
            get_shows_structure,
            check_for_updates
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
