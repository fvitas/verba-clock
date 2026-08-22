# One-shot: point the Xcode project at the VerbaFaceKit local package and drop the
# file references that moved into it. Run once from anywhere: ruby scripts/ios/adopt-facekit.rb
require 'xcodeproj'

project = Xcodeproj::Project.open(File.expand_path('../../ios/App/App.xcodeproj', __dir__))

pkg = project.new(Xcodeproj::Project::Object::XCLocalSwiftPackageReference)
pkg.relative_path = 'VerbaFaceKit'
project.root_object.package_references << pkg

widgets = project.targets.find { |t| t.name == 'VerbaWidgets' }
dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
dep.product_name = 'VerbaFaceKit'
widgets.package_product_dependencies << dep

moved = %w[FaceData.swift FaceViews.swift Finishes.swift Textures.swift
           SharedSettings.swift FaceData.json DINish-Medium.ttf DINish-LICENSE.txt]
stale = (widgets.source_build_phase.files + widgets.resources_build_phase.files)
        .select { |bf| bf.file_ref && moved.include?(File.basename(bf.file_ref.path.to_s)) }
stale.each { |bf| bf.file_ref.remove_from_project }

project.save
puts "ok — removed #{stale.length} stale refs"
