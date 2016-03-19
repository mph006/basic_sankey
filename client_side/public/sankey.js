
// queue()
//     .defer(d3.csv,"./data/sankey.csv")
//     .await(ready);

$( document ).ready(function() {
    initializeBreadcrumbTrail();
    keyPath="United_States"
    fetchGraphAndUpdate(keyPath,true);
});