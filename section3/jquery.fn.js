
// console.log($().jquery);		//版本号

// function A() {} //A构造函数
// var a = new A();
// console.log(A.prototype.constructor);	//function A() {} 
// //每个JavaScript函数(构造函数是特例)都拥有prototype属性
// //这个属性是一个对象,也就是原型对象,这个对象包含一个不可枚举属性constructor
// //指向拥有prototype属性的各自JavaScript函数(构造函数是特例)
// //当然prototype属性(对象)的任何方法都被该构造函数的实例所共有(继承)

// A.prototype.name = 'ziyi2';	//没有重写预定义的A.prototype对象
// console.log(A.prototype.constructor);	//function A() {} 

// A.prototype = {};			//A.prototype对象的引用发生了改变
// //新定义的原型对象的constructor不再指向原有对应的构造函数
// console.log(A.prototype.constructor);	//function Object() { [native code] }

// //补救措施
// A.prototype = {
// 	constructor: A  //显示设置构造函数反向引用
// };

// console.log(A.prototype.constructor);	//function A() {} 

