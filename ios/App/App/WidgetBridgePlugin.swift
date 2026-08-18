import Capacitor
import WidgetKit

// Pushes the web app's settings JSON into the App Group so widgets can
// resolve their "Same as app" options, then reloads all widget timelines.
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "syncSettings", returnType: CAPPluginReturnPromise)
    ]

    @objc func syncSettings(_ call: CAPPluginCall) {
        guard let settings = call.getString("settings") else {
            call.reject("settings is required")
            return
        }
        UserDefaults(suiteName: "group.com.verba.clock")?.set(settings, forKey: "settings")
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}
