//
//  RCTMarkerPaintComponentView.m
//  MeasurePerformance
//
//  Created by Samuel Susla on 13/02/2023.
//

#import "RTNMarkerPaintComponentView.h"
#import "RCTThirdPartyFabricComponentsProvider.h"
#import "RTNMarkerStore.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/RTNTimeToRenderSpec/ComponentDescriptors.h>
#import <react/renderer/components/RTNTimeToRenderSpec/EventEmitters.h>
#import <react/renderer/components/RTNTimeToRenderSpec/Props.h>
#import <react/renderer/components/RTNTimeToRenderSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"


using namespace facebook::react;

@implementation RTNMarkerPaintComponentView {
  BOOL _alreadyLogged;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<RTNTimeToRenderProps const>();
    _props = defaultProps;
  }

  return self;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  _alreadyLogged = NO;
}

- (void)didMoveToWindow {
  [super didMoveToWindow];

  if (_alreadyLogged) {
    return;
  }

  if (!self.window) {
    return;
  }

  _alreadyLogged = YES;

  NSString *markerName = RCTNSStringFromString(std::static_pointer_cast<RTNTimeToRenderProps const>(_props)->markerName);

  // However, we cannot do it right now: the views were just mounted but pixels
  // were not drawn on the screen yet.
  // They will be drawn for sure before the next tick of the main run loop.
  // Let's wait for that and then report.
  dispatch_async(dispatch_get_main_queue(), ^{
    NSTimeInterval paintTime = [[RTNMarkerStore mainStore] endMarker:markerName];
    std::dynamic_pointer_cast<RTNTimeToRenderEventEmitter const>(self->_eventEmitter)->onMarkerPainted({.paintTime = paintTime});
  });
}


+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RTNTimeToRenderComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> RTNTimeToRenderCls(void)
{
  return RTNMarkerPaintComponentView.class;
}
