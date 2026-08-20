package com.verba.clock.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

import com.verba.clock.MainActivity;
import com.verba.clock.R;

import java.util.Calendar;

/**
 * The home-screen word clock. Ticks itself on five-minute boundaries with an inexact alarm —
 * exact alarms would need SCHEDULE_EXACT_ALARM, and the app ships with no permissions at all.
 * The info XML's updatePeriodMillis is the reboot-proof safety net that re-arms that alarm.
 */
public class VerbaWidgetProvider extends AppWidgetProvider {
    private static final String TAG = "VerbaWidget";
    private static final String ACTION_TICK = "com.verba.clock.widget.TICK";
    private static final int BUCKET_MINUTES = 5;
    /** Inexact alarms drift; a short window keeps the visible minute honest without a permission. */
    private static final long TICK_WINDOW_MS = 30_000L;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] widgetIds) {
        for (int widgetId : widgetIds) draw(context, manager, widgetId);
        scheduleTick(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int widgetId,
                                          Bundle options) {
        draw(context, manager, widgetId);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (ACTION_TICK.equals(action)
            || Intent.ACTION_USER_PRESENT.equals(action)
            || Intent.ACTION_TIME_CHANGED.equals(action)
            || Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {
            Log.d(TAG, "refresh from " + action);
            refresh(context);
        }
    }

    @Override
    public void onDisabled(Context context) {
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        if (alarms != null) alarms.cancel(tickIntent(context));
    }

    /** Redraws every placed widget; also how the app's settings changes reach the home screen. */
    public static void refresh(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] widgetIds = manager.getAppWidgetIds(new ComponentName(context, VerbaWidgetProvider.class));
        for (int widgetId : widgetIds) draw(context, manager, widgetId);
        scheduleTick(context);
    }

    private static void draw(Context context, AppWidgetManager manager, int widgetId) {
        WidgetSettings settings = WidgetSettings.load(context);
        FaceData.Language language = FaceData.get(context).language(settings.languageId);
        Finishes.Finish finish = Finishes.byId(settings.finishId);
        Calendar now = Calendar.getInstance();
        FaceData.Moment moment = new FaceData.Moment(
            language, now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE), settings.showItIs);

        int[] size = sizePx(context, manager.getAppWidgetOptions(widgetId));
        Bitmap surface = FaceRenderer.renderSurface(finish, size[0], size[1]);
        Bitmap face = FaceRenderer.renderFace(context, moment, finish, Math.min(size[0], size[1]));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_face);
        views.setImageViewBitmap(R.id.widget_surface, surface);
        views.setImageViewBitmap(R.id.widget_face, face);
        views.setOnClickPendingIntent(R.id.widget_face, launchIntent(context));
        manager.updateAppWidget(widgetId, views);
    }

    /**
     * The bitmap is drawn at the widget's own aspect ratio so fitXY never distorts it. Options
     * report both orientations at once: min width / max height describe portrait, the reverse
     * describes landscape.
     */
    private static int[] sizePx(Context context, Bundle options) {
        boolean landscape = context.getResources().getConfiguration().orientation
            == Configuration.ORIENTATION_LANDSCAPE;
        int widthDp = options.getInt(landscape
            ? AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH
            : AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int heightDp = options.getInt(landscape
            ? AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT
            : AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT);
        float density = context.getResources().getDisplayMetrics().density;
        // A freshly placed widget can report 0 before the launcher measures it
        int width = widthDp > 0 ? Math.round(widthDp * density) : 320;
        int height = heightDp > 0 ? Math.round(heightDp * density) : 320;
        return new int[] { width, height };
    }

    private static void scheduleTick(Context context) {
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        if (alarms == null) return;
        Calendar next = Calendar.getInstance();
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        next.add(Calendar.MINUTE, BUCKET_MINUTES - next.get(Calendar.MINUTE) % BUCKET_MINUTES);
        alarms.setWindow(AlarmManager.RTC, next.getTimeInMillis(), TICK_WINDOW_MS, tickIntent(context));
    }

    private static PendingIntent tickIntent(Context context) {
        Intent intent = new Intent(context, VerbaWidgetProvider.class).setAction(ACTION_TICK);
        return PendingIntent.getBroadcast(context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent launchIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
    }
}
