/**
 * Created by Administrator on 2017/11/6.
 */
/**
 * 1,修复Zfor的项目不为对象时会出错
 * 2,修复Zif为空列表时判断为true问题
 *
 * 2.1.2
 * 1,增加img标签里的_src替换为src功能
 */
(function(window) {'use strict';
    var Ztempl = window.Ztempl || (window.Ztempl=init);
    var REGEX_KEY = /(\{\{[\w\:\.\|\u4e00-\u9fa5]+\}\})/g;
    var REGEX_KEY_WARP = /\{\{([\w\:\.\|\u4e00-\u9fa5]+)\}\}/g;
    var REGEX_KEY_TAG = /([\{\{\}\}]+)/g;

    function init(str,data,templ_list){
        console.time("Ztempl");
        if(!str) return false;
        var M = new Ztempl_M();
        //替换[[]]模板
        if(isString(str)){
            str = Ztempl_M.formateTemplate(str,templ_list||{});
        }

        if(str instanceof jQuery){
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
        //this.build_module(this.$nodes);
    }

//处理for
    Ztempl_M.prototype.build_for = function(nodes,data,notbind){
        //return nodes;
        if(!data)data = this.$data;

        var for_nodes = find_node(nodes,'[Zfor]');
        for(var i=0,ii=for_nodes.length;i<ii;i++){
            if(i>0&&isChildOf(for_nodes[i],for_nodes[i-1])){
                continue;
            }
            var key = for_nodes[i].getAttribute('Zfor');
            //for_nodes[i].removeAttribute('Zfor');
            var value = this.get_data(key,data,notbind);
            var for_item = [];
            if(value){
                if(notbind){
                    //if(key == 'Zvalue')value.child = value.value;
                }
                else{
                    this.bind_fornode(value,key,data,for_nodes[i],for_nodes[i].cloneNode(true),for_item);
                }

                //尝试性能优化
                //当key或value为数字时循环数字次数
                if(isNumber(value.key)||(value.value&&isNumber(value.value))){
                    var for_num = isNumber(value.key)?parseInt(value.key):parseInt(value.value);
                    value.child = new Array(for_num);
                    value.child =  value.child.join(',').split(',');
                    for(var child_i=0,child_ii=value.child.length;child_i<child_ii;child_i++){
                        value.child[child_i] = {
                            value:(function(child_i){return child_i+1;})(child_i),
                            $value:function(){return this.value},
                        }
                    }
                }
                var value_key = value.child?Object.keys(value.child):[];
                for(var vi_n = 0,vi_len=value_key.length,vi=value_key[0]||''; vi_n < vi_len; vi_n++,vi=value_key[vi_n]) {
                //尝试性能优化--结束
                //for(var vi in value.child){
                    var copy_node = for_nodes[i].cloneNode(true);
                    for_nodes[i].removeAttribute('Zfor');
                    this.build_for(copy_node.childNodes,value.child[vi].$value(),notbind);//处理for内的for
                    this.build_if(copy_node,value.child[vi].$value());//处理for内的if
                    var fordata = value.child[vi].$value();
                    if(!isObject(fordata))fordata = {};
                    fordata['$orig_data'] = value.child[vi].$orig_data||value.child[vi].orig_data||{}
                    if(!isObject(fordata)&&!isArray(fordata))fordata={};
                    fordata['Zvalue'] = value.child[vi].$value();
                    fordata['$data'] = data;
                    if(isObject(fordata['Zvalue'])){
                        fordata['Zvalue']['child'] = value.child[vi].$value();
                    }
                    fordata['Zkey'] = vi;
                    this.build_tag([copy_node],fordata);
                    this.build_zbind(copy_node,fordata);
                    //for_nodes[i].before(copy_node);
                    obje_before(copy_node,for_nodes[i]);

                    for_item.push(copy_node);
                }
                if(!notbind)defineObj(value.parent,value.key,value);

                /*if(notbind){//不绑定for节点
                 if(key == 'Zvalue')value.child = value.value;
                 for(var vi in value.child){
                 var copy_node = for_nodes[i].cloneNode(true);
                 this.build_if(copy_node,value.child[vi].$value());//处理for内的if
                 this.build_for(copy_node.childNodes,value.child[vi].$value(),notbind);//处理for内的for
                 var fordata = value.child[vi].$value();
                 if(!isObject(fordata)&&!isArray(fordata))fordata={};
                 fordata['Zvalue']= value.child[vi].$value();
                 fordata['Zkey'] = vi;
                 this.build_tag([copy_node],fordata);
                 //for_nodes[i].before(copy_node);
                 obje_before(copy_node,for_nodes[i]);
                 for_item.push(copy_node);
                 }
                 }
                 else{
                 this.bind_fornode(value,key,data,for_nodes[i],for_nodes[i].cloneNode(true),for_item);
                 for(var vi in value.child){
                 var copy_node = for_nodes[i].cloneNode(true);
                 this.build_if(copy_node,value.child[vi].$value());//处理for内的if
                 this.build_for(copy_node.childNodes,value.child[vi].$value(),notbind);//处理for内的for
                 var fordata = value.child[vi].$value();
                 if(!isObject(fordata)&&!isArray(fordata))fordata={};
                 fordata['Zvalue']= value.child[vi].$value();
                 fordata['Zkey'] = vi;
                 this.build_tag([copy_node],fordata);
                 this.build_zbind(copy_node);
                 //for_nodes[i].before(copy_node);
                 obje_before(copy_node,for_nodes[i]);
                 for_item.push(copy_node);
                 }

                 defineObj(value.parent,value.key,value);
                 }*/
            }


            for_nodes[i].remove();
            //i+=(for_nodes.length - ii);
            //ii=for_nodes.length;
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
                //if_nodes[i].after(elseNode);
                obje_after(elseNode,if_nodes[i]);

            }


            //条件判断
            var condition = key.split(' ');
            var keyitem = ['','',''];
            if(condition.length == 1){
                keyitem[0] = this.get_data(condition[0],data,1);
                if(!keyitem[0].is_null){
                    this.bind_ifnode(keyitem[0],if_nodes[i],elseNode,condition,keyitem);
                    defineObj(keyitem[0].parent,keyitem[0].key,keyitem[0]);
                }

                /*if(keyitem[0] && keyitem[0].value){
                 this.build_tag([if_nodes[i]],data);
                 elseNode&&elseNode.remove();
                 }
                 else{
                 elseNode&&this.build_tag([elseNode],keyitem[0]);
                 if_nodes[i].remove();
                 }*/
            }
            else if(condition.length == 3){
                keyitem[0] = this.get_data(condition[0],data,1);
                keyitem[2] = this.get_data(condition[2],data,1);
                if(!keyitem[0].is_null){
                    this.bind_ifnode(keyitem[0],if_nodes[i],elseNode,condition,keyitem);
                    defineObj(keyitem[0].parent,keyitem[0].key,keyitem[0]);
                }
                if(!keyitem[2].is_null){
                    this.bind_ifnode(keyitem[2],if_nodes[i],elseNode,condition,keyitem);
                    defineObj(keyitem[2].parent,keyitem[2].key,keyitem[2]);
                }

                /*if((eval("('"+(keyitem[0]?keyitem[0].value:condition[0])+"'"+condition[1]+"'"+(!keyitem[2].is_null?keyitem[2].value:condition[2])+"')"))){
                 this.build_tag([if_nodes[i]],data);
                 elseNode&&elseNode.remove();
                 }
                 else{
                 elseNode&&this.build_tag([elseNode],data);
                 if_nodes[i].remove();
                 }*/
            }

            //if不处理标签
            //this.build_tag([if_nodes[i]],data);
            //elseNode&&this.build_tag([elseNode],keyitem[0]);
            if(check_if(keyitem,condition)){
                elseNode&&elseNode.remove();
            }
            else{
                if_nodes[i].remove();
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
            var value = this.get_data(key,data);
            bind_event(zbind_nodes[i],'keyup,change,blur',value,(function(){
                var _value = value;
                return function(){
                    _value.parent[_value.key] = this.value;
                }
            })());
            defineObj(value.parent,value.key,value);
        }
    }

//处理标签
    Ztempl_M.prototype.build_tag = function(nodes,data){
        if(typeof data == "undefined")data = this.$data;
        //节点替换
        if(nodes.childNodes){nodes = nodes.childNodes;}
        for(var i=0,ii=nodes.length;i<ii;i++){
            if(nodes[i].nodeType == 3){
                var res_node = this.split_textnode(nodes[i].nodeValue,data);
                if(!res_node) continue;
                res_node = res_node.reverse();//
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

            var value = this.get_data(keys[i],data);
            if(value){
                var new_textnode = createTextNode(value,keys[i]);
                bind_node(value,new_textnode);
                value.parent&&defineObj(value.parent,value.key,value);
                arr.splice(n, 1, new_textnode);
            }
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
            var value = this.get_data(this_keys,data);
            if(!value.is_null){
                bind_attr(value,objA,attr_templ,data);
                defineObj(value.parent,value.key,value);
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

//从原始数据里获取值
    /*Ztempl_M.prototype.get_value = function(key){
     if(!key) return false;
     var key_path = key.split('.');
     var value = this.$orig_data;
     for(var i=0,ii=key_path.length;i<ii;i++){
     if(value[key_path[i]]){
     value = value[key_path[i]];
     }
     else{
     return '';
     }
     }
     return value;
     }
     Ztempl_M.prototype.get_parent_and_value = function(key,key_prefix){
     if(['Zkey','Zvalue'].indexOf(key)>=0) key='';
     if(key_prefix)key=key_prefix+(key?'.'+key:'');
     var key_path = key.split('.');
     var value = this.$orig_data;
     var parent = value;
     var key_str = key;
     var n = key_path.length-1;
     for(var i=0,ii=key_path.length;i<ii;i++){
     if(i == n){
     parent = value;
     key_str = key_path[i];
     }
     if(value[key_path[i]]){
     value = value[key_path[i]]||'';
     }
     else{
     return '';
     }
     }
     return {parent:parent,value:value,key:key_str};
     }*/

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

        /*var default_value = false;
         if(key.indexOf('||')>=0) {
         var _temp = key.split("||");
         key = _temp[0];
         _temp[1]&&(default_value=_temp[1]);
         data&&(data.default_value = default_value);
         }

         if(['Zkey','Zvalue'].indexOf(key)>=0) return data;

         var key_path = key.split('.');

         for(var i=0,ii=key_path.length;i<ii;i++){
         if(value[key_path[i]]){
         if(i == (ii-1)){
         value = value[key_path[i]]||{};
         }
         else{
         value = value[key_path[i]].child||[];
         }
         }
         else{
         return "";
         }
         }
         if(default_value) value.default_value = default_value;
         return value;*/
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
    function get_data(key,data,default_value){
        var value = data;
        //var default_value = false;
        //var res = '';
        if(key.indexOf('||')>=0) {
            var _temp = key.split("||");
            key = _temp[0];
            _temp[1]&&(default_value=_temp[1]);
            isObject(data)&&(data.default_value = default_value);
        }

        if(['Zkey','Zvalue'].indexOf(key)>=0){
            var res =  (key=='Zvalue')?{value:(isObject(data)||isArray(data))?data.Zvalue||'':data.Zvalue||data,key:key,child:data.Zvalue||data}:{value:data.Zkey,key:key};
            //if(isArray(data))res.child = data;
            return res;
        }

        var key_path = key.split('.');
        var parent = value.$orig_data||value.orig_data||{};
        for(var i=0,ii=key_path.length;i<ii;i++){
            if(isString(parent) || isNumber(value)) continue;//如果父级是字符串或值为数字
            if(!value[key_path[i]]){
                parent[key_path[i]] = {};
                value[key_path[i]]=data_value_default(parent,key_path[i]);
                /*value[key_path[i]]={$value:function(){
                 return this.child||this.value||this.default_value||(typeof this.value !== 'undefined'?this.value:'');
                 },value:'',key:key_path[i],parent:parent};*/
            }

            if(i == (ii-1)){
                value = value[key_path[i]]||{};
                /*if(!value[key_path[i]]){
                 value.is_null = 1;
                 }*/
            }
            else{
                if(!parent[key_path[i]]){
                    parent[key_path[i]]={};
                }
                parent = parent[key_path[i]];
                if(!value[key_path[i]].child)value[key_path[i]].child={};
                value = value[key_path[i]].child||value[key_path[i]]||[];
            }
            /*if(value[key_path[i]]){
             if(i == (ii-1)){
             value = value[key_path[i]]||{};
             }
             else{
             value = value[key_path[i]].child||[];
             }
             }
             else{
             //defineObj(value,key_path[i],{value:''});
             //value = {value:'',key:key,is_null:1};
             value = {value:'',key:key_path[i],child:{},parent:parent};
             }*/
        }
        if(default_value) value.default_value = default_value;
        //res = value.value||value.default_value;
        return value;
    }

    function get_value(key,data) {
        var res = get_data(key,data);
        if(res == data&&data.$data)res = get_data(key,data.$data);
        return res.value||res.default_value||'';
    }

    function createTextNode(value,keys){
        if(!value.key || value.key == 'Zvalue'){
            return document.createTextNode(value.value||value.default_value||'');
        }
        else if(value.keys == 'Zkey'){
            return document.createTextNode(value.key||value.default_value||'');
        }
        else{
            return document.createTextNode(value.value||value.default_value||'');
        }
    }
    function find_node(node,selector){
        selector = selector.toLowerCase();
        var node_list = [];
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
                //find_box.append(node);
                obje_append(node,find_box);
            }
        }
        node_list = find_box.querySelectorAll(selector);
        /*if(node.nodeType == 1){
         }
         if(isNodeList(node)){
         node_list = node.parentNode.querySelectorAll(selector);
         }
         else if(node.nodeType == 1){
         node_list = node.querySelectorAll(selector);
         }*/
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

    function bind_node(data,node){
        if(!data.node)data.node = [];
        data.node.push(node);
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
        data.value ||  (data.value='');
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
                        data.node[i].nodeValue = newVal;
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
                            if(check_if(data.if_nodes[i].keyitem,data.if_nodes[i].condition)){
                                if(!data.if_nodes[i].if_node.isConnected){
                                    _M.init(data.if_nodes[i].if_node,data.if_nodes[i].data);
                                    //data.if_nodes[i].elseNode.after(data.if_nodes[i].if_node);
                                    obje_after(data.if_nodes[i].if_node,data.if_nodes[i].elseNode);
                                    data.if_nodes[i].elseNode.remove();
                                }
                            }
                            else{
                                if(!data.if_nodes[i].elseNode.isConnected){
                                    _M.init(data.if_nodes[i].elseNode,data.if_nodes[i].data);
                                    //data.if_nodes[i].if_node.after(data.if_nodes[i].elseNode);
                                    obje_after(data.if_nodes[i].elseNode,data.if_nodes[i].if_node);
                                    data.if_nodes[i].if_node.remove();
                                }
                            }

                        }
                    }
                    if(data.for_nodes){
                        //console.time("Ztempl");

                        data.child = build_data(newVal);
                        for(var i=0,ii=data.for_nodes.length;i<ii;i++) {
                            //清空原值
                            for(var ti=0,tii=data.for_nodes[i].for_item.length;ti<tii;ti++) {
                                data.for_nodes[i].for_item.pop().remove();
                            }
                            //计算新值
                            var _M = new Ztempl_M();
                            data.for_nodes[i].for_node.setAttribute("Zfor", data.for_nodes[i].key);
                            var for_box = document.createElement('div');
                            //for_box.append(data.for_nodes[i].for_node_templ);
                            obje_append(data.for_nodes[i].for_node,for_box);
                            var res = _M.build_for(for_box,data.for_nodes[i].data,1);
                            _M.replace_img_src(for_box);
                            for(var fi=0,fii=for_box.childNodes.length;fi<fii;fi++) {
                                data.for_nodes[i].for_item.push(for_box.childNodes[0]);
                                //data.for_nodes[i].start_node.before(for_box.childNodes[0]);//before后元素会出栈，所以每次只取0就可以了
                                obje_before(for_box.childNodes[0],data.for_nodes[i].start_node);
                            }
                        }
                        //console.timeEnd("Ztempl");

                    }

                },
                enumerable: true,
                configurable: true
            });
        } catch (error) {
            // IE8+ 才开始支持defineProperty,这也是Vue.js不支持IE8的原因
            console.log("Browser must be IE8+ !");
            console.log("错误名称: " + error.name+" ---> ");
            console.log("错误信息: " + error.message+" ---> ");
        }
    }

//构建初始数据
    function build_data($orig_data,root){
        var $data = root?{$orig_data:$orig_data}:{};
        for(var i in $orig_data){
            $data[i] = data_value_default($orig_data,i);
            if(isObject($orig_data[i])||isArray($orig_data[i])){
                $data[i].child=build_data($orig_data[i]);
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
    function isNumber(value) {return typeof value === 'number';}

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