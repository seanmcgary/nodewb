require 'capistrano'
require 'capistrano/cli'
require 'capistrano/ext/multistage'

set :application, "feedstasher"

set :scm, :git
set :repository, "git@github.com:seanmcgary/feedstasher.git"
set :scm_passphrase, ""
set :keep_releases, 5
set :force, false
set :scm_verbose, true
default_run_options[:pty] = true

default_run_options[:shell] = '/usr/bin/zsh'

set :branch, fetch(:branch, "develop")

set :use_sudo, false
set :user, "seanmcgary"

set :stages, ["staging", "production"]

set :node_path, "/usr/bin/node"

ssh_options[:forward_agent] = true

production_path = "/home/seanmcgary/www/production.feedstasher"
staging_path = "/home/seanmcgary/www/staging.feedstasher"
dev_path = "/home/seanmcgary/www/dev.feedstasher"

namespace :productionTasks do
	task :deps, :roles => [:app] do
		desc "== running npm on #{latest_release} =="
		run "cd #{production_path}/current && rm -rf node_modules && npm install"
	end

	task :globalDeps, :roles => [:app] do
		run "sudo npm install --global forever uglify-js"
	end

	task :stop, :roles => [:app] do
		desc "======= Stopping splash site ======="
		run "forever stop #{production_path}/current/server/server.js"
		run "forever stop #{production_path}/current/tools/collection_worker.js"
		run "forever stop #{production_path}/current/tools/db_watcher.js"
	end

	task :start, :roles => [:app] do
		desc "======= Starting splash site ======="
		run "forever start #{production_path}/current/server/server.js --env=production"
		run "forever start #{production_path}/current/tools/collection_worker.js production"
		run "forever start #{production_path}/current/tools/db_watcher.js production"
	end

	task :minify, :roles => [:app] do
		desc "======= Minify shit ======="
		run "node #{production_path}/current/tools/minify.js"
	end

	task :linkFavicons, :roles => [:app] do
		desc "======= Link Favicons ======="
		run "ln -s /home/seanmcgary/www/feedstash_favicons #{production_path}/current/client/images/favicons"
	end
end

namespace :stagingTasks do
	task :deps, :roles => [:app] do
		desc "== running npm on #{latest_release} =="
		run "cd #{staging_path}/current && rm -rf node_modules && npm install"
	end

	task :globalDeps, :roles => [:app] do
		run "sudo npm install --global forever uglify-js"
	end

	task :stop, :roles => [:app] do
		desc "======= Stopping splash site ======="
		run "forever stop #{staging_path}/current/server/server.js"
		run "forever stop #{staging_path}/current/tools/collection_worker.js"
		run "forever stop #{staging_path}/current/tools/collector.js"
		run "forever stop #{staging_path}/current/tools/db_watcher.js"
	end

	task :start, :roles => [:app] do
		desc "======= Starting splash site ======="
		run "forever start #{staging_path}/current/server/server.js --env=staging"
		#run "forever start #{staging_path}/current/tools/collection_worker.js production"
		#run "forever start #{staging_path}/current/tools/collector.js cron production"
		#run "forever start #{staging_path}/current/tools/db_watcher.js production"
	end

	task :minify, :roles => [:app] do
		desc "======= Minify shit ======="
		run "node #{staging_path}/current/tools/minify.js"
	end
end

namespace :demoTasks do
	task :deps, :roles => [:app] do
		desc "== running npm on #{latest_release} =="
		run "cd #{demo_path}/current && rm -rf node_modules && npm install"
	end

	task :globalDeps, :roles => [:app] do
		run "sudo npm install --global forever"
	end

	task :stop, :roles => [:app] do
		desc "======= Stopping splash site ======="
		run "forever stop #{demo_path}/current/server/server.js"
	end

	task :start, :roles => [:app] do
		desc "======= Starting splash site ======="
		run "forever start #{demo_path}/current/server/server.js --env=demo"
	end
end

namespace :devTasks do
	task :deps, :roles => [:app] do
		desc "== running npm on #{latest_release} =="
		run "cd #{dev_path}/current && rm -rf node_modules && npm install"
	end

	task :globalDeps, :roles => [:app] do
		run "sudo npm install --global forever"
	end

	task :stop, :roles => [:app] do
		desc "======= Stopping splash site ======="
		run "forever stop #{dev_path}/current/server/server.js"
	end

	task :start, :roles => [:app] do
		desc "======= Starting splash site ======="
		run "forever start #{dev_path}/current/server/server.js"
	end
end

