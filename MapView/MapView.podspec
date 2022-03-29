# folly_version must match the version used in React Native
# See folly_version in react-native/React/FBReactNativeSpec/FBReactNativeSpec.podspec
folly_version = '2021.06.28.00-v2'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
boost_compiler_flags = '-Wno-documentation'

Pod::Spec.new do |s|

  s.name            = "MapView"
  s.version         = "0.0.1"
  s.summary         = "Map View Component"
  s.description     = "Map View Component"
  s.homepage        = "https://github.com/facebook/react-native.git"
  s.license         = "MIT"
  s.platforms       = { :ios => "11.0" }
  s.author          = "Meta, inc."
  s.source          = { :git => "https://github.com/facebook/react-native.git", :tag => "#{s.version}" }
  s.compiler_flags  = folly_compiler_flags + ' ' + boost_compiler_flags + ' -Wno-nullability-completeness'

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/RCT-Folly\"",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
  }

  s.requires_arc = true

  s.dependency "React"
  s.dependency "React-RCTFabric"
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly", folly_version
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"

  s.source_files    = "ios/**/*.{h,m,mm,cpp,swift}"
end
