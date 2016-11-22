var responseTypeColors = {
	'subordinate': '#4286f4',
	'concur' : '#7af442',
	'dissent' : '#1d00ff',
	'requestForClarification' : '#d8d147',
	'rejectPreviousArgumentType' : '#ef0000',
	'requestForFactualSubstantiation' : '#848484'
}

var responseColors = {
	'citation': '#56f441',
	'original': '#4286f4'
}

var domIdPrefixes = {
	"title": "t",
	"text": "r",
	"node": "n"
}

var edgeStyles = {
	'subordinate': 'fill: none;stroke: #0084ff; stroke-width: 0.5px;',
	'concur' : 'fill: none;stroke: #0084ff; stroke-width: 0.5px;',
	'dissent' : 'fill: none;stroke: #0084ff; stroke-width: 0.5px;',
	'requestForClarification' : 'fill: none;stroke: #0084ff; stroke-width: 0.5px;',
	'rejectPreviousArgumentType' : 'fill: none;stroke: #0084ff; stroke-width: 0.5px;',
	'requestForFactualSubstantiation' : 'fill: none;stroke: #0084ff; stroke-width: 0.5px;'
}

var arrowheadTypes = {
	'subordinate': 'undirected',
	'concur' : 'undirected',
	'dissent' : 'undirected',
	'requestForClarification' : 'undirected',
	'rejectPreviousArgumentType' : 'undirected',
	'requestForFactualSubstantiation' : 'undirected'
}

function nodeData (response){
	this.id = response._id;
	this.title = response.title;
	this.text = response.text;
	this.createdBy = response.createdBy;
	this.replyTitle = null;
	this.replyText = null;
}

nodeData.prototype.getDomTitleId = function(){
	return domIdPrefixes['title'] + this.id;
}

nodeData.prototype.getDomTextId = function(){
	return domIdPrefixes['text'] + this.id;
}

nodeData.prototype.getNodeId = function(){
	return domIdPrefixes['node'] + this.id;
}

nodeData.prototype.getResponseId = function(){
	return this.id;
}

nodeData.prototype.setReplyText = function(text){
	this.replyText = text;
}

nodeData.prototype.setReplyTitle = function(title){
	this.replyTitle = title;
}

$(document).ready(function(){
	var g, svg, inner, zoom; //graphics variables
	var currentDiscussionId = ('.discussionId').attr('id'); //id of the current discussion
	var currentResponse; //most recently clicked response id
	var discussion, responses; //current discussion and responses in the discussion
	var fetchedResponses; //responses fetched for browsing through responses
	var nodeDataArray = {}; //array of all data inside graph nodes

	var socket = io(); //socketIO
	var clipboardIdLink = new Clipboard('.urlButton'); //initializes click-to-copy on id buttons
	clipboard.on('success', function(e) {
		notify("info", "Copied response id to clipboard!", "glyphicon glyphicon-link")
	});

	socket.emit('viewingDiscussion', currentDiscussionId); //tells server that a person has joined the discussion

	var g = new dagreD3.graphlib.Graph()
		.setGraph({}) //sets the current graph
	var svg = d3.select('svg'),
		inner = d3.select('svg g'),
		zoom = d3.behavior.zoom().on('zoom', function(){
			inner.attr('transform', 'translte(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

		}); //sets graph infos
	svg.call(zoom).on('dbclick.zoom', null); //disabling zoom on double click
	
	startBloodhound(); fetchResponses(); //async calls before drawing the graph

	d3.json('../../api/discussions/id/' + currentDiscussionId, function(data){ //gets disucssion and responses through api call
		
		socket.on('newOriginalResponse', function(data){
			addNewNode(data.newResponse, data.relatedResponse, "originalResponse");
		});
		socket.on('newCitationResponse', function(data){
			addNewNode(data.citation, data.relatedResponse, "citationResponse");
		});

		responses = data.responses, discussion = data.discussion;
		responses.forEach(function(response){
			var retrievedResponse = new nodeData(response);
			nodeDataArray.push({response._id: retrievedResponse});

			var relationshipType = discussion.relationships.filter(function(relationship){  return relationship[retrievedResponse.getResponseId] !== undefined })[0][retrievedResponse.getResponseId].relationshipType;
		
			if (discussion.citations.indexOf(retrievedResponse) === -1){
				g.setNode(retrievedResponse.getNodeId(), { style: "stroke: " + responseColors['original'] + "; stroke-width: 0.5px", 
					id: retrievedResponse.getNodeId(), 
					labelType: 'html', 
					label: compiledResponseTemplate({
						templateData : {
							displayed: "none", 
							response: currentResponse, 
							class: "citationResponse", 
							responseTypeColor: 'black'
						}
					}), 
					class: "unselected-node "
				});
			} else {
				g.setNode(retrievedResponse.getNodeId(), { style: "stroke: " + responseColors['citation'] + "; stroke-width: 0.5px", 
					id: retrievedResponse.getNodeId(), 
					labelType: 'html', 
					label: compiledResponseTemplate({
						templateData : {
							displayed: "none", 
							response: retrievedResponse, 
							class: "originalResponse", 
							responseTypeColor: 'black'
						}
					}), 
					class: "unselected-node"
				});
			}
			
			discussion.relationships.slice(1, discussion.relationships.length).forEach(function(relationship){
				if (discussion.citations.hasOwnProperty(retrievedResponse.)){
					g.setEdge(nodeDataArray[relationship[retrievedResponse.getResponseId]['relatedResponse']].getNodeId(), retrievedResponse.getNodeId(), {
						style: edgeStyles[relationship[retrievedResponse.getResponseId]['responseType']],
						arrowhead: arrowheadTypes[relationship[retrievedResponse.getResponseId]['relatedResponse']]
					});
				}
			});
		});

		$('#responses').on('click', '.cite-response', function(e){
			var idOfClickedResponse = $(e.target).closest('.thumbnail').attr('id');
			var clickedResponse = nodeDataArray[idOfClickedResponse];
			if (clickedResponse.getNodeId() !== currentResponse){
				addResponseToDiscussion(clickedResponse, currentResponse.getResponseId(), true);
				$('#responseModal').modal('hide');
			} else {
				if($('.alert', '#'+idOfClickedResponse).length !== 1) {
					$(e.target).closest('.thumbnail').append( "<div class='alert alert-warning'>Can't cite a response to itself</div>" );
				}
			}	
			switchReplyView(currentResponse);
		});

		$('#responseBrowserSearchButton').on('click',function(e) {
			e.preventDefault();
			var searchQuery = {
				title: ($('#responseTitle').val()),
				text: ($('#responseKeywords').val())
			};
			fetchResponses(searchQuery);
		});

		$('#responses').on('click', '.use-title',function(e){
			var idOfClickedResponse = $(e.target).closest('.thumbnail').attr('id');
			var clickedResponseTitle = nodeDataArray[idOfClickedResponse].title;
			$('#responseModal').modal('hide');
			$('#' currentResponse.getDomTextId()).val(clickedResponseTitle);
		})

		renderGraph();
		renderGraph();

		function renderGraph(){
			
			setTransition(500);

			for (var responseId in nodeDataArray){
				saveNodeState(nodeDataArray[responseId]);
				redrawNode(nodeDataArray[responseId]);
			}

			d3.select("svg g").call(render, g);


			function setTransition(time){
				g.graph().transition = function(selection) {
					return selection.transition().duration(time);
				};
			}

			function saveNodeState(response){ 
				if ($("#"+response.getDomTitleId).val() !== undefined && $("#"+response.getDomTitleId).val() !== ""){
					response.writtenTitle = $("#"+response.getDomTitleId).val();
				}
				if ($("#"+response.getDomTextId).val() !== undefined && $("#"+response.getDomTextId).val() !== ""){
					response.writtenReply = $("#"+response.getDomTextId).val();
				}
			}

			function redrawNode(response){
				var node = g.node(response.getNodeId());
				node.rx = node.ry = 3;
				if (node !== undefined){
					var displayed;
					if (node.label.indexOf('display:none') !== -1){
						displayed = "none";
					} else {
						displayed = "inline-block";
					}
					g.setNode(response.getNodeId(), { style: "stroke: " + responseColors['citation'] + "; stroke-width: 0.5px", 
						id: response.getNodeId(), 
						labelType: 'html', 
						label: compiledResponseTemplate({
							templateData : {
								displayed: displayed, 
								response: response, 
								class: "originalResponse", 
								responseTypeColor: 'black'
							}
						}), 
						class: "unselected-node"
					});
				}
			}

		}

	});

})