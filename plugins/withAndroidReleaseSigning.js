/**
 * Release AAB/APK must not use debug.keystore (Play Console rejects it).
 * Copy android-release-signing.properties.example → android/keystore.properties
 * and place upload-keystore.jks in android/app/ before bundleRelease.
 */
const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "KIMLIK_RELEASE_SIGNING";

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== "groovy") return mod;
    if (mod.modResults.contents.includes(MARKER)) return mod;

    let contents = mod.modResults.contents;

    const keystoreLoader = `
// ${MARKER} — Play upload key (android/keystore.properties + android/app/upload-keystore.jks)
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
`;

    contents = contents.replace(/\nandroid \{/, `${keystoreLoader}\nandroid {`);

    contents = contents.replace(
      /(signingConfigs \{\s*\n\s*debug \{[\s\S]*?\n\s*\})/,
      `$1
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`
    );

    contents = contents.replace(
      /release \{\s*\n\s*\/\/ Caution![\s\S]*?\n\s*signingConfig signingConfigs\.debug/,
      `release {
            if (keystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            } else {
                signingConfig signingConfigs.debug
            }`
    );

    mod.modResults.contents = contents;
    return mod;
  });
};
