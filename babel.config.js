const path = require('path');

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          'heroui-native': path.join(__dirname, 'lib'),
        },
      },
    ],
  ],
};
