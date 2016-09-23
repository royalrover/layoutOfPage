/**
 * @file 图片轮播组件
 * @import extend/touch.js, extend/event.ortchange.js, core/widget.js
 * @module GMU
 */


var template = require('fecomponent/mobi-art-template/0.0.3');

// 与工程同名的模板（m-scroll.tmpl）默认是可以替换html中的占位符
// 而负责渲染内部结构的模板无法替换

// 作为占位符的模板仍需要引用
require('./m-scoll.tmpl');
require('./m-scoll.less');
var tmpl = require('./content.tmpl');

(function($, undefined ) {
  var cssPrefix = $.fx.cssPrefix,
    transitionEnd = $.fx.transitionEnd,

  // todo 检测3d是否支持。
    translateZ = ' translateZ(0)';

  /**
   * 图片轮播组件
   *
   * @class Slider
   * @constructor Html部分
   * ```html
   * <div id="slider">
   *   <div>
   *       <a href="http://www.baidu.com/"><img lazyload="image1.png"></a>
   *       <p>1,让Coron的太阳把自己晒黑—小天</p>
   *   </div>
   *   <div>
   *       <a href="http://www.baidu.com/"><img lazyload="image2.png"></a>
   *       <p>2,让Coron的太阳把自己晒黑—小天</p>
   *   </div>
   *   <div>
   *       <a href="http://www.baidu.com/"><img lazyload="image3.png"></a>
   *       <p>3,让Coron的太阳把自己晒黑—小天</p>
   *   </div>
   *   <div>
   *       <a href="http://www.baidu.com/"><img lazyload="image4.png"></a>
   *       <p>4,让Coron的太阳把自己晒黑—小天</p>
   *   </div>
   * </div>
   * ```
   *
   * javascript部分
   * ```javascript
   * $('#slider').slider();
   * ```
   * @param {dom | zepto | selector} [el] 用来初始化Slider的元素
   * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Slider:options)
   * @grammar $( el ).slider( options ) => zepto
   * @grammar new gmu.Slider( el, options ) => instance
   */

  $.fn.slide = function(op){
    var self = this;

    var Slider = {

      options: {


        loop: true,


        speed: 400,


        index: 0,


        selector: {
          container: '.ui-slider-group'
        }
      },

      _create: function($el) {
        var me = this;
        var // $el = self,
          opts = $.extend(me.options,op);
        me._options = opts;
        me.index = opts.index;


        me._initDom( $el, opts );


        me._initWidth( $el, me.index );
        me._container.on( transitionEnd + me.eventNs,
          $.proxy( me._tansitionEnd, me ) );


        $( window ).on( 'ortchange' + me.eventNs, function() {
          me._initWidth( $el, me.index );
        } );
      },

      _initDom: function( $el, opts ) {
        var selector = opts.selector,
          viewNum = opts.viewNum || 1,
          items,
          container;


        container = $el.find( selector.container );


        if ( !container.length ) {
          container = $( '<div></div>' );


          if ( !opts.content ) {


            if ( $el.is( 'ul' ) ) {
              this.$el = container.insertAfter( $el );
              container = $el;
              $el = this.$el;
            } else {
              container.append( $el.children() );
            }
          } else {
            this._createItems( container, opts.content );
          }

          container.appendTo( $el );

        }


        if ( (items = container.children()).length < viewNum + 1 ) {
          opts.loop = false;
        }


        while ( opts.loop && container.children().length < 3 * viewNum ) {
          container.append( items.clone() );
        }

        this.length = container.children().length;

        this._items = (this._container = container)
          .addClass( 'ui-slider-group' )
          .children()
          .addClass( 'ui-slider-item' )
          .toArray();

        $el.trigger( 'done.dom', $el.addClass( 'ui-slider' ), opts );
      },


      _createItems: function( container, items ) {
        try{
          container.append( template.render(tmpl)( items ) );
        }catch(e){
          console.error(e);
        }

      },

      _initWidth: function( $el, index, force ) {
        var me = this,
          width;

        if ( !force && (width = $el.width()) === me.width ) {
          return;
        }

        me.width = width;
        me._arrange( width, index );
        me.height = $el.height();
      },


      _arrange: function( width, index ) {
        var items = this._items,
          i = 0,
          item,
          len;

        this._slidePos = new Array( items.length );

        for ( len = items.length; i < len; i++ ) {
          item = items[ i ];

          item.style.cssText += 'width:' + width + 'px;' +
            'left:' + (i * -width) + 'px;';
          item.setAttribute( 'data-index', i );

          this._move( i, i < index ? -width : i > index ? width : 0, 0 );
        }

        this._container.css( 'width', width * len );
      },

      _move: function( index, dist, speed, immediate ) {
        var slidePos = this._slidePos,
          items = this._items;

        if ( slidePos[ index ] === dist || !items[ index ] ) {
          return;
        }

        this._translate( index, dist, speed );
        slidePos[ index ] = dist;


        immediate && items[ index ].clientLeft;
      },

      _translate: function( index, dist, speed ) {
        var slide = this._items[ index ],
          style = slide && slide.style;

        if ( !style ) {
          return false;
        }

        style.cssText += cssPrefix + 'transition-duration:' + speed +
          'ms;' + cssPrefix + 'transform: translate(' +
          dist + 'px, 0)' + translateZ + ';';
      },

      _circle: function( index, arr ) {
        var len;

        arr = arr || this._items;
        len = arr.length;

        return (index % len + len) % arr.length;
      },

      _tansitionEnd: function( e ) {


        if ( ~~e.target.getAttribute( 'data-index' ) !== this.index ) {
          return;
        }

      },

      _slide: function( from, diff, dir, width, speed, opts ) {
        var me = this,
          to;

        to = me._circle( from - dir * diff );


        if ( !opts.loop ) {
          dir = Math.abs( from - to ) / (from - to);
        }


        this._move( to, -dir * width, 0, true );

        this._move( from, width * dir, speed );
        this._move( to, 0, speed );

        this.index = to;
        return self.trigger( 'slide', to, from );
      },


      slideTo: function( to, speed ) {
        if ( this.index === to || this.index === this._circle( to ) ) {
          return this;
        }

        var opts = this._options,
          index = this.index,
          diff = Math.abs( index - to ),


          dir = diff / (index - to),
          width = this.width;

        speed = speed || opts.speed;

        return this._slide( index, diff, dir, width, speed, opts );
      },


      prev: function() {

        if ( this._options.loop || this.index > 0 ) {
          this.slideTo( this.index - 1 );
        }

        return this;
      },


      next: function() {

        if ( this._options.loop || this.index + 1 < this.length ) {
          this.slideTo( this.index + 1 );
        }

        return this;
      },


      getIndex: function() {
        return this.index;
      },


      destroy: function() {
        this._container.off( this.eventNs );
        $( window ).off( 'ortchange' + this.eventNs );
        return this.$super( 'destroy' );
      }












    };

    if(self.length > 1){
      self.forEach(function(s){
        $(s).slide(op);
      });
    }else{
      Slider._create(self);
    }

    setTimeout(function _loop(){
      Slider.next();




      setTimeout(_loop,3000);
    },3000);

    return this;
  };

  Zepto('.j_ui-slider').slide();

})( Zepto );

