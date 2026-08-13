package com.aura.iptv;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Set;

@CapacitorPlugin(name = "NativePlayer")
public class NativePlayerPlugin extends Plugin {

    @PluginMethod
    public void open(PluginCall call) {
        JSArray requestedUrls = call.getArray("urls");
        Set<String> uniqueUrls = new LinkedHashSet<>();

        if (requestedUrls != null) {
            for (int index = 0; index < requestedUrls.length(); index++) {
                String url = requestedUrls.optString(index, "").trim();
                Uri uri = Uri.parse(url);
                String scheme = uri.getScheme();
                if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) && uri.getHost() != null) {
                    uniqueUrls.add(url);
                }
            }
        }

        if (uniqueUrls.isEmpty()) {
            call.reject("No valid HTTP(S) playback URL was provided.");
            return;
        }

        Intent intent = new Intent(getContext(), NativePlayerActivity.class);
        intent.putStringArrayListExtra(NativePlayerActivity.EXTRA_URLS, new ArrayList<>(uniqueUrls));
        intent.putExtra(NativePlayerActivity.EXTRA_TITLE, call.getString("title", ""));
        intent.putExtra(NativePlayerActivity.EXTRA_SUBTITLE, call.getString("subtitle", ""));
        intent.putExtra(NativePlayerActivity.EXTRA_IS_LIVE, Boolean.TRUE.equals(call.getBoolean("isLive", false)));
        intent.putExtra(NativePlayerActivity.EXTRA_START_POSITION_MS, call.getLong("startPositionMs", 0L));
        startActivityForResult(call, intent, "playerResult");
    }

    @ActivityCallback
    private void playerResult(PluginCall call, ActivityResult activityResult) {
        if (call == null) return;

        Intent data = activityResult.getData();
        JSObject result = new JSObject();
        result.put("ended", data != null && data.getBooleanExtra(NativePlayerActivity.RESULT_ENDED, false));
        result.put("positionMs", data != null ? data.getLongExtra(NativePlayerActivity.RESULT_POSITION_MS, 0L) : 0L);
        result.put("durationMs", data != null ? data.getLongExtra(NativePlayerActivity.RESULT_DURATION_MS, 0L) : 0L);
        result.put("usedFallback", data != null && data.getBooleanExtra(NativePlayerActivity.RESULT_USED_FALLBACK, false));
        if (data != null && data.hasExtra(NativePlayerActivity.RESULT_ERROR)) {
            result.put("error", data.getStringExtra(NativePlayerActivity.RESULT_ERROR));
        }
        result.put("dismissed", activityResult.getResultCode() != Activity.RESULT_OK);
        call.resolve(result);
    }
}
