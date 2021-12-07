#include "MainApplicationModuleProvider.h"

#include <rncore.h>
#include <answersolver.h>

namespace facebook {
    namespace react {

        std::shared_ptr<TurboModule> MainApplicationModuleProvider(const std::string moduleName, const JavaTurboModule::InitParams &params) {
            auto module = answersolver_ModuleProvider(moduleName, params);
            if (module != nullptr) {
                return module;
            }

            return rncore_ModuleProvider(moduleName, params);
        }

    } // namespace react
} // namespace facebook