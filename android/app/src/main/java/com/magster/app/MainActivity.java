package com.magster.app;

import android.content.Context;
import android.hardware.display.DisplayManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.Display;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;

public class MainActivity extends BridgeActivity {

    // ─── Javascript Bridge ────────────────────────────────────────────────────
    // Exposed to the React webview as window.MagsterSecurity
    public class MagsterSecurityBridge {

        /** Returns 1 if USB Debugging OR Developer Options are active, 0 otherwise. */
        @JavascriptInterface
        public int isUsbDebuggingEnabled() {
            boolean usbDebug = Settings.Secure.getInt(
                    getContentResolver(), Settings.Global.ADB_ENABLED, 0) == 1;
            boolean devOptions = Settings.Secure.getInt(
                    getContentResolver(), Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) == 1;
            return (usbDebug || devOptions) ? 1 : 0;
        }

        /** Allows the JS "Close App" button to actually terminate the process. */
        @JavascriptInterface
        public void closeApp() {
            finishAffinity();
            System.exit(0);
        }

        /** Returns the status bar height in pixels. */
        @JavascriptInterface
        public int getStatusBarHeight() {
            int result = 0;
            int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
            if (resourceId > 0) {
                result = getResources().getDimensionPixelSize(resourceId);
            }
            return result;
        }
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Block screenshots, screen recording, and hide from Recents
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE);

        // 2. Aggressive security — kill immediately for emulator & root & debugger
        if (runAggressiveTerminationChecks()) {
            return;
        }

        // 3. Allow drawing behind the status bar (edge-to-edge)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // 4. Register JS bridge so React can query USB/developer-mode status
        //    and display the block screen itself
        bridge.getWebView().addJavascriptInterface(
                new MagsterSecurityBridge(), "MagsterSecurity");
    }

    @Override
    public void onResume() {
        super.onResume();

        // Re-check screen mirroring every time the app comes to foreground
        if (checkScreenMirroring()) {
            return;
        }
    }

    // ─── Aggressive-close checks (emulator & root) ───────────────────────────

    /**
     * Checks that MUST result in immediate process death.
     * These fire before the webview starts rendering — no modal is possible.
     */
    private boolean runAggressiveTerminationChecks() {
        if (isEmulator()) {
            Log.w("MagsterSec", "EMULATOR DETECTED — killing process");
            aggressivelyCloseApp();
            return true;
        }
        if (isDeviceRooted()) {
            Log.w("MagsterSec", "ROOT DETECTED — killing process");
            aggressivelyCloseApp();
            return true;
        }
        if (android.os.Debug.isDebuggerConnected()) {
            Log.w("MagsterSec", "DEBUGGER CONNECTED — killing process");
            aggressivelyCloseApp();
            return true;
        }

        // Screen mirroring check
        return checkScreenMirroring();
    }

    // ─── Screen mirroring ────────────────────────────────────────────────────

    private boolean checkScreenMirroring() {
        DisplayManager displayManager = (DisplayManager) getSystemService(Context.DISPLAY_SERVICE);
        if (displayManager != null) {
            Display[] displays = displayManager.getDisplays();
            if (displays.length > 1) {
                Log.w("MagsterSec", "SCREEN MIRRORING DETECTED — killing process");
                aggressivelyCloseApp();
                return true;
            }
        }
        return false;
    }

    // ─── Emulator detection ──────────────────────────────────────────────────

    private boolean isEmulator() {
        String buildDetails = (Build.FINGERPRINT + Build.DEVICE + Build.MODEL + Build.BRAND + Build.PRODUCT +
                               Build.MANUFACTURER + Build.HARDWARE + Build.BOARD + Build.HOST + Build.USER).toLowerCase();

        boolean isSpoofed = buildDetails.startsWith("generic")
                || buildDetails.startsWith("unknown")
                || buildDetails.contains("google_sdk")
                || buildDetails.contains("emulator")
                || buildDetails.contains("simulator")
                || buildDetails.contains("goldfish")
                || buildDetails.contains("ranchu")
                || buildDetails.contains("genymotion")
                || buildDetails.contains("bluestacks")
                || buildDetails.contains("nox")
                || buildDetails.contains("mutant")
                || buildDetails.contains("memu")
                || buildDetails.contains("ldplayer")
                || buildDetails.contains("vbox86")
                || buildDetails.contains("netease")
                || buildDetails.contains("andy")
                || buildDetails.contains("koplayer")
                || buildDetails.contains("bignox")
                || buildDetails.contains("titan")
                || buildDetails.contains("vmos")
                || Build.BOARD.toLowerCase().contains("nox")
                || Build.BOOTLOADER.toLowerCase().contains("nox")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"));

        // Advanced Emulator Files used by BlueStacks, Nox, LDPlayer, MEmu, etc.
        String[] emulatorFiles = {
                "/system/lib/libc_malloc_debug_qemu.so",
                "/sys/qemu_trace",
                "/system/bin/qemu-props",
                "/dev/socket/qemud",
                "/dev/qemu_pipe",
                "/dev/socket/baseband_genyd",
                "/dev/socket/genyd",
                "/mnt/windows/BstSharedFolder",
                "/windows/BstSharedFolder",
                "/system/bin/nox-prop",
                "/system/lib/libnoxspeedup.so",
                "/system/lib/libnoxd.so",
                "/system/bin/nox",
                "/system/bin/microvirtd",
                "/system/lib/libnemu_api.so",
                "/system/lib/libnemu_ext.so",
                "/system/bin/ldplayer",
                "/system/lib/libldplayer.so",
                "/system/bin/andy",
                "/system/bin/nox-vbox-sf",
                "/system/bin/microvirt-prop",
                "/system/lib/libdroid4x.so",
                "/system/bin/windroyed",
                "/system/bin/vbox86-prop",
                "/dev/qemu_pipe",
                "/dev/socket/qemud",
                "/system/lib/libxcache.so",
                "/system/lib/libvboxguest.so",
                "/system/lib/libvboxsf.so",
                "/system/lib/libvboxvideo.so",
                "/system/app/ChineseTV.apk",
                "/system/bin/com.bluestacks.appplayer"
        };

        boolean hasEmulatorFile = false;
        for (String filePath : emulatorFiles) {
            if (new File(filePath).exists()) {
                hasEmulatorFile = true;
                break;
            }
        }

        return isSpoofed || hasEmulatorFile || checkAdvancedEmulatorProperties();
    }

    private boolean checkAdvancedEmulatorProperties() {
        try {
            Class<?> systemProperties = Class.forName("android.os.SystemProperties");
            java.lang.reflect.Method getMethod = systemProperties.getMethod("get", String.class);

            String qemu = (String) getMethod.invoke(null, "ro.kernel.qemu");
            if ("1".equals(qemu)) return true;

            String hardware = (String) getMethod.invoke(null, "ro.hardware");
            if (hardware != null) {
                String hw = hardware.toLowerCase();
                if (hw.contains("nox") || hw.contains("vbox86") || hw.contains("bluestacks") || hw.contains("goldfish") || hw.contains("ttvm")) {
                    return true;
                }
            }

            String buildFlavor = (String) getMethod.invoke(null, "ro.build.flavor");
            if (buildFlavor != null && (buildFlavor.contains("vbox") || buildFlavor.contains("sdk_gphone"))) {
                return true;
            }

            String boardPlatform = (String) getMethod.invoke(null, "ro.board.platform");
            if (boardPlatform != null && (boardPlatform.toLowerCase().contains("bluestacks") || boardPlatform.toLowerCase().contains("ldplayer"))) {
                return true;
            }
        } catch (Exception e) {
            // Ignore reflection errors
        }
        return false;
    }

    // ─── Root detection ───────────────────────────────────────────────────────

    private boolean isDeviceRooted() {
        return checkRootBuildTags() || checkRootBinaries();
    }

    private boolean checkRootBuildTags() {
        String buildTags = android.os.Build.TAGS;
        return buildTags != null && buildTags.contains("test-keys");
    }

    private boolean checkRootBinaries() {
        String[] paths = {
                "/system/app/Superuser.apk",
                "/sbin/su", "/system/bin/su", "/system/xbin/su",
                "/data/local/xbin/su", "/data/local/bin/su",
                "/system/sd/xbin/su", "/system/bin/failsafe/su",
                "/data/local/su", "/su/bin/su",
                "/system/app/Kinguser.apk",
                "/data/adb/magisk", "/sbin/.magisk",
                "/system/xbin/magisk", "/data/adb/modules",
                "/system/app/SuperSU", "/system/xbin/daemonsu"
        };
        for (String path : paths) {
            if (new File(path).exists()) return true;
        }
        return false;
    }

    // ─── Nuclear kill ─────────────────────────────────────────────────────────

    /** Closes ALL activities and hard-kills the process immediately. */
    private void aggressivelyCloseApp() {
        finishAndRemoveTask();
        android.os.Process.killProcess(android.os.Process.myPid());
        System.exit(0);
    }
}
