define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection  = brackets.getModule("utils/NodeConnection"),
        NodeDomain      = brackets.getModule('utils/NodeDomain'),

        listeners       = [],
        domainPath = ExtensionUtils.getModulePath(module, "node/ServerDomain"),
        serverDomain = new NodeDomain("devServer", domainPath);


    $(serverDomain).on("serverLog", function(e, id, msg){
        emitEvent('serverLog', [id, msg]);
    });

    function emitEvent(type, args) {
        for(i=0;i<listeners.length;i++){
            if(listeners[i].type == type){
                listeners[i].callBack.apply(null, args);
            }
        }
    }

    exports.init = function() {

    }

    /*
    * @return {object} stats
    */
    exports.getStatus = function(cb) {
        var $result = serverDomain.exec("getStatus");
        if(typeof cb == 'function'){

            $result.done(function(value) {
                cb(value);
            });
            $result.fail(function(value) {
                cb('error', value);
            });
        }
    }
    /*
    * @param {string} name of the server
    * @param {string} path server root path
    * @param {number} port server port
    */
    exports.newServer = function(name, path, port, cb) {
        var $result = serverDomain.exec("newServer", name, path, port);
        if(typeof cb == 'function'){
            $result.done(function(value) {
                cb(value);
            });
            $result.fail(function(value) {
                cb('error', value);
            });
        }
    }
    /*
    * @param {string} event type (serverLog)
    * @param {function} call back
    */
    exports.bind = function(type, cb) {
        listeners.push({
            type: type,
            callBack: cb,
        });
    }
    /*
    * @param {number} server id
    * @param {function} call back
    */
    exports.startServer = function(id, cb) {
        var $result = serverDomain.exec("startServer", id);
        $result.done(function(value) {
            console.log('started', value)
            emitEvent('serverStarted', [value]);
            if(typeof cb == 'function') cb(value);
        });
        $result.fail(function(value) {
            console.log('server   start faild: ', value)
            if(typeof cb == 'function') cb('error', value);
        });
    };
    /*
    * @param {number} server id
    * @param {function} call back
    */
    exports.stopServer = function(id, cb) {
        var $result = serverDomain.exec("stopServer", id);
        $result.done(function(value) {
            emitEvent('serverStoped', [value]);
            if(typeof cb == 'function') cb(value);
        });
        $result.fail(function(value) {
            if(typeof cb == 'function') cb('error', value);
        });
    };
    /*
    * @param {number} server id
    * @param {function} call back
    */
    exports.reloadServer = function(id, cb) {
        var $result = serverDomain.exec("reloadServer", id);
        $result.done(function(value) {
            if(typeof cb == 'function') cb(value);
        });
        $result.fail(function(value) {
            if(typeof cb == 'function') cb('error', value);
        });
    }
});
