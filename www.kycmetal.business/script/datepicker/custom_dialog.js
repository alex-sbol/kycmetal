(function(){
		var html_caches={};
		/**
		 * Float对话框aaa
		 * (String)load_url - 加载的地址
		 * (Object)option - 配置项(title|titlebg|contentClass|id|width|height|left|top|isCenter|overlay|showBottom|zIndex|open|close)
		 */
		function show_custom_panel(load_url,option){
			var modregexp=/_m=([^&]+)/;
			var actregexp=/_a=([^&]+)/;

			var modarr=modregexp.exec(load_url);
			var actarr=actregexp.exec(load_url);
			var m='';
			var a='';
			if(modarr) m=modarr[1];
			if(actarr) a=actarr[1];
			if(m=='userlogin' && (a=='login_dialog'||a=='registeruser'||a=='edit_user')){
				openWDialog(load_url,option);
				return;
			}
            
			if(m=='userlogin' && (a=='forgetpwd_s'||a=='forgetpwd_way')){
				openWDialog(load_url,option);
				return;
			}

			var opshow = option.opshow || false;			
			if(opshow){
				openWDialog(load_url,option);
				return;
			}
            
			var config = $.extend({},{
				title: 'Title',
				titlebg: true,
				id: 'wp-custom_panel',
				width: 541,
				height: 'auto',
				isCenter: false,
				overlay: false,
				isIframe: false,
				zIndex: 1000,
				cache: false,
				open: function(){},
				close: function(){}
			},option||{});
			// Remove old panel
			var pnl,$pnl,wp_timer,id = config.id,$target = id?$('#'+id):$('.wp-floatpanel_dialog');
			// Init parameters
			var rgx = /^\d+$/i,plw = config.width,plh = config.height,pllt = config.left,pltp = config.top,cc = 'wp-new-member-login',
			ct = config.isCenter,ol = config.overlay,z = config.zIndex,sm = config.showBottom,isfrm = config.isIframe;
			if (!$target.size()) {
				// Init overlay
				var ols = '';
				if (ol) {
					var $overlay = $('#wp-floatpanel_overlay');
					if($overlay.size() > 0) $overlay.remove();
					ols = '<div id="wp-floatpanel_overlay" style="z-index:'+z+';"></div>';
					z += 1;
				}
				
				// Loading area
				var $tmpwin = $(window),loadstr = '<div id="wp-floatpanel_loading2" style="z-index:'+(z-1)+';"><img src="'+relativeToAbsoluteURL('template/default/images/loading.gif')+'" width="16" height="16" /></div>';
				var superid = $.options ? $.options.superid : 0;
				var isClosed=false;
				var dialogstrarr=[
					'<div id="'+id+'" class="wp-new-member-login-windows" style="z-index:'+(z)+';">',
					'<div class="wp-new-member-close"><a href="#"></a></div>',
					'<div class="wp-new-member-login-windows-top"></div>',
					'<div class="wp-new-member-login-windows-c overz">',
					'<h2>'+config.title+'</h2><div class="wp-new-member-topline"></div>',
					'<div class="wp-new-member-login">',
					'<div id="wp-floatpanel_loading2" style=""><img src="'+relativeToAbsoluteURL('template/default/images/loading.gif')+'" width="16" height="16" /></div>',
					'</div></div>',
					'<div class="wp-new-member-login-windows-bottom"></div></div>',
					ols
				];
				var $ap=$(dialogstrarr.join('')).appendTo('body');
				pnl = $ap[0];$pnl = $(pnl);
				// Loading position
				var winWidth = $tmpwin.width(),pnlWidth = $pnl.width();
				// Events
				$pnl.draggable({handle: '.wp-new-member-login-windows-c>h2',cursor: 'move',start: function(e,ui){
					$('.wp-diy-selected-content').slideUp().remove();// 拖拽弹窗时注销“自定义SELECT下拉框” 2012/11/09
				},drag: function(e,ui){
					var pos = ui.position;// 防溢出 2012/10/29
					if(pos.top < 0) pos.top = 0;
					if(pos.left <0) pos.left = 0;
					if(winWidth < pnlWidth + pos.left) pos.left = winWidth - pnlWidth;
				}}).bind('wpdialogclose',function(e){
					$pnl = {};// 注销$pnl对象
					clearTimeout(wp_timer);
					var dom = $(e.target);
					if(ol) dom = dom.add('#wp-floatpanel_overlay');
					if($.isFunction(config.close)) config.close(dom[0]);
					isClosed=true;
					$(document).trigger('click');//IE8中无法移除cstselect插件的div.wp-diy-selected-content
					return dom.add('#wp-floatpanel_loading2').remove();
				});
			} else {
				$pnl = $target;
				pnl = $target[0];
			}
			var ocs1 = {};
			if(rgx.test(plw)) ocs1['width'] = plw+'px';
			if(rgx.test(plh)) ocs1['height'] = plh+'px';
			// Reset position
			if (ct || ol) {
				$pnl.show().css(ocs1);
				$pnl.find('.wp-new-member-login').css('min-height','45px');
				wp_timer = setTimeout(function(){
					$pnl.triggerHandler('wpdialogsetpos');
				},30);
				// Bind window resize
				$(window).resize(function(){
					panel_position($pnl,plw,plh,ol,'wp-floatpanel_overlay');
				});
				$pnl.bind('wpdialogsetpos',function(e){
					panel_position($pnl,plw,plh,ol,'wp-floatpanel_overlay');
				});
			} else {
				if(rgx.test(pllt)) ocs['left'] = pllt+'px';
				if(rgx.test(pltp)) ocs['top'] = pltp+'px';
				$pnl.css(ocs1).show();//.animate(ocs,'slow');
			}
			// Load content
			$.Deferred(function(dtd){
				// Modal setting
				if (isfrm == false) {
					if(config.cache && html_caches[load_url]){
						var data=html_caches[load_url];
						dtd.resolve(data);
					}else{
						$.ajax({
							type: "POST",url: load_url,beforeSend: function(){
								// 取消全局设置属性以修复IE“闪屏”问题 2012/10/30
							},success: function(data){
								if(data.length > 0){
									if(data == 'Session expired')
										window.location.href = getSessionExpiredUrl();
									dtd.resolve(data);
									if(config.cache) html_caches[load_url]=data;
								} 
								else dtd.reject();
							},error: function(xhr, textStatus, errorThrown){
								wp_alert((errorThrown||textStatus)+'('+config.title+')'+".<br/>"+translate('Request failed!')); 
								$pnl.triggerHandler('wpdialogclose');
								return false;
							}
						});
					}
				} else {
					var frmw = plw - 26/*左右padding值为2*13px*/,frame = '<iframe id="'+id+'_frame" name="'+id+'_frame" frameborder="0" src="'+load_url+'" scrolling="auto" width="'+frmw+'" onload="this.height=200;$(\'.wp-iframe_beforloaded\',\'#'+id+'\').remove();initFrame(this,\''+cc+'\',\''+plh+'\');"></iframe>';
					dtd.resolve(frame);
				}
				return dtd.promise();
			}).done(function(data){
				if(isClosed) return;
				$('#wp-floatpanel_loading2').remove();
				// Append innerHTML
				var ocs = {};
				$('.'+cc,pnl).html(data);
				if(rgx.test(plw)) ocs['width'] = plw+'px';
				if(rgx.test(plh)) ocs['height'] = plh+'px';
				// Reset position
				if (ct || ol) {
					$pnl.show().css(ocs);
					$pnl.unbind('wpdialogsetpos');
					$pnl.bind('wpdialogsetpos',function(e){
						panel_position($pnl,plw,plh,ol,'wp-floatpanel_overlay');
					});
					wp_timer = setTimeout(function(){
						$pnl.triggerHandler('wpdialogsetpos');
					},30);
					// Bind window resize
					$(window).resize(function(){
						panel_position($pnl,plw,plh,ol,'wp-floatpanel_overlay');
					});
					
				} else {
					if(rgx.test(pllt)) ocs['left'] = pllt+'px';
					if(rgx.test(pltp)) ocs['top'] = pltp+'px';
					$pnl.css(ocs).show();//.animate(ocs,'slow');
				}
				config.open(pnl);
			}).fail(function(){
				wp_alert(config.title+"(deferred fail).<br/>"+translate('Request failed!')); 
				$pnl.triggerHandler('wpdialogclose');
				return false;
			});
			// Bind close events
			$('.wp-new-member-close a',pnl).bind('click',function(e){
				$pnl.triggerHandler('wpdialogclose');
				// IE下禁止触发onbeforeunload
				e.preventDefault();
			});
			return null;
		}
		
		window.show_custom_panel=show_custom_panel;
	

	// Dialog定位
	function panel_position(dom,width,height,isoverlay,overlayid){
		if(dom instanceof jQuery == false) return;
		var $target = dom,/*$win = $(window),*/tpw = $target.outerWidth(true),tph = $target.outerHeight(true),
		floor = Math.floor,rgx = /^\d+$/i,ocs = {};
		var scrolltop=$(document).scrollTop();
		// Parse
		if(rgx.test(height)) tph = height;
		tpw = Math.max(tpw,width);
	//	var wnw = $win.width(),wnh = $win.height();
		var wnw = window.innerWidth || self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
		wnh = window.innerHeight || self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		var max_content_height=wnh-30-$target.find('.wp-new-member-login-windows-top').height()-$target.find('.wp-new-member-login-windows-c > h2').height();
		$target.find('.wp-new-member-login').css('max-height',max_content_height+'px');
		var pltp = floor((wnh - tph)/2);
		var pllt = floor((wnw - tpw)/2);
		//为了防止手机访问PC端左边距为0的问题，所以这里直接写死如果左边距为负数则直接给固定一个值
		//如果这里去配合手机端的自适应从目前的角度来说还是很难处理的，因为实在不好获取当前设备的实际可视面积
		if(pllt < 0){pllt = 20}
		// Overlay
		if(isoverlay) $('#'+overlayid).width(wnw).height(wnh);
		// Panel
		ocs['left'] = pllt+'px';
		ocs['top'] = ((pltp>0?pltp:0)+scrolltop)+'px';
		$target.css(ocs);//animate(ocs,'slow');
	//	return ocs;
	}
	
})();

(function(window){
	var init_config={
			title: 'Title',
			style:'user',
			id: 'wp_user_info',
			width: 286,
			height: 'auto',
			left: 5,
			top: 60,
			isCenter: false,
			overlay: false,
			contain:$('body'),
			zIndex: 1999999,
			showBottom: false,
			postbody:false,
			swfFix: false,
			data: {}
	}
	function openWDialog(load_url,option){
		var config = $.extend({},init_config,option||{});
		var dialog=new WDialog(load_url,config);
	}
	window.openWDialog=openWDialog;
	
	function WDialog(load_url,option){
		var self=this;
		this.url=load_url;
		this.options=option;		
		this.checkDevUrl(function(){
			self.open();
		});
		
	}
	
	WDialog.prototype.checkDevUrl=function(callback){
		if(!$.isFunction(window.isSiteDevMode) ||  !window.isSiteDevMode()){
			callback();
			return;
		}
		var marr=this.url.match(/_m=([^&]+)/)
		if(marr){
			var m=marr[1];
		}
		var aarr=this.url.match(/_a=([^&]+)/)
		if(aarr){
			var a=aarr[1];
		}
		var url=this.url;
		$.ajax({
			type: "POST",
			url: parseToURL("wp_widgets", "check_dev_url"),
			data: {mod:m,act:a},
			async:false,
			success: function (response) {
				if (response == 'Session expired')
					window.location.href = getSessionExpiredUrl();
				var json = $.parseJSON(response);
				if (json.result == "OK") {
					var loc=url;
					if(json.location) loc=json.location;
					var type='redirect';
					if(json.type) type=json.type;
					if(type !='opennew') location.href =loc;
					else window.open(loc);
				} else if (json.result == 'ERROR') {
					callback();
				}
			},
			error: function (xhr, textStatus, errorThrown) {
				callback();
				return false;
			}
		});
		
	}
	
	WDialog.prototype.open=function(){
		var scrollt=$(window).scrollTop();
		var dialogobj=this;
		var options=this.options;
		var dialogid=options.id;
		var loading_id='wloading_'+dialogid;
		var uclayoutid=options.uclayoutid||'';
        if(uclayoutid) uclayoutid =' '+uclayoutid;
		if($('#'+dialogid).length){
			var existdialog=$('#'+dialogid).data('wdialog');
			if(existdialog && existdialog.close) return;
		}
		var zindex=options.zIndex;
		var imgpath=relativeToAbsoluteURL('script/userloginpc/img/loading.gif');
		var dialogstr='<div id="'+dialogid+'" class="iframebox'+uclayoutid+'" style="z-index:'+(zindex)+';height:200px;">\n\
<div class="loading"><img src="'+imgpath+'" /></div>\n\
<iframe  name="inner" width="300" height="200" src="'+this.url+'"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="true" style="visibility:hidden;"></iframe>\n\
</div>';
		if(options.opshow){
		var dialogstr='<div id="'+dialogid+'" class="iframebox'+uclayoutid+'" style="width:auto;z-index:'+(zindex)+';height:200px;">\n\
<div class="loading"><img src="'+imgpath+'" /></div>\n\
<iframe  name="inner" width="'+options.width+'" height="200" src="'+this.url+'"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="true"></iframe>\n\
</div>';
		}
		if(options.style=='cartbuy'){
			dialogstr='<div id="'+dialogid+'" class="iframebox_a" style="z-index:'+(zindex)+';height:140px;width:270px;display:none;">\n\
<div class="loading"><img src="'+imgpath+'" /></div>\n\
<iframe  name="inner" width="270" style="background:#666;" height="140" src="'+this.url+'"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="true"></iframe>\n\
</div>';
		}
		if(options.style=='address'){
			dialogstr='<div id="'+dialogid+'" class="iframebox_a" style="z-index:'+(zindex)+';height:200px;">\n\
<div class="loading"><img src="'+imgpath+'" /></div>\n\
<iframe  name="inner" width="380" height="200" src="'+this.url+'"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="true"></iframe>\n\
</div>';
		}
        var adimg_201906=relativeToAbsoluteURL('template/default/images/close_shopcart_pc.png');
		if(options.style=='address_201906'){
            $('#'+dialogid).find('.closebtn').hide();
			dialogstr='<div id="'+dialogid+'" class="iframebox_a_201906 WDialogClass_'+options.style+'" style="z-index:'+(zindex)+';height:200px;">\n\
<div class="w_head_address_201906"><p>'+options.title+'</p><img class="address_201906_close" src="'+adimg_201906+'"></div>\n\
<div class="loading"><img src="'+imgpath+'" /></div>\n\
<iframe  name="inner" width="'+options.width+'" height="200" src="'+this.url+'"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="true"></iframe>\n\
</div>';
		}
		$(dialogstr).appendTo('body');
		var loadstr="<div class=\"floatlayerbg\" ><div class=\"closebtn\"><a href=\"javascript:;\"></a></div></div>";
		if(options.style=='cartbuy'|| options.style=='address_201906'){loadstr="<div class=\"floatlayerbg\" ></div>";}
		$(loadstr).attr('id',loading_id).css({'z-index':(zindex-1),width:$(window).width(),height:$(window).height(),top:scrollt}).appendTo('body');
		if(options.style=='cartbuy'){			 
			$('#'+loading_id).css("opacity","1").css("background","none");
			$("#"+dialogid).fadeIn(1000);
		}

		dialogobj.el=$('#'+dialogid);
		dialogobj.loading_el=$('#'+loading_id);
		dialogobj.el.data('wdialog',dialogobj);
		if(options.open) options.open.apply(this);
		if(!$('#title_scrollbar_css_link').length){
			var head = document.getElementsByTagName('head').item(0);
			var css = document.createElement('link');
			css.id="title_scrollbar_css_link";
			css.href = relativeToAbsoluteURL('script/mscrollbars/jquery.mCustomScrollbar.css');
			css.rel = 'stylesheet';
			css.type = 'text/css';
			head.appendChild(css);
		}
		$LAB.script(relativeToAbsoluteURL('script/mscrollbars/jquery.mCustomScrollbar.js'))
		 .script(relativeToAbsoluteURL('script/mscrollbars/jquery.mousewheel.js')) 
		.wait(function(){
            if(options.style!='address_201906'){
			dialogobj.el.mCustomScrollbar({axis:"y",
					theme:"minimal-dark"});
            }
			dialogobj.el.find('.loading').detach().prependTo(dialogobj.el);
		});
		
		var resizeevent;var iframetimer;var scrollevent;
		$(window).bind('resize',function(e){
			resizeevent=e;
			dialogobj.dialog_pos();
		})
		$(window).bind('scroll',function(e){
			scrollevent=e;
			$(window).scrollTop(scrollt);
		})
		dialogobj.el.bind('wclose',function(){
			if(resizeevent) $(window).unbind(resizeevent);
			if(scrollevent) $(window).unbind(scrollevent);
			if(iframetimer) clearInterval(iframetimer);
			if(options.close) options.close.apply(dialogobj);
		})
		dialogobj.loading_el.find('.closebtn').bind('click',function(e){
			e.preventDefault();
			dialogobj.close();
		})
        dialogobj.loading_el.prev().find('.address_201906_close').bind('click',function(e){
			e.preventDefault();
			dialogobj.close();
		})
		var iframeel=dialogobj.el.find('iframe');
		if(iframeel.length){
			var func=function(){
				var iframewin=iframeel[0].contentWindow;
				if(iframewin && !iframewin.dialogobj){
					iframewin.dialogobj=dialogobj;
					$(iframewin).unload(function(){
						dialogobj.el.find('.loading').show();
						var diah=dialogobj.el.height()-10;
						if(options.style=='cartbuy'){ 
							  if(isFirefox=navigator.userAgent.indexOf("Firefox")>0){  
									diah = diah + 26;
									dialogobj.el.find('iframe').css('height',diah+'px').css("margin-top","-16px");
							  }else{
									diah = diah + 10;
									dialogobj.el.find('iframe').css('height',diah+'px'); 
							  }
						}else{
							dialogobj.el.find('iframe').css('height',diah+'px');
						}
						
						var iframeel=dialogobj.el.find('iframe');
						var ifaH=iframeel.height();
						var ifaW=iframeel.width();
						var marleft=ifaW/2+"px";
						 var martop= -(ifaH/2-20)+"px";
					 
						 dialogobj.loading_el.find('.closebtn').css({"margin-left":marleft,"margin-top":martop}).show();

					})
				}
			}
			func();
			iframetimer=setInterval(func,300);
		}
		iframeel.load(function(){
			dialogobj.el.find('.loading').hide();
			dialogobj.el.find('iframe').css('visibility','');
		})
		this.dialog_pos();
	}
	
	WDialog.prototype.close=function(){
		var dialogel=this.el;
		var loadingel=this.loading_el;
		dialogel.trigger('wclose');
		dialogel.remove();
		loadingel.remove();
	}
	
	WDialog.prototype.hide=function(){
		var dialogel=this.el;
		var loadingel=this.loading_el;
		dialogel.hide();
		loadingel.hide();
	}
	
	WDialog.prototype.show=function(){
		var dialogel=this.el;
		var loadingel=this.loading_el;
		dialogel.show();
		loadingel.show();
		this.dialog_pos();
	}
	
	WDialog.prototype.set_option=function(key,value){
		var dialogel=this.el;
		var loadingel=this.loading_el;
		var options=this.options;
		var style=options.style;
		if(key=='iframeh'){
			var winh=$(window).height();
			var curiframeh=value;
			var maxdh=winh-50;
			var iframedh=curiframeh;
			var dialogh=Math.min(maxdh,iframedh);
			dialogel.css({height:dialogh});
			dialogel.find('iframe').css({height:(curiframeh)+'px'});
			this.dialog_pos();
		}
	}
	
	WDialog.prototype.dialog_pos=function(){
		var scrollt=$(window).scrollTop();
		var winh=$(window).height();
		var winw=$(window).width();
		var options=this.options;
		var style=options.style;
		var dialogel=this.el;
		var loadingel=this.loading_el;
		if(!dialogel.length || !dialogel.is(':visible')) return;
		loadingel.css({width:winw,height:winh});
		var dialogw=dialogel.width();
		var dialogh=dialogel.height();

		var leftpos=Math.max((winw-dialogw)/2,20);
		var toppos=Math.max(scrollt+(winh-dialogh)/2,scrollt+20);
		dialogel.css({left:leftpos,top:toppos});
		
		var iframeel=dialogel;
		var ifaH=iframeel.height();
		var ifaW=iframeel.width();
		var marleft=ifaW/2+"px";
		 var martop= -(ifaH/2-20)+"px";
		 loadingel.find('.closebtn').css({"margin-left":marleft,"margin-top":martop}).show();
	}
	
	
	
})(window);
