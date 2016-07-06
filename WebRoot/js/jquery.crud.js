/*********************************************************
                    基于Jquery1.11.3版本
                    Jquery 增删查改功能
*********************************************************/
(function($) {
	/*******************************************************
    					修改日志
			2016.04.18 新增按钮动作绑定监听
			2016.04.26 为删除功能设置传入数组参数delparam[],数组容量为2
			           delparam[0]为参数名 delparam[1]为获取参数值的html标签id或class
			           为预更新功能设置传入数组参数updateparam[]		
			           updateparam[0]为参数名 updateparam[1]为获取参数值的html标签id或class	
			2016.04.27 新增数据更新功能
			2016.04.28 bug:{
			           翻页时需要对删除按钮和预更新按钮被重置，所以每次翻页时需要重新执行绑定监听函数，
			           而确认更新按钮并没有被重置，所以导致了确认按钮被重复绑定了多次监听，点一下确认更新按钮会导致更新多次
			           }
			           解决方法：在绑定监听函数前，新增了解绑函数，绑定前先解绑，避免事件重复绑定
			2016.05.03 新增条件查询功能
			2016.05.10 新增隐藏空白行功能，当当前页数据不足一页时，自动遍历设置空白行display:none
			2016.05.11 代码调优，由300行代码减少至150行
	 *******************************************************/

	/******************listener start***********************
	               监听 data-crudtype 传递的值                      
	        暂时只设置对<input> <button> <a> <i> 四种标签的监听绑定               
	              如需为其他更多元素增加点击弹出框效果                      
	               请在listener区域绑定新的监听标签
    *******************************************************/
	$.fn.crudListener = function(){ 
		/****绑定事件前先解绑，避免有的事件多次绑定****/
		$('input[data-crudtype]').off('click');	
		$('button[data-crudtype]').off('click');
		$('a[data-crudtype]').off('click');	
		$('i[data-crudtype]').off('click');
		/****绑定input标签****/
		$('input[data-crudtype]').on('click', function(e) {		
			$(this).crud($(this).data());
		});
		/****绑定button标签****/
		$('button[data-crudtype]').on('click', function(e) {
			$(this).crud($(this).data());
		});
		/****绑定a标签****/
		$('a[data-crudtype]').on('click', function(e) {
			e.preventDefault();//阻止<a>标签默认的点击事件（超链接跳转）
			$(this).crud($(this).data());
		});
		/****绑定i标签****/
		$('i[data-crudtype]').on('click', function(e) {
			$(this).crud($(this).data());
		});
	}   
	/******************listener end***********************/	

    $.fn.crud = function(options) {	
    	/*********************************************
        			设置默认属性
			queryurl:查询url(若无设定此属性，则需设置pagesetting.urltd，queryurl属性主要用于主表查询) 
			jsontype:数据遍历函数参数，选定遍历函数(若无设定此属性，则需设置pagesetting.typetd,jsontype属性主要用于主表查询) 
			pagesetting{
				loading:ajax载入动画class或id
				refresh:刷新当前页按钮id
				firstpage:第一页按钮id
				lastpage:最后一页按钮id
				prevpage:上一页按钮id
				nextpage:下一页按钮id
				setpagesize:页行数设置按钮class
				pagesize:存放页行数的html标签class或id
				pageno:存放页码的html标签class或id
				pagerow:存放数据下标数的html标签class或id
				tablename:表格id 
				urltd:存放url的html标签id(urltd属性主要用于lov查询)
				typetd:存放jsontype的html标签的id(typetd属性主要用于lov查询)
				}    
		*********************************************/   
        var defaults={
        	crudsetting:'{"loading":"","refresh":"","firstpage":"","lastpage":"","prevpage":"","nextpage":"","setpagesize":"","pagesize":"","pageno":"","pagerow":"","tablename":"","jsontype":""}'
        }              	
        /******继承默认属性******/
        var options = $.extend({}, defaults, options); 
        /****全局函数****/
        jQuery.global={
        	/******判断当前页是否为首页或末页******/
            pageFlag:function(firstPageFlag,lastPageFlag){
           	    if(firstPageFlag=='true'){
           			$(options.crudsetting.prevpage).css('display','none');
           			$(options.crudsetting.firstpage).css('display','none');
           		}else{
           			$(options.crudsetting.prevpage).css('display','');
           			$(options.crudsetting.firstpage).css('display','');
           		}
           		if(lastPageFlag=='true'){
           			$(options.crudsetting.lastpage).css('display','none');
            		$(options.crudsetting.nextpage).css('display','none');
           		}else{
           			$(options.crudsetting.lastpage).css('display','');
           			$(options.crudsetting.nextpage).css('display','');
           		}
           	},
           	main:function(){
           		
           	}
        }
        	
        return this.each(function() {       	
        	/******删除方法******/
			if(options.crudtype=='del'){
				pageSize=parseInt($(options.crudsetting.pagesize).val());
				/****删除提示信息弹出框内容尚未更改为可设置参数，待处理****/
				tr=$(this).parent().parent();
				name=tr.children('.FULL_NAME').text();
				result=confirm('是否要删除用户('+name+')?');
				/****删除提示信息弹出框内容尚未更改为可设置参数，待处理****/
				if(result==true){
					$(options.crudsetting.loading).show();//显示加载动画
					pageNo=parseInt($(options.crudsetting.pageno).val());
					param='pageSize='+pageSize+'&pageNo='+pageNo+'&'+options.delparam[0]+'='+tr.children(options.delparam[1]).text();//设置参数
					$.ajax({
						type:'post', 
						data:param,
						url:options.delurl,
						dataType:'json',
						success: function (data) {
							$(options.crudsetting.refresh).click();//点击刷新当前页按钮，刷新数据	
						},
						error: function () {
							alert("获取Json数据失败");
						}
					}); 
					return;			
				}else{            
					result=null;
				}	    				
			}
			/******预更新方法******/
			else if(options.crudtype=='pre-update'){
				$(options.crudsetting.loading).show();//显示加载动画
				tr=$(this).parent().parent();
				param=options.updateparam[0]+'='+tr.children(options.updateparam[1]).text();//设置参数
				$.ajax({
					type:'post', 
					data:param,
					url:options.preupdateurl,
					dataType:'json',
					success: function (data) {
						jQuery.json.getUpdateJSON(data);//获取目标更新行数据
						$(options.crudsetting.loading).hide();//隐藏加载动画
					},
					error: function () {
						alert("获取Json数据失败");
					}
				});			
			}
			/******更新方法******/
			else if(options.crudtype=='update'){
				jQuery.json.setUpdateParam();
				pageSize=parseInt($(options.crudsetting.pagesize).val());
				pageNo=parseInt($(options.crudsetting.pageno).val());
				param=options.updateparam[0]+'='+$(options.updateparam[1]).val()+'&'+param;//设置参数
				$.ajax({
					type:'post', 
					data:param,
					url:options.updateurl,
					dataType:'text',
					success: function (data) {
						$('.'+options.dismissmodalclass).click();//点击关闭更新框按钮
						$(options.crudsetting.refresh).click();//点击刷新当前页按钮，刷新数据						  
					},
					error: function () {
						alert("获取数据失败");
					}				
				});		
			}
			/******条件查询方法******/
			else if(options.crudtype=='query'){
				/****设置查询条件参数函数，暂时写在页面里，考虑改进中****/
				jQuery.json.setQueryParam();
				/****设置查询条件参数函数，暂时写在页面里，考虑改进中****/
				pageSize=parseInt($(options.crudsetting.pagesize).val());				
				pageNo=parseInt(1);
				$(options.crudsetting.pageno).val(pageNo)
				param=param+'&pageSize='+pageSize+'&pageNo='+pageNo;
				queryurl=$(options.crudsetting.urltd).val();
				$.ajax({
					type:'post', 
					data:param,
					url:queryurl,
					dataType:'json',
					success: function (data) {
						$(options.crudsetting.tablename+' td').html('');
						jQuery.json.getMSG(data);
						$(options.crudsetting.tablename+' tr').css('display','');//显示被隐藏行
						jQuery.json.getContent(data,$(options.crudsetting.typetd).val());
						for(j=0;j<=(pageSize-(pageMaxRow-pageMinRow+1));j++){//隐藏空白行
	                	    $(options.crudsetting.tablename+' tr:eq('+(pageSize-j+1)+')').css('display','none');
	                	}
						jQuery.global.pageFlag(firstPageFlag,lastPageFlag);
						/****调整Lov框位置的函数,暂时写在页面里,待改进，考虑设置监听替代****/
						jQuery.crud.add();
						/****调整Lov框位置的函数,暂时写在页面里,待改进，考虑设置监听替代****/
					},
					error: function () {
						alert("获取Json数据失败");
					}
				}); 
			}
        });
    }
	
})(jQuery);