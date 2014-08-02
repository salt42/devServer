define(function (require, exports, module) {
    "use strict";


    var FileSystem      = brackets.getModule('filesystem/FileSystem'),
        FileUtils       = brackets.getModule('file/FileUtils'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        PanelManager    = brackets.getModule("view/PanelManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        Strings         = brackets.getModule("strings"),
        ServerController= require('serverController'),
        $panel          = null,
        $quickButton    = null,
        serverList      = {},
        uiState         = 'overview',
        selectedVhost   = null,
        selectedServer  = null,
        serverLogs      = [];


    //load panel html
    var file = FileSystem.getFileForPath(ExtensionUtils.getModulePath(module, 'panel.html'));
    file.read(htmlReady);

    function updateData(server) {
        var ele = $('#devServer-serverList .item .name:contains("'+server.id+'")').parent('.item');
        $('.port', ele).html(server.port);
        if(server.running){
            $(ele).removeClass('stoped');
            $(ele).addClass('running');
        }else{
            $(ele).removeClass('running');
            $(ele).addClass('stoped');
        }

        //vhosts updaten
        //path

    }


    function htmlReady(e, s) {
        //create panel
        $panel = PanelManager.createBottomPanel('devServer-bottomPanel', $(s),200);
        //create server form
        $('#devServer-createServer').click(buttonHandler_createServer);
        $('#devServer-createVhost').click(buttonHandler_createVhost);
        $('#devServer-searchPath').click(function() {
            var path = ExtensionUtils.getModulePath(module);
            FileSystem.showOpenDialog(false, true, Strings.CHOOSE_FOLDER, path, null, function (err, files) {
                if (!err) {
                    // If length == 0, user canceled the dialog; length should never be > 1
                    if (files.length > 0) {
                        $('#devServer-newPath').val(files[0]);
                        console.log(files[0])
                    } else {
                        //canceld
                    }
                } else {
                    //_showErrorDialog(ERR_TYPE_OPEN_DIALOG, null, err);
                }
            });
        });
        $('#devServer-serverList').delegate('.item', 'click', function(e) {
            //buttons abfangen
            var name = $('.name', e.currentTarget).html();
            if($(e.target).hasClass('button') ){
                if($(e.target).hasClass('start')){
                    ServerController.startServer(name, function(s){
                        serverList[name] = s;
                        //buildVhostList(s);
                        //updateServer ele
                        updateData(s);
                        ;
                    }, function(err){
                        if(err[1] == 666)
                        $('#devServer-newError').html(err[2]);
                    });
                }
            }else{
                selectServer(name);
            }
        });
        $('#devServer-vhostList').delegate('.item', 'click', function(e) {
            //buttons abfangen
            var domain = $('.domain', e.currentTarget).html();
            console.log(domain);
            selectVhost(domain);
        });
    }
    function selectServer(name) {
        if($('#devServer-serverList .item.selected .name').html() == name){
            $('#devServer-serverList .item').removeClass('selected');
            selectedServer = null;
            $('#devServer-vhostList').html('');
            //clear vhosts
            return;
        }
        $('#devServer-serverList .item').removeClass('selected');
        $('#devServer-serverList .item .name:contains("'+name+'")').parent('.item').addClass('selected');
        selectedServer = name;
        //load vhosts
        buildVhostList(serverList[name]);

    }
    function selectVhost(domain) {
        if($('#devServer-vhostList .item.selected .domain').html() == domain){
            $('#devServer-vhostList .item').removeClass('selected');
            selectedVhost = null;
            //clear details
            return;
        }
        $('#devServer-vhostList .item').removeClass('selected');
        $('#devServer-vhostList .item .domain:contains("'+domain+'")').parent('.item').addClass('selected');
        selectedVhost = domain;
        //load details
    }

    function buttonHandler_createServer() {
        var id = $('#devServer-newName').val();
        var port = $('#devServer-newPort').val();
        ServerController.newServer(id, port, function(s){
            serverList[id] = s;
            var ele = buildServerElement(s);
            $('#devServer-serverList').append(ele);
        }, function(err){
            if(err[1] == 666)
            $('#devServer-newError').html(err[2]);
        });
    }
    function buttonHandler_createVhost() {
        if(!selectedServer){
            $('#devServer-newError').html('no server selected!');
            return false;
        }
        var domain = $('#devServer-newName').val();
        var path = $('#devServer-newPath').val();
        ServerController.newVhost(domain, path, selectedServer, function(s){
            console.log(s)
            serverList[selectedServer] = s;
            buildVhostList(s);
            selectVhost(domain)
        }, function(err){
            if(err[1] == 666)
            $('#devServer-newError').html(err[2]);
        });
    }






    ServerController.bind('serverLog', function(port, log){
        if(serverLogs[port]){
            serverLogs[port].push(log);
        }else{
            serverLogs[port] = [log];
        }
        $('#devServer-serverList .item.port_'+port+' .console').append('<div class="line">'+ log +'</div>');
    });
    ServerController.bind('serverStarted', function(serv){
        //serverList[serv.port] = serv;
        //$('#devServer-serverList .item.port_'+serv.port ).addClass('running');
    });
    ServerController.bind('serverStoped', function(serv){
        //serverList[serv.port] = serv;
        //$('#devServer-serverList .item.id_'+serv.id ).removeClass('running');
    });

    function drawOverview() {
        if(serverList) {
            $('#devServer-serverList').html('');
            for(var name in serverList){
                $('#devServer-serverList').append( buildServerElement(serverList[name]) );
            }
        }
    }
    function buildServerElement(data) {
        var clas = '';
        if(data.id == selectedServer)clas += ' selected';
        if(data.running)? clas += ' running': clas += ' stoped';

        var html =
            '<li class="item'+ clas +'">'+
                '<div class="state"></div>'+
                '<span class="name">'+ data.id +'</span>'+
                '<div>Port: <span class="port">'+ data.port +'</span></div>'+
                '<div class="button stop">stop</div>'+
                '<div class="button start">start</div>'+
            '</li>';
        return $(html);
    }
    function buildVhostList(server) {
        var vHosts = server.vhostController.vhosts;
        var html = '';
        for(i=0;i<vHosts.length;i++){
            var clas = '';
            if(vHosts[i].domain == selectedVhost)clas += ' selected';
            html += '<li class="item'+clas+'">'+
                        '<div class="domain">'+vHosts[i].domain+'</div>'+
                        '<div class="path">'+vHosts[i].path+'</div>'+
                        '<div class="button reload">reload</div>'+
                    '</li>';
        }
        $('#devServer-vhostList').html(html);
    }






    exports.init = function(){
        ServerController.getStatus(function(stats){
            serverList = stats;
            drawOverview();
        });
        var regExIP = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
        var hostsFile = FileSystem.getFileForPath('c:/windows/system32/drivers/etc/hosts');//'c:/windows/system32/drivers/etc/hosts');
        hostsFile.read(function(e, content){
            var lines = content.match( /[^\r\n]+/g );
            for(i=0;i<lines.length;i++){
                lines[i].trim()
                if(lines[i].substring(0, 1) != '#'){
                    //check for ip and name
                    var ip = lines[i].match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
                    lines[i].replace(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
                    var name = lines[i].trim();
                   // console.log(ip, name)
                }
            }
        })

//FileSystem.resolve('c:/windows/system32/drivers/etc/hosts', function(err, file){
//console.log(file)
//file.read(function(content){
//    console.log(content);
//
//})

    };

    exports.togglePanel = function() {
        if($panel.isVisible()) {
            $panel.hide();
        } else {
            $panel.show();
        }
    }
});
