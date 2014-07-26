var Reset = "\x1b[0m",
Bright = "\x1b[1m",
Dim = "\x1b[2m",
Underscore = "\x1b[4m",
Blink = "\x1b[5m",
Reverse = "\x1b[7m",
Hidden = "\x1b[8m",

FgBlack = "\x1b[30m",
FgRed = "\x1b[31m",
FgGreen = "\x1b[32m",
FgYellow = "\x1b[33m",
FgBlue = "\x1b[34m",
FgMagenta = "\x1b[35m",
FgCyan = "\x1b[36m",
FgWhite = "\x1b[37m",

BgBlack = "\x1b[40m",
BgRed = "\x1b[41m",
BgGreen = "\x1b[42m",
BgYellow = "\x1b[43m",
BgBlue = "\x1b[44m",
BgMagenta = "\x1b[45m",
BgCyan = "\x1b[46m",
BgWhite = "\x1b[47m"
function LOG(msg){
    console.log(Dim+msg+Reset)
}
function WARNING(msg){
    console.log(FgYellow+msg+Reset)
}
function ERROR(msg){
    console.log(FgRed+'Error: '+Reset+msg)
}




var workspacePath = '../projects/';
var storage = require('node-persist');
var fs = require('fs');
var pathToRegexp = require('path-to-regexp');
var express = require('express');
var app = express();
var roots = [];


storage.initSync();
if(!storage.getItem('activeRoot')){
    storage.setItem('activeRoot', 0);
}
var activeRoot = storage.getItem('activeRoot');
var extend = function(){
    for(var i=1; i<arguments.length; i++){
        for(var key in arguments[i]){
            if(arguments[i].hasOwnProperty(key)){
                arguments[0][key] = arguments[i][key];
            }
        }
    }
    return arguments[0];
}
var refreshWorkspace = function(){
    var dirs = fs.readdirSync(workspacePath);
    for(i in dirs){
        if(fs.lstatSync(workspacePath+dirs[i]).isDirectory()){
            var defaultConf = {
                name : dirs[i],
                rootPath : workspacePath+dirs[i],
                routes : [],
                routeFuncs : [],
            }
            var vConf = {}
            if(fs.existsSync(workspacePath+dirs[i]+'/vhost.js')){
                vConf = require(workspacePath+dirs[i]+'/vhost.js')
                //var vhostConf = fs.readFileSync(workspacePath+dirs[i]+'/vhost.json')
                //vhostConf = JSON.parse(vhostConf);
                //console.log(vhostConf)

            }
            extend(defaultConf, vConf);
            roots.push(defaultConf);
        }
    }
};

refreshWorkspace();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



//SERVER gets and pulls
app.get('/SERVER/:com/:par', function(req, res){
    var com = req.params.com;
    if(com == 'switch'){
        var i = req.params.par;
        activeRoot = i;
        storage.setItem('activeRoot', i)
        console.log('switch to vHost: '+roots[i].name);
        res.send({
            type : 'activeRoot',
            id : i,
        })
        //res.render('../webGui/index', { roots: roots, activeRoot: activeRoot });
    }
});
app.get('', function(req, res){
    //check 4 server gui address
    if(req.headers.host.search('127.0.0.1')>=0){
        res.render('../webGui/index', { roots: roots, activeRoot: activeRoot});
    }else{
        res.sendfile('index.html', {root : roots[activeRoot].rootPath});
    }
});

app.get('/*', function(req, res){
    var path = req.params[0];

    if(req.headers.host.search('127.0.0.1')>=0){
        var rDir = './webGui';
    }else{
        rDir = roots[activeRoot].rootPath;
    }
    if(path.substr(0,1) != '/' && path.substr(0,1) != '\\'){
        path = '/'+path;
    }

    if(fs.existsSync(rDir+path)){
        console.log(rDir+path)
        if(fs.lstatSync(rDir+path).isDirectory()){
            //iterate over array with possible index filenames
            path += 'index.html'
        }
        res.sendfile(path, {root : rDir});
    }else{
        if(!dispatchVhost(req, res)){
            //404 error
            ERROR('404 :'+rDir+path)
        }
    }
});

function dispatchVhost(req, res) {
    //dispatch over vhost.js
    var routes = roots[activeRoot].routes;
    //originalUrl
    for(i=0;i<routes.length;i++){
        var v = routes[i];
        var keys = [];
        var exp = pathToRegexp(v, keys);
        var r = req.url.match(exp);
        if(r){
            for(c=0;c<keys.length;c++){
                req.params[keys[c].name] = r[c+1];
            }
            //run vhost
            roots[activeRoot].routeFuncs[i](req, res)
            return true;
        }
    }
    return false;
}

var server = app.listen(80, function() {
    console.log('Listening on port %d', server.address().port);
});
