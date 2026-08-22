import SwiftUI
import VerbaFaceKit
import WidgetKit

struct VerbaEntry: TimelineEntry {
    let date: Date
    let moment: FaceMoment
    let finish: Finish
    let style: WidgetStyle
}

struct VerbaTimelineProvider: AppIntentTimelineProvider {
    private func entry(for date: Date, intent: VerbaConfigIntent, app: SharedSettings) -> VerbaEntry {
        let components = Calendar.current.dateComponents([.hour, .minute], from: date)
        let moment = FaceMoment(
            language: FaceData.shared.language(intent.language.resolvedId(app: app)),
            hour: components.hour ?? 0,
            minute: components.minute ?? 0,
            showItIs: intent.itIs.resolved(app: app)
        )
        return VerbaEntry(
            date: date,
            moment: moment,
            finish: Finishes.byId(intent.finish.resolvedId(app: app)),
            style: intent.style
        )
    }

#if os(watchOS)
    // The watch has no widget-config gallery; the Smart Stack picks from offered presets.
    // One default ("Same as app") — per-widget tweaks happen in the widget's edit sheet.
    func recommendations() -> [AppIntentRecommendation<VerbaConfigIntent>] {
        [AppIntentRecommendation(intent: VerbaConfigIntent(), description: "Verba Clock")]
    }
#endif

    func placeholder(in context: Context) -> VerbaEntry {
        // Gallery preview: ten past ten, the watchmaker's pose
        let moment = FaceMoment(language: FaceData.shared.language("en"), hour: 10, minute: 10, showItIs: true)
        return VerbaEntry(date: .now, moment: moment, finish: Finishes.byId("deep-black"), style: .matrix)
    }

    func snapshot(for configuration: VerbaConfigIntent, in context: Context) async -> VerbaEntry {
        entry(for: .now, intent: configuration, app: SharedSettings.load())
    }

    func timeline(for configuration: VerbaConfigIntent, in context: Context) async -> Timeline<VerbaEntry> {
        let app = SharedSettings.load()
        let calendar = Calendar.current
        let now = Date.now
        var entries = [entry(for: now, intent: configuration, app: app)]

        // Entries at each five-minute boundary for the next four hours
        let minute = calendar.component(.minute, from: now)
        let second = calendar.component(.second, from: now)
        let toNextBoundary = TimeInterval((5 - minute % 5) * 60 - second)
        for step in 0..<48 {
            let date = now.addingTimeInterval(toNextBoundary + Double(step) * 300)
            entries.append(entry(for: date, intent: configuration, app: app))
        }
        return Timeline(entries: entries, policy: .atEnd)
    }
}
