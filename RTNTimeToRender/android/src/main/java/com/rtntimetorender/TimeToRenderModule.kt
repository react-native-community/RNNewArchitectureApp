package com.rtntimetorender

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.rtntimetorender.NativeTimeToRenderSpec

class TimeToRenderModule(reactContext: ReactApplicationContext) : NativeTimeToRenderSpec(reactContext) {

  override fun getName() = NAME

  override fun startMarker(name: String, time: Double) {
    MarkerStore.mainStore.startMarker(name, time.toLong())
  }

  companion object {
    const val NAME = "RTNTimeToRender"
  }
}
