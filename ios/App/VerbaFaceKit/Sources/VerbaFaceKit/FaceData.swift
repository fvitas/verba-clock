import Foundation

// Decodes FaceData.json — precomputed by scripts/export-face-data.ts. The TS
// engine is the single source of truth; Swift only looks states up.
public struct FaceData: Decodable {
    public let version: Int
    public let languages: [FaceLanguage]

    public static let shared: FaceData = {
        let url = Bundle.module.url(forResource: "FaceData", withExtension: "json")!
        return try! JSONDecoder().decode(FaceData.self, from: Data(contentsOf: url))
    }()

    public func language(_ id: String) -> FaceLanguage {
        languages.first { $0.id == id } ?? languages[0]
    }
}

public struct FaceLanguage: Decodable {
    public let id: String
    public let name: String
    public let rows: [String]
    // "rtl" for faces whose column 0 is the rightmost cell (Hebrew, Arabic)
    public let dir: String?
    // "word" for faces whose rows are space-separated whole words and whose coords index
    // word slots instead of letter columns (Arabic — cursive script has no letter cells)
    public let layout: String?
    public let cellOverrides: [String: String]?
    public let words: [FaceWord]
    public let states: [FaceState]

    public var isWordGrid: Bool { layout == "word" }

    public func state(hour: Int, minute: Int) -> FaceState {
        states[hour * 12 + minute / 5]
    }

    // The whole words of a word-grid row, in reading order
    public func slots(row: Int) -> [String] {
        rows[row].split(separator: " ").map(String.init)
    }

    // Per-cell display text honoring apostrophe overrides (e.g. Italian L')
    public func cellText(row: Int, col: Int) -> String {
        if isWordGrid {
            let words = slots(row: row)
            return col < words.count ? words[col] : ""
        }
        if let override = cellOverrides?["\(row):\(col)"] { return override }
        let chars = Array(rows[row])
        return col < chars.count ? String(chars[col]) : ""
    }

    public func wordText(_ word: FaceWord) -> String {
        (word.s...word.e).map { cellText(row: word.r, col: $0) }.joined()
    }
}

public struct FaceWord: Decodable {
    public let t: String
    public let r: Int
    public let s: Int
    public let e: Int
}

public struct FaceState: Decodable {
    public let i: [Int]
    public let p: [Int]
}

// A resolved moment on a face: which cells are lit and the sentence words.
public struct FaceMoment {
    public let language: FaceLanguage
    public let litCells: Set<Int>
    public let sentence: [String]
    public let itIsWordCount: Int

    // Cells keyed as row * 11 + col to keep Set members hashable and compact
    public init(language: FaceLanguage, hour: Int, minute: Int, showItIs: Bool) {
        self.language = language
        let state = language.state(hour: hour, minute: minute)
        let itIs = showItIs ? state.i : []
        var cells = Set<Int>()
        var words: [String] = []
        for index in itIs + state.p {
            let word = language.words[index]
            for col in word.s...word.e { cells.insert(word.r * 11 + col) }
            words.append(language.wordText(word))
        }
        self.litCells = cells
        self.sentence = words
        self.itIsWordCount = itIs.count
    }
}
