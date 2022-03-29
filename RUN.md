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

- [Initial Project](#setup)
- [Working New Architecture Project](#working-project)
- [Project with a Turbo Module](#working-tm)
- [Project with a Fabric Component](#working-fc)

## Steps

### <a name="setup" />[[Setup] react-native init](https://github.com/react-native-community/RNNewArchitectureApp/commit/52b6964fdd362ffdfecc92b66116d57ce978d6a0)

1. run `npx react-native init AwesomeApp --template react-native-template-typescript`
1. `cd AwesomeApp`
1. `npx react-native start`
1. `npx react-native run-ios`

### [[Setup] Set the release candidate version of React Native](https://github.com/react-native-community/RNNewArchitectureApp/commit/c9f98c52491ee9880e4537bf9408b71a9833719d)

1. Open the `AwesomeApp/package.json`
1. Update the `react-native` dependencies' version to `0.68.0-rc.4`
1. `yarn install`
1. `cd ios && pod install`
1. Fix build error in `AppDelegate.m` by replacing the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];` with the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];`
1. Run the app in Xcode to make sure it builds and runs.

### [[Setup] Install CodeGen](https://github.com/react-native-community/RNNewArchitectureApp/commit/5eb2acfdfebcd617bf2e00ad9bba95cccdd65741)

1. `yarn add react-native-codegen`
1. `cd ios && pod install`
1. `npx react-native start`
1. `npx react-native run-ios`

### [[Setup] Enable Hermes](https://github.com/react-native-community/RNNewArchitectureApp/commit/30dc915c37ee7f86ffd2c3f967e764cf8cf592cd)

1. Open the `Podfile`
1. Change `:hermes_enabled` to `true`
1. `cd ios && pod install`
1. `open AwesomeApp.xcworkspace`
1. `cmd+r` -> the app builds but when it runs, it crashes.

### [[Setup] Enable C++17](https://github.com/react-native-community/RNNewArchitectureApp/commit/0461f8fbe79c2ad2a7344e602d7027b63cc10300)

1. Open `AwesomeApp.xcworkspace`
1. Select the `AwesomeAppproject` in the project navigator
1. Select the `AwesomeApp project` in the Projects panel
1. Select the Build Settings tab
1. Search for `CLANG_CXX_LANGUAGE_STANDARD`
1. Select the C++17 option
1. `cmd+r`

### [[Setup] Update the code to use Objective-C++](https://github.com/react-native-community/RNNewArchitectureApp/commit/8d26c93c76524c33c8b12146932cbceaeb0a5d12)

1. Open `AwesomeApp.xcworkspace`
1. Rename the `AwesomeApp/main.m` to `AwesomeApp/main.mm`
1. Rename the `AwesomeApp/AppDelegate.m` to `AwesomeApp/AppDelegate.mm`
1. `cmd+r`

**Note:** Doing this from Xcode will also update the Xcodeproject file

### [[Setup] Provide a RCTCxxBridgeDelegate](https://github.com/react-native-community/RNNewArchitectureApp/commit/8fe638ae622b79a8f6b78ea2b2637d86784df73c)

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

### [[Turbo Modules] Provide a TurboModuleManager Delegate](https://github.com/react-native-community/RNNewArchitectureApp/commit/e4de6f982630ecd024731b590843a7c10773320d)

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

### [[Turbo Modules] Install TurboModuleManager JavaScript Bindings](https://github.com/react-native-community/RNNewArchitectureApp/commit/09368225e60b73e0a20502569f25403dd3839a83)

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

### [[Turbo Modules] Enable TurboModule System](https://github.com/react-native-community/RNNewArchitectureApp/commit/96ad6702211ffe2e016d9067e1175153679c019f)

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

### [[Fabric] Enable Fabric in Podfile](https://github.com/react-native-community/RNNewArchitectureApp/commit/830f5197949dc331a0688cb776495d605caed00c)

* Open `AwesomeApp/Podfile`
* Before the `:enable_hermes => true` line, add the following lines:
    * `:app_path => "#{Dir.pwd}/..",`
    * `:fabric_enabled => true,`
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
* Open `AwesomeApp.xcworkspace`
* `cmd+r`

### <a name="working-project" />[[Fabric] Update your RootView](https://github.com/react-native-community/RNNewArchitectureApp/commit/4dff69f748a7c673e489b408c74e434d130f3731)

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

### [[TurboModules] Create a Calendar Module](https://github.com/react-native-community/RNNewArchitectureApp/commit/5eb659f8c442f5add49496e904dade1bb032c7a5)

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
* Update the `RCTCalendarModule.m` file with this code:
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

### [[Turbo Modules] Define TypeScript Specs](https://github.com/react-native-community/RNNewArchitectureApp/commit/8cdf2d32fdd2a989a2b4552c8aedb187136de30a)

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

### [[Turbo Modules] Configure podspec for codegen](https://github.com/react-native-community/RNNewArchitectureApp/commit/e7ba354715b57877bb6497c09635d4fbdbd825df)

* In the `Calendar` group, create a `Calendar.podspec` file
* Copy the following code:
```ruby
folly_version = '2021.06.28.00-v2'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name            = "Calendar"
  s.version         = "0.0.1"
  s.summary         = "Calendar"
  s.description     = "Calendar"
  s.homepage        = "https://github.com/facebook/react-native.git"
  s.license         = "MIT"
  s.platforms       = { :ios => "11.0" }
  s.author          = ""
  s.source          = { :git => "https://github.com/facebook/react-native.git", :tag => "#{s.version}" }

  s.source_files    = "ios/**/*.{h,m,mm,swift}"

  s.compiler_flags  = folly_compiler_flags

  s.pod_target_xcconfig    = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\""
  }

  s.dependency "React"
  s.dependency "React-RCTFabric"
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly", folly_version
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"
end
```

### [[Turbo Modules] Enable codegen in `package.json`](https://github.com/react-native-community/RNNewArchitectureApp/commit/d23730f64e00a6a0e840b34ee7c02c181ce86d3a)

* Create a `package.json` file in the `Calendar` folder
* Add the following code in it:
```json
{
  "name": "calendar",
  "version": "0.0.1",
  "description": "Calendar module",
  "files": [
      "js",
      "android",
      "ios",
      "Calendar.podspec",
      "!android/build",
      "!ios/build",
      "!**/__tests__",
      "!**/__fixtures__",
      "!**/__mocks__"
  ],
  "keywords": ["react-native", "ios", "android"],
  "codegenConfig": {
    "libraries": [
      {
        "name": "CalendarSpec",
        "type": "modules",
        "jsSrcsDir": "js"
      }
    ]
  }
}
```
* Go into the `AwesomeApp` folder
* run `yarn add ../Calendar`
* `cd ios`
* Generate the code by running `RCT_NEW_ARCH_ENABLED=1 pod install`. If successful, you should see some lines like these:
```
#...
[Codegen] >>>>> Processing Calendar
[Codegen] Generated schema: /var/folders/b7/5gvyd0914t15w42kwy1k_l600000gn/T/CalendarPwcu5h/schema.json
[Codegen] Generated artifacts: /Users/cipolleschi/Community/RNNewArchitectureApp/AwesomeApp/ios/build/generated/ios/Calendar
#...
```
* `cmd+b`
* `cmd+r`

### [[Turbo Modules] Extend or implement the code-generated native interfaces](https://github.com/react-native-community/RNNewArchitectureApp/commit/c3b387ad74634218eff422ee2e32ee77d8cd370a)

* Rename the `RCTCalendarModule.m` into `RCTCalendarModule.mm`
* Open the `RCTCalendarModule.mm` file
* Add the following import:
```objective-c
#import "CalendarSpec.h"
```
* Add the following snippet before the `@end` to connect the component with the generated interface
```c++
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeCalendarSpecJSI>(params);
}
```
* From the `AwesomeApp` folder, run `yarn remove calendar && yarn add ../Calendar`
* Run `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`
* `cmd+b`
* `cmd+r`

### <a name="working-tm" />[[Turbo Modules] Test the Calendar Module in TypeScript](https://github.com/react-native-community/RNNewArchitectureApp/commit/4bb807a19786a48cf743d83458dba5a47186f786)

* Replace the content of the `App.ts` file with the following:
```js
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
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
import CalendarModule from 'calendar/js/NativeCalendar';
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
* Run `npx react-native start`
* Run `npx react-native run-ios`
* Open the `AwesomeApp.xcworkspace`
* Set a breakpoint on line 11 of the `RCTCalendarModule.mm` file (the `RCTLogInfo` line)
* Tap on the Button on the screen and observe the app stopping at the breakpoint.

### [[Fabric Component] Create the TypeScript Spec](https://github.com/react-native-community/RNNewArchitectureApp/commit/38a3d290ad6460423d1c25cfbafbbd47635d8be7)

* At the same level of the `AwesomeApp` folder, create a `MapView/js` folder
* Create a new file `MapViewNativeComponents.ts`
* Add this code to the file:
```ts
import type { ViewProps } from 'ViewPropTypes';
import type { HostComponent } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  zoomEnabled: boolean,
}

export default codegenNativeComponent<NativeProps>(
  'MapView',
) as HostComponent<NativeProps>;
```

### [[Fabric Components] Create the podspec file and generate the code](https://github.com/react-native-community/RNNewArchitectureApp/commit/a9cb4ea01dbd3cfaa56bb5bc38c41763c9c88ea7)

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

  s.source_files    = "ios/**/*.{h,m,mm,cpp,swift}"
end
```
* Create a `MapView/package.json` file
* Paste the following code into it:
```json
{
  "name": "map-view",
  "version": "0.0.1",
  "description": "MapView module",
  "files": [
      "js",
      "android",
      "ios",
      "Calendar.podspec",
      "!android/build",
      "!ios/build",
      "!**/__tests__",
      "!**/__fixtures__",
      "!**/__mocks__"
  ],
  "keywords": ["react-native", "ios", "android"],
  "codegenConfig": {
      "libraries": [
          {
            "name": "MapViewSpec",
            "type": "components",
            "jsSrcsDir": "js"
          }
      ]
  }
}
```
* Navigate to the `AwesomeApp` directory
* Run `yarn add ../MapView`
* Generate the code running `cd ios && RCT_NEW_ARCH_ENABLED=1 pod install`

If successfull, you should see something like this:
```
[Codegen] >>>>> Processing MapViewSpec
[Codegen] Generated schema: /var/folders/b7/5gvyd0914t15w42kwy1k_l600000gn/T/MapViewSpeckIve9n/schema.json
[Codegen] Generated artifacts: /Users/cipolleschi/Community/RNNewArchitectureApp/AwesomeApp/ios/build/generated/ios/react/renderer/components/MapViewSpec
```

### [[Fabric Component] Create the Native ViewManager](https://github.com/react-native-community/RNNewArchitectureApp/commit/48161e4d311d4d3a019643efb2113e8f9f8ca3c6)

* Go to the `MapView` folder.
* Create a new folder and name it `ios`.
* From Xcode, create a new static library `MapView`.
* Make sure that the `MapView.xcodeproj` is a direct child of the `ios` folder.
* Rename the files `MapView.m` and `MapView.h` in `RCTMapView.mm` and `RCTMapView.h`
* In the `MapView` folder, Create a new file called `RNTMapManager.mm`.
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

### [[Fabric Component] Create the Native View](https://github.com/react-native-community/RNNewArchitectureApp/commit/0533b9246f5c9c3c8db0f98a4185499cfef8ea41)

* Go to the `MapView/ios/MapView` folder
* Open the `RCTMapView.h`
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
* Open the `RCTMapView.mm`
* Copy the following code:
```c++
#import "RCTMapView.h"

#import <react/renderer/components/MapViewSpec/Props.h>
#import <react/renderer/components/MapViewSpec/RCTComponentViewHelpers.h>
#import <react/renderer/components/MapViewSpec/ComponentDescriptors.h>
#import <MapKit/MapKit.h>
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RCTMapView () <RCTMapViewViewProtocol>
@end

@implementation RCTMapView {
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
    return RCTMapView.class;
}
```
* Open the `AwesomeApp/ios/Podfile`
* After the two requires, add this line: `install! 'cocoapods', :deterministic_uuids => false`
* Run `RCT_NEW_ARCH_ENABLED=1 pod install`
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

### <a name="working-fc" />[[Fabric Components] Connect the new component to TypeScript](https://github.com/react-native-community/RNNewArchitectureApp/commit/6916a61df0f552cf23451ba91a5de894a19fc7c5)

* Navigate to the `AwesomeApp` root folder
* run `yarn add react-native-codegen`
* open the `babel.config.js`
* Add the following code:
```js
plugins: [
    '@babel/plugin-proposal-class-properties',
    './node_modules/react-native/packages/babel-plugin-codegen'
]
```
* Move to the `ios` folder
* Run `RCT_NEW_ARCH_ENABLED=1 pod install`
* Open the `App.ts`
* Add the following import
```ts
import MapView from 'map-view/js/MapViewNativeComponents';
```
* When rendering the component, add the new MapView
```jsx
<MapView style={{width:'100%', height:'100%'}} zoomEnabled={false}/>
```
* `npx react-native run-ios`
* Observe the MapView on the screen. Try to pinch to see that the zoom is disabled.
* Change the `zoomEnabled` to `true`
* Try to pinch to see that the zoom is enabled.
