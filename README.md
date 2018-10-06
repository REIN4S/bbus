# B-bus

In browser, B-bus(for "Browser Bus"), a software bus, is an inter-component communication on browser.

## Features

* Namespace isolation.
* Cast type selection(Unicast/Multicast/Broadcast).

## Getting Started

This library requires only one file.

### Prerequisites

```html
<html>
    <head>
    <script src="b-bus.js"></script>
    </head>
    ...
</html>
```

### Usage

* Vanilla:

```javascript
window.bBus = new BBus();
window.onload = function() {
    var e = new bBus.EventQuantum("192.168.100.1", "onLoad", "Ping!");
    bBus.release(e);
}
...
var hID = bBus.subscribe("192.168.100.1", "onLoad", 
    function() {
        alert("Pong!");
    }, this);

window.unload = function() {
    bBus.unsubscribe(hID);
}

```

* with Vue.js:

```javascript
var bBus = new BBus();
Vue.prototype.$bBus = bBus;

Vue.component("A", {
    data: function() {
        return {
            id: "192.168.100.1",
            ...
        };
    },
    mounted: function() {
        var e = new bBus.EventQuantum(this.id, "onMounted", 
            "Ping!", this.$bBus.castType.UNICAST);
        this.$bBus.release(e);
        ...
    },
    ...
});

Vue.component("B", {
    data: function() {
        return {
            id: "192.168.100.2",
            ...
        };
    },
    mounted: function() {
        this.hID = this.$bBus.subscribe("192.168.100.1", "onMounted", function() {
            alert("Pong!");
        }, this);
        ...
    },
    ...
    beforeDestroy: function() {
        this.$bBus.unsubscribe(this.hID);
    }
});
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
