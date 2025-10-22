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

## 💻 Building for Desktop (Recommended)

This project is configured with [Tauri](https://tauri.app/) to build a standalone desktop application. This is the most secure way to use the app, as your data is stored in a safe location outside of your browser.

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