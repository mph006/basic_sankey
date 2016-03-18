var fs = require('fs');
var csv = require("fast-csv");
var d3 = require('d3');

var allData = [];
//nice npm package that handles async data loading
//https://www.npmjs.com/package/fast-csv
csv.fromPath("../client_side/public/data/sankey.csv")
    .on("data", function(data){
        allData.push({
            session_id:data[0],
            duration:data[1],
            Completed_step1:data[2],
            Completed_step2:data[3],
            Completed_pmt:data[4],
            region_name:data[5],
            region_code:data[6],
            state_code:data[7],
            state_name:data[8],
            zip_code:data[9],
            city_name:data[10],
            lat:data[11],
            lng:data[12],
            state_quadrant:data[13],
            county_name:data[14],
        })
    })
    .on("end", function(){
        var nest = fetchNest(allData);
        var graph;
        stack = [];
        stack.push(nest[0]);
        while(stack.length!==0){
            var element = stack.pop();
            console.log(computeGraph(element));
            if(element.children!==undefined){
                for(var i=0; i<element.children.length; i++){
                    stack.push(element.children[element.children.length-i-1]);
                }
            }
            else{
            }
        }
    });


function fetchNest(data){

    function rollItUp(d){

        function fetchTarget(d){
            if(d["Completed_pmt"] === "Y"){return "Completed_Purchase";}
            else if(d["Completed_step2"] === "Y"){return "Checkout_Step_2";}
            else if(d["Completed_step1"] === "Y"){return "Checkout_Step_1";}
            else {return "Did_Not_Enter_Checkout"}
        }

        return {
            originalObject:d[0],
            length:d.length,
            target:fetchTarget(d[0])
        }
    }

    //http://bl.ocks.org/phoebebright/raw/3176159/
    var nest = d3.nest()
                    .key(function(d){return d.region_code})
                    .key(function(d){return d.region_name})
                    .key(function(d){return d.state_name})
                    .key(function(d){return d.state_quadrant})
                    .key(function(d){return d.county_name})
                    .key(function(d){return d.zip_code})
                    .rollup(function(leaves){
                        return rollItUp(leaves);
                    })
                    .entries(data);

    //Must partition with the default children set to values
    //And the value object to valuable rollups for the sankey
    var partition = d3.layout.partition()
                            .value(function(d){
                                return d.values.length
                            })
                            .children(function(d){
                                //console.log(d.values.originalObject);
                                //Know we hit a root node when it has an originalObject
                                //Has a duplicate assignment, values and children...watch out for that
                                return (d.values.originalObject)? null :d.values;
                            });

    //Dummy root node required for all hierarchial stuff
    return partition({key:"United States", values:nest});
    
}

//Taking advantage of sorted order of the partition layout
function fetchPeers(data){
    var peers = [];
    var depth = (data[0])?data[0].depth:data.depth;
    // var depth = data[0].depth;
    for(var i=0; i<data.length; i++){
        if(depth === data[i].depth){
            peers.push(data[i]);
        }
    }
    return peers;
}  

function traverseTree(data){

    var stack=[];
    //ToDo:: Make these keys more reusable and extensible
    var treeSummations = {
        Did_Not_Enter_Checkout:{
            count:0,
            duration_sum:0,
            avg_duration:0
        },
        Checkout_Step_1:{
            count:0,
            duration_sum:0,
            avg_duration:0
        },
        Checkout_Step_2:{
            count:0,
            duration_sum:0,
            avg_duration:0
        },
        Completed_Purchase:{
            count:0,
            duration_sum:0,
            avg_duration:0
        }
    }

    stack.push(data);

    while(stack.length!==0){
        var element = stack.pop();
        if(element.children!==undefined){
            for(var i=0; i<element.children.length; i++){
                stack.push(element.children[element.children.length-i-1]);
            }
        }
        else{
            var retObj = treeSummations[element.values.target];
            retObj["count"] += 1;
            retObj["duration_sum"] += +element.values.originalObject.duration;
            retObj["avg_duration"] = retObj["duration_sum"]/retObj["count"];
        }
    }

    return treeSummations;
}

function computeGraph(data){
    var graphArray = [];
    var names = [];
    var graph = {nodes:[],links:[]};

    if(data.children){
        for(var i=0; i<data.children.length; i++){
            graphArray.push(traverseTree(data.children[i]));
            //Again take advantage of array's sort property
            names.push(data.children[i].key)
        }

        for(var x=0; x<graphArray.length; x++){
            for(var key in graphArray[x]){
                if(graphArray[x].hasOwnProperty(key)){
                    graph.nodes.push({ "name": names[x] });
                    graph.nodes.push({ "name": key });
                    graph.links.push({ "source": names[x],
                            "target": key,
                            "value": +graphArray[x][key].count });
                }
            }
        }
    
        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
        .key(function (d) { return d.name; })
        .map(graph.nodes));

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        //now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
        });

        return graph; 
    }
    return null;  
}

 // fs.writeFile('./data/tree.json',JSON.stringify(nest),function(err){
 //            if(err){
 //                console.log(err)
 //            }
 //        });