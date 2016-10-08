/**
 * Created by yuxiu1 on 15/7/10.
 */
var express = require('express'),
    router = express.Router(),
    fs = require("fs"),
    path = require('path'),
    // https://github.com/andrewrk/node-multiparty/
    multiparty = require('multiparty');

var cwd = process.cwd();

router.get('/joyui/getJoyuis',function(req,res){
    var joyuis = fs.readdirSync(path.join(cwd,'joyuis'));
    var ret = {
        joyuis: []
    },basePath = path.join(cwd,'joyuis/');
    joyuis.forEach(function(joyui){
        ret.joyuis.push({
            name: joyui,
            script: '<script>' + fs.readFileSync(basePath + joyui + '/build/dist.min.js','utf8') + '</script>',
            template: fs.readFileSync(basePath + joyui + '/build/' + joyui + '.tmpl','utf8')
        });
    });
    res.end(JSON.stringify(ret));
});

router.get('/joyui/getDataConfig',function(req,res){
    var uiName = req.query.name;
    var dataPath = path.join(cwd,'joyuis',uiName,'data.json');
    res.end(JSON.stringify(require(dataPath)));
});

router.get('/joyui/getTemplate',function(req,res){
    var uiName = req.query.name;
    var dataPath = path.join(cwd,'joyuis',uiName,uiName + '.tmpl');
    if(fs.existsSync(dataPath)){
        res.end(fs.readFileSync(dataPath,'utf-8'));
    }else{
        res.end(JSON.stringify({
            success: 0
        }));
    }
});

router.post('/joyui/preview',function(req,res){
    var body = req.body.content;
    var title = req.body.title;
    var previewContent = fs.readFileSync(path.join(cwd,'h5preview/page/mobile.html'),'utf8');
    previewContent = previewContent.replace('{{stub}}',body);
    fs.writeFile(path.join(cwd,'h5preview/page/mobileRendered.html'),previewContent,function(err){
        if(err){
            res.end(JSON.stringify({success: 0}));
        }else{
            res.end(JSON.stringify({success: 1}));
        }
    });
});

router.post('/joyui/download',function(req,res){
    var body = req.body.content;
    var previewContent = fs.readFileSync(path.join(cwd,'dist/result.html'),'utf8');
    previewContent = previewContent.replace('{{stub}}',body);

    var fileName = 'resultRendered.html';
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-type', 'text/html');
    res.end(previewContent);
});

router.post('/joyui/publish',function(req,res){
    var body = req.body.content;
    var title = req.body.title;
    var exec = require('child_process').exec;
    var previewContent = fs.readFileSync(path.join(cwd,'dist/result.html'),'utf8');
    previewContent = previewContent.replace('{{stub}}',body).replace('{{title}}',title);
    var pathname = path.join(cwd,'h5preview/page/render.html');
    fs.writeFile(pathname,previewContent,function(err){
        if(err){
            res.end(JSON.stringify({success: 0}));
        }else{
            exec('scp '+pathname+' devuser@192.168.0.221:/usr/local/nginx/html/assets/f2e/activity/'+title+'.html');
            res.end(JSON.stringify({success: 1,url: 'http://assets.showjoy.net/activity/'+ title +'.html'}));
        }
    });
});

exports.router = router;
