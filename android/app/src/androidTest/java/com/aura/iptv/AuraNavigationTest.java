package com.aura.iptv;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertFalse;

import android.content.Context;
import android.content.Intent;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.BySelector;
import androidx.test.uiautomator.StaleObjectException;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;
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
        device.wakeUp();
        device.executeShellCommand("wm dismiss-keyguard");
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(PACKAGE_NAME);
        assertNotNull(intent);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
        device.wait(Until.hasObject(By.pkg(PACKAGE_NAME).depth(0)), TIMEOUT_MS);
        UiObject2 immersiveHint = device.wait(Until.findObject(By.text("Got it")), 2_000L);
        if (immersiveHint != null) immersiveHint.click();
    }

    private void enterDemoIfNeeded() {
        UiObject2 demoButton = device.wait(Until.findObject(By.text("Try with Demo Content")), 2_000L);
        if (demoButton != null) demoButton.click();
        assertNotNull(device.wait(Until.findObject(By.text("Home")), TIMEOUT_MS));
    }

    private void click(BySelector selector) {
        for (int attempt = 0; attempt < 3; attempt++) {
            UiObject2 object = device.wait(Until.findObject(selector), TIMEOUT_MS);
            assertNotNull(object);
            try {
                object.click();
                device.waitForIdle();
                return;
            } catch (StaleObjectException ignored) {
                // React can replace a WebView accessibility node between lookup and click.
            }
        }
        throw new AssertionError("Could not click a stable Android accessibility node");
    }

    @Test
    public void movieSearchDoesNotShowLiveResults() {
        enterDemoIfNeeded();

        assertNotNull(device.wait(Until.findObject(By.text("Movies")), TIMEOUT_MS));
        click(By.text("Movies"));

        click(By.text("Search"));

        UiObject2 search = device.wait(Until.findObject(By.clazz("android.widget.EditText")), TIMEOUT_MS);
        assertNotNull(search);
        search.setText("the");

        assertNotNull(device.wait(Until.findObject(By.text("The Batman")), TIMEOUT_MS));
        assertNull(device.findObject(By.text("LIVE")));
        device.pressEnter();
        device.waitForIdle();
        assertFalse(search.isFocused());
    }

    @Test
    public void systemBackReturnsFromDetailsWithoutClosingApp() {
        enterDemoIfNeeded();
        assertNotNull(device.wait(Until.findObject(By.text("Movies")), TIMEOUT_MS));
        click(By.text("Movies"));
        assertNotNull(device.wait(Until.findObject(By.text("Dune: Part Two")), TIMEOUT_MS));
        click(By.text("Dune: Part Two"));
        assertNotNull(device.wait(Until.findObject(By.text("Play Now")), TIMEOUT_MS));

        device.pressBack();

        assertNotNull(device.wait(Until.findObject(By.text("Search")), TIMEOUT_MS));
        assertNotNull(device.findObject(By.pkg(PACKAGE_NAME)));
    }

}
