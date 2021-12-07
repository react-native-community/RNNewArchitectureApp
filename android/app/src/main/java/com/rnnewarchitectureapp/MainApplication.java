package com.rnnewarchitectureapp;

import android.app.Application;
import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactPackageTurboModuleManagerDelegate;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleProvider;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JSIModuleType;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UIManager;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.react.fabric.CoreComponentsRegistry;
import com.facebook.react.fabric.EmptyReactNativeConfig;
import com.facebook.react.fabric.FabricJSIModuleProvider;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.uimanager.ViewManagerRegistry;
import com.facebook.soloader.SoLoader;
import com.rnnewarchitectureapp.modules.MainApplicationTurboModuleManagerDelegate;
import com.rnnewarchitectureapp.modules.NativeAnswerSolver;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          packages.add(new TurboReactPackage() {
            @Nullable
            @Override
            public NativeModule getModule(String name, ReactApplicationContext reactContext) {
              if (name.equals(NativeAnswerSolver.NAME)) {
                return new NativeAnswerSolver(reactContext);
              } else {
                return null;
              }
            }

            @Override
            public ReactModuleInfoProvider getReactModuleInfoProvider() {
              return () -> {
                final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
                moduleInfos.put(
                        NativeAnswerSolver.NAME,
                        new ReactModuleInfo(
                                NativeAnswerSolver.NAME,
                                "NativeAnswerSolver",
                                false, // canOverrideExistingModule
                                false, // needsEagerInit
                                true, // hasConstants
                                false, // isCxxModule
                                true // isTurboModule
                        )
                );
                return moduleInfos;
              };
            }
          });
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @NonNull
        @Override
        protected ReactPackageTurboModuleManagerDelegate.Builder getReactPackageTurboModuleManagerDelegateBuilder() {
          return new MainApplicationTurboModuleManagerDelegate.Builder();
        }

        @Override
        protected JSIModulePackage getJSIModulePackage() {
          return new JSIModulePackage() {
            @Override
            public List<JSIModuleSpec> getJSIModules(
                    final ReactApplicationContext reactApplicationContext,
                    final JavaScriptContextHolder jsContext) {
              final List<JSIModuleSpec> specs = new ArrayList<>();
              specs.add(new JSIModuleSpec() {
                @Override
                public JSIModuleType getJSIModuleType() {
                  return JSIModuleType.UIManager;
                }

                @Override
                public JSIModuleProvider<UIManager> getJSIModuleProvider() {
                  final ComponentFactory componentFactory = new ComponentFactory();
                  CoreComponentsRegistry.register(componentFactory);
                  
                  final ReactInstanceManager reactInstanceManager = getReactInstanceManager();

                  ViewManagerRegistry viewManagerRegistry =
                          new ViewManagerRegistry(
                                  reactInstanceManager.getOrCreateViewManagers(
                                          reactApplicationContext));

                  return new FabricJSIModuleProvider(
                          reactApplicationContext,
                          componentFactory,
                          new EmptyReactNativeConfig(),
                          viewManagerRegistry);
                }
              });
              return specs;
            }
          };
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    ReactFeatureFlags.useTurboModules = true;
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.rnnewarchitectureapp.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
