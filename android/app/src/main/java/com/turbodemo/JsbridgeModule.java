package com.turbodemo;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

public class JsbridgeModule extends ReactContextBaseJavaModule {
    public static final String NAME = "JsbridgeModule";
    public JsbridgeModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void getRandomAsync(Promise resolve) {
        resolve.resolve(Math.random());
    }
}