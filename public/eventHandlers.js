function drillDown(d){
    if(d.name === "All"){
        root = root.children;
    }
    else{
        root = fetchRoot(d,root);        
    }

    graph = computeGraph(root);
    //http://stackoverflow.com/questions/13603832/sankey-diagram-transition
    updateSankey(graph);
}