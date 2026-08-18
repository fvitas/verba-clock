import AppIntents
import WidgetKit

enum WidgetStyle: String, AppEnum {
    case matrix, words

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Style")
    static let caseDisplayRepresentations: [WidgetStyle: DisplayRepresentation] = [
        .matrix: "Matrix",
        .words: "Words",
    ]
}

enum WidgetLanguage: String, AppEnum {
    case sameAsApp
    case en, e2, de, d2, d3, d4, ch, fr, it, es, ca, nl, dk, no, se, cz, ro, pe, tr, ru, gr, sr

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Language")
    static let caseDisplayRepresentations: [WidgetLanguage: DisplayRepresentation] = [
        .sameAsApp: "Same as app",
        .en: "English", .e2: "English (variant)", .de: "Deutsch", .d2: "Deutsch (variant 2)",
        .d3: "Schwäbisch", .d4: "Deutsch (variant 4)", .ch: "Schwiizerdütsch",
        .fr: "Français", .it: "Italiano", .es: "Español", .ca: "Català", .nl: "Nederlands",
        .dk: "Dansk", .no: "Norsk", .se: "Svenska", .cz: "Čeština", .ro: "Română",
        .pe: "Português", .tr: "Türkçe", .ru: "Русский", .gr: "Ελληνικά", .sr: "Српски",
    ]

    func resolvedId(app: SharedSettings) -> String {
        self == .sameAsApp ? app.languageId : rawValue
    }
}

enum WidgetFinish: String, AppEnum {
    case sameAsApp
    case deepBlack = "deep-black"
    case stainlessSteel = "stainless-steel"
    case blackPepper = "black-pepper"
    case greyPepper = "grey-pepper"
    case whitePepper = "white-pepper"
    case redPepper = "red-pepper"
    case hazelnut
    case rust
    case vintageCopper = "vintage-copper"
    case gold
    case silverGold = "silver-gold"
    case platinum
    case moonGold = "moon-gold"
    case glintscape
    case metamorphite
    case desert

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Finish")
    static let caseDisplayRepresentations: [WidgetFinish: DisplayRepresentation] = [
        .sameAsApp: "Same as app",
        .deepBlack: "Deep Black", .stainlessSteel: "Stainless Steel", .blackPepper: "Black Pepper",
        .greyPepper: "Grey Pepper", .whitePepper: "White Pepper", .redPepper: "Red Pepper",
        .hazelnut: "Hazelnut", .rust: "Rust", .vintageCopper: "Vintage Copper", .gold: "Gold",
        .silverGold: "Silver & Gold", .platinum: "Platinum", .moonGold: "Moon Gold",
        .glintscape: "Glintscape", .metamorphite: "Metamorphite", .desert: "Desert",
    ]

    func resolvedId(app: SharedSettings) -> String {
        self == .sameAsApp ? app.finishId : rawValue
    }
}

enum WidgetItIs: String, AppEnum {
    case sameAsApp, on, off

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "\u{201C}It is\u{201D} words")
    static let caseDisplayRepresentations: [WidgetItIs: DisplayRepresentation] = [
        .sameAsApp: "Same as app", .on: "On", .off: "Off",
    ]

    func resolved(app: SharedSettings) -> Bool {
        self == .sameAsApp ? app.showItIs : self == .on
    }
}

struct VerbaConfigIntent: WidgetConfigurationIntent {
    static let title: LocalizedStringResource = "Verba Clock"
    static let description = IntentDescription("The time, written out in light.")

    @Parameter(title: "Style", default: .matrix)
    var style: WidgetStyle

    @Parameter(title: "Language", default: .sameAsApp)
    var language: WidgetLanguage

    @Parameter(title: "Finish", default: .sameAsApp)
    var finish: WidgetFinish

    @Parameter(title: "\u{201C}It is\u{201D} words", default: .sameAsApp)
    var itIs: WidgetItIs
}
