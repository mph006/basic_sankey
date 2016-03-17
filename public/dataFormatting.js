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