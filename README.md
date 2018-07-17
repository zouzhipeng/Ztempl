# Ztempl  一个让任何开发人员都能简易傻瓜化操作的JS前端模板工具 #
> 作者 zzp
## 主要特性 ##
利用数据与DOM双向绑定，减少大量开发逻辑代码，使得代码流程简单易懂。
## 版本历史 ##
 * 2.2.2
 * 1 兼容checkbox,radio
 * 2 修复Ztempl.refresh一些情况下的bug
 * 3 修复Zfor.应用在闭合元素里时会出错的问题
 * 2.2.1
 * 1,升级getdata逻辑
 * 2.1.2
 * 1,增加img标签里的_src替换为src功能
 * 2.1.0
 * 1,修复Zfor的项目不为对象时会出错
 * 2,修复Zif为空列表时判断为true问题

## 用法 ##
### 初始化 ###
> 1,直接用页面元素绑定

html:
~~~
<span id=box></span>
~~~
    
js:
~~~
var Zdata = {};
Ztempl(document.getElementById('box'),Zdata);
~~~

> 2,用字符串或模板绑定，返回一个Ztempl对象，把里面的$node移至需要放入的任意元素里

html:
~~~
<div id=box></div>
~~~
    
js:
~~~
var Zdata = {title:'hello '};
var M = Ztempl('<span>{{title}}</span>',Zdata);
$('#box').append(M.$nodes);
~~~
### 数据双向绑定 ###
页面显示数据
> 当绑定的是单一变量，且是以单一变量开头，则直接写变量或者表达式

html:
~~~
<span id=box>
	{{a}},{{b||0}},{{a>5?'yes':'no'}}
</span>
~~~
    
js:
~~~
var Zdata = {a:1};
Ztempl(document.getElementById('box'),Zdata);
~~~


> 当绑定的是多变量，或不已变量开头，或被函数包裹，则变量也需要用$符号包裹以便识别

html:
~~~
<span id=box>
	{{$a$+$b$}},{{typeof($a$)}}
</span>
~~~
    
js:
~~~
var Zdata = {a:1,b:2};
Ztempl(document.getElementById('box'),Zdata);
~~~
    
### 表单绑定数据 ###

html:
~~~
<div id=box>
	<input Zbind="b">
	<select Zbind="c">
		<option value='1'>option 1</option>	
		<option value='2'>option 2</option>	
		<option value='3'>option 3</option>	
		<option value='4'>option 4</option>	
	</select>
</div>
~~~
    
js:
~~~
var Zdata = {b:2,c:3};
Ztempl(document.getElementById('box'),Zdata);
~~~
    
### 条件判断 ###

html:
~~~
<div id=box>
	<span Zif="a">{{a}}<span>
	<span Zif="b > 0">{{b}}<span>
	<span Zif="Math.max($a$,$b$) == $b$">{{b}}<span>
</div>
~~~
    
js:
~~~
var Zdata = {a:0,b:1};
Ztempl(document.getElementById('box'),Zdata);
~~~
    
### 循环 ###
> 循环数组会产生索引Zkey,值Zvalue

html:
~~~
<div id=box>
	<ul>
		<li Zfor="list">{{Zkey}}:{{title}}</li>
	</ul>
</div>
~~~
    
js:
~~~
var Zdata = {
	list:[
		{title:'first'},
		{title:'second'},
		{title:'third'},
	]
};
Ztempl(document.getElementById('box'),Zdata);
~~~
    

> 循环对象会更改标签取值对象为当前循环项，也会产生索引Zkey和值Zvalue

html:
~~~
<div id=box>
	<div>name:{{name}}</div>
	<div>sex:{{sex==1?'male':'female'}}</div>
	<div>age:{{age}}age</div>
	<div Zfor="score">
		{{Zkey}}:{{Zvalue}}
	</div>
</div>
~~~
    
js:
~~~
var Zdata = {
	name:'tom',
	sex:1,
	age:18,
	score:{
		math:100,
		English:80,
		English:80,
	},
};
Ztempl(document.getElementById('box'),Zdata);
~~~