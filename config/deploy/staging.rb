server "HOSTNAME", :app, :web, :db, :primary => true
set :deploy_to, "PATH"
after "deploy:setup", "stagingTasks:globalDeps"
after "deploy", "stagingTasks:deps", "stagingTasks:minify", "stagingTasks:stop", "stagingTasks:start"