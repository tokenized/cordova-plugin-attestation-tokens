# Cordova Firebase App Check Plugin

A Cordova plugin for obtaining iOS/Android app attestation tokens (for
attachment to JavaScript REST API requests) from
[Firebase App Check](https://firebase.google.com/docs/app-check).

**This plugin is currently in development, for use in an upcoming version of the
[Tokenized Mobile Authenticator App](https://tokenized.com), and is not yet
recommended for production use. Please bear with us as we work towards a
production-ready v1.0.**

- On iOS, uses the
  [App Attest service](https://firebase.google.com/docs/app-check/ios/app-attest-provider)
- On Android, uses
  [Google Play Integrity](https://firebase.google.com/docs/app-check/android/play-integrity-provider)
- Can be set up to use the
  [App Check debug provider](https://firebase.google.com/docs/app-check/ios/debug-provider)
  for testing valid attestation tokens in development builds (see below)
- Provides two simple async functions to the Cordova app:
  - `token = await window.AttestationTokens.getToken();` gets you a standard
    attestation token (encoded as a string) that can be passed to your REST API
    in a header for verification (see the
    [App Check docs for details](https://firebase.google.com/docs/app-check/custom-resource-backend)).
    Call `getToken()` every time you make a REST API call – the Firebase SDK
    caches the current token and manages refreshing it efficiently.
  - `token = await window.AttestationTokens.getLimitedUseToken();` gets you a
    single-use attestation token that can be
    [“consumed” by your back end](https://firebase.google.com/docs/app-check/custom-resource-backend#replay-protection)
    after verification. This gives you protection against replay attacks at the
    expense of extra network requests for every request client-side and on the
    back end. As explained in the Firebase docs, it should therefore only be
    used on particularly sensitive endpoints.

## Setting up

### Enable App Check in Firebase

You will need to have a Firebase project set up for your app (app IDs and
signing certificates registered for the platforms you are targeting). Enable the
App Check service in the Firebase console and register each of your apps
correctly:

- For iOS, register with the
  [App Attest provider](https://firebase.google.com/docs/app-check/ios/app-attest-provider#project-setup).
- For Android, register with the
  [Play services provider](https://firebase.google.com/docs/app-check/android/play-integrity-provider#project-setup).

### Install the plugin

`cordova-plugin-attestation-tokens` adds the App Check module of the Firebase
SDK as a dependency to your app. The version used can be controlled by
specifying a Firebase SDK version number, on Android this is a version of the
[Firebase Android BoM](https://firebase.google.com/docs/android/learn-more#bom),
and on iOS the
[version of the Firebase SDK Cocoapod](https://firebase.google.com/support/release-notes/ios).
The plugin provides variables for these which you can override when you install
it (these are the defaults):

```
cordova plugin add @tokenized/cordova-plugin-attestation-tokens \
  --variable ANDROID_FIREBASE_BOM_VERSION="32.1.1" \
  --variable IOS_FIREBASE_POD_VERSION="10.11.0"
```

### Configure the Firebase SDK

At runtime, the Firebase SDK configures itself by reading information from a
platform-specific resource file that you need to download from the Firebase
console and tell Cordova to copy into the published app as a resource file:

For Android, download `google-services.json` and add it into the root directory
of your Cordova project. Add this line to the `<platform name="android">`
section of your `config.xml`:

```xml
<resource-file src="google-services.json" target="app/google-services.json" />
```

For iOS, download `GoogleService-Info.plist` and add it into the root directory
of your Cordova project. Add this line to the `<platform name="ios">` section of
your `config.xml`:

```xml
<resource-file src="GoogleService-Info.plist" />
```

### Other Firebase plugins

`cordova-plugin-attestation-tokens` initializes the Firebase SDK as part of app
startup. On iOS it needs to set up the App Check provider before the `configure`
function of the SDK is called, so it needs to start up before any other plugins
you have that use Firebase, and those plugins need to have code that only calls
`configure` if the Firebase SDK has not already been initialized.

For example, in the Tokenized Authenticator app, we also use
`cordova-plugin-firebase-messaging` for push notifications. To get it to
co-exist with `cordova-plugin-attestation-tokens`, we ensure that the
attestation plugin is first in the Cordova plugins list in our `package.json`,
and that the two plugins are using the same versions of the Firebase SDK:

```json
{
  ...
  "cordova": {
    ...
    "plugins": {
      ...
      "@tokenized/cordova-plugin-attestation-tokens": {
        "ANDROID_FIREBASE_BOM_VERSION": "32.1.1",
        "IOS_FIREBASE_POD_VERSION": "10.11.0"
      },
      "cordova-plugin-firebase-messaging": {
        "ANDROID_FIREBASE_BOM_VERSION": "32.1.1",
        "IOS_FIREBASE_POD_VERSION": "10.11.0"
      },
      ...
    }
  }
  ...
}
```

(Note that after changing the order in `package.json`, you’ll need to completely
remove the Cordova build dirs `platforms/` and `plugins/` and re-run
`cordova prepare`.)

## Attestation tokens in development builds

In the standard production setup documented above, valid attestation tokens can
only be obtained when:

- (For iOS builds): the app is signed by Apple via the App Store or TestFlight,
  and is running on a physical iOS device.
- (For Android builds): the app is signed by Google via the Play Store, and is
  running on an Android device with Google Play Services.

However, in your local development builds, you can configure the plugin to use
the App Check debug provider, and by registering a secret “debug token”
(generated on your real/simulated test device) with the App Check console, you
can obtain valid attestation tokens that verify when checked by your back end.

To indicate to the Cordova build process that you want to use the App Check
debug provider, set the environment variable `USE_DEBUG_APP_CHECK=true` during
`cordova prepare`. For convenience, we recommend setting up scripts for
preparing builds in your `package.json`, something like this:

```json
{
  "scripts": {
    ...
    "prepare-debug-android": "npm run make-www-debug && cross-env USE_DEBUG_APP_CHECK=true cordova prepare android",
    "prepare-debug-ios": "npm run make-www-debug && cross-env USE_DEBUG_APP_CHECK=true cordova prepare ios",
    "prepare-release-android": "npm run make-www-release && cordova prepare android",
    "prepare-release-ios": "npm run make-www-release && cordova prepare ios",
    ...
  }
}
```

The first time you run your development build on a new device, the debug
provider will generate (and remember) a debug token and print it to the console,
which you must register in the App Check console to authorize attestation. Note
that on iOS, you also need to set the launch argument `-FIRDebugEnabled` in
Xcode to see the debug token in the console. Refer to the debug provider
documentation for
[iOS](https://firebase.google.com/docs/app-check/ios/debug-provider) and
[Android](https://firebase.google.com/docs/app-check/android/debug-provider) for
more information.

Note that `cordova-plugin-attestation-tokens` does not support the use of a CI
debug token
[generated in the App Check console](https://firebase.google.com/docs/app-check/android/debug-provider#ci).

## License

The project is [MIT licensed](https://opensource.org/licenses/MIT).
