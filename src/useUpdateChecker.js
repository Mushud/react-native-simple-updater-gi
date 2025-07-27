import { useEffect, useState } from "react";
import {
  Platform,
  ToastAndroid,
  Alert,
  PermissionsAndroid,
  Linking,
} from "react-native";
import RNFS from "react-native-fs";
import RNFetchBlob from "rn-fetch-blob";
import axios from "axios";
import DeviceInfo from "react-native-device-info";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export default function useUpdateChecker({
  updateUrl,
  autoCheck = true,
  autoDownload = false,
}) {
  const [progress, setProgress] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteInfo, setRemoteInfo] = useState(null);
  const [installPending, setInstallPending] = useState(false);
  const [apkFilePath, setApkFilePath] = useState(null);

  useEffect(() => {
    if (Platform.OS === "android" && autoCheck) {
      checkForUpdate();
    }
  }, []);

  const checkForUpdate = async () => {
    try {
      const response = await axios.get(updateUrl);
      const currentVersion = DeviceInfo.getVersion();
      const latestVersion = response?.data?.data?.version;

      if (!latestVersion || latestVersion === currentVersion) return;

      const cachedVersion = storage.getString("lastDownloadedVersion");
      const isPending = storage.getBoolean("installPending");

      const downloadDir = RNFS.DownloadDirectoryPath;
      const path = `${downloadDir}/update-latest.apk`;
      const apkExists = await RNFS.exists(path);

      // Handle already downloaded APK
      if (cachedVersion === latestVersion && isPending && apkExists) {
        setInstallPending(true);
        setApkFilePath(path);
        setUpdateAvailable(true);
        return;
      }

      // Otherwise prepare to download
      setUpdateAvailable(true);
      setRemoteInfo(response.data.data);

      if (autoDownload) {
        await downloadAndInstallAPK(
          response.data.data.apkSignedUrl,
          response?.data?.data?.version
        );
      }
    } catch (e) {
      console.log("Update Check Failed:", e);
      ToastAndroid.show("Update check failed", ToastAndroid.LONG);
    }
  };

  const triggerUpdate = async () => {
    if (!remoteInfo) return;
    await downloadAndInstallAPK(remoteInfo.apkSignedUrl, remoteInfo.version);
  };

  const downloadAndInstallAPK = async (apkUrl, version) => {
    if (!version || !apkUrl) return;

    const downloadDir = RNFS.DownloadDirectoryPath;
    const filePath = `${downloadDir}/update-latest.apk`;

    try {
      const exists = await RNFS.exists(downloadDir);
      if (!exists) await RNFS.mkdir(downloadDir);

      const options = {
        fromUrl: apkUrl,
        toFile: filePath,
        background: true,
        progress: (res) => {
          setProgress((res.bytesWritten / res.contentLength) * 100);
        },
      };

      await RNFS.downloadFile(options).promise;

      storage.set("lastDownloadedVersion", version);
      storage.set("installPending", true);

      setApkFilePath(filePath);
      setInstallPending(true);
    } catch (error) {
      Alert.alert("Download Failed", "Could not download the APK.");
      console.error(error);
    }
  };

  const triggerInstall = async () => {
    if (!apkFilePath) return;

    if (Platform.Version >= 33) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.REQUEST_INSTALL_PACKAGES
      );

      if (!hasPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.REQUEST_INSTALL_PACKAGES
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Denied",
            "Please allow permission to install unknown apps in settings.",
            [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return;
        }
      }
    }

    try {
      RNFetchBlob.android.actionViewIntent(
        apkFilePath,
        "application/vnd.android.package-archive"
      );
    } catch (e) {
      Alert.alert("Install Failed", "Unable to start APK installer.");
      console.error(e);
    }
  };

  return {
    updateAvailable,
    progress,
    triggerUpdate,
    triggerInstall,
    installPending,
  };
}
