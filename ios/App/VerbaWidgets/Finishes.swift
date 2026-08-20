import SwiftUI

/// Native port of src/finishes/catalog.ts. Each finish is the same stack of layers the web CSS
/// builds, in the same paint order: a gradient or a procedural material, then any highlight, then
/// any sheen or grain on top. CSS lists background layers topmost-first, so its order is reversed
/// here. The materials themselves are generated rather than approximated — see Textures.
typealias SurfaceLayer = (CGContext, Int) -> Void

struct Finish {
    let id: String
    let name: String
    let letter: LetterTone
    let stencilOpacity: Double
    let layers: [SurfaceLayer]

    enum LetterTone { case light, dark }

    var litColor: Color { letter == .light ? .white : Color(hex: 0x181614) }
    var stencilColor: Color {
        (letter == .light ? Color.white : Color.black).opacity(stencilOpacity)
    }

    var surface: AnyView { AnyView(SurfaceView(id: id, layers: layers)) }

    // StandBy/lock screen strip the container background; letters must read on black
    var onBlack: Finish {
        Finish(id: id, name: name, letter: .light, stencilOpacity: stencilOpacity, layers: layers)
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

/// The finish drawn once into a square bitmap and stretched to the widget. Stretching is what the
/// web does too — its material SVGs carry preserveAspectRatio='none' — so a wide widget gets the
/// same horizontally drawn-out grain the app shows on a wide face.
private struct SurfaceView: View {
    let id: String
    let layers: [SurfaceLayer]

    var body: some View {
        if let image = SurfaceCache.image(id: id, layers: layers) {
            Image(decorative: image, scale: 1).resizable()
        } else {
            Color(hex: 0x0A0A0C)
        }
    }
}

/// A timeline is 49 entries and every one of them renders the background, so the bitmap is built
/// once per finish and kept. One slot is enough: a widget shows one finish at a time.
private enum SurfaceCache {
    /// Fine enough that the scale up to a large widget stays soft rather than blocky, small enough
    /// that a widget extension's memory budget never notices the megabyte
    private static let side = 512
    private static let lock = NSLock()
    private static var cached: (id: String, image: CGImage)?

    static func image(id: String, layers: [SurfaceLayer]) -> CGImage? {
        lock.lock()
        defer { lock.unlock() }
        if let hit = cached, hit.id == id { return hit.image }
        guard let made = render(layers) else { return nil }
        cached = (id, made)
        return made
    }

    private static func render(_ layers: [SurfaceLayer]) -> CGImage? {
        let info = CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
        guard let context = CGContext(
            data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: side * 4,
            space: Textures.colorSpace, bitmapInfo: info
        ) else { return nil }

        // Flip to y-down, so every layer below reads the way the CSS it came from does
        context.translateBy(x: 0, y: CGFloat(side))
        context.scaleBy(x: 1, y: -1)
        for layer in layers { layer(context, side) }
        return context.makeImage()
    }
}

// Palettes are the catalog's mottle() ramps, unchanged
private let steelRamp: [UInt32] = [0x9A9EA3, 0xA8ACB0, 0xB4B7BB, 0xBFC2C6]
private let rustRamp: [UInt32] = [
    0x120804, 0x1E0D06, 0x2B1308, 0x3A1A0B, 0x4F2410, 0x6D3315, 0xA04E1A, 0xD97A28,
]
private let copperRamp: [UInt32] = [0x0F3230, 0x15514C, 0x27897D, 0x4FB3A4, 0x8FD8C8, 0xC9E8DD]
private let wavesRamp: [UInt32] = [0x0F1A32, 0x062460, 0x274B89, 0x4F77B3, 0x8FB1D8, 0xC9DCE8]
private let silverGoldRamp: [UInt32] = [0x6D6650, 0x8A836A, 0xA49C84, 0xBDB59D, 0xD2CCB6]
private let platinumRamp: [UInt32] = [0x847C6E, 0xA29A8C, 0xBCB5A8, 0xD2CCC0, 0xE8E4DA]
private let moonGoldRamp: [UInt32] = [0xAB8759, 0xBD9A6C, 0xCDAC7E, 0xDBBD90, 0xE8CFA4]
private let slateRamp: [UInt32] = [0x0B0D0F, 0x131518, 0x1A1D20, 0x22262A, 0x31363C]
private let sandRamp: [UInt32] = [0xC9B596, 0xDCCCB4, 0xE8DBC6, 0xF0E6D4, 0xF7F0E1]

/// Opaque colours, top-left to bottom-right like the web's 135deg.
private func gradient(_ stops: [(UInt32, Double)]) -> SurfaceLayer {
    linear(stops.map { (0xFF00_0000 | $0.0, $0.1) })
}

/// The same, keeping the alpha it was given — a translucent gloss over a material.
private func sheen(_ stops: [(UInt32, Double)]) -> SurfaceLayer {
    linear(stops)
}

private func linear(_ stops: [(UInt32, Double)]) -> SurfaceLayer {
    { context, side in
        guard let gradient = CGGradient(
            colorsSpace: Textures.colorSpace,
            colors: stops.map { colour($0.0) } as CFArray,
            locations: stops.map { CGFloat($0.1) }
        ) else { return }
        context.drawLinearGradient(
            gradient, start: .zero, end: CGPoint(x: side, y: side),
            options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
        )
    }
}

/// A radial highlight: centre in unit coords, radius as a fraction of the side.
private func accent(_ argb: UInt32, x: Double, y: Double, radius: Double) -> SurfaceLayer {
    { context, side in
        let center = CGPoint(x: x * Double(side), y: y * Double(side))
        guard let gradient = CGGradient(
            colorsSpace: Textures.colorSpace,
            // Fading to the same colour at zero alpha, so it never darkens on its way out
            colors: [colour(argb), colour(argb & 0x00FF_FFFF)] as CFArray,
            locations: [0, 1]
        ) else { return }
        context.drawRadialGradient(
            gradient, startCenter: center, startRadius: 0,
            endCenter: center, endRadius: Double(side) * radius,
            options: .drawsBeforeStartLocation
        )
    }
}

private func mottle(_ spec: Textures.Noise, _ ramp: [UInt32]) -> SurfaceLayer {
    { context, side in
        guard let image = Textures.palette(side, spec, ramp) else { return }
        blit(image, context, side)
    }
}

private func wash(_ spec: Textures.Noise, _ rgb: UInt32, _ alphas: [Float]) -> SurfaceLayer {
    { context, side in
        guard let image = Textures.wash(side, spec, rgb, alphas) else { return }
        blit(image, context, side)
    }
}

/// The catalog's noise() overlay. Its alpha is as random as its colour, so it does not just add
/// speckle — it pulls the surface toward mid-grey, by opacity x 0.5 x (127 - base). That lift is
/// why the app's dark finishes read lighter than their gradients alone, and dropping it as
/// "invisible grain" is what made every dark finish here come out too dark. Its own frequency is
/// far finer than a widget pixel, so it lands as per-pixel randomness whatever value it started
/// from; only the mean and the spread survive the trip.
private func grain(_ opacity: Float, _ seed: Int) -> SurfaceLayer {
    wash(Textures.Noise(freqX: 0.6, freqY: 0.6, octaves: 3, seed: seed), 0x7F7F7F, [0, opacity])
}

/// The context runs y-down for the gradients and paths, so flip back for a blit: an image drawn
/// into a flipped space would come out mirrored, and the angled grains would lean the wrong way.
private func blit(_ image: CGImage, _ context: CGContext, _ side: Int) {
    context.saveGState()
    context.translateBy(x: 0, y: CGFloat(side))
    context.scaleBy(x: 1, y: -1)
    context.draw(image, in: CGRect(x: 0, y: 0, width: side, height: side))
    context.restoreGState()
}

/// Desert's veins, traced from the QLOCKTWO reference in catalog.ts. Drawn in the catalog's
/// 900-unit space and stretched to the surface, which is what its SVG does with
/// preserveAspectRatio='none'. The displacement filter that frays them has no CoreGraphics
/// equivalent.
private func veins() -> SurfaceLayer {
    { context, side in
        let vein = curve(495, -20, [440, 180, 370, 330, 300, 470, 240, 590, 160, 720, 70, 880])
        let vein2 = curve(-20, 160, [120, 120, 260, 90, 400, 70])
        let vein3 = curve(830, -20, [800, 120, 760, 240, 690, 400])
        let debris1 = line([370, 330, 430, 380, 470, 400])
        let debris2 = line([240, 590, 300, 640, 330, 670])

        // A hairline of the catalog's tile lands under a pixel here and would vanish into the
        // scale up to the widget, so no stroke is allowed thinner than one bitmap pixel
        let hairline = 900 / Double(side)

        context.saveGState()
        context.scaleBy(x: Double(side) / 900, y: Double(side) / 900)
        stroke(context, vein, 0xA5804D, 16, 0.12, hairline: hairline)
        stroke(context, vein, 0xB08E58, 8, 0.3, hairline: hairline)
        stroke(context, vein, 0x7D5C34, 3.5, 0.6, hairline: hairline)
        stroke(context, vein, 0x6F5230, 1.4, 0.55, dashed: true, hairline: hairline)
        stroke(context, debris1, 0x85643C, 1.8, 0.4, hairline: hairline)
        stroke(context, debris2, 0x85643C, 1.6, 0.38, hairline: hairline)
        stroke(context, vein2, 0xA5804D, 5, 0.2, hairline: hairline)
        stroke(context, vein2, 0x85643C, 1.8, 0.4, hairline: hairline)
        stroke(context, vein3, 0xA5804D, 4, 0.18, hairline: hairline)
        stroke(context, vein3, 0x85643C, 1.6, 0.35, hairline: hairline)
        context.restoreGState()
    }
}

private func curve(_ x: Double, _ y: Double, _ cubics: [Double]) -> CGPath {
    let path = CGMutablePath()
    path.move(to: CGPoint(x: x, y: y))
    for i in stride(from: 0, to: cubics.count, by: 6) {
        path.addCurve(
            to: CGPoint(x: cubics[i + 4], y: cubics[i + 5]),
            control1: CGPoint(x: cubics[i], y: cubics[i + 1]),
            control2: CGPoint(x: cubics[i + 2], y: cubics[i + 3])
        )
    }
    return path
}

private func line(_ points: [Double]) -> CGPath {
    let path = CGMutablePath()
    path.move(to: CGPoint(x: points[0], y: points[1]))
    for i in stride(from: 2, to: points.count, by: 2) {
        path.addLine(to: CGPoint(x: points[i], y: points[i + 1]))
    }
    return path
}

private func stroke(_ context: CGContext, _ path: CGPath, _ rgb: UInt32, _ width: Double,
                    _ opacity: Double, dashed: Bool = false, hairline: Double) {
    context.saveGState()
    context.addPath(path)
    context.setLineWidth(max(width, hairline))
    context.setLineCap(.round)
    context.setStrokeColor(colour(UInt32((opacity * 255).rounded()) << 24 | rgb))
    if dashed { context.setLineDash(phase: 0, lengths: [3, 5]) }
    context.strokePath()
    context.restoreGState()
}

/// The space is named rather than left to CGColor's convenience initialiser, which would answer
/// with Generic RGB — see Textures.colorSpace.
private func colour(_ argb: UInt32) -> CGColor {
    let components: [CGFloat] = [
        Double((argb >> 16) & 0xFF) / 255,
        Double((argb >> 8) & 0xFF) / 255,
        Double(argb & 0xFF) / 255,
        Double((argb >> 24) & 0xFF) / 255,
    ]
    return CGColor(colorSpace: Textures.colorSpace, components: components) ?? CGColor(gray: 0, alpha: 1)
}

private func fractal(_ freqX: Float, _ freqY: Float, _ octaves: Int, _ seed: Int) -> Textures.Noise {
    Textures.Noise(freqX: freqX, freqY: freqY, octaves: octaves, seed: seed)
}

private func turbulent(_ freq: Float, _ octaves: Int, _ seed: Int) -> Textures.Noise {
    Textures.Noise(freqX: freq, freqY: freq, octaves: octaves, seed: seed, turbulence: true)
}

private func rotated(_ freqX: Float, _ freqY: Float, _ octaves: Int, _ seed: Int,
                     _ degrees: Float) -> Textures.Noise {
    Textures.Noise(freqX: freqX, freqY: freqY, octaves: octaves, seed: seed, rotate: degrees)
}

enum Finishes {
    static let all: [Finish] = [
        Finish(id: "deep-black", name: "Deep Black", letter: .light, stencilOpacity: 0.15,
               layers: [gradient([(0x0A0A0C, 0), (0x050506, 0.6), (0x070709, 1)])]),
        Finish(id: "stainless-steel", name: "Stainless Steel", letter: .dark, stencilOpacity: 0.3,
               layers: [
                   mottle(fractal(0.006, 0.55, 3, 7), steelRamp),
                   sheen([(0x1FFF_FFFF, 0), (0x0A00_0000, 0.4), (0x17FF_FFFF, 0.65), (0x1200_0000, 1)]),
               ]),
        Finish(id: "black-pepper", name: "Black Pepper", letter: .light, stencilOpacity: 0.16,
               layers: [
                   gradient([(0x0A0A0C, 0), (0x050506, 0.6), (0x070709, 1)]),
                   accent(0x732C_2C34, x: 0.3, y: 0, radius: 0.6),
                   grain(0.12, 41),
               ]),
        Finish(id: "grey-pepper", name: "Grey Pepper", letter: .light, stencilOpacity: 0.22,
               layers: [gradient([(0x5E6165, 0), (0x4C4F53, 1)]), grain(0.18, 43)]),
        Finish(id: "white-pepper", name: "White Pepper", letter: .dark, stencilOpacity: 0.25,
               layers: [gradient([(0xECEAE5, 0), (0xDEDBD4, 1)]), grain(0.12, 47)]),
        Finish(id: "red-pepper", name: "Red Pepper", letter: .light, stencilOpacity: 0.2,
               layers: [gradient([(0x7D1F24, 0), (0x641419, 1)]), grain(0.15, 53)]),
        Finish(id: "hazelnut", name: "Hazelnut", letter: .dark, stencilOpacity: 0.25,
               layers: [
                   gradient([(0xAD9161, 0), (0x8C714A, 0.6), (0x9F8355, 1)]),
                   accent(0x38FF_F0D2, x: 0.3, y: 0.1, radius: 0.6),
                   grain(0.07, 59),
               ]),
        Finish(id: "rust", name: "Rust", letter: .light, stencilOpacity: 0.22,
               layers: [mottle(fractal(0.006, 0.006, 6, 11), rustRamp), grain(0.14, 61)]),
        Finish(id: "vintage-copper", name: "Vintage Copper", letter: .light, stencilOpacity: 0.22,
               layers: [mottle(turbulent(0.007, 5, 5), copperRamp), grain(0.1, 67)]),
        Finish(id: "waves", name: "Waves", letter: .light, stencilOpacity: 0.22,
               layers: [mottle(fractal(0.005, 0.005, 5, 5), wavesRamp), grain(0.1, 71)]),
        Finish(id: "gold", name: "Gold", letter: .dark, stencilOpacity: 0.28,
               layers: [
                   gradient([(0xD4AF37, 0), (0xF0D878, 0.3), (0xC69F2E, 0.55),
                             (0xE8CC60, 0.8), (0xB8922A, 1)]),
                   grain(0.08, 73),
               ]),
        Finish(id: "silver-gold", name: "Silver & Gold", letter: .dark, stencilOpacity: 0.28,
               layers: [mottle(fractal(0.009, 0.009, 6, 13), silverGoldRamp), grain(0.08, 79)]),
        Finish(id: "platinum", name: "Platinum", letter: .light, stencilOpacity: 0.3,
               layers: [mottle(fractal(0.005, 0.005, 5, 21), platinumRamp), grain(0.07, 83)]),
        Finish(id: "moon-gold", name: "Moon Gold", letter: .dark, stencilOpacity: 0.28,
               layers: [mottle(fractal(0.006, 0.006, 5, 9), moonGoldRamp), grain(0.07, 89)]),
        Finish(id: "metamorphite", name: "Metamorphite", letter: .light, stencilOpacity: 0.2,
               layers: [mottle(rotated(0.003, 0.014, 4, 9, -35), slateRamp), grain(0.15, 97)]),
        Finish(id: "desert", name: "Desert", letter: .dark, stencilOpacity: 0.3,
               layers: [
                   mottle(fractal(0.55, 0.55, 3, 8), sandRamp),
                   wash(fractal(0.006, 0.006, 4, 31), 0xC0A069, [0, 0.02, 0.08, 0.18, 0.3]),
                   wash(fractal(0.4, 0.4, 3, 17), 0x7A5C34, [0, 0, 0, 0, 0.12, 0.26]),
                   veins(),
               ]),
    ]

    static func byId(_ id: String) -> Finish {
        all.first { $0.id == id } ?? all[0]
    }
}
