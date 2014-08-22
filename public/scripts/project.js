$(document).ready(function() {
	$('.project_image_main').mapNavigate({offsetX: 0.3333, offsetY: 0.3333});

	$(document).scroll(function(event) {
		var scroll = $(document).scrollTop();
		var offset = 500 - scroll * 0.9;

		if (scroll > 600) return false;

		$('.project_image_main').css('height', offset + 'px');
		// $('.project_content_block').css('margin-top', offset + 'px');
	});
});