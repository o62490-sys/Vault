# React Vault Manager

A secure, client-side password manager built with React and TypeScript. This application allows users to create encrypted vaults to store sensitive login information. All data is stored locally in the browser's storage and encrypted using strong, modern cryptographic standards.

## ✨ Key Features

- **100% Client-Side**: All operations, including vault creation, encryption, and decryption, happen directly on your device. No data is ever sent to a server.
- **Strong Encryption**: Utilizes the Web Crypto API with AES-GCM for data encryption and PBKDF2 for key derivation.
- **Persistent Storage**: Can be run as a standalone desktop app, storing data securely in your OS's application data directory, safe from browser data clearing.
- **Password Generation**: Includes a robust, cryptographically secure password generator.
- **Two-Factor Authentication (TOTP)**: Secure your vault with an extra layer of protection using time-based one-time passwords from an authenticator app.
- **Password Recovery**: Set up a recovery code or security questions to regain access to your vault if you forget your master password.
- **Backup & Restore**: Easily export and import your encrypted vault data.
- **Cross-Platform**: Run as a desktop app (Windows, macOS, Linux), a mobile app (iOS, Android), or directly in the browser.

## 🏗️ Build Targets

This application supports multiple deployment targets:

| Target | Platforms | Use Case | Build Command |
|--------|-----------|----------|---------------|
| **Electron** (Recommended) | Windows, macOS, Linux | Native desktop app with best user experience | `npm run electron:build` |
| **Tauri** | Windows, macOS, Linux | Lightweight desktop app (alternative to Electron) | `npm run tauri:build` |
| **Capacitor** | iOS, Android | Native mobile applications | `npm run sync:android` / `npm run sync:ios` |
| **Web** | All platforms | Browser-based version | `npm run build` |

### 🔧 Recent Fixes Applied

**Fixed Issues:**
- ✅ **Electron Build**: Fixed missing main entry file error by moving `main.cjs` to `dist-electron/` directory
- ✅ **Multi-platform Support**: Added Mac and Linux build configurations to electron-builder.json
- ✅ **Tauri Build**: Successfully upgraded from Tauri 1.6 to 2.x with proper configuration
- ✅ **Metadata**: Added missing description and author fields to package.json
- ✅ **Assets**: Created assets directory with proper icon files for all platforms

**Build Commands Now Working:**
```bash
# ✅ Electron (Recommended - Fully Working)
npm run electron:build:win    # Windows portable executable (69.9 MB)
                              # Location: dist-electron/release/React-Vault-Manager-Portable.exe

# ✅ Tauri (Alternative - Lightweight & Working!)
npm run tauri:build           # Tauri desktop app (all platforms)
                              # Executable: src-tauri/target/release/react-vault-manager.exe
                              # Size: ~15-20 MB (much smaller than Electron!)
                              # Uses system WebView2 (faster startup)
```

## 🚀 How to Run (Web Browser)

This project uses [Vite](https://vitejs.dev/) as a build tool. You will need [Node.js](https://nodejs.org/) and `npm` installed.

1.  **Install Dependencies**:
    Open your terminal in the project directory and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    After the installation is complete, start the development server:
    ```bash
    npm run dev
    ```
    This will open the application in your default web browser, usually at `http://localhost:5173`.

3.  **Build for Production**:
    To create an optimized version of the app for hosting, run:
     ```bash
    npm run build
    ```
    This command will create a `dist` folder ready to be hosted on any static web server.

## 🛠️ Available Build Commands

| Command | Description | Output Location |
|---------|-------------|-----------------|
| `npm run dev` | Start development server | Browser at http://localhost:5173 |
| `npm run build` | Build web version | `dist/` folder |
| `npm run preview` | Preview web build | Local server |
| `npm run electron` | Run Electron app | Desktop window |
| `npm run electron:dev` | Run Electron in dev mode | Desktop with hot reload |
| `npm run electron:build` | Build Electron for current platform | `dist-electron/release/` |
| `npm run electron:build:win` | Build Windows Electron app | `dist-electron/release/*.exe` |
| `npm run electron:build:mac` | Build macOS Electron app | `dist-electron/release/*.dmg` |
| `npm run electron:build:linux` | Build Linux Electron app | `dist-electron/release/*.AppImage` |
| `npm run tauri:build` | Build Tauri desktop app | `src-tauri/target/release/bundle/` |
| `npm run sync:android` | Prepare Android build | `android/` folder |
| `npm run sync:ios` | Prepare iOS build | iOS project files |
| `npm run open:android` | Open in Android Studio | Android development |
| `npm run open:ios` | Open in Xcode | iOS development |

## 🖥️ Building for Desktop (Electron - Recommended)

This project is configured with [Electron](https://www.electronjs.org/) to build a native desktop application. This provides a better user experience than Tauri and builds reliably on Windows without MSI issues.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) installed. No additional system dependencies required!

### Run and Build

1.  **Run in Development Mode**:
    To run the app as a native desktop application for development, use:
    ```bash
    npm run electron:dev
    ```
    This will start both the Vite dev server and launch the Electron app.

2.  **Run Electron App Only**:
    If the dev server is already running, you can launch just the Electron app:
    ```bash
    npm run electron
    ```

3.  **Build the Application**:
    To build the final, installable desktop application, run:
     ```bash
    npm run electron:build
    ```
    This command will create native installers for your specific operating system:
    - Windows: `.exe` installer in `dist-electron` directory
    - macOS: `.dmg` file in `dist-electron` directory
    - Linux: `.AppImage` file in `dist-electron` directory

4.  **Build for Specific Platforms**:
    ```bash
    npm run electron:build:win    # Windows only
    npm run electron:build:mac    # macOS only
    npm run electron:build:linux  # Linux only
    ```

## 💻 Building for Desktop (Tauri - Alternative)

This project is also configured with [Tauri](https://tauri.app/) as an alternative to Electron for building a standalone desktop application. Tauri is more lightweight but may have build issues on some systems.

### Prerequisites

You need to set up your system for Tauri development. Follow the official guide here: [**Tauri Prerequisites**](https://tauri.app/v1/guides/getting-started/prerequisites). The installer will guide you through installing the Rust toolchain and other necessary dependencies.

### Run and Build

1.  **Run in Development Mode**:
    To run the app in a desktop window for development, use:
    ```bash
    npm run tauri:dev
    ```

2.  **Build the Application**:
    To build the final, installable desktop application, run:
     ```bash
    npm run tauri:build
    ```
    This command will create an installer for your specific operating system (e.g., `.msi` on Windows, `.app` on macOS) inside the `src-tauri/target/release/bundle` directory.


## 📱 Building for Mobile (Android & iOS)

This project is configured with [Capacitor](https://capacitorjs.com/) to allow you to build and run it as a native mobile application.

### Prerequisites

- **Android**: You must have [Android Studio](https://developer.android.com/studio) installed and configured on your machine.
- **iOS**: You must have a macOS machine with [Xcode](https://developer.apple.com/xcode/) installed.

### Build Steps

1.  **Add Mobile Platforms**:
    Run these commands once to add the native platforms to your project:
    ```bash
    npx cap add android
    npx cap add ios
    ```

2.  **Sync Your Web App with the Native Project**:
    Each time you make changes to your web code, sync the assets to the native projects:

    For Android:
    ```bash
    npm run sync:android
    ```
    For iOS:
    ```bash
    npm run sync:ios
    ```

3.  **Open, Build, and Run in the IDE**:
    After syncing, open the native project in its respective IDE:

    For Android:
    ```bash
    npm run open:android
    ```
    For iOS:
    ```bash
    npm run open:ios
    ```

## 📂 Project Structure

- `index.html`: The main entry point of the application.
- `src/`: Contains all the application source code.
  - `index.tsx`: The React application's root.
  - `App.tsx`: The main component that manages state and views.
  - `components/`: Contains all the React components.
  - `services/`: Contains logic separated from the UI.
  - `types.ts`: Defines all the TypeScript types and interfaces.
- `src-tauri/`: Contains the configuration and source code for the Tauri desktop app.

## 🔐 Security

The security of your data is the top priority.
- The master password is never stored. It is used only in memory to derive the encryption key.
- The derived key is used to encrypt a separate, randomly generated "vault key".
- This vault key is what encrypts all your individual entries.
- All sensitive information, including the TOTP secret, is encrypted before being stored.

- The master password is never stored. It is used only in memory to derive the encryption key.
- The derived key is used to encrypt a separate, randomly generated "vault key".
- This vault key is what encrypts all your individual entries.
- All sensitive information, including the TOTP secret, is encrypted before being stored.
