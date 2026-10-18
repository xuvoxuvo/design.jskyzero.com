require 'jekyll'

config = Jekyll.configuration('source' => File.expand_path('..', __dir__))
raise 'Hits must be disabled by default' unless config.dig('hits', 'enabled') == false
template = File.read(File.join(config['source'], '_theme/_includes/footer.html'))
[false, true].each do |enabled|
  site = Jekyll::Site.new(config.merge('hits' => { 'enabled' => enabled }))
  output = Liquid::Template.parse(template).render!(
    { 'site' => site.site_payload['site'] }, registers: { site: site }
  )
  raise 'Badge toggle mismatch' unless output.include?('id="hits-badge"') == enabled
  raise 'Script toggle mismatch' unless output.include?('/assets/js/hits.js') == enabled
end
puts 'PASS: default disabled; footer badge and script rendered only when enabled'
