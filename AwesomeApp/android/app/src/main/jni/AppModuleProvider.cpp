#include "AppModuleProvider.h"

#include <rncore.h>
// Add the include of the TurboModule

namespace facebook {
namespace react {

std::shared_ptr<TurboModule> AppModuleProvider(const std::string moduleName, const JavaTurboModule::InitParams &params) {
    // Uncomment this for your TurboModule
    // auto module = samplelibrary_ModuleProvider(moduleName, params);
    // if (module != nullptr) {
    //   return module;
    // }

    return rncore_ModuleProvider(moduleName, params);
}

} // namespace react
} // namespace facebook
