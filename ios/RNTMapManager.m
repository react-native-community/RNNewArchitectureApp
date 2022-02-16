//
//  RNTMapManager.m
//  RNNewArchitectureApp
//
//  Created by Dmitry Rykun on 16/02/2022.
//

#import "RNTMapManager.h"
#import <MapKit/MapKit.h>

@implementation RNTMapManager

RCT_EXPORT_MODULE(RNTMap)

- (UIView *)view
{
  return [[MKMapView alloc] init];
}

@end
