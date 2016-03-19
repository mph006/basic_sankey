
// queue()
//     .defer(d3.csv,"./data/sankey.csv")
//     .await(ready);

$( document ).ready(function() {
    initializeBreadcrumbTrail();
    keyPath="root"
    fetchGraphAndUpdate(keyPath,true);
});