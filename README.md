# RUN

This branch contains all the step executed to:

1. Create an App starting from the version 0.67.4
1. Migrate it to React Native 0.70.0, adopting the New Architecture.
1. Create a TurboModule.
1. Create a Fabric Component.

## Table of Content

* App Setup
    * [[Setup] Run npx react-native init AwesomeApp --version 0.67.4](#setup)
    * [[Migration] Upgrade to 0.69](#move-to-0.70)

## Steps

### <a name="setup" />[[Setup] Run npx react-native init AwesomeApp --version 0.67.4]()

1. `npx react-native init AwesomeApp --version 0.67.4`
1. `cd AwesomeApp`
1. `npx react-native start (in another terminal)`
1. `npx react-native run-ios`
1. `npx react-native run-android`

### <a name="move-to-0.70" />[[Migration] Upgrade to 0.70]()

1. `cd AwesomeApp`
1. `yarn add react@18.0.0` to upgrade to React18
1. `yarn add react-native@0.70.0-rc.0`
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
1. Open the `ios/Podfile` file and update it as it follows:
    ```diff
    - platform :ios, '11.0'
    + platform :ios, '12.4'
    ```
1. At the same level of the `AwesomeApp.xcodeproj`, create an `.xcode.env` file with this content:
    ```
    export NODE_BINARY=$(command -v node)
    ```
    Eventually, replacing the `$(command -v node)` with the actual path to node.
1. `cd ios`
1. `bundle exec pod install`
1. Open the `android/build.gradle` file and update the `buildscript.ext` block with the following code
    ```kotlin
    buildscript {
        ext {
            buildToolsVersion = "31.0.0"
            minSdkVersion = 21
            compileSdkVersion = 31
            targetSdkVersion = 31
            if (System.properties['os.arch'] == "aarch64") {
                // For M1 Users we need to use the NDK 24 which added support for aarch64
                ndkVersion = "24.0.8215888"
            } else {
                // Otherwise we default to the side-by-side NDK version from AGP.
                ndkVersion = "21.4.7075529"
            }
        }
    }
    ```
1. Open the `android/app/src/main/AndroidManifest.xml` file and add this line:
    ```diff
    android:windowSoftInputMode="adjustResize"
    + android:exported="true">
    <intent-filter>
    ```
1. Open the `android/app/build.gradle` and add the following function:
    ```kotlin
    def isNewArchitectureEnabled() {
        // To opt-in for the New Architecture, you can either:
        // - Set `newArchEnabled` to true inside the `gradle.properties` file
        // - Invoke gradle with `-newArchEnabled=true`
        // - Set an environment variable `ORG_GRADLE_PROJECT_newArchEnabled=true`
        return project.hasProperty("newArchEnabled") && project.newArchEnabled == "true"
    }
    ```
1. Open the `android/gradle.properties` and add the `newArchEnabled=true` property to it.
1. `npx react-native run-ios && npx react-native run-android`
