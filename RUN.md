# Playground run
- Nightly build: 20220307-2008

## Setup:
* Mac M1 Pro, 32 GB RAM
* Monterey 12.2.1
* rbenv with ruby 2.7.0 (If you have trouble installing it, try with `RUBY_CFLAGS=“-w” rbenv install 2.7.0`)


## Steps (From most recent to least recent command)

### [react-native init](4c38d7e)
Commands:
1. `npx react-native init AwesomeApp --version 0.0.0-20220307-2008-ae3d4f700` When asked to install cocoapods, choose `1 (yes with gem)`.
1. `cd AwesomeApp`
1. `npx react-native start`
1. `npx react-native run-ios`
