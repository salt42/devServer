var http = require('./httpServer.js');
var serv = new http(1, 'myServer', 'C:/Users/bla/AppData/Roaming/Brackets/extensions/user/devServer/testRoot', 8070);
serv.log = function(msg){
    console.log(msg);
}
serv.start();
