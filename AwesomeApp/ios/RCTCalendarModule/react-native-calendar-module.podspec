folly_version = '2021.06.28.00-v2'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
    s.name         = 'RCTCalendarModule'
    s.version      = '0.0.1'
    s.summary      = 'Sample module for migration'
    s.license      = 'MIT'
    s.authors      = 'Meta, Inc. and its affiliates'
    s.platforms    = { :ios => 9.0, :osx => 10.13 }
    s.compiler_flags  = folly_compiler_flags

    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\""
    }

    s.source       = { :git => "https://github.com/facebook/react-native.git",
        :tag => spec.version.to_s
    }
    s.source_files  = "**/*.{h,m,mm,swift}"

    s.dependency "React"
    s.dependency "React-RCTFabric" # This is for fabric component
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly", folly_version
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
end
