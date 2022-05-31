package com.turbodemo.newarchitecture.modules;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.rnnewarchitectureapp.codegen.NativeTurboModuleSpec;
public class NativeTurboModule extends NativeTurboModuleSpec {

    public static final String NAME = "NativeTurboModule";

    public NativeTurboModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public double getRandomSync() {
        return Math.random();
    }
}
