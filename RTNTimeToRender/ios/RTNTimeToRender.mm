#import "RTNTimeToRender.h"
#import "RTNMarkerStore.h"

@implementation RTNTimeToRender

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(startMarker:(NSString *)name time:(double)time)
{
  [[RTNMarkerStore mainStore] startMarker:name timeSinceStartup:time];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTimeToRenderSpecJSI>(params);
}

@end
