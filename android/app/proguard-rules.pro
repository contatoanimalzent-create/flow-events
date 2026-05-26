# Pulse Android - ProGuard rules for release builds
# https://www.guardsquare.com/manual/configuration/usage

# Keep line numbers for crash reporting (Sentry)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Capacitor core (mantem reflexao do bridge JS<->Native)
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PluginMethod public <methods>;
}

# WebView JavaScript bridge
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Cordova / Capacitor plugins
-keep class org.apache.cordova.** { *; }

# Capacitor plugins instalados
-keep class com.capacitorjs.plugins.camera.** { *; }
-keep class com.capacitorjs.plugins.geolocation.** { *; }
-keep class com.capacitorjs.plugins.pushnotifications.** { *; }
-keep class com.capacitorjs.plugins.splashscreen.** { *; }
-keep class com.capacitorjs.plugins.statusbar.** { *; }
-keep class com.capacitorjs.plugins.keyboard.** { *; }
-keep class com.capacitorjs.plugins.network.** { *; }
-keep class com.capacitorjs.plugins.app.** { *; }

# Firebase / Google Services (push notifications via FCM)
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# AndroidX
-keep class androidx.** { *; }
-dontwarn androidx.**

# Native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelables
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Serializable
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Kotlin (se algum plugin usar)
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**

# OkHttp (caso seja usado por plugins HTTP)
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn org.conscrypt.**

# Pulse specifics
-keep class com.animalzgroup.pulse.** { *; }

# Remove logs em release (mantem performance)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
