import UIKit
import Capacitor
import LocalNotificationsPlugin
import PreferencesPlugin

/// 显式注册 Capacitor 插件（SPM 下 auto-register 可能找不到类）
open class BridgeViewController: CAPBridgeViewController {
    open override func capacitorDidLoad() {
        capAppLoadPlugins()
        bridge?.registerPluginInstance(ReminderPermissionPlugin())
        bridge?.registerPluginInstance(ReminderSchedulePlugin())
        bridge?.registerPluginInstance(LocalNotificationsPlugin())
        bridge?.registerPluginInstance(PreferencesPlugin())
        super.capacitorDidLoad()
    }
}
