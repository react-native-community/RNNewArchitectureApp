package com.rtntimetorender

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RTNTimeToRenderManagerDelegate
import com.facebook.react.viewmanagers.RTNTimeToRenderManagerInterface
import kotlin.collections.mapOf
import kotlin.collections.mutableMapOf

@ReactModule(name = TimeToRenderViewManager.NAME)
class TimeToRenderViewManager(context: ReactApplicationContext) : SimpleViewManager<TimeToRenderView>(), RTNTimeToRenderManagerInterface<TimeToRenderView> {
    // Documentation is incorrect in the next line:
    private val delegate: ViewManagerDelegate<TimeToRenderView> = RTNTimeToRenderManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<TimeToRenderView> = delegate

    override fun getName(): String = NAME

    override fun createViewInstance(context: ThemedReactContext): TimeToRenderView = TimeToRenderView(context)

    @ReactProp(name = "markerName")
    override fun setMarkerName(view: TimeToRenderView, markerName: String?) {
        view.setMarkerName(markerName)
    }

    companion object {
        const val NAME = "RTNTimeToRender"
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        val baseEventTypeConstants: Map<String, Any>? = super.getExportedCustomDirectEventTypeConstants()
        val eventTypeConstants: MutableMap<String, Any> = baseEventTypeConstants?.toMutableMap()
                ?: mutableMapOf()
        eventTypeConstants.put(
                OnMarkerPaintedEvent.EVENT_NAME,
                mutableMapOf<String, String>("registrationName" to "onMarkerPainted"))

        return eventTypeConstants
    }
}
