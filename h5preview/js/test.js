/**
 * Created by yuxiu on 15/7/7.
 */
var $frame = $('#J_Frame');
var host = location.host;
$frame[0].onload = function(e){
    if($frame[0].src.indexOf(host) == -1)
        return;
    var doc = this.contentDocument;
    var win = this.contentWindow;
    var style = doc.createElement('style');
    style.innerHTML = "* {cursor:url('http://gtms02.alicdn.com/tps/i2/T1_PMSFLBaXXcu5FDa-20-20.png'),pointer !important;}";
    doc.body.appendChild(style);
    new FingerBlast(doc, win);
};

// 对iframe的a单独侦听点击事件，取消默认，在URL后面加锚点
document.addEventListener('emulateClick',function(e){
    e.preventDefault();
    var url = location.href,aLink;
    url = url.slice(0,url.indexOf('#'));
    aLink = e.tar;
    if(aLink.href.indexOf('javascript:') == -1 || !aLink.href){
        location.href = url + '#url=' + aLink.href;
        $frame.attr('src',aLink.href);
    }
},false);

$('.edit').click(function(){
   location.href = '/';
   localStorage.setItem('referrer','preview');
});