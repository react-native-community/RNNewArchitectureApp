# Playground run
- Nightly build: 20220307-2008

## Setup:
* Mac M1 Pro, 32 GB RAM
* Monterey 12.2.1
* rbenv with ruby 2.7.0 (If you have trouble installing it, try with `RUBY_CFLAGS=“-w” rbenv install 2.7.0`)

## Steps (From most recent to least recent command)

### [[TurboModules] Enable TurboModules system]()
Steps:
1. Open the `AppDelegate.mm` file in Xcode
2.

### [[TurboModules] Install TurboModuleManager JavaScript Bindings]()
Steps:
1. Open the `AppDelegate.mm` file in Xcode
2. Add the `jsExecutorFactoryForBridge:(RCTBridge *)bridge` method
    ```objective-c
    - (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
    {
    _turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                                delegate:self
                                                                jsInvoker:bridge.jsCallInvoker];
    return RCTAppSetupDefaultJsExecutorFactory(bridge, _turboModuleManager);
    }
    ```
_Note:_ The nightly build will perform these steps for you, but the code if guarded by a `#if RCT_NEW_ARCH_ENABLED` compilation pragma.


### [[TurboModules] Provide TurboModulesManagerDelegate]()
Steps:
1. Open the `AppDelegate.mm` file in Xcode
2. If not already there, add the following imports:
    ```objective-c
    #import <ReactCommon/RCTTurboModuleManager.h>
    #import <React/CoreModulesPlugins.h>
    ```
3. Make sure that the `AppDelegate` conforms to the `RCTTurboModuleManagerDelegate` by adding a protocol conformance in a category
    ```objective-c
    @interface AppDelegate () <RCTTurboModuleManagerDelegate> {
    RCTTurboModuleManager *_turboModuleManager;
    }
    @end
    ```
4. Implement the `getModuleClassFromName:` method
    ```objective-c
    @implementation AppDelegate
    // ...
    - (Class)getModuleClassFromName:(const char *)name
    {
    return RCTCoreModulesClassProvider(name);
    }
    // ...
    @end
    ```
5. Implement the `getTurboModule:jsInvoker:` method
    ```objective-c
    - (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                        jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
    {
    return nullptr;
    }
    ```
6. Implement the `getModuleInstanceFromClass:moduleClass:` method
    ```objective-c
    - (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
    {
    return RCTAppSetupDefaultModuleFromClass(moduleClass);
    }
    ```

_Note:_ The nightly build will perform these steps for you, but the code if guarded by a `#if RCT_NEW_ARCH_ENABLED` compilation pragma.

### [[TurboModules] Provide RCTCxxBridgeDelegate]()
Steps:
1. Open the `ios/AwesomeApp.xcworkspace` file
2. Open the `AppDelegate.mm`
3. If the headers are not there, include the following headers:
    ```objective-c
#import <reacthermes/HermesExecutorFactory.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTJSIExecutorRuntimeInstaller.h>
    ```
4. Make sure to add the protocol conformance to `RCTCxxBridgeDelegate` by adding the following snippet
    ```objective-c
    @interface AppDelegate () <RCTCxxBridgeDelegate> {
    // ...
    }
    @end

    @implementation
    - (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
    {
    return std::make_unique<facebook::react::HermesExecutorFactory>(facebook::react::RCTJSIExecutorRuntimeInstaller([bridge](facebook::jsi::Runtime &runtime) {
        if (!bridge) {
            return;
        }
        })
    );
    }
    @end
    ```
5. Run `cmd+B` to check that it builds

_Note:_ The nightly build will perform these steps for you, but the code if guarded by a `#if RCT_NEW_ARCH_ENABLED` compilation pragma. The only required step is to add the `#import <reacthermes/HermesExecutorFactory.h>` and the `#import <React/RCTJSIExecutorRuntimeInstaller.h>` imports.

### [[TurboModules] Use Objective-C++]()
Steps:
1. Open the `ios/AwesomeApp.xcworkspace` file
2. Rename every file with the `.m` extension in the `.mm` extension. _Note:_ By doing this from Xcode, the Xcodeproj will be updated accordingly.
3. Run `cmd+B` to try and build it. It will end up in an error
4. In Xcode, select the `AwesomeApp` project in the project navigator
5. Select the `AwesomeApp` target in the `Target` pane
6. Select the general tab
7. Scroll down until the `Framework, Libraries, and Embedded Content` appears
8. Press on the `+` button and manually add the `MapKit.framework` framework
9. Run `cmd+B` and see the project builds


CI:
1. `cd ios`
2. ```sh
    folders=("AwesomeApp" "RCTCalendarModule" "AwesomeAppTests")
    for folder in $folders
    do
        cd $folder
        for f in *.m
            mv $f $f"m"
        cd ..
    done
    ```
3. _Note:_ Need to understand how to manipulate the xcodeproj safely.

### [[TurboModules] Add C++17 support]()
Steps
1. Open Xcode and select AwesomeApp
1. Select AwesomeApp from the `Project` section (**not the target one**)
1. Select build settings
1. Search for `CLANG_CXX_LANGUAGE_STANDARD`
1. Make sure that it states `c++17`

CI (on MacOS)
1. `sed -i'.original' 's/CLANG_CXX_LANGUAGE_STANDARD = \".*\";/CLANG_CXX_LANGUAGE_STANDARD = \"c++17\";/' ios/AwesomeApp.xcodeproj/project.pbxproj`
1. `rm AwesomeApp.xcodeproj/project.pbxproj.original`

CI (on Linux)
1. `sed -i 's/CLANG_CXX_LANGUAGE_STANDARD = \".*\";/CLANG_CXX_LANGUAGE_STANDARD = \"c++17\";' ios/AwesomeApp.xcodeproj/project.pbxproj`

### [[TurboModules] Enable Hermes]()
Steps
1. Open the `ios/podfile`
1. Change `hermes_enabled` to `true`
1. run `pod install`

CI (on MacOS)
1. `sed -i'.original' 's/flags\[:hermes_enabled\],/true,/' ios/Podfile`
1. `rm 'ios/Podfile.original'`
CI (on Linux)
1. `sed -i 's/flags\[:hermes_enabled\],/true,/' ios/Podfile`

### [[TurboModules] Add React Native Codegen]()
Steps
1. `yarn add react-native-codegen`

CI:
1. `yarn add react-native-codegen`

### [[TurboModules] Enable Codegen in package.json]()
Steps:
1. Open `package.json`
1. Add the following code:
    ```json
    ,
    "codegenConfig": {
        "libraries": [
            {
            "name": "CalendarModule",
            "type": "modules",
            "jsSrcsDir": "ios/RCTCalendarModule"
            },
            {
            "name": "CalendarModule",
            "type": "components",
            "jsSrcsDir": "ios/RCTCalendarModule"
            }
        ]
    }
    ```

CI:
1. `initialPackage=$(sed \$d package.json)`
2. ```sh
    codeGen=',
  "codegenConfig": {
    "libraries": [
      {
        "name": "CalendarModule",
        "type": "modules",
        "jsSrcsDir": "ios/RCTCalendarModule"
      }
    ]
  }
}'
    ```
3. `echo $initialPackage$codeGen > package.json`



### [[TurboModules] Enable AutoLinking]()
Steps:
1. Create a new folder called `RCTCalendarModule`
1. Move the `RCTCalendarModule.m` and the `RCTCalendarModule.h` to that folder
1. Move the `NativeCalendarModule.js` file into the     `RCTCalendarModule` folder
1. Create a `react-native-calendar-module.podspec` file, using the following content
    ```ruby
    folly_version = '2021.06.28.00-v2'
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    Pod::Spec.new do |s|
        s.name         = 'RCTCalendarModule'
        s.version      = '0.0.1'
        s.summary      = 'Sample module for migration'
        s.license      = 'MIT'
        s.authors      = 'cipolleschi'
        s.platforms    = { :ios => "9.0", :osx => "10.13" }
        s.compiler_flags  = folly_compiler_flags

        s.pod_target_xcconfig    = {
            "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\""
        }

        s.source       = { :git => "https://github.com/facebook/react-native.git",
            :tag => spec.version.to_s
        }
        s.source_files  = "./**/*.{h,m,mm}"

        s.dependency "React"
        s.dependency "React-RCTFabric" # This is for fabric component
        s.dependency "React-Codegen"
        s.dependency "RCT-Folly", folly_version
        s.dependency "RCTRequired"
        s.dependency "RCTTypeSafety"
        s.dependency "ReactCommon/turbomodule/core"
    end
    ```

CI:
1. `cd ios && mkdir RCTCalendarModule`
1. `mv RCTCalendarModule.h  RCTCalendarModule/RCTCalendarModule.h`
1. `mv RCTCalendarModule.m  RCTCalendarModule/RCTCalendarModule.m`
1. `mv ../NativeCalendarModule.js ios/RCTCalendarModule/NativeCalendarModule.js`
1. ```sh
    echo "folly_version = '2021.06.28.00-v2'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
    s.name         = 'RCTCalendarModule'
    s.version      = '0.0.1'
    s.summary      = 'Sample module for migration'
    s.license      = 'MIT'
    s.authors      = 'Meta, Inc. and its affiliates'
    s.platforms    = { :ios => "9.0", :osx => "10.13" }
    s.compiler_flags  = folly_compiler_flags

    s.pod_target_xcconfig    = {
        \"HEADER_SEARCH_PATHS\" => \"\\\"\$(PODS_ROOT)/boost\\\"\"
    }

    s.source       = { :git => \"https://github.com/facebook/react-native.git\",
        :tag => spec.version.to_s
    }
    s.source_files  = \"./**/*.{h,m,mm,swift}\"

    s.dependency \"React\"
    s.dependency \"React-RCTFabric\" # This is for fabric component
    s.dependency \"React-Codegen\"
    s.dependency \"RCT-Folly\", folly_version
    s.dependency \"RCTRequired\"
    s.dependency \"RCTTypeSafety\"
    s.dependency \"ReactCommon/turbomodule/core\"
end
    " > RCTCalendarModule/react-native-calendar-module.podspec
1. **Note:** We need to understad how to manipulate the xcodeproj when moving/adding files.

### [[TurboModules] Create CalendarModule spec]()
Commands:
1. Remove the old `NativeCalendarModule.js`
1. Create a new file named `NativeCalendarModule.js`
2. Copy the following snippet:
    ```js
    'use strict';

    import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
    import {TurboModuleRegistry} from 'react-native';

    export interface Spec extends TurboModule {
        +getConstants: () => {|
            "DEFAULT_EVENT_NAME": "New Event"
        |};

        getString(id: string): Promise<string>;
    }

    export default (TurboModuleRegistry.get<Spec>('CalendarModule'): ?Spec);
    ```


#### CI:
1. Remove Native Calendar Module: `rm NativeCalendarModule.js`
1. Add Specs
    """sh
    echo "'use strict';

import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    +getConstants: () => {|
        \"DEFAULT_EVENT_NAME\": \"New Event\"
    |};

    getString(id: string): Promise<string>;
}

export default (TurboModuleRegistry.get<Spec>('CalendarModule'): ?Spec);" > NativeCalendarModule.js
    """

### SNAPSHOT
This commit can be used to create a project template `react-native-objc-migration`. This can be used as starting point for a CI pipeline to test the migration from `NativeModule` and `NativeComponents` to `TurboModules` and `Fabric`.

### [[Native Components] Expose a native property]()
1. Open the `RNTMapManager.m` file
2. Add the following line:
    ```obj-c
    RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL)
    ```
3. Open the `App.js` file
4. Use the property on the component:
    ```js
    <MapView zoomEnabled={false} style={{ width: "100%", height: "100%" }} />
    ```
5. Run `npx react-native run-ios`
6. Try to pinch and zoom the map. Observe that you can't zoom.



### [[Native Components] Connect the MapManager in JS]()
1. Create a new file `MapView.js`
1. Paste the following snippet:
    ```js
    // MapView.js

    import { requireNativeComponent } from 'react-native';

    // requireNativeComponent automatically resolves 'RNTMap' to 'RNTMapManager'
    module.exports = requireNativeComponent('RNTMap');
    ```
1. Open the `App.js`
1. Add the following import: `import MapView from './MapView.js';`
1. Add the following component in the `return` statement: `<MapView style={{ width: "100%", height: "100%" }} />`
1. run `npx react-native run-ios`

### [[Native Components] Create RNTMapManager (native side)]()
1. Create a new Objective-C file, called it `RNTMapManager.m`
2. Copy the following snippet:
    ```obj-c
    // RNTMapManager.m
    #import <MapKit/MapKit.h>

    #import <React/RCTViewManager.h>

    @interface RNTMapManager : RCTViewManager
    @end

    @implementation RNTMapManager

    RCT_EXPORT_MODULE(RNTMap)

    - (UIView *)view
    {
    return [[MKMapView alloc] init];
    }

    @end
    ```
3. Run `cmd+B` to build it
4. Run `cmd+R` to run it

### [Exporting Constants]()
1. Open the 'RCTCalendarModule.m'
1. Add the following snippets:
    ```objective-c
    - (NSDictionary *)constantsToExport
    {
        return @{ @"DEFAULT_EVENT_NAME": @"New Event" };
    }

    + (BOOL)requiresMainQueueSetup
    {
        return NO;
    }
    ```
1. Open the `App.js` file
1. Add the definition: `const { DEFAULT_EVENT_NAME } = CalendarModule.getConstants();`
1. Replace the `"testName"` with the `DEFAULT_EVENT_NAME`.
1. Run `npx react-native run-ios`
1. Click on the button
1. Observe the message `Pretending to create an event New Event at testLocation` in the Chrome console. _Note:_ The name of the event has changed from `testName` to `New Event`.

### [Better Native Module Export]()
1. Create a new `NativeCalendarModule.js` file
1. Paset the following snippet:
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
1. Open the `App.js` file
1. Remove `NativeModules,` from the list of imports
1. Remove the `const { CalendarModule } = NativeModules;` line
1. Add the import `import CalendarModule  from "./NativeCalendarModule"`. _Note:_ In this case, we don't need to use the curly brackets.
1. Save (`cmd+S`) to trigger a reload
1. Press the button and observe the message `Pretending to create an event testName at testLocation` appearing in the Chrome console.

### [Access the Native Module in JS]()
Commands:
1. Open `App.js` file
1. Delete the file content
1. Paste the following snippet:
    ```js
    import React from 'react';
    import type {Node} from 'react';
    import {
    SafeAreaView,
    StatusBar,
    Button,
    useColorScheme,
    NativeModules,
    } from "react-native";

    const { CalendarModule } = NativeModules;

    const App = () => {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? 'black' : 'white',
    };

    const onPress = () => {
        CalendarModule.createCalendarEvent('testName', 'testLocation');
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Button
                title="Click to invoke your native module!"
                color="#841584"
                onPress={onPress}/>
            </SafeAreaView>
        );
    };

    export default App;
    ```
1. Run `cd .. && npx react-native run-ios`
1. Observe the app launching
1. Select the Simulator and press `cmd+D`
1. Select `Debug on Chrome`
1. Press `cmd+opt+I` to open the developer tools
1. Select the simulator and refresh the App (`cmd+R` twice. The first time it will start recording the Simulator. Stop the recording and delete it).
1. Tap on the button and observe the `Pretending to create an event testName at testLocation` message in the Chrome console.

### [Export native method to JS (Native Side)]()
Commands:
1. Open `RCTCalendarModule.m`
1. Add the import:
    ```obj-c
    #import <React/RCTLog.h>
    ```
1. Add the code:
    ```obj-c
    RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
    {
        RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
    }
    ```
1. `cmd+B` to build it
1. `cmd+R` to run it

### [create RCTCalendar Native Module (Native side)]()
Commands:
1. `cd ios && open AwesomeApp.xcworkspace`
1. Select the `AwesomeApp` folder
1. `cmd+N` to create a new file
1. Choose `New Header File`
1. Call it `RCTCalendarModule`
1. Paste the code:
   ```obj-c
   #import <React/RCTBridgeModule.h>
   @interface RCTCalendarModule : NSObject <RCTBridgeModule>
   @end
   ```
1. `cmd+N` to create a new file
1. Choose `New Objective-C File`
1. Call it `RCTCalendarModule`
1. Set membership to both `AwesomeApp` and `AwesomeAppTests`
1. Paste the code
    ```obj-c
    #import "RCTCalendarModule.h"

    @implementation RCTCalendarModule

    // To export a module named RCTCalendarModule
    RCT_EXPORT_MODULE();

    @end
    ```
1. `cmd+B` to build it
1. `cmd+R` to run it

### [react-native init](4c38d7e)
Commands:
1. `npx react-native init AwesomeApp --version 0.0.0-20220307-2008-ae3d4f700` When asked to install cocoapods, choose `1 (yes with gem)`.
1. `cd AwesomeApp`
1. `npx react-native start`
1. `npx react-native run-ios`
