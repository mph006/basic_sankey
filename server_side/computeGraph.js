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

	    //Loss of flow case
	    // for(var x=0; x<graphArray.length; x++){
	    //     for(var key in graphArray[x]){
	    //         if(graphArray[x].hasOwnProperty(key)){
	    //             graph.nodes.push({ "name": names[x] });
	    //             graph.nodes.push({ "name": key });
	    //             graph.countLinks.push({ 
	    //             		"source": names[x],
	    //                     "target": key,
	    //                     "value": +graphArray[x][key].count 
	    //             });
	    //            	graph.priceLinks.push({ 
	    //            			"source": names[x],
	    //                     "target": key,
	    //                     "value": +graphArray[x][key]["price_sum"] 
	    //             });
	    //         }
	    //     }
	    // }

	    //SUPER hackey, need to refactor
	    for(var x=0; x<graphArray.length; x++){
	     	var region = names[x]
	        graph.nodes.push({ "name": region});
	        graph.nodes.push({ "name": 'Dropped_Out' });
	        graph.nodes.push({ "name": 'Checkout_Step_1' });
	        graph.nodes.push({ "name": 'Checkout_Step_2' });
	        graph.nodes.push({ "name": 'Completed_Purchase' });

	        total = +(graphArray[x]['Dropped_Out'].count+graphArray[x]['Checkout_Step_1'].count+graphArray[x]['Checkout_Step_2'].count
	                            +graphArray[x]['Completed_Purchase'].count)

	        // From region node to dropout (does not enter checkout)
	        graph.countLinks.push({ 
	        		source: region,
	                target: 'Dropped_Out',
	                value: +graphArray[x]['Dropped_Out'].count,
	                region: region
	            });

	        total -= graphArray[x]['Dropped_Out'].count

	        graph.countLinks.push({ 
	        		source: region,
	                target: 'Checkout_Step_1',
	                value: total,
	                region:region 
	            });

	        graph.countLinks.push({ 
	        		source: 'Checkout_Step_1',
	                target: 'Dropped_Out',
	                value: +graphArray[x]['Checkout_Step_1'].count,
	                region:region
	            });

	        total -= graphArray[x]['Checkout_Step_1'].count

	        graph.countLinks.push({ 
	        		source: 'Checkout_Step_1',
	                target: 'Checkout_Step_2',
	                value: total,
	                region:region 
	            });

	        graph.countLinks.push({ 
	        		source: 'Checkout_Step_2',
	                target: 'Dropped_Out',
	                value: +graphArray[x]['Checkout_Step_2'].count,
	                region:region 
	            });

	        total -= graphArray[x]['Checkout_Step_2'].count

	        graph.countLinks.push({ 
	        		source: 'Checkout_Step_2',
	                target: 'Completed_Purchase',
	                value: +graphArray[x]['Completed_Purchase'].count,
	                region:region
	            });

	        // check here if total == cthe "completed_purchase"

	        //        graph.priceLinks.push({ source: names[x],
	        //             target: key,
	        //             value: +graphArray[x][key]["price_sum"] });}

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