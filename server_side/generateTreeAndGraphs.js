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
            basket_price:data.basket_price,
            country:data.country
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
            //if(saveGraph!==null){writeObj(saveGraph);}

            if(element.children!==undefined){
                for(var i=0; i<element.children.length; i++){
                    stack.push(element.children[element.children.length-i-1]);
                }
            }
        }
    });

//Hack function to give hierarchial sankey many steps or phases in a singular graph view
//Must connect path nodes to one another, instead of having a flat sankey
//Taking advantage of the fact that [1]=Dropped_Out, [2]=Step_1, [3] = Step_2, [4]=Completed_Pmt 
// function sankify(graph){
//     //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
//     var graphCopy = JSON.parse(JSON.stringify(graph));
//     console.log("Graph Count Links: ",JSON.stringify(graph.countLinks,null,2)+"\n");
//     var tmpGraph =[];
//     var targetIndex=2;
//     var sourceIndex=0;
//     tmpGraph.push(graphCopy.countLinks.pop())
//     while(targetIndex<5){
//         graphCopy.countLinks.forEach(function(d){
//             if(d.target>=targetIndex){
//                 tmpGraph.push({
//                     source:sourceIndex,
//                     target:targetIndex,
//                     value:d.value
//                 });
//             }
//             //Drop out the link
//             tmpGraph.push({
//                 source:targetIndex,
//                 target:1,
//                 value:d.value
//             });
//         });
//         graphCopy.countLinks.pop();
//         targetIndex++;
//         sourceIndex++;
//     }

//     console.log(tmpGraph);

//     //sankifyLinks(graphCopy.countLinks);
//     //sankifyLinks(graphCopy.priceLinks);
// }

// function sankifyLinks(links){
//     console.log(links);
// }

function writeObj(obj){
    fs.writeFile('../client_side/public/data/sankey_data/'+obj.keyPath+'.json',JSON.stringify(obj,null,2),function(err){
        if(err){console.log(err)}
    });
}
