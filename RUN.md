# Migration RUN

## Setup
* **React Nightly build:** 20220308-2008
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
