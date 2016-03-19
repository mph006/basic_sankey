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

function canDrillDown(d){
    //Hack taking advantage of the zip codes numeric properties, not good pratice
    return (d.targetLinks.length ===0)? (/^\d+$/.test(d.name))? false:true:false;
}

//http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function getDepth(){
    //Length -1 for length counting difference
    return (keyPath.split("->").length-1)
}; 

function fetchParentName(){
    var split = keyPath.split("->");
    return (split.length ===1)?
        "United States":
        split[split.length-1].replaceAll("_"," ");
}

function fetchGraphAndUpdate(path,isFirstTime){
    $.ajax({
        method: "POST",
        data:{path:path.replaceAll(" ","_")},
        url: '/fetchGraph'
    }).done(function(graph) {
        //Must init the svg space
        if(isFirstTime){
            keyPath = path;
            drawSankey(graph)
        }
        //Must animate new stuff in/out
        //Rollup situation, dont want to re-draw breadcrumbs
        else if(keyPath.length > path.length){
            keyPath = path;
            updateSankey(graph);
        }
        else{
            keyPath = path;
            updateSankey(graph)
            updateBreadcrumbs();
        }
        
    }).fail(function(err) {
        console.log(err)
    });

    
}
