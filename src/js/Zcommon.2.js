// 验证是否空
String.prototype.isEmptyString = function() {
    return this == "" || this.match(/^\s+$/);
};

String.prototype.format = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,function(m,i,o,n){
        return args[i];
    });
};

// 验证是否日期
String.prototype.isValidDate = function() {
    return this
        .match(/^[1-2]\d{3}-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[0-1])$/);
};

// 验证是否email,价格,电话
String.prototype.isValidEmailAddress = function() {
    return this
        .match(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([0-9a-zA-Z]+.){1,2}(com|net|cn|com.cn)$/);
};

String.prototype.isValidPrice = function() {
    return this
        .match(/^[0-9]*(\.[0-9]{1,2})?$/);
};

String.prototype.isTel = function() {
    return (/^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(this
        .trim()));
};

String.prototype.isPhone = function() {

    return (/^0?1[3|4|5|7|8][0-9]\d{8}$/.test(this
        .trim()));
};

//验证身份证
String.prototype.isCardNo = function()
{
    return (/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this
        .trim()));
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X

};
String.prototype.Trim = function()
{
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
String.prototype.LTrim = function()
{
    return this.replace(/(^\s*)/g, "");
};
String.prototype.RTrim = function()
{
    return this.replace(/(\s*$)/g, "");
};

//转2位小数货币
function toDecimal2(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(x*100)/100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}


/*打开手机上的地图app*/
function callLocalMap(lon,lat,name,address){
    function ditu(){
        wx.openLocation({
            latitude: lat, // 纬度，浮点数，范围为90 ~ -90
            longitude: lon, // 经度，浮点数，范围为180 ~ -180。
            name:name|| '', // 位置名
            address:address|| '', // 地址详情说明
            scale: 28, // 地图缩放级别,整形值,范围从1~28。默认为最大
            infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
        });
    }
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        //微信
        wx.ready(function () {
            ditu();
        });
    } else {
        if(!!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
            //ios
            //高德IOS
            setTimeout( function(e){ window.location.href ="iosamap://viewMap?sourceApplication=applicationName&poiname="+name+"&lat="+lat+"&lon="+lon+"&dev=1"; },200);
            //百度IOS
            setTimeout( function(e){ window.location.href ="baidumap://map/marker?location="+lat+","+lon+"&title="+address+"&content="+name+"&src=yourCompanyName|yourAppName";},400);
        }else{
            //安卓
            //高德安卓
            setTimeout( function(e){ window.location.href ="androidamap://viewMap?sourceApplication=appname&poiname="+name+"&lat="+lat+"&lon="+lon+"&dev=0"; },200);
            //百度安卓
            setTimeout( function(e){ window.location.href ="bdapp://map/marker?location="+lat+","+lon+"&title="+name+"&content="+address+"&traffic=on"; },400);
            //安卓默认
            setTimeout( function(e){ window.location.href ="geo:"+lon+","+lat;},600);
        }
    }
}
function isObject(o){
    return Object.prototype.toString.call(o) === '[object Object]';
}
function isArray(a) {
    return Object.prototype.toString.call(a)=== '[object Array]';
}
function isFunction(o){
    return Object.prototype.toString.call(o) === '[object Function]';
}
function isString(value) {return typeof value === 'string';}

function getLength(object) {
    var count = 0;
    for (var i in object) count++;
    return count;
}
Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};

String.prototype.timeformat = function(format)
{
    if(!this || this == '0') return '无';
    return (new Date(parseInt(this) * 1000)).format(format);
};
Number.prototype.timeformat = function(format)
{
    if(!this || this == 0) return '无';
    return (new Date(this * 1000)).format(format);
};

function escapeChars(str) {
    str = str.replace(/&amp;/g, '&');
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&acute;/g, "'");
    str = str.replace(/&quot;/g, '"');
    str = str.replace(/&brvbar;/g, '|');
    return str;
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    //if (r!= null) return unescape(r[2]); return null;
    if (r!= null) return decodeURI(r[2]); return null;

}
function getHashString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.hash.substr(1).match(reg);
    //if (r!= null) return unescape(r[2]); return null;
    if (r!= null) return decodeURI(r[2]); return null;

}

function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split(/[\&\?]/);
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}


function GetHash() {
    var url = location.hash; //获取url中"?"符后的字串
    var theHash = new Object();
    if (url.indexOf("#") != -1) {
        var str = url.substr(1);
        strs = str.split(/[\&\?]/);
        for(var i = 0; i < strs.length; i ++) {
            theHash[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theHash;
}
function showBigImg(id){
    var urls=[];
    $(id).parents('[data-type="gallery"]').find('img').each(function(index,ele){
        urls.push($(this).data('src')||$(this).attr('src'));
    });
    if (typeof window.WeixinJSBridge != 'undefined') {
        WeixinJSBridge.invoke('imagePreview', {
            "urls":urls,
            "current":$(id).data('src')||$(this).attr('src')
        });
    }else{
        alert( "请在微信中查看", null, function () {});
    }
}
function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}
function accAdd(arg1,arg2){
    var r1,r2,m;
    try{r1=arg1.toString().split('.')[1].length}catch(e){r1=0};
    try{r2=arg2.toString().split('.')[1].length}catch(e){r2=0};
    m=Math.pow(10,Math.max(r1,r2));
    return (arg1*m+arg2*m)/m;
}
function Subtr(arg1,arg2){
    var r1,r2,m,n;
    try{r1=arg1.toString().split('.')[1].length}catch(e){r1=0};
    try{r2=arg2.toString().split('.')[1].length}catch(e){r2=0};
    m=Math.pow(10,Math.max(r1,r2));
//动态控制精度长度
    n=(r1>=r2)?r1:r2;
    return ((arg1*m-arg2*m)/m).toFixed(n);
}
function accMul(arg1,arg2){
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split('.')[1].length}catch(e){};
    try{m+=s2.split('.')[1].length}catch(e){};
    return Number(s1.replace(','))*Number(s2.replace(','))/Math.pow(10,m);
}
function accDiv(arg1,arg2){
    var t1=0,t2=0,r1,r2;
    try{t1=arg1.toString().split('.')[1].length}catch(e){};
    try{t2=arg2.toString().split('.')[1].length}catch(e){};
    with(Math){
        r1=Number(arg1.toString('.').replace(','));
        r2=Number(arg2.toString('.').replace(','));
        return (r1/r2)*pow(10,t2-t1);
    }
}

function is_pc() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
//判断是否是微信浏览器的函数
function is_weixn(){
    //window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
    var ua = window.navigator.userAgent.toLowerCase();
    //通过正则表达式匹配ua中是否含有MicroMessenger字符串
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
        return true;
    }else{
        return false;
    }
}

///---------------------------------------------------
var app_config = {
    domain:'https://makegame.gzluowang.com/',
}

//处理请求
function Zrequest(param, success, error){
    var type=1;
    if(arguments[3]){
        type=arguments[3];
    }
    if(arguments[2]!=undefined){
        if(!isFunction(arguments[2])){
            type=error;
            error=null;
        }
    }
    if(type){
        layer.load(3,{time: 3000});
        //Toast.showLoading();
    }
    if(!param.data)param.data={};
    //if(window.user_token)param.data.user_token = window.user_token;
    param.data.user_token = ZC('user_token');
    $.ajax({
        type : param.type||'POST',
        url : app_config.domain + param.url,
        data:param.data||{},
        dataType : param.dataType||"json",
        success : function(data) {
            cb(data);
        }

    });
    function cb(data){
        if(type){
            layer.closeAll('loading');
            //Toast.closeLoading();
        }
        if (data.err > 0) {
            if(data.err==233){
                ZC.clear('user_info');
                ZC.clear('user_token');
                load_login();
            }
            if(error){
                error(data);
            }else{
                layer.msg(data.msg);
                //Toast.showMsg(data.msg);
            }
        }else{
            if(success) success(data);
        }
    }
}

function load_login(){
    var back_url = location.href;
    location.href = '/AdminHtml/login.html?back_url='+back_url;
}

var Zpage = function (page_data){
    var _this = this;
    for(var i in page_data){
        this[i] = page_data[i];
    }
    this.page_id = 0;
    this.guid = newGuid();
    this.page_title = page_data.title||'';
    this.parent = page_data.container||'';
    this.container = document.createElement("div");
    this.container.id = this.guid;
    //this.template = page_data.template||'';
    this.scrollTop = 0;
    this.data = page_data.data||{};
    this.methods = page_data.methods||false;
    //this.html = '';
    this.param =  page_data.param||'';
    this.hash =  page_data.hash||'';
    this.is_init = false;
    this.src_load = false;
    this.$M = false;


    //!this.template&&(this.template = $(this.parent).children());
    //this.template = $(this.parent).children()
    //isString(this.template)?this.container.innerHTML = this.template:$(this.container).append(this.template);
    //$(this.container).append(this.template)
    this.container.innerHTML = this.template;
    //$(this.parent).append(this.container);
    Ztempl.append(this.container,this.parent);

    //滚动条事件
    this.scroll_elem = this.container;
    if(page_data.scroll_elem) this.scroll_elem = this.container.querySelectorAll(page_data.scroll_elem)[0];
    this.onReachBottomDistance = page_data.onReachBottomDistance||false;
    this.is_bottom = false;
    this.scroll_elem.addEventListener('scroll', function(e){
        //如果产生ajax请求有可能改变scrollTop，这里需要恢复
        if(_this.is_bottom){
            _this.is_bottom = false;
            this.scrollTop = _this.scrollTop;
        }
        else{
            _this.scrollTop = this.scrollTop;
            //触底
            if (this.scrollTop >= this.scrollHeight - this.offsetHeight) {
                _this.is_bottom = true;
                if(_this.onReachBottomDistance)_this.onReachBottomDistance();
            }
        }
    },true);

    this.init = function(){
        this.$M = Ztempl(this.container,this.data);
    };
    this.show = function(param,hash){
        if(!this.src_load) return;
        if(param)this.param = param;
        if(hash)this.hash = hash;
        if(!this.is_init){
            this.init();
            this.is_init = true;
            this.p_show();
            //$(this.parent).show();
        }
        else{
            //$(this.parent).show();
            //$(this.html).wrap(this.parent);
            this.parent.innerHTML = "";
            Ztempl.append(this.container,this.parent);
            //$(this.parent).empty().append(this.html);
        }

        //滚动条恢复
        this.scroll_elem.scrollTop = this.scrollTop;
        this.methods(this.param||{},this.hash||{});
        //处理页面title
        document.title = this.page_title;
    }.bind(this);
    this.close = function(){
    };
    this.p_show = function(){
        // if(this.parent.style.display == 'none'){
        //
        // }
        this.parent.style.display=''
    };
    this.on = function(){
        var arg = arguments;
        var _this = this;
        this.container.addEventListener(arguments[0], function(e){
            var t = _this.container.querySelectorAll(arg[1]);
            for(var i = 0;i<t.length;i++){
                if(t[i] == e.target){
                    arg[2]&&arg[2].call(e.target,e);
                }
            }
        },true)
        //$(this.container).on(arguments[0]||false,arguments[1]||false,arguments[2]||false);
    }
};
var Zframe = {
    page_list:{},
    pagePath_list:[],
    page_count:0,
    template_list:{},
    request_list:{},
    this_page:false,
    load_list:[],
    version:12121,
    init:function(content_id){
        this.content_obj = document.getElementById(content_id);

        var _this = this;
        _this.page_count = 0;
        //拦截所有a标签
        document.getElementsByTagName('body')[0].addEventListener('click', function(e){
        //$('body').on('click','a',function(e){
            var href = e.target.getAttribute("href");
            if(!href || href.substr(0,1) == '#' || href.substr(0,11)=="javascript:") return;
            //http开头的直接跳转
            if(href.substr(0,4) == 'http'){
                //location.href = href;
                return;
            }
            e.preventDefault();
            param = href.split(/[\?]/);
            href = param[0];
            var param = param.length>1?param[1]:'';
            var hash = '';
            if(param){
                hash = param.split(/[\#]/);
                param=strtoobj(hash[0]);
                hash=hash.length>1?strtoobj(hash[1]):{};
            }
            var page_name = href.replace(/\.htm[l]?/,'');
            if(!page_name) return;
            _this.to(page_name,param,hash);
        });

        //处理当前页后退问题
        Zback.back({},false,1);
        return this;
    },
    use:function(name,page){
        //console.log(page);
        !page['template']&&(page['template'] = this.template_list[name]);
        page['container'] = this.content_obj;
        var this_page = new Zpage(page);
        this.page_list[this_page.guid] = this_page;
        this.this_page = this_page.guid;
        this.page_count++;

        /*if(this.page_list[name]){
            //Ztempl.refresh(this.page_list[name], page,1);
            //this.page_list[name].show();
            return;
        }
        if(!this.page_list[name]){
            page['template'] = this.template_list[name];
            page['container'] = this.content_obj;
            this.page_list[name] = new Zpage(page);
        }*/
        this_page.src_count = 0;
        if(this_page.src){
            this_page.src.js && (this_page.src_count += this_page.src.js.length);
            this_page.src.css && (this_page.src_count += this_page.src.css.length);
        }
        this_page.load_src_count = 0;
        if(this_page.src_count == 0){
            this.do_load(this_page);
        }
        else{
            for(var srckey in this_page.src){
                for(var key in this_page.src[srckey]){
                    var and_str = this_page.src[srckey][key].indexOf("?")>0?"&":"?";
                    var filename = this_page.src[srckey][key].replace("{{domain}}",app_config.domain)+and_str+"v="+this.version;
                    if(this.load_list.indexOf(filename)<0){
                        this.loadjscssfile(filename,srckey,this_page);
                    }
                    else{
                        this.do_load(this_page);
                    }
                }
            }
        }
        //favicon图标添加
        if(this_page.favicon_src){
            this.loadjscssfile(this_page.favicon_src,'favicon_ico',this_page);
        }
        //this.page_list[name].show();
    },
    loadjscssfile:function(filename,filetype,page){
        var _this = this;
        if(filetype == "js"){
            var fileref = document.createElement('script');
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src",filename);
        }else if(filetype == "css"){
            var fileref = document.createElement('link');
            fileref.setAttribute("rel","stylesheet");
            fileref.setAttribute("type","text/css");
            fileref.setAttribute("href",filename);
        }else if(filetype == "favicon_ico"){
            var fileref = document.createElement('link');
            fileref.setAttribute("rel","shortcut icon");
            fileref.setAttribute("type","image/x-icon");
            fileref.setAttribute("href",filename);
            _this.loadjscssfile(filename,'favicon_ico_');
        }else if(filetype == "favicon_ico_"){
            var fileref = document.createElement('link');
            fileref.setAttribute("rel","icon");
            fileref.setAttribute("type","image/x-icon");
            fileref.setAttribute("href",filename);
        }

        if (fileref.readyState){ //IE
            fileref.onreadystatechange = function(){
                //console.log(fileref.readyState);
                if (fileref.readyState == "loaded" || fileref.readyState == "complete"){
                    fileref.onreadystatechange = null;
                    _this.do_load(page);
                    _this.load_list.push(filename);
                }
            };
        } else { //Others: Firefox, Safari, Chrome, and Opera
            fileref.onload = function(){
                _this.do_load(page);
                _this.load_list.push(filename);
            };
            fileref.onerror = function(){
                _this.do_load(page);
                _this.load_list.push(filename);
            };
        }
        if(typeof fileref != "undefined"){
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    },
    do_load:function(page){
        page.load_src_count++;
        if(page.load_src_count >= page.src_count){
            page.src_load = true;
            page.show(this.this_page_param,this.this_page_hash);
        }
    },
    to:function(page_name,param,hash,pass_back){
        //如果跳转和当前页相同不处理
        //if(this.this_page === page_name) return;

        //保存上一个页面html
        if(this.this_page){
            this.pagePath_list.push(this.this_page);
            //this.page_list[this.this_page].html = this.content_obj.children;
            //$(this.page_list[this.this_page].html).find('script').remove();//移除脚本
        }

        //更新地址栏
        hash||(hash={});
        hash['pagePath'] = page_name;
        var back_param = {
            url:'?'+objtostr(param)+'#'+objtostr(hash),
        };
        //处理后退
        //if(this.this_page && this.this_page != page_name){
        Zback.back(back_param,function(){
            if(this.page_count>1){
                this.back();
                this.page_count--;
            }
            else{
                history.go(-1);
                setTimeout(function(){location.reload()},100);
            }
        }.bind(this),pass_back);
        //}

        //处理跳转
        this.this_page_param = param || {};
        this.this_page_hash = hash || {};
        if(!this.template_list[page_name]){
            this.ajax({
                url:page_name+'.html',
                success:function(res){
                    this.content_obj.innerHTML = '';
                    this.hide();
                    this.request_list[page_name] = res;
                    this.template_list[page_name] = this.clearScript(res);
                    this.executeScript(this.request_list[page_name]);
                    //$(this.content_obj).hide().html(res);
                }.bind(this)
            });
        }
        else{
            this.content_obj.innerHTML = '';
            this.hide();
            this.executeScript(this.request_list[page_name]);
            //$(this.content_obj).hide().html(this.template_list[page_name]);
        }
    },
    back:function(){
        var _this = this;
        if(_this.page_count>=1){
            //_this.page_list[_this.this_page].html = $(_this.content_obj).children();
            delete _this.page_list[_this.this_page];

            _this.this_page = _this.pagePath_list.pop();
            //_this.page_count--;
            var _page = _this.page_list[_this.this_page];
            _page.show();
            //$(document).scrollTop(_page.scrollTop);
        }
    },
    /**
     * 地址栏加参数
     * @returns {string}
     */
    push_hash:function(key,value){
        var this_hash = GetHash();
        this_hash[key] = value;
        location.hash = objtostr(this_hash);
    },
    /**
     * 执行js
     * @param html
     */
    executeScript:function(html){
        var reg = /<script[^>]*>([^\x00]+)$/i;
        //对整段HTML片段按<\/script>拆分
        var htmlBlock = html.split("<\/script>");
        for (var i in htmlBlock)
        {
            var blocks;//匹配正则表达式的内容数组，blocks[1]就是真正的一段脚本内容，因为前面reg定义我们用了括号进行了捕获分组
            if (blocks = htmlBlock[i].match(reg))
            {
                //清除可能存在的注释标记，对于注释结尾-->可以忽略处理，eval一样能正常工作
                var code = blocks[1].replace(/<!--/, '');
                try
                {
                    eval(code) //执行脚本
                }
                catch (e)
                {
                }
            }
        }
        return this;
    },
    /**
     * 清空js并返回html
     * @param html
     */
    clearScript:function (html) {
        var preg = /<script[\s\S]*?<\/script>/i; //里面的?表示尽可能少重复，也就是匹配最近的一个</script>。匹配的规则不能用 "/<script.*<\/script>/i",因为它不能匹配到换行符,但"/<script.*<\/script>/im"可以多行匹配.;或者用"/<[^>].*?>.*?<\/.*?>/si" 再简化 "/<[^>].*?<\/.*?>/si"
        var new_html = html.replace(preg,"");    //第四个参数中的3表示替换3次，默认是-1，替换全部
        return new_html;
    },
    hide:function(){
        this.content_obj.dataset.olddisplay = this.content_obj.style.display;
        this.content_obj.style.display = 'none';
    },
    /**
     * ajax请求
     */
    ajax:function(){
        var ajaxData = {
            type:arguments[0].type || "GET",
            url:arguments[0].url || "",
            async:arguments[0].async || "true",
            data:arguments[0].data || null,
            dataType:arguments[0].dataType || "text",
            contentType:arguments[0].contentType || "application/x-www-form-urlencoded",
            beforeSend:arguments[0].beforeSend || function(){},
            success:arguments[0].success || function(){},
            error:arguments[0].error || function(){}
        }
        ajaxData.beforeSend()
        var xhr = createxmlHttpRequest();
        xhr.responseType=ajaxData.dataType;
        xhr.open(ajaxData.type,ajaxData.url,ajaxData.async);
        xhr.setRequestHeader("Content-Type",ajaxData.contentType);
        xhr.send(convertData(ajaxData.data));
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status == 200){
                    ajaxData.success(xhr.response)
                }else{
                    ajaxData.error()
                }
            }
        }
        function createxmlHttpRequest() {
            if (window.ActiveXObject) {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } else if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
        }
        function convertData(data){
            if( typeof data === 'object' ){
                var convertResult = "" ;
                for(var c in data){
                    convertResult+= c + "=" + data[c] + "&";
                }
                convertResult=convertResult.substring(0,convertResult.length-1)
                return convertResult;
            }else{
                return data;
            }
        }
    }
};

//--------------Zback------------
var Zback = {
    bacn_fn_list:[],
    is_init:false,
    back:function(param,fn,pass_back){
        if(!fn)fn = param;
        if(fn)this.bacn_fn_list.push(fn);
        if(pass_back){
            history.replaceState(param.data||{}, param.title||document.title,param.url||'');
        }
        else{
            history.pushState(param.data||{}, param.title||document.title,param.url||'');
        }
        if(!this.is_init){
            this.init();
        }
    },
    init:function(){
        var _this  = this;
        _this.is_init = true;
        window.addEventListener("popstate", function(event) {
            if(history.state){
                var fn = _this.bacn_fn_list.pop();
                if(fn) fn();
            }
        });
    }
}


//字符串转对象
function strtoobj(str){
    if(!str) return {};
    var theRequest = new Object();
    var strs = str.split(/[\&\?]/);
    for(var i = 0; i < strs.length; i ++) {
        var temp_split = strs[i].split("=");
        theRequest[temp_split[0]]=unescape(temp_split[1]);
    }
    return theRequest;
}
//对象转字符串
function objtostr(obj){
    if(!obj)return '';
    var str = [];
    for(var k in obj){
        str.push(k+'='+obj[k]);
    }
    return str.join('&');
}

//简单分页
function page_bind(page,page_count,page_size,obj,cb){
    page = parseInt(page);
    if(!cb && isFunction(obj)){
        cb = obj;
        obj = false;
    }

    if(!page_size)page_size = 20;
    var count = Math.ceil(page_count/page_size);
    if(!obj)obj = '#page';

    var p = GetRequest();

    var h = location.hash;

    var page_html ='';
    page_html+='<nav><ul class="pagination" >';
    p['page'] = page-1;
    page_html += (page>1?'<li><a href="?'+objtostr(p)+h+'" data-page="'+p['page']+'"  aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>':'');
    for(var i=parseInt(page)-3;i<=parseInt(page)+3;i++){
        if(i>=1&&i<=count){
            if(i==page){
                page_html+='<li class="active"><a href="javascript:;">'+i+'</a></li>';
            }else{
                p['page'] = i;
                page_html+='<li><a href="?'+objtostr(p)+h+'" data-page="'+p['page']+'">'+i+'</a></li>';
            }
        }
    }
    if(page<count){
        p['page'] = page+1;
        page_html +='<li><a href="?'+objtostr(p)+h+'" data-page="'+p['page']+'" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
    }
    page_html+='</ul></nav>';

    $(obj).html(page_html);
    if(cb){
        $(obj).find('a').attr('href','javascript:;').click(function(){
            var page = $(this).data('page');
            if(page){
                cb($(this).data('page'));
            }
        });
    }
}

/****
 * 保存缓存：C('缓存名',缓存值,缓存时间)，缓存名必须按驼峰命名规则（页面名+文件名+方法名）避免重名，缓存时间可选
 * 读取缓存: C('缓存名',function(){})，functon为可选，如果缓存名读不到缓存或过期，则会调用function重新设置并返回，注意该functon内的同步异步问题
 *  */
var ZC = function(k, v, t){
    k='ZC_'+k;
    this.active_time = 300000;
    var now_tme = new Date().getTime();
    if(t === -1) t = 999999999999;
    t || (t = this.active_time);
    if (!v || typeof (v) == "function") {//读取缓存
        var cache = localStorage[k]?JSON.parse(localStorage[k]):0;
        if (cache && cache.expire_time >= now_tme) {
            return cache.value;
        }
        else {
            if (typeof (v) == "function") {
                var value = v();
                if (value) {
                    return this.ZC(k, value) ? value : false;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
    else {//设置缓存
        var cache = {
            "expire_time": now_tme + t,//缓存过期时间
            "value": v,
        };
        try {
            localStorage[k] = JSON.stringify(cache);
            return true;
        } catch (e) {
            return false;
        }
    }
};
ZC.clear = function(k) {
    if(k){
        k='ZC_'+k;
        localStorage.removeItem(k);
    }
    else{
        localStorage.clear();
    }
};

function newGuid()
{
    var guid = "";
    for (var i = 1; i <= 32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid +=   n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }
    return guid;
}
