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
    @Environment(\.showsWidgetContainerBackground) private var showsBackground
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
            // StandBy/lock screen remove the surface — letters must read on black
            let finish = showsBackground ? entry.finish : entry.finish.onBlack
            Group {
                if entry.style == .words {
                    WordsFaceView(moment: entry.moment, finish: finish)
                } else {
                    MatrixFaceView(moment: entry.moment, finish: finish)
                        .padding(family == .systemSmall ? 8 : 12)
                }
            }
            .containerBackground(for: .widget) { entry.finish.surface }
        }
    }
}
