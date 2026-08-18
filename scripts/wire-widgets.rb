# Adds the VerbaWidgets extension target to the Capacitor Xcode project and
# raises the whole project to iOS 17. Idempotent: safe to re-run after
# `cap sync` style regeneration wipes are NOT a concern (pbxproj is committed),
# but re-running skips work that is already done.
require 'xcodeproj'

PROJECT = File.expand_path('../ios/App/App.xcodeproj', __dir__)
TEAM = '7Z5VPU7R3V'
project = Xcodeproj::Project.open(PROJECT)

app = project.targets.find { |t| t.name == 'App' }
abort 'App target not found' unless app

# --- iOS 17 floor everywhere ---
(project.build_configurations + project.targets.flat_map(&:build_configurations)).each do |config|
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
end

# --- App target: entitlements + new sources ---
app.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
end

app_group = project.main_group['App']
%w[WidgetBridgePlugin.swift MainViewController.swift].each do |name|
  next if app_group.files.any? { |f| f.path == name }
  file = app_group.new_reference(name)
  app.source_build_phase.add_file_reference(file)
end
unless app_group.files.any? { |f| f.path == 'App.entitlements' }
  app_group.new_reference('App.entitlements')
end

# --- Widget extension target ---
if project.targets.none? { |t| t.name == 'VerbaWidgets' }
  widgets = project.new_target(:app_extension, 'VerbaWidgets', :ios, '17.0')

  group = project.main_group.new_group('VerbaWidgets', 'VerbaWidgets')
  sources = %w[VerbaWidgets.swift Timeline.swift FaceViews.swift FaceData.swift
               Finishes.swift ConfigIntent.swift SharedSettings.swift]
  resources = %w[FaceData.json DINish-Medium.ttf DINish-LICENSE.txt]

  sources.each { |name| widgets.source_build_phase.add_file_reference(group.new_reference(name)) }
  resources.each { |name| widgets.resources_build_phase.add_file_reference(group.new_reference(name)) }
  group.new_reference('Info.plist')
  group.new_reference('VerbaWidgets.entitlements')

  widgets.build_configurations.each do |config|
    config.build_settings.merge!(
      'PRODUCT_BUNDLE_IDENTIFIER' => 'com.verba.clock.widgets',
      'PRODUCT_NAME' => 'VerbaWidgets',
      'INFOPLIST_FILE' => 'VerbaWidgets/Info.plist',
      'GENERATE_INFOPLIST_FILE' => 'YES',
      'INFOPLIST_KEY_CFBundleDisplayName' => 'Verba Clock',
      'CODE_SIGN_ENTITLEMENTS' => 'VerbaWidgets/VerbaWidgets.entitlements',
      'DEVELOPMENT_TEAM' => TEAM,
      'CODE_SIGN_STYLE' => 'Automatic',
      'SWIFT_VERSION' => '5.0',
      'TARGETED_DEVICE_FAMILY' => '1,2',
      'CURRENT_PROJECT_VERSION' => '1',
      'MARKETING_VERSION' => '1.0',
      'SKIP_INSTALL' => 'YES',
      'ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME' => '',
      'ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME' => ''
    )
  end

  app.add_dependency(widgets)
  embed = app.new_copy_files_build_phase('Embed Foundation Extensions')
  embed.symbol_dst_subfolder_spec = :plug_ins
  build_file = embed.add_file_reference(widgets.product_reference)
  build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
end

project.save
puts 'Wired VerbaWidgets target, iOS 17 floor set.'
