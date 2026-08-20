import Foundation

// Decodes FaceData.json — precomputed by scripts/export-face-data.ts. The TS
// engine is the single source of truth; Swift only looks states up.
struct FaceData: Decodable {
    let version: Int
    let languages: [FaceLanguage]

    static let shared: FaceData = {
        let url = Bundle.main.url(forResource: "FaceData", withExtension: "json")!
        return try! JSONDecoder().decode(FaceData.self, from: Data(contentsOf: url))
    }()

    func language(_ id: String) -> FaceLanguage {
        languages.first { $0.id == id } ?? languages[0]
    }
}

struct FaceLanguage: Decodable {
    let id: String
    let name: String
    let rows: [String]
    // "rtl" for faces whose column 0 is the rightmost cell (Hebrew)
    let dir: String?
    let cellOverrides: [String: String]?
    let words: [FaceWord]
    let states: [FaceState]

    func state(hour: Int, minute: Int) -> FaceState {
        states[hour * 12 + minute / 5]
    }

    // Per-cell display text honoring apostrophe overrides (e.g. Italian L')
    func cellText(row: Int, col: Int) -> String {
        if let override = cellOverrides?["\(row):\(col)"] { return override }
        let chars = Array(rows[row])
        return col < chars.count ? String(chars[col]) : ""
    }

    func wordText(_ word: FaceWord) -> String {
        (word.s...word.e).map { cellText(row: word.r, col: $0) }.joined()
    }
}

struct FaceWord: Decodable {
    let t: String
    let r: Int
    let s: Int
    let e: Int
}

struct FaceState: Decodable {
    let i: [Int]
    let p: [Int]
}

// A resolved moment on a face: which cells are lit and the sentence words.
struct FaceMoment {
    let language: FaceLanguage
    let litCells: Set<Int>
    let sentence: [String]
    let itIsWordCount: Int

    // Cells keyed as row * 11 + col to keep Set members hashable and compact
    init(language: FaceLanguage, hour: Int, minute: Int, showItIs: Bool) {
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
