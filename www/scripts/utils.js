$get = function (id) {
    return (typeof id == "string") ? document.getElementById(id) : id;
};

$getByTag = function (name, parent) {
    parent = parent ? parent : document;
    return parent.getElementsByTagName(name);
};

$setChild = function (id, child) {
    var el = $get(id);
    var children = el.childNodes;
    for (var i = 0, l = children.length; i < l; i++) {
        el.removeChild(children[i]);
    }
    el.appendChild(child);
};

$setText = function (id, text) {
    //$setChild(id, document.createTextNode(text));
    $get(id).innerHTML = text;
};

$getInnerHtml = function (id) {
    return $get(id).innerHTML;
};

$setInnerHtml = function (id, html) {
    $get(id).innerHTML = html;
};

$append = function (id, child) {
    $get(id).innerHTML += child;
};

$show = function (id, force) {
    var el = $get(id);
    el.style.display = force ? "block" : "";
    return el;
};

$showAll = function (ids) {
    var args = arguments;
    for (var i = 0; i < args.length; i++) {
        $show(args[i]);
    }
};

$hide = function (id) {
    $get(id).style.display = "none";
};

$hideAll = function () {
    var args = arguments;
    for (var i = 0; i < args.length; i++) {
        $hide(args[i]);
    }
};

$setAttr = function (id, attr, val) {
    var el = $get(id);
    if (!el) {
        console.warn('element not found', id);
        return;
    }
    if ('value' == attr && el.value != null)
        el.value = val;
    el.setAttribute(attr, val);
};

$getAttr = function (id, attr) {
    var el = $get(id);
    if ('value' == attr && el.value != null)
        return el.value;
    return el.getAttribute(attr);
};

$_trim = function (text) {
    if (text == null) return "";
    var trimLeft = /^\s+/,
	trimRight = /\s+$/,
    trim = String.prototype.trim;
    
    if (!!trim)
        return trim.call(text);
    return text.toString().replace(trimLeft, "").replace(trimRight, "");
};

$addClass = function $addClass(id, className) {
    var elem = $get(id);
    
    if (elem.classList) {
        
        elem.classList.add(className);
        
    } else {
        if (!elem.className && !!className) {
            elem.className = className;
        } else {
            var setClass = " " + elem.className + " ";
            
            if (! ~setClass.indexOf(" " + className + " ")) {
                setClass += className + " ";
            }
            elem.className = $_trim(setClass);
        }
    }
};

$removeClass = function $removeClass(id, value) {
    var elem = $get(id);
    
    if (elem.classList) {
        
        elem.classList.remove(value);
        
    } else {
        var rclass = /[\n\t\r]/g;
        
        if (elem.nodeType === 1 && elem.className) {
            if (value) {
                var className = (" " + elem.className + " ").replace(rclass, " ");
                className = className.replace(" " + value + " ", " ");
                elem.className = $_trim(className);
            } else {
                elem.className = "";
            }
        }
    }
};

$attachEvent = function (element, eventName, handler) {
    var el = $get(element);
    if (typeof el.addEventListener != 'undefined')
        el.addEventListener(eventName, handler, false);
    else if (typeof el.attachEvent != 'undefined')
        el.attachEvent("on" + eventName, handler);
    else
        el["on" + eventName] = handler;
    
};

$getElementsByClassName = $getByClass = function (oElm, strTagName, strClassName) {
    oElm = $get(oElm);
    var arrElements = (strTagName == "*" && oElm.all) ? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    strClassName = strClassName.replace(/\-/g, "\\-");
    var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
    var oElement;
    for (var i = 0; i < arrElements.length; i++) {
        oElement = arrElements[i];
        if (oRegExp.test(oElement.className)) {
            arrReturnElements.push(oElement);
        }
    }
    return (arrReturnElements);
};

$doAll = function (els, func) {
    for (var i = 0, length = els.length; i < length; i++) {
        func(els[i]);
    }
};


$ajax = function (req) {
    if (!req.type)
        req.type = "POST";
    if (!req.dataType)
        req.dataType = "json";
    $_ajax({
           type: req.type,
           url: req.url,
           data: req.data ? req.data : "{}",
           contentType: "application/json",
           dataType: req.dataType,
           success: function (msg) {
           if (req.success)
           req.success(msg);
           },
           error: function (err) {
           
           console.log("Error: ", err);
           if (req.error) req.error(err);
           }
           });
};

$_ajax = function (req) {
    var xmlHttp = new XMLHttpRequest();
    var httpCallBack = function () {
        if (xmlHttp.readyState == 4) {
            var resultXml = xmlHttp.responseText;
            req.success(eval("a = " + resultXml));
        }
    };
    
    xmlHttp.onreadystatechange = httpCallBack;
    xmlHttp.open(req.type, req.url, true);
    xmlHttp.setRequestHeader('Content-Type', req.contentType);
    // if dataType == 'json'
    xmlHttp.setRequestHeader('Accept', 'application/json, text/javascript, */*');
    xmlHttp.send(req.data);
};

$pull = function (req, interval, maxTries, resProc, timeoutProc) {
    var pullRes = {
    interval: interval,
    setInterval: function (interval) {
        this.interval = interval;
        clearInterval(this.pullingInterval);
        this.pullingInterval = startPulling(this.interval);
    },
    pullingInterval: null,
    stop: function () {
        clearInterval(this.pullingInterval);
        this.state = 'stopped';
    },
    state: 'initialized',
    resume: function () {
        if (this.state == 'stopped') {
            this.setInterval(this.interval);
            this.state = 'resumed';
            return true;
        }
        return false;
    }
    };
    
    var pullCounts = 0;
    var doPull = function () {
        $ajax({ url: req.url, data: req.data, success: function (d) {
              if (resProc(d.d)) {
              stopPulling();
              req.success(d);
              }
              }, error: function () {
              
              }
              });
    };
    
    pullCounts++;
    doPull();
    
    var startPulling = function (intv) {
        return setInterval(function () {
                           pullCounts++;
                           if (maxTries > -1 && pullCounts > maxTries) {
                           stopPulling();
                           } else {
                           doPull();
                           }
                           }, intv);
    };
    
    pullRes.pullingInterval = startPulling(interval);
    pullRes.state = 'started';
    
    var stopPulling = function () {
        clearInterval(pullRes.pullingInterval);
        pullRes.state = 'stopped';
        timeoutProc();
    };
    
    return pullRes;
};


showAjaxLoader = function (el, posFunc) {
    el = $get(el);
    var html = el.innerHTML;
    var ajax = $get("ajax-loader").cloneNode(true);
    if (posFunc) {
        el.appendChild(ajax);
        posFunc(ajax);
    } else {
        $setAttr(el, "originalHtml", html);
        el.innerHTML = "";
        el.appendChild(ajax);
    }
    $show(ajax);
    return ajax;
};
hideAjaxLoader = function (el) {
    el = $get(el);
    var html = $getAttr(el, "originalHtml");
    if (html) {
        el.innerHTML = html;
    } else
        $doAll($getByClass(el, '*', 'ajax-loader'), $hide);
};

formatNumber = function (b) { b += ""; var e = b.split("."); b = e[0]; e = e.length > 1 ? "." + e[1] : ""; for (var d = /(\d+)(\d{3})/; d.test(b); ) b = b.replace(d, "$1,$2"); return b + e; };

$extend = function (original, extensions, notOverride) {
    if (!original) original = {};
    for (var b in extensions) {
        if (!!original[b] && !!notOverride)
            continue; 
        original[b] = extensions[b];
    }
    return original;
}