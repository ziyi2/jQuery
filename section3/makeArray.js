$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');	//添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');	//添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');	//添加在body的末尾

var arrDiv = document.getElementsByTagName('div');

console.log(arrDiv);	//获取的是一个类数组对象
//arrDiv.push();	//arrDiv.push is not a function
$.makeArray(arrDiv).push();	//转化成数组就可以调用了
console.log($.makeArray(arrDiv));	//数组

//但是$()构造函数返回的是this类数组对象,而不是数组
console.log($.makeArray(arrDiv,{length:0}));	//类数组对象