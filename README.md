# React Native New Architecture Sample

This repo contains several branches that will help you understand how to setup your project for the **React Native New Architecture**. This should considered as a support material of [the official migration guide](https://reactnative.dev/docs/next/new-architecture-intro).

Here you will find **runs of the migration guide** on empty projects. Every commit is **documented** and allows to follow over on every step.

Some branches also have a `RUN.md` (example: [`ios/20220309`](https://github.com/cortinico/RNNewArchitectureApp/blob/ios/20220309/RUN.md)) file that can help you follow the commits with additional context.

Please find a list of the branches below, with more information on which kind of setup they're addressing.

## Branches

| Branch name | Description | Android | iOS |
| --- | --- | --- | --- |
| [`run/from-0.67-to-0.69`](https://github.com/react-native-community/RNNewArchitectureApp/tree/run/from-0.67-to-0.69) | A full migration from RN 0.67 to 0.69 | ✅ | ✅ |
| [`run/from-0.67-to-0.70`](https://github.com/react-native-community/RNNewArchitectureApp/tree/run/from-0.67-to-0.70) | A full migration from RN 0.67 to 0.70 | ✅ | ✅ |
| [`run/pure-cxx-module`](https://github.com/react-native-community/RNNewArchitectureApp/tree/run/pure-cxx-module) | A step-by-step guide on how to integrate a Pure C++ module in a React Native 0.71.0-RC.2 app. Thanks to [@christophpurrer](https://github.com/christophpurrer) for the guide | ✅ | ✅ |
| [`view-flattening-ios`](https://github.com/react-native-community/RNNewArchitectureApp/tree/view-flattening-ios) | Examples of View Flattening on iOS | | ✅ |

## Sample Run

A sample run will have commits marked as `[TurboModule]` or `[Fabric]` to clarify which aspect of the New Architecture is involved.
For example, for the [`run/android/20220202`](https://github.com/cortinico/RNNewArchitectureApp/commits/run/android/20220202) branch will look like the following:

* [582a8a7](https://github.com/cortinico/RNNewArchitectureApp/commit/582a8a7) `[Fabric] Use the new Fabric custom component`
* [adeee8b](https://github.com/cortinico/RNNewArchitectureApp/commit/adeee8b) `[Fabric] Register the MainComponentsRegistry`
* [5e7d88f](https://github.com/cortinico/RNNewArchitectureApp/commit/5e7d88f) `[Fabric] Add a MainComponentsRegistry for the application`
* [8afa19e](https://github.com/cortinico/RNNewArchitectureApp/commit/8afa19e) `[Fabric] Add a React Package that will load the ViewManager`
* [c893370](https://github.com/cortinico/RNNewArchitectureApp/commit/c893370) `[Fabric] Create the corresponding ViewManager`
* [32885f5](https://github.com/cortinico/RNNewArchitectureApp/commit/32885f5) `[Fabric] Create a custom component spec file`
* [5408f18](https://github.com/cortinico/RNNewArchitectureApp/commit/5408f18) `[Fabric] call setIsFabric(true) in the MainActivity`
* [20a8378](https://github.com/cortinico/RNNewArchitectureApp/commit/20a8378) `[Fabric] Provide the JSI Module Package`
* [cf1378e](https://github.com/cortinico/RNNewArchitectureApp/commit/cf1378e) `[TurboModule] Let's try to use this TurboModule`
* [a80cea1](https://github.com/cortinico/RNNewArchitectureApp/commit/a80cea1) `[TurboModule] Enable TurboModule system in the Android App`
* [d8884c2](https://github.com/cortinico/RNNewArchitectureApp/commit/d8884c2) `[TurboModule] Add the C++ implementation for MainApplicationTurboModuleManagerDelegate`
* [f6d2e81](https://github.com/cortinico/RNNewArchitectureApp/commit/f6d2e81) `[TurboModule] Register a new TurboModulePackage`
* [7ae59dd](https://github.com/cortinico/RNNewArchitectureApp/commit/7ae59dd) `[TurboModule] Install the ReactPackageTurboModuleManagerDelegateBuilder`
* [4dfcfa6](https://github.com/cortinico/RNNewArchitectureApp/commit/4dfcfa6) `[TurboModule] Setup the NDK Build for the Android app`
* [a0cf888](https://github.com/cortinico/RNNewArchitectureApp/commit/a0cf888) `[TurboModule] Implement the generated native spec interface`
* [ba3f2a4](https://github.com/cortinico/RNNewArchitectureApp/commit/ba3f2a4) `[TurboModule] Configure the codegen with libraryname and Java package`
* [7da902f](https://github.com/cortinico/RNNewArchitectureApp/commit/7da902f) `[TurboModule] Add a NativeModule Spec file`
* [cb0eceb](https://github.com/cortinico/RNNewArchitectureApp/commit/cb0eceb) `Setup the React Gradle Plugin`
* [66ca29b](https://github.com/cortinico/RNNewArchitectureApp/commit/66ca29b) `Build React Native from Source`
* [be102a1](https://github.com/cortinico/RNNewArchitectureApp/commit/be102a1) `Enable Hermes`
* [4357af9](https://github.com/cortinico/RNNewArchitectureApp/commit/4357af9) `Bump React Native to a nightly version`
* [a3866a1](https://github.com/cortinico/RNNewArchitectureApp/commit/a3866a1) `Result of npx react-native init`

## Older Branches

Here we collect older branches that are working, but no longer relevant.

| Branch name | Description | Android | iOS |
| --- | --- | --- | --- |
| [`run/android/0.68.0-rc2`](https://github.com/cortinico/RNNewArchitectureApp/commits/run/android/0.68.0-rc2) | A run from an empty project on RN 0.68.0-rc2 using the New Architecture template | ✅ | |
| [`run/android/20220202`](https://github.com/cortinico/RNNewArchitectureApp/commits/run/android/20220202) | A run from an empty project on RN 0.67.2, migrated to run on a RN nightly version `0.0.0-20211205-2008-583471bc4`. Here you can see all the step-by-step migration needed for an app coming from RN 0.67 | ✅ | |
| [`run/android/0.68.0-rc3`](https://github.com/cortinico/RNNewArchitectureApp/commits/run/android/0.68.0-rc3) | A run from an empty project on RN 0.68.0-rc3 using the New Architecture template | ✅ | |
| [`ios/20220309`](https://github.com/cortinico/RNNewArchitectureApp/commits/ios/20220309) | A run from an empty project starting from 0.67.3 to an app with a Turbomodule and a Fabric component | | ✅ |
| [`run/from-0.67-to-0.68`](https://github.com/react-native-community/RNNewArchitectureApp/tree/run/from-0.67-to-0.68) | A full migration from RN 0.67 to 0.68 | ✅ | ✅ |
| [`run/ios/0.68.0-rc.4-typescript`](https://github.com/react-native-community/RNNewArchitectureApp/tree/run/ios/0.68.0-rc.4-typescript) | A migration from RN 0.67 to RN 0.68 with typescript suppport for iOS | | ✅ |
| [`run/android/0.68.0-rc.4-typescript`](https://github.com/react-native-community/RNNewArchitectureApp/tree/run/android/0.68.0-rc.4-typescript) | A migration from RN 0.67 to RN 0.68 with typescript suppport for Android | ✅ | |
