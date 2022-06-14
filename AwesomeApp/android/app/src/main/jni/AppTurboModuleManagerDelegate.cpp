#include "AppTurboModuleManagerDelegate.h"
#include "AppModuleProvider.h"

namespace facebook {
namespace react {

jni::local_ref<AppTurboModuleManagerDelegate::jhybriddata> AppTurboModuleManagerDelegate::initHybrid(
    jni::alias_ref<jhybridobject>
) {
    return makeCxxInstance();
}

void AppTurboModuleManagerDelegate::registerNatives() {
    registerHybrid({
        makeNativeMethod("initHybrid", AppTurboModuleManagerDelegate::initHybrid),
    });
}

std::shared_ptr<TurboModule> AppTurboModuleManagerDelegate::getTurboModule(
    const std::string name,
    const std::shared_ptr<CallInvoker> jsInvoker
) {
    // Not implemented yet: provide pure-C++ NativeModules here.
    return nullptr;
}

std::shared_ptr<TurboModule> AppTurboModuleManagerDelegate::getTurboModule(
    const std::string name,
    const JavaTurboModule::InitParams &params
) {
    return AppModuleProvider(name, params);
}

} // namespace react
} // namespace facebook
