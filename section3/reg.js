
// var regObj = /^(?:[0-9]*)$/;	//匹配数字0-9多次
// var str = '123434';
// var matchs = regObj.exec(str);
// console.log(matchs[0]);	//123434
// console.log(matchs[1]); //undefined

// var regObj = /^\s*$/;	
// var str = '      ';
// var matchs = regObj.exec(str);
// console.log(matchs);			//Array[1]		
// console.log(matchs[0]);			//'      '
// console.log(matchs.index);		//0
// console.log(matchs.input);		//'      '

// var regObj = /^(<[\w\W]+>)$/;	
// var str = '<abc><';
// var matchs = regObj.exec(str);
// console.log(matchs);			//null 不匹配
// var str1 = '<abc>';
// matchs = regObj.exec(str1);
// console.log(matchs);			//Array[2]
// console.log(matchs[0]);			//'<abc>' 本身
// console.log(matchs[1]);			//'<abc>' 捕获组

// var regObj = /^[^>]*$/;
// var str = '<<<<<';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// var str1 = '>';
// matchs = regObj.exec(str1);
// console.log(str1);		//null 匹配不通过	

// var regObj = /^\s*(<[\w\W]+>)[^>]*/;
// var str1 = 'abc';
// matchs = regObj.exec(str1);
// console.log(str1);		//null 匹配不通过	
// var str = '<abc>';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// var str = '    <abc>';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// var str = '    <abc><>';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//捕获组 <abc><> 其实就是 abc>< 被\w\W匹配

// var str = '    <abc>>';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//捕获组 <abc>> abc>被\w\匹配


// var str = '    <abc>abc';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//捕获组 <abc> 之后的abc被[^>]捕获

// var regObj = /^#([\w-]*)*/;	//[\w-] 单词和-
// var str = '#data';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//data

// var str = '#data-index';	
// matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//data-index


// var str = '#-data-index';	
// matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//-data-index 



// 
// var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
// var str = '.data';	
// var matchs = rquickExpr.exec(str);
// console.log(matchs);	//匹配未通过 [undefined,undefined,undefined]
// var str = '<div>>';
// matchs = rquickExpr.exec(str);
// console.log(matchs);	//匹配通过	[<div>>,<div>>,undefined]

// var str = '#id';
// matchs = rquickExpr.exec(str);
// console.log(matchs);    //匹配通过   [#id,undefined,id]
















