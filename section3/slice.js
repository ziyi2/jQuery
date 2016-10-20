

// //[].slice(start,end)
// //返回一个新数组,该数组是原数组从tart到end(不包含该元素)的元素

// console.log([1,2,3].slice(1));	//[2,3] 省略后面的参数默认到数组末尾


// //转化类数组对象
// var toArray = function(json) {
// 	return [].slice.call(json);
// };

// var obj = {
// 	0: 1,
// 	1: 2,
// 	length: 2
// };


// console.log(toArray(obj)); //[1,2] 转化成了数组


// //转化NodeList

// $('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾
// $('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾
// $('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾

// console.log($('div'));  //json对象
// console.log($('div').toArray()); 	//[]对象

// console.log(toArray($('div')));	//[]对象











