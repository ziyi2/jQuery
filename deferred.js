

var dfd = $.Deferred();	//注意不是实例方法
 setTimeout(function(){
 	alert(1);
 	dfd.resolve();
 },1000);

 dfd.done(function() {
 	alert(2);
 })