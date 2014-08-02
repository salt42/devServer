var http = require('./httpServer.js');


var serv = http('C:/Users/bla/AppData/Roaming/Brackets/extensions/user/devServer/testRoot', 8085, 'testname');


serv.bind('serverLog', function(msg){
    console.log(msg);
});
serv.start();
//serv.addVhost('testserver', 'C:/Users/bla/AppData/Roaming/Brackets/extensions/user/devServer/testRoot2');

setTimeout(function(){

    serv.addVhost('testserver', 'C:/Users/bla/AppData/Roaming/Brackets/extensions/user/devServer/testRoot2');
console.log(serv.vhostController.vhosts);
    //serv.stop();
},1000);
