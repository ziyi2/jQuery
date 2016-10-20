
$('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾
$('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾
$('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾

$('div').get(0).innerHTML = '1';	//第一个div改变了

//不传参数
console.log($('div'));			//this 类数组对象
console.log($('div').get());	//转成数组

//传入参数
console.log($('div').get(0));	//第一个div