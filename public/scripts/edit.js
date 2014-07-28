$(document).ready(function() {
	$('.form_description').popline({disable:['color']});
	$('.form_images_second').sortable({placeholder: 'column_placeholder', cancel: '.image_second_description'});
	$('.form_images_maps').sortable({placeholder: 'column_placeholder', cancel: '.image_maps_description'});

	$(document).on('dblclick', '.image_second_preview, .image_maps_preview', function() {
		$(this).remove();
	});



	$('.form_image_main').filedrop({
		url: '/upload',
		paramname: 'image',
		fallback_id: 'image_main_fallback',
		allowedfiletypes: ['image/jpeg','image/png','image/gif'],
		allowedfileextensions: ['.jpg','.jpeg','.png','.gif'],
		maxfiles: 1,
		maxfilesize: 8,
		dragOver: function() {
			$(this).css('outline', '2px solid red');
		},
		dragLeave: function() {
			$(this).css('outline', 'none');
		},
		uploadStarted: function(i, file, len) {

		},
		uploadFinished: function(i, file, response, time) {
			$('.form_image_main').css('background-image','url(' + response + ')');
			console.log(response)
		},
		progressUpdated: function(i, file, progress) {

		},
		afterAll: function() {
			$('.form_image_main').css('outline', 'none');
		}
	});



	$('.form_images_second').filedrop({
		url: '/upload',
		paramname: 'image',
		// fallback_id: 'images_second_fallback',
		allowedfiletypes: ['image/jpeg','image/png','image/gif'],
		allowedfileextensions: ['.jpg','.jpeg','.png','.gif'],
		maxfiles: 5,
		maxfilesize: 8,
		dragOver: function() {
			$(this).css('outline', '2px solid red');
		},
		dragLeave: function() {
			$(this).css('outline', 'none');
		},
		uploadStarted: function(i, file, len) {

		},
		uploadFinished: function(i, file, response, time) {
			var image = $('<div />', {'class': 'image_second_preview', 'style': 'background-image:url(' + response + ')'});
			var description = $('<div />', {'class': 'image_second_description', 'contenteditable': true, 'text':'Описание'});
			$('.form_images_second').append(image.append(description));
			console.log(response)
		},
		progressUpdated: function(i, file, progress) {

		},
		afterAll: function() {
			$('.form_images_second').css('outline', 'none');
		}
	});


	$('.form_images_maps').filedrop({
		url: '/upload',
		paramname: 'image',
		// fallback_id: 'images_second_fallback',
		allowedfiletypes: ['image/jpeg','image/png','image/gif'],
		allowedfileextensions: ['.jpg','.jpeg','.png','.gif'],
		maxfiles: 5,
		maxfilesize: 8,
		dragOver: function() {
			$(this).css('outline', '2px solid red');
		},
		dragLeave: function() {
			$(this).css('outline', 'none');
		},
		uploadStarted: function(i, file, len) {

		},
		uploadFinished: function(i, file, response, time) {
			var image = $('<div />', {'class': 'image_maps_preview', 'style': 'background-image:url(' + response + ')'});
			var description = $('<div />', {'class': 'image_maps_description', 'contenteditable': true, 'text':'Описание'});
			$('.form_images_maps').append(image.append(description));
			console.log(response)
		},
		progressUpdated: function(i, file, progress) {

		},
		afterAll: function() {
			$('.form_images_maps').css('outline', 'none');
		}
	});












	$('.submit').click(function(event) {
		var title = $('.form_title').html();
		var description = $('.form_description').html();
		var old = $('.form_old').val();
		var category = $('.form_category').val();

		var ru = {
			title: title,
			description: description
		}

		$.post('', {
			ru: ru,
			old: old,
			category: category
		}).done(function(project) {


			window.location.reload()


		});
	});
});