import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import useUpdateChecker from "./useUpdateChecker";

const UpdateChecker = ({
  updateUrl,
  autoCheck = true,
  autoDownload = false,
}) => {
  const {
    updateAvailable,
    progress,
    triggerUpdate,
    triggerInstall,
    installPending,
  } = useUpdateChecker({ updateUrl, autoCheck, autoDownload });

  if (!updateAvailable) return null;

  return (
    <View style={styles.banner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>Update Available</Text>
        <Text style={styles.text}>
          {progress > 0
            ? `Downloading: ${progress.toFixed(2)}%`
            : "Ready to update"}
        </Text>
      </View>

      {/* ✅ If not downloading and install is not pending, show Update Now */}
      {progress === 0 && !installPending && !autoDownload && (
        <TouchableOpacity style={styles.button} onPress={triggerUpdate}>
          <Text style={styles.buttonText}>Update Now</Text>
        </TouchableOpacity>
      )}

      {/* ✅ If download is done, but not installed yet */}
      {installPending && (
        <TouchableOpacity style={styles.button} onPress={triggerInstall}>
          <Text style={styles.buttonText}>Install Update</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#007aff",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "white",
    borderRadius: 6,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
});

export default UpdateChecker;
