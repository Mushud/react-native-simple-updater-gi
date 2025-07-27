import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import useUpdateChecker from "./useUpdateChecker";

const UpdateChecker = ({ updateUrl, autoCheck = true }) => {
  const { updateAvailable, progress, triggerUpdate } = useUpdateChecker({
    updateUrl,
    autoCheck,
  });

  if (!updateAvailable) return null;

  return (
    <View style={styles.banner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>Update Available</Text>
        <Text style={styles.text}>Progress: {progress.toFixed(2)}%</Text>
      </View>
      <Button title="Update Now" onPress={triggerUpdate} color="white" />
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
});

export default UpdateChecker;
