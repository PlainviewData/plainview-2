$(document).ready(function () {

	startBloodhound();

	$('#newDiscussionForm').validate({ // initialize the plugin
		rules: {
			discussionTitle: {
				required: true,
				minlength: 5
			},
			responseTitle: {
				required: true,
				minlength: 5
			},
			responseText: {
				required: true,
				minlength: 30
			}
		}
	});

	$("#responseForm").on('click', '.response-type', function () { 
		var responseType = this.className;
		if (responseType.indexOf('danger') !== -1){
			$("#responsePanel").attr('class', 'panel panel-danger')
		} else if (responseType.indexOf('warning') !== -1){
			$("#responsePanel").attr('class', 'panel panel-warning')
		} else if (responseType.indexOf('info') !== -1){
			$("#responsePanel").attr('class', 'panel panel-info')
		} else if (responseType.indexOf('primary') !== -1){
			$("#responsePanel").attr('class', 'panel panel-primary')
		} else if (responseType.indexOf('success') !== -1){
			$("#responsePanel").attr('class', 'panel panel-success')
		} else if (responseType.indexOf('default') !== -1){
			$("#responsePanel").attr('class', 'panel panel-default')
		}
	});

	 $('[data-toggle="popover"]').popover(); 

});
