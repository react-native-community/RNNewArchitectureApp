#include <fbjni/fbjni.h>
#include "AppTurboModuleManagerDelegate.h"
#include "ComponentsRegistry.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    facebook::react::AppTurboModuleManagerDelegate::registerNatives();
    facebook::react::ComponentsRegistry::registerNatives();
  });
}
