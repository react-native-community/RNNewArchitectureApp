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

### [[Turbo Modules] Provide a TurboModuleManager Delegate]()
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

### [[Turbo Modules] Install TurboModuleManager JavaScript Bindings]()
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

### [[Turbo Modules] Enable TurboModule System]()

Steps:
* Open `AwesomeApp.xcworkspace`
* Open `AwesomeApp/AppDelegate.mm`
* Add the `RCTEnableTurboModule(YES);` as first line of the `(BOOL)application:didFinishLaunchingWithOptions:` method
* `cmd+r`

#### Issues
The app will run, but RN will fail with the following error:
```
Native Component 'SafeAreaView' that calls codegenNativeComponent was not code generated at build time.
```
That's because the SafeAreaView specs are a little different at the moment.
To fix the issue, let's cleanup the `App.js` code by removing the `SafeAreaView` and the `StatusBar`

### [[Fabric] Enable Fabric in Podfile]()
Steps:
* Open `AwesomeApp/Podfile`
* Before the `:enable_hermes => true` line, add the following lines:
    * `:app_path => "#{Dir.pwd}/..",`
    * `:fabric_enabled => true,`
* Run `BUILD_FROM_GIT=1 RCT_NEW_ARCH_ENABLED=1 pod install`
* Open `AwesomeApp.xcworkspace`
* `cmd+r`

**ISSUES**
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

### [[Fabric] Update your RootView]()
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

### [[Fabric] Add Babel plugin and reinstall pods]()
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
