# New Architecture Run

## Setup

* **React** Nightly build: 20220309-2009-538636440
* **HW**: Mac M1 Pro, 32 GB RAM
* **OS**: Monterey 12.2.1
* **Ruby**: rbenv with ruby 2.7.4 (If you have trouble installing it, try with RUBY_CFLAGS=“-w” rbenv install 2.7.4)
* **Node**: v16.14.0

## Steps

### [[Setup] react-native init]()
Steps:
* `npx react-native init AwesomeApp`
* `cd AwesomeApp`
* `npx react-native start`
* `npx react-native run-ios`

### [[Setup] Set the nightly build]()
Steps:
* Open the `AwesomeApp/package.json`
* Update the `react-native` version to `20220309-2009-538636440`
* `yarn install`
* `cd ios && pod install`
* Fix build error in `AppDelegate.m` by replacing the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];` with the `return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];`
* `npx react-native start`
* `npx react-native run-ios`

### [[Setup] Install CodeGen]()
Steps:
* `yarn add react-native-codegen`
* `cd ios && pod install`
* `npx react-native start`
* `npx react-native run-ios`

### [[Setup] Enable Hermes]()
Steps:
* Open the `Podfile`
* Change `:hermes_enabled` to `true`
* `cd ios && pod install`
* open `AwesomeApp.xcworkspace`
* `cmd+r` -> the app builds but when it runs, it crashes.

#### ISSUES
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

### [[Setup] Enable C++17]()
Steps:
* Open `AwesomeApp.xcworkspace`
* Select the `AwesomeApp`project in the project navigator
* Select the `AwesomeApp` project in the `Projects` panel
* Select the `Build Settings` tab
* Search for `CLANG_CXX_LANGUAGE_STANDARD`
* Select the `C++17` option
* `cmd+r`

### [[Setup] Update the code to use Objective-C++]()
Steps:
* Open `AwesomeApp.xcworkspace`
* Rename the `AwesomeApp/main.m` to `AwesomeApp/main.mm`
* Rename the `AwesomeApp/AppDelegate.m` to `AwesomeApp/AppDelegate.mm`
* `cmd+r`

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
* `cmd+b` -> The build will fail with the error `'folly/folly-config.h' file not found`. `Folly` requires some additional compiler flags.
* Select the `AwesomeApp` project in the project navigator
* Select the `AwesomeApp` target in the `Targets` section
* Select the `Build Settings` tab
* Search for `Other C++ Flags`
* Update the `Debug` configuration with the following line: `-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1`
* Update the `Release` configuration with the following line: `-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1`
* `cmd+b`
* `cmd+r`
