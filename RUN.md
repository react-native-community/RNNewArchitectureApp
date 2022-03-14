# New Architecture Run

## Setup

* **React** Nightly build: 20220309-2009-538636440
* **HW**: Mac M1 Pro, 32 GB RAM
* **OS**: Monterey 12.2.1
* **Ruby**: rbenv with ruby 2.7.4 (If you have trouble installing it, try with RUBY_CFLAGS=“-w” rbenv install 2.7.4)
* **Node**: v16.14.0

## Guide and Checkpoint

This Run creates a new project with ReactNative and migrates it to the new architecture. Then, it creates a Turbo Module and a Fabric Component and it integrates them with the app.

There are a few commits that, if checked out, are interesting points to start with.
* [Initial Project](https://github.com/cortinico/RNNewArchitectureApp/commit/192c35d76b750c3eeeaa04c9c8caa61c2153a8ad)
* [Working New Architecture Project](https://github.com/cortinico/RNNewArchitectureApp/commit/f0ff35c9f25671f85ae5c64316d0f90c553a9e80)
* [Project with a Turbo Module](https://github.com/cortinico/RNNewArchitectureApp/commit/7759aabc6176bbab0666b944d88627d505987205)
* [Project with a Fabric Component](https://github.com/cortinico/RNNewArchitectureApp/commit/c45498a48b443d251a76dd6730eb9208cbbbe4a1)


## Issues

The following is a list of issues found while executing the migration with their resolution or workaround.
* [React Native and Hermes incopatibility](#hermes)
* [Folly compiler flags](#folly)
* [Components not properly generated](#components) -> to check whether this is a real issue)
* [RCTImageLoader failure](#rctimageloader)

## Steps

### [[Setup] react-native init](https://github.com/cortinico/RNNewArchitectureApp/commit/192c35d76b750c3eeeaa04c9c8caa61c2153a8ad)
Steps:
* `npx react-native init AwesomeApp`
* `cd AwesomeApp`
* `npx react-native start`
* `npx react-native run-ios`

### [[Setup] Set the nightly build](https://github.com/cortinico/RNNewArchitectureApp/commit/285d69bea7b7cdcc53ce2429539ea25249a0537c)
Steps:
* Open the `AwesomeApp/package.json`
* Update the `react-native` version to `20220309-2009-538636440`
* `yarn install`
* `cd ios && pod install`
* Fix build error in `AppDelegate.m` by replacing the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];` with the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];`
* `npx react-native start`
* `npx react-native run-ios`

### [[Setup] Install CodeGen](https://github.com/cortinico/RNNewArchitectureApp/commit/559ddfffd2a16f92e3b05696d9e2048d3893742b)
Steps:
* `yarn add react-native-codegen`
* `cd ios && pod install`
* `npx react-native start`
* `npx react-native run-ios`

### [[Setup] Enable Hermes](https://github.com/cortinico/RNNewArchitectureApp/commit/75f14baf8507c0afa47d5d07901b6d34c4adacf4)
Steps:
* Open the `Podfile`
* Change `:hermes_enabled` to `true`
* `cd ios && pod install`
* open `AwesomeApp.xcworkspace`
* `cmd+r` -> the app builds but when it runs, it crashes.

#### <a name="hermes">ISSUE</a>
The issue is due to a temporary incompatibility between Hermes and ReactNative. The team is working on that.
For the moment, follow these steps to work around it:
1. Open the `AwesomeApp/node_modules/react-native/scripts/react_native_pods.rb`
2. Go to line  116 and add the following two lines
    ```ruby
    elsif ENV['BUILD_FROM_GIT'] == '1'
      pod 'hermes-engine', :git => "https://github.com/facebook/hermes.git"
    ```
3. `brew install cmake ninja` -> these are tools used to build hermes
4. `BUILD_FROM_GIT=1 pod install`
5. Open `AwesomeApp.xcworkspace`
6. `cmd+r`

### [[Setup] Enable C++17](https://github.com/cortinico/RNNewArchitectureApp/commit/76b9d27367cd838b7a07fae9a719ae3820b362cf)
Steps:
* Open `AwesomeApp.xcworkspace`
* Select the `AwesomeApp`project in the project navigator
* Select the `AwesomeApp` project in the `Projects` panel
* Select the `Build Settings` tab
* Search for `CLANG_CXX_LANGUAGE_STANDARD`
* Select the `C++17` option
* `cmd+r`

### [[Setup] Update the code to use Objective-C++](https://github.com/cortinico/RNNewArchitectureApp/commit/6f986914744cbb29b454f45d469f43202dd965a3)
Steps:
* Open `AwesomeApp.xcworkspace`
* Rename the `AwesomeApp/main.m` to `AwesomeApp/main.mm`
* Rename the `AwesomeApp/AppDelegate.m` to `AwesomeApp/AppDelegate.mm`
* `cmd+r`

**Note:** Doing this from Xcode will also update the Xcodeproject file

### [[Setup] Provide a RCTCxxBridgeDelegate](https://github.com/cortinico/RNNewArchitectureApp/commit/9c9dbe25f0fa6592e0683f15496eb61dd765686a)
Steps:
* Open `AwesomeApp.xcworkspace`
* Open `AwesomeApp/AppDelegate.mm`
* Add the following imports
```objective-c
#import <reacthermes/HermesExecutorFactory.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTJSIExecutorRuntimeInstaller.h>
```
* Make the `AppDelegate` conforms to `RCTCxxBridgeDelegate`. Add this code before the `@implementation AppDelegate`:
```objective-c
@interface AppDelegate () <RCTCxxBridgeDelegate> {

}
@end
```
* Add a base implementation for the `jsExecutorFactoryForBridge`. This code will be updated later
```c++
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
* `cmd+b` -> The build will fail with the error `'folly/folly-config.h' file not found`.

#### <a name="folly">ISSUE</a>
`Folly` requires some additional compiler flags.
* Select the `AwesomeApp` project in the project navigator
* Select the `AwesomeApp` target in the `Targets` section
* Select the `Build Settings` tab
* Search for `Other C++ Flags`
* Update the `Debug` configuration with the following line: `-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1`
* Update the `Release` configuration with the following line: `-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1`
* `cmd+b`
* `cmd+r`

### [[Turbo Modules] Provide a TurboModuleManager Delegate](https://github.com/cortinico/RNNewArchitectureApp/commit/c81c3b9865a9879d584d2c164cc56bc449da8a4a)
Steps:
* Open `AwesomeApp.xcworkspace`
* Open `AwesomeApp/AppDelegate.mm`
* Add the following imports:
```objective-c
#import <ReactCommon/RCTTurboModuleManager.h>
#import <React/CoreModulesPlugins.h>
```
* Make the AppDelegate conforms to `RCTTurboModuleManagerDelegate`:
```objective-c
@interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  RCTTurboModuleManager *_turboModuleManager;
}
@end
```
* Add the implementation for the protocol's methods
```c++
#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)
    getTurboModule:(const std::string &)name
         jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker {
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return [moduleClass new];
}
```

### [[Turbo Modules] Install TurboModuleManager JavaScript Bindings](https://github.com/cortinico/RNNewArchitectureApp/commit/efbcefe216138a566e9c96b2c0b170f85982b9d1)
Steps:
* Open `AwesomeApp.xcworkspace`
* Open `AwesomeApp/AppDelegate.mm`
* Update the `jsExecutorFactoryForBridge:(RCTBridge *)bridge` method body with the following code:
```c++
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
```
* `cmd+r`

### [[Turbo Modules] Enable TurboModule System](https://github.com/cortinico/RNNewArchitectureApp/commit/5f955a197e3a7a457c8f2e7a372183941ad3c797)

Steps:
* Open `AwesomeApp.xcworkspace`
* Open `AwesomeApp/AppDelegate.mm`
* Add the `RCTEnableTurboModule(YES);` as first line of the `(BOOL)application:didFinishLaunchingWithOptions:` method
* `cmd+r`

#### <a name="components">ISSUE</a>
The app will run, but RN will fail with the following error:
```
Native Component 'SafeAreaView' that calls codegenNativeComponent was not code generated at build time.
```
That's because the SafeAreaView specs are a little different at the moment.
To fix the issue, let's cleanup the `App.js` code by removing the `SafeAreaView` and the `StatusBar`

### [[Fabric] Enable Fabric in Podfile](https://github.com/cortinico/RNNewArchitectureApp/commit/75ce04c631c8054903c729383e3afb8fbb1eb96a)
Steps:
* Open `AwesomeApp/Podfile`
* Before the `:enable_hermes => true` line, add the following lines:
    * `:app_path => "#{Dir.pwd}/..",`
    * `:fabric_enabled => true,`
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
* Open `AwesomeApp.xcworkspace`
* `cmd+r`

#### <a name="rctimageloader">ISSUE</a>
If you get a RN error about `ImageLoader`, you can solve it by:
* Open the `AwesomeApp.xcworkspace`
* Open the `AppDelegate.mm`
* Before the `#import <ReactCommon/RCTTurboModuleManager.h>`, add the following imports:
```objective-c
#import <React/RCTDataRequestHandler.h>
#import <React/RCTHTTPRequestHandler.h>
#import <React/RCTFileRequestHandler.h>
#import <React/RCTNetworking.h>
#import <React/RCTImageLoader.h>
#import <React/RCTGIFImageDecoder.h>
#import <React/RCTLocalAssetImageLoader.h>
```
* Update the body of the `getModuleInstanceFromClass` method with the following code:
```c++
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
  return [moduleClass new];
```
* `cmd+r`

The error is caused by a module used by the app to load images that requires some custom parameter at init time to work properly.

### [[Fabric] Update your RootView](https://github.com/cortinico/RNNewArchitectureApp/commit/11a9bdd069f0f6e19779867c7b169693bc3352d4)
Steps:
* Open the `AwesomeApp.xcworkspace`
* Open the `AppDelegate.mm`
* Add the following imports:
```objective-c
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <react/config/ReactNativeConfig.h>
```
* Add the following properties in the `@interface AppDelegare` block:
```c++
RCTSurfacePresenterBridgeAdapter *_bridgeAdapter;
std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
facebook::react::ContextContainer::Shared _contextContainer;
```
* Replace the line that starts with `UIView *rootView =` in the `application:didFinishLaunchingWithOptions:` with the following snippet:
```c++
  _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
  _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();

  _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);

  _bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc]
        initWithBridge:bridge
      contextContainer:_contextContainer];

  bridge.surfacePresenter = _bridgeAdapter.surfacePresenter;

  UIView *rootView =
      [[RCTFabricSurfaceHostingProxyRootView alloc] initWithBridge:bridge
                                                        moduleName:@"AwesomeApp"
                                                 initialProperties:nil];
```
* `cmd+b`
* `cmd+r`

### [[Fabric] Add Babel plugin and reinstall pods](https://github.com/cortinico/RNNewArchitectureApp/commit/f0ff35c9f25671f85ae5c64316d0f90c553a9e80)
Steps:
* Open the `babel.config.js`
* Add this snippet after the `preset` property:
```js
plugins: [
    '@babel/plugin-proposal-class-properties',
    './node_modules/react-native/packages/babel-plugin-codegen'
]
```
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`

### [[TurboModules] Create a Calendar Module](https://github.com/cortinico/RNNewArchitectureApp/commit/49799e946c865d8cc92130f9f6c4bfb364017290)
Steps:
* Open the `AwesomeApp.xcworkspace`
* Create a new group in the `AwesomeApp` and call it `CalendarModule`
* Create a new header file `RCTCalendarModule.h` and add this code:
```objective-c
//  RCTCalendarModule.h
#import <React/RCTBridgeModule.h>
@interface RCTCalendarModule : NSObject <RCTBridgeModule>
@end
```
* Create a new objective-c file called ``RCTCalendarModule.m` and add this code:
```objective-c
// RCTCalendarModule.m
#import "RCTCalendarModule.h"
#import <React/RCTLog.h>

@implementation RCTCalendarModule

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
    RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

@end
```
* `cmd+b`
* `cmd+r`

### [[Turbo Modules] Define JS Specs](https://github.com/cortinico/RNNewArchitectureApp/commit/9f67f17b43f224fd5b37a6b2b3410151126b1a70)
Steps:
* In the `AwesomeApp/CalendarModule` group, create a `js` folder
* Create a `NativeCalendarModule.js` file
* Add the following code:
```js
'use strict';

import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  +getConstants: () => {||};

  +createCalendarEvent(name: string, location: string): void;
}

export default (TurboModuleRegistry.get<Spec>('CalendarModule'): ?Spec);
```
### [[Turbo Modules] Configure podspec for codegen](https://github.com/cortinico/RNNewArchitectureApp/commit/c2cd9500c0770822b3d13064ff38bf19ee0c25c0)
Steps:
* In the `AwesomeApp/CalendarModule` group, create a `CalendarModule.podspec` file
* Copy the following code:
```ruby
folly_version = '2021.06.28.00-v2'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
Pod::Spec.new do |s|
  s.name            = "CalendarModule"
  s.version         = "0.0.1"
  s.summary         = "Calendar Module"
  s.description     = "Calendar Module"
  s.homepage        = "https://github.com/facebook/react-native.git"
  s.license         = "MIT"
  s.platforms       = { :ios => "11.0" }
  s.author          = ""
  s.source          = { :git => "https://github.com/facebook/react-native.git", :tag => "#{s.version}" }

  s.source_files    = "./**/*.{h,m,mm,swift}"

  s.compiler_flags  = folly_compiler_flags

  s.pod_target_xcconfig    = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\""
  }

  s.dependency "React"
  s.dependency "React-RCTFabric" # This is for fabric component
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly", folly_version
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"
end
```

### [[Turbo Modules] Enable codegen in `package.json`](https://github.com/cortinico/RNNewArchitectureApp/commit/13ed4d9f0796f19fb24430fd6260b3bae2410a6a)
Steps:
* Open the `package.json` file
* At the end of the file, before the las `}` add the following snippet:
```json
,
  "codegenConfig": {
    "libraries": [
      {
        "name": "CalendarModule",
        "type": "modules",
        "jsSrcsDir": "ios/AwesomeApp/CalendarModule/js"
      }
    ]
  }
```
* Generate the code by running `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`. If successful, you should see some lines like these:
```
#...
[Codegen] >>>>> Processing CalendarModule
[Codegen] Generated schema: /var/folders/b7/5gvyd0914t15w42kwy1k_l600000gn/T/CalendarModuleeSio3t/schema.json
[Codegen] Generated artifacts: /path/to/RNNewArchitectureApp/AwesomeApp/ios/build/generated/ios/CalendarModule
#...
```
* `cmd+b`
* `cmd+r`

### [[Turbo Modules] Extend or implement the code-generated native interfaces](https://github.com/cortinico/RNNewArchitectureApp/commit/81c29e53e10cd2eec13962ca7ec9e5f5cc056a6e)
Steps:
* Open the `AwesomeApp.xcworkspace`
* Rename the `RCTCalendarModule.m` into `RCTCalendarModule.mm`
* Right-click the `AwesomeApp` group in Xcode and select `Add files to "AwesomeApp"`
* Select the `build/generated/ios/CalendarModule` folder
* Open the `RCTCalendarModule.h`
* Replace the import with `#import <CalendarModule/CalendarModule.h>`
* Replace the implemented protocol with `NativeCalendarModuleSpec`
* Rename the `RCTCalendarModule.m` into `RCTCalendarModule.mm`
* Open the `RCTCalendarModule.mm`
* Add the following snippet before the `@end` to connect the component with the generated interface
```c++
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeCalendarModuleSpecJSI>(params);
}
```
* `cmd+b`
* `cmd+r`

### [[Turbo Modules] Test the Calendar Module in JS](https://github.com/cortinico/RNNewArchitectureApp/commit/28f87053cd5bb689022a811f90c8ad933389475e)
Steps:
* Replace the content of the `App.js` file with the following:
```js
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Button,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import CalendarModule from './ios/AwesomeApp/CalendarModule/js/NativeCalendarModule';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title="Click to invoke your native module!"
        color="#841584"
        onPress={() => {
          CalendarModule.createCalendarEvent('foo', 'bar');
        }}/>
    </SafeAreaView>
  );
};

export default App;
```
* Update the babel config using the right codegen plugin:
```json
  'plugins': [
    '@babel/plugin-proposal-class-properties',
    './node_modules/babel-plugin-codegen'
  ]
```
* Install the plugin with `yarn add babel-plugin-codegen`
* Fix the TurboModule spec interface using this code:
```js
export interface Spec extends TurboModule {
    createCalendarEvent(name: string, location: string): void;
}
```
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
* Run `npx react-native start`
* Run `npx react-native run-ios`
* Open the `AwesomeApp.xcworkspace`
* Set a breakpoint on line 11 of the `RCTCalendarModule.mm` file (the `RCTLogInfo` line)
* Tap on the Button on the screen and observe the app stopping at the breakpoint.

### [[Turbo Modules] Toward a more testable Spec](https://github.com/cortinico/RNNewArchitectureApp/commit/7759aabc6176bbab0666b944d88627d505987205)
Steps:
* Open the `NativeCalendarModule.js` file.
* Replace the `createCalendarEvent` return type to `Promise<string>`
* Regenerate code gen running `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
* Open `AwesomeApp.xcworkspace`
* Open the `RCTCalendarModule.mm`
* Leverage the compiler warning to generate the proper `createCalendarEvent` signature.
* replace the `RCT_EXPORT_METHOD` with the following code:
```objective-c
RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name
                  location:(NSString *)location
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  // Do something with the calendar
  NSString *eventId = [[NSUUID new] UUIDString];
  resolve(eventId);
}
```
* `cmd+b`
* Open the `App.js` file and update it ad it follows:
    * Add the `import { useState } from 'react';` statement
    * Add the `Text` imports in the `react-native` set
    * Before returning the components, add the `const [eventId, setEventId] = useState<string>("");`
    * Replace the `<Button />` component with the following code
```js
    <Button
        title="Click to invoke your native module!"
        color="#841584"
        onPress={async () => {
          const newId = await CalendarModule.createCalendarEvent('foo', 'bar');
          setEventId(newId);
        }}/>
      <Text style={{marginLeft:10}}>{eventId.length == 0 ? "No Event Created" : eventId}</Text>
```
* `npx react-native start`
* `npx react-native run-ios`
* Tap on the button and observe the id that changes.

### [[Fabric Component] Create the JS Spec](https://github.com/cortinico/RNNewArchitectureApp/commit/6558b96758dd1faeadfbb61c4bb671e4735bf576)
Steps:
* At the same level of the `App.js` file, create a `MapView/js` folder
* Create a new file `MapViewNativeComponents.js`
* Add this code to the file:
```js
// @flow strict-local

import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {HostComponent} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

type NativeProps = $ReadOnly<{|
  ...ViewProps,
  zoomEnabled: boolean,
|}>;

export default (codegenNativeComponent<NativeProps>(
  'MapView',
): HostComponent<NativeProps>);
```

### [[Fabric Components] Create the podspec file and generate the code](https://github.com/cortinico/RNNewArchitectureApp/commit/66bdf8599a4708f2742f231c8091ddfb6a36fe0e)
Steps
* Go to the `MapView` folder
* Create a new file `MapView.podspec`
* Add the following code:
```ruby
# folly_version must match the version used in React Native
# See folly_version in react-native/React/FBReactNativeSpec/FBReactNativeSpec.podspec
folly_version = '2021.06.28.00-v2'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
boost_compiler_flags = '-Wno-documentation'

Pod::Spec.new do |s|

  s.name            = "MapView"
  s.version         = "0.0.1"
  s.summary         = "Map View Component"
  s.description     = "Map View Component"
  s.homepage        = "https://github.com/facebook/react-native.git"
  s.license         = "MIT"
  s.platforms       = { :ios => "11.0" }
  s.author          = "Meta, inc."
  s.source          = { :git => "https://github.com/facebook/react-native.git", :tag => "#{s.version}" }
  s.compiler_flags  = folly_compiler_flags + ' ' + boost_compiler_flags + ' -Wno-nullability-completeness'

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/RCT-Folly\"",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
  }

  s.requires_arc = true

  s.dependency "React"
  s.dependency "React-RCTFabric"
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly", folly_version
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"

  s.source_files    = "**/*.{h,m,mm,cpp,swift}"
end
```
* Open the `package.json` file
* Update the `codegenConfig` with the following code
```json
  ,
  {
    "name": "MapView",
    "type": "components",
    "jsSrcsDir": "MapView/js"
  }
```
* generate the code running `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`

If successfull, you should see something like this:
```
[Codegen] >>>>> Processing MapView
[Codegen] Generated schema: /var/folders/b7/5gvyd0914t15w42kwy1k_l600000gn/T/MapView0PSxcQ/schema.json
[Codegen] Generated artifacts: /Users/cipolleschi/rn-test/RNNewArchitectureApp/AwesomeApp/ios/build/generated/ios/react/renderer/components/MapView
```

### [[Fabric Component] Create the Native ViewManager](https://github.com/cortinico/RNNewArchitectureApp/commit/18ec27a1540d10611ed15fcf1c8f4312e7f7a9ce)
Steps:
* Go to the `MapView` folder
* Create a new folder and name it `ios`
* Create a new file called `RNTMapManager.mm`
* Paste the following code:
```objective-c
#import <MapKit/MapKit.h>
#import <React/RCTViewManager.h>

@interface RNTMapManager : RCTViewManager
@end

@implementation RNTMapManager

RCT_EXPORT_MODULE(MapView)
RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL)

- (UIView *)view
{
  return [[MKMapView alloc] init];
}

@end
```

### [[Fabric Component] Create the Native View](https://github.com/cortinico/RNNewArchitectureApp/commit/2d38c43a819a219b78ee244213da2b6d19acae0a)
Steps:
* Go to the `MapView/ios` folder
* Create a new header file `RNTMapView.h`
* Copy the following code:
```objective-c
#ifndef RNTMapView_h
#define RNTMapView_h

#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

@interface RNTMapView : RCTViewComponentView

@end

#endif /* RNTMapView_h */
```
* Create a new obbjective-c++ file `RNTMapView.mm`
* Copy the following code:
```c++
#import "RNTMapView.h"

#import <react/renderer/components/MapView/Props.h>
#import <react/renderer/components/MapView/RCTComponentViewHelpers.h>
#import <react/renderer/components/MapView/ComponentDescriptors.h>
#import <MapKit/MapKit.h>
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RNTMapView () <RCTMapViewViewProtocol>
@end

@implementation RNTMapView {
    MKMapView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<MapViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const MapViewProps>();
        _props = defaultProps;

        _view = [[MKMapView alloc] init];
        _view.zoomEnabled = defaultProps->zoomEnabled;

        self.contentView = _view;
    }

    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<MapViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<MapViewProps const>(props);

    if(oldViewProps.zoomEnabled != newViewProps.zoomEnabled) {
        _view.zoomEnabled = newViewProps.zoomEnabled;
    }
    [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MapViewCls(void)
{
    return RNTMapView.class;
}
```
* Open the `AwesomeApp/ios/Podfile`
* After the two requires, add this line: `install! 'cocoapods', :deterministic_uuids => false`
* After the `use_react_native` function, add the following line: `pod "MapView", :path => '../MapView'`
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
  If successful, you should see something like:
  ```
  Analyzing dependencies
  Downloading dependencies
  Installing MapView (0.0.1)
  Generating Pods project
  ```
* Open the `AwesomeApp.xcworkspace`
* In the `Pods` project, open the `Development Pods` group
* Search for `MapView` and check that there are the `RNTMapManager.mm`, the `RNTMapView.h` and the `RNTMapView.mm` files
* Select `AwesomeApp` in the Project navigator
* Select `AwesomeApp` in the Targets
* Select the `General` folder
* Scroll down until `Frameworks, Libraries, and Embedded Content`
* Add the `MapKit.framework` framework
* `cmd+b`

### [[Fabric Components] Connect the new component to JS](https://github.com/cortinico/RNNewArchitectureApp/commit/c45498a48b443d251a76dd6730eb9208cbbbe4a1)
Steps:
* Open the `App.js`
* Add the following import
```js
import MapView from './MapView/js/MapViewNativeComponent'
```
* When rendering the component, add the new MapView
```js
return
<MapView zoomEnabled={false} style={{width:'100%', height:'100%'}}/>
```
* Fix flow errors, if any
* `npx react-native run-ios`
* Observe the MapView on the screen. Try to pinch to see that the zoom is disabled.
* Change the `zoomEnabled` to `true`
* Try to pinch to see that the zoom is enabled.
