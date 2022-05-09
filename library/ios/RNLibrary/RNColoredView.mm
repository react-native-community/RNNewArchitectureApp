#import "RNColoredView.h"

#import <React/RCTConversions.h>
#import <React/RCTImageResponseDelegate.h>
#import <React/RCTImageResponseObserverProxy.h>

#import <react/renderer/imagemanager/ImageResponseObserverCoordinator.h>
#import "ColoredViewComponentDescriptor.h"
#import "ColoredViewProps.h"
#import "RCTComponentViewHelpers.h"

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RNColoredView () <RCTColoredViewViewProtocol, RCTImageResponseDelegate>

@end

@implementation RNColoredView {
    UIView * _view;
    UIImageView *_imageView;
    ImageResponseObserverCoordinator const *_imageCoordinator;
    RCTImageResponseObserverProxy _imageResponseObserverProxy;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<ColoredViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ColoredViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    _imageView = [[UIImageView alloc] init];
    [_view addSubview:_imageView];

    _imageView.translatesAutoresizingMaskIntoConstraints = false;
    [NSLayoutConstraint activateConstraints:@[
      [_imageView.topAnchor constraintEqualToAnchor:_view.topAnchor constant:10],
      [_imageView.leftAnchor constraintEqualToAnchor:_view.leftAnchor constant:10],
      [_imageView.bottomAnchor constraintEqualToAnchor:_view.bottomAnchor constant:-10],
      [_imageView.rightAnchor constraintEqualToAnchor:_view.rightAnchor constant:-10],
    ]];
    _imageView.backgroundColor = UIColor.redColor;

    _imageResponseObserverProxy = RCTImageResponseObserverProxy(self);

    self.contentView = _view;
}

return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<ColoredViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<ColoredViewProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor:[self hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)updateState:(const facebook::react::State::Shared &)state oldState:(const facebook::react::State::Shared &)oldState
{
  auto _state = std::static_pointer_cast<ColoredViewShadowNode::ConcreteState const>(state);
  auto _oldState = std::static_pointer_cast<ColoredViewShadowNode::ConcreteState const>(oldState);

  auto data = _state->getData();

  bool havePreviousData = _oldState != nullptr;

  auto getCoordinator = [](ImageRequest const *request) -> ImageResponseObserverCoordinator const * {
    if (request) {
      return &request->getObserverCoordinator();
    } else {
      return nullptr;
    }
  };

  if (!havePreviousData || data.getImageSource() != _oldState->getData().getImageSource()) {
    self.imageCoordinator = getCoordinator(&data.getImageRequest());
  }
}

- (void)setImageCoordinator:(const ImageResponseObserverCoordinator *)coordinator
{
  if (_imageCoordinator) {
    _imageCoordinator->removeObserver(_imageResponseObserverProxy);
  }
  _imageCoordinator = coordinator;
  if (_imageCoordinator) {
    _imageCoordinator->addObserver(_imageResponseObserverProxy);
  }
}

- (void)setImage:(UIImage *)image
{
  if ([image isEqual:_imageView.image]) {
    return;
  }

  _imageView.image = image;
}

Class<RCTComponentViewProtocol> ColoredViewCls(void)
{
    return RNColoredView.class;
}

- hexStringToColor:(NSString *)stringToConvert
{
    NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

    unsigned hex;
    if (![stringScanner scanHexInt:&hex]) return nil;
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;

    return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
}

#pragma mark - RCTImageResponseDelegate

- (void)didReceiveImage:(UIImage *)image metadata:(id)metadata fromObserver:(void const *)observer
{
  if (observer == &_imageResponseObserverProxy) {
    self.image = image;
  }
}

- (void)didReceiveProgress:(float)progress fromObserver:(void const *)observer
{
}

- (void)didReceiveFailureFromObserver:(void const *)observer
{
}

@end
