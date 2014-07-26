(function(){
    var express = require('express');

    function httpServer(id, name, path, port){
        this.name = name;
        this.id = id;
        this.path = path;
        this.port = port;
        this.running = false;

        var self = this;
        var app = express();
        app.get('', function(req, res){
            self.log(req.ip +' requested: "'+ req.url +'"');
            res.sendfile('index.html', {root : path});
        });
        this.app = app;

    }
    httpServer.prototype.load = function(){
        //check path
        //check type
        //return
    };
    httpServer.prototype.log = function(msg) {};//abstract
    httpServer.prototype.start = function(){
        this.running = true;
        var self = this;
        var server = this.app.listen(this.port, function() {
            self.running = true;
            self.log('Listening on port ' + server.address().port);
        });
        this.server = server;
    };
    httpServer.prototype.stop = function(){
        this.running = false;
        if(this.server){
            this.server.stop();
        }
    };
    httpServer.prototype.reload = function(){
        this.stop();
        this.load();
        this.start();
    };
    module.exports = httpServer;
})();
