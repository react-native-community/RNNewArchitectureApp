#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface RNCenteredTextManager : RCTViewManager
@end

@implementation RNCenteredTextManager

RCT_EXPORT_MODULE(RNCenteredText)

RCT_EXPORT_VIEW_PROPERTY(text, NSString)
@end
