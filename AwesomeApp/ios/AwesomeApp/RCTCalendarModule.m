//
//  RCTCalendarModule.m
//  AwesomeApp
//
//  Created by Riccardo Cipolleschi on 08/03/2022.
//

#import <React/RCTLog.h>
#import "RCTCalendarModule.h"

@implementation RCTCalendarModule

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
  RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

- (NSDictionary *)constantsToExport
{
  return @{ @"DEFAULT_EVENT_NAME": @"New Event" };
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
