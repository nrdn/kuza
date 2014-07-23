$(document).ready(function() {
	$('.project_image_main').mapNavigate({offsetX: 0.3333, offsetY: 0.3333});

	$(document).scroll(function(event) {
		var scroll = 500 - $(document).scrollTop() * 0.6666666;

		$('.project_image_main').css('height', scroll + 'px');
	});
});