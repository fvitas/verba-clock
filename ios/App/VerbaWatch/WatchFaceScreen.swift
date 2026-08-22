import SwiftUI
import VerbaFaceKit

struct WatchFaceScreen: View {
    @Environment(\.isLuminanceReduced) private var isLuminanceReduced
    @State private var settings = SharedSettings.load()
    @State private var showSettings = false

    var body: some View {
        TimelineView(.everyMinute) { context in
            face(at: context.date)
        }
        .ignoresSafeArea()
        .contentShape(Rectangle())
        .onTapGesture { showSettings = true }
        .sheet(isPresented: $showSettings) {
            WatchSettingsView(settings: $settings)
        }
    }

    private func face(at date: Date) -> some View {
        let components = Calendar.current.dateComponents([.hour, .minute], from: date)
        let language = FaceData.shared.language(settings.languageId)
        let moment = FaceMoment(
            language: language,
            hour: components.hour ?? 0,
            minute: components.minute ?? 0,
            showItIs: settings.showItIs
        )
        // AOD: black, faint stencil, no glow — the system dims whatever we draw further
        let finish = isLuminanceReduced ? .alwaysOn : Finishes.byId(settings.finishId)
        return ZStack {
            if isLuminanceReduced {
                Color.black.ignoresSafeArea()
            } else {
                finish.surface.ignoresSafeArea()
            }
            Group {
                if language.isWordGrid {
                    WordGridFaceView(moment: moment, finish: finish, glow: !isLuminanceReduced)
                } else {
                    MatrixFaceView(moment: moment, finish: finish, glow: !isLuminanceReduced)
                }
            }
            .padding(6)
        }
        .environment(\.layoutDirection, language.dir == "rtl" ? .rightToLeft : .leftToRight)
    }
}
