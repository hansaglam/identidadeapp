/**
 * @react-native-async-storage/async-storage v3 ships native AAR in android/local_repo.
 * Gradle must resolve org.asyncstorage.shared_storage:storage-android from that path.
 * @see https://github.com/react-native-async-storage/async-storage/issues/1280
 */
const { withProjectBuildGradle } = require("expo/config-plugins");

const MARKER = "async-storage/android/local_repo";

module.exports = function withAsyncStorageLocalMaven(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language !== "groovy") return mod;
    if (mod.modResults.contents.includes(MARKER)) return mod;

    mod.modResults.contents = mod.modResults.contents.replace(
      /allprojects\s*\{\s*repositories\s*\{/,
      `allprojects {
  repositories {
    maven { url uri("$rootDir/../node_modules/@react-native-async-storage/async-storage/android/local_repo") }`
    );
    return mod;
  });
};
