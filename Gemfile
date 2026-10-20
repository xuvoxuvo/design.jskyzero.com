source "https://rubygems.org"

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.
# Happy Jekylling!

gem 'jekyll', '~> 4.4', '>= 4.4.1'

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
end

# 🛠️ 修复弃用警告：将旧的 :mingw, :x64_mingw, :mswin 替换为新版推荐的 :windows
# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# 已移除 wdm：0.1.1 自 2015 年停更，在 Ruby 3.2+ 上无法编译。
# 缺少它时 listen 会自动退回轮询模式，`jekyll serve --watch` 功能不受影响。
gem "webrick", "~> 1.7"
gem "jekyll-mermaid", "~> 1.0"
gem 'jekyll-sass-converter', "~> 3.1"
gem 'jekyll-seo-tag'

# 用于在构建期对渲染后的 HTML 做可靠的 DOM 处理（标题编号/分节/TOC）
gem "nokogiri", "~> 1.16"