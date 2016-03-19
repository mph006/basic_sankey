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

function updateBreadcrumbs() {
  b.w = (document.getElementById("breadcrumb-wrapper").offsetWidth/(maxDepth))-10;

  var labelText = fetchParentName();
  var depth = getDepth();

  console.log("appending: "+labelText +" at: "+depth)
  var crumb = d3.select("#trail")
      .append("g").attr("class","crumb-wrapper").attr("id","crumb-wrapper-"+(depth-1))
      .on("click",function(){return clickedTrail(this,labelText);})


  crumb.append("polygon")
      .attr("points",breadcrumbPoints)
      .style("fill",function(){
        return color(labelText.replace(/ .*/, ""));
      });

  crumb.append("text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("class","breadcrumb-text")
      .text(function(){
        return (labelText.length <40)?labelText:labelText.substring(0,35)+"..."
      })
  

  crumb.attr("transform", function() {
    //-2 needed for the length property of arrays and the root node "fakeness"
    return "translate(" + (depth-1) * (b.w + b.s) + ", 0)";
  });

}

function initializeBreadcrumbTrail() {
  var trail = d3.select("#breadcrumb-wrapper").append("svg:svg")
      .attr("width",document.getElementById("breadcrumb-wrapper").offsetWidth)
      .attr("height",document.getElementById("breadcrumb-wrapper").offsetHeight)
      .attr("id", "trail");
}