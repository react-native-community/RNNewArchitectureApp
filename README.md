# RUN

This branch contains all the step executed to:
1. Create an App starting from the version 0.67.4
2. Migrate it to the New Architecture. This means migrate the app to version 0.68.0
3. Create a TurboModule.
4. Create a Fabric Component.

## Table of Content

* App Setup
    * [[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`](#setup)
    * [[Migration] Upgrade to 0.69](#move-to-0.69)
* iOS
    * Setup
        * [[Hermes] Use Hermes - iOS](#hermes-ios)
        * [[iOS] Enable C++17 language feature support](#configure-cpp17)
        * [[iOS] Use Objective-C++ (.mm extension)](#configure-objcpp)
        * [[iOS] TurboModules: Ensure your App Provides an `RCTCxxBridgeDelegate`](#ios-tm)
    * TurboModule Setup
        * [[TurboModule] Provide a TurboModuleManager Delegate](#ios-tm-manager-delegate)
        * [[TurboModule] Install TurboModuleManager JavaScript Bindings](#ios-tm-js-bindings)

## Steps

### <a name="setup" />[[Setup] Run `npx react-native init AwesomeApp --version 0.67.4`](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. `npx react-native init AwesomeApp --version 0.67.4`
2. `cd AwesomeApp`
3. `npx react-native start` (in another terminal)
4. `npx react-native run-ios`
5. `npx react-native run-android`

### <a name="move-to-0.69" />[[Migration] Upgrade to 0.69](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. `cd AwesomeApp`
1. `yarn add react@18.0.0` to upgrade to React18
1. `yarn add react-native@0.69.0`
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
1. `cd ios`
1. `pod install`
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
1. `npx react-native run-ios && npx react-native run-android`

**NOTE:** if you are running an android emulator, you may need to run this code command to let it find metro:
```sh
adb -s <emulator-id> reverse tcp:8081 tcp:8081
```
Remember to replace the `<emulator-id>` with your own emulator. For me it was `emulator-5554`, for example.
If the instruction completes successfully, you should see it returning `8081`.

### <a name="hermes-ios" />[[Hermes] Use Hermes - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

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

### <a name="configure-cpp17">[[iOS] Enable C++17 language feature support](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

* Open the `AwesomeApp/ios/AwesomeApp.xcworkspace` inn Xcode
* In the `Project Navigator`, select the AwesomeApp Project.
* In the Project panel, select the `AwesomeApp` project (not the one in the `Target` panel)
* Select the `Build Settings` tab
* Filter for `CLANG_CXX_LANGUAGE_STANDARD` and update it to `c++17`
* Search now for `OTHER_CPLUSPLUSFLAGS` and add the following flag: `-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma --Wno-shorten-64-to-32`
* Run the app `npx react-native run-ios`

### <a name="configure-objcpp">[[iOS] Use Objective-C++ (.mm extension)](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

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
1. From the `AwesomeApp` folder, run the app: `npx react-native ru-ios`

### <a name="ios-tm-manager-delegate" />[[TurboModule] Provide a TurboModuleManager Delegate](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

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

### <a name="ios-tm-js-bindings" />[[TurboModule] Install TurboModuleManager JavaScript Bindings](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

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
