#include <fbjni/fbjni.h>
#include "AppComponentsRegistry.h"
#include "AppTurboModuleManagerDelegate.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
return facebook::jni::initialize(vm, [] {
    facebook::react::AppTurboModuleManagerDelegate::registerNatives();
    facebook::react::AppComponentsRegistry::registerNatives();
});
}
