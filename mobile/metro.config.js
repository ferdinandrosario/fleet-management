// Metro bundler config: wrap Expo's defaults with NativeWind so `global.css`
// (the Tailwind entry) is processed.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
