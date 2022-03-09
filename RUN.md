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
