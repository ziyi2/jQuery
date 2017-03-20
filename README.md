
## 0.了解jQuery的这些属性和方法么？

``` javascript

 //实例对象
 $()
 $().jquery
 $()[]
 $().length
 $().context
 $().selector
 $().prevObject
 $().constructor()
 $().find()
 $().toArray()
 $().get()
 $().pushStack() 
 $().slice()
 $().ready()
 $().first()
 $().last()
 $().eq()
 $().map()
 $().push()
 $().sort()
 $().splice()
 $(function(){})
 
 //静态方法/工具方法
 $.parseHTML()
 $.merge()
 $.makeArray()
 $.isPlainObject()
 $.isFunction()
 $.each()
 $.map()
 $.extend()
 $.fn.extend()  //拷贝继承，感觉像是原型继承的深一步扩展
 $.isArray()
 $.expando
 $.noConflict()
 $.ready()
 $.holdReady()
 $.getScript()
 $.isFunction()
 $.isNumeric()
 $.type()
 $.each()
```



## 1. 总体架构

``` javascript
(function(window， undefined) {
   [21~91]     : $自执行匿名函数的私有属性      
   [96~283]    : $jQuery对象的属性和方法     
   [285~347]   : $拷贝继承                 
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

(一)、自执行匿名函数创建了特殊的函数作用域，该作用域的代码不会和匿名函数外部的同名函数冲突
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

(三)、`undefined`保证不被修改，可以被压缩，也可以缩短查找`undefined`的作用域链
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

>源码

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

- 用于加载DOM
- 延迟对象

详见`5.3 $.ready()`



### 2.3 core_strundefined 

- 兼容性

>源码
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

>源码
``` javascript
//[32~35]
// Use the correct document accordingly with window argument (sandbox)
location = window.location，
document = window.document，
docElem = document.documentElement，
```

### 2.5 _变量

- 防冲突

>源码
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

>源码
``` javascript
//[43~44]
// [[Class]] -> type pairs
class2type = {}，
```

详见`5.7 $.type()`

### 2.7 core_deletedIds
- 空数组

>源码
``` javascript
//[46~47]
// List of deleted data cache ids， so we can reuse them
core_deletedIds = []，
```

### 2.8 core_version
- 字符串
- 版本号

>源码
``` javascript
//[49]
core_version = "2.0.3"，
```
### 2.9 数组、对象、字符串方法
- 压缩
- 缩短查找时间

>源码

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

>源码
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

>源码
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

详见`5.3 $.ready()`


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

### 3.1 $().jquery
- 版本号
``` javascript
console.log($().jquery);    //2.0.3
```

### 3.2 $().constructor

默认的构造函数的原型的`constructor`属性指向该构造函数，但是`constructor`属性很容易被修改.所以可以在原型对象的`constructor`属性中进行修正.

>源码

```javascript
//[100]
constructor: jQuery，
```



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

### 3.3 $().init() (jQuery构造函数方法)

对外提供的实例对象的接口是`$()`或者`jQuery()`，当调用`$()`的时候其实是调用了`init()或者说jQuery()`，然后返回的是`jQuery的实例对象`，这样就可以使用`jQuery对象`的`prototype`的方法和属性(因为继承关系)，`init()`方法的功能是`初始化jQuery的实例对象`.


>源码

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
					//所以如果context = $(document) jQuery对象
			        //那么必须使context = $(document)[0] DOM对象
			        //context详见(三)
					context = context instanceof jQuery ? context[0] : context;

					//合并DOM数组到this对象(this是json格式的类数组对象)
					//这样之后才可以进行css(),appendTo()等操作(操作this对象)
					// scripts is true for back-compat 
					//详见(四）、(五)
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
			        //可以链式调用
					return this;

				// HANDLE: $(#id)
				//如果macth[1]是undefined
				//那么match[2]肯定不是undefined
				//match[2]当然是用来匹配#id的情况
				} else {
					//简单粗暴获取id为match[2]的节点试试
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					//如果节点存在
				    //当然如果黑莓4.6就算是节点不存在也会返回true
				    //所以此时需要多个判断条件,就是判断节点的父节点是否存在
				    //因为不存在的节点肯定是没有父节点的
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						//给构造函数jQuery添加length属性,因为是id嘛,所以当然只有一个DOM节点喽
						this.length = 1;
						//将DOM节点赋值给this类数组对象,方便日后操作
						this[0] = elem;
					}
					//没有context的#id上下文当然是document
					this.context = document;
					//选择器仍然是本身
					this.selector = selector;
					//返回this方便操作喽
					return this;
				}

			// HANDLE: $(expr, $(...))
			//context.jquery判断如果是jQuery对象
			} else if ( !context || context.jquery ) {
			    //例如$('ul',$(document)).find('li')
				//$(document).find()
				//调用了Sizzle选择器
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			//例如$('ul',document).find('li')
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}
			//以上两种判断$(expr, $(...))、$(expr, context)最终变成$(document).find()调用Sizzle选择器

		// HANDLE: $(DOMElement)
		//如果不是字符串，是节点
		} else if ( selector.nodeType ) {
		    //这里仍然要将this转换成类数组对象
			//console.log($(document));
			/**
			 * {
			 *   0: document (节点对象)
			 *   context: document (仍然是节点对象,这个是传入的节点对象)
			 *   length: 1
			 * }
			 */
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		//例如$(function(){}),实际仍然调用，$(document).ready(function(){})
		} else if ( jQuery.isFunction( selector ) ) {
		    //$(document).ready(function(){})
			return rootjQuery.ready( selector );
		}

		//看传入的参数是不是jQuery对象 例如 $( $('div') )
		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}
		//类似于jQuery.merge方法
		//写一个参数对外是用来转成数组
		//由于我们需要返回的是this这种类数组对象
		//所以写两个参数则是可以转成类数组对象this
		//详见(六)
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
| :-------- | :--------|
| `this`中数字属性,例如0,1,2…,也可以说是类数组对象的数字属性(本来数组里的索引就是特殊的字符串属性嘛,例如数组a[0]其实就是a[‘0’]嘛)| 每一个属性代表一个被选中的DOM元素|
| `length`| 选取DOM元素数组的长度,也是`this`类数组的长度 |
| `context`| 选取的上下文环境,例如`document`或者`$(document)` |
| `selector`| 选择器 |


(三)、`context`具体使用案例（重点，加速查找DOM元素）

``` javascript
$('h1').click(function() {
    $('strong',this).css('color','blue');   //this指代h1 限定查找范围
});
//$('h1')因为没有指定上下文,所以调用浏览器原生方法document.getElementById方法查找属性为id的元素
//$('strong',this)因为指定了上下文,则通过jQuery的.find()方法查找,因此等价于$('strong').find('h1')
```

(四)、`$.parseHTML`、`$.merge`

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


(五)、`this`在jQuery中的实际使用案例

``` javascript
//传统写法
var liArray = document.getElementsByTagName('li');
for(var index in liArray) {
    liArray[index].style.color = 'blue'; //liArray[index]是DOM元素对象
}

//jQuery使用案例
$('li').css('color','red'); 			//$('li')是jQuery对象


var J = $('li');    					//jQuery实例对象

J.css('color','red');       			//J并不是DOM元素对象
console.log(J);     					//是一个类数组对象
/*
{
    0:li,
    1:li,
    ...
    7:li,
    context:document,                   //上下文环境是一个根元素
    length:8,
    prevObject:init[1]
    selector:'li'
}
 */}
J[2].style.color = 'blue';             //那么明显J[2]是DOM元素对象操作


/*
然后可以想象在css()方法中遍历这个类数组去更改样式. 那么J和css()中怎么将这个类数组对象联系在一起,应为在两个函数中的变量都是局部变量哎,其实也很简单,因为两个方法都是实例对象的原型方法,那么在同一个实例对象上调用这两个方法的this是同一个啊,所以肯定是通过this对象啦，那么在css()方法中,会是这样处理

for(var i=0 len=this.length; i<len; i++) {
    this[i].style.color = 'red';  //类对象的数组元素是真正的DOM元素操作
}
*/
```


(六)、`$.makeArray`

- 一个参数可以提供给外部使用，转化为数组
- 两个参数提供给内部使用，转化为`this`需要的类数组对象

``` javascript
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
var arrDiv = document.getElementsByTagName('div');
console.log(arrDiv);    //获取的是一个类数组对象
//arrDiv.push();    //arrDiv.push is not a function
$.makeArray(arrDiv).push(); //转化成数组就可以调用了
console.log($.makeArray(arrDiv));   //数组
//但是$()构造函数返回的是this类数组对象,而不是数组
console.log($.makeArray(arrDiv,{length:0}));    //类数组对象
```



### 3.4 $().selector
### 3.5 $().length
### 3.6 $().toArray()

- 类数组对象转数组

>源码
``` javascript
//[202]
toArray: function() {
	return core_slice.call( this ); //Array.prototype.slice.call(类数组对象)
}
```

>内容解析

`call /apply` 可以显示指定调用所需的`this`值，任何函数可以作为任何对象的方法来调用，哪怕这个函数不是那个对象的方法，第一个参数是要调用函数的母对象，即调用上下文，在函数体内通过`this`来获得对它的引用

``` javascript
function f() {
    alert(this.x);
}

f();				//undefined
f.call({x:100});	//100，函数中的this指代传入的对象，call可以使函数中的this值指向传入的第一个参数

//call和apply的区别
function f(x,y) {
    alert(this.x + x + y);
}

f.call({x:1},2,3);	  //6,传入一个个参数
f.apply({x:1},[3,4]); //8，传入一个数组
```


```javascript
var obj = {
    0:'apple',
	1:'huawei',
	length:2
};
console.log(obj);								//Object
console.log(Array.prototype.slice.call(obj));	//Array[2]

//Array.prototype.slice的可能源码
Array.prototype.slice = function(start,end){
    var result = new Array();
     start = start || 0;
     end = end || this.length; //this指向调用的对象，当用了call后，能够改变this的指向
     for(var i = start; i < end; i++){
          result.push(this[i]);
     }
     return result;
 }

//jQuery的用法
var $div = $('div');	//由于构造函数返回的是this, this是一个类数组对象

/*this可能的值
{
    0:div,
    1:div,
    ...
    7:div,
    context:document,                   //上下文环境是一个根元素
    length:8,
    selector:'li'
}
*/

$div.toArray();		//把$div的this对象传入了toArray的core_slice.call( this );后面懂了，就把this变成了数组
```

附上`[].slice`源码分析

``` javascript
//[].slice(start,end)
//返回一个新数组,该数组是原数组从tart到end(不包含该元素)的元素
//以下是slice的源码,我们可以发现它其实是可以将类数组对象进行转换为数组
//开头说明不光光是普通的数组,类数组对象,NamedNodeMap,NodeList,HTMLCollection,DOM objects 都是可以转化成数组的
// This will work for genuine arrays, array-like objects, 
// NamedNodeMap (attributes, entities, notations),
// NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
// and will not fail on other DOM objects (as do DOM elements in IE < 9)
Array.prototype.slice = function(begin, end) {
  // IE < 9 gets unhappy with an undefined end argument
  //如果没有传入end参数,则默认是this.length长度
		  end = (typeof end !== 'undefined') ? end : this.length; //这里终于知道为什么要用typeof a === 'undefined' 就是考虑到了IE的兼容性问题
  // 如果是原生数组对象,则调用原生数组对象的方法
  // For native Array objects, we use the native slice function
  // 以下方法普遍用来判断传入的参数是否是数组
  if (Object.prototype.toString.call(this) === '[object Array]'){
    return _slice.call(this, begin, end); 
  }
  // For array like object we handle it ourselves.、
  //如果是类数组对象
  var i, cloned = [],
    size, len = this.length;
    
  // 如果start默认没有传入参数则是0
  // Handle negative value for "begin"
  var start = begin || 0;
  //如果start>=0则选择start,否则选择你懂得,防止负数的情况下少于数组的长度
  start = (start >= 0) ? start : Math.max(0, len + start);
 
  //如果传入的end是number,则比较end和len,这种情况防止传入end大于数组本身的长度
  //如果不是,则默认处理成数组的长度
  // Handle negative value for "end"
  var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
  //当然end<0 
  if (end < 0) {
    upTo = len + end;
  }
  // Actual expected size of the slice
  size = upTo - start;
  if (size > 0) {
    cloned = new Array(size);
    //字符串的情况
    if (this.charAt) {
      for (i = 0; i < size; i++) {
        cloned[i] = this.charAt(start + i);
      }
    } else {
       //类数组情况
      for (i = 0; i < size; i++) {
        cloned[i] = this[start + i];        //这里就是将类数组对象转化为数组
      }
    }
  }
  return cloned;
};
```


### 3.7 $().get()

- 不传参数功能是`$().toArray()`
- 传参数的功能是 `$()[num]`


>源码
```
//[206]
// Get the Nth element in the matched element set OR
// Get the whole matched element set as a clean array
get: function( num ) {
	return num == null ?

		// Return a 'clean' array
		this.toArray() :

		// Return just the object
		( num < 0 ? this[ this.length + num ] : this[ num ] );
},
```

>内容解析

``` javascript
<div>1</div>
<div>2</div>
<div>3</div>]

<script src='Jquery2.0.3.js'></script>

<script>
	console.log($('div').get());					//Array[3]
    console.log($('div').toArray());				//Array[3]
	console.log($('div')[0] == $('div').get(0));	//true
</script>
```

### 3.8 $().pushStack()

>源码

``` javascript
// Take an array of elements and push it onto the stack
// (returning the new matched element set)
// 使用元素数组并把当前选中的元素压入栈
// 返回的是新的被匹配的元素
pushStack: function( elems ) {

	// Build a new jQuery matched element set
	// this.constructor()是一个空的Jquery对象
    // 合并新的元素到新的this对象
	var ret = jQuery.merge( this.constructor(), elems );

	// Add the old object onto the stack (as a reference)
	// 老的对象被保留到一个prevObject属性
	ret.prevObject = this; 
	ret.context = this.context;

	// Return the newly-formed element set
	// 返回新的元素的结果
	return ret;
},
```

> 内容解析


``` javascript
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<span>', {html: 'this is a span', class:'span'}).appendTo('body');   //添加在body的末尾
console.log($('div').pushStack( $('span') ));
$('div').pushStack( $('span') ).css('background','red');    //span变红 div没有
//因为在栈中span在div上面
$('div').pushStack( $('span') ).css('background','red').css('background','yellow'); //span变黄
//{
//  0: span,
//  length: 1,
//  context: document,
//  prevObject: {
//      0: div,
//      length: 1,
//      selector: "div",
//      prevObject: {
//          0: document,
//          context: document,
//          length: 1,
//      }
//  }
//}
console.log($('div').pushStack( $('span') ).css('background','red').prevObject);    //div
console.log($('div').pushStack( $('span') ).css('background','red').context);       //document
$('div').pushStack( $('span') ).css('background','red').prevObject.css('fontSize','100px'); //div的字体变了
//如果仍然想使用栈的下一层div(上一层是span),end方法回溯栈其实就利用了prevObject属性
$('div').pushStack( $('span') ).css('background','red').end().css('background','yellow');   //span红色,div黄色
```

### 3.9 $().end()

>源码

```javascript
// [271-273]
end: function() {
    //主要是对于pushStack的回溯,返回被push之前的jQuery实例对象
    return this.prevObject || this.constructor(null);
},
```

### 3.10 $().slice()

>源码
``` javascript
//[247-250]
slice: function() {
    return this.pushStack( core_slice.apply( this, arguments ) );
},
```

> 内容解析

```javascript
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('div').slice(1,3).css('background','red');    //中间两个div背景变红色,注意和数组的方法一样不包括第三个 
//其实是在4个div的基础上又入栈了被选中的两个div
//如果利用end回溯
$('div').slice(1,3).css('background','red').end().css('background','red');  //4个div背景色都变成了红色
```

### 3.11 $().each()

>源码

``` javascript
// [233-238]
// 通过工具each方法,工具方法用于构建库的最底层,实例方法调用工具方法
// 实例方法可以看成更高级别的层次
each: function( callback, args ) {
	    return jQuery.each( this, callback, args ); //后续分析$.each()
},
```


### 3.12 $().ready()

>源码

```javascript
// [240-245]
ready: function( fn ) {
    // 使用Promise的形式等待回调
    jQuery.ready.promise().done( fn );
    return this;
},
```

### 3.13 $().first()/last() /eq()

>源码

``` javascript
first: function() {
    return this.eq( 0 );
},
last: function() {
    return this.eq( -1 );
},

//[259-263]
eq: function( i ) {
    var len = this.length,
        j = +i + ( i < 0 ? len : 0 );
    return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
},
```

>内容解析

``` javascript
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('<div>', {html: 'this is a div', class:'div'}).appendTo('body');  //添加在body的末尾
$('div').first().css('background','red');   //第一个红
$('div').last().css('background','yellow'); //最后一个黄
$('div').eq(2).css('background','blue');    //第三个蓝
```

### 3.14 $().map()

>源码

```javascript
//[265-269]
map: function( callback ) {
    //入栈
    //最终调了底层的工具方法
    return this.pushStack( jQuery.map(this, function( elem, i ) {
        return callback.call( elem, i, elem );
    }));
},
```

>内容解析

```javascript
var arr = ['a','b','c'];
arr = $.map(arr,function(item,index) {
    return item + index;
});
console.log(arr);   //[a0,b1,c2]
```

### 3.15 $().push()/sort()/slice()

- 内部用，不建议在外面使用，内部使用增加性能

>源码

```javascript
// [275-279]
// 内部使用
// 将Array的方法挂载到了jQuery对象下面
push: core_push,
sort: [].sort,
splice: [].splice
```

## 4. 拷贝继承

>源码

``` javascript
//[285]
//详见(一)、(二)、(三)
jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	//布尔值true则是深拷贝
	if ( typeof target === "boolean" ) {
		deep = target;
		//目标对象变成了第二项
		target = arguments[1] || {};  
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	//目标元素不是对象则变成空对象
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	//如果参数只有1个，则是扩展jQuery自身的方法，详见(一)
	if ( length === i ) {
		target = this;
		--i;
	}

	//多个对象参数
	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		//第二个开始的参数是不是空
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				//防止循环引用 例如 var a = {}; $.extend(a,{name:a})
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				//深拷贝，被拷贝的值必须是对象或数组，利用递归，详见(三)
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						//如果目标自带的值有，则选择目标自带的值
						clone = src && jQuery.isArray(src) ? src : [];
					} else {
					    //如果目标自带的值有，则选择目标自带的值,详见(三)
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				//浅拷贝
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};
```

>内容解析

- `jQuery`允许扩展新的静态方法(只有一个对象参数)
- `jQuery`允许扩展新的实例方法(只有一个对象参数)
- 扩展自定义对象的属性和方法(多个对象参数)
- 深浅拷贝

(一)、扩展构造函数的静态方法和实例方法


``` javascript
//[96]
jQuery.fn = jQuery.prototype;
//[285]
jQuery.extend = jQuery.fn.extend; //jQuery.prototype.extend;

//jQuery.extend 是静态方法
//jQuery.prototype.extend 实例方法，原型对象的方法会被实例化对象继承


$.extend({
    f1: function(){
        alert(1);
	},
	f2: function(){
        alert(2);
	}
});

//静态方法
$.f1();		//1
$.f2();		//2

$.fn.extend({
    f1: function(){
        alert(1);
    },
    f2: function(){
        alert(2);
    }
});

//实例方法,jQuery允许我们在构造函数上扩展新的实例方法
$().f1();	//1
$().f2();	//2

```

(二)、扩展自定义对象的属性和方法

``` javascript
//多个参数时,后面的参数的对象属性和方法扩展到第一个参数对象
var obj = {};

$.extend(
	obj,
	{
		f1: function(){
			alert(1);
			},
		f2: function(){
			alert(2);
			}
	},
	{
		name: 'obj_extend'
	}
);

console.log(obj); //{f1,f2,name};
```

(三)、深浅拷贝

``` javascript
var a = {name:'ziy2',age:23};
var b = a;				//浅拷贝
console.log(a===b);		//true b是a的副本，引用了同一个内存块
b.name = 'ziyi3';
console.log(a.name);	//ziyi3

var d = {name:'ziyi5',age:{age:22}};
var f = {};

for(var key in d) {		//仍然是浅拷贝
    f[key] = d[key];
}

f.age.age = 25;
f.name = 'ziyi6';
console.log(d.age.age);	//25 说明age属性仍然是浅拷贝
console.log(d.name);	//ziyi5


//以下可能是一个深拷贝的函数，其实简单理解就是深拷贝就是两个不同的内存块，浅拷贝就是两个都有引用同一内存块
var deepCopy= function(source) { 
var result={};
for (var key in source) {
      result[key] = typeof source[key]===’object’? deepCoyp(source[key]): source[key];
   } 
   return result; 
}

```

`jQuery`中默认是浅拷贝


``` javascript
var
	a = {},
	b = {
	     name: 'ziyi2',
         age: {
             age: 23
         }
     };

$.extend(a,b);

b.age.age = 24;
console.log(a.age.age);	//24 浅拷贝

b.name = 'ziyi3';	
console.log(a.name);	//ziyi2 基本类型的值不受影响
```

设置为深拷贝

``` javascript
var
	a = {},
	b = {
              name: 'ziyi2',
              age: {
                  age: 23
              }
          };

$.extend(true,a,b);		//添加参数true

b.age.age = 24;
console.log(a.age.age);	//23 深拷贝

b.name = 'ziyi3';
console.log(a.name);	//ziyi2 


//保留原有的属性
var c = {name: {familyName: 'zhu'}},
    d = {name: {familyName: 'zhang'}};

$.extend(true,c,d);
console.log(c);		//{name: {familyName: 'zhang'}}

var e = {name: {age: 23}};
$.extend(true,d,e);
console.log(d);		//{name: {familyName: 'zhang',age:23}} 保留d所有的属性familyName

```


## 5. 工具方法

利用`4. $.extend()`**拷贝继承**构建工具方法，工具方法是`jQuery`的最底层方法，通常实例方法中会调用工具方法

``` javascript
jQuery.extend({
	expando:       唯一的jQuery字符串(内部使用)
	noConflict:    防冲突
	isReady:       DOM是否加载完毕(内部使用)
	readyWait:     等待异步文件先执行后执行DOM加载完毕事件的计数器(内部使用)
	holdReady():   推迟DOM触发
	ready():       准备触发DOM加载完毕后的事件
	isFunction():  是否为函数
	isArray():     是否为数组(不支持IE6、7、8)
	isWindow():    是否为window对象
	isNumeric():   是否为数字
	type():        判断数据类型
})
```

### 5.1 $.expando
- 唯一性

>源码

``` javascript
//[351]
// Unique for each copy of jQuery on the page
//生成随机数并去掉小数点
expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),	
```

>内容解析
>
``` javascript
console.log($.expando);	//jQuery20305959261594460556
```


### 5.2 $.noConflict
- 防冲突

>源码

``` javascript

[37~41]
//在引用jQuery库之前有使用$命令的变量，则保存引用之前的变量
// Map over jQuery in case of overwrite
_jQuery = window.jQuery，

// Map over the $ in case of overwrite
_$ = window.$，


//[353]
noConflict: function( deep ) {
	//在[37-41]利用_$缓存引用库之前的$值
	//库加载完毕后[8826]先执行
	//此时把$值在jQuery中的引用放弃掉
	//详见(二)	
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}
    //加入参数true以后和(二)一样，放弃掉jQuery变量的命名
    if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}
	
	//详见(一)
	return jQuery;
},


//[8826]     
window.jQuery = window.$ = jQuery
```

>内容解析

(一)、`$`在引用`jQuery`库之后改变

``` javascript
var new$ = $.noConflict();	//创建$变量的副本
$ = 2017;					//$本身的值改变

new$(function(){
    alert(new$().jquery);	//2.0.3 new$ = 未改变之前的$值
    alert($);				//2017 $值被改变
})
```

(二)、`$`在引用`jQuery`库之前已经存在

``` javascript

//保留引用库前的$
<script>
	var $ = 2017;
</script>


<script src='Jquery2.0.3.js'></script>

<script>
	$.noConflict();	//获取加载jQuery库之前的$变量值，并放弃$变量对于jQuery的意义
	console.log($);	//2017
</script>


//保留引用库前的jQuery
<script>
	var jQuery = 2017;
</script>


<script src='Jquery2.0.3.js'></script>

<script>
       $.noConflict(true);	 //放弃掉jQuery
	console.log(jQuery); //2017，仍然是引用jQuery库之前的jQuery变量
</script>

```

### 5.3 $.ready()
- `DOM`加载完毕的触发事件
- `$(function(){})`
- `$(document).ready()`
- `DOMContentLoaded`事件(等文档流、普通脚本、延迟脚本加载完毕后触发)
- `load`事件(等文档流、普通脚本、延迟脚本、异步脚本、图片等所有内容加载完毕后触发)

>源码

``` javascript

//历程： $(function(){}) -> $(document).ready() -> $.ready.promise().done(fn) -> complete()回调 -> $.ready()

// 步骤一、[182]
// HANDLE: $(function)
// Shortcut for document ready
} else if ( jQuery.isFunction( selector ) ) {
	//$(document).ready(function(){}) 调用了[240]的$().ready()
	return rootjQuery.ready( selector ); 
}

// 步骤二、[240-245] 
//$().ready()
ready: function( fn ) {
    // 使用Promise的形式等待回调
    // 创建了延迟对象
    jQuery.ready.promise().done( fn );
    return this;
},


// 步骤三、[819]
jQuery.ready.promise = function( obj ) {	
    //第一次是空对象，可以进入if
	if ( !readyList ) {
		//创建延迟对象
		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15

		//if和else都是在DOM加载完毕后执行$.ready()
		
		//详见(一) DOM加载完毕 IE会提前出发
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			// hack写法，兼容IE
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			// DOM没有加载完毕时，监测
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			// 如果浏览器有缓存事件，则load会比DOMContentLoaded先触发，所以两个事件都要监听
			window.addEventListener( "load", completed, false );
		}
	}
	//promise的状态不能被修改
	return readyList.promise( obj );
};



//步骤四、[89] 
//complete()回调
//这是一个自执行匿名函数中的局部函数，在自执行匿名函数内都可见，所以上述监听事件可以直接调用

// The ready event handler and self cleanup method
completed = function() {
    //尽管在jQuery.ready.promise两个事件都监听了，但是这里都取消了，所以任何一个监听事件触发，另外一个监听事件因为取消了不会再次执行，jQuery.ready();只会执行一次
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
};

//步骤五、[382] 
//$.ready()

// Handle when the DOM is ready
ready: function( wait ) {
	//和$.holdRady()有关
	//--jQuery.readyWait如果hold了N次，则不会触发DOM加载事件，而是返回
	//如果jQuery.isReady为true则已经触发了一次了
	// Abort if there are pending holds or we're already ready
	if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
		return;
	}

	// Remember that the DOM is ready
	jQuery.isReady = true;

	// If a normal DOM Ready event fired, decrement, and wait if need be
	// 如果释放hold,则全部释放完后才能继续执行下面的DOM加载事件，否则return
	if ( wait !== true && --jQuery.readyWait > 0 ) {
		return;
	}
	
	// 在jQuery.ready.promise()中的延迟对象触发回调
	// 触发步骤二的jQuery.ready.promise().done( fn );回调函数done()
	// 平时用readyList.resolve()
	// 但是readyList.resolveWith()可以传递参数
	// 使this指向document
	// 传入的参数指向jQuery,详见(二)
	// If there are functions bound, to execute
	readyList.resolveWith( document, [ jQuery ] );

	// Trigger any bound ready events
	//主动触发
	//$(documnent).on('ready',function(){
	//})
	//详见(三)
	if ( jQuery.fn.trigger ) {
		jQuery( document ).trigger("ready").off("ready");
	}
},

```

>内容解析

(一)、浏览器加载页面过程

- 创建`Document`对象，解析Web页面，解析HTML元素和相应的文本内容添加`Element`对象和`Text`节点到文档中，此时`document.readyState = 'loading'`
- 当HTML解析器遇到没有`async`和`defer`属性的`<script>`元素时，把元素添加到文档中，执行内部脚步或引用的外部脚本，这些脚本会同步执行，并且脚本下载和执行时HTML解析器暂停解析HTML元素，此时如果脚本中使用了`document.write()`方法，就会把该方法的内容插入输入流中，解析器恢复时这些文本会成为文档的一部分
- 当解析器遇到了`async`属性的`<script>`元素时，开始下载脚本文本，并继续解析文档，意思是`async`属性的`<script>`元素异步执行，不会阻塞文档的解析，需要注意异步脚本禁止使用`document.write()`方法，因为此时文档不会暂停等待`document.write()`内容的插入，而是继续下载执行
- 如果文档(文档流，不包括图片等其他内容)析完，则`document.readyState = 'interactive'`
- 此时因为文档解析完毕，执行带有属性`defer`的`<script>`脚本，需要注意`async`属性的脚本如果在文档流解析完毕还没有执行完毕时此时也会继续执行，`defer`的`<script>`脚本可以访问完整的文档树，因为此时文档流已经解析完毕，但是也禁止使用`document.write()`方法
- 如果 带有属性`defer`的`<script>`脚本加载完毕，浏览器在`Document`对象上触发了`DOMContentLoaded`事件，这标志着程序执行从同步脚本执行 阶段转换到了异步时间驱动阶段，这时异步脚本能可能没有执行完成。
- 文档已经完全解析完成，浏览器可能还在等待其他内容载入，比如图片，当所有的内容载入完成并且所有的异步脚本完成载入和执行，`document.readState='complete'`， Web浏览器触发`Window`对象上的`load`事件
- 之后就是调用异步事件,以异步响应用户输入事件，网络事件，计时器过期等


(二)、`readyList.resolveWith( document, [ jQuery ] );`

- 参数一是`context`，即传递上下文
- 参数二是一个需要传入的参数数组给完成的回调函数

``` javascript
$(function(obj){
    console.log(this); //this指向document这个DOM对象
    console.log(obj);  //obj指向jQuery对象
	/*function ( selector, context ) {
           	The jQuery object is actually just the init constructor 'enhanced'
          	return new jQuery.fn.init( selector, context, rootjQuery );
      	}
	*/
})
```

(三)、`jQuery`触发`ready`的三种方法

- `$(function(){})`
- `$(document).ready(function(){})`
- `$(document).on('ready',function(){})`



### 5.4 $.holdReady()

- 推迟`DOM`加载完毕事件的触发

>源码

``` javascript
// Is the DOM ready to be used? Set to true once it occurs.
//为真说明DOM加载完成事件已经触发
isReady: false,

// A counter to track how many items to wait for before
// the ready event fires. See #6781
readyWait: 1,

// Hold (or release) the ready event
holdReady: function( hold ) {
	if ( hold ) {
		//如果有多个需要hold的异步文件，则++多次
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
},
```



>内容解析

``` javascript
//异步加载外部文件，需要注意async属性只能用于外部文件
$.getScript('a.js', function(){

});

$(function () {
	alert(2);
      });

//此时先2后1,DOMContentLoaded事件比异步事加载javascript事件先触发
```

解决异步文件先执行，然后再执行`DOM`加载完毕事件

``` javascript
//延迟DOM加载完成事件
$.holdReady(true);

//异步加载外部文件，需要注意async属性只能用于外部文件
$.getScript('a.js', function(){
    //a.js　-> alert(1)
	//释放延迟
	$.holdReady(false);
});

$(function () {
	alert(2);
});
//此时先1后2
```

### 5.5 $.isFunction()

>源码

``` javascript
// See test/unit/core.js for details concerning isFunction.
// Since version 1.3, DOM methods and functions like alert
// aren't supported. They return false on IE (#2968).
// [409]
// 原生的方法alert在IE8下使用typeof alert不返回function而是返回object
// 所以jQuery放弃IE8的检测方法
isFunction: function( obj ) {
	//通过$.type()检测
	return jQuery.type(obj) === "function";
},
```

>内容解析

``` javascript
function f() {
}
console.log($.isFunction(f));	//true
```

### 5.6 $.isArray()

- 缩短查找的作用域链
- 不支持IE6、7、8

>源码

``` javascript
//[413]
isArray: Array.isArray,
```

### 5.5 $.isWindow()

>源码

``` javascript
//[415]
isWindow: function( obj ) {
	//obj != null 详见(一)，除了传入null和undefined不执行第二个&&
	//其他都会执行第二个&&进行判断，因为null和undefined不是包装对象，不可能有.window这样的属性
	//obj.window 详见(二)
	return obj != null && obj === obj.window;
},
```

>内容解析

(一)、`null`非包装对象

``` javascript
console.log(null == null);			//true
console.log(undefined == null);		//true
console.log(false == null);			//false
console.log({} == null);			//false
console.log([] == null);			//false
```

(二)、`window`对象

- 全局对象
- 浏览器窗口

``` javascript
obj === obj.window	//全局对象下的浏览器窗口属性
```

### 5.6 $.isNumeric()

>源码

``` javascript
isNumeric: function( obj ) {
	//parseFloat转化非数字是NaN
	//判断数字是否是有限的数字
	return !isNaN( parseFloat(obj) ) && isFinite( obj );
},
```

>内容解析

``` javascript
console.log(typeof NaN);	//number，所以不能用typeof来判断是否为数字
```

### 5.7 $.type()



>源码

``` javascript
//[423]
type: function( obj ) {
	//null或undefined
	if ( obj == null ) {
		//转字符串
		return String( obj );  
	}
	// Support: Safari <= 5.1 (functionish RegExp)
	//如果是对象或函数，兼容性，Safari5.1
	return typeof obj === "object" || typeof obj === "function" ?
		//引用数据类型检测
		class2type[ core_toString.call(obj) ] || "object" :
		//基本数据类型检测
		typeof obj;
},



// Populate the class2type map
// [844]
// 这个写法很巧妙
// class2type["object Number"] = 'number'
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});
```

>内容解析

(一)、原生的`typeof`更丰富

``` javascript
var a = [],
	b = {},
	c = 'string',
	d = null,
	e = NaN,
	f = undefined,
	g = 123,
	h = new Date;

console.log(typeof a);	//object
console.log(typeof b);	//object
console.log(typeof c);	//string
console.log(typeof d);	//object
console.log(typeof e);	//number
console.log(typeof f);	//undefined
console.log(typeof g);	//number
console.log(typeof h);	//object

console.log($.type(a));	//array
console.log($.type(b));	//object
console.log($.type(c));	//string
console.log($.type(d));	//null
console.log($.type(e));	//number
console.log($.type(f));	//undefined
console.log($.type(g));	//number
console.log($.type(h));	//date
```


(二)、`Object.prototype.toString().call()`

``` javascript
console.log(Object.prototype.toString.call([]));	//[object Array]
console.log({}.toString.call({}));					//[object Object]
```

(三)、`instance of`

需要注意使用`instance of`的方法进行类型检测需要考虑跨`iframe`子框架的检测问题


```
//a.js
function Test() {
    this.name = 'ziyi2';
}

//child_index.html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <h2>child_index.html</h2>
    <script src="a.js"></script>
    <script>
        var test = new Test();
        document.test = test;
        document.data = '123';
    </script>
</body>
</html>

//index.html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8"/>
	<title>Jquery2.0.3源码分析</title>

</head>
	
<body>
	<h1>index.html</h1>
	<iframe src="child_index.html" frameborder="0" id="iframe"></iframe>
	<div>1</div>
	<div>2</div>
	<div>3</div>

	<script src='Jquery2.0.3.js'></script>
	<script src="a.js"></script>
	<script>

		window.onload = function() {
            var child_index= document.getElementById('iframe');		//注意与$('#iframe')的区别，一个是DOM对象，一个是jQuery对象

            (function fn() {
                if(!child_index && !child_index.contentWindow && !child_index.contentWindow.document) {
                    setTimeout(fn(),0);
                    console.log('document not ready...');
                } else {
                    var child_index_doc = child_index.contentWindow.document;	//获取子框架页面的文档对象
                    console.log(child_index_doc.data);		//123
                    console.log(child_index_doc.test);		//Test {name:ziyi2}
					console.log(child_index_doc.test.name);	//ziyi2
					console.log(child_index_doc.test instanceof Test);	//false
					//可以发现使用子框架的Test实例对象不能使用instanceof进行检测
                    var test1 = new Test();
                    console.log(test1 instanceof Test);		//true

                }
            })()
		}
	</script>
</body>
</html>
```

>提示： 使用`child_index.html`页面实例化的对象和`index.html`页面实例化的对象是两个不同的执行环境，所以没办法进行检测