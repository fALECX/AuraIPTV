package com.aura.iptv;

import android.app.Activity;
import android.app.PictureInPictureParams;
import android.content.res.Configuration;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Build;
import android.util.Rational;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.Nullable;
import androidx.annotation.OptIn;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.ui.AspectRatioFrameLayout;
import androidx.media3.ui.PlayerView;
import java.util.ArrayList;

@OptIn(markerClass = UnstableApi.class)
public class NativePlayerActivity extends AppCompatActivity {
    public static final String EXTRA_URLS = "urls";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_SUBTITLE = "subtitle";
    public static final String EXTRA_IS_LIVE = "isLive";
    public static final String EXTRA_START_POSITION_MS = "startPositionMs";

    public static final String RESULT_ENDED = "ended";
    public static final String RESULT_POSITION_MS = "positionMs";
    public static final String RESULT_DURATION_MS = "durationMs";
    public static final String RESULT_USED_FALLBACK = "usedFallback";
    public static final String RESULT_ERROR = "error";

    private ExoPlayer player;
    private PlayerView playerView;
    private LinearLayout errorPanel;
    private LinearLayout header;
    private TextView errorMessage;
    private ArrayList<String> urls = new ArrayList<>();
    private int sourceIndex = 0;
    private long initialPositionMs = 0L;
    private long lastPositionMs = 0L;
    private long lastDurationMs = 0L;
    private boolean isLive = false;
    private boolean finishedWithResult = false;
    private String lastError;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat insets = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        insets.hide(WindowInsetsCompat.Type.systemBars());
        insets.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        urls = getIntent().getStringArrayListExtra(EXTRA_URLS);
        if (urls == null) urls = new ArrayList<>();
        isLive = getIntent().getBooleanExtra(EXTRA_IS_LIVE, false);
        initialPositionMs = Math.max(0L, getIntent().getLongExtra(EXTRA_START_POSITION_MS, 0L));

        if (urls.isEmpty()) {
            finishWithResult(false, "No playback source is available.");
            return;
        }

        buildInterface();
        initializePlayer();
        playSource(0, initialPositionMs);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                finishWithResult(false, lastError);
            }
        });
    }

    private void buildInterface() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);

        playerView = new PlayerView(this);
        playerView.setBackgroundColor(Color.BLACK);
        playerView.setKeepScreenOn(true);
        playerView.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FIT);
        playerView.setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS);
        playerView.setControllerAutoShow(true);
        playerView.setControllerHideOnTouch(true);
        playerView.setShowSubtitleButton(true);
        root.addView(playerView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(12), dp(16), dp(16), dp(8));

        Button close = new Button(this);
        close.setText("‹");
        close.setTextSize(32);
        close.setTextColor(Color.WHITE);
        close.setContentDescription("Go back");
        close.setBackgroundColor(Color.TRANSPARENT);
        close.setMinWidth(dp(48));
        close.setMinHeight(dp(48));
        close.setOnClickListener(view -> finishWithResult(false, lastError));
        header.addView(close, new LinearLayout.LayoutParams(dp(56), dp(56)));

        LinearLayout titleBlock = new LinearLayout(this);
        titleBlock.setOrientation(LinearLayout.VERTICAL);
        TextView title = new TextView(this);
        title.setText(getIntent().getStringExtra(EXTRA_TITLE));
        title.setTextColor(Color.WHITE);
        title.setTextSize(16);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setMaxLines(1);
        titleBlock.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText(getIntent().getStringExtra(EXTRA_SUBTITLE));
        subtitle.setTextColor(0xB3FFFFFF);
        subtitle.setTextSize(12);
        subtitle.setMaxLines(1);
        titleBlock.addView(subtitle);
        header.addView(titleBlock, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Button pip = new Button(this);
            pip.setText("PiP");
            pip.setTextSize(12);
            pip.setTextColor(Color.WHITE);
            pip.setContentDescription("Picture in picture");
            pip.setBackgroundColor(0x66000000);
            pip.setMinWidth(dp(56));
            pip.setMinHeight(dp(48));
            pip.setOnClickListener(view -> enterPictureInPicture());
            header.addView(pip, new LinearLayout.LayoutParams(dp(68), dp(48)));
        }

        FrameLayout.LayoutParams headerParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.TOP
        );
        root.addView(header, headerParams);

        errorPanel = new LinearLayout(this);
        errorPanel.setOrientation(LinearLayout.VERTICAL);
        errorPanel.setGravity(Gravity.CENTER);
        errorPanel.setPadding(dp(28), dp(28), dp(28), dp(28));
        errorPanel.setBackgroundColor(0xF2000000);
        errorPanel.setVisibility(View.GONE);

        TextView heading = new TextView(this);
        heading.setText(R.string.player_error_title);
        heading.setTextColor(Color.WHITE);
        heading.setTextSize(20);
        heading.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        heading.setGravity(Gravity.CENTER);
        errorPanel.addView(heading);

        errorMessage = new TextView(this);
        errorMessage.setTextColor(0xB3FFFFFF);
        errorMessage.setTextSize(14);
        errorMessage.setGravity(Gravity.CENTER);
        errorMessage.setPadding(0, dp(12), 0, dp(20));
        errorPanel.addView(errorMessage, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER);

        Button back = new Button(this);
        back.setText(R.string.player_go_back);
        back.setOnClickListener(view -> finishWithResult(false, lastError));
        actions.addView(back);

        Button retry = new Button(this);
        retry.setText(R.string.player_retry);
        retry.setOnClickListener(view -> {
            lastError = null;
            sourceIndex = 0;
            playSource(0, lastPositionMs);
        });
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        retryParams.setMarginStart(dp(12));
        actions.addView(retry, retryParams);
        errorPanel.addView(actions);

        root.addView(errorPanel, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        setContentView(root);
    }

    private void initializePlayer() {
        DefaultHttpDataSource.Factory httpFactory = new DefaultHttpDataSource.Factory()
            .setUserAgent("AuraIPTV (Android Media3)")
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(15_000)
            .setReadTimeoutMs(30_000);

        player = new ExoPlayer.Builder(this)
            .setMediaSourceFactory(new DefaultMediaSourceFactory(httpFactory))
            .build();
        player.setHandleAudioBecomingNoisy(true);
        playerView.setPlayer(player);
        player.addListener(new Player.Listener() {
            @Override
            public void onPlayerError(PlaybackException error) {
                lastPositionMs = Math.max(lastPositionMs, player.getCurrentPosition());
                if (sourceIndex + 1 < urls.size()) {
                    sourceIndex += 1;
                    Toast.makeText(NativePlayerActivity.this, R.string.player_trying_fallback, Toast.LENGTH_SHORT).show();
                    playSource(sourceIndex, lastPositionMs);
                    return;
                }

                lastError = error.getErrorCodeName();
                if (error.getMessage() != null && !error.getMessage().trim().isEmpty()) {
                    lastError += ": " + error.getMessage();
                }
                showPlaybackError(lastError);
            }

            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (playbackState == Player.STATE_ENDED) {
                    if (isLive) showPlaybackError("The live stream ended. It may be temporarily offline.");
                    else finishWithResult(true, null);
                }
            }
        });
    }

    private void playSource(int index, long startPositionMs) {
        if (player == null || index < 0 || index >= urls.size()) return;
        errorPanel.setVisibility(View.GONE);
        MediaItem mediaItem = MediaItem.fromUri(urls.get(index));
        player.setMediaItem(mediaItem, Math.max(0L, startPositionMs));
        player.prepare();
        player.play();
    }

    private void showPlaybackError(String message) {
        lastError = message;
        if (player != null) player.pause();
        errorMessage.setText(getString(R.string.player_error_message, message));
        errorPanel.setVisibility(View.VISIBLE);
        errorPanel.bringToFront();
    }

    private void finishWithResult(boolean ended, @Nullable String error) {
        if (finishedWithResult) return;
        finishedWithResult = true;
        capturePlayerState();

        Intent data = new Intent();
        data.putExtra(RESULT_ENDED, ended);
        data.putExtra(RESULT_POSITION_MS, lastPositionMs);
        data.putExtra(RESULT_DURATION_MS, lastDurationMs);
        data.putExtra(RESULT_USED_FALLBACK, sourceIndex > 0);
        if (error != null && !error.trim().isEmpty()) data.putExtra(RESULT_ERROR, error);
        setResult(ended ? Activity.RESULT_OK : Activity.RESULT_CANCELED, data);
        finish();
    }

    private void capturePlayerState() {
        if (player == null) return;
        lastPositionMs = Math.max(0L, player.getCurrentPosition());
        long duration = player.getDuration();
        lastDurationMs = duration > 0 ? duration : 0L;
    }

    private void enterPictureInPicture() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || isInPictureInPictureMode()) return;
        int width = 16;
        int height = 9;
        if (player != null && player.getVideoSize().width > 0 && player.getVideoSize().height > 0) {
            width = player.getVideoSize().width;
            height = player.getVideoSize().height;
        }
        PictureInPictureParams params = new PictureInPictureParams.Builder()
            .setAspectRatio(new Rational(width, height))
            .build();
        enterPictureInPictureMode(params);
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
        if (header != null) header.setVisibility(isInPictureInPictureMode ? View.GONE : View.VISIBLE);
        if (playerView != null) playerView.setUseController(!isInPictureInPictureMode);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onPause() {
        super.onPause();
        capturePlayerState();
    }

    @Override
    protected void onResume() {
        super.onResume();
        WindowInsetsControllerCompat insets = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        insets.hide(WindowInsetsCompat.Type.systemBars());
        insets.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

    @Override
    protected void onDestroy() {
        capturePlayerState();
        if (playerView != null) playerView.setPlayer(null);
        if (player != null) {
            player.release();
            player = null;
        }
        super.onDestroy();
    }
}
