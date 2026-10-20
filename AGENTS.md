# AGENTS.md

> 本项目（design.jskyzero.com）的开发约定。**以 Windows 本地开发环境为默认前提**；
> CI（GitHub Actions）跑在 ubuntu-latest 上，差异见最后一节。

## Windows 本地环境

- Ruby **3.3.12**（RubyInstaller，`x64-mingw-ucrt`），安装在 `C:\App\Ruby`，`C:\App\Ruby\bin` 已在用户 PATH。
- Bundler **4.0.11**（与 `Gemfile.lock` 的 `BUNDLED WITH` 一致）。Ruby 自带的默认 bundler 是 2.5.22，**不要用它改 lockfile**（见下）。
- MSYS2 工具链在 `C:\App\Ruby\msys64`（gcc 15.2 ucrt64 + make），只有编译原生扩展时才需要。
- 访问 rubygems / GitHub 需要代理 `http://127.0.0.1:7890`。
- 不要引入其它 mingw 工具链并置于 `C:\App\Ruby\bin` 之前，避免 `libstdc++-6.dll` 之类的 DLL 混用。

## 依赖管理

- gem 统一装到工作区内的 `vendor/bundle`（由 `.bundle/config` 的 `BUNDLE_PATH` 指定，已被 gitignore）。
- **不要用 bundler 2.5.22 执行 `bundle update`**：它会把 `Gemfile.lock` 的 `PLATFORMS` 裁剪到只剩 Windows，导致 Linux CI 的 frozen install 失败。
  正确做法：`bundle _4.0.11_ lock --update <gems>`，并在提交前确认 lock 里仍保留多平台条目（至少 `x86_64-linux-gnu` 和 `x64-mingw-ucrt`）。
- 原生扩展分两类：
  - 有 Windows 预编译包：`nokogiri`、`sass-embedded`、`google-protobuf`、`ffi`——装包时直接下载二进制，不编译。
  - 无预编译包、**必须本地编译**：`json`、`racc`、`bigdecimal`、`eventmachine`、`http_parser.rb`。需要 `C:\App\Ruby\msys64`；若被删可用 `C:\App\Ruby\bin\ridk.cmd install 1 3` 恢复。
- `wdm` 已从依赖中移除：0.1.1 自 2015 年停更，在 Ruby 3.2+ 上编译失败。缺少它时 `listen` 自动退回轮询，`jekyll serve --watch` 功能不受影响，**不要加回来**。

## 常用命令（PowerShell，仓库根目录）

```powershell
bundle exec jekyll serve                                            # 本地预览
bundle exec jekyll build                                            # 普通构建
bundle exec jekyll build --config _config.yml,_config.production.yml  # 生产构建（与 CI 一致）
bundle exec ruby scripts/verify-plugins.rb                           # 插件回归检查
bundle exec ruby scripts/verify-hits-toggle.rb                       # 访问统计开关检查
npm ci; npm run images                                              # 响应式图片管线
```

日常只改文字/样式用 `jekyll serve` 即可；新增或替换 `assets/img` 下的图片后要重跑 `npm run images`。

## 目录约定

- 文章：`_posts/<分类>/YYYY-MM-DD-<slug>.md`，草稿放 `_drafts/`。
- 主题与插件：`_theme/`（`_includes`、`_layouts`、`_sass`、`_plugins`）。
- 生成物不入库：`_site/`、`.jekyll-cache/`、`vendor/`。
- `_config.production.yml` 的 `exclude` 数组必须与 `_config.yml` 保持同步——Jekyll 合并配置时**数组是替换而非追加**。

## CI（Linux，与本地不同）

- `.github/workflows/jekyll.yml`：`ruby/setup-ruby@v1`（Ruby 3.3.0，`bundler-cache`）→ 跑两个 verify 脚本 → 生产构建 → 部署。
- Linux 侧不需要 `msys64`，也不会安装 `wdm`；平台相关差异全部由 `Gemfile` 的 `platforms` 和 lockfile 的平台条目处理，本地改动不要破坏这些条目。
