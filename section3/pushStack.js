// $('<div>', {html: 'this is a div', class:'div'}).appendTo('body');	//添加在body的末尾
// $('<span>', {html: 'this is a span', class:'span'}).appendTo('body');	//添加在body的末尾

// console.log($('div').pushStack( $('span') ));


// $('div').pushStack( $('span') ).css('background','red');	//span变红 div没有
// //因为在栈中span在div上面

// $('div').pushStack( $('span') ).css('background','red').css('background','yellow');	//span变黄

// //{
// //	0: span,
// //	length: 1,
// //	context: document,
// //	prevObject: {
// //		0: div,
// //		length: 1,
// //		selector: "div",
// //		prevObject: {
// //			0: document,
// //			context: document,
// //			length: 1,
// //		}
// //	}
// //}


// console.log($('div').pushStack( $('span') ).css('background','red').prevObject);	//div
// console.log($('div').pushStack( $('span') ).css('background','red').context);		//document

// $('div').pushStack( $('span') ).css('background','red').prevObject.css('fontSize','100px');	//div的字体变了


// //如果仍然想使用栈的下一层div(上一层是span),end方法回溯栈其实就利用了prevObject属性
// $('div').pushStack( $('span') ).css('background','red').end().css('background','yellow');	//span红色,div黄色


