//
//  RCTPaintMarkerView.h
//  MeasurePerformance
//
//  Created by Samuel Susla on 09/02/2023.
//

#import <UIKit/UIKit.h>
#import <React/RCTView.h>

NS_ASSUME_NONNULL_BEGIN

@interface RTNPaintMarkerView : UIView

@property (nonatomic, retain) NSString *markerName;
@property (nonatomic, copy) RCTDirectEventBlock onMarkerPainted;

@end

NS_ASSUME_NONNULL_END
