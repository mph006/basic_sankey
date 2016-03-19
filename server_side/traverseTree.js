module.exports = {
	traverseTree: function(data){
	    var stack=[];
	    //ToDo:: Make these keys more reusable and extensible
	    var treeSummations = {
	        Did_Not_Enter_Checkout:{
	            count:0,
	            duration_sum:0,
	            avg_duration:0,
	            price_sum:0,
	            avg_price:0
	        },
	        Checkout_Step_1:{
	            count:0,
	            duration_sum:0,
	            avg_duration:0,
	            price_sum:0,
	            avg_price:0
	        },
	        Checkout_Step_2:{
	            count:0,
	            duration_sum:0,
	            avg_duration:0,
	            price_sum:0,
	            avg_price:0
	        },
	        Completed_Purchase:{
	            count:0,
	            duration_sum:0,
	            avg_duration:0,
	            price_sum:0,
	            avg_price:0
	        }
	    }

	    stack.push(data);

	    while(stack.length!==0){
	        var element = stack.pop();
	       // console.log(element);
	        if(element.children!==undefined){
	            for(var i=0; i<element.children.length; i++){
	                stack.push(element.children[element.children.length-i-1]);
	            }
	        }
	        else{
	            var retObj = treeSummations[element.values.target];
	            retObj["count"] += 1;
	            retObj["duration_sum"] += +element.values.originalObject.duration;
	            retObj["price_sum"] += +element.values.originalObject.basket_price;
	            retObj["avg_duration"] = retObj["duration_sum"]/retObj["count"];
	           	retObj["avg_price"] = retObj["price_sum"]/retObj["count"];
	        }
	    }
	    return treeSummations;
	}
}