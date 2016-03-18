var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var path = require('path');

app.set('port', process.env.PORT || 8088);
app.use(express['static'](path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});


// app.get('/',function(req,res){
//     fetchResearchers(function(researchers){
//         res.send(researchers);
//     });
// });


// app.post('/enteredTime',function(req,res){
//     inputTimeData(req.body,function(update,data){
//         res.send({"update":update,"data":data});
//     });
// });