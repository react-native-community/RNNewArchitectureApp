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

### [[Native Modules] What You Have Built]()

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
