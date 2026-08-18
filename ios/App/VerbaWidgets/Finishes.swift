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
               surface: surface([(0xC6C9CD, 0), (0xB3B6BA, 0.5), (0x9DA1A6, 1)])),
        Finish(id: "black-pepper", name: "Black Pepper", letter: .light, stencilOpacity: 0.16,
               surface: surface([(0x17181A, 0), (0x101113, 1)])),
        Finish(id: "grey-pepper", name: "Grey Pepper", letter: .light, stencilOpacity: 0.22,
               surface: surface([(0x5E6165, 0), (0x4C4F53, 1)])),
        Finish(id: "white-pepper", name: "White Pepper", letter: .dark, stencilOpacity: 0.25,
               surface: surface([(0xECEAE5, 0), (0xDEDBD4, 1)])),
        Finish(id: "red-pepper", name: "Red Pepper", letter: .light, stencilOpacity: 0.2,
               surface: surface([(0x7D1F24, 0), (0x641419, 1)])),
        Finish(id: "hazelnut", name: "Hazelnut", letter: .light, stencilOpacity: 0.2,
               surface: surface([(0x6B4A35, 0), (0x54382A, 1)])),
        Finish(id: "rust", name: "Rust", letter: .light, stencilOpacity: 0.22,
               surface: AnyView(ZStack {
                   linear([(0x7A3F1F, 0), (0x4A2513, 1)])
                   radialAccent(0x8A4A26, center: UnitPoint(x: 0.2, y: 0.15), radius: 0.6)
                   radialAccent(0x5C2F18, center: UnitPoint(x: 0.75, y: 0.7), radius: 0.5)
               })),
        Finish(id: "vintage-copper", name: "Vintage Copper", letter: .light, stencilOpacity: 0.22,
               surface: AnyView(ZStack {
                   linear([(0x7A5140, 0), (0x3C5F55, 1)])
                   radialAccent(0x3F7F6F, center: UnitPoint(x: 0.3, y: 0.25), radius: 0.55)
               })),
        Finish(id: "gold", name: "Gold", letter: .dark, stencilOpacity: 0.28,
               surface: surface([(0xD4AF37, 0), (0xF0D878, 0.3), (0xC69F2E, 0.55), (0xE8CC60, 0.8), (0xB8922A, 1)])),
        Finish(id: "silver-gold", name: "Silver & Gold", letter: .dark, stencilOpacity: 0.28,
               surface: surface([(0xCFC8AE, 0), (0xE9E4CF, 0.35), (0xC2BB9F, 0.65), (0xDED6BA, 1)])),
        Finish(id: "platinum", name: "Platinum", letter: .light, stencilOpacity: 0.3,
               surface: surface([(0x8F9294, 0), (0x6D7073, 0.45), (0x95989A, 0.75), (0x7C7F82, 1)])),
        Finish(id: "moon-gold", name: "Moon Gold", letter: .dark, stencilOpacity: 0.28,
               surface: surface([(0xC9B189, 0), (0xE6D3AD, 0.4), (0xBFA77E, 0.7), (0xDCC79E, 1)])),
        Finish(id: "glintscape", name: "Glintscape", letter: .light, stencilOpacity: 0.24,
               surface: surface([(0x6E6659, 0), (0x4E483E, 0.5), (0x5D564A, 1)])),
        Finish(id: "metamorphite", name: "Metamorphite", letter: .light, stencilOpacity: 0.2,
               surface: surface([(0x3A3D40, 0), (0x26282B, 0.45), (0x33363A, 0.8), (0x212326, 1)])),
        Finish(id: "desert", name: "Desert", letter: .dark, stencilOpacity: 0.26,
               surface: AnyView(ZStack {
                   linear([(0xDFD5C2, 0), (0xCABFA8, 0.55), (0xD8CDB8, 1)])
                   radialAccent(0xE7DDCC, center: UnitPoint(x: 0.25, y: 0.2), radius: 0.65)
               })),
    ]

    static func byId(_ id: String) -> Finish {
        all.first { $0.id == id } ?? all[0]
    }
}
