$:.push File.expand_path("../lib", __FILE__)
require "rendered-multi-select/version"

Gem::Specification.new do |s|
  s.name        = "rendered-multi-select"
  s.version     = RenderedMultiSelect::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["k1w1"]
  s.email       = ["k1w1@k1w1.org"]
  s.homepage    = "http://github.com/k1w1/rendered-multi-select"
  s.summary     = %q{todo}
  s.description = %q{todo}

  s.files         = Dir["vendor/assets/javascripts/*.js.coffee", "vendor/assets/stylesheets/*.css.less", "lib/*" "README.md", "MIT-LICENSE"]
  s.require_paths = ["lib"]

  s.add_dependency 'rails', '>= 8.0'
end
