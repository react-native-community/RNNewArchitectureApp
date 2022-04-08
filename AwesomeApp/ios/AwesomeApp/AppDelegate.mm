#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <reacthermes/HermesExecutorFactory.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTJSIExecutorRuntimeInstaller.h>

#import <ReactCommon/RCTTurboModuleManager.h>
#import <React/CoreModulesPlugins.h>

#import <React/RCTDataRequestHandler.h>
#import <React/RCTHTTPRequestHandler.h>
#import <React/RCTFileRequestHandler.h>
#import <React/RCTNetworking.h>
#import <React/RCTImageLoader.h>
#import <React/RCTGIFImageDecoder.h>
#import <React/RCTLocalAssetImageLoader.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  // ...
  RCTTurboModuleManager *_turboModuleManager;
}
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"AwesomeApp"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
      rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
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

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
    // Set up the default RCTImageLoader and RCTNetworking modules.
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
    // No custom initializer here.
    return [moduleClass new];
}

@end
