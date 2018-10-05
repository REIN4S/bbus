
/**
 * BBus Class
 * @class
 * @returns
 */
function BBus() {
    var instance;

    // singleton
    WidgetBus = function() {
        console.log('inst', instance);
        return instance;
    }

    // copy prototype
    WidgetBus.prototype = this;

    // singleton instance
    instance = new WidgetBus();

    // reset consturctor pointer
    instance.constructor = WidgetBus;

    // default namespace
    instance.namespace = "BBUS_NAMESPACE";
    // enumeration
    var castType = instance.castType  = {
        BROADCAST   : 0,
        UNICAST     : 1,
        MULTICAST   : 2
    };
    // event handler map
    var eHandlerMap = {};

    
    // public methods
    instance.subscribe = subscribe;
    instance.unsubscribe = unsubscribe;
    instance.release = release;

    /**
     * Subscribe specific event
     * @public
     * @param {String} ns           Namespace for communication channels.
     * @param {String} eName        Event name for handler identification.
     * @param {Function} cb         Handler itself.
     * @param {Object} context      Handler context for running.
     * @returns {Function}
     * 
     * @example
     * var h = bBus.subscribe("192.168.100.1", "onClick", function(data) {
     *     }, this);
     * var h = bBus.subscribe("192.168.100.1", "onClick", (function(data) {
     *     }).bind(this));
     */
    function subscribe(ns, eName, cb, context) {
        if(!(eHandlerMap[ns] instanceof Object)) { // if not exist handler map, creat it.
            eHandlerMap[ns] = {};
            eHandlerMap[ns][eName] = [];
        } else {
            if(!(eHandlerMap[ns][eName] instanceof Array)) { // if not exist handler map array, create it.
                eHandlerMap[ns][eName] = [];
            }
        }
        
        var handler;
        if(context == undefined) {
            handler = cb.bind({});
        } else {
            handler = cb.bind(context);
        }
        eHandlerMap[ns][eName].unshift(handler);
        return handler;
    };

    /**
     * Unsubscribing to specific event on the browser bus.
     * @public
     * @param {String} ns           Namespace for communication channels.
     * @param {String} eName        Event name for handler identification.
     * @param {Function} h          Event handler for performing tasks.
     * @returns {Boolean}
     * 
     * @example
     * bBus.unsubscribe(h);
     */
    function unsubscribe(ns, eName, h) {
        var hArr = _getHandlers(ns, eName);
        if(!hArr) {
            return false;
        }
        for(var i = 0; i < hArr.length; i += 1) {
            if(h === hArr[i]) {
                hArr.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Release specific event to the browser bus.
     * @public
     * @param {EventQuantum} e      Event object for routing on the browser bus.
     * @returns {Boolean}
     * @example
     * var bBus = new BBus();
     * var e = new bBus.EventQuantum("192.168.100.1", "onClick", "JSON Object");
     * bBus.release(e);
     */
    function release(e) {
        if(!(e instanceof WidgetBus.prototype.EventQuantum)) {
            return false;
        }
        switch(e.type) {
            case castType.BROADCAST:
                _broadCast(e.name, e.data);
            break;
            case castType.UNICAST:
                _uniCast(e.ns, e.name, e.data);
            break;
            case castType.MULTICAST:
                _multiCast(e.ns, e.name, e.data);
            break;
            default: 
            break;
        }
    }

    return instance;

                                                                                    
    /**
     * Get from handler map.
     * @private
     * @param {String} ns           Namespace for communication channels.
     * @param {String} eName        Event name for handler identification.
     * @returns {Function}
     */
    function _getHandlers(ns, eName) {
        if(!eHandlerMap[ns]) {
            return null;
        }
        var h = eHandlerMap[ns][eName];
        if(!(h instanceof Array)) {
            return null;
        }
        if(0 === h.length) {
            return null;
        }
        return h;
    }

    /**
     * Send event through handler.
     * @private
     * @param {Function} h          Event handler for performing tasks.
     * @param {Any} eData           Event message for transmitting information between terminals.
     */
    function _sendEvent(h, eData) {
        if(!(h instanceof Function)) {
            return null;
        }
        h(eData);
    }

    /**
     * Send multiple event through handlers.
     * @private
     * @param {String} eName        Event name for handler identification.
     * @param {Function} h          Event handler for performing tasks.
     * @param {Any} eData           Event message for transmitting information between terminals.
     */
    function _sendMultipleEvent(eName, h, eData) {
        for(var i = 0; i < h.length; i += 1) {
            _sendEvent(h[i], eData);
        }
    }

    
    /**
     * Broadcast event.
     * @private
     * @param {String} eName        Event name for handler identification.
     * @param {Any} eData           Event message for transmitting information between terminals.
     */
    function _broadCast(eName, eData) {
        for(var namespace of Object.keys(eHandlerMap)) {
            var h = _getHandlers(namespace, eName);
            _sendMultipleEvent(eName, h, eData);
        }
    }


    /**
     * Unicast event.
     * @private
     * @param {String} namespace    Namespace for communication channels.
     * @param {String} eName        Event name for handler identification.
     * @param {Any} eData           Event message for transmitting information between terminals.
     */
    function _uniCast(namespace, eName, eData) {
        var h = _getHandlers(namespace, eName);
        if(!h) {
            return;
        }
        _sendEvent(h[0], eData);
    }


    /**
     * Multicast event.
     * @private
     * @param {String} namespace    Namespace for communication channels.
     * @param {String} eName        Event name for handler identification.
     * @param {Any} eData           Event message for transmitting information between terminals.
     */
    function _multiCast(namespace, eName, eData) {
        var h = _getHandlers(namespace, eName);
        if(!h) {
            return;
        }
        _sendMultipleEvent(eName, h, eData);
    }
}

/**
 * Event quantum class.
 * @class 
 * @param {String} namespace    Namespace for communication channels.
 * @param {String} eventName    Event name for handler identification.
 * @param {Any} eventData       Event message for transmitting infomation between terminals.
 * @param {ENUM} castType       Routing scheme for event.
 * 
 * @example 
 * var bBus = new BBus();
 * var e = new bBus.EventQuantum("192.168.100.1", "onClick", "JSON Object");
 */
WidgetBus.prototype.EventQuantum = function(namespace, eventName, eventData, castType = WidgetBus().castType.BROADCAST) {
    this.ns = namespace;
    this.name = eventName;
    this.data = eventData;
    this.type  = castType;
};
