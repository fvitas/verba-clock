// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "VerbaFaceKit",
    // macOS is never shipped — it only pins availability so a bare `swift build` type-checks
    platforms: [.iOS(.v17), .watchOS(.v10), .macOS(.v14)],
    products: [.library(name: "VerbaFaceKit", targets: ["VerbaFaceKit"])],
    targets: [
        .target(name: "VerbaFaceKit", resources: [.process("Resources")])
    ]
)
