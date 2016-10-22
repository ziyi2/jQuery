


var arr = ['a','b','c'];

arr = $.map(arr,function(item,index) {
	return item + index;
});

console.log(arr);	//[a0,b1,c2]