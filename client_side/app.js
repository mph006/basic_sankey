var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var path = require('path');
var dataPath = '/public/data/sankey_data/';
app.set('port', process.env.PORT || 8088);
app.use(express['static'](path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

app.post('/fetchGraph',function(req,res){
	//console.log(__dirname + dataPath + req.body.path + ".json")
    res.sendFile(__dirname + dataPath + req.body.path + ".json",function(err){
        if(err){res.status(err.status).end();}
    });
});