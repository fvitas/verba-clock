import SwiftUI

// Native port of src/finishes/catalog.ts. The SVG noise grain is dropped —
// invisible at widget sizes. Radial accents survive as gradient layers.
struct Finish {
    let id: String
    let name: String
    let letter: LetterTone
    let stencilOpacity: Double
    let surface: AnyView

    enum LetterTone { case light, dark }

    var litColor: Color { letter == .light ? .white : Color(hex: 0x181614) }
    var stencilColor: Color {
        (letter == .light ? Color.white : Color.black).opacity(stencilOpacity)
    }

    // StandBy/lock screen strip the container background; letters must read on black
    var onBlack: Finish {
        Finish(id: id, name: name, letter: .light, stencilOpacity: stencilOpacity, surface: surface)
    }
}

extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}

private func linear(_ stops: [(UInt32, Double)]) -> LinearGradient {
    LinearGradient(
        stops: stops.map { .init(color: Color(hex: $0.0), location: $0.1) },
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

private func surface(_ stops: [(UInt32, Double)]) -> AnyView {
    AnyView(linear(stops))
}

private func radialAccent(_ hex: UInt32, center: UnitPoint, radius: CGFloat) -> some View {
    GeometryReader { geo in
        RadialGradient(
            colors: [Color(hex: hex), .clear],
            center: center,
            startRadius: 0,
            endRadius: max(geo.size.width, geo.size.height) * radius
        )
    }
}

enum Finishes {
    static let all: [Finish] = [
        Finish(id: "deep-black", name: "Deep Black", letter: .light, stencilOpacity: 0.15,
               surface: surface([(0x0A0A0C, 0), (0x050506, 0.6), (0x070709, 1)])),
        Finish(id: "stainless-steel", name: "Stainless Steel", letter: .dark, stencilOpacity: 0.3,
               surface: surface([(0xC2C5C9, 0), (0xB0B3B7, 0.5), (0x9EA2A7, 1)])),
        Finish(id: "black-pepper", name: "Black Pepper", letter: .light, stencilOpacity: 0.16,
               surface: AnyView(ZStack {
                   linear([(0x0A0A0C, 0), (0x050506, 0.6), (0x070709, 1)])
                   radialAccent(0x1E1E24, center: UnitPoint(x: 0.3, y: 0), radius: 0.6)
               })),
        Finish(id: "grey-pepper", name: "Grey Pepper", letter: .light, stencilOpacity: 0.22,
               surface: surface([(0x5E6165, 0), (0x4C4F53, 1)])),
        Finish(id: "white-pepper", name: "White Pepper", letter: .dark, stencilOpacity: 0.25,
               surface: surface([(0xECEAE5, 0), (0xDEDBD4, 1)])),
        Finish(id: "red-pepper", name: "Red Pepper", letter: .light, stencilOpacity: 0.2,
               surface: surface([(0x7D1F24, 0), (0x641419, 1)])),
        Finish(id: "hazelnut", name: "Hazelnut", letter: .dark, stencilOpacity: 0.25,
               surface: surface([(0xAD9161, 0), (0x8C714A, 0.6), (0x9F8355, 1)])),
        Finish(id: "rust", name: "Rust", letter: .light, stencilOpacity: 0.22,
               surface: AnyView(ZStack {
                   linear([(0x3A1A0B, 0), (0x4F2410, 0.5), (0x2B1308, 1)])
                   radialAccent(0xA04E1A, center: UnitPoint(x: 0.25, y: 0.2), radius: 0.55)
                   radialAccent(0x6D3315, center: UnitPoint(x: 0.7, y: 0.65), radius: 0.5)
               })),
        Finish(id: "vintage-copper", name: "Vintage Copper", letter: .light, stencilOpacity: 0.22,
               surface: AnyView(ZStack {
                   linear([(0x15514C, 0), (0x27897D, 0.5), (0x0F3230, 1)])
                   radialAccent(0x4FB3A4, center: UnitPoint(x: 0.3, y: 0.25), radius: 0.55)
               })),
        Finish(id: "waves", name: "Waves", letter: .light, stencilOpacity: 0.22,
               surface: AnyView(ZStack {
                   linear([(0x274B89, 0), (0x4F77B3, 0.5), (0x0F1A32, 1)])
                   radialAccent(0x8FB1D8, center: UnitPoint(x: 0.3, y: 0.25), radius: 0.55)
               })),
        Finish(id: "gold", name: "Gold", letter: .dark, stencilOpacity: 0.28,
               surface: surface([(0xD4AF37, 0), (0xF0D878, 0.3), (0xC69F2E, 0.55), (0xE8CC60, 0.8), (0xB8922A, 1)])),
        Finish(id: "silver-gold", name: "Silver & Gold", letter: .dark, stencilOpacity: 0.28,
               surface: surface([(0xA49C84, 0), (0xBDB59D, 0.5), (0x8A836A, 1)])),
        Finish(id: "platinum", name: "Platinum", letter: .light, stencilOpacity: 0.3,
               surface: surface([(0xBCB5A8, 0), (0xD2CCC0, 0.4), (0xA29A8C, 1)])),
        Finish(id: "moon-gold", name: "Moon Gold", letter: .dark, stencilOpacity: 0.28,
               surface: surface([(0xCDAC7E, 0), (0xDBBD90, 0.4), (0xAB8759, 1)])),
        Finish(id: "metamorphite", name: "Metamorphite", letter: .light, stencilOpacity: 0.2,
               surface: surface([(0x22262A, 0), (0x16181B, 0.5), (0x0B0D0F, 1)])),
        Finish(id: "desert", name: "Desert", letter: .dark, stencilOpacity: 0.3,
               surface: AnyView(ZStack {
                   linear([(0xE8DBC6, 0), (0xF0E6D4, 0.5), (0xDCCCB4, 1)])
                   radialAccent(0xF7F0E1, center: UnitPoint(x: 0.25, y: 0.2), radius: 0.65)
               })),
    ]

    static func byId(_ id: String) -> Finish {
        all.first { $0.id == id } ?? all[0]
    }
}
