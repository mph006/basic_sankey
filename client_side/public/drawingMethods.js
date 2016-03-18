function updateSankey(graph){
    // reset the sankey diagram properties
    sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(8)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    var path = sankey.link();

    //Pseudo enter/update/exit pattern here
    d3.select("#sankey-wrapper-svg")
        .selectAll(".link")
        .transition()
        .duration(animDuration)
        .style("stroke-width","0");

    d3.select("#sankey-wrapper-svg")
        .selectAll(".node-wrapper")
        .selectAll(".node-rect")
        .transition()
        .duration(animDuration)
        .attr("height", 0)
        .attr("width",0);

    d3.select("#sankey-wrapper-svg")
        .selectAll(".node-wrapper")
        .selectAll(".node-name")
        .transition()
        .duration(animDuration)
        .style("opacity", 0);
        
    d3.select(".links").transition().duration(animDuration).remove();
    d3.select(".nodes").transition().duration(animDuration).remove().each('end',function(){
        appendElementsToDom(d3.select("#sankey-wrapper-svg"),sankey,path);
    });
    console.log(root);
    d3.select("#sankey-title")
    .text(function(){
        //Stupid root node issue once more
        var updateText = (root.key)?root.key:root[0].parent.key
        return "Checkout Conversions: "+updateText
    })

}

function appendElementsToDom(svg,sankey,path){

    var link = svg.append("g").attr("class","links")
                .selectAll(".link")
                .data(graph.links)
                .enter().append("path")
                .attr("class", "link")
                .attr("d", path)
                .sort(function(a, b) { return b.dy - a.dy; })
                .transition().duration(animDuration)
                .style("stroke-width", function(d) { return Math.max(1, d.dy); });

    // add the link titles
    svg.selectAll(".link").append("title")
        .attr("class","link-title")
        .text(function(d) {
            //Stupid root issue again
            var total = (root.value)? root.value:root[0].parent.value;
            var levelName = (root.key)? root.key: root[0].parent.key;
            console.log(d,d.value, total, root);
            return d.source.name + " → " + d.target.name.split("_").join(" ") + "\n" 
                    + format(d.value) + "\n" 
                    +((d.value/total)*100).toFixed(2) +"% of "+levelName+" "+units; 
        });

    // add in the nodes
    var node = svg.append("g")
        .attr("class","nodes")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node-wrapper")
        .style("cursor",function(d){
            return (canDrillDown(d))?"pointer":"default"
        })
        .on("click",function(d){
            if(canDrillDown(d)){return drillDown(d);}
        })
        .on("mouseover",mouseOverNode)
        .on("mouseout", mouseOutNode)
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        })
        .style("opacity",0)
        .transition().duration(animDuration)
        .style("opacity",1);

    // add the rectangles for the nodes
    svg.selectAll(".node-wrapper").append("rect")
        .attr("class","node-rect")
        .style("fill", function(d) { 
            return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); 
        })
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth());

    // add in the title for the nodes
    svg.selectAll(".node-wrapper").append("text")
        .attr("class","node-name")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name.split("_").join(" "); })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
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
        .nodePadding(8)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    var path = sankey.link();
    appendElementsToDom(svg,sankey,path)
    // add in the links
    
}