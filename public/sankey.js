
queue()
    .defer(d3.csv,"./data/sankey.csv")
    .await(ready);

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

function ready(err,data){

    //Nest the data in hierarchial fashion
    var nest = fetchNest(data);
    graph = computeGraph(nest);
    drawSankey(graph);
    
};