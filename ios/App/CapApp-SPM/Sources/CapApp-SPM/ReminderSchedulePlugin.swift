import Foundation
import Capacitor
import UserNotifications

private let reminderNotificationId = "1001"

/// iOS 原生每日提醒调度（绕过 LocalNotifications JS 桥接挂起问题）
@objc(ReminderSchedulePlugin)
public class ReminderSchedulePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ReminderSchedulePlugin"
    public let jsName = "ReminderSchedule"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "cancelDaily", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleDaily", returnType: CAPPluginReturnPromise),
    ]

    @objc func cancelDaily(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [reminderNotificationId])
        call.resolve(["ok": true])
    }

    @objc func scheduleDaily(_ call: CAPPluginCall) {
        guard let hour = call.getInt("hour"), let minute = call.getInt("minute") else {
            call.reject("Must provide hour and minute")
            return
        }

        let title = call.getString("title") ?? "念起 · 念念在等你"
        let body = call.getString("body") ?? "今天抽一张情绪卡，和念念聊聊也好，静一静也好。"

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        var dateComponents = DateComponents()
        dateComponents.hour = hour
        dateComponents.minute = minute

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(identifier: reminderNotificationId, content: content, trigger: trigger)
        let center = UNUserNotificationCenter.current()

        center.removePendingNotificationRequests(withIdentifiers: [reminderNotificationId])
        center.add(request) { error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            call.resolve(["ok": true])
        }
    }
}
