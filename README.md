# RUN

This branch contains all the step executed to:
1. Create an App starting from the version 0.67.4
2. Migrate it to the New Architecture. This means migrate the app to version 0.68.0
3. Create a TurboModule.
4. Create a Fabric Component.

## Table of Content

* [[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`](#setup)
* [[Migration] Upgrade to 0.68](#move-to-0.68)


## Steps

### <a name="setup" />[[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`]()

1. `npx react-native init AwesomeApp --version 0.67.4`
2. `cd AwesomeApp`
3. `npx react-native start` (in another terminal)
4. `npx react-native run-ios`
5. `npx react-native run-android`

### <a name="move-to-0.68" />[[Migration] Upgrade to 0.68]()

1. `cd AwesomeApp`
1. `yarn add react-native@0.68.0`
1. Open the `AwesomeApp/ios/AwesomeApp/AppDelegate.m` file and update it as it follows:
    ```diff
        - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
        {
        #if DEBUG
    -       return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    +       return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
        #else
            return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
        #endif
        }
    ```
1. `npx react-native run-ios && npx react-native run-android`
