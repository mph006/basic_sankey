var d3 = require('d3')

module.exports = {
    fetchNest: function(data){

        //http://bl.ocks.org/phoebebright/raw/3176159/
        var nest = d3.nest()
                        .key(function(d){return d.region_code})
                        .key(function(d){return d.region_name})
                        .key(function(d){return d.state_name})
                        .key(function(d){return d.state_quadrant})
                        .key(function(d){return d.county_name})
                        .key(function(d){return d.zip_code})
                        .rollup(function(leaves){
                            return rollItUp(leaves);
                        })
                        .entries(data);

        //Must partition with the default children set to values
        //And the value object to valuable rollups for the sankey
        var partition = d3.layout.partition()
                                .value(function(d){
                                    return d.values.length
                                })
                                .children(function(d){
                                    //console.log(d.values.originalObject);
                                    //Know we hit a root node when it has an originalObject
                                    //Has a duplicate assignment, values and children...watch out for that
                                    return (d.values.originalObject)? null :d.values;
                                });

        //Dummy root node required for all hierarchial stuff
        return partition({key:"United States", values:nest});
        
    }
}

//Private
function rollItUp(d){

            function fetchTarget(d){
                if(d["Completed_pmt"] === "Y"){return "Completed_Purchase";}
                else if(d["Completed_step2"] === "Y"){return "Checkout_Step_2";}
                else if(d["Completed_step1"] === "Y"){return "Checkout_Step_1";}
                else {return "Did_Not_Enter_Checkout"}
            }

            return {
                originalObject:d[0],
                length:d.length,
                target:fetchTarget(d[0])
            }
        }