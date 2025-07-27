# 📦 react-native-simple-updater

A lightweight and customizable React Native update checker for Android apps. Supports automatic version checking, APK downloading, and installing — with support for Android 13+ install permissions and MMKV caching to prevent repeated downloads.

---

## 🚀 Features

- ✅ Auto or manual update checks  
- ✅ APK download with progress UI  
- ✅ MMKV caching to avoid repeated downloads  
- ✅ Resume install if previously downloaded  
- ✅ Android 13+ install permission support  
- ✅ Fully customizable trigger button  

---

## 📦 Installation

Install the library and required dependencies:

```bash
yarn add react-native-simple-updater
```

### Peer Dependencies

```bash
yarn add react-native-mmkv react-native-device-info react-native-fs rn-fetch-blob axios
```

Also, ensure these are properly linked (if using older React Native versions).

---

## 📥 API Response Format

Your `updateUrl` must return a JSON response structured like:

```json
{
  "data": {
    "version": "1.0.5",
    "apkSignedUrl": "https://cdn.yourdomain.com/releases/app-release.apk"
  }
}
```

---

## 🧠 How It Works

1. When the app loads, it optionally checks a remote endpoint (`updateUrl`) for version info.
2. It compares the `version` from the response with the current app version using `react-native-device-info`.
3. If a newer version is found:
   - It either **downloads the APK automatically** (`autoDownload: true`)  
   - Or **shows a customizable “Update Now” button** (`autoDownload: false`)
4. Once downloaded, the APK is saved to the Downloads folder.
5. If the install was not completed, the next app open will prompt to install.
6. For Android 13+, the library checks and prompts for permission to install unknown apps if not already granted.

---

## 🧪 Usage

### 🔁 Simple Usage with Auto Check & Manual Download

```jsx
import UpdatePrompt from 'react-native-simple-updater';

export default function App() {
  return (
    <>
      <UpdatePrompt
        updateUrl="https://api.yourserver.com/apps/myapp/latest"
        autoCheck={true}
        autoDownload={false}
        buttonLabel="Update Now"
      />
      <MainApp />
    </>
  );
}
```

### 🛠 Custom Trigger Button

If you want to style the update trigger button:

```jsx
<UpdatePrompt
  updateUrl="https://api.yourserver.com/apps/myapp/latest"
  autoCheck={true}
  autoDownload={false}
  ButtonComponent={
    <TouchableOpacity
      style={{
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 6,
        alignSelf: 'center',
      }}
    >
      <Text style={{ color: 'black' }}>🔥 Download Update</Text>
    </TouchableOpacity>
  }
/>
```

### 📦 Auto Download on Detection

```jsx
<UpdatePrompt
  updateUrl="https://api.yourserver.com/apps/myapp/latest"
  autoCheck={true}
  autoDownload={true}
/>
```

---

## 🔧 Props

| Prop               | Type        | Default     | Description                                                                 |
|--------------------|-------------|-------------|-----------------------------------------------------------------------------|
| `updateUrl`        | `string`    | —           | **Required.** URL that returns latest version and APK URL.                 |
| `autoCheck`        | `boolean`   | `true`      | Automatically check for updates when component mounts.                     |
| `autoDownload`     | `boolean`   | `false`     | Automatically download the update when detected.                           |
| `buttonLabel`      | `string`    | `"Update"`  | Text for the default trigger button.                                       |
| `ButtonComponent`  | `ReactNode` | —           | Custom React component to use instead of default button.                   |
| `onUpdateStart`    | `Function`  | —           | Callback when download begins.                                             |
| `onDownloadDone`   | `Function`  | —           | Callback when download completes.                                          |
| `onInstall`        | `Function`  | —           | Callback when APK installation is triggered.                               |

---

## 🔁 Manual Hook Usage

Use the internal hook if you want full control:

```js
import { useUpdateChecker } from 'react-native-simple-updater';

const {
  updateAvailable,
  progress,
  installPending,
  triggerUpdate,
  triggerInstall,
} = useUpdateChecker({
  updateUrl: 'https://your-server.com/apps/latest',
  autoCheck: true,
  autoDownload: false,
});
```

---

## 🛑 Android Permissions

For Android 13+, installation of APKs requires runtime permission for unknown sources.

Ensure this is added to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
```

The library automatically prompts the user if the permission is missing.

---

## 📂 File Structure (Overview)

```
react-native-simple-updater/
├── src/
│   ├── useUpdateChecker.js     # Hook logic
│   └── UpdatePrompt.js         # UI wrapper
├── index.js
└── README.md
```

---

## 📈 Example Output States

- ✅ Update Available → Show button or auto download
- ⬇️ Downloading... → Show progress
- 🛠️ Install Pending → Show “Install Now” if not yet installed
- 💤 No update → Renders nothing

---

## 💡 Tips

- Use `MMKV` to persist the last downloaded version and avoid re-downloading on every boot.
- `installPending` will be true if the user didn’t install the last downloaded APK.
- You can show an **“Install”** button on next app start if needed.

---

## 📃 License

MIT © 2025

---

## 🙋 FAQ

### Will this install updates silently?

❌ No. Android does **not allow silent APK installs** unless the app is a system app. This library prompts the user using the system installer.

### Is this library for Android only?

✅ Yes. iOS support is not included. You may redirect iOS users to the App Store manually.

---

## 👷 Contributing

Want to improve this library?

- Fork it
- Submit pull requests
- Report issues
- Share with others 🚀

---

## 📬 Contact

For questions or suggestions, open an issue or contact [Your Name] on GitHub.
