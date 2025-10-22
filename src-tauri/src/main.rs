// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .on_window_event(|window, event| match event {
      tauri::WindowEvent::CloseRequested { .. } => {
        window.close().unwrap();
        std::process::exit(0);
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
