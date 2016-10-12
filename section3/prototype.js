// function jQuery() {
// 	return new jQuery.prototype.init();			//jQuery.prototype = jQuery.fn
// 	//类似于return new jQuery();
// }

// jQuery.prototype.init = function() {
// 	//暂时没有初始化的内容
// 	alert('init');
// }

// jQuery.prototype.css = function() {
// 	alert('css');
// }

// jQuery.prototype.init.prototype = jQuery.prototype;	//jQuery.prototype.init = jQuery

// jQuery().css();	//init css 
// //jQuery()返回jQuery实例的同时进行初始化?
// //jQuery()类似于var a = new A(); a.init(); 两步操作