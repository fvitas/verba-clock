import Foundation

// The app pushes its settings JSON into the App Group on every change
// (WidgetBridgePlugin). Widgets fall back to app defaults when absent.
struct SharedSettings: Decodable {
    var languageId: String = "en"
    var finishId: String = "deep-black"
    var showItIs: Bool = true

    static let suiteName = "group.com.verba.clock"
    static let key = "settings"

    private enum CodingKeys: String, CodingKey { case languageId, finishId, showItIs }

    init() {}

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        languageId = try container.decodeIfPresent(String.self, forKey: .languageId) ?? "en"
        finishId = try container.decodeIfPresent(String.self, forKey: .finishId) ?? "deep-black"
        showItIs = try container.decodeIfPresent(Bool.self, forKey: .showItIs) ?? true
    }

    static func load() -> SharedSettings {
        guard
            let raw = UserDefaults(suiteName: suiteName)?.string(forKey: key),
            let data = raw.data(using: .utf8),
            let settings = try? JSONDecoder().decode(SharedSettings.self, from: data)
        else { return SharedSettings() }
        return settings
    }
}
