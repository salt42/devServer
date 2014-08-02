(function(){
    var vhost = require('./vhosts.js');
    var express = require('express');

    function newServer(id, port) {
        //private scope


        _binds = {
            'serverLog': [],
        };
        _server = null;
        _app = null;

        _log = function(msg) {
            for(i=0;i<_binds['serverLog'].length;i++){
                _binds['serverLog'][i].call(this, msg);
            }
        }

        function httpServer() {
            this.id = id;
            this.port = port;
            this.running = false;
            this.vhostController = vhost();
            this.init();
        }
        httpServer.prototype.init = function() {
            _app = express();
            _app.use(this.vhostController.handle());
            //_app.use(express.static(path));
            _app.get('*', function(req, res){
                res.send('server host server interface');
            });
        };
        httpServer.prototype.addVhost = function(domain, path) {
            if(!this.vhostController.hasDomain(domain)){
                this.vhostController.add(domain, path);
                return true;
            }else{
                return false;
            }
        };

        httpServer.prototype.bind = function(type, fn) {
            if(_binds[type])
            _binds[type].push(fn);
        }
        httpServer.prototype.start = function(){
            console.log(this);
            this.running = true;
            var self = this;
            _server = _app.listen(this.port, function() {
                self.running = true;
                _log('Listening on port ' + self.port);
            });
        };
        httpServer.prototype.stop = function(){
            this.running = false;
            if(_server){
                _server.close();
            }
        };
        httpServer.prototype.reload = function(){
            this.stop();
            this.load();
            this.start();
        };
        return new httpServer();
    }
    module.exports = newServer;
})();






