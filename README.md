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

* [d1544ecf](https://github.com/cortinico/RNNewArchitectureApp/commit/d1544ecf16565325abeecc92a7662fe8a70dd68b) `[Fabric] Use the new Fabric custom component`
* [cbe46be9](https://github.com/cortinico/RNNewArchitectureApp/commit/cbe46be9193bc07680e56ce0ac4bee34cceec3f4) `[Fabric] Register the MainComponentsRegistry`
* [787c3c7d](https://github.com/cortinico/RNNewArchitectureApp/commit/787c3c7dbbe2c8238cff8e115f52f27c5f5e096d) `[Fabric] Add a MainComponentsRegistry for the application`
* [0ae2906b](https://github.com/cortinico/RNNewArchitectureApp/commit/0ae2906b84a7811d6f90ee6bbade2255f61b3351) `[Fabric] Add a React Package that will load the ViewManager`
* [cae51879](https://github.com/cortinico/RNNewArchitectureApp/commit/cae5187948dea3c28f5d4bbf88d1e4febe54e4a6) `[Fabric] Create the corresponding ViewManager`
* [d6ddaafe](https://github.com/cortinico/RNNewArchitectureApp/commit/d6ddaafee5ea118bd49fd535b1709362f363341c) `[Fabric] Create a custom component spec file`
* [2ac6f064](https://github.com/cortinico/RNNewArchitectureApp/commit/2ac6f0641560cfc7fa24cac1370e1c2c3a673922) `[Fabric] call setIsFabric(true) in the MainActivity`
* [8b12df4a](https://github.com/cortinico/RNNewArchitectureApp/commit/8b12df4a43931754bedf889f192c5c7a039a5664) `[Fabric] Provide the JSI Module Package`
* [89952053](https://github.com/cortinico/RNNewArchitectureApp/commit/899520537de8648278f74c652902e9c0aeaa44b7) `[TurboModule] Let's try to use this TurboModule`
* [fb11f609](https://github.com/cortinico/RNNewArchitectureApp/commit/fb11f609c0e79ff6ca915e71d9ed43981e02c8f2) `[TurboModule] Enable TurboModule system in the Android App`
* [246b5191](https://github.com/cortinico/RNNewArchitectureApp/commit/246b519131d916c200bc1685ce2c5fcf218d128e) `[TurboModule] Add the C++ implementation for MainApplicationTurboModuleManagerDelegate`
* [c5e4bfd3](https://github.com/cortinico/RNNewArchitectureApp/commit/c5e4bfd33b724bcce98f2928c3af0c086db504cf) `[TurboModule] Register a new TurboModulePackage`
* [47899fa1](https://github.com/cortinico/RNNewArchitectureApp/commit/47899fa1acb2a6acc5b11e8ac694953c46256ac1) `[TurboModule] Install the ReactPackageTurboModuleManagerDelegateBuilder`
* [b3905690](https://github.com/cortinico/RNNewArchitectureApp/commit/b3905690c3fded2ffc4ea5785aa111244a2972b5) `[TurboModule] Setup the NDK Build for the Android app`
* [1a9c6ab3](https://github.com/cortinico/RNNewArchitectureApp/commit/1a9c6ab3641b892377b19e9b61c8af5a868863de) `[TurboModule] Implement the generated native spec interface`
* [496778d8](https://github.com/cortinico/RNNewArchitectureApp/commit/496778d86248bdf5e763aa57e2b4417a6f55189c) `[TurboModule] Configure the codegen with libraryname and Java package`
* [37d5b4c8](https://github.com/cortinico/RNNewArchitectureApp/commit/37d5b4c8eed8b480c04d2caa42e67d24cd20d1a7) `[TurboModule] Add a NativeModule Spec file`
* [70d39b6b](https://github.com/cortinico/RNNewArchitectureApp/commit/70d39b6b69009e310da677c2a476ec6beac4d36f) `Setup the React Gradle Plugin`
* [c87c42bb](https://github.com/cortinico/RNNewArchitectureApp/commit/c87c42bb2e62b48ff374d8ad7531db548b45de13) `Build React Native from Source`
* [4357af99](https://github.com/cortinico/RNNewArchitectureApp/commit/4357af99be3bfe81a47ed56855b246eb5167866c) `Bump React Native to a nightly version`
* [a3866a11](https://github.com/cortinico/RNNewArchitectureApp/commit/a3866a115782a3b41f3e629e95359d3a21b81321) `Result of npx react-native init`
* [da46dd22](https://github.com/cortinico/RNNewArchitectureApp/commit/da46dd222e44d0acf1266b5a7a834e2c43cc9020) `Initial Empty Commit`
