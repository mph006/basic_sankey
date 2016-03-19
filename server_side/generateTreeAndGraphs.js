var fs = require('fs');
var csv = require("fast-csv");
// var d3 = require('d3');
var fetchNest = require('./fetchNest.js').fetchNest;
var computeGraph = require('./computeGraph.js').computeGraph;

var allData = [];
//nice npm package that handles async data loading
//https://www.npmjs.com/package/fast-csv
csv.fromPath("../client_side/public/data/sankey.csv", {headers:true})
    .on("data", function(data){
        allData.push({
            session_id:data.session_id,
            duration:data.duration,
            Completed_step1:data.Completed_step1,
            Completed_step2:data.Completed_step2,
            Completed_pmt:data.Completed_pmt,
            region_name:data.region_name,
            region_code:data.region_code,
            state_code:data.state_code,
            state_name:data.state_name,
            zip_code:data.zip_code,
            city_name:data.city_name,
            lat:data.lat,
            lng:data.lng,
            state_quadrant:data.state_quadrant,
            county_name:data.county_name,
            basket_price:data.basket_price
        })
    })
    .on("end", function(){
        var nest = fetchNest(allData);
        var graph;
        stack = [];
        stack.push(nest[0]);
        while(stack.length!==0){
            var element = stack.pop();

            var saveGraph = computeGraph(element);
            if(saveGraph!==null){writeObj(saveGraph);}

            if(element.children!==undefined){
                for(var i=0; i<element.children.length; i++){
                    stack.push(element.children[element.children.length-i-1]);
                }
            }
        }
    });


function writeObj(obj){
    fs.writeFile('../client_side/public/data/sankey_data/'+obj.keyPath+'.json',JSON.stringify(obj,null,2),function(err){
        if(err){console.log(err)}
    });
}


// //Taking advantage of sorted order of the partition layout
// function fetchPeers(data){
//     var peers = [];
//     var depth = (data[0])?data[0].depth:data.depth;
//     // var depth = data[0].depth;
//     for(var i=0; i<data.length; i++){
//         if(depth === data[i].depth){
//             peers.push(data[i]);
//         }
//     }
//     return peers;
// }  




 // fs.writeFile('./data/tree.json',JSON.stringify(nest),function(err){
 //            if(err){
 //                console.log(err)
 //            }
 //        });