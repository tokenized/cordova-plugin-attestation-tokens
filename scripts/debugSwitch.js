var fs = require('fs');
var path = require('path');

const editsByPlatform = {
  android: {
    file: 'plugins/@tokenized/cordova-plugin-attestation-tokens/src/android/AttestationTokens.java',
    debug:
      'firebaseAppCheck.installAppCheckProviderFactory(DebugAppCheckProviderFactory.getInstance());',
    release:
      'firebaseAppCheck.installAppCheckProviderFactory(PlayIntegrityAppCheckProviderFactory.getInstance());',
  },
  ios: {
    file: 'plugins/@tokenized/cordova-plugin-attestation-tokens/src/ios/AttestationTokens.swift',
    debug: 'let providerFactory = AppCheckDebugProviderFactory()',
    release: 'let providerFactory = AttestationTokensAppCheckProviderFactory()',
  },
};

function afterPrepareHook(context) {
  context.opts.platforms.forEach((platform) => {
    if (editsByPlatform[platform]) {
      const fileName = path.join(
        context.opts.projectRoot,
        editsByPlatform[platform].file,
      );

      let originalSource;
      try {
        originalSource = fs.readFileSync(fileName, 'utf8');
      } catch (error) {
        throw new Error(`Unable to read ${editsByPlatform[platform].file}`);
      }

      let modifiedSource;
      if (process.env.USE_DEBUG_APP_CHECK) {
        modifiedSource = originalSource.replace(
          editsByPlatform[platform].release,
          editsByPlatform[platform].debug,
        );
        if (modifiedSource.indexOf(editsByPlatform[platform].debug) === -1) {
          throw new Error(
            `Unable to select App Check debug mode in ${editsByPlatform[platform].file}`,
          );
        }
      } else {
        modifiedSource = originalSource.replace(
          editsByPlatform[platform].debug,
          editsByPlatform[platform].release,
        );
        if (modifiedSource.indexOf(editsByPlatform[platform].release) === -1) {
          throw new Error(
            `Unable to select App Check release mode in ${editsByPlatform[platform].file}`,
          );
        }
      }

      try {
        fs.writeFileSync(fileName, modifiedSource, 'utf8');
      } catch (error) {
        throw new Error(`Unable to modify ${editsByPlatform[platform].file}`);
      }

      if (process.env.USE_DEBUG_APP_CHECK) {
        console.log(
          `Selected App Check debug mode in ${editsByPlatform[platform].file}`,
        );
      } else {
        console.log(
          `Selected App Check release mode in ${editsByPlatform[platform].file}`,
        );
      }
    }
  });
}

module.exports = afterPrepareHook;
