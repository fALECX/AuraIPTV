package com.aura.iptv;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import android.content.Context;
import android.content.Intent;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.Until;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * Opaque-box APK smoke test. It exercises the same menu and tab-scoped search
 * through Android accessibility nodes that a user or test robot sees.
 */
@RunWith(AndroidJUnit4.class)
public class AuraNavigationTest {
    private static final String PACKAGE_NAME = "com.aura.iptv";
    private static final long TIMEOUT_MS = 10_000L;
    private UiDevice device;

    @Before
    public void launchFreshApp() throws Exception {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        device.executeShellCommand("pm clear " + PACKAGE_NAME);

        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(PACKAGE_NAME);
        assertNotNull(intent);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
        device.wait(Until.hasObject(By.pkg(PACKAGE_NAME).depth(0)), TIMEOUT_MS);
    }

    @Test
    public void movieSearchDoesNotShowLiveResults() {
        assertNotNull(device.wait(Until.findObject(By.text("Try with Demo Content")), TIMEOUT_MS));
        device.findObject(By.text("Try with Demo Content")).click();

        assertNotNull(device.wait(Until.findObject(By.text("Movies")), TIMEOUT_MS));
        device.findObject(By.text("Movies")).click();

        assertNotNull(device.wait(Until.findObject(By.desc("Search")), TIMEOUT_MS));
        device.findObject(By.desc("Search")).click();

        assertNotNull(device.wait(Until.findObject(By.clazz("android.widget.EditText")), TIMEOUT_MS));
        device.findObject(By.clazz("android.widget.EditText")).setText("the");

        assertNotNull(device.wait(Until.findObject(By.text("The Batman")), TIMEOUT_MS));
        assertNull(device.findObject(By.text("LIVE")));
    }
}
