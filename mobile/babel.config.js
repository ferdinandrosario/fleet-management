// Expo + NativeWind v4. `jsxImportSource: "nativewind"` rewrites JSX so the
// `className` prop works on React Native components; `nativewind/babel` compiles
// the Tailwind classes.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
