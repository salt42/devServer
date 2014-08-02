define(function (require, exports, module) {
    "use strict";

    var AppInit         = brackets.getModule("utils/AppInit"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection  = brackets.getModule("utils/NodeConnection"),
        CommandManager  = brackets.getModule('command/CommandManager'),
        Menus           = brackets.getModule("command/Menus"),
        ServerMirror    = require('serverController'),
        ServerPanel     = require('panel');



    var $quickButton = null;
    AppInit.appReady(function () {
        ServerPanel.init();

        //create quick button
        $quickButton = $('<a id="devServer-toolbar" title="devServer" href="#">http</a>');
        $("#main-toolbar").find("#toolbar-go-live").after($quickButton);
        $($quickButton).click(ServerPanel.togglePanel);
    });


});
