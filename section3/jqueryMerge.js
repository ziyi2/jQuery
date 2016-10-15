

// $('<li>1</li><li>2</li>').appendTo('ul'); //添加成功

// //$('<li>1</li><li>2</li>')当然要变成如下格式,然后才能调用appendTo方法去处理
// //和前面的$().css()方法如出一辙

// /**
//  * this = {
//  * 	0:'li',
//  * 	1:'li',
//  * 	length: 2
//  * }
//  */


// //jQuery.parseHTML 把字符串转成节点数组
// //参数3个
// //1.str字符串
// //2.指定根节点
// //3:true or false

// var str = '<li>3</li><li>4</li><script>alert(4)<\/script>'; //字符串 </script>需要注意,需要转义
// // var arr = jQuery.parseHTML(str,document);	//不会弹alert script标签不被添加
// var arr = jQuery.parseHTML(str,document,true);	//弹alert script标签被添加
// console.log(arr);

// *
//  * [
//  * 		0: li,	//变成DOM中的li节点了 	
//  * 		1: li,
//  * 		2: script,
//  * 		length:3
//  * ]
//  * 
 

// $.each(arr,function(i) {
// 	$('ul').append(arr[i]);	//添加成功
// });


// //jQuery.parseHTML返回的是数组,但是最终在$('<li>1</li><li>2</li>')中我们发现需要的是转成json格式的this对象
// //于是jQuery.merge起作用啦

// var a = [1,2],
// 	b = [3,4];
	
// console.log($.merge(a,b));		//[1,2,3,4] 对外是数组合并的功能

// var json = {	//类数组对象
// 	0: 1,
// 	1: 2,
// 	length:2
// };

// var arr = [3,4];
// console.log($.merge(json,arr));	//将json和数组合在了一起 源代码中的this就是json格式

// /**
//  *  {	
// 	0: 1,
// 	1: 2,
// 	2: 3,
// 	3: 4
// 	length:4
// };
//  */


















