import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { SPLASH_BACKGROUND } from "../constants/splash";

const SPLASH_IMAGE = require("../../assets/splash.png");

/** Tam ekran splash — native splash kapanınca boot süresince gösterilir */
export default function AppSplashOverlay() {
  return (
    <View style={styles.root}>
      <Image
        source={SPLASH_IMAGE}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BACKGROUND,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
});
