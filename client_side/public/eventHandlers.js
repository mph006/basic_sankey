function drillDown(d){
    fetchGraphAndUpdate(keyPath+"->"+d.name.replaceAll(" ","_"),false);
}


function clickedTrail(htmlElement,d){
    
    var split = keyPath.split("->");
    split.splice(split.indexOf(d.replaceAll(" ","_")))

    var id = htmlElement.id.split("-");
    var index = +id.pop();

    for(var i=index; i<getDepth(); i++){
        d3.select("#crumb-wrapper-"+i)
            .transition()
            .duration(animDuration)
            .style("opacity","0")
            .remove();
    }
   
    fetchGraphAndUpdate(split.join("->"),false)
}

function mouseEnterLink(){
    d3.select(this).style("stroke-opacity",0.5);
}

function mouseLeaveLink(){
    d3.select(this).style("stroke-opacity",0.2);
}

//http://bl.ocks.org/Neilos/584b9a5d44d5fe00f779
function highlightConnected(g) {
    var sources = g.sourceLinks.filter(function (d) { return d.source === g; });
    sources.forEach(function(x){
       var id = "#"+x.source.name.replaceAll(" ","_")+"TO"+x.target.name.replaceAll(" ","_");
       d3.select(id).style("stroke-opacity",0.5);
    })
  }

function fadeAll() {
    d3.selectAll(".link").style("stroke-opacity",0.2);
}

function mouseEnterNode(d){

    var id = "#node-wrapper-"+d.name.replaceAll(" ","_");
    if(d3.select(id)[0][0].style.cursor === "pointer"){
        d3.select(id).select("rect")
            .style("opacity",0.75)
    }
    fadeAll();
    highlightConnected(d)

}

function mouseLeaveNode(d){
    var id = "#node-wrapper-"+d.name.replaceAll(" ","_");
    if(d3.select(id)[0][0].style.cursor === "pointer"){
    d3.select(id).select("rect")
        .style("opacity",1)
    }
    fadeAll();
}