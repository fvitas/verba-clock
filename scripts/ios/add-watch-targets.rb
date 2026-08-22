# One-shot: create the VerbaWatch app target and the VerbaWatchWidgets extension,
# embed them (widget in watch app, watch app in iOS app), and hook both to VerbaFaceKit.
# Run once from anywhere: ruby scripts/ios/add-watch-targets.rb
require 'xcodeproj'

project = Xcodeproj::Project.open(File.expand_path('../../ios/App/App.xcodeproj', __dir__))
app = project.targets.find { |t| t.name == 'App' }

def facekit(project)
  dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
  dep.product_name = 'VerbaFaceKit'
  dep
end

def common_settings(target, bundle_id, entitlements)
  target.build_configurations.each do |config|
    s = config.build_settings
    s['PRODUCT_BUNDLE_IDENTIFIER'] = bundle_id
    # This project's shared config doesn't default it, and an empty name collides at '.app'
    s['PRODUCT_NAME'] = '$(TARGET_NAME)'
    s['CODE_SIGN_STYLE'] = 'Automatic'
    s['DEVELOPMENT_TEAM'] = '7Z5VPU7R3V'
    s['CODE_SIGN_ENTITLEMENTS'] = entitlements
    s['CURRENT_PROJECT_VERSION'] = '1'
    s['MARKETING_VERSION'] = '1.0'
    s['TARGETED_DEVICE_FAMILY'] = '4'
    s['SWIFT_VERSION'] = '5.0'
    s['WATCHOS_DEPLOYMENT_TARGET'] = '10.0'
  end
end

# --- Watch app ---
watch = project.new_target(:application, 'VerbaWatch', :watchos, '10.0')
common_settings(watch, 'com.verba.clock.watchkitapp', 'VerbaWatch/VerbaWatch.entitlements')
watch.build_configurations.each do |config|
  s = config.build_settings
  s['GENERATE_INFOPLIST_FILE'] = 'YES'
  s['INFOPLIST_KEY_WKApplication'] = 'YES'
  s['INFOPLIST_KEY_WKCompanionAppBundleIdentifier'] = 'com.verba.clock'
  s['INFOPLIST_KEY_WKRunsIndependentlyOfCompanionApp'] = 'YES'
  s['INFOPLIST_KEY_CFBundleDisplayName'] = 'Verba Clock'
end
watch.package_product_dependencies << facekit(project)

group = project.main_group.new_group('VerbaWatch', 'VerbaWatch')
watch.add_file_references(
  %w[VerbaWatchApp.swift WatchFaceScreen.swift WatchSettingsView.swift].map { |f| group.new_file(f) }
)
group.new_file('VerbaWatch.entitlements')

app.add_dependency(watch)
embed = app.new_copy_files_build_phase('Embed Watch Content')
embed.dst_subfolder_spec = '16'
embed.dst_path = '$(CONTENTS_FOLDER_PATH)/Watch'
embed.add_file_reference(watch.product_reference)
     .settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

# --- Watch widget extension ---
ext = project.new_target(:app_extension, 'VerbaWatchWidgets', :watchos, '10.0')
common_settings(ext, 'com.verba.clock.watchkitapp.widgets',
                'VerbaWatchWidgets/VerbaWatchWidgets.entitlements')
ext.build_configurations.each do |config|
  config.build_settings['INFOPLIST_FILE'] = 'VerbaWatchWidgets/Info.plist'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'NO'
end
ext.package_product_dependencies << facekit(project)

ext_group = project.main_group.new_group('VerbaWatchWidgets', 'VerbaWatchWidgets')
ext.add_file_references([ext_group.new_file('WatchWidgets.swift')])
ext_group.new_file('Info.plist')
ext_group.new_file('VerbaWatchWidgets.entitlements')

# The intent and timeline are the iOS extension's files, membership in both targets
%w[ConfigIntent.swift Timeline.swift].each do |name|
  ref = project.files.find { |f| File.basename(f.path.to_s) == name && f.real_path.to_s.include?('VerbaWidgets') }
  raise "missing #{name}" unless ref
  ext.source_build_phase.add_file_reference(ref)
end

watch.add_dependency(ext)
plug = watch.new_copy_files_build_phase('Embed Foundation Extensions')
plug.symbol_dst_subfolder_spec = :plug_ins
plug.add_file_reference(ext.product_reference)
    .settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

project.save
puts 'ok'
