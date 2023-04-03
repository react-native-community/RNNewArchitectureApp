//
//  MarkerStore.m
//  MeasurePerformance
//
//  Created by Samuel Susla on 09/02/2023.
//

#import "RTNMarkerStore.h"

@implementation RTNMarkerStore {
    NSMutableDictionary <NSString *, NSNumber*> *_markers;
}

+ (id)mainStore {
    static RTNMarkerStore *mainMarkerStore = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        mainMarkerStore = [[self alloc] init];
    });
    return mainMarkerStore;
}

+ (NSTimeInterval)JSTimeIntervalSinceStartup {
  return [[NSProcessInfo processInfo] systemUptime] * 1000;
}

- (id)init {
  if (self = [super init]) {
      _markers = [NSMutableDictionary new];
  }
  return self;
}


- (void)startMarker:(NSString *)marker timeSinceStartup:(NSTimeInterval)time {
  [_markers setObject:@(time) forKey:marker];
}

- (NSTimeInterval)endMarker:(NSString *)marker {
  NSTimeInterval markerStart = [_markers objectForKey:marker].doubleValue;
  NSTimeInterval markerEnd = [RTNMarkerStore JSTimeIntervalSinceStartup];
  [_markers removeObjectForKey:marker];

  return markerEnd - markerStart;
}

@end
