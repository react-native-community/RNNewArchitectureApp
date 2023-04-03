#import "AppDelegate.h"

#import <rtn-timetorender/RTNMarkerStore.h>
#import "PaperViewController.h"
#import "FabricViewController.h"
#import <React/RCTBundleURLProvider.h>
#import <RCTAppSetupUtils.h>
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>
#import <react/config/ReactNativeConfig.h>

@interface AppDelegate () <RCTTurboModuleManagerDelegate, RCTCxxBridgeDelegate> {
  BOOL _newArchitectureEnabled;
}
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[RTNMarkerStore mainStore] startMarker:@"startup" timeSinceStartup:[RTNMarkerStore JSTimeIntervalSinceStartup]];
  _newArchitectureEnabled = YES;
  self.moduleName = @"MeasurePerformance";

  RCTAppSetupPrepareApp(application, _newArchitectureEnabled);

  if (!self.bridge) {
    self.bridge = [self createBridgeWithDelegate:self launchOptions:launchOptions];
  }
  // --- New Architecture setup start ---
  auto contextContainer = std::make_shared<facebook::react::ContextContainer const>();
  auto reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();
  contextContainer->insert("ReactNativeConfig", reactNativeConfig);
  self.bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:self.bridge
                                                               contextContainer:contextContainer];
  self.bridge.surfacePresenter = self.bridgeAdapter.surfacePresenter;
  // --- New Architecture setup end ---

  NSDictionary *initProps = @{@"concurrentRoot": @YES};

  // --- Appearance Start ---
  UITabBarAppearance *tabBarAppearance = [UITabBarAppearance new];
  [tabBarAppearance configureWithOpaqueBackground];
  [UITabBar appearance].scrollEdgeAppearance = tabBarAppearance;

  UINavigationBarAppearance *navBarApperance = [UINavigationBarAppearance new];
  [navBarApperance configureWithOpaqueBackground];
  [UINavigationBar appearance].standardAppearance = navBarApperance;
  [UINavigationBar appearance].compactAppearance = navBarApperance;
  [UINavigationBar appearance].scrollEdgeAppearance = navBarApperance;
  // --- Appearance End ---

  // --- VC setup start ---
  UITabBarController *vc = [[UITabBarController alloc] init];

  PaperViewController *paperVC = [PaperViewController new];
  paperVC.view = RCTAppSetupDefaultRootView(self.bridge, @"MeasurePerformance", initProps, NO);

  FabricViewController *fabricVC = [FabricViewController new];
  fabricVC.view = RCTAppSetupDefaultRootView(self.bridge, @"MeasurePerformance", initProps, YES);

  vc.viewControllers = @[
    [[UINavigationController alloc] initWithRootViewController:paperVC],
    [[UINavigationController alloc] initWithRootViewController:fabricVC]
    ];
  // --- VC setup end ---

  // --- UIWindow setup start ---
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.rootViewController = vc;
  [self.window makeKeyAndVisible];
  // --- UIWindow setup end ---

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return _newArchitectureEnabled;
}

/// This method controls whether the `turboModules` feature of the New Architecture is turned on or off.
///
/// @note: This is required to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the Turbo Native Module are enabled. Otherwise, it returns `false`.
- (BOOL)turboModuleEnabled
{
  return _newArchitectureEnabled;
}

/// This method controls whether the App will use the Fabric renderer of the New Architecture or not.
///
/// @return: `true` if the Fabric Renderer is enabled. Otherwise, it returns `false`.
- (BOOL)fabricEnabled
{
  return _newArchitectureEnabled;
}

@end
