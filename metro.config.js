const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to prioritize React Native and Browser builds over Node builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Support .mjs files which are used by modern Firebase builds
config.resolver.sourceExts.push('mjs');

// Disable package exports to avoid resolving Node-specific builds in Firebase packages
// Metro's support for package exports is still unstable and often defaults to Node conditions
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
