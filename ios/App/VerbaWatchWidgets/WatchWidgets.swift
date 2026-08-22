import SwiftUI
import VerbaFaceKit
import WidgetKit

// VerbaConfigIntent and VerbaTimelineProvider come from VerbaWidgets/{ConfigIntent,Timeline}.swift,
// which have membership in both extensions — same files, two targets, no drift. The Style and
// Finish parameters exist but an accessory rendering ignores them, exactly like iOS lock widgets.
@main
struct VerbaWatchWidgetsBundle: WidgetBundle {
    var body: some Widget {
        VerbaWatchWidget()
    }
}

struct VerbaWatchWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "VerbaWatchWidget",
            intent: VerbaConfigIntent.self,
            provider: VerbaTimelineProvider()
        ) { entry in
            AccessoryRectangularView(moment: entry.moment)
                .containerBackground(for: .widget) { Color.clear }
        }
        .configurationDisplayName("Verba Clock")
        .description("The time, written out in light.")
        .supportedFamilies([.accessoryRectangular])
    }
}
