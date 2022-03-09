# Migration RUN

## Setup
* **React Nightly build:** 0.0.0-20220308-2009-c8067f1ff
* **HW:** Mac M1 Pro, 32 GB RAM
* **OS:** Monterey 12.2.1
* **Ruby:** rbenv with ruby 2.7.4 (If you have trouble installing it, try with `RUBY_CFLAGS=“-w” rbenv install 2.7.4`)
* **Node:** v16.14.0

## Steps

### [[Setup] react-native init]()
Steps:
1. `npx react-native init AwesomeApp` (when asked, install cocoapods using `gem`)
1. `cd AwesomeApp`
1. `npx react-native start`
1. `npx react-native run-ios`

### [[Setup] Change react native to nightly]()
Steps:
1. Open the `package.json`
1. Change the react native version to `0.0.0-20220308-2009-c8067f1ff`
1. `yarn install`
1. `npx react-native start`
1. `cd ios && pod install`
1. `open AwesomeApp.xcworkspace`
1. `cmd+B` -> error `No visible @interface for 'RCTBundleURLProvider' declares the selector 'jsBundleURLForBundleRoot:fallbackResource:'`
1. replace `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];` with `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];`
1. `cmd+B` -> success
1. `cmd+R` -> see the app running

### [[Native Modules] Create a native Module - iOS side]()
1. In Xcode, create a new group `CalendarModule` at the same level of `AwesomeApp`
1. Select the `CalendarModule` group and `cmd+N` to create a new file.
1. Choose `Header File` and call it `RCTCalendarModule`
1. Copy the following snippet in the file
```obj-c
#import <React/RCTBridgeModule.h>
@interface RCTCalendarModule : NSObject <RCTBridgeModule>
@end
```
1. Select the `CalendarModule` group and `cmd+N` to create a new file.
1. Choose `Objective-C File` and call it `RCTCalendarModule`
1. Set the membership to both `AwesomeApp` and `AwesomeAppTests`
1. Replace the file content with the following code:
```objective-c
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
1. `cmd+B` -> success
1. `cmd+R` -> success

### [[Native Modules] Test what You Have Built]()

1. Open the `App.js` file
1. Replace its content with the following:
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
  NativeModules, // Import the native modules
  Button
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

// Create an object with the calendar module
const { CalendarModule } = NativeModules;
const NewModuleButton: () => Node = () => {
  const onPress = () => {
    CalendarModule.createCalendarEvent('testName', `testLocation`);
  };

  return (
    <Button
      title="Click to invoke your native module!"
      color="#841584"
      onPress={onPress}
    />
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NewModuleButton />
    </SafeAreaView>
  );
};

export default App;
```
1. `npx react-native start`
1. `npx react-native run-ios`
1. Select the simulator.
1. `cmd+d`
1. Select `Debug on Chrome` (this should open a Chrome webpage)
1. `opt+shift+I` to open the developer tools
1. Reload the app in the simulator
1. Tap on the button -> observe the `Pretending to create an event testName at testLocation` message on the screen

### [[Native Modules] Better Native Module Export]()
1. Create a new file `CalendarModule.js` at the same level of `App.js`
1. Add this content
    ```js
    /**
    * This exposes the native CalendarModule module as a JS module. This has a
    * function 'createCalendarEvent' which takes the following parameters:

    * 1. String name: A string representing the name of the event
    * 2. String location: A string representing the location of the event
    */
    import { NativeModules } from 'react-native';
    const { CalendarModule } = NativeModules;
    export default CalendarModule;
    ```
1. Update the code in the `App.js` file:
    1. Remove `  NativeModules, // Import the native modules`
    1. Remove `// Create an object with the calendar module`
    1. Remove `const { CalendarModule } = NativeModules;`
    1. Add `import CalendarModule from './CalendarModule';`
1. Reload the app in the simulator
1. Press on the button
1. Observe the same `Pretending to create an event testName at testLocation` message appearing in the console

### [[Native Components] iOS Native UI Component]()

1. In Xcode, create a new group and call it `RCTMapView`
1. `cmd+N`
1. Select `Objective-C File`
1. Call it `RCTViewManager`
1. Set the membership to both `AwesomeApp` and `AwesomeAppTest`
1. Replace the content of the newly created file with:
    ```obj-c
    #import <MapKit/MapKit.h>

    #import <React/RCTViewManager.h>

    @interface RNTMapManager : RCTViewManager
    @end

    @implementation RNTMapManager

    RCT_EXPORT_MODULE(RNTMap)

    RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL)

    - (UIView *)view
    {
    return [[MKMapView alloc] init];
    }

    @end
    ```
1. `cmd+b` -> success
1. `cmd+r` -> success

### [[Native Components] Connect iOS component to JS]()
1. Create a new `MapView.js` file, at the same level of the `App.js` file
1. Replace its content with:
    ```js
    import { requireNativeComponent } from 'react-native';

    // requireNativeComponent automatically resolves 'RNTMap' to 'RNTMapManager'
    module.exports = requireNativeComponent('RNTMap');
    ```
1. Open the `App.js` file
1. Add the `import MapView from './MapView.js';` statement
1. Add the `<MapView style={{ width: "100%", height: "100%" }} />` statement below the `<NewModuleButton />`
1. Save and see that a map appears in the simulator. You can pinch-to-zoom (to zoom, keep the `opt` key pressed), and drag it.
1. Update the `MapView` component with the `zoomEnabled={false}` attribute.
1. Observe that the zoom is now disabled.

### [[Library Prerequisites] Writing the JavaScript Spec]()
1. In Xcode, select the calendar module
1. Create a new file called `NativeCalendarModule.js`
1. Replace its content with the following:
    ```js
    // @flow strict-local

    import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
    import {TurboModuleRegistry} from 'react-native';

    export interface Spec extends TurboModule {
    // your module methods go here, for example:
    createCalendarEvent(name: string, location: string): void;
    }

    export default (TurboModuleRegistry.get<Spec>('CalendarModule'): ?Spec);
    ```

### [[Library Prerequisites] Enable Autolinking - Add podspec file]()
1. In Xcode, select the calendar module group
1. Create a new file called `react-native-calendar-module.podspec`
1. Replace the content of the file with the following:
    ```ruby
    Pod::Spec.new do |s|
    s.name            = "CalendarModule"
    s.version         = "0.0.1"
    s.summary         = "Calendar Module"
    s.description     = "Calendar Module"
    s.homepage        = "https://github.com/facebook/react-native.git"
    s.license         = "MIT"
    s.platforms       = { :ios => "11.0" }
    s.author          = "Riccardo Cipolleschi"
    s.source          = { :git => "https://github.com/facebook/react-native.git", :tag => "#{s.version}" }

    s.source_files    = "./**/*.{h,m,mm,swift}"
    end
    ```

### [[Turbo Modules - Library Support] Update podspecs for new Architecture]()
1. Open the `ios/CalendarModule/react-native-calendar-module.podspec`
1. Add the following lines before the `Pod::Spec.new` block:
    ```ruby
    # folly_version must match the version used in React Native
    # See folly_version in react-native/React/FBReactNativeSpec/FBReactNativeSpec.podspec
    folly_version = '2021.06.28.00-v2'
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
    ```
1. Add the following lines before the `end` tag
    ```ruby
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
    ```

### [[Turbo Modules - Library Support] Enable CodeGen in Package.json]()
1. Open `package.json`
1. Append the following code before the final `}`
    ```json
        ,
        "codegenConfig": {
        "libraries": [
            {
            "name": "CalendarModule",
            "type": "modules",
            "jsSrcsDir": "ios/CalendarModule"
            }
          ]
        }
    ```
### [[Turbo Modules - App Prerequisites] Install CodeGen]()
1. In the root of the project, run `yarn add react-native-codegen`

### [[Turbo Modules - App Support] Enable Hermes (iOS)]()
1. Open the `ios/Podfile`
1. Switch the `hermes_enabled` from `false` to `true`
1. Run `pod install`
1. Open `AwesomeApp.xcworkspace`
1. `cmd+b` -> success

**ISSUE:**
When enabling Hermes, the app builds but fails at runtime. At start-up, we get a `EXC_BAD_ACCESS` error in the `Inspector::installLogHandler()` function, when executing the statement `auto console = jsi::Object(rt);`.
Let's continue with the Playbook to see if it get fixed with some of the next changes.

### [[Turbo Modules - App Support] Enable C++17 (iOS)]()
1. Open the `AwesomeApp.xcworkspace` file
1. Select the project in the project navigator
1. Select the `AwesomeApp` project, in the projects panel
1. Select the `Build Settings` tab
1. Search for the `CLANG_CXX_LANGUAGE_STANDARD` property
1. Change it to `C++17`
1. `cmd+b` -> success

**ISSUE:**
The build can't still run

### [[Turbo Modules - App Support] Use Objective-C++ (iOS)]()
1. Open the `AwesomeApp.xcworkspace` file
1. Rename all the `.m` files in `.mm`. The files to be updated are:
    * `RCTViewManager.m`
    * `RCTCalendarModule.m`
    * `AppDelegate.m`
    * `main.m`
1. `cmd+b` -> Fails: The MKMapView is not found.
1. Select the `AwesomeApp` project in the project navigator
1. Select the `AwesomeApp` target in the `Targets` pane
1. Scroll down until we find the `Frameworks, Libraries, and Embedded Content`
1. Click on the `+` and manually add the `MapKit.framework` framework
1. `cmd+b` -> success

**ISSUE:**
The build can't still run

### [[Turbo Modules - App Support] Provide RCTCxxBridgeDelegate]()
1. Open the `AppDelegate.mm` file
1. Add the following imports:
    ```objective-c
    #import <reacthermes/HermesExecutorFactory.h>
    #import <React/RCTCxxBridgeDelegate.h>
    #import <React/RCTJSIExecutorRuntimeInstaller.h>
    ```
1. Add the following protocol conformance:
    ```objective-c
    @interface AppDelegate () <RCTCxxBridgeDelegate> {

    }
    @end
    ```
1. Add the following method implementation:
    ```objective-c
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
1. `cmd+b` -> failure. The app fails due to `'folly/folly-config.h' file not found`
**ISSUES**
When importing `<reacthermes/HermesExecutorFactory.h>`, we also need to enable folly. To do so:
1. Select the `AwesomeApp` project in the Project Navigator
1. Select the `AwesomeApp` target in the Target panel
1. Select the `Build Settings` tab
1. Search for `Compiler Flags`
1. Double click on the `Other C++ Flags/Debug`
1. Add the following flags `-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32`
1. Repeat for the `Other C++ Flags/Release` flags
1. `cmd+b` -> The app builds successfully

The build can't still run

### [[Turbo Modules] Provide a TurboModuleManager Delegate]()
1. Open the `AppDelegate.mm`
1. Add the following imports:
    ```objective-c
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
1. Update the AppDelegate interface with the following code:
    ```objective-c
    @interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
    RCTTurboModuleManager *_turboModuleManager;
    }
    @end
    ```
1. Add the implementation of the `RCTTurboModuleManagerDelegate` methods:
    ```objective-c
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
1. `cmd+b` -> success
**ISSUES**
The app still can't run

### [[Turbo Modules] Install TurboModuleManager JavaScript Bindings]()
1. Open the `AppDelegate.mm`
2. Update the code of the `jsExecutorFactoryForBridge` with the following:
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

    return std::make_unique<facebook::react::HermesExecutorFactory>(
        facebook::react::RCTJSIExecutorRuntimeInstaller(
            [weakSelf, bridge](facebook::jsi::Runtime &runtime) {
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
            }
        )
    );
    ```
1. `cmd+b` -> success

**ISSUES**
- The code in the websites suggests to use `JSCExecutorFactory` in the final factory, but this is an abstract object. It should be replaced by `HermesExecutorFactory`.
