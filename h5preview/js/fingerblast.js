/**
 * touch系列事件模拟
 * @author 妙净(miaojing@taobao.com)
 */
(function () {

  'use strict';

  function FingerBlast(element, win) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    win.ontouchstart = 'true';
    this.win = win;
    if (this.element) {
      this.listen();
    }
  }

  FingerBlast.prototype = {
    x: NaN,
    y: NaN,

    startDistance: NaN,
    startAngle:    NaN,

    mouseIsDown: false,
    mouseIsMove: false,

    listen: function () {
      var activate = this.activate.bind(this);
      var deactivate = this.deactivate.bind(this);

      function contains (element, ancestor) {
        var descendants;
        var index;
        var descendant;

        if (!element) {
          return;
        }

        if ('compareDocumentPosition' in ancestor) {
          return !!(ancestor.compareDocumentPosition(element) & 16);
        } else if ('contains' in ancestor) {
          return ancestor !== element && ancestor.contains(element);
        } else {
          for ((descendants = ancestor.getElementsByTagName('*')), index = 0; (descendant = descendants[index++]);) {
            if (descendant === element) {
              return true;
            }
          }
          return false;
        }
      }

      this.element.addEventListener('mouseover', function (e) {
        var target = e.relatedTarget;
        if (target !== this && !contains(target, this) || target == this.getElementsByTagName('html')[0]) {
          activate();
        }
      });

      this.element.addEventListener('mouseout', function (e) {
        var target = e.relatedTarget;
        if (target !== this && !contains(target, this) || target == this.getElementsByTagName('html')[0]) {
          deactivate(e);
        }
      });
    },

    activate: function () {
      if (this.active) {
        return;
      }
      this.mouseIsDown = false;
      this.element.addEventListener('mousedown', (this.touchStart = this.touchStart.bind(this)), true);
      this.element.addEventListener('mousemove', (this.touchMove  = this.touchMove.bind(this)),  true);
      this.element.addEventListener('mouseup',   (this.touchEnd   = this.touchEnd.bind(this)),   true);
      this.element.addEventListener('click',     (this.click      = this.click.bind(this)),      true);
      this.element.addEventListener('mousewheel',     (this.mousewheel      = this.mousewheel.bind(this)),      true);
      this.active = true;
    },

    deactivate: function (e) {
      this.mouseIsDown = false;
      this.active = false;
      if (this.mouseIsDown) {
        this.touchEnd(e);
      }
      this.element.removeEventListener('mousedown', this.touchStart, true);
      this.element.removeEventListener('mousemove', this.touchMove,  true);
      this.element.removeEventListener('mouseup',   this.touchEnd,   true);
      this.element.removeEventListener('click',     this.click,      true);
      this.element.removeEventListener('mousewheel',this.mousewheel, true);
    },

    click: function (e) {
      if (e.synthetic || this.isEditable(e.target)) {
        return;
      }

      var tar = e.target.tagName.toUpperCase() == 'A' ? e.target : $(e.target).closest('a', this).get(0);
      //放过button、div等click，只有a的click阻止掉事件
      if(tar) {
        e.preventDefault();
        //e.stopPropagation();
      }      
      
    },
    /**
     * [isEditable 如textare input是否是可编辑的]
     * @param  {[type]}  e [description]
     * @return {Boolean}   [description]
     */
    isEditable: function(el) {
      var tagName = el.tagName.toLowerCase();

      if(/textarea/.test(tagName)){
        return true;
      } 

      if(/input/.test(tagName) && el.type !== 'submit' && el.type !== 'button' && el.type !== 'reset') {
        return true;
      } 

      return false;
    },

    mousewheel: function(e) {
      this.fireTouchEvents('touchend', e);
    },

    touchStart: function (e) {
      if (e.synthetic || this.isEditable(e.target)) {
        return;
      }

      this.mouseIsDown = true;

      e.preventDefault();
      //e.stopPropagation();

      this.fireTouchEvents('touchstart', e);
    },

    touchMove: function (e) {
      if (e.synthetic || this.isEditable(e.target)) {
        return;
      }
      e.preventDefault();
      //e.stopPropagation();
      var clientX = e.clientX,
          clientY = e.clientY;
      if (this.mouseIsDown) {
        //测试发现scrollview内的元素，各属性没有发生任何变化，因为css动画在GPU运算，不会触发layout
        /*console.log('clientHeight:'+e.target.clientHeight);
        console.log('clientTop:'+e.target.clientTop);
        console.log('offsetHeight:'+e.target.offsetHeight);
        console.log('offsetTop:'+e.target.offsetTop);
        console.log('scrollTop:'+e.target.scrollTop);
        console.log('scrollHeight:'+e.target.scrollHeight);
        */
        //console.log(e.target.clientLeft);
        //console.log('clientY:'+e.clientY);
        this.fireTouchEvents('touchmove', e);
        this.mouseIsMove = true;

        //因上面的测试结果，导致暂时没办法区分当前target是否作用在scroll，故暂时采用手动排除scroll-view
        if(this.y && $(e.target).parent('.km-scroll-view').length == 0) {
            //console.log((clientY-this.y) == (offsetY - this.z));
           //拖拽时 滚动页面
           this.win.scrollTo(0, this.element.body.scrollTop - (clientY - this.y));
        }
      }

      this.move(clientX, clientY, e.target);
    },

    touchEnd: function (e) {
      if (e.synthetic || this.isEditable(e.target)) {
        return;
      }

      this.mouseIsDown = false;

      e.preventDefault();
      //e.stopPropagation();

      this.fireTouchEvents('touchend', e);
      var tar = e.target.tagName.toUpperCase() == 'A' ? e.target : $(e.target).closest('a', this).get(0);
      if(!this.mouseIsMove && tar) {
        var evt = document.createEvent('Event');
        evt.tar = tar;
        evt.initEvent('emulateClick', true, true);
        document.dispatchEvent(evt);
      }

      this.mouseIsMove = false;
      if (!this.target) {
        return;
      }

      // Mobile Safari moves all the mouse events to fire after the touchend event.
      this.target.dispatchEvent(this.createMouseEvent('mouseover', e));
      this.target.dispatchEvent(this.createMouseEvent('mousemove', e));
      this.target.dispatchEvent(this.createMouseEvent('mousedown', e));
    },

    fireTouchEvents: function (eventName, originalEvent) {
      var events   = [];
      var gestures = [];

      if (!this.target) {
        return;
      }
      var onEventName = 'on' + eventName;

      if (onEventName in this.target) {
        console.warn('Converting `' + onEventName + '` property to event listener.', this.target);
        this.target.addEventListener(eventName, this.target[onEventName], false);
        delete this.target[onEventName];
      }

      if (this.target.hasAttribute(onEventName)) {
        console.warn('Converting `' + onEventName + '` attribute to event listener.', this.target);
        var handler = new GLOBAL.Function('event', this.target.getAttribute(onEventName));
        this.target.addEventListener(eventName, handler, false);
        this.target.removeAttribute(onEventName);
      }

      // Set up a new event with the coordinates of the finger.
      var touch = this.createMouseEvent(eventName, originalEvent);

      events.push(touch);

      // Figure out scale and rotation.
      if (events.length > 1) {
        var x = events[0].pageX - events[1].pageX;
        var y = events[0].pageY - events[1].pageY;

        var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var angle = Math.atan2(x, y) * (180 / Math.PI);

        var gestureName = 'gesturechange';

        if (eventName === 'touchstart') {
          gestureName = 'gesturestart';
          this.startDistance = distance;
          this.startAngle = angle;
        }

        if (eventName === 'touchend') {
          gestureName = 'gestureend';
        }

        events.forEach(function(event) {
          var gesture = this.createMouseEvent.call(event._finger, gestureName, event);
          gestures.push(gesture);
        }.bind(this));

        events.concat(gestures).forEach(function(event) {
          event.scale = distance / this.startDistance;
          event.rotation = this.startAngle - angle;
        });
      }

      // Loop through the events array and fill in each touch array.
      events.forEach(function(touch) {
        touch.touches = events.filter(function(e) {
          return ~e.type.indexOf('touch') && e.type !== 'touchend';
        });

        touch.changedTouches = events.filter(function(e) {
          return ~e.type.indexOf('touch') && e._finger.target === touch._finger.target;
        });

        touch.targetTouches = touch.changedTouches.filter(function(e) {
          return ~e.type.indexOf('touch') && e.type !== 'touchend';
        });
      });

      // Then fire the events.
      events.concat(gestures).forEach(function(event, i) {
        event.identifier = i;
        event._finger.target.dispatchEvent(event);
      });
    },

    createMouseEvent: function (eventName, originalEvent) {
      var e = new MouseEvent(eventName, {
        view       : window,
        detail     : originalEvent.detail,
        bubbles    : true,
        cancelable : true,
        target     : this.target || originalEvent.relatedTarget,
        clientX    : this.x || originalEvent.clientX,
        clientY    : this.y || originalEvent.clientY,
        screenX    : this.x || originalEvent.screenX,
        screenY    : this.y || originalEvent.screenY,
        ctrlKey    : originalEvent.ctrlKey,
        shiftKey   : originalEvent.shiftKey,
        altKey     : originalEvent.altKey,
        metaKey    : originalEvent.metaKey,
        button     : originalEvent.button
      });

      e.synthetic = true;
      e._finger   = this;

      return e;
    },

    move: function (x, y, target) {
      if (isNaN(x) || isNaN(y)) {
        this.target = null;
      } else {
        this.x = x;
        this.y = y;

        if (!this.mouseIsDown) {
          this.target = target;
        }
      }
    }
  };

  window.FingerBlast = FingerBlast;

}());