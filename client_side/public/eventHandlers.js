function drillDown(d){
    if(d.name === "United States"){
        root = root.children;
    }
    else{
        root = fetchRoot(d,root);        
    }

    graph = computeGraph(root);
    updateBreadcrumbs(root);
    //http://stackoverflow.com/questions/13603832/sankey-diagram-transition
    updateSankey(graph);
}


function clickedTrail(htmlElement,d){

    //stupid off by one again
    root = (d.parent)?d.parent:rootNest;
    graph = computeGraph(root);
    var id = htmlElement.id.split("-");
    var index = +id.pop();
    for(var i=index; i<maxDepth; i++){
        d3.select("#crumb-wrapper-"+i)
            .transition()
            .duration(animDuration)
            .style("opacity","0")
            .remove();
    }
   
    updateSankey(graph);
}

function mouseOverNode(){
    if(d3.select(this)[0][0].style.cursor === "pointer"){
        d3.select(this).select("rect")
            .style("opacity",0.75)
    }

}

function mouseOutNode(){
    if(d3.select(this)[0][0].style.cursor === "pointer"){
    d3.select(this).select("rect")
        .style("opacity",1)
    }
}