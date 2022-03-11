#import "RNTMapView.h"

#import <react/renderer/components/MapView/ComponentDescriptors.h>
#import <react/renderer/components/MapView/Props.h>
#import <react/renderer/components/MapView/RCTComponentViewHelpers.h>
#import <react/renderer/components/MapView/ShadowNodes.h>

#import <MapKit/MapKit.h>
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RNTMapView () <RCTMapViewViewProtocol>
@end

@implementation RNTMapView {
    MKMapView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<MapViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const MapViewProps>();
        _props = defaultProps;

        _view = [[MKMapView alloc] init];
        _view.zoomEnabled = defaultProps->zoomEnabled;

        self.contentView = _view;
    }

    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<MapViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<MapViewProps const>(props);

    if(oldViewProps.zoomEnabled != newViewProps.zoomEnabled) {
        _view.zoomEnabled = newViewProps.zoomEnabled;
    }
    [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MapViewCls(void)
{
    return RNTMapView.class;
}
