server "vps3.seanmcgary.com", :app, :web, :db, :primary => true
set :deploy_to, "/home/seanmcgary/www/dev.feedstasher"
after "deploy", "devTasks:deps", "devTasks:stop", "devTasks:start"