import CoreGraphics

/// The procedural half of src/finishes/catalog.ts. Nine of the sixteen finishes are not gradients
/// at all — the web grows them from SVG feTurbulence mapped through a palette ramp, which is what
/// makes steel look brushed and rust look oxidised. Core Graphics has no turbulence primitive, so
/// the same shape is generated here: fractal value noise through the identical piecewise-linear
/// ramp. The hash is the Android widget's, bit for bit, so both platforms grow the same material.
///
/// Frequencies are the catalog's own baseFrequency values — cycles per user unit on its 900-unit
/// tile. Every material's structure is low-frequency (3-8 cycles) and survives at widget size; the
/// grain and brushing layers are far finer than a widget pixel and land as soft noise instead of
/// crisp speckle. Octaves below a pixel are skipped, since they would only cost time.
enum Textures {
    private static let tile: Float = 900
    /// Bilinear value noise clusters tighter around its mean than Perlin does; widen to match.
    private static let contrast: Float = 1.3
    /// Turning each octave off-axis hides the lattice that bilinear noise would otherwise show.
    private static let octaveTurn: Float = 31
    /// Below a pixel per cycle the noise is sampled faster than it can be interpolated, so it
    /// arrives as uniform randomness — already wider than Perlin, and it needs narrowing rather
    /// than the widening interpolated noise wants. This is what keeps grain from turning to grit.
    private static let grainContrast: Float = 0.7

    /// Every colour here came from CSS, so it is sRGB and must be named as such. Core Graphics
    /// otherwise reaches for Generic RGB, whose gamma is 1.8 — enough to read a midtone about 19
    /// units light once it is re-encoded for the screen.
    static let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB()

    /// One feTurbulence call: frequency per axis, octaves, seed, and the tile's rotation.
    struct Noise {
        let freqX: Float
        let freqY: Float
        let octaves: Int
        let seed: Int
        let rotate: Float
        let turbulence: Bool

        init(freqX: Float, freqY: Float, octaves: Int, seed: Int,
             rotate: Float = 0, turbulence: Bool = false) {
            self.freqX = freqX
            self.freqY = freqY
            self.octaves = octaves
            self.seed = seed
            self.rotate = rotate
            self.turbulence = turbulence
        }
    }

    /// feColorMatrix + feComponentTransfer: one noise channel read through a colour ramp.
    static func palette(_ side: Int, _ spec: Noise, _ ramp: [UInt32]) -> CGImage? {
        let values = field(side, side, spec)
        return image(side) { pixels in
            for i in 0..<values.count {
                pixels[i] = 0xFF00_0000 | colour(ramp, values[i])
            }
        }
    }

    /// A flat colour whose alpha comes off the noise — the catalog's cloud, speck and grain layers.
    static func wash(_ side: Int, _ spec: Noise, _ rgb: UInt32, _ alphas: [Float]) -> CGImage? {
        let values = field(side, side, spec)
        return image(side) { pixels in
            for i in 0..<values.count {
                let alpha = UInt32((table(alphas, values[i]) * 255).rounded())
                // Core Graphics wants its alpha premultiplied, unlike Android's Bitmap
                let red = ((rgb >> 16) & 0xFF) * alpha / 255
                let green = ((rgb >> 8) & 0xFF) * alpha / 255
                let blue = (rgb & 0xFF) * alpha / 255
                pixels[i] = (alpha << 24) | (red << 16) | (green << 8) | blue
            }
        }
    }

    /// 0xAARRGGBB per pixel, which is what byteOrder32Little + premultipliedFirst spells on a
    /// little-endian machine — the same word layout the Android port writes.
    private static func image(_ side: Int, _ fill: (UnsafeMutablePointer<UInt32>) -> Void) -> CGImage? {
        let info = CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
        guard let context = CGContext(
            data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: side * 4,
            space: colorSpace, bitmapInfo: info
        ), let data = context.data else { return nil }

        fill(data.bindMemory(to: UInt32.self, capacity: side * side))
        return context.makeImage()
    }

    private static func field(_ width: Int, _ height: Int, _ spec: Noise) -> [Float] {
        let cyclesX = spec.freqX * tile
        let cyclesY = spec.freqY * tile
        let octaves = octaveCount(spec.octaves, max(cyclesX, cyclesY), max(width, height))
        let radians = spec.rotate * .pi / 180
        let cosine = cos(radians)
        let sine = sin(radians)
        let stretch = max(cyclesX, cyclesY) >= Float(max(width, height)) / 2 ? grainContrast : contrast
        // Streaked finishes must keep their direction, so only isotropic noise gets turned
        let turn = spec.freqX == spec.freqY
        var turnCos = [Float](repeating: 1, count: octaves)
        var turnSin = [Float](repeating: 0, count: octaves)
        for octave in 0..<octaves {
            let angle = (turn ? octaveTurn * Float(octave) : 0) * .pi / 180
            turnCos[octave] = cos(angle)
            turnSin[octave] = sin(angle)
        }

        var out = [Float](repeating: 0, count: width * height)
        var mean: Float = 0
        for y in 0..<height {
            let v = Float(y) / Float(height)
            for x in 0..<width {
                let u = Float(x) / Float(width)
                let sx = spec.rotate == 0 ? u : u * cosine - v * sine
                let sy = spec.rotate == 0 ? v : u * sine + v * cosine
                var sum: Float = 0
                var total: Float = 0
                var amplitude: Float = 1
                var step: Float = 1
                for octave in 0..<octaves {
                    let ox = (sx * turnCos[octave] - sy * turnSin[octave]) * cyclesX * step
                    let oy = (sx * turnSin[octave] + sy * turnCos[octave]) * cyclesY * step
                    let n = noise(ox, oy, spec.seed + octave * 101)
                    sum += amplitude * (spec.turbulence ? abs(2 * n - 1) : n)
                    total += amplitude
                    amplitude *= 0.5
                    step *= 2
                }
                let value = sum / total
                out[y * width + x] = value
                mean += value
            }
        }

        // Stretch about the field's own mean, not about 0.5: folding for turbulence pulls the mean
        // well below centre, and stretching about centre would then drag the whole material dark
        mean /= Float(out.count)
        for i in 0..<out.count {
            out[i] = clamp(mean + (out[i] - mean) * stretch)
        }
        return out
    }

    /// Octaves whose cycles fall below two pixels add nothing a widget can show.
    private static func octaveCount(_ wanted: Int, _ cycles: Float, _ side: Int) -> Int {
        var limit = 1
        while limit < wanted && cycles * Float(1 << limit) < Float(side) / 2 { limit += 1 }
        return limit
    }

    private static func noise(_ x: Float, _ y: Float, _ seed: Int) -> Float {
        let x0 = Int32(x.rounded(.down))
        let y0 = Int32(y.rounded(.down))
        let fx = smooth(x - x.rounded(.down))
        let fy = smooth(y - y.rounded(.down))
        let seed32 = Int32(truncatingIfNeeded: seed)
        let top = lerp(hash(x0, y0, seed32), hash(x0 + 1, y0, seed32), fx)
        let bottom = lerp(hash(x0, y0 + 1, seed32), hash(x0 + 1, y0 + 1, seed32), fx)
        return lerp(top, bottom, fy)
    }

    /// Unsigned throughout: Java's int wraps on overflow and its >>> is a logical shift, so this
    /// is the same arithmetic the Android widget does, and it lands on the same bits.
    private static func hash(_ x: Int32, _ y: Int32, _ seed: Int32) -> Float {
        var h = UInt32(bitPattern: x) &* 374_761_393
        h = h &+ UInt32(bitPattern: y) &* 668_265_263
        h = h &+ UInt32(bitPattern: seed) &* 1_274_126_177
        h = (h ^ (h >> 13)) &* 1_274_126_177
        return Float((h ^ (h >> 16)) & 0xFF_FFFF) / Float(0xFF_FFFF)
    }

    private static func smooth(_ t: Float) -> Float {
        t * t * (3 - 2 * t)
    }

    private static func lerp(_ a: Float, _ b: Float, _ t: Float) -> Float {
        a + (b - a) * t
    }

    private static func clamp(_ v: Float) -> Float {
        v < 0 ? 0 : (v > 1 ? 1 : v)
    }

    /// feComponentTransfer type='table': the value indexes a piecewise-linear list of stops.
    private static func table(_ values: [Float], _ v: Float) -> Float {
        let position = clamp(v) * Float(values.count - 1)
        let index = min(Int(position), values.count - 2)
        return lerp(values[index], values[index + 1], position - Float(index))
    }

    private static func colour(_ colours: [UInt32], _ v: Float) -> UInt32 {
        let position = clamp(v) * Float(colours.count - 1)
        let index = min(Int(position), colours.count - 2)
        let t = position - Float(index)
        let from = colours[index]
        let to = colours[index + 1]
        let red = UInt32(lerp(Float((from >> 16) & 0xFF), Float((to >> 16) & 0xFF), t).rounded())
        let green = UInt32(lerp(Float((from >> 8) & 0xFF), Float((to >> 8) & 0xFF), t).rounded())
        let blue = UInt32(lerp(Float(from & 0xFF), Float(to & 0xFF), t).rounded())
        return (red << 16) | (green << 8) | blue
    }
}
