# React Native New Architecture Sample

This repo contains several branches that will help you understand how to setup your project for the **React Native New Architecture**. This should considered as a support material of [the official migration guide](https://github.com/facebook/react-native-website/pull/2879).

Here you will find **runs of the migration guide** on empty projects. Every commit is **documented** and allows to follow over on every step. 

Please find a list of the branches below, with more information on which kind of setup they're addressing.

## Branches

| Branch name | Description | Android | iOS |
| --- | --- | --- | --- |
| [`run/android/20220202`](https://github.com/cortinico/RNNewArchitectureApp/commits/run/android/20220202) | A run from an empty project on RN 0.67.2 | ✅ | |

## Sample Run

A sample run will have commits marked as `[TurboModule]` or `[Fabric]` to clarify which aspect of the New Architecture is involved.
It will looke like the following:

```
d1544ec [Fabric] Use the new Fabric custom component
cbe46be [Fabric] Register the MainComponentsRegistry
787c3c7 [Fabric] Add a MainComponentsRegistry for the application
0ae2906 [Fabric] Add a React Package that will load the ViewManager
cae5187 [Fabric] Create the corresponding ViewManager
d6ddaaf [Fabric] Create a custom component spec file
2ac6f06 [Fabric] call setIsFabric(true) in the MainActivity
8b12df4 [Fabric] Provide the JSI Module Package
8995205 [TurboModule] Let's try to use this TurboModule
fb11f60 [TurboModule] Enable TurboModule system in the Android App
246b519 [TurboModule] Add the C++ implementation for MainApplicationTurboModuleManagerDelegate
c5e4bfd [TurboModule] Register a new TurboModulePackage
47899fa [TurboModule] Install the ReactPackageTurboModuleManagerDelegateBuilder
b390569 [TurboModule] Setup the NDK Build for the Android app
1a9c6ab [TurboModule] Implement the generated native spec interface
496778d [TurboModule] Configure the codegen with libraryname and Java package
37d5b4c [TurboModule] Add a NativeModule Spec file
70d39b6 Setup the React Gradle Plugin
c87c42b Build React Native from Source
4357af9 Bump React Native to a nightly version
a3866a1 Result of npx react-native init
da46dd2 Initial Empty Commit
```