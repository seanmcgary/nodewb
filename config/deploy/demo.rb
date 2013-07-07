server "vps2.seanmcgary.com", :app, :web, :db, :primary => true
set :deploy_to, "/home/seanmcgary/www/demo.scribbbl.es"
after "deploy", "demoTasks:deps", "demoTasks:stop", "demoTasks:start"