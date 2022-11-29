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

struct CustomType {
  std::string key;
  bool enabled;
  std::optional<int32_t> time;

  bool operator==(const CustomType &other) const {
    return key == other.key && enabled == other.enabled && time == other.time;
  }
};

template <>
struct Bridging<CustomType> {
  static CustomType fromJs(
      jsi::Runtime &rt,
      const jsi::Object &value,
      const std::shared_ptr<CallInvoker> &jsInvoker) {
    return CustomType{
        .key = bridging::fromJs<std::string>(
            rt, value.getProperty(rt, "key"), jsInvoker),
        .enabled = bridging::fromJs<bool>(
            rt, value.getProperty(rt, "enabled"), jsInvoker),
        .time = bridging::fromJs<std::optional<int32_t>>(
            rt, value.getProperty(rt, "time"), jsInvoker)};
  }

  static jsi::Object toJs(jsi::Runtime &rt, const CustomType &value) {
    auto result = facebook::jsi::Object(rt);
    result.setProperty(rt, "key", bridging::toJs(rt, value.key));
    result.setProperty(rt, "enabled", bridging::toJs(rt, value.enabled));
    if (value.time) {
      result.setProperty(rt, "time", bridging::toJs(rt, value.time.value()));
    }
    return result;
  }
};

class NativeSampleModule : public NativeSampleModuleCxxSpec<NativeSampleModule> {
 public:
  NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker);

  std::string reverseString(jsi::Runtime& rt, std::string input);

  int32_t passLargeNumber(jsi::Runtime& rt, int64_t input);

  CustomType passCustomType(jsi::Runtime& rt, CustomType input);
};

} // namespace facebook::react
