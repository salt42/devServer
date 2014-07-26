(function () {
    "use strict";

    var os = require("os"),
        express = require('express'),
        httpRoot = '',
        serv = null;


    //command handler
    function changeRoot(path) {

    }
    function newServer(path) {
        //check path / check project type

        serv = new serverController(path, 8080);
        serv.start();
        return serv;
    }
    /**
     * Initializes the server domain with the commands.
     * @param {DomainManager} domainManager The DomainManager for the server
     */
    function init(domainManager) {
        if (!domainManager.hasDomain("devServer")) {
            domainManager.registerDomain("devServer", {major: 0, minor: 1});
        }

        //register changeRoot command
        domainManager.registerCommand(
            "devServer",       // domain name
            "newServer",    // command name
            newServer,   // command handler function
            false          // this command is synchronous in Node
        );

        //full command example
        /*domainManager.registerCommand(
            "devServer",       // domain name
            "getMemory",    // command name
            cmdGetMemory,   // command handler function
            false,          // this command is synchronous in Node
            "Returns the total or free memory on the user's system in bytes",
            [{name: "total", // parameters
                type: "string",
                description: "True to return total memory, false to return free memory"}],
            [{name: "memory", // return values
                type: "number",
                description: "amount of memory in bytes"}]

        );*/



    }
    function dispatchVhost(req, res) {
        return false;
    }


    function serverController(rootPath, port) {
        var self = this;
        this.rootPath = rootPath;
        this.port = port;
        this._server = null;
        this._app = express();

        this._app.get('', function(req, res){
            res.sendfile('index.html', {root : rootPath});
        });
        this._app.get('/*', function(req, res){
            var path = req.params[0];
            if(path.substr(0,1) != '/' && path.substr(0,1) != '\\'){
                path = '/'+path;
            }

            if(fs.existsSync(rootPath+path)){
                console.log(rootPath+path)
                if(fs.lstatSync(rootPath+path).isDirectory()){
                    //iterate over array with possible index filenames
                    path += 'index.html'
                }
                res.sendfile(path, {root : rootPath});
            } else {
                if(!dispatchVhost(req, res)){
                    //404 error
                    ERROR('404 :'+rootPath+path)
                }
            }
        });
        this.init();
    }

    serverController.prototype.init = function() {
        //check vhost.js etc
    };
    serverController.prototype.start = function() {
        //start server
        this._server = this._app.listen(this.port);

    };
    serverController.prototype.stop = function() {
        //stop server

    };
    serverController.prototype.reload = function(cb) {
        this.stop();
        this.init();
        this.start(cb);
    };








    newServer('c:/');
















    exports.init = init;

}());
