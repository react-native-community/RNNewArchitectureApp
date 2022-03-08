//
//  RNTMapManager.m
//  AwesomeApp
//
//  Created by Riccardo Cipolleschi on 08/03/2022.
//

#import <Foundation/Foundation.h>
#import <MapKit/MapKit.h>
#import <React/RCTViewManager.h>

@interface RNTMapManager : RCTViewManager
@end

@implementation RNTMapManager

RCT_EXPORT_MODULE(RNTMap)

RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL)

- (UIView *)view
{
  return [[MKMapView alloc] init];
}

@end
