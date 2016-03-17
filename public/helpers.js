d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
};

//http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scale.category20();


function canDrillDown(d){
    //Hack taking advantage of the zip codes numeric properties, not good pratice
    return (d.targetLinks.length ===0)? (/^\d+$/.test(d.name))? false:true:false;
}

//Taking advantage of sorted order of the partition layout
function fetchPeers(data){
    var peers = [];
    var depth = (data[0])?data[0].depth:data.depth;
    // var depth = data[0].depth;
    for(var i=0; i<data.length; i++){
        if(depth === data[i].depth){
            peers.push(data[i]);
        }
    }
    return peers;
}  

getDepth = function (obj) {
    var depth = -1;
    //Stupid root offset again
    if(obj.length>1){
        obj = obj[0]
    }

    if (obj.children) {
        obj.children.forEach(function (d) {
            var tmpDepth = getDepth(d);
            if (tmpDepth > depth) {
                depth = tmpDepth;
            }
        });
    }
    return 1 + depth;
}; 
