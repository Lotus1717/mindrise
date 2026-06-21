import LocalNotificationsPlugin
import PreferencesPlugin

public let isCapacitorApp = true

/// 确保 SPM 插件类被链接进 App，供 Capacitor `NSClassFromString` 发现
public enum CapAppPluginBootstrap {
    public static func ensureLinked() {
        _ = LocalNotificationsPlugin.self
        _ = PreferencesPlugin.self
        _ = ReminderPermissionPlugin.self
        _ = ReminderSchedulePlugin.self
    }
}

private enum _CapAppPluginAutoLoad {
    static let loaded: Void = {
        CapAppPluginBootstrap.ensureLinked()
        return ()
    }()
}

/// App 启动时调用，触发插件类链接
public func capAppLoadPlugins() {
    _ = _CapAppPluginAutoLoad.loaded
}
