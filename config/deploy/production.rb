server "vps3.seanmcgary.com", :app, :web, :db, :primary => true
set :deploy_to, "/home/seanmcgary/www/production.feedstasher"
after "deploy:setup", "productionTasks:globalDeps"
after 'deploy', "productionTasks:deps", "productionTasks:minify", "productionTasks:linkFavicons", "productionTasks:stop", "productionTasks:start"