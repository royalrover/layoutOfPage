/**
 * Created by yuxiu1 on 15/7/10.
 */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    bp = require('body-parser'),
    logger = require('morgan'),
    staticPath = require('static');
var router = require('./router').router;
var app = express();
//设置开发模式，production 和 development！！！
app.set('env','production');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname,'..')));
app.use(bp.json({limit: '50mb'}));
app.use(bp.urlencoded({limit: '50mb', extended: false,parameterLimit:50000 }));
app.use(router);
app.listen(9110,function(){
    console.log('node is listening...');
});
