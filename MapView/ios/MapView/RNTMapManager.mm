#import <MapKit/MapKit.h>
#import <React/RCTViewManager.h>

@interface RNTMapManager : RCTViewManager
@end

@implementation RNTMapManager

RCT_EXPORT_MODULE(MapView)
RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL)

- (UIView *)view
{
  return [[MKMapView alloc] init];
}

@end
