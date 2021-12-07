package com.rnnewarchitectureapp.modules;

import com.facebook.jni.HybridData;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactPackageTurboModuleManagerDelegate;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.soloader.SoLoader;

import java.util.List;

public class MainApplicationTurboModuleManagerDelegate extends ReactPackageTurboModuleManagerDelegate {

    private static volatile boolean sIsSoLibraryLoaded;

    protected MainApplicationTurboModuleManagerDelegate(ReactApplicationContext reactApplicationContext, List<ReactPackage> packages) {
        super(reactApplicationContext, packages);
    }

    protected native HybridData initHybrid();

    public static class Builder extends ReactPackageTurboModuleManagerDelegate.Builder {
        protected MainApplicationTurboModuleManagerDelegate build(
                ReactApplicationContext context, List<ReactPackage> packages) {
            return new MainApplicationTurboModuleManagerDelegate(context, packages);
        }
    }

    @Override
    protected synchronized void maybeLoadOtherSoLibraries() {
        // Prevents issues with initializer interruptions.
        if (!sIsSoLibraryLoaded) {
            SoLoader.loadLibrary("rnnewarchitectureapp_appmodules");
            sIsSoLibraryLoaded = true;
        }
    }
}