//
//  RCTCalendarModule.m
//  
//
//  Created by Dmitry Rykun on 16/02/2022.
//

#import "RCTCalendarModule.h"
#import <React/RCTLog.h>

@implementation RCTCalendarModule

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
  RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeCalendarModuleSpecJSI>(params);
}

+ (NSString *)moduleName {
  return @"CalendarModule";
}

@end
