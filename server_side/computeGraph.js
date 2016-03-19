var d3 = require('d3');
var traverseTree = require('./traverseTree.js').traverseTree;

module.exports = {
	computeGraph: function(data){
		var graphArray = [];
		var names = [];
		var path = fetchPath(data);
		var graph = {keyPath:path,nodes:[],countLinks:[], priceLinks:[]};
		if(!data.children){return null;}

	    for(var i=0; i<data.children.length; i++){
	        graphArray.push(traverseTree(data.children[i]));
	        //Again take advantage of array's sort property
	        names.push(data.children[i].key)
	    }

	    for(var x=0; x<graphArray.length; x++){
	        for(var key in graphArray[x]){
	            if(graphArray[x].hasOwnProperty(key)){
	                graph.nodes.push({ "name": names[x] });
	                graph.nodes.push({ "name": key });
	                graph.countLinks.push({ "source": names[x],
	                        "target": key,
	                        "value": +graphArray[x][key].count });
	               	graph.priceLinks.push({ "source": names[x],
	                        "target": key,
	                        "value": +graphArray[x][key]["price_sum"] });
	            }
	        }
	    }

	    // return only the distinct / unique nodes
	    graph.nodes = d3.keys(d3.nest()
	    .key(function (d) { return d.name; })
	    .map(graph.nodes));

	    // loop through each link replacing the text with its index from node
	    graph.countLinks.forEach(function (d, i) {
	    	graph.countLinks[i].source = graph.nodes.indexOf(graph.countLinks[i].source);
	    	graph.countLinks[i].target = graph.nodes.indexOf(graph.countLinks[i].target);
	    });

	    graph.priceLinks.forEach(function (d, i) {
	    	graph.priceLinks[i].source = graph.nodes.indexOf(graph.priceLinks[i].source);
	    	graph.priceLinks[i].target = graph.nodes.indexOf(graph.priceLinks[i].target);
	    });

	    //now loop through each nodes to make nodes an array of objects
	    // rather than an array of strings
	    graph.nodes.forEach(function (d, i) {
	    graph.nodes[i] = { "name": d };
	    });

	    return graph; 
	}
}
//http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function fetchPath(data){
	var returnString = [];
	var pointer = data
	while(pointer.parent){
		returnString.unshift(pointer.key.replaceAll(" ","_"));
		pointer = pointer.parent;
	}
	returnString.unshift("root")
	return returnString.join("->");
}