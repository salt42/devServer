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




    AppInit.appReady(function () {
        ServerPanel.init();
    });


});
