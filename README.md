# JQuery

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

>提示: `Jquery2.0.3`以后简称`J`.`[]`中数字代表`J`中源码的行数.


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


## 自执行匿名函数

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


## Prototype

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

