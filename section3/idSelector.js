$('<div>', {html: 'this is a div', id:'div'}).appendTo('body');	//添加在body的末尾
console.log($('#div').jquery);		//2.0.3 jQuery构造函数原型对象的属性 被继承的属性
console.log($('#div').selector);	//#div jQuery构造函数实例对象的属性
console.log($('#div').context);		//document对象 jQuery构造函数实例对象的属性
console.log($('#div')[0]);			//id为div的div元素 jQuery构造函数实例对象的属性
console.log($('#div').length);		//1
console.log($('#div'));				//{0:div#div, context:document,selector:#div,length:1}


