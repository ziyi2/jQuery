
// var regObj = /^<(\w+)\s*\/?>/;
// var str = '<abc>   <abc>   ';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过 被匹配的项是<abc>
// console.log(matchs[0]);	//<abc>
// console.log(matchs[1]);	//"abc"
// 
// var str = '<abc>   ';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//"abc"

// var str = '<abc     />';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//"abc"

// var str = '<abc     >';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//"abc"





// var regObj = /^(?:<\/(\w+)>|)$/;	//(子项1|) 这里或的意思就是说可以匹配子项1或者什么都没有
// var str = '<abc>';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//null


// var str = '</abc>';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过
// console.log(matchs[1]);	//abc

// var str = '';	
// var matchs = regObj.exec(str);
// console.log(matchs);	//匹配通过 
// console.log(matchs[0]);	//""
// console.log(matchs[1]);	//undefined


// var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
// var str = '<abc     ></abc>';
// var matchs = rsingleTag.exec(str);
// console.log(matchs);	//匹配通过

// var str = '<abc     ></cba>';	//注意\1就是前面的(\w+),两者的单词必须是相同的
// var matchs = rsingleTag.exec(str);
// console.log(matchs);	//null 匹配不通过

// var str = '<abc     >';
// var matchs = rsingleTag.exec(str);
// console.log(matchs);	//匹配通过

// var str = '<abc     />';
// var matchs = rsingleTag.exec(str);
// console.log(matchs);	//匹配通过

















