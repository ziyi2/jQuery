
## 0.了解jQuery的这些属性和方法么？

>注意:  本版本jQuery只支持IE9以上的浏览器

``` javascript
 /*实例对象*/
 $().jquery                           # 版本号属性
 $().length                           # 匹配的DOM元素个数
 $().context                          # 上下文环境
 $().selector                         # jQuery对象的初始化选择器
 $().prevObject                       # 当前入栈的jQuery实例对象
 $().constructor()                    # jQuery构造函数
 $().toArray()                        # DOM元素集(类数组对象)转数组
 $().get()                            # $()[num],当不传参数时调用$().toArray()
 $().pushStack()                      # 堆栈
 $().slice()                          # DOM集合的截取(使用了堆栈方法,返回的仍然是$而不是特定的DOM元素对象)
 $().ready()                          # DOM加载
 $().first()                          # 集合的第一项(相当于在栈上又堆了一层,仍然是jQuery实例对象)
 $().last()                           # 集合的最后一项(相当于在栈上又堆了一层,仍然是jQuery实例对象)
 $().eq()                             # 获取特定的DOM集合(使用了堆栈方法,返回的仍然是$而不是特定的DOM元素对象)
 $().end():                           # 栈回溯,可以看做popStack(),
 $().map()                            # 遍历集合并返回新集合(使用了堆栈方法)
 $().push()                           # 内部增加性能使用(不建议对外)
 $().sort()                           # 内部增加性能使用(不建议对外)
 $().splice()                         # 内部增加性能使用(不建议对外)
 $(function(){})                      # DOM加载


 /*扩展对象*/
 $.fn.extend()
 $.extend()                           # 扩展jQuery静态方法\实例方法以及扩展自定义对象的方法


 /*静态方法(工具方法)*/
 $.expando                            # 字符串唯一性
 $.noConflict()                       # $变量防冲突
 $.ready()                            # DOM加载(内部使用,工具方法)
 $.holdReady()                        # DOM延迟加载(例如要先执行异步加载的JS文件)
 $.isFunction()                       # 检测是否为函数
 $.isArray()                          # 内部使用(有兼容性问题)
 $.isWondow()                         # 检测是否为Window对象
 $.isNumeric()                        # 检测是否为数字
 $.type()                             # 引用类型和基本类型检测
 $.isPlainObject()                    # 检测是否是对象字面量
 $.isEmptyObject()                    # 检测是否是空的对象字面liang量
 $.error()                            # 抛弃异常(内部工具方法)
 $.parseHTML()                      　# 将字符串转换成DOM数组
 $.parseJSON()                     　 # JSON.parse()(内部工具方法)
 $.parseXML()                         #
 $.noop()                             # 空函数
 $.globalEval()          　　　　　    #　全局eval()
 $.camelCase()            　　　　　　  # 转驼峰
 $.nodeName()                         # 小写的节点名称
 $.each()                             # 遍历(数组或类数组对象)
 $.trim()                             # 去除首尾空字符(内部)
 $.makeArray()                        # 对外是转化为数组,对内可以转化为类数组对象
 $.inArray()                          # 索引元素的位置
 $.merge()                            # 对外是数组合并,对内可以将数组合并到类数组对象
 $.grep()                             # 过滤数组,返回新数组
 $.map()                              # 遍历和修改数组元素的内容
 $.guid                               # 绑定事件函数的唯一标识符
 $.proxy()                            # 改变绑定事件的this指向
 $.access()                           # 多函数工具方法(内部)
 $.now()                              # 获取当前时间的毫秒数
 $.swap()                             # 交换css样式
```



## 1. 总体架构

``` javascript
(function(window, undefined) {
   [21~91]     : $自执行匿名函数的私有属性
   [96~283]    : $jQuery对象的属性和方法
   [285~347]   : $拷贝继承
   [349~817]   : $工具方法
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

(一)、自执行匿名函数创建了特殊的函数作用域,该作用域的代码不会和匿名函数外部的同名函数冲突
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
//访问局部变量window,不需要向上遍历作用域链,缩短查找时间,同时在压缩代码时局部变量window可被压缩
(function(window){
    window.a = 1;
    alert(a);
})(window);

//向上遍历到顶层作用域,访问速度变慢,全局变量window不能被压缩
(function(){
    window.a = 1;
    alert(a);
})();
```

(三)、`undefined`保证不被修改,可以被压缩,也可以缩短查找`undefined`的作用域链
``` javascript
 //自执行内部的undefined变量不会被外部的情况修改,低版本IE浏览器可以修改undefined的值
(function(window,undefined){
    alert(undefined); //undefined
})(window);
```

## 2.私有属性

### 2.1 rootjQuery

- 压缩
- 查找局部变量`rootjQuery`而不是执行`jQuery(document)`,提高代码性能

>源码

``` javascript
//[21~23]
var
	// A central reference to the root jQuery(document)
	rootjQuery,

//[865~866]
// All jQuery objects should point back to these
rootjQuery = jQuery(document);
```

>提示:  `rootjQuery`可以压缩,`jQuery(document)`不能被压缩.

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
core_strundefined = typeof undefined, //'undefined'字符串
```

>内容解析
``` javascript
window.a == undefined 				//并不是所有情况都兼容,xml节点不能判断 xmlNode
typeof window.a == 'undefined'		//所有情况兼容
```

### 2.4 window属性

- 压缩
- 缩短查找作用域链

>源码
``` javascript
//[32~35]
// Use the correct document accordingly with window argument (sandbox)
location = window.location,
document = window.document,
docElem = document.documentElement,
```

### 2.5 _变量

- 防冲突

>源码
``` javascript
[37~41]
// Map over jQuery in case of overwrite
_jQuery = window.jQuery,

// Map over the $ in case of overwrite
_$ = window.$,
```

>内容解析

``` javascript
<script>
	var $ = 'not jQuery'; //用户自定义或者第三方库的变量
</script>

<script src='Jquery2.0.3.js'></script>
//执行了_$ = window.$, 将用户或第三方的$变量内容存储下来,防止引用jQuery之前的变量冲突
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
class2type = {},
```

详见`5.7 $.type()`

### 2.7 core_deletedIds
- 空数组

>源码
``` javascript
//[46~47]
// List of deleted data cache ids, so we can reuse them
core_deletedIds = [],
```

### 2.8 core_version
- 字符串
- 版本号

>源码
``` javascript
//[49]
core_version = "2.0.3",
```
### 2.9 数组、对象、字符串方法
- 压缩
- 缩短查找时间

>源码

```javascript
//[51~58]
// Save a reference to some core methods
core_concat = core_deletedIds.concat,
core_push = core_deletedIds.push,
core_slice = core_deletedIds.slice,
core_indexOf = core_deletedIds.indexOf,
core_toString = class2type.toString,
core_hasOwn = class2type.hasOwnProperty,
core_trim = core_version.trim,	//去除字符串的空格
```

### 2.10 jQuery(重点)

- 构造函数
- 原型
- 面向对象

>源码
``` javascript
//[60]
// Define a local copy of jQuery
jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector, context, rootjQuery );
},
//[96]
jQuery.fn = jQuery.prototype = {
    // The current version of jQuery being used
    jquery: core_version,
    constructor: jQuery,
    init: function( selector, context, rootjQuery ) {}
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
o.css();		//然后才去做其他方法的工作,那么jQuery是这么做的？
```

(二)、`jQuery`的面向对象的编程方法

``` javascript
function jQuery() {
    return new jQuery.prototype.init();         //jQuery.prototype = jQuery.fn
    //类似于return new jQuery();
    //同时return new A()的形式让我们在创建实例时可以省略new,例如$('div'),而不是new $('div')
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
core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

// Used for splitting on whitespace
core_rnotwhite = /\S+/g,

// A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
// Strict HTML recognition (#11290: must start with <)
rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

// Match a standalone tag
rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

// Matches dashed string for camelizing
rmsPrefix = /^-ms-/,
rdashAlpha = /-([\da-z])/gi,
```

### 2.12  fcamelCase
- 回调函数
### 2.13  completed
- 回调函数

详见`5.3 $.ready()`


## 3. jQuery对象的属性和方法

为`jQuery`的原型添加方法和属性,这些方法和属性可以被`jQuery`的实例对象所使用.原型对象的属性会被实例对象继承,当然如果实例对象已经具备相应的属性,则会把原型对象的同名属性覆盖掉.

``` javascript
jQuery.fn = jQuery.prototype = {
    jquery:      版本号,
    constructor: 修正指向问题,
    init():      初始化和参数管理(构造函数),
    selector:    实例化对象时的初始化选择器,
    length:      默认的Jquery对象的长度是0,
    toArray():   转数组(也可以是对外的实例方法),
    get():       转原生集合,其实也是转成数组形式(对外方法),
    pushStack(): jQuery对象的一个入栈处理(外部用的不多,内部用的对),
    each():      遍历集合,
    ready():     DOM加载的接口,
    slice():     集合的截取,
    eq():        集合的第一项,
    last():      集合的最后一项,
    eq():        集合的指定项,
    map():       返回新集合,
    end():       栈回溯,可以看做popStack(),
    push():      (内部使用),
    sort():      (内部使用),
    splice():    (内部使用)
}
```

### 3.1 $().jquery
- 版本号
``` javascript
console.log($().jquery);    //2.0.3
```

### 3.2 $().constructor

默认的构造函数的原型的`constructor`属性指向该构造函数,但是`constructor`属性很容易被修改.所以可以在原型对象的`constructor`属性中进行修正.

>源码

```javascript
//[100]
constructor: jQuery,
```



>内容解析

``` javascript
function Obj() {}
alert(Obj.prototype.constructor);	//function Obj() {}

Obj.prototype.init = function(){
};
Obj.prototype.css = function(){
};

//使用对象字面量的方法,利用新的对象将Obj.prototype进行了覆盖
Obj.prototype = {
    init: function(){
	},
	css: function(){
	}
};
alert(Obj.prototype.constructor);	//function Object{[native code]}
```

### 3.3 $().init() (jQuery构造函数方法)

对外提供的实例对象的接口是`$()`或者`jQuery()`,当调用`$()`的时候其实是调用了`init()或者说jQuery()`,然后返回的是`jQuery的实例对象`,这样就可以使用`jQuery对象`的`prototype`的方法和属性(因为继承关系),`init()`方法的功能是`初始化jQuery的实例对象`.


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
		//如果不是字符串,是节点
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
		//例如$(function(){}),实际仍然调用,$(document).ready(function(){})
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

//返回引用类型的值,则返回有效
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

//返回非引用类型,返回值无效
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

`this`作为类数组对象可以进行`for`循环处理,需要注意`$()`是`jQuery`对象,而`$()[0]`是DOM元素。


| jQuery中构造函数的this属性(注意不是jQuery原型对象的属性) | 描述|
| :-------- | :--------|
| `this`中数字属性,例如0,1,2…,也可以说是类数组对象的数字属性(本来数组里的索引就是特殊的字符串属性嘛,例如数组a[0]其实就是a[‘0’]嘛)| 每一个属性代表一个被选中的DOM元素|
| `length`| 选取DOM元素数组的长度,也是`this`类数组的长度 |
| `context`| 选取的上下文环境,例如`document`或者`$(document)` |
| `selector`| 选择器 |


(三)、`context`具体使用案例（重点,加速查找DOM元素）

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
然后可以想象在css()方法中遍历这个类数组去更改样式. 那么J和css()中怎么将这个类数组对象联系在一起,应为在两个函数中的变量都是局部变量哎,其实也很简单,因为两个方法都是实例对象的原型方法,那么在同一个实例对象上调用这两个方法的this是同一个啊,所以肯定是通过this对象啦,那么在css()方法中,会是这样处理

for(var i=0 len=this.length; i<len; i++) {
    this[i].style.color = 'red';  //类对象的数组元素是真正的DOM元素操作
}
*/
```


(六)、`$.makeArray`

- 一个参数可以提供给外部使用,转化为数组
- 两个参数提供给内部使用,转化为`this`需要的类数组对象

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

`call /apply` 可以显示指定调用所需的`this`值,任何函数可以作为任何对象的方法来调用,哪怕这个函数不是那个对象的方法,第一个参数是要调用函数的母对象,即调用上下文,在函数体内通过`this`来获得对它的引用

``` javascript
function f() {
    alert(this.x);
}

f();				//undefined
f.call({x:100});	//100,函数中的this指代传入的对象,call可以使函数中的this值指向传入的第一个参数

//call和apply的区别
function f(x,y) {
    alert(this.x + x + y);
}

f.call({x:1},2,3);	  //6,传入一个个参数
f.apply({x:1},[3,4]); //8,传入一个数组
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
     end = end || this.length; //this指向调用的对象,当用了call后,能够改变this的指向
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

$div.toArray();		//把$div的this对象传入了toArray的core_slice.call( this );后面懂了,就把this变成了数组
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

- 内部用,不建议在外面使用,内部使用增加性能

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
	//如果参数只有1个,则是扩展jQuery自身的方法,详见(一)
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
				//深拷贝,被拷贝的值必须是对象或数组,利用递归,详见(三)
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						//如果目标自带的值有,则选择目标自带的值
						clone = src && jQuery.isArray(src) ? src : [];
					} else {
					    //如果目标自带的值有,则选择目标自带的值,详见(三)
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
//jQuery.prototype.extend 实例方法,原型对象的方法会被实例化对象继承


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
console.log(a===b);		//true b是a的副本,引用了同一个内存块
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


//以下可能是一个深拷贝的函数,其实简单理解就是深拷贝就是两个不同的内存块,浅拷贝就是两个都有引用同一内存块
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

利用`4. $.extend()`**拷贝继承**构建工具方法,工具方法是`jQuery`的最底层方法,通常实例方法中会调用工具方法

``` javascript
jQuery.extend({
	expando:                唯一的jQuery字符串(内部使用)
	noConflict:             防冲突
	isReady:                DOM是否加载完毕(内部使用)
	readyWait:              等待异步文件先执行后执行DOM加载完毕事件的计数器(内部使用)
	holdReady():            推迟DOM触发
	ready():                准备触发DOM加载完毕后的事件
	isFunction():           是否为函数
	isArray():              是否为数组(不支持IE6、7、8)
	isWindow():             是否为window对象
	isNumeric():            是否为数字
	type():                 判断数据类型
	isPlantObject():        判断是否为对象字面量
	isEmptyObject():        判断是否为空对象
	error():                抛弃异常
	parseHTML():            将字符串转换成DOM数组
	parseJSON():            JSON.parse()
	parseXML():
	globalEval():           类似于eval()
	camelCase():            转驼峰
	nodeName():             判断节点的Name
	each():                 (类)数组遍历
	trim():                 去掉首位空字符
	makeArray():            转数组
	inArray():              查看元素在数组中的索引
	merge():                合并数组
	grep():                 数组过滤
	map():                  遍历数组并修改数组元素
	guid:                   绑定事件ID
	proxy():                改变this指向
	access():               多功能函数底层方法
	now():                  获取时间毫秒数
	swap():                 样式交换
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
//在引用jQuery库之前有使用$命令的变量,则保存引用之前的变量
// Map over jQuery in case of overwrite
_jQuery = window.jQuery,

// Map over the $ in case of overwrite
_$ = window.$,


//[353]
noConflict: function( deep ) {
	//在[37-41]利用_$缓存引用库之前的$值
	//库加载完毕后[8826]先执行
	//此时把$值在jQuery中的引用放弃掉
	//详见(二)
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}
    //加入参数true以后和(二)一样,放弃掉jQuery变量的命名
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
	$.noConflict();	//获取加载jQuery库之前的$变量值,并放弃$变量对于jQuery的意义
	console.log($);	//2017
</script>


//保留引用库前的jQuery
<script>
	var jQuery = 2017;
</script>


<script src='Jquery2.0.3.js'></script>

<script>
       $.noConflict(true);	 //放弃掉jQuery
	console.log(jQuery); //2017,仍然是引用jQuery库之前的jQuery变量
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
    //第一次是空对象,可以进入if
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
			// hack写法,兼容IE
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			// DOM没有加载完毕时,监测
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			// 如果浏览器有缓存事件,则load会比DOMContentLoaded先触发,所以两个事件都要监听
			window.addEventListener( "load", completed, false );
		}
	}
	//promise的状态不能被修改
	return readyList.promise( obj );
};



//步骤四、[89]
//complete()回调
//这是一个自执行匿名函数中的局部函数,在自执行匿名函数内都可见,所以上述监听事件可以直接调用

// The ready event handler and self cleanup method
completed = function() {
    //尽管在jQuery.ready.promise两个事件都监听了,但是这里都取消了,所以任何一个监听事件触发,另外一个监听事件因为取消了不会再次执行,jQuery.ready();只会执行一次
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
};

//步骤五、[382]
//$.ready()

// Handle when the DOM is ready
ready: function( wait ) {
	//和$.holdRady()有关
	//--jQuery.readyWait如果hold了N次,则不会触发DOM加载事件,而是返回
	//如果jQuery.isReady为true则已经触发了一次了
	// Abort if there are pending holds or we're already ready
	if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
		return;
	}

	// Remember that the DOM is ready
	jQuery.isReady = true;

	// If a normal DOM Ready event fired, decrement, and wait if need be
	// 如果释放hold,则全部释放完后才能继续执行下面的DOM加载事件,否则return
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

- 创建`Document`对象,解析Web页面,解析HTML元素和相应的文本内容添加`Element`对象和`Text`节点到文档中,此时`document.readyState = 'loading'`
- 当HTML解析器遇到没有`async`和`defer`属性的`<script>`元素时,把元素添加到文档中,执行内部脚步或引用的外部脚本,这些脚本会同步执行,并且脚本下载和执行时HTML解析器暂停解析HTML元素,此时如果脚本中使用了`document.write()`方法,就会把该方法的内容插入输入流中,解析器恢复时这些文本会成为文档的一部分
- 当解析器遇到了`async`属性的`<script>`元素时,开始下载脚本文本,并继续解析文档,意思是`async`属性的`<script>`元素异步执行,不会阻塞文档的解析,需要注意异步脚本禁止使用`document.write()`方法,因为此时文档不会暂停等待`document.write()`内容的插入,而是继续下载执行
- 如果文档(文档流,不包括图片等其他内容)析完,则`document.readyState = 'interactive'`
- 此时因为文档解析完毕,执行带有属性`defer`的`<script>`脚本,需要注意`async`属性的脚本如果在文档流解析完毕还没有执行完毕时此时也会继续执行,`defer`的`<script>`脚本可以访问完整的文档树,因为此时文档流已经解析完毕,但是也禁止使用`document.write()`方法
- 如果 带有属性`defer`的`<script>`脚本加载完毕,浏览器在`Document`对象上触发了`DOMContentLoaded`事件,这标志着程序执行从同步脚本执行 阶段转换到了异步时间驱动阶段,这时异步脚本能可能没有执行完成。
- 文档已经完全解析完成,浏览器可能还在等待其他内容载入,比如图片,当所有的内容载入完成并且所有的异步脚本完成载入和执行,`document.readState='complete'`, Web浏览器触发`Window`对象上的`load`事件
- 之后就是调用异步事件,以异步响应用户输入事件,网络事件,计时器过期等


(二)、`readyList.resolveWith( document, [ jQuery ] );`

- 参数一是`context`,即传递上下文
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
		//如果有多个需要hold的异步文件,则++多次
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
},
```



>内容解析

``` javascript
//异步加载外部文件,需要注意async属性只能用于外部文件
$.getScript('a.js', function(){

});

$(function () {
	alert(2);
      });

//此时先2后1,DOMContentLoaded事件比异步事加载javascript事件先触发
```

解决异步文件先执行,然后再执行`DOM`加载完毕事件

``` javascript
//延迟DOM加载完成事件
$.holdReady(true);

//异步加载外部文件,需要注意async属性只能用于外部文件
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

### 5.7 $.isWindow()

>源码

``` javascript
//[415]
isWindow: function( obj ) {
	//obj != null 详见(一),除了传入null和undefined不执行第二个&&
	//其他都会执行第二个&&进行判断,因为null和undefined不是包装对象,不可能有.window这样的属性
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

### 5.8 $.isNumeric()

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
console.log(typeof NaN);	//number,所以不能用typeof来判断是否为数字
```

### 5.9 $.type()



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
	//如果是对象或函数,兼容性,Safari5.1
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
            var child_index= document.getElementById('iframe');		//注意与$('#iframe')的区别,一个是DOM对象,一个是jQuery对象

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

>提示： 使用`child_index.html`页面实例化的对象和`index.html`页面实例化的对象是两个不同的执行环境,所以没办法进行检测


### 5.10 $.isPlantObject()

- 检测对象字面量

>源码

``` javascript
isPlainObject: function( obj ) {
	// Not plain objects:
	// - Any object or value whose internal [[Class]] property is not "[object Object]"
	// - DOM nodes
	// - window
	//1.如果不是对象,DOM节点和window用$.type方法会返回object
	//2.如果是Node节点
	//3.如果是window对象
	if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
		return false;
	}

	// Support: Firefox <20
	// The try/catch suppresses exceptions thrown when attempting to access
	// the "constructor" property of certain host objects, ie. |window.location|
	// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
	try {
		//4.系统自带的对象,例如window.location,不是node节点,$.type又会返回object
		//详见(一)、(二)
		//obj.constructor指向对象的构造函数
		//obj.constructor.prototype指向构造函数对应的原型对象
		if ( obj.constructor &&
				//obj.constructor.prototype.hasOwnProperty('isPrototypeOf')
				//判断obj的原型是不是Object.prototype,而不是Array\Date等
				//var arr = [];
				//var bool = {}.hasOwnProperty.call( arr.constructor.prototype, "isPrototypeOf" );
				//console.log(bool);	//false
				//如果是Array类型则return false表明不是对象字面量
				!core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}
	} catch ( e ) {
		return false;
	}

	// If the function hasn't returned already, we're confident that
	// |obj| is a plain object, created by {} or constructed with new Object
	return true;
},
```

>内容解析

(一)、`{}.hasOwnPrototype`

- 判断是否是自身的属性
- 判断是否是原型对象的属性

``` javascript
function Obj() {
    this.name = 'ziyi2';
    this.age = 23;
}

Obj.prototype.name = 'prototype.ziyi2';
Obj.prototype.addr = 'zjut';

//是否是原型对象的属性和方法
function hasPrototypeProperty(obj,key) {
    //1.如果是自己的属性返回false,表明不是原型对象的属性
    //2.如果能使用in遍历,1返回true,则是原型对象的属性,使用in可以遍历自己的属性和原型对象的属性
    return !obj.hasOwnProperty(key) && (key in obj);
}

var obj = new Obj();

alert(hasPrototypeProperty(obj,'name'));		//false
alert(hasPrototypeProperty(obj,'age'));			//false
alert(hasPrototypeProperty(obj,'addr'));		//true
```

(二)、`isPrototypeOf`

创建了自定义的构造函数后,其原型对象的默认只会取得`constructor`属性,其余都是从`Object`继承而来,当调用构造函数创建新实例后,该实例内部将包含一个指向构造函数原型对象的指针（`[[Prototype]]` 内部属性,注意是实例的属性而非构造函数的属性）,脚本中没有标准的方式访问`[[Prototype]]`,但在一些浏览器诸如Firefox、Safari、Chrome在每个对象上都支持属性`__proto__`,这个指针连接存在于实例对象与构造函数的原型对象之间,不是实例对象与构造函数之间,调用构造函数创建的实例都有`[[Prototype]]`属性,但是无法访问。唯一的方法是可以通过`isPrototypeOf()`方法来确定实例对象和原型对象之间是否存在这种关系。

``` javascript
function Obj() {
    this.name = 'ziyi2';
	this.age = 23;
}

Obj.prototype.name = 'prototype.ziyi2';
Obj.prototype.addr = 'zjut';

function hasPrototypeProperty(obj,key) {
    return !obj.hasOwnProperty(key) && (key in obj);
}


var obj = new Obj();

console.log(Obj.prototype.isPrototypeOf(obj));		//true
console.log(Object.prototype.isPrototypeOf(obj));	//true



//来个原型链
var data = new Date;
console.log(Date.prototype.isPrototypeOf(data));				//true
console.log(Object.prototype.isPrototypeOf(Date.prototype));	//true
console.log(Object.prototype.isPrototypeOf(data));				//true
// data -> Date.prototype 实例对象和构造函数对应的原型对象之间的关系
// Date.prototype -> Object.prototype Date.prototype相对于Object.prototype而言就是实例对象
```

`isPrototypeOf`属性是`Object.prototype`的自有属性,其他对象所持有的该属性都是继承的。


```
//是否是原型对象的属性和方法
function hasPrototypeProperty(obj,key) {
    //1.如果是自己的属性返回false,表明不是原型对象的属性
    //2.如果能使用in遍历,1返回true,则是原型对象的属性,使用in可以遍历自己的属性和原型对象的属性
    return !obj.hasOwnProperty(key) && (key in obj);
}

//Obeject.prototype自有的属性isPrototypeOf
console.log(Object.prototype.hasOwnProperty('isPrototypeOf'));		//true
//Date的该属性是原型对象Obeject.prototype那里继承过来的
console.log(hasPrototypeProperty(Date,'isPrototypeOf'));			//true
```

(三)、`try{} catch{}`

需要补上详细信息.


### 5.11 $.isEmptyObject()

>源码

```
isEmptyObject: function( obj ) {
	var name;
	//可以遍历原型对象的属性和方法
	//for-in只遍历可枚举的属性
	//原型对象的系统自带属性可能是不可枚举的,所以虽然可以遍历原型对象的属性和方法
	//但是for in遍历不到系统自带的属性和方法,可以用来检测对象是否为空对象
	for ( name in obj ) {
		return false;
	}
	return true;
},
```

### 5.12 $.error()

- 抛出异常错误

>源码

```
//[468]
error: function( msg ) {
	throw new Error( msg );
},
```

### 5.13 $.parseHTML()

- 将字符串转换成DOM数组

>源码

```
// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	// context默认是document,如果被指定,则会在这个指定的context创建文档碎片
	// keepScripts如果是true,则会在文档中创建script标签
	parseHTML: function( data, context, keepScripts ) {
		// 如果是空,或者不是字符串
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		// 如果省略了context参数,则第二个参数变成了keepScripts
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}

		// context默认是document对象
		context = context || document;

		// 匹配单标签 "<li></li>"
		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		// 单标签
		if ( parsed ) {
			// 单标签当然使用document.createElement方法创建DOM对象\
			// 返回的仍然是数组
			return [ context.createElement( parsed[1] ) ];
		}


		//多标签使用文档碎片的形式创建DOM对象数组
		parsed = jQuery.buildFragment( [ data ], context, scripts );

		// keepScripts = true scripts = false 因此不会移除script标签, 否则移除script 标签
		if ( scripts ) {
			jQuery( scripts ).remove();
		}

		// 返回的仍然是数组, jQuery.merge可以合并数组
		return jQuery.merge( [], parsed.childNodes );
	},
```

>内容解析

``` javascript
//单标签
document.body.appendChild($.parseHTML('<li>1</li>')[0]); //将li元素插入body元素
//多标签
document.body.appendChild($.parseHTML('<li>1</li><li>1</li>')[0]);
document.body.appendChild($.parseHTML('<li>1</li><li>1</li>')[1]);
```



### 5.14 $.parseJSON()

>源码

```
parseJSON: JSON.parse,
```


### 5.15 $.parseXML()

>源码

```
// Cross-browser xml parsing
parseXML: function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data , "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
},
```


### 5.16 $.noop()

>源码

```
noop: function() {},
```


### 5.17 $.globalEval()


>源码

```
// Evaluates a script in a global context
globalEval: function( code ) {
	//详见(一)
	var script,
			indirect = eval;

	code = jQuery.trim( code );

	if ( code ) {
		// If the code includes a valid, prologue position
		// strict mode pragma, execute code by injecting a
		// script tag into the document.
		// 如果是在严格模式下,详见(二)
		if ( code.indexOf("use strict") === 1 ) {
			script = document.createElement("script");
			script.text = code;
			document.head.appendChild( script ).parentNode.removeChild( script );
		} else {
		// Otherwise, avoid the DOM node creation, insertion
		// and removal by using an indirect global eval
		    // 非严格模式使用全局eval()
			indirect( code );
		}
	}
},
```

>内容解析

(一)、`eval`

- 直接调用`eval`,总是在调用它的上下文作用域内执行
- 其他的间接调用则使用全局对象作为其上下文作用域

```
var geval = eval; //使用别名调用eval将是全局eval,这算是间接调用
var x = 'x global';
var y = 'y global';
function f(){
    var x = 'x local';
    eval("x += ' changed'"); //直接eval改变了局部变量的值
    return x;
}
function g(){
    var y = 'y local';
    geval("y += ' changed'"); //间接调用改变了全局变量的值
    return y;
}
console.log(f(),x);//x local changed      x global
console.log(g(),y);//y local              y global changed
//所以更可能会使用全局eval而不是局部eval
```

(二)、 严格模式

```
function fn(){
    eval('var i = 0');
    console.log(i);     //0
}

function f(){
    "use strict";
    eval('var i = 0');
    console.log(i);     //Uncaught ReferenceError: i is not defined(…)
}

fn();
f();
```


### 5.18 $.camelCase()

- 字符串转驼峰

>源码

```

//[81]
rmsPrefix = /^-ms-/,
rdashAlpha = /-([\da-z])/gi,

// Used by jQuery.camelCase as callback to replace()
fcamelCase = function( all, letter ) {
	return letter.toUpperCase();
},

//[550]
// Convert dashed to camelCase; used by the css and data modules
// Microsoft forgot to hump their vendor prefix (#9572)
camelCase: function( string ) {
	//解析一
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
},
```


>内容解析

(一)、`string.replace`

- 参数一 规定子字符串或要替换的模式的 RegExp 对象
- 参数二 规定了替换文本或生成替换文本的函数



### 5.19 $.nodeName()


>源码

```
nodeName: function( elem, name ) {
	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
},
```


>内容解析

```
console.log($.nodeName($('div')[0],'DIV')); //true
```





### 5.20 $.each()

- 遍历
- 参数一 index
- 参数二 value
- 参数三 内部使用

>源码

```
// args is for internal usage only
each: function( obj, callback, args ) {
	var value,
		i = 0,
		length = obj.length,
		//判断是否是类数组对象
		isArray = isArraylike( obj );

	//如果第三参数存在,内部使用
	if ( args ) {
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback.apply( obj[ i ], args );
				if ( value === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				value = callback.apply( obj[ i ], args );

				if ( value === false ) {
					break;
				}
			}
		}

	// A special, fast, case for the most common use of each
	// 外部使用
	} else {
	    //数组或类数组对象
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				//call的第一个参数是this指向,后面的参数是callback函数的参数
				//$.each(arr,function(index,value){})
				//callback -> functon(index,value){}
				//并且callback传入了两个参数i obj[i]
				//i -> index obj[i] -> value
				//this -> obj[i] 详见(二)
				value = callback.call( obj[ i ], i, obj[ i ] );
				//如果有return false 则终止遍历
				//详见(三)
				if ( value === false ) {
					break;
				}
			}
		} else {
		    //对象
			for ( i in obj ) {
				value = callback.call( obj[ i ], i, obj[ i ] );

				if ( value === false ) {
					break;
				}
			}
		}
	}

	return obj;
},
```


>内容解析

(一)、参数解析

```
var arr = [1,2,3];

$.each(arr,function(index,value) {
   console.log(index);  //0 1 2
   console.log(value);  //1 2 3
});
```

(二)、`this`指向


```
var arr = [1,2,3];

$.each(arr,function(index,value) {
   console.log(this.valueOf());  //1 2 3
});
```


(三)、终止遍历

```
var arr = [1,2,3];

$.each(arr,function(index,value) {
  console.log(index);  //0
  return false;        //终止遍历
});
```


### 5.21 $.trim()

>源码

```
trim: function( text ) {
	return text == null ? "" : core_trim.call( text );
},
```

### 5.22 $.makeArray()
- 参数一
- 参数二 内部使用

>源码

```
// results is for internal usage only
makeArray: function( arr, results ) {
	//第二参数可能不存在,那么就是空数组
	var ret = results || [];

	//第一参数如果不存在返回空数组
	if ( arr != null ) {
		//Object(arr)
		//字符串形式 '123' -> ['123']
		//详见(一)
		//需要注意数组是走这里
		if ( isArraylike( Object(arr) ) ) {
			jQuery.merge( ret,
				typeof arr === "string" ?
				[ arr ] : arr
			);
		//数字形式,详见(二)
		} else {
			core_push.call( ret, arr );
		}
	}

	return ret;
},
```

>内容解析

(一) Object

- 转换成包装对象

```
var str = '123'
console.log(Object(str));
//String {0: "1", 1: "2", 2: "3", length: 3, [[PrimitiveValue]]:
console.log($.makeArray(str));  //['123']
```

(二) `[].push()`

```
var num = 123;
console.log(Object(num));   //Number(123);

var arr = [];

arr.push(num);      //传入单个num
arr.push([1,2,3]);  //传入数组

console.log(arr);   //[123,[1,2,3]]

//注意apply和call的用法区别
[].push.call(arr,4,5,6);
console.log(arr);  //[123,[1,2,3],4,5,6]
[].push.apply(arr,[7,8,9]);
console.log(arr);   //[123,[1,2,3],4,5,6,7,8,9]


//走的不是源码的else
//如果是else
//变成了[[1,2,3],[4,5,6]]
console.log($.makeArray([1,2,3],[4,5,6])); //1,2,3,4,5,6
```

### 5.23 $.inArray()

- 数组版的indexOf()

>源码

```
inArray: function( elem, arr, i ) {
	//i是indexOf的第二个参数,搜索的起始位置
	//详见(一)
	return arr == null ? -1 : core_indexOf.call( arr, elem, i );
},
```

>内容解析

(一) `indexOf()`

```
//字符串索引
console.log('12345'.indexOf('3',4)); //-1
console.log('12345'.indexOf('3',1)); //2
console.log('12345'.indexOf('3',2)); //2
console.log('12345'.indexOf('3'));   //2


//数组索引
console.log([].indexOf.call([1,2,3,4,5],3)); //2

//jQuery数组索引
console.log($.inArray(2,[1,2,3,4,5]));  //1
```


### 5.24 $.merge()
- 合并数组
- 对外 转数组
- 对内 转json

- 针对情况`[] {}`, `{}`可能有`length`也可能没有`length`

```
merge: function( first, second ) {
	var l = second.length,
		i = first.length,
		j = 0;

	// $.merge(['a','b'],['a','b'])
	// second不是数组,没有length属性
	if ( typeof l === "number" ) {
		for ( ; j < l; j++ ) {
			first[ i++ ] = second[ j ];
		}
	// $.merge(['a','b'],{0:'a',1:'b'})
	} else {
		while ( second[j] !== undefined ) {
			first[ i++ ] = second[ j++ ];
		}
	}

	first.length = i;

	return first;
},
```




### 5.25 $.grep()

- 过滤数组,返回新数组
- 第三个参数 布尔值


>源码

```
grep: function( elems, callback, inv ) {
	var retVal,
		ret = [],
		i = 0,
		length = elems.length;
	//!! 转换为布尔值
	inv = !!inv;

	// Go through the array, only saving the items
	// that pass the validator function
	// 只有数组才会遍历(类数组)
	for ( ; i < length; i++ ) {
		retVal = !!callback( elems[ i ], i );
		if ( inv !== retVal ) {
			ret.push( elems[ i ] );
		}
	}

	return ret;
},
```

>内容解析


```
var arr = [1,2,3,4];

var f = function(value,index) {
    return 1     //1类似于true
};

var f1 = function(value,index) {
    return value > 2
};

console.log($.grep(arr,f));         //[1,2,3,4]
console.log($.grep(arr,f1));        //[3,4]
console.log($.grep(arr,f1,true));   //[1,2]
```




### 5.26 $.map()

- 改变数组`value`,返回新数组

>源码
```
// arg is for internal usage only
map: function( elems, callback, arg ) {
	var value,
		i = 0,
		length = elems.length,
		//是否是数组和类数组
		isArray = isArraylike( elems ),
		ret = [];

	// Go through the array, translating each of the items to their
	// 数组格式
	if ( isArray ) {
		for ( ; i < length; i++ ) {
			value = callback( elems[ i ], i, arg );

			if ( value != null ) {
				// 注意是ret.length 会自动递增的
				ret[ ret.length ] = value;
			}
		}

	// Go through every key on the object,
	// Json格式
	} else {
		for ( i in elems ) {
			value = callback( elems[ i ], i, arg );

			if ( value != null ) {
				ret[ ret.length ] = value;
			}
		}
	}

	// Flatten any nested arrays
	// 返回的是单数组,而不是复合数组
	return core_concat.apply( [], ret );
},
```


>内容解析

```
var arr = [1,2,3];

var newArr = $.map(arr,function(value,index) {
    return value + 1;
});

console.log(newArr); //[2,3,4]
```


### 5.27 $.guid

- 取消绑定事件有关系
- 唯一标识符,用于标识事件函数


// A global GUID counter for objects
guid: 1,


### 5.28 $.proxy()

- 类似于`call`和`apply`,改变`this`指向

> 源码

```
// Bind a function to a context, optionally partially applying any
// arguments.
proxy: function( fn, context ) {
	var tmp, args, proxy;

	// obj = {fn : function(){}}
	// $.proxy(obj,'fn') 情况
	// 详见(一)
	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	// 如果不是函数
	if ( !jQuery.isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	// $.proxy()参数可以追加, 去除第一第二参数fn和context
	// 详见(二)
	args = core_slice.call( arguments, 2 );
	// $.proxy(arg1)(arg2) 这个扩展方法返回的是一个可执行的函数
	// apply改变this指向
	// 如果没有指定context 使用默认this
	// apply第二个参数是[],call后面可以跟n个参数
	// 将arguments类数组对象使用slice.call转化为数组
	// 将arg1和arg2合并,注意arg1和arg2的归属函数
	// arguments是arg2
	// 详见(三)
	proxy = function() {
		return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	// 设置唯一事件标识符
	// 如果要取消事件就能找到
	// 详见(四)
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	// 返回的是函数
	return proxy;
},
```


>内容解析

(一) `$.proxy(obj, 'fn')`

```
var obj = {
  show: function() {
      console.log(this);
  }
};

$(document).click(obj.show);   //绑定事件函数中的this默认指向绑定对象$(document)
$(document).click($.proxy(obj,'show'));     //改变了绑定事件函数中的this指向,指向了obj,需要注意的是$.proxy没有执行,点击事件之后才会执行
```

(二) 转数组

```
  var json = {
      0: 0,
      1: 1,
      2: 2,
      length:3
  }

  //slice默认不传参数就是起始开始,末尾结束
  console.log(Array.isArray([].slice.call(json))) //true
  console.log([].slice.call(json));               //[0,1,2]
```

(三) `$.proxy()`参数详见


```
var obj = {
	show: function(a,b) {
	      console.log(a);
	      console.log(b);
	      console.log(this);
	  }
};


$.proxy(obj.show,obj,1,2)(); //1,2,obj
$.proxy(obj.show,obj,1)(2);
$.proxy(obj.show,obj)(1,2);  //全都是一样的
```


(四) 事件绑定


```
function show() {
  console.log(this);
}

show();                 //Window

$(document).click(
    show                //绑定事件,Document
);

$(document).off()       //取消绑定
```

需要注意的是一般情况下, 想要取消绑定事件,需要调用同一个绑定事件的引用,例如以下取消绑定事件是会失败的,所以就有了唯一标识符`guid`,因为使用`$.proxy()`很容易改变绑定的事件函数,不使用唯一标识符的话,就不能取消绑定了

```
//绑定事件
document.addEventListener('click',function(){
    alert(1);
});

//取消绑定,并不能取消,因为事件函数并不是同一个引用对象
document.removeEventListener('click',function(){
   alert(1);
});


//正确的形式

//绑定事件
document.addEventListener('click',show);


//取消绑定,因为事件函数指向了同一个事件函数的引用
document.removeEventListener('click',show);

function show() {
    alert(1);
}


```



### 5.29 $.access()

- 多功能函数的操作 底层工具方法
- 内部使用

>源码

```
// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
// key -> witdh
// value -> 200px
// chainable -> 获取还是设置
access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		// 有值或者没值
		bulk = key == null;

	// Sets many values
	// 设置多组值
	// $('#div1').css({width:'200px',background:'yellow'})
	// key是Object
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			//递归调用
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	// 如果是一组值
	// $('#div1').css('width','200px')
	} else if ( value !== undefined ) {
		chainable = true;

		// value是否是函数
		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		// 如果没有Key值
		if ( bulk ) {
			// Bulk operations run against the entire set
			// 如果value是字符串
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				// 如果是函数,则套上一个fn,并不是立即执行的
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}


		// 存在key值得情况下
		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	// 判断是设置还是获取
	return chainable ?
		elems :

		// Gets
		// 获取
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[0], key ) : emptyGet;
},
```


>内容解析

```
 //$().css() \ $().val() \ $().attr()等方法都调用了$.access()工具方法
 //$.access() 多功能值操作(内部)

 //获取样式 一个参数
 console.log($('#div1').css('width'));   //100px

 //设置样式 两个参数
 $('#div1').css('width','200px')

 //设置样式 一个对象参数
 $('#div1').css({width:'200px',background:'yellow'})
```



### 5.30 $.now()

- 获取时间


```
//和(new Date()).getTime()功能类似
//ECMAScript 5方法
now: Date.now,
```

### 5.31 $.swap()

- css属性交换

```
// A method for quickly swapping in/out CSS properties to get correct calculations.
// Note: this method belongs to the css module but it's needed here for the support module.
// If support gets modularized, this method should be moved back to the css module.
swap: function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	// options当然是要设置的属性
	for ( name in options ) {
		// 把旧的属性先保存下来
		old[ name ] = elem.style[ name ];
		// 设置属性
		elem.style[ name ] = options[ name ];
	}

	// 这里是获取元素的某些参数
	ret = callback.apply( elem, args || [] );

	// Revert the old values
	// 还原css属性
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
}
```


>内容解析

- 交换样式有时候就如例子这么有用

```
var $div = $('#div1')
   , divDom = $div.get(0);

console.log(divDom.offsetWidth); //100

var oldStyle = divDom.style.cssText;  //保留老的样式

divDom.style.display = 'none';
console.log(divDom.offsetWidth); //0 当display: none时不能获取


//让内容脱离正常流,绝对定位,不可见,此时看起来页面的样式没有变
divDom.style.display = 'block';
divDom.style.visibility = 'hidden';
divDom.style.position = 'absolute';
console.log(divDom.offsetWidth); //100 此时可以获取宽度了

//重新改回原来的样式
divDom.style.cssText = oldStyle;
```


## 5-6.私有方法`isArraylike`

需要注意这是一个私有方法,不具备成立单独的一大节,所以此节命名为`5-6`,在整个自执行匿名函数中都可以调用,对外不可见.

>源码

```
(function(window,undefined) {

    //[849]
    function isArraylike( obj ) {
        var length = obj.length,
                type = jQuery.type( obj );

        //如果是Window对象
        if ( jQuery.isWindow( obj ) ) {
            return false;
        }

        //如果是Node节点集合,类数组形式
        if ( obj.nodeType === 1 && length ) {
            return true;
        }

        //需要注意第一个||
        //obj不是函数且length=0 也算Array
        //obj不是函数length!=0且length是num且length>0且length-1是obj的key
        //需要注意如果去掉length = 0 的情况那么后面的就不好判断了,因为length-1 可能是-1了
        return type === "array" || type !== "function" &&
                ( length === 0 ||
                typeof length === "number" && length > 0 && ( length - 1 ) in obj );
    }

})(window);
```

内容解析:

```
isArraylike([]);
isArraylike({length:0});        //true
isArraylike({a:1,length:1});    //false, 0 in obj不存在
isArraylike({1:'a',length:1});  //false, 1 in obj也不存在
isArraylike({0:'a',length:1})   //true
//DOM节点也是可以的
```


## 6. 选择器Sizzle


## 7. 回调对象

>源码

```
//[2859]
/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {
	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],

	fire = function(data) {}
	// Actual Callbacks object
	self = {
		add:          //添加监听的回调函数
		remove:       //移除监听的回调函数
		has:
		empty:
		disable:
		disabled:
		lock:
		locked:
		fireWith:
		fire:        //执行监听的回调函数
		fired:
	}

	return self;
}
```

>内容解析


(一) 闭包

闭包可以捕捉到局部变量（和参数）,并一直保存下来. 如果存在嵌套的函数,函数都有各自对应的作用域链,并且这个作用域链指向一个变量绑定对象,如果函数定义了嵌套函数,并将它作为返回值返回或者存储在某处的属性里,这时就会有一个外部引用指向这个嵌套的函数,就不会被当做垃圾回收,它所指向的变量绑定对象也不会被当做垃圾回收,闭包容易造成内存泄漏.

- 创建闭包的常见方式就是在一个函数内部创建另一个函数


```
function campareFunction(propertyName){
   return function(obj1,obj2){ //一个匿名的内部函数
       var value1 = obj1[propertyName];
       var value2 = obj2[propertyName];

       if(value1 < value2){
           return -1;
       }else if(value1 > value2){
           return 1;
       }else{
           return 0;
       }
   }
}

//即使内部的匿名函数被返回了，并且在其他地方被调用了，但它仍然可以访问propertyName
//因为内部函数中的作用域链包含了campareFunction()的作用域

```

- 作用域链: 当某个函数被调用时会创建一个执行环境及相应的作用域链。然后使用arguments和其他命名参数的值来初始化函数的活动对象。但是在作用域链中，外部函数的活动对象始终处于第二位,外部函数的外部函数的活动对象处于第三位.....直至作为作用域链终点的全局执行环境

```
function compare1(value1,value2){
    if(value1 < value2){
        return -1;
    }else if(value1 > value2){
        return 1;
    }else{
        return 0;
    }
}
var result = compare1(5,10);

//第一次调用compare函数时会创建包含this、arguments、value1和value2的活动对象
//全局执行环境的变量对象（包含this[全局this指向undeifned或window对象]result和compare）在compare()执行环境的作用域链中则处于第二位


compare执行环境   <--------------------------------------------------------
(scope chain)     -------->   scope Chain                                     |
                               1    -------------->   Global variable object  |
                               0    ------                 compare      ------
                                         |                 result     undefined
                                         |
                                         |-------->   compare() activation object
                                                           arguments   [5,10]
                                                           value1       5
                                                           value2       10


//后台每个执行环境都有一个表示变量的对象----变量对象，全局环境的变量对象始终存在，
//而像compare()函数这样的局部环境的变量对象，则只在函数的执行过程中存在
//在创建compare()函数时，会创建一个预先包含全局变量对象的作用域链，这个作用域链被保存在内部的[[Scope]]属性中
//当调用compare()函数时，会为函数创建一个执行环境，然后通过赋复制函数的[[Scope]]属性中的对象构建执行环境的作用域链
//此后又有一个compare活动对象(在此作为变量对象使用)被创建并被推入执行环境作用域的<前端>！
//在这里的compare执行环境作用域链包含两个变量对象，本地活动对象和全局变量对象。
//作用域链本质上是一个指向变量对象的指针列表，它只引用但不实际包含变量对象

//一般来说，函数执行完毕后，局部活动对象就会被销毁，内存中仅保存全局作用域（Global variable object）。
//但是闭包的情况却不同。


function campareFunction(propertyName){
    return function(obj1,obj2){ //一个匿名的内部函数
        var value1 = obj1[propertyName];
        var value2 = obj2[propertyName];

        if(value1 < value2){
            return -1;
        }else if(value1 > value2){
            return 1;
        }else{
            return 0;
        }
    }
}


//在另一个函数内部定义的函数会将包含函数（即外部函数）的活动对象添加到它的作用域链中
//因此在campareFunction()函数内部定义的匿名函数的作用域链中，实际上会包含外部函数campareFunction()的活动对象

var compare = campareFunction("name");
//name传入propertyName,且被保存了下来,因为内部返回的匿名函数被外部的变量compare所引用
var result = compare({name:"Victor"},{name:"Hugo"});
write(result); //1

/*
campareFunction执行环境
 （scope chain）  ----> Scope Chain
                        1   -----------> Global variable object
                        0   ---         campareFunction ->[campareFunction执行环境]
                               |         result
			                             compare
                               |
                               |
                               --------> campareFunction() activation object
                                         arguments
                                         propertyName

 annoymous（匿名函数）执行环境
（scope chain）  ---------> Scope Chain
                            2   ------------> Global variable object(和上面一样)
                            1   ------------> campareFunction() activation object
                            0   ------------> Closure activation object
                                              arguments
                                              obj1
                                              obj2
*/

//在匿名函数从campareFunction()函数中被返回后，它的作用域链初始化为包含campareFunction活动对象和全局变量对象
//匿名函数就可以访问在campareFunction()函数中定义的所有变量
//并且campareFunction()函数在执行完毕后活动对象也不会被销毁，
//因为返回的是匿名函数，匿名函数的作用域链仍然在引用这个(campareFunction()函数的)活动对象
//campareFunction返回后，campareFunction执行环境中的作用域链被销毁了，但是它的活动对象仍然会留在内存中,
//直到匿名函数被销毁，campareFunction的活动对象才会被销毁

//解除对匿名函数的引用（以便释放内存）
compare  = null;//通知垃圾回收例程将其清除，随着匿名函数的作用域链被销毁，其他作用域链（除了全局作用域）也都可以

//由于闭包会携带包含它的函数的作用域
//会比其他函数占用更多的内存
//过度使用闭包会导致内存占用过多
//在绝对必要时考虑使用闭包

```

深入理解闭包

```
function creatFunction(){
    var result = new  Array();

    for(var i=0; i<10; i++){
        result[i] = function(){
            return i; //注意i是外部函数的活动对象的属性，而不是匿名函数对象的属性
        };
    }
    return result; //返回的是一个函数数组，这个数组里的元素都是函数
}

var result = [];
result = creatFunction();

write(result[0]()); //10

for(var i=0; i<10; i++){
    write(result[i]()); //每一个都是10
}


//闭包只能取得包含函数中任何变量的最后一个值
//闭包保存的是整个变量对象，而不是某个特殊的变量
//每个函数都返回10
//因为每个函数的作用域链中都保存着creatFunction()函数的活动对象
//所以它们引用的都是同一个变量i
//当creatFunction函数返回后，变量i的值都是10


//总结一下就是返回外部函数的时候，因为返回的是内部的匿名函数，根据匿名函数的作用域链包含着全局对象和包含它的外部函数的活动对象
//所以匿名函数的作用域链仍然在引用这个外部函数的活动对象，这个外部函数的活动对象在外部函数执行完毕后仍然不会销毁
//但是匿名函数指针只能指向包含外部函数最后一次执行情况的对应的活动对象里的属性值的匿名函数
//闭包保存的是整个外部函数的活动对象，而不是某个变量值，这个活动对象包括arguments,函数参数以及函数内的局部变量等

```

闭包中的`this`对象

```
//匿名函数的执行环境具有全局性，因此this对象通常指向window
var f = function(){
    return function(){
        write(this);
    }();
}

f();//[object Window]

var name = "The Window";

var object = {
    name: "The Object",

    getNameFun: function(){
        return function(){
            return this.name;
        }
    }
};
write(object.getNameFun()()); //The Window

//为什么匿名函数没有取得其包含作用域（或外部作用域）的this对象呢？
//每个函数在被调用时都会自动取得两个特殊变量：this和arguments
//因为这个是函数的内部属性，所以内部函数在搜索这两个变量时，只会搜索到其活动对象为止，
//每个活动对象都有自己的arguments和this属性
//因此永远不可能直接访问外部函数中的这两个变量
//又因为匿名函数中的this对象通常指代window对象，所以返回的是The Window


//补救方法
var age = 13;
var obj = {
    age:14,
    getAgeFun:function(){
        var that = this; //调试结果：that = Object {age: 14}     this指代的是上下环境中的对象本身
        return function(){
            return that.age;
        };
    }
};

write(obj.getAgeFun()()); //14

//this和arguments都存在同样的问题，如果想访问作用域中的arguments对象，
//必须将对该对象的引用保存到另一个闭包能够访问的变量中
```



(二)  $.Callback的闭包架构

```
(function(window) {
    ziyi2 = {};

    ziyi2.info = function() {
	    //list变量是info函数的作用域链对应的活动对象的属性
        var list = []
	        //返回的是一个对象,该对象的每一个属性都是函数
	        //这些函数的活动对象不会被释放
            , self = {
                push: function(item) {
	                //push函数的作用域可以访问外部info函数的变量
	                //push函数的作用域链包含了外部info函数对应的活动对象
                    list.push(item);
                },
                shift: function() {
                    list.shift();
                },
                log: function() {
                    console.log(list);
                }
            };
        return self;
    };
    window.ziyi2 = ziyi2;
})(window,undefined)

var info = ziyi2.info(); //info函数执行完毕后它的作用域链被销毁,但是因为内部有函数被外部info变量(var info)所引用,所以ziyi2.info函数的活动对象并没有被释放,而是放在了内部函数(push/shift/log)的作用域链中了,此时ziyi2.info函数的list数组变量并不会像其他函数一样在执行完毕后被认作局部变量而释放(垃圾回收机制判定list数组一直被保持引用,所以不会释放它)
info.push(1);
info.push(2);
info.log();     //[1,2] 此时list数组没有被释放,所以可以得到push后的值
info.shift();
info.log();     //[2] list数组仍然没有被释放


var info_copy = info;  //ziyi2.info内部的函数被info_copy所引用
info = null;           //释放了info变量的引用

info_copy.log();       //[2] list数组仍然没有被释放
//info_copy = null;      //此时释放了list数组,内存不会被泄露

info = ziyi2.info();
info.log();             //[] 需要注意的是这是一个新的list数组内存,和info_copy所引用的不一样

info_copy = null;

info.log();            //[]
info = null;           //释放所有内存
```

(三) 使用案例解析

按顺序触发想要执行的函数
```
function fn1() {
    console.log('111');
}

function fn2() {
    console.log('222');
}


var callbacks = $.Callbacks();

callbacks.add(fn1);
callbacks.add(fn2);

callbacks.fire(); //111 222
```


即使不在同一个作用域,也可以按顺序触发想要执行的函数

```
var callbacks = $.Callbacks();

function fn1() {
    console.log('111');
}

function fn2() {
    console.log('222');
}

callbacks.add(fn1);
callbacks.add(fn2);

(function() {
    function fn3() {
        console.log('333');
    }

    callbacks.add(fn3);

})();

callbacks.fire(); //111 222 333 这样在外部也可以执行fn3

fn3();            //fn3 is not defined(…) 默认外部不能执行
```

也可以根据条件移除不需要执行的回调函数
```
var callbacks = $.Callbacks();

 function fn1() {
     console.log('111');
 }

 function fn2() {
     console.log('222');
 }

 callbacks.add(fn1);
 callbacks.add(fn2);

 callbacks.remove(fn2);

 (function() {
     function fn3() {
         console.log('333');
     }

     callbacks.add(fn3);

 })();

 callbacks.fire(); //111 333
```

同时`add`多个回调函数

```
$callback = $.Callbacks();
function fn1() {
    console.log(1);
}

function fn2() {
    console.log(2);
}

$callback.add(fn1,fn2);
//$callback.add([fn1,fn2]) 数组也行
$callback.fire(); //1 2
```


(四) 参数解析
- `once` 回调函数只能被执行一次
- `memory`  Callback.fired()之后的回调函数也会被追踪并执行
- `unique` 确保回调的函数只能被添加一次
- `stopOnFalse`  如果回调函数返回false则中断执行回调


所有需要执行的回调函数都会放在一个闭包的`list`数组中,只要`$.Callbacks()`不被释放,则`list`数组的内存不会被释放,执行`add`函数会添加回调函数到`list`数组中,而执行`fire`函数则会遍历执行`list`数组,需要注意`fire`函数可以传入回调函数需要执行的参数.



`once`

```
//没有参数
var callbacks = $.Callbacks();

function fn1() {
 console.log('111');
}

function fn2() {
 console.log('222');
}


callbacks.add(fn1);

callbacks.fire(); //111
callbacks.fire(); //111

//有参数
var callbacks = $.Callbacks('once');

function fn1() {
    console.log('111');
}

function fn2() {
    console.log('222');
}


callbacks.add(fn1);

callbacks.fire(); //111 因为有once参数,第一次执行完fire之后清空了list数组
callbacks.fire(); //这个不会执行
```

`memory`

```
//没有参数
var callbacks = $.Callbacks();

function fn1() {
    console.log('111');
}

function fn2() {
    console.log('222');
}

callbacks.add(fn1);
callbacks.fire(); //111
callbacks.add(fn2);

//有参数
var callbacks = $.Callbacks("memory");

function fn1() {
    console.log('111');
}

function fn2() {
    console.log('222');
}

callbacks.add(fn1);
callbacks.fire();   //111
callbacks.add(fn2); //222 在add的同时fire了
```

`unique`

```
var callbacks = $.Callbacks("unique");

function fn1() {
    console.log('111');
}

function fn2() {
    console.log('222');
}


callbacks.add(fn1);
callbacks.add(fn1); //第二次不会在add同样的回调函数了

callbacks.fire();   //111 list数组中只有一个需要fire的回调函数
```

`stopOnFalse`
```
//有参数
var callbacks = $.Callbacks('stopOnFalse');

function fn1() {
    console.log('111');
    return false;
}

function fn2() {
    console.log('222');
}

callbacks.add(fn1);
callbacks.add(fn2);

callbacks.fire();  //111 遇到false之后break出了list,后面的回调函数就不会执行了
```



### 7. 1 `options`

>源码
```
// [2846]
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	// 给每一个传入的参数创建一个optionsCache对象的属性
	// 因为使用$Calllback的情况可能很多
	// 相当于为每一个调用的$Callback创建一个设置参数的属性
	// 这个object可以加速设置属性值的速度
	var object = optionsCache[ options ] = {};
	// core_rnotwhite匹配空格
	// 例如 options -> "memory unique"
	// 最后变成了 optionsCache["memory unique"] = {memory:true,unique:true}
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}


// [2882]
// Convert options from String-formatted to Object-formatted if needed
// (we check in cache first)
// 如果传入的不是字符串,如果是对象则options = options
// 否则options = {} 空对象
options = typeof options === "string" ?
( optionsCache[ options ] || createOptions( options ) ) :
jQuery.extend( {}, options );
```



### 7. 2 `$.Callback().add()`

>源码

```
// Add a callback or a collection of callbacks to the list
add: function() {
    // 第一次进入的时候list = []
	if ( list ) {
		// First, we save the current length
		var start = list.length;
		// 这个自执行的匿名函数有什么作用?
		(function add( args ) {
			jQuery.each( args, function( _, arg ) {
				var type = jQuery.type( arg );
				if ( type === "function" ) {
					// 如果options.unique = true
					// 则继续判断是否已经添加了该回调函数
					// 如果已经添加,则不会push
					// 否则可以push
					if ( !options.unique || !self.has( arg ) ) {
						list.push( arg );
					}
				// 如果$.Callback的参数不是fn
				// 如果arguments是数组
				} else if ( arg && arg.length && type !== "string" ) {
					// Inspect recursively
					// 递归调用一个个push
					add( arg );
				}
			});
		})( arguments );
		// Do we need to add the callbacks to the
		// current firing batch?
		//
		if ( firing ) {
			firingLength = list.length;
		// With memory, if we're not firing then
		// we should call right away
		// 如果memory存在,则直接fire()
		// memory在内部的fire函数中会被赋值
		// 需要注意这个memory只有在fire函数调用之后才会继续执行
		// 详见7.5 (三) memory直接执行fire
		} else if ( memory ) {
			firingStart = start;
			fire( memory );
		}
	}
	// 链式调用?
	return this;
},
```


### 7. 3 `$.Callback().remove()`


```
// Remove a callback from the list
remove: function() {
	if ( list ) {
		jQuery.each( arguments, function( _, arg ) {
			var index;
			// 查看是否在list数组中存在
			// 这里index很巧妙
			// 如果找不到这个函数,则不会从起始位置开始搜索
			// 而是从当前搜索过的index开始继续向后搜索
			while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
				// 删除数组中的当前回调函数
				list.splice( index, 1 );
				// Handle firing indexes
				if ( firing ) {
					if ( index <= firingLength ) {
						firingLength--;
					}
					if ( index <= firingIndex ) {
						firingIndex--;
					}
				}
			}
		});
	}
	return this;
},
```

### 7. 4 `$.Callback().has()`

```
// Check if a given callback is in the list.
// If no argument is given, return whether or not list has callbacks attached.
has: function( fn ) {
	// 如果fn存在 则遍历是否存在 存在返回true
	// 否则返回false
	// 如果不传参数则看list.length 如果有则返回true
	// 如果list为空,则返回false
	return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
},
```



### 7. 5 `$.Callback().fire()/firewith()/fire()`

```
// [3030]
// self = { fire: function() {}}
// Call all the callbacks with the given arguments
fire: function() {
    // 传入参数arguments
    // 详见(一)
    self.fireWith( this, arguments );
    // 链式调用
	return this;
},

// Call all callbacks with the given context and arguments
// [3017]
fireWith: function( context, args ) {
    // 第一次fired = false
    // !fired = true
    // 之后 fired = true 详见[2905] fired
    // 因此要看stack
    // [2903] stack = !options.once && [],
    // 如果options.once = true 则stack = false
    // 因此不会fire第二次了
    // 如果once = false  则stack = []
    // 则可以继续第二次的fire
    // 详见(三),此时stack = false
	if ( list && ( !fired || stack ) ) {
		// 保存参数
		args = args || [];
		// args.length = 2
		args = [ context, args.slice ? args.slice() : args ];
		//详见(二)
		//如果[2905] fire函数正在执行回调函数的时候
		//在回调函数中调用了$callback.fire()函数
		//此时这个if就会执行了,stack默认是空数组 [].push(args)
		if ( firing ) {
			stack.push( args );
		// 执行fire
		} else {
			fire( args );
		}
	}
	return this;
},

// Fire callbacks
// [2905]
fire = function( data ) {
    //memory 如果为true memory = data
	memory = options.memory && data;
	//表明已经fire过一次了
	fired = true;
	firingIndex = firingStart || 0;
	firingStart = 0;
	firingLength = list.length;
	//正在fire
	firing = true;
	for ( ; list && firingIndex < firingLength; firingIndex++ ) {
		//apply第二个参数可以是数组
		//第一个是需要传入的this
		//如果stopOnFlase =true 且回调函数返回false
		//则跳出循环
		if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
			memory = false; // To prevent further calls using add
			break;
		}
	}
	//回调执行结束
	firing = false;
	if ( list ) {
		//详见(二)
		//如果在回调函数执行的同时进行了fire操作
		if ( stack ) {
			if ( stack.length ) {
				//则继续执行fire
				fire( stack.shift() );
			}
		//考虑 $.Callback('once memory')情况
		//详见(三)
		} else if ( memory ) {
			list = [];
		} else {
			self.disable();
		}
	}
},
```


>内容解析

(一)  传入回调函数的参数

```
$callback = $.Callbacks();
function fn1(n) {
    console.log(n);
}

function fn2(n) {
    console.log(n);
}


$callback.add(fn1,fn2);
$callback.fire('hello'); //hello hello

$callback.remove(fn1,fn2).add(fn1,fn2).fire('hello1');
//hello hello
```

(二)  正在执行回调时进行`Callback`函数的动作



```
$callback = $.Callbacks();
function fn1(n) {

    console.log('fn1' + n);
    $callback.fire('hello1');  //死循环了,一直执行fn1和fn2,导致栈溢出
    //需要注意的是,如果没有做特殊处理,起始一直会执行fn1
    //但是这里也处理了fn2
    //内部操作,等所有的回调函数都执行完毕了,继续执行回调函数中的fire函数
}

function fn2(n) {
    console.log("fn2" + n);
}


$callback.add(fn1,fn2);
$callback.fire('hello');
```

(三)  多个参数一起使用

```
var $callback = $.Callbacks('memory once');

function fn1() {
    console.log('fn1');
}

function fn2() {
    console.log('fn2');
}

$callback.add(fn1);
$callback.fire();                //因为memory参数,fire完毕后 list= []
console.log($callback.has(fn1)); //false
$callback.add(fn2);              //因为memory参数,此时直接fire了, list = []
console.log($callback.has(fn1)); //false
console.log($callback.has(fn2)); //false
$callback.fire();                //因为once,此时不会fire了
```

### 7.6 other API

```
// Remove all callbacks from the list
empty: function() {
	list = [];
	firingLength = 0;
	return this;
},
// Have the list do nothing anymore
disable: function() {
	list = stack = memory = undefined;
	return this;
},
// Is it disabled?
disabled: function() {
	return !list;
},
// Lock the list in its current state
lock: function() {
	stack = undefined;
	if ( !memory ) {
		self.disable();
	}
	return this;
},
// Is it locked?
locked: function() {
	return !stack;
},

// To know if the callbacks have already been called at least once
fired: function() {
	return !!fired;
}
```


## 8. 延迟对象

和**5. 工具方法**类似,都是在`JQuery`对象上添加新的属性方法

```
jQuery.extend({
	Deferred: function(){},  # 延迟对象
	when:function(){}        # 延迟对象辅助方法
})
```



## 8.1 `$.Deffered()`



>源码

```
//[3043]
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
	
			//详见(三)
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					// then(function(){},function(){},function(){})
					// 所以arguments是的属性是三个函数
					// 利用fns保存arguments参数
					var fns = arguments;
					// return jQuery.Deffered(fn).promise()
					// 根据if ( func ) {func.call( deferred, deferred )}
					// 因此newDefer就是deffered对象
					// 且this指向了deffered对象
					// 并立马执行了func
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							// action : resolve reject notify
							var action = tuple[ 0 ],
								// 获取then()中对应三种状态的函数
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							// deffered.done(fn) deffered.fail(fn) deffered.progress(fn)
							deferred[ tuple[1] ](function() {
								// 当resolve/reject/notify执行的时候
								// done/fail/progress就会触发,因此就可以执行then中对应的函数
								var returned = fn && fn.apply( this, arguments );
								// 如果then(function(){return})
								// 匿名函数中有返回值
								// 如果返回值是deffered对象
								// 详见(五)
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									//详见(五)
									//如果返回值不是deffered对象
									//直接fireWith 可以触发done函数
									//需要注意的是newDefer和返回值dfd是怎么建立关系的,就是通过闭包的形式,将之前保留的deffered对象再次传入$.Deffered(fun)的fun中传入
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},

				//详见(二)
				//有参数的时候例如后面传入deffered
				//则将promise对象扩展到deffered对象
				//如果没有参数传入,则就返回promise对象本身
				//例如$.Deffered().promise()
				//返回的是promise对象而不是deffered对象
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			
			//注意闭包形式,因为外部调用$.Deffered()会一直保持着 引用
			//所以这个对象暂时是不会释放的
			//这个对象有很多属性是函数
			//相当于返回了这些函数,因此返回函数内部的嵌套函数就属于闭包形式
			deferred = {};

		// Keep pipe for back-compat
		// 两个函数每种形式上是通用的
		promise.pipe = promise.then;

		// Add list-specific methods
		// 其实这里就相当于添加add和fire函数
		// 需要注意的是和tuples数组是对应起来的
		// 例如done对应 add
		// 那么resolve就对应 fireWith
		jQuery.each( tuples, function( i, tuple ) {
			// list 就是$.Callback()
			// 每一种状态就有一个Callback
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			// 因为memory所以直接add就fire了?
			promise[ tuple[1] ] = list.add;

			// Handle state
			// notify是没有stateString
			// 只有resolve和reject才会执行
			if ( stateString ) {
				// 因为memory这里先添加add?
				// 这里状态是不能被改变的
				// 在执行任何一种状态的时候另外的状态都会被锁定
				list.add(function() {
					// state = [ resolved | rejected ]
					// 详见(三)
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			// 需要注意这里后执行
			// 这里只有在外部调用 resolve reject等函数时才会执行
			// 后面的先执行所以deferred[ tuple[0] + "With" ]存在
			deferred[ tuple[0] ] = function() {
				// resoveWith rejectWith notifyWith
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			// 这里先执行
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		// 详见(二)
		// 使deffered对象继承promise对象
		promise.promise( deferred );

		// Call given func if any
		// 这一这个可以在外部使用,内部详见then方法
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		// 调用$.Defferd()返回的是deffered对象
		// 闭包形式
		return deferred;
	}
});
```

>内容解析

(一) 案例说明

延迟对象其实是对回调对象的再次封装.


```
var $callback = $.Callbacks('memory once');
var $deferred = $.Deferred();

function fn1() {
    console.log('callback fn1');
}

function fn2() {
    console.log('deferred fn2');
}

setTimeout(function() {
    console.log('defer');   //defer
    $callback.fire();       //callback fn1
    $deferred.resolve();    //deferred fn2
},1000);

$callback.add(fn1);
$deferred.done(fn2);


//add -> done
//fire -> resolve
//Callbacks -> Deferred
```

延迟对象的`resolve`和`reject`对应`once`和`memory`参数

```

//[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
//[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
//[ "notify", "progress", jQuery.Callbacks("memory") ]

var $callback = $.Callbacks('memory once');
var $deferred = $.Deferred();

function fn1() {
    console.log('callback fn1');
}

function fn2() {
    console.log('deferred fn2');
}


setInterval(function() {
    console.log('defer');   //defer N次
    $callback.fire();       //callback fn1 只有一次 因为参数once
    $deferred.resolve();    //deferred fn2 只有一次 因为参数once
},1000);

$callback.add(fn1);
$deferred.done(fn2);
```

延迟对象的`notify`没有`once`参数

```
var $callback = $.Callbacks('memory once');
var $deferred = $.Deferred();

function fn1() {
    console.log('callback fn1');
}

function fn2() {
    console.log('deferred fn2');
}


setInterval(function() {
    console.log('defer');   //defer N次
    $callback.fire();       //callback fn1 只有一次 因为参数once
    $deferred.notify();    //deferred fn2 N次 因为没有参数once
},1000);

$callback.add(fn1);
$deferred.progress(fn2);
```

延迟对象的`notify`只对应`memory`参数

```
var $callback = $.Callbacks('memory once');
var $deferred = $.Deferred();

function fn1() {
    console.log('callback fn1');
}

function fn2() {
    console.log('deferred fn2');
}

$callback.add(fn1);
$deferred.progress(fn2);

$deferred.notify();      //deferred fn2
$deferred.progress(fn2); //deferred fn2 因为memory 直接fire
$deferred.progress(fn2); //deferred fn2 因为memory 直接fire
```


(二) `promise`和`deffered`对象的区别

- `promise`(使用`promise`对象不可以修改外部状态)
 - `state`
 - `always`
 - `promise`
 - `pipe`
 - `then`
 - `done`
 - `fail`
 - `progress`

- `deffered`(多了三个状态,使用`deffered`可以修改状态)
 - `resolve`
 - `resolveWith`
 - `reject`
 - `rejectWith`
 - `notify`
 - `notifyWith`
 - `state`(这之后都是从`promise`对象继承而来)
 - `always`
 - `promise`
 - `pipe`
 - `then`
 - `done`
 - `fail`
 - `progress`

使用`deffered`对象可以在外部修改内部状态

```
function fn() {
    var dfd = $.Deferred();

    setTimeout(function() {
        dfd.resolve();  //因为先reject所以状态被改变
    },1000);

    return dfd;
}

var dfd = fn();

dfd.done(function() {
    console.log('success');
}).fail(function() {
    console.log('fail');  //fail
});

dfd.reject();	//失败,说明在外面可以改变状态,因为用的是deffered对象
```

使用`promise`对象不可以在外部修改内部状态

```
function fn() {
    var dfd = $.Deferred();

    setTimeout(function() {
        dfd.resolve();  //内部resolve状态不能被外部的reject修改
    },1000);

    return dfd.promise();
}

var dfd = fn();

dfd.done(function() {
    console.log('success');  //success
}).fail(function() {
    console.log('fail');
});

dfd.reject();   //Uncaught TypeError: dfd.reject is not a function, 因为promise对象没有reject属性
```

(三) `state`状态

```
function fn() {
    var dfd = $.Deferred();

    console.log(dfd.state());       //pending

    setTimeout(function() {
        dfd.resolve();
        console.log(dfd.state());   //resolved
    },1000);

    return dfd.promise();
}

var dfd = fn();

dfd.done(function() {
    console.log('success');         //success
}).fail(function() {
    console.log('fail');
});
```

(四) `always`

```
function fn() {
    var dfd = $.Deferred();

    //dfd.resolve();
    dfd.reject();  //不管是什么状态,always都会触发

    return dfd.promise();
}

var dfd = fn();

dfd.always(function() {
    console.log('111');
})
```


(五)  `then`

```
function fn() {
var dfd = $.Deferred();
    //dfd.resolve();  //success
    //dfd.reject();   //fail
    dfd.notify('hi');     //progress
    return dfd.promise();
}

var dfd = fn();

dfd.then(
	function() {
	    alert('success');
	},
	function() {
	    alert('fail');
	},
	function() {
	    alert('progress');
	    alert(arguments[0]);    //hi
	}
);
```

 `then`的函数如果有返回值

```
function fn1() {
    var dfd = $.Deferred();

    dfd.resolve();

    return dfd;
}


var dfd = fn1();

dfd = dfd.then(function(){
	 return 'then return value'; //如果返回值不是deffered或promise对象,则在源代码内部直接fireWith,会触发下面的done函数
});

dfd.done(function() {
	console.log(arguments[0]); //then return value
});
```

 `then`/`pipe(管道)`的函数如果返回值是`deffered`对象

```
function fn1() {
    var dfd = $.Deferred();

    dfd.resolve();

    return dfd;
}


var dfd = fn1();

dfd = dfd.then(function(){
    return dfd; //如果返回值是deffered对象
});

dfd.done(function() {
   console.log(arguments[0]);
});
```




(五)  `pipe`

 管道的意思,需要注意和`then`方法其实进行了合并,其实用的不是特别多


```
var dfd = $.Deferred();

	dfd.resolve('hi');
	
	//其实pipe和then是一样的,因此也是三个参数函数
	//分别对应resolve reject notify
	var newDfd = dfd.pipe(function() {
	    return arguments[0] + 'pass then';
	});
	
	newDfd.done(function() {
	    console.log(arguments[0])   //hipass then
})
```

(六) `when`

- 所有的都是`resolve`才会`done`
- 只要有一个`reject`就`done`

```
function fn1() {
    var dfd = $.Deferred();

    dfd.resolve();

    return dfd;
}

function fn2() {
    var dfd = $.Deferred();

    dfd.resolve();
    return dfd;
}


$.when(fn1(),fn2()).done(function() {
    console.log("success"); //fn1和fn2都成功才会成功
})
```


## 8.2 `$.when()`

>源码

```
jQuery.extend({
// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			//将arguments转化为数组
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			// 如果只有一个参数,会判断返回值是否是延迟对象,如果是则返回length = 1
			// 多参数remaining是length
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			// 如果只有一个参数 remaining = 1,如果返回值是延迟对象,则deffered是when中的fn返回的延迟对象
			// 如果返回值不是deffered对象,则执行后面的$.Deffered
			// 
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		// 如果没有参数需要执行 $.when().done()
		// 如果是一个参数且返回值是延迟对象,这里不执行
		// 如果是一个参数返回值不是延迟对象,这里也执行
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		// 如果是一个参数fn,则返回的是这个参数的延迟对象对应的promise() 
		return deferred.promise();
	}
});	
```


>内容解析

- 所有的都是`resolve`才会`done`
- 只要有一个`reject`就`fail`

```
function fn1() {
    var dfd = $.Deferred();
    dfd.resolve();
    return dfd;  
}
function fn2() {
    var dfd = $.Deferred();
    dfd.reject();
    return dfd;
}
//when中的fn参数必须返回延迟对象
//如果不是返回延迟对象,则会跳过这个fn
//$.when().done(function)	会执行成功
//$.when(arg1,arg2).done() 可以传参数处理
//$.when(fn1(),'111').done(function) 仍然会执行成功
$.when(fn1(),fn2()).done(function() {
    console.log("success"); //fn1和fn2都成功才会成功
}).fail(function(){
	console.log("fail");    //fail
});

```

`when`传参情况

```
function fn1() {
    var dfd = $.Deferred();
    dfd.resolve();
    return dfd;
}

function fn2() {
    var dfd = $.Deferred();
    dfd.resolve();
    return dfd;
}


function fn() {
    var dfd = $.Deferred();
    dfd.resolve();
}

//1.无参情况
//无参数的情况下在when中新建了一个deffered对象
//并返回deffered.promise()
//在when内部触发了新建deffered对象的fireWith函数
//因此done对象可以执行
$.when().done(function() {
    console.log("success");
});

//2.只有一个参数,不返回延迟对象
//和第一种情况类似
$.when(fn()).done(function() {
    console.log("success");
});

//3.只有一个参数的情况,返回延迟对象
//没有在when中新建deffered对象,而是使用fn1传入的deffered对象进行了处理
//done函数也是和fn1返回的dfd对象对应
$.when(fn1()).done(function() {
    console.log("success");
});

//4.多个参数的情况
//使用计数器进行处理
$.when(fn1(),fn2()).done(function() {
    console.log("success");
});
```

