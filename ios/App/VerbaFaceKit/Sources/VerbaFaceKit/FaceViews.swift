import CoreText
import SwiftUI

// Registered here rather than through UIAppFonts, which cannot point into a package bundle.
// A top-level let runs lazily exactly once — before any use, since every use reads this name.
public let verbaFont: String = {
    if let url = Bundle.module.url(forResource: "DINish-Medium", withExtension: "ttf") {
        CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
    }
    return "DINish-Medium"
}()

// The letter matrix, scaled to fit — the widget-sized sibling of ClockFace.tsx
public struct MatrixFaceView: View {
    let moment: FaceMoment
    let finish: Finish
    // Always-On Display kills the bloom; everything else keeps it
    let glow: Bool

    public init(moment: FaceMoment, finish: Finish, glow: Bool = true) {
        self.moment = moment
        self.finish = finish
        self.glow = glow
    }

    public var body: some View {
        GeometryReader { geo in
            let cols = 11
            let rows = moment.language.rows.count
            let cell = min(geo.size.width / CGFloat(cols), geo.size.height / CGFloat(rows))
            let gridWidth = cell * CGFloat(cols)
            let gridHeight = cell * CGFloat(rows)

            VStack(spacing: 0) {
                ForEach(0..<rows, id: \.self) { row in
                    HStack(spacing: 0) {
                        ForEach(0..<cols, id: \.self) { col in
                            let lit = moment.litCells.contains(row * 11 + col)
                            Text(moment.language.cellText(row: row, col: col))
                                .font(.custom(verbaFont, size: cell * 0.62))
                                .foregroundStyle(lit ? finish.litColor : finish.stencilColor)
                                .shadow(
                                    color: glow && lit && finish.letter == .light ? .white.opacity(0.55) : .clear,
                                    radius: cell * 0.28
                                )
                                .frame(width: cell, height: cell)
                                .minimumScaleFactor(0.5)
                        }
                    }
                }
            }
            .frame(width: gridWidth, height: gridHeight)
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

// Word-grid faces (Arabic): rows hold whole words, spread edge to edge. Proportions mirror
// the web face — 82cqmin wide, 74.5cqmin tall, 4.2cqmin type — so the layout the photos were
// verified against carries over. No tracking: letter-spacing breaks cursive joining.
public struct WordGridFaceView: View {
    let moment: FaceMoment
    let finish: Finish
    let glow: Bool

    public init(moment: FaceMoment, finish: Finish, glow: Bool = true) {
        self.moment = moment
        self.finish = finish
        self.glow = glow
    }

    private static let heightRatio: CGFloat = 74.5 / 82
    private static let fontRatio: CGFloat = 4.2 / 82

    public var body: some View {
        GeometryReader { geo in
            let width = min(geo.size.width, geo.size.height / Self.heightRatio)
            let size = width * Self.fontRatio

            VStack(spacing: 0) {
                ForEach(0..<moment.language.rows.count, id: \.self) { row in
                    if row > 0 { Spacer(minLength: 0) }
                    slotRow(row: row, size: size)
                }
            }
            .frame(width: width, height: width * Self.heightRatio)
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }

    private func slotRow(row: Int, size: CGFloat) -> some View {
        HStack(spacing: 0) {
            ForEach(Array(moment.language.slots(row: row).enumerated()), id: \.offset) { slot, text in
                if slot > 0 { Spacer(minLength: 0) }
                let lit = moment.litCells.contains(row * 11 + slot)
                Text(text)
                    .font(.custom(verbaFont, size: size))
                    .foregroundStyle(lit ? finish.litColor : finish.stencilColor)
                    .shadow(
                        color: glow && lit && finish.letter == .light ? .white.opacity(0.55) : .clear,
                        radius: size * 0.45
                    )
                    .lineLimit(1)
                    // The Arabic system fallback face is wider than DINish; let a long row
                    // give a little rather than truncate a word
                    .minimumScaleFactor(0.7)
            }
        }
    }
}

// Words style: the sentence stacked as large type, "it is" words dimmed
public struct WordsFaceView: View {
    let moment: FaceMoment
    let finish: Finish

    public init(moment: FaceMoment, finish: Finish) {
        self.moment = moment
        self.finish = finish
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            ForEach(Array(moment.sentence.enumerated()), id: \.offset) { index, word in
                Text(word)
                    .font(.custom(verbaFont, size: 60))
                    .foregroundStyle(
                        index < moment.itIsWordCount
                            ? finish.litColor.opacity(finish.stencilOpacity * 2)
                            : finish.litColor
                    )
                    .minimumScaleFactor(0.1)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding()
    }
}

public struct AccessoryRectangularView: View {
    let moment: FaceMoment

    public init(moment: FaceMoment) {
        self.moment = moment
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                Text(line)
                    .font(.system(.headline, design: .rounded).weight(.semibold))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // Greedy wrap of the sentence into at most three lines
    private var lines: [String] {
        var result: [String] = []
        var current = ""
        for word in moment.sentence {
            if current.isEmpty {
                current = word
            } else if current.count + word.count + 1 <= 11 {
                current += " " + word
            } else {
                result.append(current)
                current = word
            }
        }
        if !current.isEmpty { result.append(current) }
        return Array(result.prefix(3))
    }
}

public struct AccessoryInlineView: View {
    let moment: FaceMoment

    public init(moment: FaceMoment) {
        self.moment = moment
    }

    public var body: some View {
        Text(moment.sentence.joined(separator: " "))
    }
}

public struct AccessoryCircularView: View {
    let moment: FaceMoment

    public init(moment: FaceMoment) {
        self.moment = moment
    }

    public var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(moment.sentence.suffix(3).enumerated()), id: \.offset) { _, word in
                Text(word)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .minimumScaleFactor(0.4)
                    .lineLimit(1)
            }
        }
        .padding(2)
    }
}
