$(document).ready(function() {
	$.fn.mapNavigate = function(options) {
	    var defaults = {
	        context: this,
	        offsetX: 2,
	        offsetY: 2,
	        speed: 200
	    };

	    var opts = $.extend({}, defaults, options);

	    $(this).on({
	        mousedown: function(event) {
	            $(this).mousemove(function(event) {
	                $(opts.context).scrollLeft(event.pageX * opts.offsetX).scrollTop(event.pageY * opts.offsetY);
	            });
	        },
	        mouseup: function(event) {
	            $(this).off('mousemove');
	        },
	        click: function(event) {
	            $(opts.context).animate({
	                'scrollTop': event.pageY * opts.offsetY,
	                'scrollLeft': event.pageX * opts.offsetX
	            }, opts.speed);
	        }
	    });

	    return this;
	}
});