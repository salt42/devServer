(function () {
    "use strict";

    var os = require("os"),
        httpServer = require('./httpServer.js'),
        serverList = {},
        domainManager = null;



    function serverLog(msg) {
        domainManager.emitEvent("devServer", "serverLog", [this.id, msg]);
    }
    function getServer(port) {
        for(i=0;i<serverList.length;i++){
            if(serverList[i].port == port){
                return serverList[i];
            }
        }
        return false;
    }
    function newServer(id, port) {
        //check
        for(var n in serverList){
            if(n == id){
                return ['error', 666, "server id: '"+id+"' already in use"];
            }
        }
        var server = httpServer(id, port);
        server.bind('serverLog', serverLog);
        serverList[id] = server;
        //return JSON.stringify(serverList);
        return serverList[id];
    }
    function newVhost(domain, path, serverID) {
        if(!serverList[serverID]){
            return ['error', 668, "server id: '"+id+"' not exists"];
        }
        if(!serverList[serverID].addVhost(domain, path)){
            return ['error', 669, "vhost domain musst be unique per server"];
        }
        return serverList[serverID];
    }
    function startServer(id) {
        if(!serverList[id]){
            return ['error', 668, "server id: '"+id+"' not exists"];
        }
        for(var n in serverList){
            if(serverList[n].port == serverList[id].port && n != id){
                return ['error', 667, "server port: '"+serverList[id].port+"' already in use"];
            }
        }
        serverList[id].start();
        return serverList[id];
    }
    function stopServer(id) {
        return serverList[id].stop();
    }
    function reloadServer(id) {
        return serverList[id].reload();
    }
    function getStatus() {
        return serverList;//JSON.stringify(serverList);
    }


    exports.init = function init(DomainManager) {
        if (!DomainManager.hasDomain("devServer")) {
            DomainManager.registerDomain("devServer", {major: 0, minor: 1});
        }
        domainManager = DomainManager;

        domainManager.registerEvent(
            "devServer",
            "serverLog",
            [
                {name: "id", type: "number"},
                {name: "message", type: "string"}
            ]
        );


        domainManager.registerCommand(
            "devServer",
            "newServer",
            newServer,
            false,
            "creates new server instance and returns the id",
            [   {name: "name", // parameters
                    type: "string",
                    description: "server name"},
                {name: "port", // parameters
                    type: "number",
                    description: "server port number"}
            ],
            [{name: "serverId", // return values
                type: "number",
                description: "server id"}]
        );

        domainManager.registerCommand(
            "devServer",
            "newVhost",
            newVhost,
            false,
            "creates new server instance and returns the id",
            [   {name: "domain", // parameters
                    type: "string",
                    description: "domain like localhost or 127.0.0.1"},
                {name: "path", // parameters
                    type: "string",
                    description: "root path of the http server"},
                {name: "serverID", // parameters
                    type: "string",
                    description: "server id"}
            ],
            [{name: "serverId", // return values
                type: "number",
                description: "server id"}]
        );

        domainManager.registerCommand(
            "devServer",
            "getStatus",
            getStatus,
            false,
            "decription",
            null,
            [{name: "stats", // return values
                type: "object",
                description: "serverlist"}]
        );

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

        domainManager.registerCommand(
            "devServer",
            "startServer",
            startServer,
            false,
            "decription",
            [{name: "id", // parameters
                type: "string",
                description: "True to return total memory, false to return free memory"}],
            [{name: "stats", // return values
                type: "string",
                description: "stats json string"}]
        );

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
}());
