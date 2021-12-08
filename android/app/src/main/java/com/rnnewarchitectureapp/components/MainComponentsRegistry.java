package com.rnnewarchitectureapp.components;

import com.facebook.common.internal.DoNotStrip;
import com.facebook.jni.HybridData;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.soloader.SoLoader;

@DoNotStrip
public class MainComponentsRegistry {
  static {
    SoLoader.loadLibrary("fabricjni");
  }

  @DoNotStrip private final HybridData mHybridData;

  @DoNotStrip
  private native HybridData initHybrid(ComponentFactory componentFactory);

  @DoNotStrip
  private MainComponentsRegistry(ComponentFactory componentFactory) {
    mHybridData = initHybrid(componentFactory);
  }

  @DoNotStrip
  public static MainComponentsRegistry register(ComponentFactory componentFactory) {
    return new MainComponentsRegistry(componentFactory);
  }
}
