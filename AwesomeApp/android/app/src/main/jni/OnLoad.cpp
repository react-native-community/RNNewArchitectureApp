#include <fbjni/fbjni.h>
#include "AppTurboModuleManagerDelegate.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
return facebook::jni::initialize(vm, [] {
    facebook::react::AppTurboModuleManagerDelegate::registerNatives();
});
}
