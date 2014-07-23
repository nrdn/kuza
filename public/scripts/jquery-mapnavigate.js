$(document).ready(function($) {
	$.fn.mapNavigate = function(options) {
		var defaults = {
			context: this,
			offsetX: 1,
			offsetY: 1,
		};

		var opts = $.extend({}, defaults, options);

		$(this).on({
			mousemove: function(event) {
				$(opts.context).scrollLeft(event.pageX * opts.offsetX).scrollTop(event.pageY * opts.offsetY);
			}
		});

		return this;
	}
});