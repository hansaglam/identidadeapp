/**
 * Android: tam ekran native splash (arka plan drawable + fill).
 * expo-splash-screen'in küçük ortalanmış splashscreen_logo'sunu devre dışı bırakır.
 */
const { withAndroidStyles, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const EMPTY_DRAWABLE = `<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
  <solid android:color="@android:color/transparent"/>
  <size android:width="1dp" android:height="1dp"/>
</shape>
`;

const BACKGROUND_DRAWABLE = `<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap android:gravity="fill" android:src="@drawable/splashscreen_full" />
  </item>
</layer-list>
`;

function patchStylesXml(stylesXml) {
  let xml = stylesXml;
  xml = xml.replace(
    /\s*<item name="windowSplashScreenAnimatedIcon">[^<]*<\/item>\s*/g,
    "\n"
  );
  xml = xml.replace(
    /\s*<item name="android:windowSplashScreenBehavior">[^<]*<\/item>\s*/g,
    "\n"
  );
  xml = xml.replace(
    /<item name="windowSplashScreenBackground">[^<]*<\/item>/,
    '<item name="windowSplashScreenBackground">@color/splashscreen_background</item>'
  );
  if (!xml.includes("windowSplashScreenAnimatedIcon")) {
    xml = xml.replace(
      /(<item name="windowSplashScreenBackground">[^<]*<\/item>)/,
      `$1
    <item name="windowSplashScreenAnimatedIcon">@drawable/splashscreen_empty</item>`
    );
  }
  return xml;
}

function removeSplashLogos(resDir) {
  if (!fs.existsSync(resDir)) return;
  for (const entry of fs.readdirSync(resDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("drawable")) continue;
    const dir = path.join(resDir, entry.name);
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith("splashscreen_logo")) {
        fs.unlinkSync(path.join(dir, file));
      }
    }
  }
}

module.exports = function withAndroidSplashFullscreen(config) {
  config = withAndroidStyles(config, (mod) => {
    mod.modResults.resources.style = mod.modResults.resources.style.map((style) => {
      if (style.$?.name !== "Theme.App.SplashScreen") return style;
      const items = (style.item || []).filter(
        (item) =>
          item.$?.name !== "windowSplashScreenAnimatedIcon" &&
          item.$?.name !== "android:windowSplashScreenBehavior"
      );
      const bgIndex = items.findIndex((i) => i.$?.name === "windowSplashScreenBackground");
      if (bgIndex >= 0) {
        items[bgIndex] = {
          $: { name: "windowSplashScreenBackground" },
          _: "@color/splashscreen_background",
        };
      } else {
        items.unshift({
          $: { name: "windowSplashScreenBackground" },
          _: "@color/splashscreen_background",
        });
      }
      items.push({
        $: { name: "windowSplashScreenAnimatedIcon" },
        _: "@drawable/splashscreen_empty",
      });
      const post = items.find((i) => i.$?.name === "postSplashScreenTheme");
      return {
        ...style,
        item: post ? items : [...items, { $: { name: "postSplashScreenTheme" }, _: "@style/AppTheme" }],
      };
    });
    return mod;
  });

  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const res = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "res");
      const drawableDir = path.join(res, "drawable");
      const nodpiDir = path.join(res, "drawable-nodpi");
      const splashSrc = path.join(projectRoot, "assets", "splash.png");

      fs.mkdirSync(drawableDir, { recursive: true });
      fs.mkdirSync(nodpiDir, { recursive: true });

      if (fs.existsSync(splashSrc)) {
        fs.copyFileSync(splashSrc, path.join(nodpiDir, "splashscreen_full.png"));
      }

      fs.writeFileSync(path.join(drawableDir, "splashscreen_empty.xml"), EMPTY_DRAWABLE);
      fs.writeFileSync(path.join(drawableDir, "splashscreen_background.xml"), BACKGROUND_DRAWABLE);
      fs.writeFileSync(
        path.join(drawableDir, "ic_launcher_background.xml"),
        `<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap android:gravity="fill" android:src="@drawable/splashscreen_full" />
  </item>
</layer-list>
`
      );

      removeSplashLogos(res);

      const stylesPath = path.join(res, "values", "styles.xml");
      if (fs.existsSync(stylesPath)) {
        fs.writeFileSync(stylesPath, patchStylesXml(fs.readFileSync(stylesPath, "utf8")));
      }
      return mod;
    },
  ]);
};
