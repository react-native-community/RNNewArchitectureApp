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
