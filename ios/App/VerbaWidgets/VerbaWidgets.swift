import WidgetKit
import SwiftUI

@main
struct VerbaWidgetsBundle: WidgetBundle {
    var body: some Widget {
        VerbaWidget()
    }
}

struct VerbaWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "VerbaWidget",
            intent: VerbaConfigIntent.self,
            provider: VerbaTimelineProvider()
        ) { entry in
            VerbaWidgetView(entry: entry)
        }
        .configurationDisplayName("Verba Clock")
        .description("The time, written out in light.")
        .supportedFamilies([
            .systemSmall, .systemMedium, .systemLarge,
            .accessoryRectangular, .accessoryInline, .accessoryCircular,
        ])
        .contentMarginsDisabled()
    }
}

struct VerbaWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: VerbaEntry

    var body: some View {
        switch family {
        case .accessoryInline:
            AccessoryInlineView(moment: entry.moment)
                .containerBackground(for: .widget) { Color.clear }
        case .accessoryRectangular:
            AccessoryRectangularView(moment: entry.moment)
                .containerBackground(for: .widget) { Color.clear }
        case .accessoryCircular:
            AccessoryCircularView(moment: entry.moment)
                .containerBackground(for: .widget) { AccessoryWidgetBackground() }
        default:
            Group {
                if entry.style == .words {
                    WordsFaceView(moment: entry.moment, finish: entry.finish)
                } else {
                    MatrixFaceView(moment: entry.moment, finish: entry.finish)
                        .padding(family == .systemSmall ? 8 : 12)
                }
            }
            .containerBackground(for: .widget) { entry.finish.surface }
        }
    }
}
