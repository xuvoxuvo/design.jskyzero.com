# ============================================================
# Jekyll 插件：GitHub 仓库标识自动探测
#
# 构建时读取 git remote origin 的 URL，解析出 "owner/repo"，
# 注入 site.github_repo，供页脚等处的徽章动态引用，
# 避免在源码中写死仓库地址（fork / 迁移后自动跟随当前仓库）。
#
# 用法（在 Liquid 模板中）：
#   {% if site.github_repo %}
#     <img src="https://img.shields.io/github/last-commit/{{ site.github_repo }}">
#   {% endif %}
# ============================================================

require 'open3'

module Jekyll
  module GitHubRepo
    class Generator < Jekyll::Generator
      safe true
      priority :low

      def generate(site)
        site.config['github_repo'] = detect(site.source)
      end

      private

      # 读取 remote origin URL（https 或 ssh 均可）
      def origin_url(source)
        Dir.chdir(source) do
          out, _err, status = Open3.capture3("git", "config", "--get", "remote.origin.url")
          return nil unless status.success?
          out.to_s.strip
        end
      rescue StandardError
        nil
      end

      # 解析为 "owner/repo"，例如 "xuvoxuvo/design.jskyzero.com"
      def parse_nwo(url)
        return nil if url.nil? || url.empty?
        cleaned = url.strip.sub(%r{\.git/?\z}i, '')
        m = cleaned.match(%r{github\.com[:/]([^/]+)/([^/]+)/?\z}i)
        m ? "#{m[1]}/#{m[2]}" : nil
      end

      def detect(source)
        parse_nwo(origin_url(source))
      end
    end
  end
end
