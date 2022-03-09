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
