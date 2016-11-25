var responseBrowserTemplate = `
<div class="list-group">
<% _.each(responses, function(response){ %>
     <a href="#" id="<%= response._id %>" class="list-group-item list-group-item-action cite-response" style="overflow:hidden; text-overflow:ellipsis;">
	    <h5 class="list-group-item-heading"><b><%= response.title %></b></h5>
	    <p class="list-group-item-text"><%= response.text %></p>
	 </a>
<% }); %>
</div>
      `
var responseBrowser = _.template(responseBrowserTemplate);

var responseTemplate = `
	<div>
		<div class="<%= templateData.class %>" id="<%= templateData.response._id %>" data-params=<%= templateData.jsonData %>>
<!-- 			<span class ="control glyphicon glyphicon-pawn urlButton" style="color:<%= templateData.responseTypeColor %>"></span>
 -->			<span class="pull-right">
				<span data-toggle="tooltip" data-placement="top" title="copy id to clipboard" style="color: grey; cursor: pointer;" class ="urlButton control glyphicon glyphicon-link" data-clipboard-text="<%= templateData.response._id %>"></span>
			</span>
			<span style="color: #353535; font-weight: 100; font-family: 'Open Sans', sans-serif;"><a href="/users/<%= templateData.response.created_by %>"><%= templateData.response.created_by %></a></span>
			<h5 data-toggle="tooltip" data-placement="top" title="see more responses like this" class="responseTitle" style="white-space: pre-line; font-size: 13px; font-weight: 300;" ><a href="../../responses/<%= templateData.response.title %>""><%= templateData.response.title %></a></h5>
			<div style="color: #353535; white-space: pre-line;">
				<%= templateData.response.text %>
			</div>
			<button type="button" style="font-size: 8px; text-decoration: none;" class="btn btn-link btn-sm reply-button">Reply</button>
		</div>
		<div class="inputTemplate" id="i<%= templateData.response._id %>" style="display:<%= templateData.displayed %>">
			<hr style="border: none; height:1px; background-color: black ">
			<form id="responseForm-<%= templateData.response._id %>">
				<div id="newResponseTitleDiv" class="form-group row">
					Response title:
					<input class="typeahead form-control" style="width: 50%; display:inline-block;" type="text" data-toggle="popover" data-trigger="focus" value="<%= templateData.dataPersistence.writtenTitle %>" data-content="Describe a specific position that you will defend." id="t<%= templateData.response._id %>" name="title">
					<button type="button" class="btn btn-outline-secondary btn-sm"  data-toggle="modal" data-target="#responseModal">Browse</button>
				</div>
				<div class="form-group row">
					<textarea id="r<%= templateData.response._id %>" name="text" rows="10" style="width:90%; border:solid .01px gray; resize: none;"><%= templateData.dataPersistence.writtenReply %></textarea>
				</div>
				<div class="form-group row">
					<button type="button" class="btn btn-sm submit-reply-button">Submit</button>
				</div>
			</form>
		</div>
	</div>
`
var compiledResponseTemplate = _.template(responseTemplate);