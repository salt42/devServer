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
        serverStats     = [],
        uiState         = 'overview',
        selected        = null,
        serverLogs      = [];


    ServerController.init();
    //load panel html
    var file = FileSystem.getFileForPath(ExtensionUtils.getModulePath(module, 'panel.html'));
    file.read(htmlReady);

    function htmlReady(e, s) {
        //create panel
        $panel = PanelManager.createBottomPanel('devServer-bottomPanel', $(s),200);
        //create server form
        $('#devServer-createServer').click(buttonHandler_createServer);
        $('#devServer-searchPath').click(function() {
            FileSystem.showOpenDialog(false, true, Strings.CHOOSE_FOLDER, 'c:/', null, function (err, files) {
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
            if($(e.target).hasClass('button') ) {
                //clicked button
                var id = $(e.currentTarget).children('.id').html();

                if($(e.target).hasClass('start') ) {
                    ServerController.startServer(id);
                }else if($(e.target).hasClass('stop') ) {
                    ServerController.stopServer(id);
                }else {
                    ServerController.reloadServer(id);
                }
            }else if($(e.target).hasClass('console') || $(e.target).parent().hasClass('console')) {
                //clicked on console
            }else {
                var id = $(e.currentTarget).children('.id').html();
                selectServer(id);
            }
        });
    }
    function selectServer(id) {
        if($('#devServer-serverList .item.selected .id').html() == id){
            $('#devServer-serverList .item').removeClass('selected');
            return;
        }
        $('#devServer-serverList .item').removeClass('selected');
        $('#devServer-serverList .item.id_'+id).addClass('selected');
    }



    ServerController.bind('serverLog', function(id, log){
        if(serverLogs[id]){
            serverLogs[id].push(log);
        }else{
            serverLogs[id] = [log];
        }
        $('#devServer-serverList .item.id_'+id+' .console').append('<div class="line">'+ log +'</div>');
    });
    ServerController.bind('serverStarted', function(serv){
        serverStats[serv.id] = serv;
        $('#devServer-serverList .item.id_'+serv.id ).addClass('running');
    });
    ServerController.bind('serverStoped', function(serv){
        serverStats[serv.id] = serv;
        $('#devServer-serverList .item.id_'+serv.id ).removeClass('running');
    });

    function drawOverview() {
        if(serverStats) {
            $('#devServer-serverList').html('');
            for(i=0;i<serverStats.length;i++) {
                $('#devServer-serverList').append( buildServerElement(serverStats[i]) );
            }
        }
    }
    function buildServerElement(data) {
        var logs = '';
        if(serverLogs[data.id]){
            for(i=0;i<serverLogs[data.id].length;c++) {
                logs += '<span class="line">'+ serverLogs[data.id][c] +'</span>'
            }
        }
        var clas = '';
        if(data.running)clas += ' running';
        if(data.id == selected)clas += ' selected';
        clas += ' id_'+ data.id;
        var html =
            '<li class="item'+ clas +'">'+
                '<div class="functionBar">'+
                    '<span class="button start">start</span>'+
                    '<span class="button stop">stop</span>'+
                    '<span class="button reload">reload</span>'+
                '</div>'+
                '<div class="name">'+ data.name +'</div>'+
                '<div class="id">'+ data.id +'</div>'+
                '<div class="port">'+ data.port +'</div>'+
                '<div class="path">'+ data.path +'</div>'+
                '<div class="console">'+
                    logs+
                '</div>'+
            '</li>';
        //return $('<li class="item'+ clas +'"><div class="name">'+ data.name +'</div><div class="id">'+ data.id +'</div><div class="port">'+ data.port +'</span><div class="path">'+ data.path +'</div><div class="console">'+ logs +'</div></li>');
        return $(html);
    }

    function togglePanel() {
        if($panel.isVisible()) {
            $panel.hide();
        } else {
            $panel.show();
        }
    }

    function buttonHandler_createServer() {
        var name = $('#devServer-newName').val();
        var path = $('#devServer-newPath').val();
        var port = $('#devServer-newPort').val();
        ServerController.newServer(name, path, port, function(s){
            serverStats[s.id] = s;
            var ele = buildServerElement(s);
            $('#devServer-serverList').append(ele);
        });
    }




    exports.init = function(){
        ServerController.getStatus(function(stats){
            serverStats = stats;
            drawOverview();
        });

        //create quick button
        $quickButton = $('<a id="devServer-toolbar" title="devServer" href="#">http</a>');
        $("#main-toolbar").find("#toolbar-go-live").after($quickButton);
        $($quickButton).click(togglePanel);
    };
});
