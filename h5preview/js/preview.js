/**
 * 预览功能
 * @author 妙净(miaojing@taobao.com)
 */
(function(){

    var frameUrl = '', device = '', env = '', scale = '';
    function dealHash() {
        var value = location.hash;
        if(value) {
            var url = value.substring(5);
            if(url.length > 1) {
                if(!/http(s)?:\/\//.test(url)) {
                    url = 'http://'+ url;
                }
                url = parseUrl(url);
                // if(!/test\.m\./.test(location.host)) {
                    domainChange(url);
                // }
                device = getParam(url, 'device');
                env = getParam(url, 'env');
                scale = getParam(url, 'scale');
                url = delParam(delParam(delParam(url, 'device'), 'env'), 'scale');
                setQrCode(url);
                if($('#J_UrlTxt').length > 0) {
                  $('#J_UrlTxt')[0].value = url;
                }
                frameUrl = url;
                setScaleIpt();
                setScale();
                setDemoUrl(url);
                selectFilter();
            } else {
                //设置为默认的preview-blank
                setScaleIpt();
                setScale();
                selectFilter();
                $('#J_Frame').attr('src', $('#J_Frame').attr('data-src'));
            }
        } else {
            location.hash = '#url=';
        }
    }

    //是否是线上页面
    function isOnline (url) {
        //http://wapp.waptest.taobao.com/s/0/abc.html
        //http://wapp.waptest.taobao.com/s/0/abc.html
        if (/(waptest|wapa|cdnprepubtms\.m)\.taobao/.test(url)) {
          return false;
        } else {
          return /taobao\.com/.test(url);
        }
    }

    function isDaily (url) {
      return /waptest\.taobao/.test(url);
    }

    function isPrepub (url) {
      return /wapa\.taobao/.test(url);
    }

    function isOnline (url) {
      return /taobao\.com/.test(url);
    }

    //日常地址使用日常的预览，预发的地址使用预发的预览，
    //线上的地址使用线上的预览，其余内网地址使用mp.m.taobao.net预览
    //内外网url切换
    // tms的地址用mp.php预览，http://market.m.taobao.com/market/mp.php#url=http://tms.taobao.com/press/preview.htm?id=1798489
    function domainChange(url) {

        var netUrl = 'http://mp.m.taobao.net/',
            dailyUrl = 'http://wapp.waptest.taobao.com/src/mp.html',
            prepubUrl = 'http://wapp.wapa.taobao.com/src/mp.html',
            onlineUrl = 'http://wapp.m.taobao.com/src/mp.html';

        var hash = location.hash;

        var host = getHostOfUrl(url);

        if(/waptest\.taobao/.test(host) && !/waptest\.taobao/.test(location.host)) {
          location.replace(dailyUrl + hash);
        //内网用mp.m.taobao.net
        } else if(/wapa\.taobao/.test(host) && !/wapa\.taobao/.test(location.host)) {
          location.replace(prepubUrl + hash);            
        } else if(/m\.taobao\.com/.test(host) && !/wapp\.m\.taobao\.com/.test(location.host)) {
          location.replace(onlineUrl + hash);
        } else if(!/taobao\.com/.test(host)  && !/taobao\.net/.test(location.host) && !/tms\.taobao\.com/.test(url)) {
          location.replace(netUrl + hash);
        }
    }

    function getHostOfUrl (url) {

        var linkDOMNode = document.createElement('a');

        linkDOMNode.href = url;

        return linkDOMNode.host;

    }


    // //内外网url切换
    // function domainChange(url) {
    //     var onlineDomain = 'http://mp.m.taobao.com/',
    //         notOnLineDomain = 'http://mp.fed.taobao.net/';
    //     //外网用mp.m.taobao.com
    //     if(isOnline(url)) {
    //         if(/taobao\.net/.test(location.host)){
    //             //location.replace(onlineDomain + '#url=' + url);
    //             location.replace(location.href.replace(notOnLineDomain, onlineDomain));
    //         } 
    //     //内网用m.demo.taobao.net
    //     } else {
    //         if(/taobao\.com/.test(location.host)){
    //             //location.replace(notOnLineDomain + '#url=' + url);
    //             location.replace(location.href.replace(onlineDomain, notOnLineDomain));
    //         }
    //     }
    // }


    function setHash(url) {
      var paramStr = '';
      paramStr = device ? '&device=' + device : '';
      paramStr += env ? '&env=' + env : '';
      paramStr += scale ? '&scale=' + scale : '';
      location.hash = '#url='+ url + paramStr;
    }

    /**
     * [setQrCode description] 设置二维码地址
     * @param {[type]} url [description]
     */
    function setQrCode(url) {
        var qrurl = "http://ma.taobao.com/api/qrcode.htm?sec=tms&activity=save&width=220&height=220&ecLevel=L&text=" + encodeURIComponent(url);
        $.jsonp({
                url: qrurl,
                success: function(data) {
                    if(data.status == 200) {
                        $('#J_QrcodeImg').attr('src', data.url);
                    }
                }
            }
        );
    }

  /**
   * 处理淘宝的一些特殊case 302跳转
   * http://a.m.taobao.com/i39016567650.htm?spm=a3109.7332157.10001.2_0.0.0.0&from=tejiawap
   * 变为
   * http://h5.m.taobao.com/awp/core/detail.htm?id=39016567650&spm=a3109.7332157.10001.2_0.0.0.0&from=tejiawap
   */
    function parseUrl(url) {
      if(/a\.m\.taobao\.com/.test(url)) {
        var newUrl = "http://h5.m.taobao.com/awp/core/detail.htm?id=";
        var id = url.match(/i([\d]+)\.htm/);
        id = id ? id[1] : 0;
        var paramStr = url.substring(url.indexOf('?') + 1);
        return newUrl + id + '&' + paramStr;
      } else if(/taobao\.|tmall\.|juhuasuan\.|alibaba\.|1688\.|alipay\.|etao\.|1688\.|qua\.|aliqin\.|tbcdn\.|alicdn\.|alidemo\.|\d+\.\d+\.\d+\.\d+/i.test(url)) {
        return url;
      } else {
        return 'http://h5.m.taobao.com';
      }
    }

    function setDemoUrl(url) {
        var param = {};
        if(device) param.device = device;
        if(env) param.env = env;
        if(scale) param.scale = scale;
        var paramStr = $.param(param);

        var hashPos = url.indexOf('#'), hash = '';
        if(hashPos >= 0) {
            hash = url.substring(hashPos);
            url = url.substring(0,hashPos);
        }
        var oldParam = url.match(/\?([^#]*)/);
        oldParam = oldParam ? '&' + oldParam[1] : '';
        var src = '';
        //tms和cms跳过代理
        if(/tms\.taobao\.com|cms\.taobao\.com/.test(url)) {
          paramStr = paramStr && (url.indexOf('?') < 0 ? '?' : '&') + paramStr;
          src = url + paramStr + hash;
        } else {
          //为尽可能减少对原页面的影响 原页面的参数和hash全部带上
          paramStr = paramStr && '&' + paramStr;
          var proxy = /^mp\.m\.taobao\.com/.test(location.host)? 'market/proxy.php' : 'proxy.php';
          src = proxy + '?url=' + encodeURIComponent(url) + oldParam + paramStr + hash;
        }
        chgIframeSrc(src);
    }

    function chgIframeSrc(src) {
      //直接修改src会导致 history多记录一次 返回按钮功能bug
        // $('#J_Frame')[0].contentDocument.location.replace(src);
      //$('#J_Frame').attr('src', src);

      if(/wapp\.(waptest|wapa|m)/.test(location.host)) {
        //运行在wapp平台上
        var doc = $('#J_Frame')[0].contentDocument;
            
            window.iframeWin = $('#J_Frame')[0].contentWindow;

            $.jsonp({
                
                url: 'http://mp.m.taobao.net/' + src,
                success: function (data) {
                    doc.open();
                    doc.write(data.results);
                    doc.close();
            
 
                    var checkIframeExceptionInterval = setInterval(function () {
                            
                        try {
                                
                          var con = $('#J_Frame')[0].contentDocument;
                            
                        } catch (e) {
                            
                            clearInterval(checkIframeExceptionInterval);

                            var loginHost = location.host.replace('wapp','login');
 
                            window.location.assign('http://'+ loginHost +'/login.htm?tpl_redirect_url=' + encodeURIComponent(window.location.href));
                            
                        }
                            
                    }, 1000);
                    
                }
                
            });

      } else {
        //直接修改src会导致 history多记录一次 返回按钮功能bug
        $('#J_Frame')[0].contentDocument.location.replace(src);
      }
    }

    /**
     * getParam 分析url中query词是key的value
     * @param  {String} url [description]
     * @param  {String} key [description]
     * @return {Object}     {url: 返回后的url,value:key对应的值}
     */
    function getParam(url, key) {
        var reg = '/&' + key + '=([^&]+)/';
        var value = url.match(eval(reg));
        value = value ? value[1] : null;
        return value;
    }

    /**
     * delParam 在原url中删除该key value
     * @param  {String} url [description]
     * @param  {String} key [description]
     * @return     
     */
    function delParam(url, key) {
        var reg = '/&' + key + '=([^&]+)/';
        return url.replace(eval(reg), '');
    }

    /**
     * selectFilter 根据device和env选中相应的筛选器
     * @param  {String} device 
     * @param  {String} env    
     * @return {void}        
     */
    function selectFilter() {
        var selectItem = $('#J_Fliter dl'), selectedCls = 'selected';
        if(device) {
          $(selectItem[0]).find('dd span').removeClass(selectedCls).each(function(idx, item){
                if($(item).attr('data-name') == device) {
                    $(item).addClass(selectedCls);
                }
            });
        }
        if(env) {
          $(selectItem[1]).find('dd span').removeClass(selectedCls).each(function(idx, item){
                if($(item).attr('data-name') == env) {
                    $(item).addClass(selectedCls);
                }
            });
        }
        if(scale) {
          $(selectItem[2]).find('dd span').removeClass(selectedCls).each(function(idx, item){
                if($(item).attr('data-name') == scale) {
                    $(item).addClass(selectedCls);
                }
            });
        }
        changeBg();
    }

    window.onhashchange = function(){
    	dealHash();
    }

    if($('#J_Form').length > 0) {
      $('#J_Form')[0].onsubmit = function(e){
        e.preventDefault();
        var iptValue = $.trim(document.getElementById('J_UrlTxt').value);
        setHash(iptValue);
      }
    }
    
    if($('#J_UrlTxt').length > 0) {
      $('#J_UrlTxt')[0].onclick = function(e) {
        this.select();
      };
    }

    $('#J_Frame')[0].onload = function() {
        try {
            var win = this.contentWindow,
            doc = this.contentDocument;
            if(!win) return;
            if(!win._hasBind) {
                var style = doc.createElement('style');
                style.innerHTML = "* {cursor:url('http://gtms02.alicdn.com/tps/i2/T1_PMSFLBaXXcu5FDa-20-20.png'),pointer !important;}";
                doc.body.appendChild(style);
                var js = doc.createElement('script');
                js.src = /test\.m\.taobao\.com/.test(location.host) ? 'src/inject.js' : 'http://groups.demo.taobao.net/kimi/preview/src/inject.js';
                doc.getElementsByTagName('head')[0].appendChild(js);
                new FingerBlast(doc, win);
                //初始化各种touch模拟
                var titleStr = doc.getElementsByTagName('title')[0]? doc.getElementsByTagName('title')[0].innerHTML:'';
                $('#J_Title').html(titleStr);
                //测试报告
                if('undefined' !== typeof Report) {
                  new Report(doc);
                }
                win._hasBind = true;
            }
        } catch(e) {
            console.log(e);
        }
     };

     /* 改变手机背景 */
     function changeBg() {
        $('#J_DemoWrap').removeClass().addClass('demo-wrap ' + (device ? device : 'iphone6') );
        $('#J_Navbar').removeClass().addClass('nav-bar ' + (env ? env : 'taobao'));
     }

     $('#J_Fliter').on('click', function(e) {
       	if(e.target.tagName.toUpperCase() != 'SPAN') return;
       	var tar = $(e.target);
       	var cls = 'selected';
       	tar.parent('dd').children().removeClass(cls);
       	tar.addClass(cls);
       	var selectedNodes = $(this).find('.' + cls);
       	var diviceArr = [];
       	$.each(selectedNodes, function(index, node){
       		diviceArr.push($(node).attr('data-name'));
       	});
       	
        device = diviceArr[0];
        env = diviceArr[1];
        scale = diviceArr[2];
        changeBg();
        //setScaleIpt();
        //更新demo地址        
        setHash(frameUrl);
     });

     

     /**
      * calcuScale 计算缩放比例值
      * @return {[type]} [description]
      */
     
     var viewportW = window.screen.width,
        viewportH = window.screen.height,
        ratio = window.devicePixelRatio;
    /**
     * iphone4 3.5 / Math.sqrt(Math.pow(960/2,2)+ Math.pow(640/2,2)) = 0060670333962134435
     * iphone5 4 / Math.sqrt(Math.pow(1136/2,2)+ Math.pow(640/2,2)) = 0.0061355466742597006
     * iphone6 4.7 / Math.sqrt(Math.pow(1334/2,2)+ Math.pow(750/2,2)) = 0.006142274425893552
     * iphone6plus 5.5 / Math.sqrt(Math.pow(1242/3,2)+ Math.pow(2208/3,2)) = 0.006513132410577474
     * sumsung 5.1 / Math.sqrt(Math.pow(1080/3,2)+ Math.pow(1920/3,2))  = 0.006945367561461252
     * chuizi 4.95 / Math.sqrt(Math.pow(1080/3,2)+ Math.pow(1920/3,2))  = 0.006741092044947686
     */
    var metaObj = {
      iphone4: {dpi: 0.0060670333962134435, ratio: 2},
      iphone5: {dpi: 0.0061355466742597006, ratio: 2},
      iphone6: {dpi: 0.006142274425893552, ratio: 2},
      iphone6plus: {dpi: 0.006513132410577474, ratio: 3},
      sketch: {dpi: 0.0061355466742597006, ratio: 2},
      sumsung: {dpi: 0.006945367561461252, ratio: 3},
      chuizi: {dpi: 0.006741092044947686, ratio: 3}
    };

      function guessSize() {
        var size = 22;
        var isMac = /Mac/i.test(window.navigator.platform);
        if (isMac) {
          switch(viewportW) {
            case 1920 :
            //imac 11
              size = 21.5;
              break;
            case 2560:
            //imac 27
              size = 27;
              break;
            case 1440:
              if(ratio == 2) {
                // mac pro 15寸
                size = 15.4;
              } else {
                //mac air 13寸
                size = 13.3;
              }
              break;
            case 1366:
            // mac air 11寸
              size = 11.6;
              break;
            case 1280:
            //mac pro 13寸
              size = 13.3;
              break;
            default:
              break;
          }
        } else {
          switch(viewportW) {
            case 1920: {
              size = 23;
              break;
            }
            case 1680: {
              size = 22;
               break;
            }
           case 1280: {
            size = 12.1;
            break;
           }
            case 1440: {
              size = 19;
              break;
            }
            case 1366: {
               size = 12.6;
               break;
            }
            default:
             break;
          }
        }
        return size;
      }

    function getSize() {
        return $('#J_SizeIpt')[0].value || getCookie('size') || guessSize();
    } 

     function setScale() {
      if(scale == 'one2x') {
        if(!device) device = 'iphone6';
        var pcDpi = getSize() / Math.sqrt(Math.pow(viewportW,2) + Math.pow(viewportH,2));
        var obj = metaObj[device];
        var zoom = obj.dpi / pcDpi;
        changeScale(zoom);
      } else {
        changeScale(1);
      }
     }

     function setScaleIpt() {
        var cls = 'hidden', sizeForm = $('#J_SizeForm');
        if(sizeForm.length == 0) return;
        if(scale == 'one2x') {
          sizeForm.removeClass(cls);
          sizeForm.find('#J_SizeIpt').attr('placeholder', '亲' + getSize() + '寸?如有误输入,如22');
        } else {
          sizeForm.addClass(cls);
        }
     } 

     if($('#J_SizeForm').length > 0) {
       $('#J_SizeForm')[0].onsubmit = function(e) {
        e.preventDefault();
        setScale();
        setCookie('size', getSize());
       }
     }
     function getCookie(name) {

      var cookie = document.cookie,
        reg = new RegExp('(?:^|;\\s*)' + unescape($.trim(name)) + '=([^;]*)'),
        match = cookie.match(reg);

      return match ? decodeURIComponent(match[1]) : undefined;

      }

      function setCookie(name, value, props) {
        props = props || {};
        var str = escape(name) + '=' + encodeURIComponent(value) + ';',
          exp = props['expires'],
          age = props['max-age'];
        if (exp) {
          props['expires'] = exp.toUTCString();
        }
        if (age) {
          props['max-age'] = age * 24 * 60 * 60;
        }
        document.cookie = str + toString(props, ['=', ';']);
      }

     function changeScale(r) {
      $('#J_DemoWrap').css('-webkit-transform','scale('+ r + ',' + r + ')');
     }

     function getHash(url) {
        var hash = url.match(/(#[^#]*)/);
        return hash? hash[1] : '';
     }

     function delHash(url) {
        var pos = url.indexOf('#');
        if(pos == -1) { 
          return url;
        } else {
          return url.substring(0, pos);
        }
     }

     function delAllParam(url) {
        var pos = url.indexOf('?');
        if(pos == -1) { 
          return url;
        } else {
          return url.substring(0, pos);
        }
     }

     function getDomain(url) {
        //url前面已经删除所有的参数、hash、http://了 ，直接继续删除目录就可以了
        return url.split('/')[0];
     }

    //处理模拟的a链接 禁止click 用mouseup模拟  因为模拟swipe会触发原生click
     $(document).on('emulateClick',function(e){
        //相对路径情况 dom取相对路径的href会把当前域地址补全 用getAttribute保持相对地址
        var url = e.tar.getAttribute('href'),
            frameSrc = document.getElementById('J_Frame').getAttribute('src');
            protocol = 'http://';

          if(!url || url.indexOf('javascript:') >= 0) {
            $(e.tar).trigger('tap');
            return;
          }

          if(url.indexOf('http://login.m.taobao.com/') >= 0) {
            chgIframeSrc(url);
            return;
          }
          // originUrl = http://h5.m.taobao.com/global/index.html#hash1;
          // ./detail.html?spm=a216z.7214833.3.1#!id=39855865769&rule=&type=surprise 相对当前目录 ./可以省略

          //var originUrl = decodeURIComponent(frameSrc.match(/\?url=([^&]+)&?/)[1]);
          var originUrl = frameUrl;
          // 去掉hash 去掉所有参数
          originUrl = delAllParam(delHash(originUrl)).replace(protocol, '');
           
          // 去掉原文件的文件名
          // http://h5.m.taobao.com/global/index.html ==》
          // http://h5.m.taobao.com/global
          var pos = originUrl.lastIndexOf('/'), originPath;
          if(pos === -1) {
            originPath = originUrl;
          } else {
            originPath = /\w+\.\w+/.test(originUrl.substring(pos+1)) ? originUrl.substring(0, pos) : originUrl;
          }

          //#hash
          if(url.indexOf('#') == 0) {
            url = protocol + originUrl + url;
          } else if(url.indexOf(protocol) == 0) {
            url = url;
          } else if(url.indexOf('../') == 0) {

            //多少个../ 往上 找多少个目录
            //var str = '../../../abc.php';
            var urlArr = url.split('../');
            var originUrlArr = originUrl.split('/'); //防止//被split
            var len = originUrlArr.length - urlArr.length;
            var newArr = [];
            for(var i = 0; i < len; i++) {
              newArr.push(originUrlArr[i]);
            }
            url = protocol + newArr.join('/') + '/' + urlArr[urlArr.length - 1];

          }else if(url.indexOf('/') == 0) {
            //相对目录
            // /demo
            url = protocol + getDomain(originPath) + url;
          } else {
            //剩下的相对当前目录 ./可以省略
            if(url.indexOf('./') == 0) {
              url.replace('./', '');
            }
            url = protocol + originPath + '/' + url;
          }
          setHash(url);
     });

    dealHash();
})();
    
