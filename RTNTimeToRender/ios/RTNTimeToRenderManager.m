#import <React/RCTViewManager.h>
#import "RTNTimeToRenderManager.h"
#import "RTNPaintMarkerView.h"

@implementation RTNTimeToRenderManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(markerName, NSString)
RCT_EXPORT_VIEW_PROPERTY(onMarkerPainted, RCTDirectEventBlock)

- (UIView *)view
{
  return [[RTNPaintMarkerView alloc] init];
}

@end
