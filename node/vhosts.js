(function(){

    var express = require('express');


    function create() {
        //private scope

        function vHost(){
            this.vhosts = [];
        }
        /*
         *  returns express middleware handler
         *
         */
        vHost.prototype.handle = function() {
            var self = this;
            return function(req,res,next){

                var domain = req.headers.host.split(':')[0];
                var vhost = null;

                for(i=0;i<self.vhosts.length;i++) {
                    if(self.vhosts[i].domain == domain) {
                        vhost = self.vhosts[i];
                        break;
                    }
                }
                if(vhost) {
                    //dispatch to vhost
                    console.log('dispatch vhost: '+vhost.domain);
                    if ('function' == typeof vhost.app) return vhost.app(req, res, next);
                    vhost.app.emit('request', req, res);
                }else{
                    next();
                    //default path
                }
                //app.emit('request', req, res);
            };
        };

        vHost.prototype.add = function(domain, path) {
            var app = express();

            //mountPath(path, app);
            //--load vhost.conf
            //--setup app zb static routing, routes aus der conf...
                app.use(express.static(path));
//                app.get('/', function(req, res) {
//                    res.send('klo');
//                });
            //return app
            //mountPath ende

            this.vhosts.push({
                domain: domain,
                path: path,
                app: app,
            });
        };
        vHost.prototype.hasDomain = function(domain) {
            for(i=0;i<this.vhosts.length;i++) {
                if(this.vhosts[i].domain == domain) {
                    return true;
                }
            }
            return false;
        };
        return new vHost();
    }
    module.exports = create;
})();

