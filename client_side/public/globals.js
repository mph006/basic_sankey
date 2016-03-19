var sankey, 
	width, 
	height, 
	maxDepth=5,
	animDuration=1000, 
	units="Transactions",
	color = d3.scale.category20(),
	b = {w: 300, h: 30, s: 3, t: 10},
	keyPath;

var formatNumber = d3.format(",.0f");   // zero decimal places
var format = function(d) { return formatNumber(d) + " " + units; };