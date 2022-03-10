module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    './node_modules/react-native/packages/babel-plugin-codegen'
  ]
};
