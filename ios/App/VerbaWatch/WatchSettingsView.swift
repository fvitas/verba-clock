import SwiftUI
import VerbaFaceKit
import WidgetKit

struct WatchSettingsView: View {
    @Binding var settings: SharedSettings

    var body: some View {
        NavigationStack {
            Form {
                Picker("Language", selection: $settings.languageId) {
                    ForEach(FaceData.shared.languages, id: \.id) { language in
                        Text(language.name).tag(language.id)
                    }
                }
                Picker("Finish", selection: $settings.finishId) {
                    ForEach(Finishes.all, id: \.id) { finish in
                        Text(finish.name).tag(finish.id)
                    }
                }
                Toggle("\u{201C}It is\u{201D} words", isOn: $settings.showItIs)
            }
            .navigationTitle("Verba")
        }
        .onChange(of: settings.languageId) { save() }
        .onChange(of: settings.finishId) { save() }
        .onChange(of: settings.showItIs) { save() }
    }

    // The widget's "Same as app" reads the same group, so every change re-times it
    private func save() {
        settings.save()
        WidgetCenter.shared.reloadAllTimelines()
    }
}
