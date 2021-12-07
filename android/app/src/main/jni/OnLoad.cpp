#include <fbjni/fbjni.h>
#include "MainApplicationTurboModuleManagerDelegate.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
    return facebook::jni::initialize(vm, [] {
        facebook::react::MainApplicationTurboModuleManagerDelegate::registerNatives();
    });
}