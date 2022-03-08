# Playground run
- Nightly build: 20220307-2008

## Setup:
* Mac M1 Pro, 32 GB RAM
* Monterey 12.2.1
* rbenv with ruby 2.7.0 (If you have trouble installing it, try with `RUBY_CFLAGS=“-w” rbenv install 2.7.0`)


## Steps (From most recent to least recent command)

### [create RCTCalendar Native Module (Native side)]()
Commands:
1. `cd ios && open AwesomeApp.xcworkspace`
1. Select the `AwesomeApp` folder
1. `cmd+N` to create a new file
1. Choose `New Header File`
1. Call it `RCTCalendarModule`
1. Paste the code:
   ```obj-c
   #import <React/RCTBridgeModule.h>
     @interface RCTCalendarModule : NSObject <RCTBridgeModule>
   @end
   ```
1. `cmd+N` to create a new file
1. Choose `New Objective-C File`
1. Call it `RCTCalendarModule`
1. Set membership to both `AwesomeApp` and `AwesomeAppTests`
1. Paste the code
    ```obj-c
    #import "RCTCalendarModule.h"

    @implementation RCTCalendarModule

    // To export a module named RCTCalendarModule
    RCT_EXPORT_MODULE();

    @end
    ```
1. `cmd+B` to build it
1. `cmd+R` to run it

**Note:**

We can create a Template `react-native-objc-migration` with this project to create a pipeline to test the migration in CI.

### [react-native init](4c38d7e)
Commands:
1. `npx react-native init AwesomeApp --version 0.0.0-20220307-2008-ae3d4f700` When asked to install cocoapods, choose `1 (yes with gem)`.
1. `cd AwesomeApp`
1. `npx react-native start`
1. `npx react-native run-ios`
