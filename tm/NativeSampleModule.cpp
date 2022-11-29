#include "NativeSampleModule.h"
#include <cmath>

namespace facebook::react {

NativeSampleModule::NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeSampleModuleCxxSpec(std::move(jsInvoker)) {}

std::string NativeSampleModule::reverseString(jsi::Runtime& rt, std::string input) {
  return std::string(input.rbegin(), input.rend());
}

int32_t NativeSampleModule::passLargeNumber(jsi::Runtime& rt, int64_t input) {
    return std::cbrt(input);
}

CustomType NativeSampleModule::passCustomType(jsi::Runtime& rt, CustomType input) {
  input.key = "1909";
  input.enabled = !input.enabled;
  input.time = 42;
  return input;
}

} // namespace facebook::react
