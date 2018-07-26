/**
 * Created by ZZP on 2017/11/6.
 */
/**
 * 1,修复Zfor的项目不为对象时会出错
 * 2,修复Zif为空列表时判断为true问题
 *
 * 2.1.2
 * 1,增加img标签里的_src替换为src功能
 * 2.2.1
 * 1,升级getdata逻辑
 */
(function(window) {'use strict';
    var Ztempl = window.Ztempl || (window.Ztempl=init);
    //var REGEX_KEY = /(\{\{[\w\:\.\|\u4e00-\u9fa5]+\}\})/g;
    var REGEX_KEY = /(\{\{[\s\S]*?\}\})/g;
    var DATA_KEY = /\$([\s\S]*?)\$/g;
    var DATA_KEY_TAG = /([\$]+)/g;
    //var REGEX_KEY_WARP = /\{\{([\w\:\.\|\u4e00-\u9fa5]+)\}\}/g;
    var REGEX_KEY_WARP = /\{\{([\s\S]*?)\}\}/g;
    var REGEX_KEY_TAG = /([\{\{\}\}]+)/g;

    function init(str,data,templ_list){
        console.time("Ztempl");
        if(!str) return false;
        var M = new Ztempl_M();
        //替换[[]]模板
        if(isString(str)){
            str = Ztempl_M.formateTemplate(str,templ_list||{});
        }

        if(typeof jQuery != 'undefined' && str instanceof jQuery){
            str = str.children();
        }
        M.$nodes = !str.nodeType?parseDom(str):str.childNodes;
        M.$orig_data = data||{};
        M.init();
        console.timeEnd("Ztempl");
        return M;
    }
//刷新子值
    Ztempl.refresh = function(data,newdata,depth){
        for(var i in newdata){
            if(depth && (isArray(newdata[i]) || isObject(newdata[i]))){
                Ztempl.refresh(data[i]);
            }
            else{
                data[i] = newdata[i];
            }
        }
    }

//模板模型
    var Ztempl_M = function(){};
    Ztempl_M.prototype.init = function(nodes,data){
        if(nodes)this.$nodes =nodes;

        //数据模型化
        this.$data = data||build_data(this.$orig_data,1);
        //this.$bind_node = {};
        this.$nodes = this.build_for(this.$nodes);
        this.$nodes = this.build_if(this.$nodes);
        this.build_tag(this.$nodes);
        this.build_zbind(this.$nodes);
        this.replace_img_src(this.$nodes);
    }

//处理for
    Ztempl_M.prototype.build_for = function(nodes,data,notbind){
        if(!data)data = this.$data;

        var for_nodes = find_node(nodes,'[Zfor]');
        for(var i=0,ii=for_nodes.length;i<ii;i++){
            if(i>0&&isChildOf(for_nodes[i],for_nodes[i-1])){
                continue;
            }
            var key = for_nodes[i].getAttribute('Zfor');
            var data_res = this.get_data(key,data,notbind);
            var for_item = [];
            if(data_res.element.length > 0){
                var value_key = data_res.value?Object.keys(data_res.value):[];
                for(var vi_n = 0,vi_len=value_key.length,vi=value_key[0]||''; vi_n < vi_len; vi_n++,vi=value_key[vi_n]) {
                    var copy_node = for_nodes[i].cloneNode(true);
                    copy_node.removeAttribute('Zfor');
                    var fordata = cloneObj(data_res.value[vi]);
                    if(!isObject(fordata))fordata = {};
                    fordata['Zvalue'] = data_res.value[vi];
                    fordata['Zkey'] = value_key[vi_n];
                    this.build_for(copy_node.childNodes,fordata,notbind);//处理for内的for
                    this.build_if(copy_node,fordata);//处理for内的if
                    this.build_tag([copy_node],fordata);
                    if(!notbind)this.build_zbind(copy_node,fordata);
                    obje_before(copy_node,for_nodes[i]);
                    for_item.push(copy_node);
                }
                for(var ei=0,eii=data_res.element.length;ei<eii;ei++){
                    if(!notbind)this.bind_fornode(data_res.element[ei], key, data, for_nodes[i], for_nodes[i].cloneNode(true), for_item);
                    defineObj(data_res.element[ei].parent,data_res.element[ei].key,data_res.element[ei]);
                }
            }
            for_nodes[i].remove();
        }
        return nodes;
    }
//处理if
    Ztempl_M.prototype.build_if = function(nodes,data){
        //return nodes;
        if(!data)data = this.$data;
        var if_nodes = find_node(nodes,'[Zif]');
        for(var i=0,ii=if_nodes.length;i<ii;i++){
            var key = if_nodes[i].getAttribute('Zif');
            if_nodes[i].removeAttribute('Zif');
            var nextNode = if_nodes[i].nextElementSibling;
            var elseNode = false;
            if(nextNode && nextNode.hasAttribute('Zelse')){
                elseNode = nextNode;
            }
            else{
                elseNode = document.createTextNode('');
                obje_after(elseNode,if_nodes[i]);
            }
            //条件判断
            var data_res = this.get_data(key,data);
            data_res.value?elseNode&&elseNode.remove():if_nodes[i].remove();

            for(var ei=0,eii=data_res.element.length;ei<eii;ei++){
                this.bind_ifnode(data_res.element[ei],if_nodes[i],elseNode,key,data_res.element);
                defineObj(data_res.element[ei].parent,data_res.element[ei].key,data_res.element[ei]);
            }
        }
        return nodes;
    }

//处理绑定节点
    Ztempl_M.prototype.build_zbind = function(nodes,data){
        if(!data)data = this.$data;
        var zbind_nodes = find_node(nodes,'[Zbind]');
        for(var i=0,ii=zbind_nodes.length;i<ii;i++){
            var key = zbind_nodes[i].getAttribute('Zbind');
            zbind_nodes[i].removeAttribute('Zbind');
            var data_res = this.get_data(key,data);
            var value = data_res.element.length>0?data_res.element[0]:false;
            if(value){
                bind_event(zbind_nodes[i],'keyup,change,blur',value,(function(){
                    var _value = value;
                    return function(e){
                        if(e.type == 'keyup'){
                            if(e.currentTarget.tagName!='INPUT')return;
                            if(e.currentTarget.attributes.type && ['date','time','datetime-local'].indexOf(e.currentTarget.attributes.type.nodeValue.toLowerCase())>=0)return;
                        }
                        _value.parent[_value.key] = this.value;
                    }
                })());
                //value.parent[value.key] = zbind_nodes[i].value;
                defineObj(value.parent,value.key,value);
            }
        }
    }

//处理标签
    Ztempl_M.prototype.build_tag = function(nodes,data){
        if(typeof data == "undefined")data = this.$data;
        //节点替换
        if(nodes.childNodes){nodes = nodes.childNodes;}
        for(var i=0,ii=nodes.length;i<ii;i++){
            //text节点
            if(nodes[i].nodeType == 3){
                var res_node = this.split_textnode(nodes[i].nodeValue,data);
                if(!res_node) continue;
                res_node = res_node.reverse();//翻转排序
                for(var ni=0,nii=res_node.length;ni<nii;ni++){
                    //nodes[i].after(res_node[ni]);
                    obje_after(res_node[ni],nodes[i]);
                }
                nodes[i].remove();
                i+=(nodes.length - ii);
                ii=nodes.length;
            }
            else if(nodes[i].nodeType == 1){
                //处理属性
                var attr_arr = nodes[i].attributes;
                for(var ai=0,aii=attr_arr.length;ai<aii;ai++) {
                    this.split_attr(attr_arr[ai], data);
                }
                //处理子Nodes
                this.build_tag(nodes[i].childNodes,data);
            }
        }
    }

//分解标签节点
    Ztempl_M.prototype.split_textnode = function(str,data){
        var arr = clean_arr(str.split(REGEX_KEY));
        var keys = str.match(REGEX_KEY);
        if(!keys) return;
        for(var i=0,ii=keys.length;i<ii;i++){
            var n = arr.indexOf(keys[i]);
            keys[i] = this.clean_key(keys[i]);

            var data_res = this.get_data(keys[i],data);
            var new_textnode = createTextNode(data_res.value);
            for(var ei in data_res.element){
                if(isObject(data_res.element[ei]))bind_node(data_res.element[ei],new_textnode,data,keys[i]);
                data_res.element[ei].parent&&defineObj(data_res.element[ei].parent,data_res.element[ei].key,data_res.element[ei]);
            }
            arr.splice(n, 1, new_textnode);
        }
        return arr;
    }

//属性标签替换并绑定
    Ztempl_M.prototype.split_attr = function(objA,data){
        var attr_templ = objA.nodeValue;
        var keys = attr_templ.match(REGEX_KEY);
        if(!keys) return attr_templ;
        var res;
        objA.nodeValue = replace_templ(attr_templ,data)
        for(var i=0,ii=keys.length;i<ii;i++){
            var this_keys = this.clean_key(keys[i]);
            var data_res = this.get_data(this_keys,data);
            for(var ei=0,eii=data_res.element.length;ei<eii;ei++){
                bind_attr(data_res.element[ei],objA,attr_templ,data);
                defineObj(data_res.element[ei].parent,data_res.element[ei].key,data_res.element[ei]);
            }
        }
        return res;
    }

//if节点绑定
    Ztempl_M.prototype.bind_ifnode = function(value,if_nodes,elseNode,condition,keyitem){
        value.if_nodes||(value.if_nodes = []);
        value.if_nodes.push({
            if_node:if_nodes,
            elseNode:elseNode,
            condition:condition,
            keyitem:keyitem,
            data:this.$data,
        })
    };

//for节点绑定
    Ztempl_M.prototype.bind_fornode = function(value,key,data,for_node,for_node_templ,for_item){
        value.for_nodes||(value.for_nodes = []);
        var start_node = document.createTextNode('');
        //for_node.before(start_node)
        obje_before(start_node,for_node);
        var end_node = document.createTextNode('');
        //for_node.after(end_node)
        obje_after(end_node,for_node);

        value.for_nodes.push({
            for_node:for_node,
            for_node_templ:for_node_templ,
            start_node:start_node,
            end_node:end_node,
            templ:for_node_templ.outerHTML,
            key:key,
            data:data,
            for_item:for_item,
        })
    };


//模块插件执行
    Ztempl_M.prototype.build_module = function(nodes){
        var module_nodes = find_node(nodes,'module');
        console.log(module_nodes);
        return nodes;
    }


//从数据里获取值
    Ztempl_M.prototype.get_data = function(key,data,pass_build){
        //var value = (typeof data !== "undefined")?data:this.$data;
        var res_value = get_data(key,data);

        if(res_value.is_null&&!pass_build){
            this.$orig_data[key] = '';
            !res_value.parent&&(res_value.parent = this.$orig_data);
            !res_value.key&&(res_value.key = key);
            this.$data[key] = res_value;
        }

        return res_value;
    }

//清洗key
    Ztempl_M.prototype.clean_key = function(key){
        return key.replace(REGEX_KEY_TAG, '');
    }
//替换img标签的_src
    Ztempl_M.prototype.replace_img_src = function(nodes){
        var img_nodes = find_node(nodes,'img[_src]');
        for(var i=0,ii=img_nodes.length;i<ii;i++){
            var _src = img_nodes[i].getAttribute('_src');
            img_nodes[i].setAttribute('src',_src);
        }
        return nodes;
    }

    Ztempl_M.formateTemplate = function(str,template_list){
        return str.replace(/\[\[([\w]+)\]\]/g, function(match, key) {
            return (!template_list[key]||typeof template_list[key] == 'undefined')? '' : template_list[key];
        });
    }



//检查if条件
    function check_if(keyitem,condition) {
        if (condition.length == 3) {

            //if ((eval("('" + (!keyitem[0].is_null ? keyitem[0].$value() : condition[0]) + "'" + condition[1] + "'" + (!keyitem[2].is_null ? keyitem[2].$value() : condition[2]) + "')"))) {
            if ((eval("('" + (keyitem[0].$value()||condition[0]) + "'" + condition[1] + "'" + (keyitem[2].$value()||condition[2]) + "')"))) {
                return true;
            }
        }
        else {
            if (keyitem[0] && keyitem[0].value) {
                return true;
            }
        }
        return false;
    }

//从对象获取数据
    function get_data(key,data){
        var p_key = key.match(DATA_KEY);
        key = key.replace(DATA_KEY_TAG, '')
        var element = [];        //计算结果
        var code = ['try{return('+key+')}catch(err){return {};}'];

        if(p_key){
            //多变量
            for(var i in p_key){
                p_key[i] = p_key[i].replace(DATA_KEY_TAG, '')
                var obj = get_obj(data,p_key[i]);
                if(isObject(obj) || isArray(obj))element.push(obj);
            }
            for(var i in p_key){
                var r_key = p_key[i].split('.');
                code.unshift('var '+r_key[0]+'=this.'+r_key[0]  +';');
            }
        }
        else{
            //单变量
            var fullkey = key;
            key = key.split(/[\s\|\?\&\%\*\+\-\/\=\[\]]+/)[0];//取出开始的变量
            var obj = get_obj(data,key,fullkey);
            var r_key = key.split('.');
            if(r_key[0])code.unshift('var '+r_key[0]+'=this.'+r_key[0]+';');
            if(isObject(obj) || isArray(obj))element.push(obj);
        }

        var fn = new Function(code.join('\n'));
        var res = fn.apply(data.$orig_data||data);
        return {value:res,element:element.length>0?element:false};

        function get_obj(data,key,fullkey){
            var parent = data.parent||data.$orig_data||data;
            if(!isObject(data)){
                var res = build_data([''])[0];
                res.parent = parent;
                res.key = fullkey||key;
                return res;
            }
            var key_path = key.split('.');
            var value = data;
            while (i = key_path.shift()){
                if(value.$child)value=value.$child;
                if(typeof value[i] == 'undefined' && !isString(value)){
                    value[i] = build_data([''])[0];
                    value[i].parent = parent;
                    value[i].key = i;
                    if(key_path.length>0)value[i].$child = {};//若非最后一级则增加child

                    if(!isObject(parent)){
                        parent = {};
                    }
                    parent[i] = key_path.length>0?{}:value[i].value;
                }
                parent = parent[i];
                value = value[i];
            }
            return value;
        }
    }

    function get_value(key,data) {
        var res = get_data(key,data);
        return res.value;
    }

    function createTextNode(value,keys){
        return document.createTextNode(value);
    }
    function find_node(node,selector){
        selector = selector.toLowerCase();
        var find_box;
        if(node.parentNode){
            find_box = node.parentNode;
        }
        else{
            if(isNodeList(node)){
                find_box = node[0].parentNode;
            }
            else{
                find_box = document.createElement('div');
                obje_append(node,find_box);
            }
        }
        var node_list = find_box.querySelectorAll(selector);
        return node_list;
    }

    function clean_arr(array){
        for(var i = 0 ;i<array.length;i++)
        {
            if(array[i] == "" || typeof(array[i]) == "undefined")
            {
                array.splice(i,1);
                i= i-1;
            }
        }
        return array;
    }

    function bind_node(obj,node,data,key_str){
        if(!obj.node)obj.node = [];
        obj.data = data;
        obj.key_str = key_str;
        obj.node.push(node);
    }

//绑定属性
    function bind_attr(value,objA,attr_templ,data){
        attr_templ||(attr_templ = objA.nodeValue);
        value.attrs||(value.attrs=[]);
        value.attrs.push({
            target:objA,
            templ:attr_templ,
            data:data
        });
    }

//绑定事件
    function bind_event(objE,event_str,value,fn){
        var events = event_str.split(',');
        value.bind_values||(value.bind_values=[]);
        value.bind_values.push({
            target:objE,
        });
        objE.value = value.value;
        for(var i = 0 ;i<events.length;i++){
            if (objE.addEventListener)
            {
                objE.addEventListener(events[i], fn);
            } else if (x.attachEvent)
            {
                objE.attachEvent('on'+events[i], fn);
            }
        }
    }

//单个替换模板
    function single_replace_templ(templ,keys,data){
        return templ.replace(new RegExp(keys,'g'),data.$value()||'');
    }
//替换模板
    function replace_templ(templ,data){
        return templ.replace(REGEX_KEY_WARP, function(match, key) {
            return get_value(key,data);
        });
    }

//克隆对象
    var cloneObj = function (obj) {
        var newObj = {};
        if (obj instanceof Array) {
            newObj = [];
        }
        for (var key in obj) {
            var val = obj[key];
            //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。
            newObj[key] = typeof val === 'object' ? cloneObj(val): val;
        }
        return newObj;
    };

//数据元素双向绑定
    function defineObj(obj, prop, data){
        data.value ||  (data.value=data.orig_data||'');
        data.node || (data.node=[]);
        try {
            if(!obj) return;
            Object.defineProperty(obj, prop, {
                get: function() {
                    return data.value;
                },
                set: function(newVal) {
                    data.value = newVal;
                    for(var i=0,ii=data.node.length;i<ii;i++) {
                        data.node[i].nodeValue = get_data(data.key_str,data.data).value;
                    }
                    if(data.attrs){
                        for(var i=0,ii=data.attrs.length;i<ii;i++) {
                            data.attrs[i].target.nodeValue = replace_templ(data.attrs[i].templ,data.attrs[i].data);
                            if(data.attrs[i].target.name == "_src"){
                                data.attrs[i].target.ownerElement.setAttribute('src',data.attrs[i].target.nodeValue)
                            }
                        }
                    }
                    if(data.bind_values){
                        for(var i=0,ii=data.bind_values.length;i<ii;i++) {
                            data.bind_values[i].target.value = newVal;
                        }
                    }
                    if(data.if_nodes){
                        for(var i=0,ii=data.if_nodes.length;i<ii;i++) {
                            var _M = new Ztempl_M();
                            var data_res= get_data(data.if_nodes[i].condition,data.if_nodes[i].data);
                            if(data_res.value){
                                if(!data.if_nodes[i].if_node.isConnected){
                                    _M.init(data.if_nodes[i].if_node,data.if_nodes[i].data);
                                    obje_after(data.if_nodes[i].if_node,data.if_nodes[i].elseNode);
                                    data.if_nodes[i].elseNode.remove();
                                }
                            }else{
                                if(!data.if_nodes[i].elseNode.isConnected){
                                    _M.init(data.if_nodes[i].elseNode,data.if_nodes[i].data);
                                    obje_after(data.if_nodes[i].elseNode,data.if_nodes[i].if_node);
                                    data.if_nodes[i].if_node.remove();
                                }
                            }
                        }
                    }
                    if(data.for_nodes){
                        data.$child = build_data(newVal);
                        for(var i=0,ii=data.for_nodes.length;i<ii;i++) {
                            //清空原值
                            for(var ti=0,tii=data.for_nodes[i].for_item.length;ti<tii;ti++) {
                                data.for_nodes[i].for_item.pop().remove();
                            }
                            //计算新值
                            var _M = new Ztempl_M();
                            var for_box = document.createElement('div');
                            obje_append(data.for_nodes[i].for_node,for_box);
                            //data.for_nodes[i].data.$child = $child;
                            _M.build_for(for_box,data.for_nodes[i].data,1);
                            _M.replace_img_src(for_box);
                            //插入列表
                            for(var fi=0,fii=for_box.childNodes.length;fi<fii;fi++) {
                                data.for_nodes[i].for_item.push(for_box.childNodes[0]);
                                obje_before(for_box.childNodes[0],data.for_nodes[i].start_node);
                            }
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
        } catch (error) {
            // IE8+ 才开始支持defineProperty,这也是Vue.js不支持IE8的原因
            // console.log("Browser must be IE8+ !");
            // console.log("错误名称: " + error.name+" ---> ");
            // console.log("错误信息: " + error.message+" ---> ");
        }
    }

//构建初始数据
    function build_data($orig_data,root){
        var $data = root?{$orig_data:$orig_data}:{};
        for(var i in $orig_data){
            $data[i] = data_value_default($orig_data,i);
            if(isObject($orig_data[i])||isArray($orig_data[i])){
                $data[i].$child=build_data($orig_data[i]);
            }
            else if(isString($orig_data[i])||isNumber($orig_data[i])){
                $data[i].value=$orig_data[i];
            }
        }
        return $data;
    }

    function data_value_default($orig_data,i){
        return {
            value:'',
            orig_data:$orig_data[i],
            key:i,
            parent:$orig_data,
            $value:function(){
                return this.child||(this.value.toString().length>0?this.value:false)||this.default_value||(typeof this.value !== 'undefined'?this.value:'');
            }
        };
    }

    function isChildOf(child, parent) {
        var parentNode;
        if(child && parent) {
            parentNode = child.parentNode;
            while(parentNode) {
                if(parent === parentNode) {
                    return true;
                }
                parentNode = parentNode.parentNode;
            }
        }
        return false;
    }

    function isNodeList(o){
        return Object.prototype.toString.call(o) === '[object NodeList]';
    }
    function isObject(o){
        return Object.prototype.toString.call(o) === '[object Object]';
    }
    function isArray(a) {
        return Object.prototype.toString.call(a)=== '[object Array]';
    }
    function isString(value) {return typeof value === 'string';}
    //function isNumber(value) {return typeof value === 'number';}

    function obje_before(newobje,tobje){
        if(tobje.before){
            tobje.before(newobje);
        }
        else{
            tobje.parentNode.insertBefore(newobje,tobje);
        }
    }
    function obje_after(newobje,tobje){
        if(tobje.after){
            tobje.after(newobje);
        }
        else{
            if(typeof newobje != 'object') newobje = document.createTextNode(newobje);
            var parent = tobje.parentNode;
            if (parent.lastChild == newobje) {
                parent.appendChild(newobje);
            }
            else {
                parent.insertBefore(newobje, tobje.nextSibling);
            }
        }
    }
    function obje_append(newobje,tobje){
        if(tobje.append){
            tobje.append(newobje);
        }
        else{
            tobje.insertBefore(newobje,tobje.childNodes[-1]);
        }
    }
    function isNumber(value) {
        var patrn = /^(-)?\d+(\.\d+)?$/;
        if (patrn.exec(value) == null || value == "") {
            return false
        } else {
            return true
        }
    }
    function parseDom(arg,trim) {
        var objE = document.createElement("div");
        if(isString(arg)){
            objE.innerHTML = arg;
        }
        else if(isArray(arg)){
            for(var i=0,ii=arg.length;i<ii;i++) {
                objE.append(arg[i]);
            }
        }
        else if(isObject(arg)){
            for(var i in arg) {
                objE.append(arg[i]);
            }
        }
        //return objE;
        return trim?objE:objE.childNodes;
    };
})(window);
