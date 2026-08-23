# Adds PrivacyInfo.xcprivacy to every bundle in the project. Apple evaluates the
# app and each extension separately, so all four targets copy the same file.
# Idempotent: safe to re-run.
require 'xcodeproj'

PROJECT = File.expand_path('../ios/App/App.xcodeproj', __dir__)
MANIFEST = 'PrivacyInfo.xcprivacy'

project = Xcodeproj::Project.open(PROJECT)
app_group = project.main_group['App']

reference = app_group.files.find { |f| f.path == MANIFEST } || app_group.new_reference(MANIFEST)

project.targets.each do |target|
  phase = target.resources_build_phase
  next if phase.files_references.include?(reference)
  phase.add_file_reference(reference)
  puts "added #{MANIFEST} to #{target.name}"
end

project.save
