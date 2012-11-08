/*@req [host-test,ip]
  @id slider
  @descr Sliding panels utility
  @author petter.envall@gmail.com
  @version 0.1
*/

var slider
  // required modules:
  , hostTest, ip;

(function () {

  var requirements = [hostTest.isHostMethod, ip];
  
  ("undefined"== typeof slider) && (slider = (function (isHostMethod, ip) {
    if (!(isHostMethod && ip)) {return;} // unsupportive environment

    var defaultOptions = {
      "height": 300
      , "panelsTag": "div"
      , "panelTag": "span"
      , "containerClass": "slider-panels-wrap"
      , "startIdx": 0
      , "slidingDuration": 600
      , "before": function (fromIdx, toIdx) {}
      , "after": function (fromIdx, toIdx) {}
      , "easing": function (pos) {
        return (-0.5 * (Math.cos(Math.PI*pos) -1));
      }
    };

    // Instance constructor
    function Slider(containerId, options) {
      this.options = ("object" == typeof options) ? options : {};
      for (var prop in defaultOptions) {
        (prop in this.options) || (this.options[prop] = defaultOptions[prop]);
      }
      this.container = byId(containerId);
      if (!this.container) {throw new Error("Container not found for: "+containerId);}
      this.panelsContainer = this.container.getElementsByTagName(this.options.panelsTag)[0];
      cleanTextNodes(this.panelsContainer);
      this.panelItems = this.container.getElementsByTagName(this.options.panelTag);
      setStyles(this);
      this.maxIdx = this.panelItems.length-1;
      this.currentIdx = this.options.startIdx;
      this.showPanel(this.currentIdx, true);
      observeResize(this);
    }

    // Public instance API
    Slider.prototype = {
      "constructor": Slider
      , "isMoving": function () {return !!this.timer;}
      , "getCurrentIdx": function () {return this.currentIdx;}
      , "getMaxIdx": function () {return this.maxIdx;}
      , "prev": function (snappy) {return this.showPanel(this.currentIdx-1, !!snappy);}
      , "next": function(snappy) {return this.showPanel(this.currentIdx+1, !!snappy);}
      , "showPanel": function (idx, snappy) {
        if (isNaN(idx) || "number" != typeof idx) {throw new Error("Invalid panel idx: "+idx);}
        idx = Math.max(0, Math.min(this.maxIdx, idx));
        idx === this.currentIdx || move(this, idx, snappy);
        return idx;
      }
    };

    /* Internal functionality */
    var win = this, doc = win.document;
    function setStyles(instance) {
      instance.container.style.height = instance.options.height+"px";
      instance.container.style.position = "relative";
      instance.container.style.overflow = "hidden";
      instance.container.style.whiteSpace = "nowrap";
      instance.panelsContainer.style.width = instance.panelsContainer.style.height = "100%";
      instance.panelsContainer.style.position = "absolute";
      for (var item, idx=0, len=instance.panelItems.length; idx<len; ++idx) {
        item = instance.panelItems[idx];
        item.style.width = item.style.height = "100%";
        item.style.display = "inline-block";
        item.style.overflow = "auto";
      }
    }
    function observeResize(instance) {
      if (isHostMethod(win, "addEventListener")) {
        win.addEventListener("resize", function () {
          move(instance, instance.currentIdx, true);
        }, false);
      }
      else if (isHostMethod(win, "attachEvent")) {
        win.attachEvent("onresize", function () {
          move(instance, instance.currentIdx, true);
        });
      }
    }

    function byId(id) {
      var elem = doc.getElementById(id);
      return (elem && elem.id == id) ? elem : void 0;
    }

    function byClassName(name, parent) {
      var classExpr = new RegExp("(^|\\s)"+name+"(\\s|$)")
        , elems = parent.getElementsByTagName("*"), result = [];
      for (var elem, idx=0, len=elems.length; idx<len; ++idx) {
        elem = elems[idx];
        (elem.nodeType==1 && classExpr.test(elem.className)) && result.push(elem);
      }
      return result;
    }

    function cleanTextNodes(parent) {
      var nodes = parent.childNodes;
      for (var elem, idx=0, len=nodes.length; idx<len; ++idx) {
        elem = nodes[idx];
        (elem && elem.nodeType==3) && (elem.nodeValue = "");
      }
    }

    function getX(instance, idx) {
      return -(instance.container.offsetWidth*idx);
    }

    function move(instance, toIdx, snappy) {
      if ("undefined" == typeof instance.currentX) {instance.currentX = 0;}
      var xPos = getX(instance, toIdx);
      if (xPos==instance.currentX) {return;}
      instance.options.before(instance.currentIdx, toIdx);
      if (snappy) {
        if (instance.timer) {
          clearTimeout(instance.timer);
        }
        instance.panelsContainer.style.left = xPos+"px";
        afterMove(instance, xPos, toIdx);
        return;
      }
      if (instance.timer) {
        return;
      }
      instance.timer = ip.create(instance.currentX, xPos, {
        "duration": instance.options.slidingDuration
        , "update": function (value) {
          instance.panelsContainer.style.left = value+"px";
        }
        , "end": function () {
          afterMove(instance, xPos, toIdx);
        }
        , "easing": instance.options.easing
      }).start();
    }

    function afterMove(instance, xPos, toIdx) {
      instance.timer = null;
      instance.currentX = xPos;
      instance.options.after(instance.currentIdx, toIdx);
      instance.currentIdx = toIdx;
    }

    return {
      "create": function (containerId, options) {
        options || (options = {});
        return new Slider(containerId, options);
      }
    };

  }).apply(this, requirements));

})();
