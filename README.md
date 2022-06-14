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
        * [[TurboModule] Enable TurboModule System - iOS](#ios-enable-tm)
    * Fabric Setup
        * [[Fabric] Enable Fabric in Podfile](#fabric-podfile)
        * [[Fabric] Update your root view](#fabric-root-view)
    * TurboModule
        * [[TurboModule] Setup calculator](#setup-calculator)
        * [[TurboModule] Create Flow Spec](#tm-flow-spec)
        * [[TurboModule] Setup Codegen - iOS](#tm-codegen-ios)
        * [[TurboModule] Setup podspec file](#tm-podspec-ios)
        * [[TurboModule] Create iOS Implementation](#tm-ios)
        * [[TurboModule] Test the TurboModule](#tm-test)
    * Fabric Component
        * [[Fabric Components] Setup centered-text](#setup-fabric-comp)
        * [[Fabric Components] Create Flow Spec](#fc-flow-spec)
        * [[Fabric Components] Setup Codegen - iOS](#fc-codegen-ios)
        * [[Fabric Components] Setup podspec file](#fc-podspec-ios)
        * [[Fabric Components] Create iOS Implementation](#fc-ios)
        * [[Fabric Components] Test the Fabric Component](#fc-test)
* Android
    * Setup
        * [[Setup] Configure Gradle for CodeGen](#android-setup)

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

### <a name="ios-enable-tm" />[[TurboModule] Enable TurboModule System - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

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

### <a name="fabric-podfile" />[[Fabric] Enable Fabric in Podfile](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Open the `AwesomeApp/ios/Podfile` and modify it as it follows:
    ```diff
    platform :ios, '12.4'
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
1. Go to `ios` folder and run `RCT_NEW_ARCH_ENABLED=1 pod install`
1. From `AwesomeApp`, run `npx react-native run-ios`

### <a name="fabric-root-view" />[[Fabric] Update your root view](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

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
1. 1. From `AwesomeApp`, run `npx react-native run-ios`

### <a name="setup-calculator" /> [[TurboModule] Setup calculator](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a folder at the same level of `AwesomeApp` and call it `calculator`.
1. Create a `package.json` file and add the following code:
    ```json
    {
        "name": "calculator",
        "version": "0.0.1",
        "description": "Calculator TurboModule",
        "react-native": "src/index",
        "source": "src/index",
        "files": [
            "src",
            "android",
            "ios",
            "calculator.podspec",
            "!android/build",
            "!ios/build",
            "!**/__tests__",
            "!**/__fixtures__",
            "!**/__mocks__"
        ],
        "keywords": ["react-native", "ios", "android"],
        "repository": "https://github.com/<your_github_handle>/calculator",
        "author": "<Your Name> <your_email@your_provider.com> (https://github.com/<your_github_handle>)",
        "license": "MIT",
        "bugs": {
            "url": "https://github.com/<your_github_handle>/calculator/issues"
        },
        "homepage": "https://github.com/<your_github_handle>/claculator#readme",
        "devDependencies": {},
        "peerDependencies": {
            "react": "*",
            "react-native": "*"
        }
    }
    ```

### <a name="tm-flow-spec" />[[TurboModule] Create Flow Spec](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a new folder `calculator/src`
1. Create a new file `calculator/src/NativeCalculator.js` with this code:
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

### <a name="tm-codegen-ios">[[TurboModule] Setup Codegen - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Open the `calculator/package.json` file
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

### <a name="tm-podspec-ios">[[TurboModule] Setup podspec file](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a `calculator/calculator.podspec` file with this code:
    ```ruby
    require "json"

    package = JSON.parse(File.read(File.join(__dir__, "package.json")))

    folly_version = '2021.06.28.00-v2'
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    Pod::Spec.new do |s|
        s.name            = "calculator"
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


### <a name="tm-ios"/>[[TurboModule] Create iOS Implementation](https://github.com/react-native-community/RNNewArchitectureApp/commit/feac8db541776634bba1da8816f9b694c57b9d19)

1. Create a `calculator/ios` folder
1. Create a new file named `RNCalculator.h`
1. Create a new file named `RNCalculator.mm`
1. Open the `RNCalculator.h` file and fill it with this code:
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

### <a name="tm-test" />[[TurboModule] Test the TurboModule](https://github.com/react-native-community/RNNewArchitectureApp/commit/871c17f7d18747dc46313229d604a17803e30348)

1. Navigate to the `AwesomeApp` folder.
1. Run `yarn add ../calculator`
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
    import Calculator from 'calculator/src/NativeCalculator';

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

### <a name="setup-fabric-comp" /> [[Fabric Components] Setup centered-text](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a folder at the same level of `AwesomeApp` and call it `centered-text`.
1. Create a `package.json` file and add the following code:
    ```json
    {
        "name": "centered-text",
        "version": "0.0.1",
        "description": "Centered Text Fabric Component",
        "react-native": "src/index",
        "source": "src/index",
        "files": [
            "src",
            "android",
            "ios",
            "centered-text.podspec",
            "!android/build",
            "!ios/build",
            "!**/__tests__",
            "!**/__fixtures__",
            "!**/__mocks__"
        ],
        "keywords": ["react-native", "ios", "android"],
        "repository": "https://github.com/<your_github_handle>/centered-text",
        "author": "<Your Name> <your_email@your_provider.com> (https://github.com/<your_github_handle>)",
        "license": "MIT",
        "bugs": {
            "url": "https://github.com/<your_github_handle>/centered-text/issues"
        },
        "homepage": "https://github.com/<your_github_handle>/centered-text#readme",
        "devDependencies": {},
        "peerDependencies": {
            "react": "*",
            "react-native": "*"
        }
    }
    ```

### <a name="fc-flow-spec" />[[Fabric Components] Create Flow Spec](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a new folder `centered-text/src`
1. Create a new file `centered-text/src/CenteredTextNativeComponent.js` with this code:
    ```ts
    // @flow strict-local
    import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
    import type {HostComponent} from 'react-native';
    import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
    type NativeProps = $ReadOnly<{|
    ...ViewProps,
    text: ?string,
    // add other props here
    |}>;
    export default (codegenNativeComponent<NativeProps>(
    'RNCenteredText',
    ): HostComponent<NativeProps>);
    ```

### <a name="fc-codegen-ios">[[Fabric Components] Setup Codegen - iOS](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Open the `centered-text/package.json` file
1. Add the following code at the end of the file:
    ```json
    ,
    "codegenConfig": {
        "libraries": [
            {
            "name": "RNCenteredTextSpec",
            "type": "components",
            "jsSrcsDir": "src"
            }
        ]
    }
    ```

### <a name="fc-podspec-ios">[[Fabric Components] Setup podspec file](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a `centered-text/centered-text.podspec` file with this code:
    ```ruby
    require "json"

    package = JSON.parse(File.read(File.join(__dir__, "package.json")))

    folly_version = '2021.06.28.00-v2'
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    Pod::Spec.new do |s|
        s.name            = "centered-text"
        s.version         = package["version"]
        s.summary         = package["description"]
        s.description     = package["description"]
        s.homepage        = package["homepage"]
        s.license         = package["license"]
        s.platforms       = { :ios => "11.0" }
        s.author          = package["author"]
        s.source          = { :git => package["repository"], :tag => "#{s.version}" }
        s.source_files    = "ios/**/*.{h,m,mm,swift}"
        s.dependency "React-Core"
        s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
        s.pod_target_xcconfig    = {
            "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
            "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
            "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
        }
        s.dependency "React-RCTFabric"
        s.dependency "React-Codegen"
        s.dependency "RCT-Folly", folly_version
        s.dependency "RCTRequired"
        s.dependency "RCTTypeSafety"
        s.dependency "ReactCommon/turbomodule/core"
    end
    ```

### <a name="fc-ios"/>[[Fabric Components] Create iOS Implementation](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Create a `centered-text/ios` folder
1. Create a `RNCenteredTextManager.mm` file
1. Create a `RNCenteredText.h` file
1. Create a `RNCenteredText.mm` file
1. Open the `RNCenteredTextManager.mm` file and add this code
    ```objective-c
    #import <React/RCTLog.h>
    #import <React/RCTUIManager.h>
    #import <React/RCTViewManager.h>

    @interface RNCenteredTextManager : RCTViewManager
    @end

    @implementation RNCenteredTextManager

    RCT_EXPORT_MODULE(RNCenteredText)

    RCT_EXPORT_VIEW_PROPERTY(text, NSString)
    @end
    ```
1. Open the `RNCenteredText.h` file and add this code
    ```objective-c
    #import <React/RCTViewComponentView.h>
    #import <UIKit/UIKit.h>

    NS_ASSUME_NONNULL_BEGIN

    @interface RNCenteredText : RCTViewComponentView
    @end

    NS_ASSUME_NONNULL_END
    ```
1. Open the `RNCenteredText.mm` file and add this code
    ```objective-c
    #import "RNCenteredText.h"
    #import <react/renderer/components/RNCenteredTextSpec/ComponentDescriptors.h>
    #import <react/renderer/components/RNCenteredTextSpec/EventEmitters.h>
    #import <react/renderer/components/RNCenteredTextSpec/Props.h>
    #import <react/renderer/components/RNCenteredTextSpec/RCTComponentViewHelpers.h>
    #import "RCTFabricComponentsPlugins.h"

    using namespace facebook::react;

    @interface RNCenteredText () <RCTRNCenteredTextViewProtocol>
    @end

    @implementation RNCenteredText {
        UIView *_view;
        UILabel *_label;
    }

    + (ComponentDescriptorProvider)componentDescriptorProvider
    {
    return concreteComponentDescriptorProvider<RNCenteredTextComponentDescriptor>();
    }

    - (instancetype)initWithFrame:(CGRect)frame
    {
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNCenteredTextProps>();
        _props = defaultProps;

        _view = [[UIView alloc] init];
        _view.backgroundColor = [UIColor redColor];

        _label = [[UILabel alloc] init];
        _label.text = @"Initial value";
        [_view addSubview:_label];

        _label.translatesAutoresizingMaskIntoConstraints = false;
        [NSLayoutConstraint activateConstraints:@[
            [_label.leadingAnchor constraintEqualToAnchor:_view.leadingAnchor],
            [_label.topAnchor constraintEqualToAnchor:_view.topAnchor],
            [_label.trailingAnchor constraintEqualToAnchor:_view.trailingAnchor],
            [_label.bottomAnchor constraintEqualToAnchor:_view.bottomAnchor],
        ]];
        _label.textAlignment = NSTextAlignmentCenter;
        self.contentView = _view;
    }
    return self;
    }

    - (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
    {
    const auto &oldViewProps = *std::static_pointer_cast<RNCenteredTextProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<RNCenteredTextProps const>(props);

    if (oldViewProps.text != newViewProps.text) {
        _label.text = [[NSString alloc] initWithCString:newViewProps.text.c_str() encoding:NSASCIIStringEncoding];
    }

    [super updateProps:props oldProps:oldProps];
    }
    @end

    Class<RCTComponentViewProtocol> RNCenteredTextCls(void)
    {
    return RNCenteredText.class;
    }
    ```

### <a name="fc-test" />[[Fabric Components] Test the Fabric Component](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Navigate to the `AwesomeApp` folder.
1. Run `yarn add ../centered-text`
1. Run `rm -rf ios/Pods ios/Podfile.lock ios/build`
1. Run `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`
1. Run `open AwesomeApp.xcworkspace`
1. Clean the project with `cmd + shift + k` (This step is required to clean the cache from previous builds)
1. Run `cd .. && npx react-native run-ios`
1. Open the `AwesomeApp/App.js` file and replace the content with:
    ```diff
    } from 'react-native';
    import Calculator from 'calculator/src/NativeCalculator';
    + import CenteredText from 'centered-text/src/CenteredTextNativeComponent';

    // ...

        <Text style={{ "margin":20 }}>3+7={result ?? "??"}</Text>
        <Button title="Compute" onPress={onPress} />
    +    <CenteredText text="Hello World" style={{width:"100%", height:"30"}} />
        </SafeAreaView>
    );
    ```

### <a name="android-setup" />[[Setup] Configure Gradle for CodeGen](https://github.com/react-native-community/RNNewArchitectureApp/commit/)

1. Navigate to `AwesomeApp/android` folder
1. Update Gradle running: `./gradlew wrapper --gradle-version 7.3 --distribution-type=all`
1. Open the `AwesomeApp/android/settings.gradle` file and add the following lines:
    ```diff
    apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
    include ':app'
    + includeBuild('../node_modules/react-native-gradle-plugin')

    + include(":ReactAndroid")
    + project(":ReactAndroid").projectDir = file('../node_modules/react-native/ReactAndroid')
    + include(":ReactAndroid:hermes-engine")
    + project(":ReactAndroid:hermes-engine").projectDir = file('../node_modules/react-native/ReactAndroid/hermes-engine')
    ```
1. Open the `AwesomeApp/android/build.gradle` file and update the gradle dependency:
    ```diff
        //...
        repositories {
            google()
            mavenCentral()
        }
        dependencies {
    -        classpath("com.android.tools.build:gradle:4.2.2")
    +        classpath("com.android.tools.build:gradle:7.1.1")

    +        classpath("com.facebook.react:react-native-gradle-plugin")
    +        classpath("de.undercouch:gradle-download-task:4.1.2")

            // NOTE: Do not place your application dependencies here; they belong
            // in the individual module build.gradle files

        }
    }
    ```
1. Open the `android/app/build.gradle` and add the following snippet:
    ```diff
    }

    if (enableHermes) {
    -    def hermesPath = "../../node_modules/hermes-engine/android/";
    -    debugImplementation files(hermesPath + "hermes-debug.aar")
    -    releaseImplementation files(hermesPath + "hermes-release.aar")
    +    //noinspection GradleDynamicVersion
    +    implementation("com.facebook.react:hermes-engine:+") { // From node_modules
    +        exclude group:'com.facebook.fbjni'
    +    }
    } else {

    // ...

    + configurations.all {
    +     resolutionStrategy.dependencySubstitution {
    +         substitute(module("com.facebook.react:react-native"))
    +                 .using(project(":ReactAndroid"))
    +                 .because("On New Architecture we're building React Native from source")
    +         substitute(module("com.facebook.react:hermes-engine"))
    +                .using(project(":ReactAndroid:hermes-engine"))
    +                .because("On New Architecture we're building Hermes from source")
    +     }
    + }

    // Run this once to be able to run the application with BUCK
    // puts all compile dependencies into folder libs for BUCK to use
    task copyDownloadableDepsToLibs(type: Copy) {
    ```
1. Go back to the `AwesomeApp` folder
1. `npx react-native run-android` (Don't worry if it takes some time to complete.)
