function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  points.push(b.t + "," + (b.h / 2));

  return points.join(" ");
}

function updateBreadcrumbs(element) {
  b.w = (document.getElementById("breadcrumb-wrapper").offsetWidth/(maxDepth))-10;
  //Take the root off, its redundant to list it
  //nodeArray = nodeArray.slice(1,nodeArray.length);

  //Stupid root issue again
  if(element.length >20){
    // element = element[0];
    return;
  }

  else if(element.length >0){
    element = element[0].parent;
    var i=0;
  }

  else{
    element = element;
    var i = element.depth;
  }

  var crumb = d3.select("#trail")
      .append("g").attr("class","crumb-wrapper").attr("id","crumb-wrapper-"+element.depth)
      .on("click",function(){return clickedTrail(this,element);})
      // .on("mouseover",mouseOverBreadcrumb)
      // .on("mouseout",mouseOutBreadcrumb);

  crumb.append("polygon")
      .attr("points",breadcrumbPoints)
      .style("fill",function(){
        return color(element.key.replace(/ .*/, ""));
      });

  crumb.append("text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("class","breadcrumb-text")
      .text(element["key"])
  

  crumb.attr("transform", function() {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

}

function initializeBreadcrumbTrail() {
  var trail = d3.select("#breadcrumb-wrapper").append("svg:svg")
      .attr("width",document.getElementById("breadcrumb-wrapper").offsetWidth)
      .attr("height",document.getElementById("breadcrumb-wrapper").offsetHeight)
      .attr("id", "trail");
}