function updateSankey(graph){
    // reset the sankey diagram properties

    var thresh = d3.scale.threshold().domain([6,15,20,50]).range([100,50,25,10,0])
    nodePadding = thresh(graph.nodes.length);

    sankey = d3.sankey()
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.countLinks)
        .layout(sankeyIterations);

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
        appendElementsToDom(d3.select("#sankey-wrapper-svg"),sankey,path,graph);
    });
    //console.log(root);
    d3.select("#sankey-title")
    .text(function(){
        var name = (fetchParentName()==="root")?"All Conversions":fetchParentName();
        return "Checkout Conversions: "+name;
    })

}

function appendElementsToDom(svg,sankey,path,graph){
    var countTotal = 0;

    graph.countLinks.forEach(function(x){
        countTotal += x.value;
    })

    var link = svg.append("g").attr("class","links")
                .selectAll(".link")
                .data(graph.countLinks)
                .enter().append("path")
                .attr("class", "link")
                .attr("d", path)
                .attr("id",function(d){
                    return "link-from-"+d.region.replaceAll(" ","_")
                })
                .on("mouseenter",mouseEnterLink)
                .on("mouseleave",mouseLeaveLink)
                .sort(function(a, b) { return b.dy - a.dy; })
                .transition().duration(animDuration)
                .style("stroke",function(d){
                    return d.color = locationColors(d.region.replace(/ .*/, ""));
                })
                .style("stroke-width", function(d) { return Math.max(1, d.dy); });

    // add the link titles
    svg.selectAll(".link").append("title")
        .attr("class","link-title")
        .text(function(d) {
            var name = (fetchParentName()==="root")?"United States":fetchParentName();

            return  "User From: "+d.region+"\n"+
                    "Path: "+d.source.name + " → " + d.target.name.split("_").join(" ") + "\n" 
                    + format(d.value) + "\n" 
                    +((d.value/countTotal)*100).toFixed(2) +"% of "+name+" "+units; 
        });

    // add in the nodes
    var node = svg.append("g")
        .attr("class","nodes")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node-wrapper")
        .attr("id",function(d){
            return "node-wrapper-"+d.name.replaceAll(" ","_");
        })
        .style("cursor",function(d){
            return (canDrillDown(d))?"pointer":"move"
        })
        .call(

            d3.behavior.drag().origin(function(d){return d;})
            .on("dragstart", function() {
               // console.log(d3.event.defaultPrevented);
                d3.select(this).moveToFront();
            })
            .on("drag", function (d) {
                // if(canDrillDown(d)){return;}
                d3.select(this).attr("transform", 
                    "translate(" + (d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))) + "," + 
                        (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
                sankey.relayout();
                svg.selectAll(".link").attr("d", path);
            })
        )
        .on("dblclick",function(d){
            if(canDrillDown(d)){return drillDown(d);}
        })
        .on("mouseenter",function(d){mouseEnterNode(d)})
        .on("mouseleave", function(d){mouseLeaveNode(d)})
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
            return(nonRegions.indexOf(d.name)===-1)?
                        d.color = locationColors(d.name.replace(/ .*/, "")):
                        d.color = flowColors(d.name);
        })
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
        .nodeWidth(nodeWidth)
        .nodePadding(100)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.countLinks)
        .layout(sankeyIterations);

    var path = sankey.link();
    appendElementsToDom(svg,sankey,path,graph)
    // add in the links
    
}