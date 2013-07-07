server "vps4.seanmcgary.com", :app, :web, :db, :primary => true
set :deploy_to, "/home/seanmcgary/www/staging.feedstasher"
after "deploy:setup", "stagingTasks:globalDeps"
after "deploy", "stagingTasks:deps", "stagingTasks:minify", "stagingTasks:stop", "stagingTasks:start"