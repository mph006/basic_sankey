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