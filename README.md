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
        * [[TurboModule Setup] C++ Provide a native implementation for the methods in your *TurboModuleDelegate class](#cpp-tm-manager)
            * [AppTurboModuleManagerDelegate.h](#appturbomodulemanagerdelegateh)
            * [AppTurboModuleManagerDelegate.cpp](#appturbomodulemanagerdelegatecpp)
            * [AppModuleProvider.h](#appmoduleproviderh)
            * [AppModuleProvider.cpp](#appmoduleprovidercpp)
            * [OnLoad.cpp](#onloadcpp)
        * [[TurboModule Setup] Enable the useTurboModules flag in your Application onCreate](#enable-tm-android)
    * iOS
        * [[TurboModule Setup] Provide a TurboModuleManager Delegate](#ios-tm-manager-delegate)
        * [[TurboModule Setup] Install TurboModuleManager JavaScript Bindings](#ios-tm-js-bindings)
        * [[TurboModule Setup] Enable TurboModule System - iOS](#ios-enable-tm)
* Fabric Setup
    * Android
        * [[Fabric Setup] Provide a `JSIModulePackage` inside your `ReactNativeHost`](#jsimodpackage-in-rnhost)
        * [[Fabric Setup] Call `setIsFabric` on your Activity’s `ReactRootView`](#set-is-fabric)
    * iOS
        * [[Fabric Setup] Enable Fabric in Podfile](#fabric-podfile)
        * [[Fabric Setup] Update your root view](#fabric-root-view)
        * [[Fabric Setup] Cleanup and run the app](#fabric-run)
* Pillars
    * [[Pillars] Setup library](#pillar-setup)
    * TurboModule
        * [[TurboModule] Create Flow Spec](#tm-flow-spec)
        * [[TurboModule] Setup Codegen - Android](#tm-codegen-android)
        * [[TurboModule] Setup Codegen - iOS](#tm-codegen-ios)
        * [[TurboModule] Setup podspec file](#tm-podspec-ios)
        * [[TurboModule] Create Android Implementation](#tm-android)
        * [[TurboModule] Create iOS Implementation](#tm-ios)
        * [[TurboModule] Setup Android Autolinking](#tm-autolinking)
        * [[TurboModule] Test the TurboModule](#tm-test)
    * Fabric Components
        * [[Fabric Component] Create Flow Spec](#fc-flow-spec)
        * [[Fabric Component] Update Codegen - iOS](#fc-codegen-ios)
        * [[Fabric Component] Add Android Implementation](#fc-android)
        * [[Fabric Component] Add iOS Implementation](#fc-ios)
        * [[Fabric Component] Setup Android Autolinking](#fc-autolinking)
        * [[Fabric Component] Test the Fabric Component](#fc-test)

## Steps

### <a name="setup" />[[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`](https://github.com/react-native-community/RNNewArchitectureApp/commit/0b9fa68fb59db11eb49567644316def2ffcdd6e8)

1. `npx react-native init AwesomeApp --version 0.67.4`
2. `cd AwesomeApp`
3. `npx react-native start` (in another terminal)
4. `npx react-native run-ios`
5. `npx react-native run-android`

### <a name="move-to-0.68" />[[Migration] Upgrade to 0.68](https://github.com/react-native-community/RNNewArchitectureApp/commit/cb23435f8fabc5657953811a436a722f12d383c5)

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

### <a name="install-codegen" />[[Migration] Install react-native-codegen](https://github.com/react-native-community/RNNewArchitectureApp/commit/f8e7990c85c3a42fafddfa1dfdb19b715274bd80)

* `yarn add react-native-codegen`
* `npx react-native run-ios && npx react-native run-android`

### <a name="android-setup" />[[Android Setup] Configure Gradle for CodeGen](https://github.com/react-native-community/RNNewArchitectureApp/commit/e46f97de31c2f70705f9ac1ca30f780c4133ef1d)

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

### <a name="hermes-android" />[[Hermes] Use Hermes - Android](https://github.com/react-native-community/RNNewArchitectureApp/commit/a4e1ea687eb3a5c97f2a8610b5e4b1a75cf7eb9a)

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

### <a name="hermes-ios" />[[Hermes] Use Hermes - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/e639039190e80fd41d01217ffe713719767d7cd7)

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

### <a name="configure-cpp17">[[C++ iOS] iOS: Enable C++17 language feature support](https://github.com/react-native-community/RNNewArchitectureApp/commit/12062df562677b0412a3d870d57a266dde425320)

* Open the `AwesomeApp/ios/AwesomeApp.xcworkspace` inn Xcode
* In the `Project Navigator`, select the AwesomeApp Project.
* In the Project panel, select the `AwesomeApp` project (not the one in the `Target` panel)
* Select the `Build Settings` tab
* Filter for `CLANG_CXX_LANGUAGE_STANDARD` and update it to `c++17`
* Run the app `npx react-native run-ios`

### <a name="configure-objcpp">[[C++ iOS] iOS: Use Objective-C++ (.mm extension)](https://github.com/react-native-community/RNNewArchitectureApp/commit/3a5a17a742b18144b6c5e2d9814ca20af4d92700)

1. Open the `AwesomeApp/ios/AwesomeApp.xcworkspace` in Xcode
1. Rename all the `.m` files to `.mm`:
    1. `main.m` will be renamed to `main.mm`
    1. `AppDelegate.m` will be renamed to `AppDelegate.mm`
1. Run `npx react-native run-ios`

**Note:** Renaming files in Xcode also updates the `xcodeproj` file automatically.

### <a name="ios-tm" /> [[TurboModule Setup] iOS: TurboModules: Ensure your App Provides an `RCTCxxBridgeDelegate`](https://github.com/react-native-community/RNNewArchitectureApp/commit/70518279b54b47a9e1dd202ab9b389ca5de7751c)

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

### <a name="turbomodule-ndk" />[[TurboModule Setup] Android: Enable NDK and the native build](https://github.com/react-native-community/RNNewArchitectureApp/commit/80e8c524419136f72dfb929b811f761771868768)

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

### <a name="java-tm-delegate" />[[TurboModule Setup] Java - Provide a `ReactPackageTurboModuleManagerDelegate`](https://github.com/react-native-community/RNNewArchitectureApp/commit/27220341ca492ed022d84e2d6c97b5827b13396d)

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

### <a name="java-tm-adapt-host" /> [[TurboModule Setup] Adapt your ReactNativeHost to use the `ReactPackageTurboModuleManagerDelegate`](https://github.com/react-native-community/RNNewArchitectureApp/commit/1c4913502eafd6d2dae4b0ec8e9413d2b13ea33d)

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

### <a name="java-tm-extend-package">[[TurboModule Setup] Extend the `getPackages()` from your ReactNativeHost to use the TurboModule](https://github.com/react-native-community/RNNewArchitectureApp/commit/df733542b62f05f0323e5aad28279c42cacca1d4)

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

### <a name="cpp-tm-manager" />[[TurboModule Setup] C++ Provide a native implementation for the methods in your *TurboModuleDelegate class](https://github.com/react-native-community/RNNewArchitectureApp/commit/29ae65ce347d3c9316d4f078ece2b0d510823331)

Referring to [this step](https://reactnative.dev/docs/new-architecture-app-modules-android#5-c-provide-a-native-implementation-for-the-methods-in-your-turbomoduledelegate-class), we now have to add a few files in the `AwesomeApp/android/app/src/main/jni` folder:

1. `AppTurboModuleManagerDelegate.h`
1. `AppTurboModuleManagerDelegate.cpp`
1. `AppModuleProvider.h`
1. `AppModuleProvider.cpp`
1. `OnLoad.cpp`

#### AppTurboModuleManagerDelegate.h

1. Create the `AppTurboModuleManagerDelegate.h` file in the `AwesomeApp/android/app/src/main/jni` folder
1. Add this code:
    ```c++
    #include <memory>
    #include <string>

    #include <ReactCommon/TurboModuleManagerDelegate.h>
    #include <fbjni/fbjni.h>

    namespace facebook {
    namespace react {

    class AppTurboModuleManagerDelegate : public jni::HybridClass<AppTurboModuleManagerDelegate, TurboModuleManagerDelegate> {
    public:
    // Adapt it to the package you used for your Java class.
    static constexpr auto kJavaDescriptor =
        "Lcom/awesomeapp/AppTurboModuleManagerDelegate;";

    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject>);

    static void registerNatives();

    std::shared_ptr<TurboModule> getTurboModule(const std::string name, const std::shared_ptr<CallInvoker> jsInvoker) override;
    std::shared_ptr<TurboModule> getTurboModule(const std::string name, const JavaTurboModule::InitParams &params) override;

    private:
    friend HybridBase;
    using HybridBase::HybridBase;

    };

    } // namespace react
    } // namespace facebook
    ```

#### AppTurboModuleManagerDelegate.cpp

1. Create the `AppTurboModuleManagerDelegate.h` file in the `AwesomeApp/android/app/src/main/jni` folder
1. Add this code:
    ```c++
    #include "AppTurboModuleManagerDelegate.h"
    #include "AppModuleProvider.h"

    namespace facebook {
    namespace react {

    jni::local_ref<AppTurboModuleManagerDelegate::jhybriddata> AppTurboModuleManagerDelegate::initHybrid(
        jni::alias_ref<jhybridobject>
    ) {
        return makeCxxInstance();
    }

    void AppTurboModuleManagerDelegate::registerNatives() {
        registerHybrid({
            makeNativeMethod("initHybrid", AppTurboModuleManagerDelegate::initHybrid),
        });
    }

    std::shared_ptr<TurboModule> AppTurboModuleManagerDelegate::getTurboModule(
        const std::string name,
        const std::shared_ptr<CallInvoker> jsInvoker
    ) {
        // Not implemented yet: provide pure-C++ NativeModules here.
        return nullptr;
    }

    std::shared_ptr<TurboModule> AppTurboModuleManagerDelegate::getTurboModule(
        const std::string name,
        const JavaTurboModule::InitParams &params
    ) {
        return AppModuleProvider(name, params);
    }

    } // namespace react
    } // namespace facebook
    ```

#### AppModuleProvider.h

1. Create the `AppModuleProvider.h` file in the `AwesomeApp/android/app/src/main/jni` folder
1. Add the following code:
    ```c++
    #pragma once

    #include <memory>
    #include <string>

    #include <ReactCommon/JavaTurboModule.h>

    namespace facebook {
    namespace react {

    std::shared_ptr<TurboModule> AppModuleProvider(const std::string moduleName, const JavaTurboModule::InitParams &params);

    } // namespace react
    } // namespace facebook
    ```

#### AppModuleProvider.cpp

1. Create the `AppModuleProvider.cpp` file in the `AwesomeApp/android/app/src/main/jni` folder
1. Add the following code:
    ```c++
    #include "AppModuleProvider.h"

    #include <rncore.h>
    // Add the include of the TurboModule

    namespace facebook {
    namespace react {

    std::shared_ptr<TurboModule> AppModuleProvider(const std::string moduleName, const JavaTurboModule::InitParams &params) {
        // Uncomment this for your TurboModule
        // auto module = samplelibrary_ModuleProvider(moduleName, params);
        // if (module != nullptr) {
        //   return module;
        // }

        return rncore_ModuleProvider(moduleName, params);
    }

    } // namespace react
    } // namespace facebook
    ```

#### OnLoad.cpp

1. Create the `OnLoad.cpp` file in the `AwesomeApp/android/app/src/main/jni` folder
1. Add the following code:
    ```c++
    #include <fbjni/fbjni.h>
    #include "AppTurboModuleManagerDelegate.h"

    JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
    return facebook::jni::initialize(vm, [] {
        facebook::react::AppTurboModuleManagerDelegate::registerNatives();
    });
    }
    ```

Finally, run `npx react-native run-android` to make sure that everything builds properly.

### <a name="enable-tm-android" />[[TurboModule Setup] Enable the useTurboModules flag in your Application onCreate](https://github.com/react-native-community/RNNewArchitectureApp/commit/b91e14047a85ae0879f92e415c0103e9c88ad362)

* Open the `AwesomeApp/android/app/src/main/java/com/awesomeapp/MainApplication.java` file
* Add the import for the feature flags
    ```diff
    import com.facebook.react.ReactPackage;
    + import com.facebook.react.config.ReactFeatureFlags;
    import com.facebook.soloader.SoLoader;
    ```
* Modify the `OnCreate` file as it follows:
    ```diff
        @Override
        public void onCreate() {
            super.onCreate();
    +        ReactFeatureFlags.useTurboModules = true;
            SoLoader.init(this, /* native exopackage */ false);
            initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
        }
    ```
* Run `npx react-native run-android`

### <a name="ios-tm-manager-delegate" />[[TurboModule Setup] Provide a TurboModuleManager Delegate](https://github.com/react-native-community/RNNewArchitectureApp/commit/c0679a231e171884babe3941fa53bf4843dd0c36)

1. Open the `AwesomeApp/ios/AwesomeApp/AppDelegate.mm`
1. Add the following imports:
    ```objc
    #import <ReactCommon/RCTTurboModuleManager.h>
    #import <React/CoreModulesPlugins.h>

    #import <React/RCTDataRequestHandler.h>
    #import <React/RCTHTTPRequestHandler.h>
    #import <React/RCTFileRequestHandler.h>
    #import <React/RCTNetworking.h>
    #import <React/RCTImageLoader.h>
    #import <React/RCTGIFImageDecoder.h>
    #import <React/RCTLocalAssetImageLoader.h>
    ```
1. Add the following code in the `@interface`
    ```objc
    @interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
        // ...
        RCTTurboModuleManager *_turboModuleManager;
    }
    @end
    ```
1. Implement the `getModuleClassFromName`:
    ```c++
    #pragma mark RCTTurboModuleManagerDelegate

    - (Class)getModuleClassFromName:(const char *)name
    {
    return RCTCoreModulesClassProvider(name);
    }
    ```
1. Implement the `(std::shared_ptr<facebook::react::TurboModule>) getTurboModule:(const std::string &)name jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker`:
    ```c++
    - (std::shared_ptr<facebook::react::TurboModule>)
        getTurboModule:(const std::string &)name
             jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker {
        return nullptr;
    }
    ```
1. Implement the `(id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass` method:
    ```c++
    - (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
    {
        // Set up the default RCTImageLoader and RCTNetworking modules.
        if (moduleClass == RCTImageLoader.class) {
            return [[moduleClass alloc] initWithRedirectDelegate:nil
                loadersProvider:^NSArray<id<RCTImageURLLoader>> *(RCTModuleRegistry * moduleRegistry) {
                return @ [[RCTLocalAssetImageLoader new]];
                }
                decodersProvider:^NSArray<id<RCTImageDataDecoder>> *(RCTModuleRegistry * moduleRegistry) {
                return @ [[RCTGIFImageDecoder new]];
                }];
        } else if (moduleClass == RCTNetworking.class) {
            return [[moduleClass alloc]
                initWithHandlersProvider:^NSArray<id<RCTURLRequestHandler>> *(
                    RCTModuleRegistry *moduleRegistry) {
                return @[
                    [RCTHTTPRequestHandler new],
                    [RCTDataRequestHandler new],
                    [RCTFileRequestHandler new],
                ];
                }];
        }
        // No custom initializer here.
        return [moduleClass new];
    }
    ```
1. Run `npx react-native run-ios`

### <a name="ios-tm-js-bindings" />[[TurboModule Setup] Install TurboModuleManager JavaScript Bindings](https://github.com/react-native-community/RNNewArchitectureApp/commit/3a30801bf2887bb5cdc4dbf0716d0d94107ebbb7)

1. Open the `AwesomeApp/ios/AwesomeApp/AppDelegate.mm`
1. Update the `- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)` method:
    ```c++
    - (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
    {
    // Add these lines to create a TurboModuleManager
    if (RCTTurboModuleEnabled()) {
        _turboModuleManager =
            [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                delegate:self
                                                jsInvoker:bridge.jsCallInvoker];

        // Necessary to allow NativeModules to lookup TurboModules
        [bridge setRCTTurboModuleRegistry:_turboModuleManager];

        if (!RCTTurboModuleEagerInitEnabled()) {
        /**
        * Instantiating DevMenu has the side-effect of registering
        * shortcuts for CMD + d, CMD + i,  and CMD + n via RCTDevMenu.
        * Therefore, when TurboModules are enabled, we must manually create this
        * NativeModule.
        */
        [_turboModuleManager moduleForName:"DevMenu"];
        }
    }

    // Add this line...
    __weak __typeof(self) weakSelf = self;

    // If you want to use the `JSCExecutorFactory`, remember to add the `#import <React/JSCExecutorFactory.h>`
    // import statement on top.
    return std::make_unique<facebook::react::HermesExecutorFactory>(
        facebook::react::RCTJSIExecutorRuntimeInstaller([weakSelf, bridge](facebook::jsi::Runtime &runtime) {
        if (!bridge) {
            return;
        }

        // And add these lines to install the bindings...
        __typeof(self) strongSelf = weakSelf;
        if (strongSelf) {
            facebook::react::RuntimeExecutor syncRuntimeExecutor =
                [&](std::function<void(facebook::jsi::Runtime & runtime_)> &&callback) { callback(runtime); };
            [strongSelf->_turboModuleManager installJSBindingWithRuntimeExecutor:syncRuntimeExecutor];
        }
        }));
    }
    ```

### <a name="ios-enable-tm" />[[TurboModule Setup] Enable TurboModule System - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/e346c5de6c9ccd03f43237c0e08cdb1342d30eef)

1. Open the `AwesomeApp/ios/AwesomeApp/AppDelegate.mm`
1. Update the `(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method
    ```diff
        - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
        {
    +       RCTEnableTurboModule(YES);

            RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self
                                                      launchOptions:launchOptions];
    ```
1. Run `npx react-native run-ios`

### <a name="jsimodpackage-in-rnhost" />[[Fabric Setup] Provide a `JSIModulePackage` inside your `ReactNativeHost`](https://github.com/react-native-community/RNNewArchitectureApp/commit/77974c1d9b9cd97324a8d10f264bce60a2540c26)

1. Open `AwesomeApp/android/app/src/main/java/com/awesomeapp/MainApplication.java`
1. Add the imports:
    ```java
    import androidx.annotation.Nullable;
    import com.facebook.react.bridge.JSIModulePackage;
    import com.facebook.react.bridge.JSIModuleProvider;
    import com.facebook.react.bridge.JSIModuleSpec;
    import com.facebook.react.bridge.JSIModuleType;
    import com.facebook.react.bridge.JavaScriptContextHolder;
    import com.facebook.react.bridge.ReactApplicationContext;
    import com.facebook.react.bridge.UIManager;
    import com.facebook.react.fabric.ComponentFactory;
    import com.facebook.react.fabric.CoreComponentsRegistry;
    import com.facebook.react.fabric.FabricJSIModuleProvider;
    import com.facebook.react.fabric.EmptyReactNativeConfig;
    import com.facebook.react.uimanager.ViewManagerRegistry;
    import java.util.ArrayList;
    ```
1. Update the `ReactNativeHost` with this new method:
    ```java
    @Nullable
    @Override
    protected JSIModulePackage getJSIModulePackage() {
        return new JSIModulePackage() {
            @Override
            public List<JSIModuleSpec> getJSIModules(
                final ReactApplicationContext reactApplicationContext,
                final JavaScriptContextHolder jsContext) {
                    final List<JSIModuleSpec> specs = new ArrayList<>();
                    specs.add(new JSIModuleSpec() {
                        @Override
                        public JSIModuleType getJSIModuleType() {
                        return JSIModuleType.UIManager;
                        }

                        @Override
                        public JSIModuleProvider<UIManager> getJSIModuleProvider() {
                        final ComponentFactory componentFactory = new ComponentFactory();
                        CoreComponentsRegistry.register(componentFactory);
                        final ReactInstanceManager reactInstanceManager = getReactInstanceManager();

                        ViewManagerRegistry viewManagerRegistry =
                            new ViewManagerRegistry(
                                reactInstanceManager.getOrCreateViewManagers(
                                    reactApplicationContext));

                        return new FabricJSIModuleProvider(
                            reactApplicationContext,
                            componentFactory,
                            new EmptyReactNativeConfig(),
                            viewManagerRegistry);
                        }
                    });
                    return specs;
            }
        };
    }
    ```
1. Run `npx react-native run-android`

### <a name="set-is-fabric">[[Fabric Setup] Call `setIsFabric` on your Activity’s `ReactRootView`](https://github.com/react-native-community/RNNewArchitectureApp/commit/10e8d00ddf7ec3b72c4cb3361c688fd1aa67dd54)

1. Open `AwesomeApp/android/app/src/main/java/com/awesomeapp/MainActivity.java`
1. Add the following imports:
    ```java
    import com.facebook.react.ReactActivityDelegate;
    import com.facebook.react.ReactRootView;
    ```
1. Add the `MainActivityDelegate` within the `MainActivity` class:
    ```java
    public class MainActivity extends ReactActivity {

        // Add the Activity Delegate, if you don't have one already.
        public static class MainActivityDelegate extends ReactActivityDelegate {

            public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
            }

            @Override
            protected ReactRootView createRootView() {
            ReactRootView reactRootView = new ReactRootView(getContext());
            reactRootView.setIsFabric(true);
            return reactRootView;
            }
        }

        // Make sure to override the `createReactActivityDelegate()` method.
        @Override
        protected ReactActivityDelegate createReactActivityDelegate() {
            return new MainActivityDelegate(this, getMainComponentName());
        }
    }
    ```
1. Run  `npx react-native run-android`

### <a name="fabric-podfile" />[[Fabric Setup] Enable Fabric in Podfile](https://github.com/react-native-community/RNNewArchitectureApp/commit/96d45f5e30654c31f33b1f17c22cc6d1e2964ad2)

1. Open the `AwesomeApp/ios/Podfile` and modify it as it follows:
    ```diff
    platform :ios, '11.0'
    + install! 'cocoapods', :deterministic_uuids => false
    target 'AwesomeApp' do
        config = use_native_modules!

        use_react_native!(
            :path => config[:reactNativePath],
    +       # Modify here if your app root path isn't the same as this one.
    +       :app_path => "#{Dir.pwd}/..",
    +       # Pass the flag to enable fabric to use_react_native!.
    +       :fabric_enabled => true,
            # to enable hermes on iOS, change `false` to `true` and then install pods
            :hermes_enabled => true
        )
    ```

### <a name="fabric-root-view" />[[Fabric Setup] Update your root view](https://github.com/react-native-community/RNNewArchitectureApp/commit/04f5fc25433e19ac4ed188763b4b5728edbe1e29)

1. Open the `AwesomeApp/ios/AwesomeApp/AppDelegate.mm` file.
1. Add the following `imports`:
    ```objective-c
    #import <React/RCTFabricSurfaceHostingProxyRootView.h>
    #import <React/RCTSurfacePresenter.h>
    #import <React/RCTSurfacePresenterBridgeAdapter.h>
    #import <react/config/ReactNativeConfig.h>
    ```
1. Add the following properties in the `AppDelegate` interface:
    ```diff
    @interface AppDelegate () <RCTCxxBridgeDelegate,
                           RCTTurboModuleManagerDelegate> {

    +   RCTSurfacePresenterBridgeAdapter *_bridgeAdapter;
    +   std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
    +   facebook::react::ContextContainer::Shared _contextContainer;
    @end
    ```
1. Update the `rootView` property as it follows:
    ```diff
    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    - RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"AwesomeApp"
                                            initialProperties:nil];
    + _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
    + _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();

    + _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);

    + _bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc]
            initWithBridge:bridge
          contextContainer:_contextContainer];

    + bridge.surfacePresenter = _bridgeAdapter.surfacePresenter;

    + UIView *rootView = [[RCTFabricSurfaceHostingProxyRootView alloc] initWithBridge:bridge
                                                                           moduleName:@"AwesomeApp"
                                                 initialProperties:@{}];
    ```

### <a name="fabric-run" />[[Fabric Setup] Add Babel plugin and run the app](https://github.com/react-native-community/RNNewArchitectureApp/commit/929f13b59ec9157460f611a762d84e8d462d432f)

1. Open the `babel.config.js`:
1. Add the `plugin` property after the `preset` one:
    ```diff
    module.exports = {
        presets: ['module:metro-react-native-babel-preset'],
    +    plugins: [
    +        '@babel/plugin-proposal-class-properties',
    +        './node_modules/@react-native/babel-plugin-codegen'
    +    ]
    };
    ```
1. Remove generated files by running `cd ios && rm -rf Pods Podfile.lock build`
1. Run `RCT_NEW_ARCH_ENABLED=1 pod install`
1. `cd .. && npx react-native run-ios`

### <a name="pillar-setup" /> [[Pillars] Setup library](https://github.com/react-native-community/RNNewArchitectureApp/commit/94e69c24974500d9238c6f9cd021728ff0a2535d)

1. Create a folder at the same level of `AwesomeApp` and call it `library`.
1. Create a `package.json` file and add the following code:
    ```json
    {
    "name": "library",
    "version": "0.0.1",
    "description": "Turbomodule and Fabric component",
    "react-native": "src/index",
    "source": "src/index",
    "files": [
        "src",
        "android",
        "ios",
        "library.podspec",
        "!android/build",
        "!ios/build",
        "!**/__tests__",
        "!**/__fixtures__",
        "!**/__mocks__"
    ],
    "keywords": ["react-native", "ios", "android"],
    "repository": "https://github.com/<your_github_handle>/library",
    "author": "<Your Name> <your_email@your_provider.com> (https://github.com/<your_github_handle>)",
    "license": "MIT",
    "bugs": {
        "url": "https://github.com/<your_github_handle>/library/issues"
    },
    "homepage": "https://github.com/<your_github_handle>/library#readme",
    "devDependencies": {},
    "peerDependencies": {
        "react": "*",
        "react-native": "*"
    }
    ```

### <a name="tm-flow-spec" />[[TurboModule] Create Flow Spec](https://github.com/react-native-community/RNNewArchitectureApp/commit/d0d8d72b1638d7469eec9196eea2a3e0298710ac)

1. Create a new folder `library/src`
1. Create a new file `library/src/NativeCalculator.js` with this code:
    ```ts
    // @flow
    import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
    import { TurboModuleRegistry } from 'react-native';

    export interface Spec extends TurboModule {
        // your module methods go here, for example:
        add(a: number, b: number): Promise<number>;
    }
    export default (TurboModuleRegistry.get<Spec>(
        'Calculator'
    ): ?Spec);
    ```

### <a name="tm-codegen-android">[[TurboModule] Setup Codegen - Android](https://github.com/react-native-community/RNNewArchitectureApp/commit/c3a484ff6738b9683052a6cd40cc0bb00d78cb44)

1. In the `library` folder, create an `android` folder
1. Create an `android.build` gradle file and add the following code:
    ```js
    buildscript {
        ext.safeExtGet = {prop, fallback ->
            rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
        }
        repositories {
            google()
            gradlePluginPortal()
        }
        dependencies {
            classpath("com.android.tools.build:gradle:7.0.4")
        }
    }

    apply plugin: 'com.android.library'
    apply plugin: 'com.facebook.react'

    android {
        compileSdkVersion safeExtGet('compileSdkVersion', 31)

        defaultConfig {
            minSdkVersion safeExtGet('minSdkVersion', 21)
            targetSdkVersion safeExtGet('targetSdkVersion', 31)
        }
    }

    repositories {
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$projectDir/../node_modules/react-native/android"
        }
        mavenCentral()
        google()
    }

    dependencies {
        implementation(project(":ReactAndroid"))
    }

    react {
        jsRootDir = file("../src/")
        libraryName = "library"
        codegenJavaPackageName = "com.library"
    }
    ```

### <a name="tm-codegen-ios">[[TurboModule] Setup Codegen - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/cb64aef5c4d8a783c3313021162c716c55533e30)


1. Open the `library/package.json` file
1. Add the following code at the end of the file:
    ```json
    ,
    "codegenConfig": {
        "libraries": [
            {
            "name": "RNCalculatorSpec",
            "type": "modules",
            "jsSrcsDir": "src"
            }
        ]
    }
    ```

### <a name="tm-podspec-ios">[[TurboModule] Setup podspec file](https://github.com/react-native-community/RNNewArchitectureApp/commit/6ddf15793172ef32901fe2100c8bb5cba3cd7e78)

1. Create a `library/library.podspec` file with this code:
    ```ruby
    require "json"

    package = JSON.parse(File.read(File.join(__dir__, "package.json")))

    folly_version = '2021.06.28.00-v2'
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    Pod::Spec.new do |s|
        s.name            = "library"
        s.version         = package["version"]
        s.summary         = package["description"]
        s.description     = package["description"]
        s.homepage        = package["homepage"]
        s.license         = package["license"]
        s.platforms       = { :ios => "11.0" }
        s.author          = package["author"]
        s.source          = { :git => package["repository"], :tag => "#{s.version}" }

        s.source_files    = "ios/**/*.{h,m,mm,swift}"

        s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
        s.pod_target_xcconfig    = {
            "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
            "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
        }

        s.dependency "React-Core"
        s.dependency "React-Codegen"
        s.dependency "RCT-Folly", folly_version
        s.dependency "RCTRequired"
        s.dependency "RCTTypeSafety"
        s.dependency "ReactCommon/turbomodule/core"
    end
    ```

### <a name="tm-android"/>[[TurboModule] Create Android Implementation](https://github.com/react-native-community/RNNewArchitectureApp/commit/b44247ccab3255fe0a14308191c376fe4a8d89c7)

1. Create the following file `library/android/src/main/AndroidManifest.xml`:
    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android"
        package="com.library">
    </manifest>
    ```
1. Create the `CalculatorModule` file at the path `library/android/src/main/java/com/library/CalculatorModule.java`:
    ```java
    package com.library;

    import com.facebook.react.bridge.NativeModule;
    import com.facebook.react.bridge.Promise;
    import com.facebook.react.bridge.ReactApplicationContext;
    import com.facebook.react.bridge.ReactContext;
    import com.facebook.react.bridge.ReactContextBaseJavaModule;
    import com.facebook.react.bridge.ReactMethod;
    import java.util.Map;
    import java.util.HashMap;

    public class CalculatorModule extends NativeCalculatorSpec {
        public static final String NAME = "Calculator";

        CalculatorModule(ReactApplicationContext context) {
            super(context);
        }

        @Override
        public String getName() {
            return NAME;
        }

        @ReactMethod
        public void add(double a, double b, Promise promise) {
            promise.resolve(a + b);
        }
    }
    ```
1. Create the `LibraryPackage.java` at `library/android/src/main/java/com/library/LibraryPackage.java`:
    ```java
    package com.library;

    import androidx.annotation.Nullable;

    import com.facebook.react.bridge.NativeModule;
    import com.facebook.react.bridge.ReactApplicationContext;
    import com.facebook.react.module.model.ReactModuleInfo;
    import com.facebook.react.module.model.ReactModuleInfoProvider;
    import com.facebook.react.TurboReactPackage;
    import com.facebook.react.uimanager.ViewManager;

    import java.util.ArrayList;
    import java.util.Collections;
    import java.util.List;
    import java.util.Map;
    import java.util.HashMap;

    public class LibraryPackage extends TurboReactPackage {

        @Nullable
        @Override
        public NativeModule getModule(String name, ReactApplicationContext reactContext) {
            if (name.equals(CalculatorModule.NAME)) {
                return new CalculatorModule(reactContext);
            } else {
                return null;
            }
        }

        @Override
        public ReactModuleInfoProvider getReactModuleInfoProvider() {
            return () -> {
                final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
                moduleInfos.put(
                        CalculatorModule.NAME,
                        new ReactModuleInfo(
                                CalculatorModule.NAME,
                                CalculatorModule.NAME,
                                false, // canOverrideExistingModule
                                false, // needsEagerInit
                                true, // hasConstants
                                false, // isCxxModule
                                true // isTurboModule
                ));
                return moduleInfos;
            };
        }
    }
    ```
### <a name="tm-ios"/>[[TurboModule] Create iOS Implementation](https://github.com/react-native-community/RNNewArchitectureApp/commit/feac8db541776634bba1da8816f9b694c57b9d19)

1. In the `library/ios` folder, create a new static library with Xcode, called `RNLibrary`
1. Move the `xcodeproj` up of 1 folder, and the content of RNLibrary up of 1 folder. The final layout of the iOS folder should be this one:
    ```
    library
    '-> ios
        '-> RNLibrary
            '-> RNLibrary.h
            '-> RNLibrary.m
        '-> RNLibrary.xcodeproj
    ```
1. In Xcode, create a new CocoaTouch class called `RNCalculator`.
1. Rename the `RNCalculator.m` into `RNCalculator.mm`
1. Replace the `RNCalculator.h` with the following code:
    ```obj-c
    #import <React/RCTBridgeModule.h>

    @interface RNCalculator : NSObject <RCTBridgeModule>

    @end
    ```
1. Replcase the `RNCalculator.mm` with the following code:
    ```obj-c
    #import "RNCalculator.h"
    #import "RNCalculatorSpec.h"

    @implementation RNCalculator

    RCT_EXPORT_MODULE(Calculator)

    RCT_REMAP_METHOD(add, addA:(NSInteger)a
                            andB:(NSInteger)b
                    withResolver:(RCTPromiseResolveBlock) resolve
                    withRejecter:(RCTPromiseRejectBlock) reject)
    {
        NSNumber *result = [[NSNumber alloc] initWithInteger:a+b];
        resolve(result);
    }

    - (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
        (const facebook::react::ObjCTurboModule::InitParams &)params
    {
        return std::make_shared<facebook::react::NativeCalculatorSpecJSI>(params);
    }
    @end
    ```
### <a name="tm-autolinking"/>[[TurboModule] Setup Android Autolinking](https://github.com/react-native-community/RNNewArchitectureApp/commit/50fa513c6874fab54ce16982fe9a19c448d5d3d3)

1. Open the `AweseomeApp/android/app/src/main/jni/Android.mk` and update it as it follows:
    1. Include the library's `Android.mk`
        ```diff
        # include $(GENERATED_SRC_DIR)/codegen/jni/Android.mk

        + include $(NODE_MODULES_DIR)/library/android/build/generated/source/codegen/jni/Android.mk
        include $(CLEAR_VARS)
        ```
    1. Add the library to the `LOCAL_SHARED_LIBS`
        ```diff
        libreact_codegen_rncore \
        + libreact_codegen_library \
        libreact_debug \
1. Open the `AwesomeApp/android/app/src/main/jni/AppModuleProvider.cpp`:
    1. Add the import `#include <library.h>`
    1. Add the following code in the `AppModuleProvider` constructor:
        ```diff
            // auto module = samplelibrary_ModuleProvider(moduleName, params);
            // if (module != nullptr) {
            //    return module;
            // }

        +    auto module = library_ModuleProvider(moduleName, params);
        +    if (module != nullptr) {
        +        return module;
        +    }

            return rncore_ModuleProvider(moduleName, params);
        }
        ```

### <a name="tm-test" />[[TurboModule] Test the TurboModule](https://github.com/react-native-community/RNNewArchitectureApp/commit/871c17f7d18747dc46313229d604a17803e30348)

1. Navigate to the `AwesomeApp` folder.
1. Run `yarn add ../library`
1. Run `rm -rf ios/Pods ios/Podfile.lock ios/build`
1. Run `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`
1. Run `open AwesomeApp.xcworkspace`
1. Clean the project with `cmd + shift + k` (This step is required to clean the cache from previous builds)
1. Run `cd .. && npx react-native run-ios`
1. Open the `AwesomeApp/App.js` file and replace the content with:
    ```ts
    /**
     * Sample React Native App
    * https://github.com/facebook/react-native
    *
    * @format
    * @flow strict-local
    */

    import React from 'react';
    import {useState} from "react";
    import type {Node} from 'react';
    import {
    SafeAreaView,
    StatusBar,
    Text,
    Button,
    View,
    } from 'react-native';
    import Calculator from 'library/src/NativeCalculator';

    const App: () => Node = () => {

    const [result, setResult] = useState<number | null>(null);

    async function onPress() {
        const newResult = await Calculator?.add(3,7);
        setResult(newResult ?? null);
    }
    return (
        <SafeAreaView>
        <StatusBar barStyle={'dark-content'} />
        <Text style={{ "margin":20 }}>3+7={result ?? "??"}</Text>
        <Button title="Compute" onPress={onPress} />
        </SafeAreaView>
    );
    };

    export default App;
    ```
1. Press on `Compute`, to see the app working on iOS.
1. From the terminal, run `npx react-native run-android`.
1. Press on `Compute`, to see the app working also on Android.

### <a name="fc-flow-spec"/>[[Fabric Component] Create Flow Spec](https://github.com/react-native-community/RNNewArchitectureApp/commit/ded3dcf8772be6672dfb7bb21b35a4264cd557a2)

1. Create a new file `library/src/ColoredViewNativeComponent.js` with this code:
    ```ts
    // @flow
    import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
    import type {HostComponent} from 'react-native';
    import { ViewStyle } from 'react-native';
    import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

    type NativeProps = $ReadOnly<{|
        ...ViewProps,
        color: string
    |}>;

    export default (codegenNativeComponent<NativeProps>(
        'ColoredView',
    ): HostComponent<NativeProps>);
    ```

### <a name="fc-codegen-ios"/>[[Fabric Component] Update Codegen - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/8ef289b6df379f871fda9d0bd9a90085108ffef4)

1. Open the `library/package.json`
1. Add the following snippet in the `libraries` array:
    ```diff
    "codegenConfig": {
        "libraries": [
            {
            "name": "RNCalculatorSpec",
            "type": "modules",
            "jsSrcsDir": "src"
            },
    +        {
    +        "name": "RNColoredViewSpec",
    +        "type": "components",
    +        "jsSrcsDir": "src"
    +        }
        ]
    }
    ```

### <a name="fc-android">[[Fabric Component] Add Android Implementation](https://github.com/react-native-community/RNNewArchitectureApp/commit/51e2afa96ddf034c65feffd5b2975f2c693239be)

1. Create a new file `library/android/src/main/java/com/library/ColoredView.java`:
    ```java
    package com.library;

    import androidx.annotation.Nullable;
    import android.content.Context;
    import android.util.AttributeSet;

    import android.view.View;

    public class ColoredView extends View {

        public ColoredView(Context context) {
            super(context);
        }

        public ColoredView(Context context, @Nullable AttributeSet attrs) {
            super(context, attrs);
        }

        public ColoredView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
            super(context, attrs, defStyleAttr);
        }

    }
    ```
1. Create a new file `library/android/src/main/java/com/library/ColoredViewManager.java`:
    ```java
    package com.library;

    import androidx.annotation.Nullable;
    import com.facebook.react.module.annotations.ReactModule;
    import com.facebook.react.uimanager.SimpleViewManager;
    import com.facebook.react.uimanager.ThemedReactContext;
    import com.facebook.react.uimanager.annotations.ReactProp;
    import com.facebook.react.bridge.ReactApplicationContext;
    import android.graphics.Color;
    import java.util.Map;
    import java.util.HashMap;

    public class ColoredViewManager extends SimpleViewManager<ColoredView> {

        public static final String NAME = "ColoredView";
        ReactApplicationContext mCallerContext;

        public ColoredViewManager(ReactApplicationContext reactContext) {
            mCallerContext = reactContext;
        }

        @Override
        public String getName() {
            return NAME;
        }

        @Override
        public ColoredView createViewInstance(ThemedReactContext context) {
            return new ColoredView(context);
        }

        @ReactProp(name = "color")
        public void setColor(ColoredView view, String color) {
            view.setBackgroundColor(Color.parseColor(color));
        }

    }
    ```
1. Open the `library/android/src/main/java/com/library/LibraryPackage.java` and add the following method:
    ```java
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> viewManagers = new ArrayList<>();
        viewManagers.add(new ColoredViewManager(reactContext));
        return viewManagers;
    }
    ```

### <a name="fc-ios">[[Fabric Component] Add iOS Implementation](https://github.com/react-native-community/RNNewArchitectureApp/commit/242a4340b16c8739f41935f4877941009eed9c04)

1. Open the `library/library.podspec`
1. Update the podspec with the following changes
    1. at the beginning of the file:
        ```diff
        platform :ios, '11.0'
        + install! 'cocoapods', :deterministic_uuids => false
        ```
    1. Within the `target AwesomeApp do` block
    ```diff
    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
    +    "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }

    s.dependency "React-Core"
    + s.dependency "React-RCTFabric"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly", folly_version
    ```
1. Open the `library/ios/RNLibrary.xcodeproj`
1. Create a new Objective-C file and call it `RNColoredViewManager`
1. Rename it `RNColoredView.mm`
1. Replace the content with the following code:
    ```objc
    #import <React/RCTViewManager.h>

    @interface RNColoredViewManager : RCTViewManager
    @end

    @implementation RNColoredViewManager

    RCT_EXPORT_MODULE(ColoredView)

    - (UIView *)view
    {
    return [[UIView alloc] init];
    }

    RCT_CUSTOM_VIEW_PROPERTY(color, NSString, UIView)
    {
    [view setBackgroundColor:[self hexStringToColor:json]];
    }

    - hexStringToColor:(NSString *)stringToConvert
    {
    NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

    unsigned hex;
    if (![stringScanner scanHexInt:&hex]) return nil;
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;

    return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
    }

    @end
    ```
1. Create a new `Cocoa Touch Class` and call it `RNColoredView`
1. Rename the `RNColoredView.m` to `RNColoredView.mm`
1. Replace the code in the `RNColoredView.h` with the following:
    ```objc
    #import <React/RCTViewComponentView.h>
    #import <UIKit/UIKit.h>

    #ifndef NativeComponentExampleComponentView_h
    #define NativeComponentExampleComponentView_h

    NS_ASSUME_NONNULL_BEGIN

    @interface RNColoredView : RCTViewComponentView
    @end

    NS_ASSUME_NONNULL_END

    #endif /* NativeComponentExampleComponentView_h */
    ```
1. Replace the content of the `RNColoredView.mm` with the following code:
    ```c++
    #import "RNColoredView.h"

    #import <react/renderer/components/RNColoredViewSpec/ComponentDescriptors.h>
    #import <react/renderer/components/RNColoredViewSpec/EventEmitters.h>
    #import <react/renderer/components/RNColoredViewSpec/Props.h>
    #import <react/renderer/components/RNColoredViewSpec/RCTComponentViewHelpers.h>

    #import "RCTFabricComponentsPlugins.h"

    using namespace facebook::react;

    @interface RNColoredView () <RCTColoredViewViewProtocol>

    @end

    @implementation RNColoredView {
        UIView * _view;
    }

    + (ComponentDescriptorProvider)componentDescriptorProvider
    {
        return concreteComponentDescriptorProvider<ColoredViewComponentDescriptor>();
    }

    - (instancetype)initWithFrame:(CGRect)frame
    {
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const ColoredViewProps>();
        _props = defaultProps;

        _view = [[UIView alloc] init];

        self.contentView = _view;
    }

    return self;
    }

    - (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
    {
        const auto &oldViewProps = *std::static_pointer_cast<ColoredViewProps const>(_props);
        const auto &newViewProps = *std::static_pointer_cast<ColoredViewProps const>(props);

        if (oldViewProps.color != newViewProps.color) {
            NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
            [_view setBackgroundColor:[self hexStringToColor:colorToConvert]];
        }

        [super updateProps:props oldProps:oldProps];
    }

    Class<RCTComponentViewProtocol> ColoredViewCls(void)
    {
        return RNColoredView.class;
    }

    - hexStringToColor:(NSString *)stringToConvert
    {
        NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
        NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

        unsigned hex;
        if (![stringScanner scanHexInt:&hex]) return nil;
        int r = (hex >> 16) & 0xFF;
        int g = (hex >> 8) & 0xFF;
        int b = (hex) & 0xFF;

        return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
    }

    @end
    ```

### <a name="fc-autolinking" />[[Fabric Component] Setup Android Autolinking](https://github.com/react-native-community/RNNewArchitectureApp/commit/a4b9a1ca7f8b06f351cc07db2ee6f801792cc957)

1. Create a new `AwesomeApp/android/app/src/main/java/com/awesomeapp/ComponentsRegistry.java` with this code:
    ```java
    package com.awesomeapp;

    import com.facebook.jni.HybridData;
    import com.facebook.proguard.annotations.DoNotStrip;
    import com.facebook.react.fabric.ComponentFactory;
    import com.facebook.soloader.SoLoader;

    @DoNotStrip
    public class ComponentsRegistry {
        static {
            SoLoader.loadLibrary("fabricjni");
        }

        @DoNotStrip private final HybridData mHybridData;

        @DoNotStrip
        private native HybridData initHybrid(ComponentFactory componentFactory);

        @DoNotStrip
        private ComponentsRegistry(ComponentFactory componentFactory) {
            mHybridData = initHybrid(componentFactory);
        }

        @DoNotStrip
        public static ComponentsRegistry register(ComponentFactory componentFactory) {
            return new ComponentsRegistry(componentFactory);
        }
    }
    ```
1. Open the `AwesomeApp/android/app/src/main/java/com/awesomeapp/MainApplication.java` and update it as it follows:
    1. Add the following imports:
        ```java
        import com.facebook.react.bridge.NativeModule;
        import com.facebook.react.uimanager.ViewManager;
        import com.library.LibraryPackage;
        import java.util.Collections;
        ```
    1. In the `getPackages` method, add the following line:
        ```diff
        // packages.add(new MyReactNativePackage());
        + packages.add(new LibraryPackage());

        return packages;
        ```
    1. In the `getJSIModuleProvider` method, add the following line:
        ```diff
        final ComponentFactory componentFactory = new ComponentFactory();
        CoreComponentsRegistry.register(componentFactory);
        + MyComponentsRegistry.register(componentFactory);
        ```
1. Create a new file `AwesomeApp/android/app/src/main/jni/ComponentsRegistry.h`:
    ```c++
    #pragma once

    #include <ComponentFactory.h>
    #include <fbjni/fbjni.h>
    #include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
    #include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>

    namespace facebook {
    namespace react {

    class ComponentsRegistry
        : public facebook::jni::HybridClass<ComponentsRegistry> {
    public:
    constexpr static auto kJavaDescriptor =
        "Lcom/awesomeapp/ComponentsRegistry;";

    static void registerNatives();

    ComponentsRegistry(ComponentFactory *delegate);

    private:
    friend HybridBase;

    static std::shared_ptr<ComponentDescriptorProviderRegistry const>
    sharedProviderRegistry();

    const ComponentFactory *delegate_;

    static jni::local_ref<jhybriddata> initHybrid(
        jni::alias_ref<jclass>,
        ComponentFactory *delegate);
    };

    } // namespace react
    } // namespace facebook
    ```
1. Create a new file `AwesomeApp/android/app/src/main/jni/ComponentsRegistry.cpp`:
    ```c++
    #include "ComponentsRegistry.h"

    #include <CoreComponentsRegistry.h>
    #include <fbjni/fbjni.h>
    #include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
    #include <react/renderer/components/rncore/ComponentDescriptors.h>
    #include <react/renderer/components/library/ComponentDescriptors.h>

    namespace facebook {
    namespace react {

    ComponentsRegistry::ComponentsRegistry(
        ComponentFactory *delegate)
        : delegate_(delegate) {}

    std::shared_ptr<ComponentDescriptorProviderRegistry const>
    ComponentsRegistry::sharedProviderRegistry() {
    auto providerRegistry = CoreComponentsRegistry::sharedProviderRegistry();

    providerRegistry->add(concreteComponentDescriptorProvider<ColoredViewComponentDescriptor>());

    return providerRegistry;
    }

    jni::local_ref<ComponentsRegistry::jhybriddata>
    ComponentsRegistry::initHybrid(
        jni::alias_ref<jclass>,
        ComponentFactory *delegate) {
    auto instance = makeCxxInstance(delegate);

    auto buildRegistryFunction =
        [](EventDispatcher::Weak const &eventDispatcher,
            ContextContainer::Shared const &contextContainer)
        -> ComponentDescriptorRegistry::Shared {
        auto registry = ComponentsRegistry::sharedProviderRegistry()
                            ->createComponentDescriptorRegistry(
                                {eventDispatcher, contextContainer});

        auto mutableRegistry =
            std::const_pointer_cast<ComponentDescriptorRegistry>(registry);

        mutableRegistry->setFallbackComponentDescriptor(
            std::make_shared<UnimplementedNativeViewComponentDescriptor>(
                ComponentDescriptorParameters{
                    eventDispatcher, contextContainer, nullptr}));

        return registry;
    };

    delegate->buildRegistryFunction = buildRegistryFunction;
    return instance;
    }

    void ComponentsRegistry::registerNatives() {
    registerHybrid({
        makeNativeMethod("initHybrid", ComponentsRegistry::initHybrid),
    });
    }

    } // namespace react
    } // namespace facebook
    ```
1. Open the `OnLoad.cpp` file and add the following line:
    ```diff
    + #include "ComponentsRegistry.h"

    // ...

    JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
        return facebook::jni::initialize(vm, [] {
            facebook::react::AppTurboModuleManagerDelegate::registerNatives();
    +        facebook::react::ComponentsRegistry::registerNatives();
        });
    }
    ```

### <a name="fc-test" />[[Fabric Component] Test the Fabric Component](https://github.com/react-native-community/RNNewArchitectureApp/commit/3af3c89c8f0d1313859388583c7ba31f554b2253)

1. Navigate to the `AwesomeApp` folder.
1. Run `yarn remove library && yarn add ../library`
1. Run `rm -rf ios/Pods ios/Podfile.lock ios/build`
1. Run `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`
1. Run `open AwesomeApp.xcworkspace`
1. Clean the project with `cmd + shift + k` (This step is required to clean the cache from previous builds)
1. Run `cd .. && npx react-native run-ios`
1. Open the `AwesomeApp/App.js` file and update the code with the following:
    ```diff
    import Calculator from 'library/src/NativeCalculator';
    + import ColoredView from 'library/src/ColoredViewNativeComponent';

    const App: () => Node = () => {

    const [result, setResult] = useState<number | null>(null);

    async function onPress() {
        const newResult = await Calculator?.add(3,7);
        setResult(newResult ?? null);
    }
    return (
        <SafeAreaView>
        <StatusBar barStyle={'dark-content'} />
        <Text style={{ "margin":20 }}>3+7={result ?? "??"}</Text>
        <Button title="Compute" onPress={onPress} />
    +    <ColoredView style={{"margin":20; "width":100; "height":100} color={"FFAA77"} />
        </SafeAreaView>
    );
    };

    export default App;
    ```
1. Play with the values of the `color` property to see the square change color on iOS.
1. From the terminal, run `npx react-native run-android`.
1. Play with the values of the `color` property to see the square change color on Android.

**Note:** At the current moment, this code works on iOS. However, the codegen has some issues: if we open the `ios/build/generated/ios/RCTThirdPartyFabricComponentProvider.h`, we can see that there is a duplicated declaration:
```c++
Class<RCTComponentViewProtocol> ColoredViewCls(void) __attribute__((used)); // RNCalculatorSpec
Class<RCTComponentViewProtocol> ColoredViewCls(void) __attribute__((used)); // RNColoredViewSpec
```
Similarly, if we open the `ios/build/generated/ios/RCTThirdPartyFabricComponentProvider.cpp`, we can see this code:
```c++
    {"ColoredView", ColoredViewCls}, // RNCalculatorSpec
    {"ColoredView", ColoredViewCls}, // RNColoredViewSpec
```
Finally, when reloading this code, Hermes complaints with this error:
```
 ERROR  Invariant Violation: requireNativeComponent: "ColoredView" was not found in the UIManager.

This error is located at:
    in ColoredView (at App.js:35)
    in RCTView (at View.js:32)
    in View (at SafeAreaView.js:41)
    in SafeAreaView (at App.js:31)
    in App (at renderApplication.js:50)
    in RCTView (at View.js:32)
    in View (at AppContainer.js:92)
    in RCTView (at View.js:32)
    in View (at AppContainer.js:119)
    in AppContainer (at renderApplication.js:43)
    in AwesomeApp(RootComponent) (at renderApplication.js:60), js engine: hermes
```
But everything works fine.
