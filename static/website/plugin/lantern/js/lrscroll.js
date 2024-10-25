(function($){

	$.fn.kxbdMarquee = function(options){
		var opts = $.extend({},$.fn.kxbdMarquee.defaults, options);
		
		return this.each(function(){
			var $marquee = $(this); 
			var func=function(){
				var _scrollObj = $marquee.get(0); 
				var scrollW = $marquee.width(); 
				var scrollH = $marquee.height(); 

				if(!$marquee.is(':visible')){
					setTimeout(func,100);
					return;
				}
				var $element = $marquee.children();  
				var $kids = $element.children(); 
				var scrollSize=0; 
				var _type = (opts.direction == 'left' || opts.direction == 'right') ? 1:0;

				$element.css(_type?'width':'height',10000);
				if (opts.isEqual) {
					scrollSize = $kids[_type?'outerWidth':'outerHeight']() * $kids.length;
				}else{
					$kids.each(function(){
						scrollSize += $(this)[_type?'outerWidth':'outerHeight']();
					});
				}

				if (scrollSize<(_type?scrollW:scrollH)&&scrollSize>0){
					var thesize=(_type?scrollW:scrollH);
					var num=Math.ceil(thesize/scrollSize);
					scrollSize*=num;
					for(var i=0;i<num-1;i++){
						$element.append($kids.clone());
					}
					$kids = $element.children();
				}
				$element.append($kids.clone()).css(_type?'width':'height',scrollSize*2);

				var numMoved = 0;
				function scrollFunc(){
					var _dir = (opts.direction == 'left' || opts.direction == 'right') ? 'scrollLeft':'scrollTop';
					if (opts.loop > 0) {
						numMoved+=opts.scrollAmount;
						if(numMoved>scrollSize*opts.loop){
							_scrollObj[_dir] = 0;
							return clearInterval(moveId);
						} 
					}				
					if(opts.direction == 'left' || opts.direction == 'up'){
						var oldpos=_scrollObj[_dir];
						var newPos = _scrollObj[_dir] + opts.scrollAmount;
						if(newPos>=scrollSize){
							newPos -= scrollSize;
						}
						_scrollObj[_dir] = newPos;
						if(_scrollObj[_dir]==oldpos){
							_scrollObj[_dir] = newPos+1;
						}
					}else{
						var oldpos=_scrollObj[_dir];
						var newPos = _scrollObj[_dir] - opts.scrollAmount;
						if(newPos<=0){
							newPos += scrollSize;
						}
						_scrollObj[_dir] = newPos;
						if(_scrollObj[_dir]==oldpos){
							_scrollObj[_dir] = newPos+1;
						}
					}
				};

				var moveId = setInterval(scrollFunc, opts.scrollDelay);
				$marquee.hover(
					function(){
						clearInterval(moveId);
					},
					function(){
						clearInterval(moveId);
						moveId = setInterval(scrollFunc, opts.scrollDelay);
					}
				);

				if(opts.controlBtn){
					$.each(opts.controlBtn, function(i,val){
						$(val).bind(opts.eventA,function(){
							opts.direction = i;
							opts.oldAmount = opts.scrollAmount;
							opts.scrollAmount = opts.newAmount;
						}).bind(opts.eventB,function(){
							opts.scrollAmount = opts.oldAmount;
						});
					});
				}
			}	
			func();
		});
	};
	$.fn.kxbdMarquee.defaults = {
		isEqual:true,
		loop: 0,
		direction: 'left',
		scrollAmount:1,
		scrollDelay:50,
		newAmount:3,
		eventA:'mousedown',
		eventB:'mouseup'
	};
	
	$.fn.kxbdMarquee.setDefaults = function(settings) {
		$.extend( $.fn.kxbdMarquee.defaults, settings );
	};
	
})(jQuery);

