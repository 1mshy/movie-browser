# Movie Browser - AI Agent Instructions

## Project Overview
A Tauri-based desktop app for browsing and playing local movie/TV show collections. React frontend with Material-UI, Rust backend for file system operations.

## Architecture

### Dual Entry Points (Important!)
- **`src-tauri/src/main.rs`**: The actual application entry point with all commands (`get_media_structure`, `open_video`, `get_shows_structure`, `close_window`)
- **`src-tauri/src/lib.rs`**: Template file with unused `greet` command - ignore this file

### Frontend-Backend Communication
- Frontend uses `invoke()` from `@tauri-apps/api/core` to call Rust commands
- All file operations happen in Rust backend for security (Tauri architecture)
- Example: `invoke('get_media_structure', { path: folderPath })` → calls `#[tauri::command] fn get_media_structure()`

### File Structure Assumptions
The app expects a parent directory containing:
```
parent_folder/
├── Movies/          # Each movie as folder or file
│   └── MovieName/   # If folder, finds largest file recursively
└── Shows/           # Show → Season → Episode structure
    └── ShowName/
        └── Season1/
            └── episode.mp4
```

## Key Patterns

### Rust Backend (`src-tauri/src/main.rs`)
- `find_largest_file()`: Recursively finds largest video in movie folders (assumes main feature is largest)
- File opening uses `tauri_plugin_opener::open_path()` to launch system default player
- Shows structure returns nested `HashMap<String, HashMap<String, Vec<String>>>` (show → season → episodes)
- Skips hidden files (starting with `.` or `_`) in media scanning

### React Frontend (`src/App.jsx`)
- Uses localStorage for watched state: `localStorage.setItem(title, "watched")`
- Path construction for shows: `` `${parentFolder}Shows\\${showName}\\${seasonName}\\${episode}` `` (note: backslashes hardcoded for Windows)
- Toast notifications with random positive messages array on video play
- Custom pink-themed Material-UI components (`PinkTextField`)

### Window Configuration (`src-tauri/tauri.conf.json`)
- Frameless window: `"decorations": false`, `"titleBarStyle": "Overlay"`
- Custom drag region: elements with `data-tauri-drag-region` attribute are draggable
- Custom close button invokes `close_window` command (see red circle button in `App.jsx`)
- macOS private API enabled for enhanced window controls

## Development Workflow

### Starting Development
```bash
npm run tauri dev
```
This runs `cargo run tauri dev` which:
1. Starts Vite dev server on port 1420 (`beforeDevCommand: "npm run dev"`)
2. Launches Rust app connecting to that port

### Building
```bash
npm run build        # Builds React frontend to dist/
npm run tauri build  # Creates platform-specific executable
```

### Common Issues
- **Exit Code 101**: Usually Rust compilation error - check Rust syntax in `src-tauri/src/main.rs`
- **Port conflicts**: Dev server requires port 1420 (`strictPort: true` in `vite.config.js`)
- Path separators: Shows functionality uses Windows-style `\\` - may break on Unix systems

## Project-Specific Conventions

### Styling
- Pink color scheme using Material-UI's `pink` palette (`pink[300]`, `pink[500]`, `pink[800]`)
- Custom checkbox icons: `MovieCreationOutlinedIcon` (unwatched) → `MovieIcon` (watched)
- CSS in `src/assets/App.css` (imported in both `App.jsx` and `main.jsx`)

### State Management
- No Redux/Context - uses local React state and localStorage
- Parent folder path persisted: `localStorage.setItem("parent_folder", folder)`
- Watched state keyed by movie name or full episode path

### Dependencies
- Tauri v2 with shell and opener plugins
- React 18 with Material-UI v6 and Emotion styling
- `react-toastify` for notifications (container in `main.jsx`)

## When Making Changes

- **Adding Rust commands**: Define in `main.rs`, add to `invoke_handler![]` macro, expose to frontend via `invoke()`
- **Window behavior**: Modify `tauri.conf.json` app.windows array, but preserve frameless/overlay config
- **Cross-platform paths**: Currently hardcoded for Windows (`\\` separators) - use `Path::join()` in Rust for portability
- **Media type filtering**: Video extensions checked: `.mp4`, `.mkv` only (see `get_shows_structure`)
