# New Architecture Run

## Setup

React build: 0.68.0-rc.4
HW: Mac M1 Pro, 32 GB RAM
OS: Monterey 12.3
Ruby: rbenv with ruby 2.7.4 (If you have trouble installing it, try with RUBY_CFLAGS=“-w” rbenv install 2.7.4)
Node: v16.14.0

## Guide and Checkpoint

This Run creates a new project with ReactNative using typescript and migrates it to the new architecture. Then, it creates a Turbo Module and a Fabric Component and it integrates them with the app.

There are a few commits that, if checked out, are interesting points to start with.

- [Initial Project]()
- [Working New Architecture Project]()
- [Project with a Turbo Module]()
- [Project with a Fabric Component]()

## Steps

### [[Setup] react-native init]()

1. run `npx react-native init AwesomeApp --template react-native-template-typescript`
1. `cd AwesomeApp`
1. `npx react-native start`
1. `npx react-native run-ios`

### [[Setup] Set the release candidate version of React Native]()

1. Open the `AwesomeApp/package.json`
1. Update the `react-native` dependencies' version to `0.68.0-rc.4`
1. `yarn install`
1. `cd ios && pod install`
1. Fix build error in `AppDelegate.m` by replacing the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];` with the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];`
1. Run the app in Xcode to make sure it builds and runs.

### [[Setup] Install CodeGen]()

1. `yarn add react-native-codegen`
1. `cd ios && pod install`
1. `npx react-native start`
1. `npx react-native run-ios`

### [[Setup] Enable Hermes]()

1. Open the `Podfile`
1. Change `:hermes_enabled` to `true`
1. `cd ios && pod install`
1. `open AwesomeApp.xcworkspace`
1. `cmd+r` -> the app builds but when it runs, it crashes.

### [[Setup] Enable C++17]()

1. Open `AwesomeApp.xcworkspace`
1. Select the `AwesomeAppproject` in the project navigator
1. Select the `AwesomeApp project` in the Projects panel
1. Select the Build Settings tab
1. Search for `CLANG_CXX_LANGUAGE_STANDARD`
1. Select the C++17 option
1. `cmd+r`

### [[Setup] Update the code to use Objective-C++]()

1. Open `AwesomeApp.xcworkspace`
1. Rename the `AwesomeApp/main.m` to `AwesomeApp/main.mm`
1. Rename the `AwesomeApp/AppDelegate.m` to `AwesomeApp/AppDelegate.mm`
1. `cmd+r`

**Note:** Doing this from Xcode will also update the Xcodeproject file

### [[Setup] Provide a RCTCxxBridgeDelegate]()

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

### [[Turbo Modules] Provide a TurboModuleManager Delegate]()

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

### [[Turbo Modules] Install TurboModuleManager JavaScript Bindings]()

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

### [[Turbo Modules] Enable TurboModule System]()

* Open `AwesomeApp.xcworkspace`
* Open `AwesomeApp/AppDelegate.mm`
* Add the `RCTEnableTurboModule(YES);` as first line of the `(BOOL)application:didFinishLaunchingWithOptions:` method
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
* `cmd+b`
* `cmd+r`

The error is caused by a module used by the app to load images that requires some custom parameter at init time to work properly.

### [[Fabric] Enable Fabric in Podfile]()

* Open `AwesomeApp/Podfile`
* Before the `:enable_hermes => true` line, add the following lines:
    * `:app_path => "#{Dir.pwd}/..",`
    * `:fabric_enabled => true,`
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
* Open `AwesomeApp.xcworkspace`
* `cmd+r`

### [[Fabric] Update your RootView]()

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

### [[TurboModules] Create a Calendar Module]()
Steps:
* At the same level of `AwesomeApp`, create a folder named `Calendar`
* Create a folder `Calendar/ios`.
* Open Xcode and create a static library there (Make sure that the `Create Git Repository` checkbox is unchecked).
* Update the `RCTCalendarModule.h` file with this code:
```objective-c
//  RCTCalendarModule.h
#import <React/RCTBridgeModule.h>
@interface RCTCalendarModule : NSObject <RCTBridgeModule>
@end
```
* Update the ``RCTCalendarModule.m` file with this code:
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
* Make sure that the `Calendar.xcodeproj` is a direct child of the `ios` folder.

### [[Turbo Modules] Define TypeScript Specs]()
Steps:
* In the `Calendar` folder, create a `js` folder
* Create a `NativeCalendar.ts` file
* Add the following code:
```ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  createCalendarEvent(name: string, location: string): void;
}

export default TurboModuleRegistry.get<Spec>('CalendarModule');
```
