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

### <a name="cpp-tm-manager" />[[TurboModule Setup] C++ Provide a native implementation for the methods in your *TurboModuleDelegate class]()

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

### <a name="enable-tm-android" />[[TurboModule Setup] Enable the useTurboModules flag in your Application onCreate]()

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

### <a name="ios-tm-manager-delegate" />[[TurboModule Setup] Provide a TurboModuleManager Delegate]()

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

### <a name="ios-tm-js-bindings" />[[TurboModule Setup] Install TurboModuleManager JavaScript Bindings]()

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

### <a name="ios-enable-tm" />[[TurboModule Setup] Enable TurboModule System - iOS]()

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

### <a name="jsimodpackage-in-rnhost" />[[Fabric Setup] Provide a `JSIModulePackage` inside your `ReactNativeHost`]()

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

### <a name="set-is-fabric">[[Fabric Setup] Call `setIsFabric` on your Activity’s `ReactRootView`]()

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

### <a name="fabric-podfile" />[[Fabric Setup] Enable Fabric in Podfile]()

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

### <a name="fabric-root-view" />[[Fabric Setup] Update your root view]()

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

### <a name="fabric-run" />[[Fabric Setup] Add Babel plugin and run the app]()

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

### <a name="pillar-setup" /> [[Pillars] Setup library]()

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

### <a name="tm-flow-spec" /> [[TurboModule] Create Flow Spec]()

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

### <a name="tm-codegen-android">[[TurboModule] Setup Codegen - Android]()

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

### <a name="tm-codegen-ios">[[TurboModule] Setup Codegen - iOS]()

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

### <a name="tm-podspec-ios">[[TurboModule] Setup podspec file]()

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

### <a name="tm-android" />[[TurboModule] Create Android Implementation]()

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
### <a name="tm-ios" />[[TurboModule] Create iOS Implementation]()

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
