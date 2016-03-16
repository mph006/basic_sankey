
var root, sankey,width,height;
var animDuration =1000;
var units = "Transactions";

queue()
    .defer(d3.csv,"./data/sankey.csv")
    .await(ready);

function canDrillDown(d){
    //Hack taking advantage of the zip codes numeric properties, not good pratice
    return (d.targetLinks.length ===0)? (/^\d+$/.test(d.name))? false:true:false;
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
        step0:{
            count:0,
            duration_sum:0,
            avg_duration:0
        },
        step1:{
            count:0,
            duration_sum:0,
            avg_duration:0
        },
        step2:{
            count:0,
            duration_sum:0,
            avg_duration:0
        },
        complete:{
            count:0,
            duration_sum:0,
            avg_duration:0
        }
    }

    // var peers = fetchPeers(data);
    // console.log(peers);
    // for(var i=0; i<peers.length; i++){
    //     if(peers.children){
    //         for(var j=0; j<peers[i].children.length; j++){
    //             stack.push(peers[i].children[j]);
    //         }  
    //     }
    //     //Were at a leaf
    //     else{
    //         stack.push(peers[i]);
    //     }
    // }

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

    //ToDo:: Fix the stupid root node issue, or clean this up somehow

    //Handling stupid root special case
    if(data[0]&& data[0].key =="All"){
        root = data[0];
        var peers = fetchPeers(data);
        
        for(var i=0; i<peers.length; i++){
            graphArray.push(traverseTree(peers[i]));
            //Again take advantage of array's sort property
            names.push(peers[i].key)
        }
    }
    //Cleaning up root special case
    else if(root[0] && root[0].depth ===1){
        var peers = fetchPeers(data);
        for(var i=0; i<peers.length; i++){
            graphArray.push(traverseTree(peers[i]));
            //Again take advantage of array's sort property
            names.push(peers[i].key)
        }
    }
    //handling everything normally
    else{

        for(var i=0; i<root.children.length; i++){
            graphArray.push(traverseTree(root.children[i]));
            //Again take advantage of array's sort property
            names.push(root.children[i].key)
        }
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

function fetchRoot(d,thisRoot){

    for(var i=0; i<thisRoot.length; i++){
        if(thisRoot[i].key === d.name){
            return thisRoot[i];
        }
    }
    //Handling stupid root issue once more
    for(var j=0; j<thisRoot.children.length; j++){
        if(thisRoot.children[j].key === d.name){
            return thisRoot.children[j];
        }
    }
}

function updateSankey(graph){
    // Set the sankey diagram properties
    sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    var path = sankey.link();

    // add in the links
    // var link = svg.append("g").selectAll(".link")
    //             .data(graph.links)
    //             .enter().append("path")
    //             .attr("class", "link")
    //             .attr("d", path)
    //             .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    //             .sort(function(a, b) { return b.dy - a.dy; });

    var link = d3.selectAll(".link").data(graph.links);
    
    link.transition().duration(animDuration)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.enter()
        .append("path")
        .attr("class", "link")
        .attr("d", path)
        .transition().duration(animDuration)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.exit().remove();

    // // add the link titles
    // link.append("title")
    //     .text(function(d) {
    //         return d.source.name + " → " + d.target.name + "\n" + format(d.value); 
    //     }).attr("class","link-title");

    // // add in the nodes
    // var node = svg.append("g").selectAll(".node")
    //     .data(graph.nodes)
    //     .enter().append("g")
    //     .attr("class", "node")
    //     .attr("transform", function(d) { 
    //         return "translate(" + d.x + "," + d.y + ")"; 
    //     })
    //     .style("cursor",function(d){
    //         return (canDrillDown(d))?"pointer":"default"
    //     })
    //     .on("dblclick",function(d){
    //         if(canDrillDown(d)){return drillDown(d);}
    //     });

    var node = d3.selectAll(".node").data(graph.nodes);
    console.log(node);
    node.on("dblclick",function(d){
            if(canDrillDown(d)){return drillDown(d);}
        })
        .style("cursor",function(d){
            return (canDrillDown(d))?"pointer":"default"
        })
        .transition().duration(animDuration)
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });

    node.enter().append("g")
        .attr("class", "node")
        .style("cursor",function(d){
            return (canDrillDown(d))?"pointer":"default"
        })
        .on("dblclick",function(d){
            if(canDrillDown(d)){return drillDown(d);}
        })
        .transition().duration(animDuration)
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });

    node.exit().remove();
    var rects = node.selectAll(".node-rect");

    rects.transition().duration(animDuration)
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
            return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); })

    // rects.enter().append("rect")
    //     .transition().duration(animDuration)
    //     .attr("height", function(d) { return d.dy; })
    //     .attr("width", sankey.nodeWidth())
    //     .attr("class","node-rect")
    //     .style("fill", function(d) { 
    //         return d.color = color(d.name.replace(/ .*/, "")); })
    //     .style("stroke", function(d) { 
    //         return d3.rgb(d.color).darker(2); });


    // // add the rectangles for the nodes
    // node.append("rect")
    //     .attr("height", function(d) { return d.dy; })
    //     .attr("width", sankey.nodeWidth())
    //     .attr("class","node-rect")
    //     .style("fill", function(d) { 
    //         return d.color = color(d.name.replace(/ .*/, "")); })
    //     .style("stroke", function(d) { 
    //         return d3.rgb(d.color).darker(2); })
    //     .append("title")
    //     .text(function(d) { 
    //         return d.name + "\n" + format(d.value); 
    //     })
    //     .attr("class","node-title");

    // // add in the title for the nodes
    // node.append("text")
    //     .attr("x", -6)
    //     .attr("y", function(d) { return d.dy / 2; })
    //     .attr("dy", ".35em")
    //     .attr("text-anchor", "end")
    //     .attr("transform", null)
    //     .text(function(d) { return d.name; })
    //     .filter(function(d) { return d.x < width / 2; })
    //     .attr("x", 6 + sankey.nodeWidth())
    //     .attr("text-anchor", "start")
    //     .attR("class","node-name");
}

function drillDown(d){
    if(d.name === "All"){
        root = root.children;
    }
    else{
        root = fetchRoot(d,root);        
    }

    graph = computeGraph(root);
    //d3.select("#sankey-wrapper-svg").remove();
    //To do, update sankey with the update pattern here
    //http://stackoverflow.com/questions/13603832/sankey-diagram-transition
    //drawSankey(graph);
    updateSankey(graph);
}


function fetchNest(data){

    function rollItUp(d){

        function fetchTarget(d){
            if(d["Completed_pmt"] === "Y"){return "complete";}
            else if(d["Completed_step2"] === "Y"){return "step2";}
            else if(d["Completed_step1"] === "Y"){return "step1";}
            else {return "step0"}
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
                    .key(function(d){return d.state_code})
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
    return partition({key:"All", values:nest});
    
}

function drawSankey(graph){

    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    width = document.getElementById('sankey-wrapper').offsetWidth - margin.left - margin.right;
    height = document.getElementById('sankey-wrapper').offsetHeight - margin.top - margin.bottom;

    // append the svg canvas to the page
    var svg = d3.select("#sankey-wrapper").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id","sankey-wrapper-svg")
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // Set the sankey diagram properties
    sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    var path = sankey.link();

    // add in the links
    var link = svg.append("g").selectAll(".link")
                .data(graph.links)
                .enter().append("path")
                .attr("class", "link")
                .attr("d", path)
                .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                .sort(function(a, b) { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " + d.target.name + "\n" + format(d.value); 
        }).attr("class","link-title");

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        })
        .style("cursor",function(d){
            return (canDrillDown(d))?"pointer":"default"
        })
        .on("dblclick",function(d){
            if(canDrillDown(d)){return drillDown(d);}
        });

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .attr("class","node-rect")
        .style("fill", function(d) { 
            return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { 
            return d.name + "\n" + format(d.value); 
        })
        .attr("class","node-title");

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start")
        .attr("class","node-name");
}


function ready(err,data){

    //Nest the data in hierarchial fashion
    var nest = fetchNest(data);
    graph = computeGraph(nest);
    drawSankey(graph);
    
};