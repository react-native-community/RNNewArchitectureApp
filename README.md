# RUN

This branch contains all the step executed to:
1. Create an App starting from the version 0.67.4
2. Migrate it to the New Architecture. This means migrate the app to version 0.68.0
3. Create a TurboModule.
4. Create a Fabric Component.

## Table of Content

* [[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`](#setup)
* [[Migration] Upgrade to 0.68](#move-to-0.68)
* [[Migration] Install react-native-codegen](#install-codegen)
* [[Android Setup] Configure Gradle for CodeGen](#android-setup)
* [[Hermes] Use Hermes - Android](#hermes-android)
* [[Hermes] Use Hermes - iOS](#hermes-ios)
* [[C++ iOS] iOS: Enable C++17 language feature support](#configure-cpp17)
* [[C++ iOS] iOS: Use Objective-C++ (.mm extension)](#configure-objcpp)
* [[TurboModule Setup] iOS: TurboModules: Ensure your App Provides an `RCTCxxBridgeDelegate`](#ios-tm)

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

### <a name="install-codegen" />[[Migration] Install react-native-codegen]()

* `yarn add react-native-codegen`
* `npx react-native run-ios && npx react-native run-android`

### <a name="android-setup" />[[Android Setup] Configure Gradle for CodeGen]()

1. Navigate to `AwesomeApp/android` folder
1. Update Gradle running: `./gradlew wrapper --gradle-version 7.3 --distribution-type=all`
1. Open the `AwesomeApp/android/settings.gradle` file and add the following lines:
    ```diff
    apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
    include ':app'
    + includeBuild('../node_modules/react-native-gradle-plugin')

    + include(":ReactAndroid")
    + project(":ReactAndroid").projectDir = file('../node_modules/react-native/ReactAndroid')
    ```
1. Open the `AwesomeApp/android/build.gradle` file and update the gradle dependency:
    ```diff
        buildscript {
        ext {
    -        buildToolsVersion = "30.0.2"
    +        buildToolsVersion = "31.0.0"
            minSdkVersion = 21
    -        compileSdkVersion = 30
    -        targetSdkVersion = 30
    +        compileSdkVersion = 31
    +        targetSdkVersion = 31
        //...
        repositories {
            google()
            mavenCentral()
        }
        dependencies {
    -        classpath("com.android.tools.build:gradle:4.2.2")
    +        classpath("com.android.tools.build:gradle:7.0.4")

    +        classpath("com.facebook.react:react-native-gradle-plugin")
    +        classpath("de.undercouch:gradle-download-task:4.1.2")

            // NOTE: Do not place your application dependencies here; they belong
            // in the individual module build.gradle files

        }
    }
    ```
1. Open the `android/app/build.gradle` and add the following snippet:
    ```diff
    + configurations.all {
    +     resolutionStrategy.dependencySubstitution {
    +         substitute(module("com.facebook.react:react-native"))
    +                 .using(project(":ReactAndroid"))
    +                 .because("On New Architecture we're building React Native from source")
    + }

    // Run this once to be able to run the application with BUCK
    // puts all compile dependencies into folder libs for BUCK to use
    task copyDownloadableDepsToLibs(type: Copy) {
    ```
1. Open the `android/app/main/AndroidManifest.xml` file and update the main activity:
    ```xml
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
    +        android:exported="true"
            android:windowSoftInputMode="adjustResize">
    ```
1. Go back to the `AwesomeApp` folder
1. `npx react-native run-android` (Don't worry if it takes some time to complete.)

### <a name="hermes-android" />[[Hermes] Use Hermes - Android]()

1. Open the `AwesomeApp/android/app/build.gradle` and update the `enableHermes` propety:
    ```diff
        project.ext.react = [
    -        enableHermes: false,  // clean and rebuild if changing
    +        enableHermes: true,  // clean and rebuild if changing
        ]

        apply from: "../../node_modules/react-native/react.gradle"
    ```
1. Open the `AwesomeApp/android/app/proguard-rules.pro` and update the file adding these lines:
    ```sh
    -keep class com.facebook.hermes.unicode.** { *; }
    -keep class com.facebook.jni.** { *; }
    ```
1. Clean the build `cd android && ./gradlew clean`
1. Run the app again `cd .. && npx react-native run-android`

### <a name="hermes-ios" />[[Hermes] Use Hermes - iOS]()

1. Open the `ios/Podfile` file and update it as it follows:
    ```diff
        use_react_native!(
            :path => config[:reactNativePath],
            # to enable hermes on iOS, change `false` to `true` and then install pods
    -        :hermes_enabled => false
    +        :hermes_enabled => true
        )
    ```
1. Remove the previous pods: `rm -rf Pods Podfile.lock`
1. Install the new pods `cd ios && pod install`
1. Run the app `cd .. && npx react-native run-ios`

### <a name="configure-cpp17">[[C++ iOS] iOS: Enable C++17 language feature support]()

* Open the `AwesomeApp/ios/AwesomeApp.xcworkspace` inn Xcode
* In the `Project Navigator`, select the AwesomeApp Project.
* In the Project panel, select the `AwesomeApp` project (not the one in the `Target` panel)
* Select the `Build Settings` tab
* Filter for `CLANG_CXX_LANGUAGE_STANDARD` and update it to `c++17`
* Run the app `npx react-native run-ios`

### <a name="configure-objcpp">[[C++ iOS] iOS: Use Objective-C++ (.mm extension)]()

1. Open the `AwesomeApp/ios/AwesomeApp.xcworkspace` in Xcode
1. Rename all the `.m` files to `.mm`:
    1. `main.m` will be renamed to `main.mm`
    1. `AppDelegate.m` will be renamed to `AppDelegate.mm`
1. Run `npx react-native run-ios`

**Note:** Renaming files in Xcode also updates the `xcodeproj` file automatically.

### <a name="ios-tm" /> [[TurboModule Setup] iOS: TurboModules: Ensure your App Provides an `RCTCxxBridgeDelegate`]()

1. Open the `AppDelegate.mm` file
1. Add the following imports:
    ```objc
    #import <reacthermes/HermesExecutorFactory.h>
    #import <React/RCTCxxBridgeDelegate.h>
    #import <React/RCTJSIExecutorRuntimeInstaller.h>
    ``
1. Add the following `@interface`, right before the `@implementation` keyword
    ```obj-c
    @interface AppDelegate () <RCTCxxBridgeDelegate> {
    // ...
    }
    @end
    ```
1. Add the following function at the end of the file, before the `@end` keyword:
    ```obj-c
    #pragma mark - RCTCxxBridgeDelegate

    - (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
    {
    return std::make_unique<facebook::react::HermesExecutorFactory>(facebook::react::RCTJSIExecutorRuntimeInstaller([bridge](facebook::jsi::Runtime &runtime) {
        if (!bridge) {
            return;
        }
        })
    );
    }
    ```
1. In Xcode, select the `AwesomeApp` in the project navigator.
1. Select `AwesomeApp` in the project panel
1. Select the `Build Settings` tab
1. Search for `CPLUSPLUS` in the filter text field
1. Add the following flags to the `Other C++ Flags` field for both the `Debug` and the `Release` configurations:
    ```sh
    -DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32
    ```
1. From the `AwesomeApp` folder, run the app: `npx react-native ru-ios`
