import Foundation
import Capacitor
import UserNotifications

/// 直接调用 iOS 系统通知授权，绕过 LocalNotifications 插件桥接问题
@objc(ReminderPermissionPlugin)
public class ReminderPermissionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ReminderPermissionPlugin"
    public let jsName = "ReminderPermission"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "check", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise),
    ]

    @objc func check(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            call.resolve(["display": Self.mapStatus(settings.authorizationStatus)])
        }
    }

    @objc func request(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
                if let error = error {
                    call.reject(error.localizedDescription)
                    return
                }
                call.resolve(["display": granted ? "granted" : "denied"])
            }
        }
    }

    private static func mapStatus(_ status: UNAuthorizationStatus) -> String {
        switch status {
        case .authorized, .ephemeral, .provisional:
            return "granted"
        case .denied:
            return "denied"
        case .notDetermined:
            return "prompt"
        @unknown default:
            return "prompt"
        }
    }
}
