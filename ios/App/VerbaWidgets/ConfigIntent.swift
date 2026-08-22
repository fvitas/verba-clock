import AppIntents
import VerbaFaceKit
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
    case en, e2, de, d2, d3, d4, ch, fr, it, es, ca, nl, dk, no, se, fi, ic, cz, sk, ro, pe, tr, ru, ua, gr, sr, mk, cn, bg, hu, pl, ja, kr, id, he, ar

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Language")
    static let caseDisplayRepresentations: [WidgetLanguage: DisplayRepresentation] = [
        .sameAsApp: "Same as app",
        .en: "English", .e2: "English (E2)", .de: "German", .d2: "German (D2)",
        .d3: "Swabian (D3)", .d4: "German East (D4)", .ch: "Swiss German",
        .fr: "French", .it: "Italian", .es: "Spanish", .ca: "Catalan", .nl: "Dutch",
        .dk: "Danish", .no: "Norwegian", .se: "Swedish", .fi: "Finnish",
        .ic: "Icelandic",
        .cz: "Czech", .sk: "Slovak", .ro: "Romanian",
        .pe: "Portuguese", .tr: "Turkish", .ru: "Russian", .ua: "Ukrainian",
        .gr: "Greek", .sr: "Serbian", .mk: "Macedonian",
        .cn: "Chinese", .bg: "Bulgarian", .hu: "Hungarian", .pl: "Polish",
        .ja: "Japanese", .kr: "Korean", .id: "Indonesian", .he: "Hebrew", .ar: "Arabic",
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
    case waves
    case gold
    case silverGold = "silver-gold"
    case platinum
    case moonGold = "moon-gold"
    case metamorphite
    case desert

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Finish")
    static let caseDisplayRepresentations: [WidgetFinish: DisplayRepresentation] = [
        .sameAsApp: "Same as app",
        .deepBlack: "Deep Black", .stainlessSteel: "Stainless Steel", .blackPepper: "Black Pepper",
        .greyPepper: "Grey Pepper", .whitePepper: "White Pepper", .redPepper: "Red Pepper",
        .hazelnut: "Hazelnut", .rust: "Rust", .vintageCopper: "Vintage Copper", .waves: "Waves",
        .gold: "Gold", .silverGold: "Silver & Gold", .platinum: "Platinum", .moonGold: "Moon Gold",
        .metamorphite: "Metamorphite", .desert: "Desert",
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
