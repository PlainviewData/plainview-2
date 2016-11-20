$(document).ready(function(){
	
	var clipboard = new Clipboard('.clipboardDropdown');

	$(function () {
		$('[data-toggle="tooltip"]').tooltip({
			show: { effect: "blind", duration: 800 }
		})
	})
	var jumboHeight = $('.jumbotron').outerHeight();
	function parallax(){
	    var scrolled = $(window).scrollTop();
	    $('.bg').css('height', (jumboHeight-scrolled) + 'px');
	}
	$('.bg').css("background-image", "url(/images/footer_lodyas.png)");
	parallax();

	$(window).scroll(function(e){
	    parallax();
	});

	$('#loginRegister').click(function(e){
		$("#loginRegisterModal").css("display","block");
	})

	$(function() {
		$('#login-form-link').click(function(e) {
			$("#login-form").delay(100).fadeIn(100);
	 		$("#register-form").fadeOut(100);
			$('#register-form-link').removeClass('active');
			$(this).addClass('active');
			e.preventDefault();
		});
		$('#register-form-link').click(function(e) {
			$("#register-form").delay(100).fadeIn(100);
	 		$("#login-form").fadeOut(100);
			$('#login-form-link').removeClass('active');
			$(this).addClass('active');
			e.preventDefault();
		});

	});
})
