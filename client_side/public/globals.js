var root, 
	sankey, 
	width, 
	height, 
	maxDepth,
	rootNest,
	animDuration=1000, 
	units="Transactions",
	color = d3.scale.category20(),
	b = {w: 300, h: 30, s: 3, t: 10};

var formatNumber = d3.format(",.0f");   // zero decimal places
var format = function(d) { return formatNumber(d) + " " + units; };