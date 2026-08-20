import SwiftUI
import WidgetKit

let verbaFont = "DINish-Medium"

// The letter matrix, scaled to fit — the widget-sized sibling of ClockFace.tsx
struct MatrixFaceView: View {
    let moment: FaceMoment
    let finish: Finish

    var body: some View {
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
                                    color: lit && finish.letter == .light ? .white.opacity(0.55) : .clear,
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
struct WordGridFaceView: View {
    let moment: FaceMoment
    let finish: Finish

    private static let heightRatio: CGFloat = 74.5 / 82
    private static let fontRatio: CGFloat = 4.2 / 82

    var body: some View {
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
                        color: lit && finish.letter == .light ? .white.opacity(0.55) : .clear,
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
struct WordsFaceView: View {
    let moment: FaceMoment
    let finish: Finish

    var body: some View {
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

struct AccessoryRectangularView: View {
    let moment: FaceMoment

    var body: some View {
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

struct AccessoryInlineView: View {
    let moment: FaceMoment

    var body: some View {
        Text(moment.sentence.joined(separator: " "))
    }
}

struct AccessoryCircularView: View {
    let moment: FaceMoment

    var body: some View {
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
