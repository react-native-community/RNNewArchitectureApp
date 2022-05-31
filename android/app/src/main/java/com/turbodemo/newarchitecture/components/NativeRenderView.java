/*
 * @Author: 波仔糕
 * @LastModifiedBy: 波仔糕
 */
package com.turbodemo.newarchitecture.components;

import android.graphics.Color;
import android.util.Log;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.NativeRenderViewManagerDelegate;
import com.facebook.react.viewmanagers.NativeRenderViewManagerInterface;
import com.turbodemo.R;

@ReactModule(name = NativeRenderView.NAME)
public class NativeRenderView extends ViewGroupManager<LinearLayout> implements NativeRenderViewManagerInterface<LinearLayout> {
    public static final String NAME = "NativeRenderView";
    private final ViewManagerDelegate<LinearLayout> mDelegate;
    private ReactApplicationContext reactApplicationContext;
    private int num = 0;
    private TextView task;
    private TextView result;
    private TextView time;

    public NativeRenderView(ReactApplicationContext reactApplicationContext) {
        mDelegate = new NativeRenderViewManagerDelegate<>(this);
        this.reactApplicationContext = reactApplicationContext;
    }


    @Nullable
    @Override
    protected ViewManagerDelegate<LinearLayout> getDelegate() {
        return mDelegate;
    }


    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @NonNull
    @Override
    protected LinearLayout createViewInstance(@NonNull ThemedReactContext reactContext) {
        LinearLayout linearLayout = (LinearLayout) LayoutInflater.from(reactContext).inflate(R.layout.layout, null);
        LinearLayout button = linearLayout.findViewById(R.id.button);
        task = linearLayout.findViewById(R.id.task);
        task.setText("task：Computes the sum of " + this.num + "random numbers");
        result = linearLayout.findViewById(R.id.result);
        time = linearLayout.findViewById(R.id.time);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                compute(linearLayout);
            }
        });
        return linearLayout;
    }

    public void compute(LinearLayout linearLayout) {
        double count = 0;
        double start = System.nanoTime(), end = 0;
        for (int i = 0; i < num; i++) {
            count += Math.random();
        }
        end = System.nanoTime();
        final double countTmp = count;
        final double timeTmp = (end - start) / 1000000;
        result.setText("result：" + countTmp);
        time.setText("time：" + timeTmp + "ms");
    }

    @Override
    @ReactProp(name = "num", defaultDouble = 0)
    public void setNum(LinearLayout view, int value) {
        num = value;
        task.setText("task：Computes the sum of " + this.num + "random numbers");
    }

    @Override
    public void changeBackgroundColor(LinearLayout view, int num) {

    }

    @Override
    public void receiveCommand(@NonNull LinearLayout root, String commandId, @Nullable ReadableArray args) {
        mDelegate.receiveCommand(root, commandId, args);
    }
}
