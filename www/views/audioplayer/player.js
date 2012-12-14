AudioPlayer = {};
/*
Standard interface:
init(args: obj) - depending on the player
setAudio(url, length) - url: unescaped url, length: in seconds
start()
stop()
toggle()
*/

AudioPlayer.create = function (obj) {
    if (typeof obj == 'undefined') obj = {};
    obj._audioUrl = null;
    obj._audioLength = 1;
    obj._lastPlay = null;
    obj.state = 'stopped';
    obj.init = function (args) {
        obj._doInit(args);
    };
    obj.setAudio = function (url, length) {
        obj._audioUrl = url;
        obj._audioLength = length; // in seconds
        return obj;
    };
    obj.start = function () {
        if (obj._audioUrl) {
            obj._doStart();
            obj._lastPlay = new Date();
            obj.state = 'playing';
            console.log("AudioPlayer Start(): length:", obj._audioLength);
            if (obj.startHandlers != null) {
                for (var i = 0; i < obj.startHandlers.length; i++)
                    obj.startHandlers[i](); // start event
            }
        }
    };
    obj.stop = function () {
        obj._doStop();
        obj.state = 'stopped';
    };
    obj.support = {};
    obj.toggle = function () {
        if ('stopped' == obj.state) {
            obj.start();
        } else {
            var now = new Date();
            if (((now - obj._lastPlay) / 1000) > obj._audioLength) {
                obj.stop();
                if (!obj.support.asyncPlayBack) {
                    obj.start();
                } else
                    setTimeout(function () {
                        obj.start();
                    }, 500);
            } else
                obj.stop();
        }
    };

    obj.startHandlers = [];

    /* abstracts */
    if (typeof obj._doInit == 'undefined')
        obj._doInit = function (args) { };

    if (typeof obj._doStart == 'undefined')
        obj._doStart = function () { };

    if (typeof obj._doStop == 'undefined')
        obj._doStop = function () { };


    return obj;
};