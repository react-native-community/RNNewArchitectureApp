package com.rnnewarchitectureapp.components;

import android.graphics.Color;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.AnswerViewerManagerDelegate;
import com.facebook.react.viewmanagers.AnswerViewerManagerInterface;

@ReactModule(name = AnswerViewerManager.REACT_CLASS)
public class AnswerViewerManager extends SimpleViewManager<AnswerViewer>
        implements AnswerViewerManagerInterface<AnswerViewer> {

  public static final String REACT_CLASS = "AnswerViewer";

  private final ViewManagerDelegate<AnswerViewer> mDelegate;

  public AnswerViewerManager() {
    mDelegate = new AnswerViewerManagerDelegate<>(this);
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<AnswerViewer> getDelegate() {
    return mDelegate;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected AnswerViewer createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new AnswerViewer(reactContext);
  }

  @Override
  @ReactProp(name = "color")
  public void setColor(AnswerViewer view, @Nullable String value) {
    view.setTextColor(Color.parseColor(value));
  }

  @Override
  @ReactProp(name = "step", defaultInt = 0)
  public void setStep(AnswerViewer view, int value) {
    view.setText("Step: " + value);
  }

  @Override
  public void changeBackgroundColor(AnswerViewer view, String value) {
    view.setBackgroundColor(Color.parseColor(value));
  }

  @Override
  public void receiveCommand(@NonNull AnswerViewer root, String commandId, @Nullable ReadableArray args) {
    mDelegate.receiveCommand(root, commandId, args);
  }
}