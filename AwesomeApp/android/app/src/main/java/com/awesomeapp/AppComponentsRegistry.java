package com.awesomeapp;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.soloader.SoLoader;

@DoNotStrip
public class AppComponentsRegistry {
    static {
        SoLoader.loadLibrary("fabricjni");
    }

    @DoNotStrip private final HybridData mHybridData;

    @DoNotStrip
    private native HybridData initHybrid(ComponentFactory componentFactory);

    @DoNotStrip
    private AppComponentsRegistry(ComponentFactory componentFactory) {
        mHybridData = initHybrid(componentFactory);
    }

    @DoNotStrip
    public static AppComponentsRegistry register(ComponentFactory componentFactory) {
        return new AppComponentsRegistry(componentFactory);
    }
}
