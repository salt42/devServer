(function () {
    "use strict";

    var os = require("os"),
        httpServer = require('./httpServer.js'),
        serverList = [],
        domainManager = null;



    function serverLog(msg) {
        domainManager.emitEvent("devServer", "serverLog", [this.id, msg]);
    }
    function newServer(name, path, port) {
        //port check
        var s = new httpServer(serverList.length, name, path, port);
        s.log = serverLog;
        serverList.push(s);
        return s;
    }
    function startServer(id) {
        if(serverList[id]){
            serverList[id].start();
            return JSON.stringify(serverList[id]);
        }else{
            return 'error: id not found!'
        }
    }
    function stopServer(id) {
        return serverList[id].stop();
    }
    function reloadServer(id) {
        return serverList[id].reload();
    }
    function getStatus() {
        return serverList;
    }

    function init(DomainManager) {
        if (!DomainManager.hasDomain("devServer")) {
            DomainManager.registerDomain("devServer", {major: 0, minor: 1});
        }
        domainManager = DomainManager;

        //
        domainManager.registerEvent(
            "devServer",
            "serverLog",
            [
                {name: "id", type: "number"},
                {name: "message", type: "string"}
            ]
        );
        //register changeRoot command
        domainManager.registerCommand(
            "devServer",
            "newServer",
            newServer,
            false,
            "creates new server instance and returns the id",
            [   {name: "path", // parameters
                    type: "string",
                    description: "root path of the http server"},
                {name: "port", // parameters
                    type: "number",
                    description: "server port number"}
            ],
            [{name: "serverId", // return values
                type: "number",
                description: "server id"}]
        );
        //register startServer command
        domainManager.registerCommand(
            "devServer",
            "getStatus",
            getStatus,
            false,
            "decription",
            null,
            [{name: "stats", // return values
                type: "string",
                description: "stats json string"}]
        );
        //register stopServer command
        domainManager.registerCommand(
            "devServer",
            "stopServer",
            stopServer,
            false,
            "decription",
            [{name: "id", // parameters
                type: "number",
                description: "True to return total memory, false to return free memory"}],
            [{name: "stats", // return values
                type: "string",
                description: "stats json string"}]
        );
        //register startServer command
        domainManager.registerCommand(
            "devServer",
            "startServer",
            startServer,
            false,
            "decription",
            [{name: "id", // parameters
                type: "number",
                description: "True to return total memory, false to return free memory"}],
            [{name: "stats", // return values
                type: "string",
                description: "stats json string"}]
        );
        //register reloadServer command
        domainManager.registerCommand(
            "devServer",
            "reloadServer",
            reloadServer,
            false,
            "decription",
            [{name: "id", // parameters
                type: "number",
                description: "True to return total memory, false to return free memory"}],
            [{name: "stats", // return values
                type: "string",
                description: "stats json string"}]
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



    exports.init = init;

}());
