# RUN

This branch contains all the step executed to:
1. Create an App starting from the version 0.67.4
2. Migrate it to the New Architecture. This means migrate the app to version 0.68.0
3. Create a TurboModule.
4. Create a Fabric Component.

## Table of Content

* App Setup
    * [[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`](#setup)
    * [[Migration] Upgrade to 0.68](#move-to-0.68)
    * [[Migration] Install react-native-codegen](#install-codegen)
    * [[Android Setup] Configure Gradle for CodeGen](#android-setup)
    * [[Hermes] Use Hermes - Android](#hermes-android)
    * [[Hermes] Use Hermes - iOS](#hermes-ios)
    * iOS Specific Setup
        * [[C++ iOS] iOS: Enable C++17 language feature support](#configure-cpp17)
        * [[C++ iOS] iOS: Use Objective-C++ (.mm extension)](#configure-objcpp)
        * [[TurboModule Setup] iOS: TurboModules: Ensure your App Provides an `RCTCxxBridgeDelegate`](#ios-tm)
* TurboModule Setup
    * Android
        * [[TurboModule Setup] Android: Enable NDK and the native build](#turbomodule-ndk)
        * [[TurboModule Setup] Java - Provide a `ReactPackageTurboModuleManagerDelegate`](#java-tm-delegate)
        * [[TurboModule Setup] Adapt your ReactNativeHost to use the `ReactPackageTurboModuleManagerDelegate`](#java-tm-adapt-host)
        * [[TurboModule Setup] Extend the getPackages() from your ReactNativeHost to use the TurboModule](#java-tm-extend-package)

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

### <a name="turbomodule-ndk" />[[TurboModule Setup] Android: Enable NDK and the native build]()

1. Open the `AwesomeApp/android/app/build.gradle` file and update it as it follows:
    1. Add the following plugin:
        ```js
        apply plugin: "com.android.application"
        + apply plugin: "com.facebook.react"
        ```
    1. Add the following additional configurations:
        ```diff
            defaultConfig {
                applicationId "com.awesomeapp"
                minSdkVersion rootProject.ext.minSdkVersion
                targetSdkVersion rootProject.ext.targetSdkVersion
                versionCode 1
                versionName "1.0"

        +        externalNativeBuild {
        +            ndkBuild {
        +                arguments "APP_PLATFORM=android-21",
        +                    "APP_STL=c++_shared",
        +                    "NDK_TOOLCHAIN_VERSION=clang",
        +                    "GENERATED_SRC_DIR=$buildDir/generated/source",
        +                    "PROJECT_BUILD_DIR=$buildDir",
        +                    "REACT_ANDROID_DIR=$rootDir/../node_modules/react-native/ReactAndroid",
        +                    "REACT_ANDROID_BUILD_DIR=$rootDir/../node_modules/react-native/ReactAndroid/build",
        +                    "NODE_MODULES_DIR=$rootDir/../node_modules/"
        +                cFlags "-Wall", "-Werror", "-fexceptions", "-frtti", "-DWITH_INSPECTOR=1"
        +                cppFlags "-std=c++17"
        +                // Make sure this target name is the same you specify inside the
        +                // src/main/jni/Android.mk file for the `LOCAL_MODULE` variable.
        +                targets "awesomeapp_appmodules"
        +            }
        +        }
            }

        +    externalNativeBuild {
        +        ndkBuild {
        +            path "$projectDir/src/main/jni/Android.mk"
        +        }
        +    }
        ```
    1. After the `applicationVariants`, before closing the `android` block, add the following code:
        ```diff
                }
            }
        +    def reactAndroidProjectDir = project(':ReactAndroid').projectDir
        +    def packageReactNdkLibs = tasks.register("packageReactNdkLibs", Copy) {
        +        dependsOn(":ReactAndroid:packageReactNdkLibsForBuck")
        +        from("$reactAndroidProjectDir/src/main/jni/prebuilt/lib")
        +        into("$buildDir/react-ndk/exported")
        +    }
        +
        +    afterEvaluate {
        +        preBuild.dependsOn(packageReactNdkLibs)
        +        configureNdkBuildDebug.dependsOn(preBuild)
        +        configureNdkBuildRelease.dependsOn(preBuild)
        +    }
        +
        +    packagingOptions {
        +        pickFirst '**/libhermes.so'
        +        pickFirst '**/libjsc.so'
        +    }
        }
        ```
    1. Finally, in the `dependencies` block, perform this change:
        ````diff
        implementation fileTree(dir: "libs", include: ["*.jar"])
        //noinspection GradleDynamicVersion
        - implementation "com.facebook.react:react-native:+"  // From node_modules
        + implementation project(":ReactAndroid")  // From node_modules
        ```
1. Create an `AwesomeApp/android/app/src/main/jni/Android.mk` file, with the following content:
    ```makefile
    THIS_DIR := $(call my-dir)

    include $(REACT_ANDROID_DIR)/Android-prebuilt.mk

    # If you wish to add a custom TurboModule or Fabric component in your app you
    # will have to include the following autogenerated makefile.
    # include $(GENERATED_SRC_DIR)/codegen/jni/Android.mk

    include $(CLEAR_VARS)

    LOCAL_PATH := $(THIS_DIR)

    # You can customize the name of your application .so file here.
    LOCAL_MODULE := awesomeapp_appmodules

    LOCAL_C_INCLUDES := $(LOCAL_PATH)
    LOCAL_SRC_FILES := $(wildcard $(LOCAL_PATH)/*.cpp)
    LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)

    # If you wish to add a custom TurboModule or Fabric component in your app you
    # will have to uncomment those lines to include the generated source
    # files from the codegen (placed in $(GENERATED_SRC_DIR)/codegen/jni)
    #
    # LOCAL_C_INCLUDES += $(GENERATED_SRC_DIR)/codegen/jni
    # LOCAL_SRC_FILES += $(wildcard $(GENERATED_SRC_DIR)/codegen/jni/*.cpp)
    # LOCAL_EXPORT_C_INCLUDES += $(GENERATED_SRC_DIR)/codegen/jni

    # Here you should add any native library you wish to depend on.
    LOCAL_SHARED_LIBRARIES := \
    libfabricjni \
    libfbjni \
    libfolly_futures \
    libfolly_json \
    libglog \
    libjsi \
    libreact_codegen_rncore \
    libreact_debug \
    libreact_nativemodule_core \
    libreact_render_componentregistry \
    libreact_render_core \
    libreact_render_debug \
    libreact_render_graphics \
    librrc_view \
    libruntimeexecutor \
    libturbomodulejsijni \
    libyoga

    LOCAL_CFLAGS := -DLOG_TAG=\"ReactNative\" -fexceptions -frtti -std=c++17

    include $(BUILD_SHARED_LIBRARY)

    ```
1. From the `AwesomeApp` folder, run `npx react-native run-android`

**NOTE:** Make sure that the `targets` property in the `externalNativeBuild/ndkBuild` of the `gradle.build` file matches the `LOCAL_MODULE` property of the `Android.mk` file

### <a name="java-tm-delegate" />[[TurboModule Setup] Java - Provide a `ReactPackageTurboModuleManagerDelegate`]()

1. Create a new file `AwesomeApp/android/app/src/main/com/awesomeapp/AppTurboModuleManagerDelegate`
2. Add the following code:
    ```java
    package com.awesomeapp;

    import com.facebook.jni.HybridData;
    import com.facebook.react.ReactPackage;
    import com.facebook.react.ReactPackageTurboModuleManagerDelegate;
    import com.facebook.react.bridge.ReactApplicationContext;
    import com.facebook.soloader.SoLoader;

    import java.util.List;

    public class AppTurboModuleManagerDelegate extends ReactPackageTurboModuleManagerDelegate {

        private static volatile boolean sIsSoLibraryLoaded;

        protected AppTurboModuleManagerDelegate(ReactApplicationContext reactApplicationContext, List<ReactPackage> packages) {
            super(reactApplicationContext, packages);
        }

        protected native HybridData initHybrid();

        public static class Builder extends ReactPackageTurboModuleManagerDelegate.Builder {
            protected AppTurboModuleManagerDelegate build(
                    ReactApplicationContext context, List<ReactPackage> packages) {
                return new AppTurboModuleManagerDelegate(context, packages);
            }
        }

        @Override
        protected synchronized void maybeLoadOtherSoLibraries() {
            // Prevents issues with initializer interruptions.
            if (!sIsSoLibraryLoaded) {
                SoLoader.loadLibrary("awesomeapp_appmodules");
                sIsSoLibraryLoaded = true;
            }
        }
    }
    ```
    **Note:** Make sure that parameter of the `SoLoader.loadLibrary` function in the `maybeLoadOtherSoLibraries` is the same name used in the `LOCAL_MODULE` property of the `Android.mk` file.
1. `npx react-native run-android`

### <a name="java-tm-adapt-host" /> [[TurboModule Setup] Adapt your ReactNativeHost to use the `ReactPackageTurboModuleManagerDelegate`]()

1. Open the `AwesomeApp/android/app/src/main/MainApplication.java` file
1. Add the imports:
    ```java
    import androidx.annotation.NonNull;
    import com.facebook.react.ReactPackageTurboModuleManagerDelegate;
    ```
1. After the `getJSMainModuleName()` method, within the `ReactNativeHost` construction, add the following method:
    ```java
    @NonNull
    @Override
    protected ReactPackageTurboModuleManagerDelegate.Builder getReactPackageTurboModuleManagerDelegateBuilder() {
        return new AppTurboModuleManagerDelegate.Builder();
    }
    ```
1. `npx react-native run-android`

### <a name="java-tm-extend-package">[[TurboModule Setup] Extend the `getPackages()` from your ReactNativeHost to use the TurboModule]()

1. Open the `AwesomeApp/android/app/src/main/MainApplication.java` file
1. Update the `getPackages()` method with the following code:
    ```diff
        protected List<ReactPackage> getPackages() {
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();

    +        packages.add(new TurboReactPackage() {
    +            @Nullable
    +            @Override
    +            public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    +                    return null;
    +            }
    +
    +            @Override
    +            public ReactModuleInfoProvider getReactModuleInfoProvider() {
    +                return () -> {
    +                    final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
    +                    return moduleInfos;
    +                };
    +            }
    +        });
            return packages;
    }
    ```
    The `getModule(String, ReactApplicationContext)` will return the `NativeModule`related to your TurboModule; the `getReactModuleInfoProvider` will return the additional infoes required by the module. At the moment, we don't have any TurboModule ready to be plugged in, so let's keep them empty.
1. `npx react-native run-android`
