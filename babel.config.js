module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env', // This is where your .env file should be located
        },
      ],
      'nativewind/babel', // Add NativeWind Babel plugin here
    ],
  };
};
