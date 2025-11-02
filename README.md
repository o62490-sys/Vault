# React Vault Manager

A secure, client-side password manager built with React and TypeScript. This application allows users to create encrypted vaults to store sensitive login information. All data is stored locally in the browser's storage and encrypted using strong, modern cryptographic standards.

## ✨ Key Features

- **100% Client-Side**: All operations, including vault creation, encryption, and decryption, happen directly on your device. No data is ever sent to a server.
- **Strong Encryption**: Utilizes the Web Crypto API with AES-GCM for data encryption and PBKDF2 for key derivation.
- **Persistent Storage**: Can be run as a standalone desktop app, storing data securely in your OS's application data directory, safe from browser data clearing.
- **Password Generation**: Includes a robust, cryptographically secure password generator.
- **Two-Factor Authentication (TOTP)**: Store and generate TOTP codes for all your accounts. Supports QR code scanning for easy setup.
- **Password Recovery**: Set up a recovery code or security questions to regain access to your vault if you forget your master password.
- **Backup & Restore**: Easily export and import your encrypted vault data, including all 2FA entries.
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

- **Android**: You must have [Android Studio](https://developer.android.com/studio) installed and configured on your machine (Windows, macOS, or Linux).
- **iOS**: You must have a **macOS machine** with [Xcode](https://developer.apple.com/xcode/) installed. **iOS development requires macOS** - you cannot build iOS apps on Windows or Linux.

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

## 💾 Data Storage Locations

**Where your encrypted vaults are stored:**

| Platform | Storage Mechanism | Storage Location | Portability |
|----------|-------------------|------------------|-------------|
| **Electron Desktop** | SQLite Database | `%APPDATA%/react-vault-manager/vaults.db` (Windows)<br>`~/Library/Application Support/react-vault-manager/vaults.db` (macOS)<br>`~/.config/react-vault-manager/vaults.db` (Linux) | ✅ **Portable** - Data persists across app updates |
| **Tauri Desktop** | SQLite Database | `%APPDATA%/react-vault-manager/vaults.db` (Windows)<br>`~/Library/Application Support/react-vault-manager/vaults.db` (macOS)<br>`~/.config/react-vault-manager/vaults.db` (Linux) | ✅ **Portable** - Data persists across app updates |
| **Web Browser** | Browser's localStorage | Browser's localStorage | ❌ **Not portable** - Cleared when browser data is cleared |
| **Mobile Apps** | Capacitor Storage API | Device's secure storage | ✅ **Portable** - Backed up with device |

**Note on Web Browser Security:** While encrypted, data stored in the browser's `localStorage` is still susceptible to Cross-Site Scripting (XSS) attacks. For maximum security, desktop or mobile versions are recommended.

**Note:** Both Electron and Tauri portable versions now save your encrypted vault data in a SQLite database within your system's application data directory, so your passwords persist even when you update or reinstall the app.

## 🔐 Security

The security of your data is the top priority.
- The master password is never stored. It is used only in memory to derive the encryption key.
- The derived key is used to encrypt a separate, randomly generated "vault key".
- This vault key is what encrypts all your individual entries.
- All sensitive information, including the TOTP secret, is encrypted before being stored.

## 🔑 Two-Factor Authentication (2FA) Features

React Vault Manager includes comprehensive TOTP (Time-based One-Time Password) support, allowing you to store and generate 2FA codes for all your accounts in one secure location.

### ✨ 2FA Features

- **📱 QR Code Scanning**: Point your camera at 2FA setup QR codes for instant setup
- **🔄 Real-time Code Generation**: Automatically generates and refreshes TOTP codes
- **🔒 Secure Storage**: All TOTP secrets are encrypted with your vault key
- **📋 Manual Entry**: Enter secrets manually if QR scanning isn't available
- **⚙️ Advanced Settings**: Support for custom algorithms, digit lengths, and time periods
- **📤 QR Code Export**: Generate QR codes to set up 2FA on other devices
- **🔄 Backup & Restore**: 2FA entries are included in vault backups

### 🚀 How to Use 2FA

#### Adding a 2FA Entry

1. **Open your vault** and navigate to the **"2FA" tab**
2. **Click "Add 2FA Entry"**
3. **Enter account details:**
   - **Title**: Account name (e.g., "Google Account")
   - **Issuer**: Service name (e.g., "Google")
   - **Secret Key**: The TOTP secret (usually base32 encoded)

#### 📱 Scanning QR Codes (Recommended)

For the easiest setup:
1. When setting up 2FA on a website/app, they'll show a QR code
2. In Vault Manager, click the **"📱 Scan QR"** button next to the secret field
3. **Point your camera** at the QR code on your phone/other device
4. The form will **auto-fill** with all the correct information!

#### Manual Entry

If QR scanning isn't available:
1. Copy the secret key from your 2FA setup
2. Paste it into the **Secret Key** field
3. Fill in Title and Issuer manually
4. Click **"Show Advanced Settings"** if you need to adjust algorithm/digits/period

#### Using Generated Codes

- **Real-time Updates**: Codes automatically refresh every 30 seconds (or custom period)
- **Copy to Clipboard**: Click the code to copy it
- **Visual Countdown**: See when the current code expires

#### Managing 2FA Entries

- **Edit**: Click the "Edit" button to modify account details
- **Delete**: Click "Delete" to remove an entry (with confirmation)
- **Show QR**: Generate a QR code to set up the same account on another device/app

### 🔧 Advanced 2FA Settings

Most services use standard settings, but some require customization:

| Setting | Default | Description | Common Alternatives |
|---------|---------|-------------|-------------------|
| **Algorithm** | SHA1 | Hash algorithm for code generation | SHA256, SHA512 |
| **Digits** | 6 | Length of generated codes | 8 digits |
| **Period** | 30 seconds | How often codes refresh | 60 seconds |

**Note**: Advanced settings are hidden by default. Click "Show Advanced Settings" to access them.

### 🛡️ 2FA Security

- **Encrypted Storage**: TOTP secrets are encrypted with the same AES-GCM encryption as your passwords
- **Client-Side Only**: No 2FA data ever leaves your device
- **Secure Generation**: Uses cryptographically secure TOTP generation
- **Backup Protection**: 2FA entries are included in encrypted backups

### 📱 Supported 2FA Standards

- **TOTP (RFC 6238)**: Time-based one-time passwords
- **Base32 Encoding**: Standard encoding for secrets
- **Multiple Algorithms**: SHA1, SHA256, SHA512
- **Variable Digits**: 6 or 8 digit codes
- **Custom Periods**: 30-second default, supports others

### 🔄 Backup & Migration

**2FA entries are automatically included** in vault backups and restores. When you:
- Export a backup → All 2FA entries are encrypted and saved
- Import a backup → All 2FA entries are restored with their secrets intact

This makes it easy to migrate your 2FA setup between devices or recover from data loss.

### 🎯 Best Practices

1. **Use QR Scanning**: Always scan QR codes when available - it's faster and less error-prone
2. **Backup Regularly**: Include 2FA entries in your backup routine
3. **Test Codes**: Always verify generated codes work before deleting from other apps
4. **Secure Recovery**: Keep backup files in secure locations
5. **Multiple Devices**: Use "Show QR" to set up the same account on multiple devices

### 🐛 Troubleshooting

**QR Code Won't Scan:**
- Ensure camera permissions are granted
- Make sure the QR code is well-lit and in focus
- Try manual entry if scanning fails

**Codes Don't Work:**
- Check that the secret key was entered correctly
- Verify algorithm/digits/period match the service requirements
- Confirm your device time is accurate (TOTP depends on time sync)

**Import Issues:**
- Ensure you're importing a valid vault backup file (.vaultbak)
- Check that the backup was created with a compatible version
