Pod::Spec.new do |s|
  s.name            = "CalendarModule"
  s.version         = "0.0.1"
  s.summary         = "Calendar Module"
  s.description     = "Calendar Module"
  s.homepage        = "https://github.com/facebook/react-native.git"
  s.license         = "MIT"
  s.platforms       = { :ios => "11.0" }
  s.author          = "Riccardo Cipolleschi"
  s.source          = { :git => "https://github.com/facebook/react-native.git", :tag => "#{s.version}" }

  s.source_files    = "./**/*.{h,m,mm,swift}"
end
