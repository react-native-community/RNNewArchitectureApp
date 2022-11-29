#pragma once

#if __has_include(<React-Codegen/AppSpecsJSI.h>) // CocoaPod headers on Apple
#include <React-Codegen/AppSpecsJSI.h>
#elif __has_include("AppSpecsJSI.h") // Cmake headers on Android
#include "AppSpecsJSI.h"
#else // BUCK headers
#include <AppSpecs/AppSpecsJSI.h>
#endif
#include <memory>
#include <string>
#include "Int64.h"

namespace facebook::react {

class NativeSampleModule : public NativeSampleModuleCxxSpec<NativeSampleModule> {
 public:
  NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker);

  std::string reverseString(jsi::Runtime& rt, std::string input);

  int32_t passLargeNumber(jsi::Runtime& rt, int64_t input);
};

} // namespace facebook::react
