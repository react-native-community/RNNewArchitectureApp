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
