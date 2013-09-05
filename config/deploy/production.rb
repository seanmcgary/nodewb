server "HOSTNAME", :app, :web, :db, :primary => true
set :deploy_to, "PATH"
after "deploy:setup", "productionTasks:globalDeps"
after 'deploy', "productionTasks:deps", "productionTasks:minify","productionTasks:stop", "productionTasks:start"