import Foundation

// The phone app pushes its settings JSON into the App Group on every change
// (WidgetBridgePlugin); the watch app writes the same shape itself, via save().
// Widgets fall back to app defaults when absent. Same group ID on both platforms —
// an App Group identifier is account-scoped, not per-device.
public struct SharedSettings: Codable {
    public var languageId: String = "en"
    public var finishId: String = "deep-black"
    public var showItIs: Bool = true

    public static let suiteName = "group.com.verba.clock"
    public static let key = "settings"

    private enum CodingKeys: String, CodingKey { case languageId, finishId, showItIs }

    public init() {}

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        languageId = try container.decodeIfPresent(String.self, forKey: .languageId) ?? "en"
        finishId = try container.decodeIfPresent(String.self, forKey: .finishId) ?? "deep-black"
        showItIs = try container.decodeIfPresent(Bool.self, forKey: .showItIs) ?? true
    }

    public static func load() -> SharedSettings {
        guard
            let raw = UserDefaults(suiteName: suiteName)?.string(forKey: key),
            let data = raw.data(using: .utf8),
            let settings = try? JSONDecoder().decode(SharedSettings.self, from: data)
        else { return SharedSettings() }
        return settings
    }

    public func save() {
        guard let data = try? JSONEncoder().encode(self),
              let raw = String(data: data, encoding: .utf8) else { return }
        UserDefaults(suiteName: Self.suiteName)?.set(raw, forKey: Self.key)
    }
}
