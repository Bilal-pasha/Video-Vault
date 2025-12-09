module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push('react-native-worklets/plugin');
  plugins.push([
    'module-resolver',
    {
      root: ['./src'],
      alias: {
        '@': './src',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
  ]);
  plugins.push('react-native-reanimated/plugin'); // Must be last

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};