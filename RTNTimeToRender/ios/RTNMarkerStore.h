//
//  MarkerStore.h
//  MeasurePerformance
//
//  Created by Samuel Susla on 09/02/2023.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface RTNMarkerStore : NSObject

+ (id)mainStore;
+ (NSTimeInterval)JSTimeIntervalSinceStartup;

- (void)startMarker:(NSString *)marker timeSinceStartup:(NSTimeInterval)time;

- (NSTimeInterval)endMarker:(NSString *)marker;

@end

NS_ASSUME_NONNULL_END
