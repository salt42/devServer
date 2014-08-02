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
    exports.newServer = function(name, port, fn, errfn) {
        var $result = serverDomain.exec("newServer", name, port);
        if(typeof fn == 'function'){
            $result.done(function(value) {
                if(value[0] === 'error')
                    errfn.apply(null, arguments);
                else
                    fn(value);
            });
            $result.fail(function() {
                if(errfn == 'function')errfn.apply(null, arguments);
            });
        }
    }
    /*
    * @param {string} name of the server
    * @param {string} path server root path
    * @param {number} port server port
    */
    exports.newVhost = function(domain, path, serverID, fn, errfn) {
        var $result = serverDomain.exec("newVhost", domain, path, serverID);
        if(typeof fn == 'function'){
            $result.done(function(value) {
                if(value[0] === 'error')
                    errfn.apply(null, arguments);
                else
                    fn(value);
            });
            $result.fail(function(value, e) {
                if(errfn == 'function')errfn.apply(null, arguments);
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
    exports.startServer = function(id, fn, errfn) {
        var $result = serverDomain.exec("startServer", id);
        $result.done(function(value) {
            emitEvent('serverStarted', [value]);
            if(typeof fn == 'function') fn(value);
        });
        $result.fail(function(value) {
            console.log('server   start faild: ', value)
            if(typeof errfn == 'function') errfn('error', value);
        });
    };
    /*
    * @param {number} server id
    * @param {function} call back
    */
    exports.stopServer = function(port, cb) {
        var $result = serverDomain.exec("stopServer", port);
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
    exports.reloadServer = function(port, cb) {
        var $result = serverDomain.exec("reloadServer", port);
        $result.done(function(value) {
            if(typeof cb == 'function') cb(value);
        });
        $result.fail(function(value) {
            if(typeof cb == 'function') cb('error', value);
        });
    }
});
