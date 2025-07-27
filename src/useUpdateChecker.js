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
      if (cachedVersion === latestVersion) return;

      setUpdateAvailable(true);
      setRemoteInfo(response.data.data);

      // 👇 Automatically download if flag is enabled
      if (autoDownload) {
        await downloadAndInstallAPK(response.data.data.apkSignedUrl);
      }
    } catch (e) {
      console.log("Update Check Failed:", e);
      ToastAndroid.show("Update check failed", ToastAndroid.LONG);
    }
  };

  const triggerUpdate = async () => {
    if (!remoteInfo) return;
    await downloadAndInstallAPK(remoteInfo.apkSignedUrl);
  };
  const downloadAndInstallAPK = async (apkUrl) => {
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
      storage.set("lastDownloadedVersion", remoteInfo.version);
      await installAPK(filePath);
    } catch (error) {
      Alert.alert("Download Failed", "Could not download the APK.");
    }
  };

  const installAPK = async (filePath) => {
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

    RNFetchBlob.android.actionViewIntent(
      filePath,
      "application/vnd.android.package-archive"
    );
  };

  return {
    updateAvailable,
    progress,
    remoteInfo,
    triggerUpdate,
    checkForUpdate,
  };
}
