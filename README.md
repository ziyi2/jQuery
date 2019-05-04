## 前言

这里加入了很多对于原生`JavaScript`的理解,忽略了`Sizzle`选择器(它可以单独抽离出来使用`Sizzle.js`框架)的源码分析,同时由于`13.事件操作`源码相对比较复杂,只是粗略的进行了源码的调试和说明,对于`Jquery`如何监听事件以及取消监听的原理,代码执行顺序和兼容性问题处理有了粗略理解,后续有空会继续深入分析源码的实现原理.

## 完整版

- [jQuery 2.0.3源码分析](https://github.com/ziyi2/jQuery/blob/master/jQuery.md)

## 1. 总体架构

- [自执行匿名函数](https://github.com/ziyi2/jQuery/blob/master/%E6%80%BB%E4%BD%93%E6%9E%B6%E6%9E%84.md#1-1-%E8%87%AA%E6%89%A7%E8%A1%8C%E5%8C%BF%E5%90%8D%E5%87%BD%E6%95%B0)

## 2.私有属性

- [`rootjQuery`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#21-rootjquery)
- [`readyList`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#22-readylist)
- [`core_strundefined`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#23-core_strundefined)
- [`window`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#24-window%E5%B1%9E%E6%80%A7)
- [`_`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#25-_%E5%8F%98%E9%87%8F)
- [`class2type`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#26-class2type)
- [`core_deletedIds`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#27-core_deletedids)
- [`core_version`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#28-core_version)
- [数组、对象、字符串方法](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#29-%E6%95%B0%E7%BB%84%E5%AF%B9%E8%B1%A1%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%96%B9%E6%B3%95)
- [`jQuery`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#210-jquery%E9%87%8D%E7%82%B9)
- [正则变量](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#211-%E6%AD%A3%E5%88%99%E5%8F%98%E9%87%8F)
- [`fcamelCase`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#212--fcamelcase)
- [`completed`](https://github.com/ziyi2/jQuery/blob/master/%E7%A7%81%E6%9C%89%E5%B1%9E%E6%80%A7.md#213--completed)


## 3. jQuery对象的属性和方法

- [`$().jquery`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#31-jquery)
- [`$().constructor`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#32-constructor)
- [`$().init()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#33-init-jquery%E6%9E%84%E9%80%A0%E5%87%BD%E6%95%B0%E6%96%B9%E6%B3%95) - jQuery构造函数方法
- [`$().selector`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#34-selector)
- [`$().length`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#35-length)
- [`$().toArray()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#36-toarray)
- [`$().get()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#37-get)
- [`$().pushStack()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#38-pushstack)
- [`$().end()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#39-end)
- [`$().slice()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#310-slice)
- [`$().each()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#311-each)
- [`$().ready()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#312-ready)
- [`$().first()/last()/eq()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#313-firstlast-eq)
- [`$().map()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#314-map)
- [`$().push()/sort()/slice()`](https://github.com/ziyi2/jQuery/blob/master/jQuery%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95.md#315-pushsortslice)


## 4. 拷贝继承

- [拷贝继承](https://github.com/ziyi2/jQuery/blob/master/%E6%8B%B7%E8%B4%9D%E7%BB%A7%E6%89%BF.md#4-%E6%8B%B7%E8%B4%9D%E7%BB%A7%E6%89%BF)

## 5. 工具方法

- [`$.expando`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#51-expando)
- [`$.noConflict`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#52-noconflict)
- [`$.ready()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#53-ready)
- [`$.holdReady()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#54-holdready)
- [`$.isFunction()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#55-isfunction)
- [`$.isArray()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#56-isarray)
- [`$.isWindow()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#57-iswindow)
- [`$.isNumeric()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#58-isnumeric)
- [`$.type()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#59-type)
- [`$.isPlantObject()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#510-isplantobject)
- [`$.isEmptyObject()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#511-isemptyobject)
- [`$.error()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#512-error)
- [`$.parseHTML()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#513-parsehtml)
- [`$.parseJSON()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#514-parsejson)
- [`$.parseXML()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#515-parsexml)
- [`$.noop()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#516-noop)
- [`$.globalEval()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#517-globaleval)
- [`$.camelCase()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#518-camelcase)
- [`$.nodeName()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#519-nodename)
- [`$.each()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#520-each)
- [`$.trim()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#521-trim)
- [`$.makeArray()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#522-makearray)
- [`$.inArray()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#523-inarray)
- [`$.merge()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#524-merge)
- [`$.grep()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#525-grep)
- [`$.map()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#526-map)
- [`$.guid`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#527-guid)
- [`$.proxy()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#528-proxy)
- [`$.access()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#529-access)
- [`$.now()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#530-now)
- [`$.swap()`](https://github.com/ziyi2/jQuery/blob/master/%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95.md#531-swap)

## 6. 选择器Sizzle

忽略了Sizzle选择器(它可以单独抽离出来使用Sizzle.js框架)的源码分析。


## 7. 回调对象

- [`options`](https://github.com/ziyi2/jQuery/blob/master/%E5%9B%9E%E8%B0%83%E5%AF%B9%E8%B1%A1.md#7-1-options)
- [`$.Callback().add()`](https://github.com/ziyi2/jQuery/blob/master/%E5%9B%9E%E8%B0%83%E5%AF%B9%E8%B1%A1.md#7-2-callbackadd)
- [`$.Callback().remove()`](https://github.com/ziyi2/jQuery/blob/master/%E5%9B%9E%E8%B0%83%E5%AF%B9%E8%B1%A1.md#7-3-callbackremove)
- [`$.Callback().has()`](https://github.com/ziyi2/jQuery/blob/master/%E5%9B%9E%E8%B0%83%E5%AF%B9%E8%B1%A1.md#7-4-callbackhas)
- [`$.Callback().fire()/firewith()/fire()`](https://github.com/ziyi2/jQuery/blob/master/%E5%9B%9E%E8%B0%83%E5%AF%B9%E8%B1%A1.md#7-5-callbackfirefirewithfire)
- [other API](https://github.com/ziyi2/jQuery/blob/master/%E5%9B%9E%E8%B0%83%E5%AF%B9%E8%B1%A1.md#76-other-api)


## 8. 延迟对象

- [`$.Deffered()`](https://github.com/ziyi2/jQuery/blob/master/%E5%BB%B6%E8%BF%9F%E5%AF%B9%E8%B1%A1.md#81-deffered)
- [`$.when()`](https://github.com/ziyi2/jQuery/blob/master/%E5%BB%B6%E8%BF%9F%E5%AF%B9%E8%B1%A1.md#82-when)

## 9. 功能检测

- [功能检测](https://github.com/ziyi2/jQuery/blob/master/%E5%8A%9F%E8%83%BD%E6%A3%80%E6%B5%8B.md)

## 10. 数据缓存

- [`Date`构造函数](https://github.com/ziyi2/jQuery/blob/master/%E6%95%B0%E6%8D%AE%E7%BC%93%E5%AD%98.md#101-date%E6%9E%84%E9%80%A0%E5%87%BD%E6%95%B0)
- [`data`工具方法](https://github.com/ziyi2/jQuery/blob/master/%E6%95%B0%E6%8D%AE%E7%BC%93%E5%AD%98.md#102-data%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95)
- [`data`实例方法](https://github.com/ziyi2/jQuery/blob/master/%E6%95%B0%E6%8D%AE%E7%BC%93%E5%AD%98.md#103-data%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95)

## 11. 队列管理

- [`queue`工具方法](https://github.com/ziyi2/jQuery/blob/master/%E9%98%9F%E5%88%97%E7%AE%A1%E7%90%86.md#111-queue%E5%B7%A5%E5%85%B7%E6%96%B9%E6%B3%95)
- [`queue`实例方法](https://github.com/ziyi2/jQuery/blob/master/%E9%98%9F%E5%88%97%E7%AE%A1%E7%90%86.md#112-queue%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95)

## 12.元素属性

- [`attr()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#121-attr)
- [`removeAttr()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#122-removeattr)
- [`prop()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#123-prop)
- [`removeProp()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#124-removeprop)
- [`addClass()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#125-addclass)
- [`removeClass()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#126-removeclass)
- [`hasClass()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#128-hasclass)
- [`val()`](https://github.com/ziyi2/jQuery/blob/master/%E5%85%83%E7%B4%A0%E5%B1%9E%E6%80%A7.md#129-val)


## 13. 事件操作

- [JQuery实例对象扩展`jQuery.fn.extend`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#131-jquery%E5%AE%9E%E4%BE%8B%E5%AF%B9%E8%B1%A1%E6%89%A9%E5%B1%95jqueryfnextend)
- [`$().on()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1311-on)
- [`$().one()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1312-one)
- [`$().off()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1313-off)
- [`$().trigger()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1314-trigger)
- [`$().triggerHandler()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1315-triggerhandler)
- [事件工具对象`jQuery.Event`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#132-%E4%BA%8B%E4%BB%B6%E5%B7%A5%E5%85%B7%E5%AF%B9%E8%B1%A1jqueryevent)
- [`$.event.add()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1321-eventadd)
- [`$.event.dispatch()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1322-eventdispatch)
- [`$.event.handlers()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1323-eventhandlers)
- [`$.event.fix()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1324-eventfix)
- [`$.event.special()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1325-eventspecial)
- [`$.event.trigger()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1326-eventtrigger)
- [`$.event.simulate()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1327-eventsimulate)
- [`$.event.remove()`](https://github.com/ziyi2/jQuery/blob/master/%E4%BA%8B%E4%BB%B6%E6%93%8D%E4%BD%9C.md#1328-eventremove)

















