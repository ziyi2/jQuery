# jQuery2.0.3源码分析

## 1. 总体架构

``` javascript
(function(window， undefined) {
   [21~91]     : $自执行匿名函数的私有属性                
   [96~283]    : $jQuery对象的属性和方法           
   [285~347]   : $继承方法                 
   [349~817]   : $工具方法(静态方法)
   [877~2856]  : $复杂选择器Sizzle
   [2880~3042] : $回调对象
   [3043~3183] : $延迟对象
   [3484~3295] : $功能检测
   [3308~3652] : $数据缓存
   [3653~3797] : $队列管理
   [3803~4299] : $元素属性
   [4300~5182] : $事件操作
   [5140~6057] : $DOM操作
   [6058~6620] : $样式操作
   [6621~7854] : $ajax操作
   [7855~8584] : $运动方法
   [8585~8792] : $屏幕位置
   [8804~8821] : $模块化
   [8826]      : window.jQuery = window.$ = jQuery
})(window);
```

### 1. 1 自执行匿名函数

- 代码压缩
- 模块化
- 缩短作用域链

>内容解析

(一)、自执行匿名函数创建了特殊的函数作用域，该作用域的代码不会和匿名函数外部的同名函数冲突.
``` javascript
(function(){
	//局部函数
    function a() {
        alert('inner a');
    }
})();

//全局函数
function a() {
    alert('out a');
}
a();    //out a   
```

(二)、缩短作用域链

``` javascript
//访问局部变量window，不需要向上遍历作用域链，缩短查找时间，同时在压缩代码时局部变量window可被压缩
(function(window){
    window.a = 1;
    alert(a);
})(window);

//向上遍历到顶层作用域，访问速度变慢，全局变量window不能被压缩
(function(){
    window.a = 1;
    alert(a);
})();
```

(三)、`undefined`保证不被修改，可以被压缩，也可以缩短查找undefined的作用域链
``` javascript
 //自执行内部的undefined变量不会被外部的情况修改，低版本IE浏览器可以修改undefined的值
(function(window，undefined){
    alert(undefined); //undefined
})(window);
```

## 2.私有属性

### 2.1 rootjQuery

- 压缩
- 查找局部变量`rootjQuery`而不是执行`jQuery(document)`，提高代码性能

``` javascript
//[21~23]
var
	// A central reference to the root jQuery(document)
	rootjQuery，

//[865~866]
// All jQuery objects should point back to these
rootjQuery = jQuery(document);
```

>提示:  `rootjQuery`可以压缩，`jQuery(document)`不能被压缩.

### 2.2 readyList

``` javascript
//[25~26]
// The deferred used on DOM ready
readyList，
```

### 2.3 core_strundefined 

- 兼容性

``` javascript
//[28~30]
// Support: IE9
// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
core_strundefined = typeof undefined， //'undefined'字符串
```

>内容解析
``` javascript
window.a == undefined 				//并不是所有情况都兼容，xml节点不能判断 xmlNode
typeof window.a == 'undefined'		//所有情况兼容
```

### 2.4 window属性

- 压缩
- 缩短查找作用域链

``` javascript
//[32~35]
// Use the correct document accordingly with window argument (sandbox)
location = window.location，
document = window.document，
docElem = document.documentElement，
```

### 2.5 _变量

- 防冲突

``` javascript
[37~41]
// Map over jQuery in case of overwrite
_jQuery = window.jQuery，

// Map over the $ in case of overwrite
_$ = window.$，
```

>内容解析

``` javascript
<script>
	var $ = 'not jQuery'; //用户自定义或者第三方库的变量
</script>

<script src='Jquery2.0.3.js'></script>
//执行了_$ = window.$， 将用户或第三方的$变量内容存储下来，防止引用jQuery之前的变量冲突
<script>

</script>
```

### 2.6 class2type

- 空对象
- 类型
``` javascript
//[43~44]
// [[Class]] -> type pairs
class2type = {}，
```

### 2.7 core_deletedIds
- 空数组
``` javascript
//[46~47]
// List of deleted data cache ids， so we can reuse them
core_deletedIds = []，
```

### 2.8 core_version
- 字符串
- 版本号
``` javascript
//[49]
core_version = "2.0.3"，
```
### 2.9 数组、对象、字符串方法
- 压缩
- 缩短查找时间

```javascript
//[51~58]
// Save a reference to some core methods
core_concat = core_deletedIds.concat，
core_push = core_deletedIds.push，
core_slice = core_deletedIds.slice，
core_indexOf = core_deletedIds.indexOf，
core_toString = class2type.toString，
core_hasOwn = class2type.hasOwnProperty，
core_trim = core_version.trim，	//去除字符串的空格
```

### 2.10 jQuery(重点)

- 构造函数
- 原型
- 面向对象

``` javascript
//[60]
// Define a local copy of jQuery
jQuery = function( selector， context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector， context， rootjQuery );
}，
//[96]
jQuery.fn = jQuery.prototype = {
    // The current version of jQuery being used
    jquery: core_version，
    constructor: jQuery，
    init: function( selector， context， rootjQuery ) {}
    ...
}
//[282]
// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;
```

>内容解析

(一)、普通面向对象的编程方法
```
function Obj() {}
Obj.prototype.init = function(){
};

Obj.prototype.extend = function(){
};
var o = Obj();
o.init();		//首先需要初始化
o.css();		//然后才去做其他方法的工作，那么jQuery是这么做的？
```

(二)、`jQuery`的面向对象的编程方法

``` javascript
function jQuery() {
    return new jQuery.prototype.init();         //jQuery.prototype = jQuery.fn
    //类似于return new jQuery();
    //同时return new A()的形式让我们在创建实例时可以省略new，例如$('div')，而不是new $('div')
}
jQuery.prototype.init = function() {
    alert('init');
}
jQuery.prototype.css = function() {
    alert('css');
}
jQuery.prototype.init.prototype = jQuery.prototype; //jQuery.prototype.init = jQuery
jQuery().css(); //init css 
//jQuery()返回jQuery实例的同时进行初始化工作
//jQuery()类似于var a = new A(); a.init(); 两步操作
```

### 2.11 正则变量

``` javascript
//[66]
// Used for matching numbers
core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source，

// Used for splitting on whitespace
core_rnotwhite = /\S+/g，

// A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
// Strict HTML recognition (#11290: must start with <)
rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/，

// Match a standalone tag
rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/，

// Matches dashed string for camelizing
rmsPrefix = /^-ms-/，
rdashAlpha = /-([\da-z])/gi，
```

### 2.12  fcamelCase
- 回调函数
### 2.13  completed
- 回调函数


## 3. jQuery对象的属性和方法

为`jQuery`的原型添加方法和属性，这些方法和属性可以被`jQuery`的实例对象所使用.原型对象的属性会被实例对象继承，当然如果实例对象已经具备相应的属性，则会把原型对象的同名属性覆盖掉.

``` javascript
jQuery.fn = jQuery.prototype = {
    jquery:      版本号，
    constructor: 修正指向问题，
    init():      初始化和参数管理(构造函数)，
    selector:    实例化对象时的初始化选择器，
    length:      默认的Jquery对象的长度是0，
    toArray():   转数组(也可以是对外的实例方法)，
    get():       转原生集合，其实也是转成数组形式(对外方法)，
    pushStack(): jQuery对象的一个入栈处理(外部用的不多，内部用的对)，
    each():      遍历集合，
    ready():     DOM加载的接口，
    slice():     集合的截取，
    eq():        集合的第一项，
    last():      集合的最后一项，
    eq():        集合的指定项，
    map():       返回新集合，
    end():       栈回溯，可以看做popStack()，
    push():      (内部使用)，
    sort():      (内部使用)，
    splice():    (内部使用)
}
```

### 3.1 jquery属性

``` javascript
console.log($().jquery);    //2.0.3
```

### 3.2 constructor属性

```javascript
//[100]
constructor: jQuery，
```

>提示: 默认的构造函数的原型的`constructor`属性指向该构造函数，但是`constructor`属性很容易被修改.所以可以在原型对象的`constructor`属性中进行修正.

>内容解析

``` javascript
function Obj() {}
alert(Obj.prototype.constructor);	//function Obj() {}

Obj.prototype.init = function(){
};
Obj.prototype.css = function(){
};

//使用对象字面量的方法，利用新的对象将Obj.prototype进行了覆盖
Obj.prototype = {
    init: function(){
	}，
	css: function(){
	}
};
alert(Obj.prototype.constructor);	//function Object{[native code]}
```

### 3.3 init方法(jQuery构造函数方法)

对外提供的实例对象的接口是`$()`或者`jQuery()`，当调用`$()`的时候其实是调用了`init()或者说jQuery()`，然后返回的是`jQuery的实例对象`，这样就可以使用`jQuery对象`的`prototype`的方法和属性(因为继承关系)，`init()`方法的功能是`初始化jQuery的实例对象`.



``` javascript
//[101]

/**
- selector: 选择器
- context: 包含选择器的元素,选择器的上下文,详细说明:如果没有指定上下文context, 则默认情况将从根元素document对象开始查找,查找范围是整个文档,如果传入上下文,则可以限定查找范围,这样明显可以提高效率.
- rootjQuery
*/

init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;  //详见(一)、(二)
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {

			//判断是否为$('<li>'), $('<li>1</li><li>2</li>')类型,当然也可能是$('<li><p>')这种非合法类型
	        //即判断是否为复杂的HTML标签(注意也包括单个吧)
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
			   //判断是否为单个标签或者id
		       // 比如'#div','<li>hello','<>','     <div>'
		       //注意'<div>',<li>1</li><li>2</li>,也能被匹配,但是第一个if已经匹配走了
		       //macth值
		       //如果是html标签,则 match[2] = undefined
		       //如果是#id,则match[1] = undefined
				match = rquickExpr.exec( selector );
			}

			//匹配html标签(注意html标签还是可以有context的)或者或者没有context的#id
			//类似于if( match && (match[1] || (macth[2] && !context) )
			//原因是match[1]如果是undefined那么macth[2]必定不是undefined
			//此时match[2]当然可以省略啦
			//还需要注意的是这里处理了包括第一部分的if
			//尽管第一部分的if里match[0] = null
			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {
				//第一种情况匹配html标签
			    //包括第一部分的if情况
			    //需要注意的还有匹配html标签还是可以有context的
			    //HANDLE: $(html) -> $(array) 
			    //这里当然是要把html转换成dom数组的形式
			    //例如$('<li>1</li><li>2</li>')
			    //转换成
			    //{
			    //  0: li,
			    //  1: li,
			    //  length:2
			    //}
				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					//$('<li>',document)
			        //$('<li>',contentWindow.document) iframe的document
			        //当然如果context为undefined的情况下仍然是undefined
			        //$('<li>',$(document)) 此时 context instanceof jQuery = true
			        //var context = $(document);
			        //console.log(context instanceof jQuery);   //true
			        //之后可能会这么用
			        //$('<li>',$(document));
			        //console.log(context[0]);                  //document
			        //所以如果context = $(document)
			        //那么必须使context = $(document)[0]
					context = context instanceof jQuery ? context[0] : context;



					//合并DOM数组到this对象(this是json格式的类数组对象)
					//这样之后才可以进行css(),appendTo()等操作(操作this对象)
					// scripts is true for back-compat 
					//详见(三）
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );


					//例如 $('<div>',{title: 'div', html: 'adcd', css: {background:'red'}})
					//创建标签的同时带属性,平时用的很少
					//rsingleTag匹配单标签 <li> 或 <li></li> 也就是selector第一个参数必须是单标签
					//第二个参数也就是context必须是对象字面量
					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							//这里把match冲掉了,不用开辟新的变量
					        //同时我们知道$().html()方法是存在的
					        //所以遍历context时候,如果有html属性
					        //这个if就会满足
					        //并调用this.html('abcd')
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );
							//否则例如像titile的属性,没有$().title()方法
					        //则调用this.attr(title,'div');
					        //当然也可以使用jQuery.attr()
							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					//到这里就返回this对象了,我们当然始终要记得这个this对象是在什么时候使用
			        //$('div')返回带DOM节点的this对象,是一个类数组对象
			        //然后d调用css(), appendTo()等方法使用喽,在这些方法里操作this
			        //this始终是构造函数的上下文环境喽
			        //那么一旦创建了实例,this当然也是实例对象喽
					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},
```


>内容解析

(一)、构造函数返回值问题

```
//构造函数一般不需要返回值
function Obj() {
	this.a = 1;
	this.b = 2;
}
var o = new Obj();
alert(o.a);

//返回this,实现链式调用
function Obj1() {
    this.a = 1;
    this.b = 2;
    return this;
}
var o1 = new Obj1();
alert(o1.a);	//1

//返回引用类型的值，则返回有效
function Obj2() {
    this.a = 1;
    this.b = 2;
    return {
        a: 3,
		b: 4
	};
}
var o2 = new Obj2();
alert(o2.a);	//3

//返回非引用类型，返回值无效
 function Obj3() {
	 this.a = 1;
     this.b = 2;
     return undefined;
 }
 var o3 = new Obj3();
 alert(o3.a);	//1
```

```
function a() {  
    this.attr = 0;  
    this.func = function() {    
        alert("a-func");    
    }
}   
a.prototype = { 
    func2:function() {  
        alert("a-func2");   
        return this;    
    },
    func3:function() {  
        alert('chain'); 
        return this;    
    }   
}   
//链式调用  
var aa = (new a()).func2().func3();  
```

(二)、构造函数返回值`this`(可以理解为返回引用值类型有效么？)

`this`作为类数组对象可以进行`for`循环处理，需要注意`$()`是`jQuery`对象，而`$()[0]`是DOM元素。

| jQuery中构造函数的this属性(注意不是jQuery原型对象的属性) | 描述|  
| :-------- | :--------| :------ |
| `this`中数字属性,例如0,1,2…,也可以说是类数组对象的数字属性(本来数组里的索引就是特殊的字符串属性嘛,例如数组a[0]其实就是a[‘0’]嘛)| 每一个属性代表一个被选中的DOM元素|
| `length`| 选取DOM元素数组的长度,也是`this`类数组的长度 |
| `context`| 选取的上下文环境,例如`document`或者`$(document)` |
| `selector`| 选择器 |
| ...| ... |

(三)、`$.merge`

```javascript
$('<li>1</li><li>2</li>').appendTo('ul'); //添加成功
//$('<li>1</li><li>2</li>')当然要变成如下格式,然后才能调用appendTo方法去处理
/**
 * this = {
 *  0:'li',
 *  1:'li',
 *  length: 2
 * }
 */
//jQuery.parseHTML 把字符串转成节点数组
//参数3个
//1.str字符串
//2.指定根节点
//3:true or false
var str = '<li>3</li><li>4</li><script>alert(4)<\/script>'; //字符串 </script>需要注意,需要转义
// var arr = jQuery.parseHTML(str,document);    //不会弹alert script标签不被添加
var arr = jQuery.parseHTML(str,document,true);  //弹alert script标签被添加
console.log(arr);
/**
 * [
 *      0: li,  //变成DOM中的li节点了  
 *      1: li,
 *      2: script,
 *      length:3
 * ]
 * 
 */
$.each(arr,function(i) {
    $('ul').append(arr[i]); //添加成功
});
//jQuery.parseHTML返回的是数组,但是最终在$('<li>1</li><li>2</li>')中我们发现需要的是转成json格式的this对象
//于是jQuery.merge起作用啦
var a = [1,2],
    b = [3,4];
    
console.log($.merge(a,b));      //[1,2,3,4] 对外是数组合并的功能
var json = {    //类数组对象
    0: 1,
    1: 2,
    length:2
};
var arr = [3,4];
console.log($.merge(json,arr)); //将json和数组合在了一起 源代码中的this就是json格式
/**
 *  {   
    0: 1,
    1: 2,
    2: 3,
    3: 4
    length:4
};
 */
```