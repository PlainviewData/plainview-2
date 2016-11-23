var g;
var svg;
var inner;
var zoom;

var currentDiscussionId;
var currentResponse;

var fetchedResponses = [];

var responseColors = {
	'subordinate': '#4286f4',
	'concur' : '#7af442',
	'dissent' : '#1d00ff',
	'requestForClarification' : '#d8d147',
	'rejectPreviousArgumentType' : '#ef0000',
	'requestForFactualSubstantiation' : '#848484'
}

var argumentsToRespondTo = []; //an array of arguments the user is planning to respond to simultaneously

var responses;
var discussion;

$(document).ready(function() {
	
	var currentDiscussionId = $( ".discussionId" ).attr('id');

	var socket = io();
	socket.emit('viewingDiscussion', currentDiscussionId);

	var g = new dagreD3.graphlib.Graph()
		.setGraph({})
		.setDefaultEdgeLabel(function() { return {}; });

	var render = new dagreD3.render();

	var svg = d3.select("svg"),
		inner = d3.select("svg g"),
		zoom = d3.behavior.zoom().on("zoom", function() {
			inner.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		});
	zoom.scale(zoom.scale()*1.5)
	svg.call(zoom).on("dblclick.zoom", null);
	svg.call(zoom).on("dblclick.zoom", null);
	svg.call(zoom).call(zoom.event);
	
	//zoom.scaleExtent([1, 2]) max/min zooms

	fetchResponses();
	initializeGraph(currentDiscussionId, tryDraw);
	startBloodhound();
	
	var clipboard = new Clipboard('.urlButton');
	clipboard.on('success', function(e) {
		notify("info", "Copied response id to clipboard!", "glyphicon glyphicon-link")
	});

	function initializeGraph(id, cb){
		if (id !== "samplediscussion"){
			d3.json('../../api/discussions/id/' + id, function(data){
				responses = data.responses, discussion = data.discussion;
				cb(responses, discussion)
			});
		} else {
			d3.json('../discussions/samplediscussion', function(data){
				responses = data.responses, discussion = data.discussion;
				cb(responses, discussion)
			});
		}
	}
	
	function tryDraw(responses, discussion){
		var states = {};
		responses.forEach(function(response){
			states[response._id] = {
				dataPersistence : {
					writtenTitle : "",
					writtenReply : ""
				} 
			}
			console.log(discussion.relationships)
			var relationshipType = discussion.relationships.filter(function(relationship){  return relationship[response._id] !== undefined })[0][response._id].relationshipType;
			if (discussion.citations.indexOf(response._id) !== -1){
				g.setNode("n"+response._id, { style: "stroke: #4286f4; stroke-width: 0.5px", id: "n"+response._id, labelType: 'html', label: compiledResponseTemplate({templateData : {displayed: "none", dataPersistence: states[response._id].dataPersistence, response: response, class: "citationResponse", responseTypeColor: 'black'}}), class: "unselected-node "});
			} else {
				g.setNode("n"+response._id, { style: "stroke: #4286f4; stroke-width: 0.5px", id: "n"+response._id, labelType: 'html', label: compiledResponseTemplate({templateData : {displayed: "none", dataPersistence: states[response._id].dataPersistence, response: response, class: "originalResponse", responseTypeColor: 'black'}}), class: "unselected-node"});
			}
			discussion.relationships.slice(1,discussion.relationships.length).forEach(function(relationship){
				if (relationship.hasOwnProperty(response._id)){
					g.setEdge("n"+relationship[response._id]["relatedResponse"], "n"+response._id, {
						style: "fill: none;stroke: #0084ff; stroke-width: 0.5px;",
						arrowhead: 'undirected',
						//lineInterpolate: 'basis'
					});
				}
			})
		});

		socket.on('newOriginalResponse', function(data){
			addNewNode(data.newResponse, data.relatedResponse, "originalResponse");
		})
		socket.on('newCitationResponse', function(data){
			addNewNode(data.citation, data.relatedResponse, "citationResponse");
		})
				
		$('#responses').on('click', '.cite-response', function(e){
			var idOfClickedResponse = $(e.target).closest('.thumbnail').attr('id');
			var clickedResponse = $.grep(fetchedResponses, function(e){ return e._id == idOfClickedResponse; })[0];
			if ("n"+idOfClickedResponse !== currentResponse){
				addResponseToDiscussion(clickedResponse, currentResponse.substring(1), true);
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
			var clickedResponseTitle = $.grep(fetchedResponses, function(e){ return e._id == idOfClickedResponse; })[0]['title'];
			$('#responseModal').modal('hide');
			$('#t' + currentResponse.substring(1)).val(clickedResponseTitle);
		})

		renderGraph(g);
		renderGraph(g);
		
		function renderGraph(){

			g.graph().transition = function(selection) {
				return selection.transition().duration(500);
			};

			g.nodes().forEach(function saveState(nodeId){
				var id = nodeId.substring(1);
				if ($("#t"+id).val() !== undefined && $("#t"+id).val() !== ""){
					states[id].dataPersistence.writtenTitle = $("#t"+id).val();
				}
				if ($("#r"+id).val() !== undefined && $("#r"+id).val() !== ""){
					states[id].dataPersistence.writtenReply = $("#r"+id).val();
				}
			})

			for (var responseId in states){
				if (states.hasOwnProperty(responseId)){
					if (g.node("n"+responseId) !== undefined){
						var displayed;
						if (g.node("n"+responseId).label.indexOf('display:none') !== -1){
							displayed = "none";
						} else {
							displayed = "inline-block";
						}	
						var response =  $.grep(responses, function(e){ return e._id == responseId; })[0];
						g.setNode("n"+responseId, { style: "stroke: #3563ad; stroke-width: 0.5px", id: "n"+responseId, labelType: 'html', label: compiledResponseTemplate({templateData : {displayed: displayed, dataPersistence: states[responseId].dataPersistence, response: response, class: "originalResponse", responseTypeColor: 'black'}}), class: "unselected-node"});
					}
				}
			}

			g.nodes().forEach(function(v) {
			  var node = g.node(v);
			  node.rx = node.ry = 3;
			});

			d3.select("svg g").call(render, g);


			svg.selectAll(".node").on('mousedown', function(){
				if (mouseMovement){
					textSelected = true;
					mouseMovement = false;
				}
				d3.event.stopPropagation();
			})

			svg.selectAll(".node").on('mousemove', function(){
				mouseMovement = true;
			});
			
			svg.selectAll('.node').on('click',function(e){
				currentResponse = e;
			})

			svg.selectAll('.submit-reply-button').on('click',function(e){
				var form = d3.select(this.parentNode.parentNode).attr("id");
				var id = form.substring(form.indexOf("-")+1, form.length);
				
				var response = $.grep(responses, function(e){ return e._id == id; })[0];

				var newResponse = {};
				$.each($('#'+form).serializeArray(), function(i, field) {
					newResponse[field.name] = field.value;
				});
				addResponseToDiscussion(newResponse, id, false, function(){
					switchReplyView("n"+id);
					renderGraph();
				});
				$("#r"+id).val("")
				$("#t"+id).val("")
				states[id].dataPersistence = {
					writtenTitle : "",
					writtenReply : ""
				} 
			})

			svg.selectAll('.reply-button').on('click',function(e){
				var idOfClickedResponse = "n"+d3.select(this.parentNode).attr('id');
				//console.log($(e.target).closest('.unselected-node').find('.inputTemplate')).css('display', 'inline-block');
				//svg.select(".inputTemplate").classed("hiddenthing", false);
				//svg.select(".inputTemplate").classed("vizzything", true);
				//console.log(svg.select(".inputTemplate"))
				//svg.select(".inputTemplate").attr("visibility", "visible");
				//$(e.target).closest('.unselected-node').find('.inputTemplate').css( "display", "inline-block" );
				//console.log(g.node(idOfClickedResponse).class);
				//g.node(idOfClickedResponse).class = "testsex"
				switchReplyView(idOfClickedResponse);
				renderGraph();
			});
		}
		
		function addNewNode(response, relatedResponse, responseClass){
			console.log(response, relatedResponse)
			states[response._id] = "";
			responses.push(response);
			states[response._id] = {
				dataPersistence : {
					writtenTitle : "",
					writtenReply : ""
				} 
			}
			g.setNode("n"+response._id, { style: "stroke: #8a95a8; stroke-width: 0.5px", id: "n"+response._id, labelType: 'html', label: compiledResponseTemplate({templateData : {displayed: "none",  dataPersistence: states[response._id].dataPersistence, response: response, class: "originalResponse", responseTypeColor: 'black'}}), class: "unselected-node"});
			
			g.setEdge("n"+relatedResponse, "n"+response._id, {
				style: "fill: none;stroke: #0084ff; stroke-width: 0.5px;",
				arrowhead: 'undirected',
				//lineInterpolate: 'basis'
			});
			renderGraph();
			$('#r'+currentResponse).focus();

		}

		function switchReplyView(id){
			if (g.node(id).label.indexOf('display:none') !== -1){
					g.node(id).label = g.node(id).label.replace("display:none","display:inline-block");	
				} else {
					g.node(id).label = g.node(id).label.replace("display:inline-block","display:none");	
				}
			}

		function addResponseToDiscussion(newResponseData, relatedResponse, isCitation, cb){
			if (Math.floor((Date.now() - localStorage.getItem("last_post"))/1000) <= 30 && localStorage.getItem("last_post") !== null) {
				notify("warning", "Please wait 30 seconds after your last post", "glyphicon glyphicon-alert");
				return;
			}
			if (isCitation){
				$.ajax({
					type: "POST",
					url: "../addCitationToDiscussion",
					data: {
						discussionId: currentDiscussionId,
						citation: JSON.stringify(newResponseData),
						relatedResponse: relatedResponse,
						relationshipType: 'dissent' //replace
					},
					success: function(){
						notify("success", "Replied to conversation", "glyphicon glyphicon-ok-circle");
						localStorage.setItem("last_post", Date.now());
						if (cb){
							cb();
						}
					},
					error: function(err){
						if (err.status === 400){
							notify("warning", "You must be signed in to reply to this conversation", "glyphicon glyphicon-alert");							
						} else if (err.status === 429) {
							notify("warning", "Please wait 30 seconds after your last post", "glyphicon glyphicon-alert");
						} else {
							notify("warning", "Reply didn't go through. Please try again later", "glyphicon glyphicon-alert");
						}
					}
				})
			} else {
				$.ajax({
					type: "POST",
					url: "../../responses",
					data: {
						discussionId: currentDiscussionId,
						responseTitle: newResponseData['title'],
						responseText: newResponseData['text'],
						created_by: "Striped Rhino",
						relatedResponse: relatedResponse,
						relationshipType: 'dissent' //replace
					},
					success: function(newResponse){
						notify("success", "Replied to conversation", "glyphicon glyphicon-ok-circle");
						localStorage.setItem("last_post", Date.now());
						if (cb){
							cb();
						}
					},
					error: function(err){
						if (err.status === 400){
							notify("warning", "You must be signed in to reply to this conversation", "glyphicon glyphicon-alert");							
						} else if (err.status === 429) {
							notify("warning", "Please wait 30 seconds after your last post", "glyphicon glyphicon-alert");
						} else {
							notify("warning", "Reply didn't go through. Please try again later", "glyphicon glyphicon-alert");
						}
					}
				})		
			}
		}	
	}
	
	
});

function notify(type, message, gylph){
	$.notify({
		message: message,
		icon: gylph,
	},{
		allow_dismiss: false,
		position: "absolute",
		element: '#interface',
		type: type,
			placement: {
			from: "bottom",
			align: "left"
		},
		animate: {
			enter: 'animated fadeInUp',
			exit: 'animated fadeOutDown'
		},
		delay: 2000,
		timer: 1000,
	});
}

function fetchResponses(searchQuery){
	$.ajax({
		type: "GET",
		url: "../../api/responses",
		data: searchQuery,
		success: function(data){
			fetchedResponses = data;
			loadResponseBrowser();
		}
	})
}


function loadResponseBrowser(){
	$("#responses").html(responseBrowser({responses: fetchedResponses}));
}

var mouseMovement;
