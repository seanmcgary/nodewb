require 'capistrano'
require 'capistrano/cli'
require 'capistrano/ext/multistage'

set :application, ""

set :scm, :git
set :repository, "git@github.com"
set :scm_passphrase, ""
set :keep_releases, 5
set :force, false
set :scm_verbose, true
default_run_options[:pty] = true

default_run_options[:shell] = '/usr/bin/zsh'

set :branch, fetch(:branch, "develop")

set :use_sudo, false
set :user, ""

set :stages, ["staging", "production"]

set :node_path, "/usr/bin/node"

ssh_options[:forward_agent] = true

production_path = ""

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
	end

	task :start, :roles => [:app] do
		desc "======= Starting splash site ======="
		run "forever start #{production_path}/current/server/server.js --env=production"
	end

	task :minify, :roles => [:app] do
		desc "======= Minify shit ======="
		run "node #{production_path}/current/tools/minify.js"
	end
end

