# Jquery 2.0.3源码分析

## 约定

- `J`:  `Jquery2.0.3`
- `[]`:  该括号中的数字代表`Jquery2.0.3`中源码的行数**[第几行开始 - 第几行结束]**.

## 框架

### 自执行匿名函数

```javascript
(function() {
    var a = 10;         //私有变量(1)

    function $() {      //(2)
        alert(a);
    }

    window.$ = $;       //导出(3)
})();

$();        //10
alert(a);   //a is not defined
```

`Jquery2.0.3`中

```javascript
(function(window, undefined) {
    
    //[21-94] 定义了一些变量和函数,类似于私有变量(1)
    var
        // A central reference to the root jQuery(document)
        rootjQuery,
        ...

    //[61] 定义了Jquery函数,类似于(2)
    jQuery = function( selector, context ) {
        // The jQuery object is actually just the init constructor 'enhanced'
        return new jQuery.fn.init( selector, context, rootjQuery );
    },

    //[8826] 对外提供接口,类似于导出(3)
    window.jQuery = window.$ = jQuery;
})(window);
```

### Prototype

```javascript
(function(window, undefined) {
    //[96-283] 给Jquery原型对象添加方法和属性
    jQuery.fn = jQuery.prototype = {}
})(window);
```

### 继承

```javascript
(function(window, undefined) {
    //[285-347] Jquery的继承方法
    jQuery.extend = jQuery.fn.extend = function() {}
})(window);
```

### Extend

```javascript 
(function(window, undefined) {
    //[349-817] Jquery扩展一些工具方法(静态属性和静态方法)
    jQuery.extend({})
})(window);
```

使用说明:

- 静态方法(底层方法)
`$.trim() $.proxy`, 注意是`$`而不是`$()` 
- 实例方法(上层方法,可能会调用工具方法或者说静态方法)
`$().css() $().html()`

### Sizzle

```javascript
(function(window, undefined) {
    //[877-2856] 复杂选择器的实现
    (function( window, undefined ) {
    })(window)
})(window);
```
使用说明:
`$('ul li + p button.class').css()`

### Callbacks

```javascript
(function(window, undefined) {
    //[2880-3042] 回调对象,函数统一管理
    jQuery.Callbacks = function( options ) {}
})(window);
```

使用说明:

```javascript
function fn1() {
    alert(1);
}
function fn2() {
    alert(2);
}

var cb = $.Callbacks();

cb.add(fn1);
cb.add(fn2);
cb.fire();  //1,2

cb.remove(fn2);
cb.fire();  //1
```

### Deferred

```javascript
(function(window, undefined) {
    //[3043-3183] 延迟对象,对异步的统一管理
    jQuery.extend({
    })
})(window);
```

使用说明:
```javascript
var dfd = $.Deferred(); //注意不是实例方法
setTimeout(function(){
    alert(1);
    dfd.resolve();      //2.触发这个时接着触发回调函数
},1000);

//1.先将回调函数存入dfd对象,并没有执行
dfd.done(function() {
    alert(2);
})
 
//1 2
```

### Support

```javascript
(function(window, undefined) {
    //[3184-3295] 功能检测
    jQuery.support = (function( support ) {
    })({})
})(window);
```

### Data

```javascript
(function(window, undefined) {
    //[3308-3625] 数据缓存
    function Data() {}
})(window);
```

使用说明:

```javascript
$('body').data('name','ziyi2');
var value = $('body').data('name');
console.log(value); //ziyi2
```

### Queue
```javascript
(function(window, undefined) {
    //[3653-3797] 队列管理
})(window);
```

### Attr

```javascript
(function(window, undefined) {
    //[3803-4299] attr() prop() val() addClass()...
    //对元素属性的操作
)(window);
```

### Event

```javascript
(function(window, undefined) {
    //[4300-5128] on() trigger()...
    //事件操作的相关方法
)(window);
```

### DOM
```javascript
(function(window, undefined) {
    //[5140-6057] 
    //DOM操作
})(window);
```

### CSS
```javascript
(function(window, undefined) {
    //[6058-6620] 
    //css操作
})(window);
```

### Ajax
```javascript
(function(window, undefined) {
    //[6621-7854] 
    //ajax操作
})(window);
```

### Animate
```javascript
(function(window, undefined) {
    //[7855-8584] 
    //运动
})(window);
```

### Screen
```javascript
(function(window, undefined) {
    //[8585-8792] 
    //位置与尺寸
})(window);
```


### Module

```javascript
(function(window, undefined) {
    //[8804-8821] 
    //模块化
})(window);
```


## 自执行匿名函数 [14  8826 8829]

### window

通过创建自调用匿名函数,创建了一个特殊的函数作用域,该作用域中的代码不会和已有的同名函数,方法,变量以及第三方库冲突(模块化).
```javascript
(function(){
    window.a = 1;
    alert(a);
}());
```
>提示: 这样`window`对象使用的是全局对象,当`J`访问`window`对象时,需要按照作用域链向上访问,需要一直向上遍历到顶层作用域,访问`window`变量的速度变慢.

`J`中将`window`当做局部变量传入模块
```javascript
(function(window){
    window.a = 1;
    alert(a);
}(window));
```
在`J`中访问`window`变量时,只需要访问局部变量而不需要根据作用域链继续向上遍历,查找速度变快,同时,在压缩代码时也可以进行优化,压缩成`a`,如果是全局变量`window`当然是不可能被压缩的.
```javascript
(function(a){
    
}(window));
```

### undefined

`J`中也将`undefined`当做局部变量传入模块

```javascript
(function(window,undefined){
    
}(window));
```
作用一当然与传入`window`一样,缩短查找的作用域链,优化压缩,作用二其实是为了防止`undefined`被篡改.

例如:
```javascript
    undefined = 'now it's not defined';
    alert(undefined);
```

在老版本的浏览器中是可以改变`undefined`的值得,例如IE8.0一下版本.`J`通过传入参数的方法可以确保`undefined`就是`undefined`值. 这样就可以防止在引用`J`之前`undefined`被修改.


## 私有属性和方法 [21-94]

```javascript
var
    //[23]
    rootjQuery, 
    //含义:
    //document 压缩考虑 [866] 代码维护性考虑 
    //用到的地方[章节名]:
    //1.init的内容解析

    //[75]
    rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
    //含义:
    //...
    //用到的地方
    //1.selector可能性一: 字符串
```


## Prototype [96-283]

### jQuery

普通面向对象的编程方式

```javascript
function A() {  //A构造函数
}

A.prototype.init = function() {
};
A.prototype.css = function() {
};

var a = new A();
a.init();   //初始化
a.css();    //调用其他方法
```

`J`的写法有所不同,首先`J`的使用案例如下

```javascript
jQuery().css()
```
而不是
```javascript
jQuery.init();
jQuery.css();
```
查看`J`源码

```javascript
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
模拟实现

```javascript
function jQuery() {
    return new jQuery.prototype.init();         //jQuery.prototype = jQuery.fn
    //类似于return new jQuery();
}

jQuery.prototype.init = function() {
    //暂时没有初始化的内容
    alert('init');
}

jQuery.prototype.css = function() {
    alert('css');
}

jQuery.prototype.init.prototype = jQuery.prototype; //jQuery.prototype.init = jQuery

jQuery().css(); //init css 
//jQuery()返回jQuery实例的同时进行初始化?
//jQuery()类似于var a = new A(); a.init(); 两步操作
```

### jQuery.fn(jQuery.prototype)

本部分也就是给jQuery的原型对象添加方法和属性,这些方法和属性可以被jQuery的实例对象所使用,也就是类似于以上的`jQuery().css();`,简化处理本部分的内容如下

```javascript
jQuery.fn = jQuery.prototype = {
    jquery:      版本号,
    constructor: 修正指向问题,
    init:        初始化和参数管理
}
```


#### jquery属性
```javascript
console.log($().jquery);    //2.0.3 版本号
```

#### constructor属性

为什么要修复构造函数的指向呢? 演示说明:

```javascript
function A() {} //A构造函数
var a = new A();
console.log(A.prototype.constructor);   //function A() {} 
//每个JavaScript函数(构造函数是特例)都拥有prototype属性
//这个属性是一个对象,也就是原型对象,这个对象包含一个不可枚举属性constructor
//指向拥有prototype属性的各自JavaScript函数(构造函数是特例)
//当然prototype属性(对象)的任何方法都被该构造函数的实例所共有(继承)

A.prototype.name = 'ziyi2'; //没有重写预定义的A.prototype对象
console.log(A.prototype.constructor);   //function A() {} 

A.prototype = {};           //A.prototype对象的引用发生了改变
//新定义的原型对象的constructor不再指向原有对应的构造函数
console.log(A.prototype.constructor);   //function Object() { [native code] }

//补救措施
A.prototype = {
    constructor: A  //显示设置构造函数反向引用
};

console.log(A.prototype.constructor);   //function A() {} 
```

源码`J`中
```javascript
jQuery.prototype = {
        constructor: jQuery //显示设置构造函数的反向引用喽
}
```

#### init方法

```
//对外接口1
jQuery = function( selector, context ) {
    return new jQuery.fn.init( selector, context, rootjQuery );
    //return new jQuery( selector, context, rootjQuery );
},

//
jQuery.fn = jQuery.prototype = {
    //初始化函数2
    init: function( selector, context, rootjQuery ) {
        
    }
}

jQuery.fn.init.prototype = jQuery.fn;
//jQuery.fn.init.prototype = jQuery.fn = jQuery.prototype;
//jQuery.fn.init = jQuery;

```

##### init的功能

`J`对外提供的实例对象的接口是`$()`或者`jQuery()`,当我们调用`$()`的时候其实是调用了**对外接口1**,那么**对外接口1**先执行**初始化函数2**,然后返回的仍然是`jQuery`的实例对象,这样我们就可以继续使用`jQuery.prototype`的方法和属性(因为继承关系),例如`$().css()`,所以说`init`方法的功能是初始化`jQuery`的实例对象.

##### init的内容解析

``` javascript
init: function( selector, context, rootjQuery ) {}
```

- 参数
 - `selector` 选择器
 - `context` 包含选择器的元素
 - `rootjQuery` 

 
- `selector`可能性分析
 - `$(""), $(null), $(undefined), $(false)`
 - `$('#div'), $('.box'), $('div'), $('div div.box'), $('<li>'), $('<li>1</li><li>2</li>')`
 - `$('<li>hello')`
 - `$(this), $(document)`
 - `$(function(){})`
 - `$([]),$({})`

##### 概要分析(穿插)

```javascript
$('li').css('color','red'); //所有li元素的字体颜色为红色
```

如果不使用`J`库, 而使用传统写法

```javascript
var liArray = document.getElementsByTagName('li');

for(var index in liArray) {
    liArray[index].style.color = 'blue';
}
```

那么首先第一个问题是`$('li')`会是什么内容?

```javascript
var J = $('li');    //jQuery实例对象
J.css('color','red');       
console.log(J);     //是一个如下的类数组对象
/*
{
    0:li,
    1:li,
    ...
    7:li,
    context:document,
    length:8,
    prevObject:init[1]
    selector:'li'
}
 */}

J[2].style.color = 'blue';  //那么明显J[2]就是第三个li元素喽

```

然后可以想象在`css()`方法中遍历这个类数组去更改样式.  那么`J`和`css()`中怎么将这个类数组对象联系在一起,应为在两个函数中的变量都是局部变量哎,其实也很简单,因为两个方法都是实例对象的原型方法,那么在同一个实例对象上调用这两个方法的`this`是同一个啊,所以肯定是通过`this`对象啦.

那么在`css()`方法中,会是这样处理

```javascript
    for(var i=0 len=this.length; i<len; i++) {
        this[i].style.color = 'red';
    }
```

那么其实`selector`在这里就是`'li'`,这就是选择器的概念了,选择对应的元素或数组元素. `init`函数首先要做的就是区分`selector`的类型,毕竟在**selector可能性分析**里已经列举了各种`selector`的可能性!


##### `selector`可能性一: 空
示例情况:
- `$(""), $(null), $(undefined), $(false)`

源码:

```javascript
//[104-107]
if ( !selector ) {
    return this;    //直接返回this对象
}
```

##### `selector`可能性一: 字符串
示例情况:
- `$('#div'), $('.box'), $('div'), $('div div.box'), $('<li>'), $('<li>1</li><li>2</li>')`
- `$('<li>hello')`


源码第一部分:

```javascript
//全部[110-177]
if ( typeof selector === "string" ) {
    //第一部分[111-117]
    if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                // Assume that strings that start and end with <> are HTML and skip the regex check
                match = [ null, selector, null ];

    } else {
        match = rquickExpr.exec( selector );
    }
}
```

分析:

```javascript
//全部[110-177]
if ( typeof selector === "string" ) {   //判断选择器是否为字符串
    //第一部分[111-117]
    if () {
        //判断是否为$('<li>'), $('<li>1</li><li>2</li>')类型
        //match值
        //[ null, '<li>', null] [ null, '<li>1</li><li>2</li>', null]
    } else {
        //判断是否为除标签以外的类型,比如$('#div'), $('.box'), $('div'), $('div div.box'),$('<li>hello')
    }
}
```

扩展知识点[正则匹配]:

```
var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
match = rquickExpr.exec( selector );
```