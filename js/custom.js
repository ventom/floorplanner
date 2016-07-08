var data = {
	"images": [],
	"items": {}
};

var defaultTags = {
	1:'Team 1',
	2:'Team 2',
	3:'Team 3',
	4:'Team 4',
}

var dragCheck = false;
var availability = 0;
var clientID = getURLParams( 'client' );

$(document).ready(function (id) {
	var IDcounter = 0;
	$('.ui-widget-content').each(function(index) {
		IDcounter++;
		$(this).attr('id', 'obj_'+IDcounter);
	});
	
	var count_dropped_hits = 0;
	
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};
	
                

	
	/* triggered when stop resizing an object */
	function resizestop(event, ui) {
		//calculate and change values to obj (width and height)
		var $this 		= $(this);
		var objid		= $this.find('.ui-widget-content').attr('id');
		var objwidth 	= ui.size.width;
		var objheight 	= ui.size.height;
		
	
		var index 		= exist_object(objid);
	
		if(index!=-1) { //if exists (it should!) update width and height
			data.images[index].width 	= objwidth;
			data.images[index].height 	= objheight;
		}
                }
	/* objects are resizable and draggable */
	$('#objects img').resizable({
		/* only diagonal (south east)*/
		handles	: 'se',
		stop	: resizestop
		// create: function(event, ui) { $('.ui-resizable-handle').css('display', 'none') }
    }).parent('.ui-wrapper').draggable({
		appendTo: 'body',
		helper: "clone"
    });
	
    $('#background').droppable({
		accept	: '#objects div', /* accept only draggables from #objects */
		drop	: function(event, ui) {
			var $this 		= $(this);
			++count_dropped_hits;
			var draggable_elem = ui.draggable;
			draggable_elem.css('z-index',count_dropped_hits);
			/* object was dropped : register it */
			var objsrc 		= draggable_elem.find('.ui-widget-content').attr('src');
			var objwidth 	= parseFloat(draggable_elem.css('width'),10);
			var objheight 	= parseFloat(draggable_elem.css('height'),10);
			var zindex		= draggable_elem.css('z-index');

			/* for top and left we decrease the top and left of the droppable element */
			var objtop		= ui.offset.top - $this.offset().top;
			var objleft		= ui.offset.left - $this.offset().left;

						   
			var objid		= draggable_elem.find('.ui-widget-content').attr('id')+'_'+makeid();
			
			$( "<div id='objID_"+objid+"' class='clonedObject'></div>" ).html( ui.draggable.html()+'<div class="customContent"></div><div class="availability"></div>' ).appendTo( this );
			$( "#objID_"+objid ).css( 
				{
					'top' 		: objtop,
					'left' 		: objleft
				} ).appendTo( this );
			var draggable_elem = $( "#objID_"+objid );
			setDraggableOptions(objid)
			draggable_elem.resizable({
				/* only diagonal (south east)*/
				handles	: 'se',
				stop	: resizestop
				// create: function(event, ui) { $('.ui-resizable-handle').css('display', 'none') }
			})
			var index 		= exist_object(objid);
			draggable_elem.css('overflow','visible');
			if(index!=-1) { //if exists update top and left
				data.images[index].top 	= objtop;
				data.images[index].left = objleft;
				//alert($('#obj_'+index).parent().css('z-index'))zindex
				//data.images[index].zindex 	= zindex;
			}
			else{		
			
				var newObject = { 
					'id' 		: objid,
					'src' 		: objsrc,
					'width' 	: objwidth,
					'height' 	: objheight,
					'top' 		: objtop,
					'left' 		: objleft,
					'rotation'  : '0',
					'size'  : '0',
					'zindex'	: zindex
				};
				
				data.images.push(newObject);
				data.items[objid] = newObject;
				/* add object to sidebar*/
				
				addToolBar(objid, draggable_elem)
				
				
				updateStats();
			}
		}
	});

	/* User presses the download button */
	$('#submit').bind('click',function(){
		
		$.ajax({
			url: apiURL+'/update',
			dataType: "jsonp",
			data: {'objects':data.items, 'clientID':clientID, 'busyRate':availability},
			jsonpCallback: "_saveData",
			cache: false,
			timeout: 5000,
			success: function(data) {
				$("#test").append(data);
				reloadData(1);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('error ' + textStatus + " " + errorThrown);
			}
		});
	
// 		var dataString  = JSON.stringify(data);
// 		$('#jsondata').val(dataString);
// 		$('#jsonform').submit();
	});
	
	reloadData();
	updateStats();
});

function positionElement(options) {
	var resizeFactor = 1+options.resize*2/100;
	$('#background').append('\
		<div id="objID_'+options.id+'" class="clonedObject " style="top: '+options.top+'px; left: '+options.left+'px; overflow: visible;transform: rotate('+options.rotation+'deg);">\
			<img id="obj_1" width="50" height="50" src="'+options.src+'" alt="el" style="margin: 0px; resize: none; position: static; zoom: 1; display: block; height: 50px; width: 50px;">\
			<div class="customContent">'+(options.customData?options.customData:'')+'</div>\
			<div class="availability '+(options.available==0?'available':'busy')+'"></div>\
		</div>');
	setDraggableOptions(options.id)
	$('#objID_'+options.id)
		.children()
			.width(options.width*resizeFactor)
			.height(options.height*resizeFactor);
	
	
	addToolBar(options.id, $('#objID_'+options.id))
}

function setDraggableOptions(objID) {
	$('#objID_'+objID)
		.draggable({
			 stop: function(event, ui){
				 
				/* for top and left we decrease the top and left of the droppable element */
				var objtop		= ui.offset.top - $('#background').offset().top;
				var objleft		= ui.offset.left - $('#background').offset().left;
				data.items[objID].left = objleft;
				data.items[objID].top = objtop;
				
				dragCheck = false;
				
				
			},
			drag: function(){
				// On drag set that flag to true
				dragCheck = true;
			},
		})
		.draggable( "option", "containment", '#background' )
		.click(function() {
			if(!dragCheck) {
				$('#item_'+objID).modal();
				$('.modal').draggable({
					drag: function(event, ui){
						if(!$(this).hasClass('modal'))
							return false;
					}
				});
				$('#item_'+objID).on($.modal.AFTER_CLOSE, function(event, modal) {
					$('#tools').append($('#item_'+objID));
					$('#item_'+objID).removeClass('modal').attr('style', '');
				});
			}
		})
}

function addToolBar(objid, draggable_elem, newObject) {
	var tagContent = '';
	$.each(defaultTags, function( index, value ) {
		tagContent += '<option value="'+index+'">'+value+'</option>'
	})
	$('<div/>',{
					class	:	'item',
					id	:	'item_'+objid
				})/*.append(
					$('<div/>',{
					class	:	'thumb',
					html		:	'<img width="50" class="ui-widget-content" src="'+objsrc+'"></img>'
					})
				)*/.append(
					$('<div/>',{
						html		: 'User: <input type="text" name="user_"'+objid+'" id="user_'+objid+'" class="username user_'+objid+'" value="'+(data.items[objid].customData?data.items[objid].customData:'')+'">',
						class		: 'userContent'
					})
				).append(
					$('<div/>',{
						html		: 'Team: <select name="tag_"'+objid+'" id="tag_'+objid+'" class="tagname tag_'+objid+'"">'+tagContent+'</select>',
						class		: 'tagcontent'
					})
				).append(
					$('<div/>',{
						class	:	'slider rotationSlider sliderUse'+objid,
						html		:	'<span>Rotate</span><input class="degrees" value="'+(data.items[objid].rotation?data.items[objid].rotation:0)+'">'
					})
				).append(
					$('<div/>',{
						class	:	'slider sizeSlider sliderUseSize'+objid,
						html		:	'<span>Resize</span><input class="degrees" value="'+(data.items[objid].resize?data.items[objid].resize:0)+'">'
					})
				).append(
					$('<a/>',{
					class	:	'remove',
					objectID	:	objid
				})
				).append(
					$('<input/>',{
						type		:	'hidden',
						value		:	objid		// keeps track of which object is associated
					})
				).appendTo($('#tools'));
				
				//set defaultElements
				$('#item_'+objid+' #tag_'+objid).val(data.items[objid].tag)
				
				
				$('.remove',$('#tools')).click(function(){
					var $this = $(this);
					
					console.log($this.attr('objectid'))
					/* the element next to this is the input that stores the obj id */
					var objid = $this.next().val();
					/* remove the object from the sidebar */
					$this.parent().remove();

					var image_elem 		= $this.parent().find('img');
					var thumb_src 		= image_elem.attr('src');
					var divPosition = $('#imgShow'+objid).offset();
					

					/* and unregister it - delete from object data */
					var index = exist_object(objid);
					//data.images.remove(index);
					$('#objID_'+$(this).attr('objectID')).remove();
					console.log(data.items);
					delete data.items[$(this).attr('objectID')]
					updateStats();
				});
				
				
				$('.sliderUse'+objid).slider({
					orientation	: 'horizontal',
					max: 180,
					min: -180,
					value		: data.items[objid].rotation?data.items[objid].rotation:0,
					slide		: function(event, ui) {
						var $this = $(this);
						//alert(ui.value);
						/* Change the rotation and register that value in data object when it stops */
						
						draggable_elem.rotate({animateTo:ui.value});
														
						
						$('.degrees',$(this)).val(ui.value);
					},
					stop		: function(event, ui) {
						
						data.items[objid].rotation = ui.value;
					}
				});
				$('.sliderUseSize'+objid).slider({
					orientation	: 'horizontal',
					max: 100,
					min: -30,
					value		: data.items[objid].resize?data.items[objid].resize:0,
					slide		: function(event, ui) {
						var $this = $(this);
						
						var resizeFactor = 1+ui.value*2/100
						draggable_elem
							.children()
								.width(data.items[objid].width*resizeFactor)
								.height(data.items[objid].height*resizeFactor);
								
						//draggable_elem.find('.customContent').css('font-size', draggable_elem.find('.customContent').css('font-size')*resizeFactor)
						draggable_elem.find('.customContent').css('font-size', 9*resizeFactor)
														
						
						$('.degrees',$(this)).val(ui.value);
					},
					stop		: function(event, ui) {
						
						data.items[objid].resize = ui.value;
					}
				});
				
				$('.user_'+objid).keyup(function() {
					$('#objID_'+objid+' .customContent').html($(this).val());
					data.items[objid].customData = $(this).val();
					if($(this).val()=='') {
						$('#objID_'+objid+' .availability').removeClass('busy').addClass('available');
						data.items[objid].available = 1;
						updateStats();
					}
					else {
						$('#objID_'+objid+' .availability').removeClass('available').addClass('busy');
						data.items[objid].available = 0;
						updateStats();
					}
				}).keyup();
				
				$('.tag_'+objid).change(function() {
					data.items[objid].tag = $(this).val();
				}).change();
				
				$(".rotationSlider .degrees").change(function () {
					var value = this.value;
					$('.sliderUse'+objid).slider("value", value);
					draggable_elem.css({ WebkitTransform: 'rotate(' + value + 'deg)'});
					draggable_elem.css({ '-moz-transform': 'rotate(' + value + 'deg)'});
					data.items[objid].rotation = value;
				});
				
				$(".sizeSlider .degrees").change(function () {
					var value = this.value;
					$('.sliderUseSize'+objid).slider("value", value);
					
					var resizeFactor = 1+value*2/100
					draggable_elem
						.children()
							.width(data.items[objid].width*resizeFactor)
							.height(data.items[objid].height*resizeFactor);
					
					data.items[objid].resize = value;
				});
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function updateStats() {
	var total = 0;
	var busy = 0;
	var available = 0;
	
	$.each(data.items, function( index, value ) {
		if(value!=null) {
		total++;
		
		if(value.available==1)
			available++;
		else
			busy++;
		}
	});
	
	
	availability = Math.round(((total-available)/total)*100, 2);
	if(total!=0)
		$('#stats').html(available+' out of '+total+' available! Busy at '+availability+'%' );
	else
		$('#stats').html('')
}

function getURLParams( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function reloadData(reloadOnly) {
	$('#graphHolder').html('')
	$.ajax({
		url: apiURL+'/objects',
		dataType: "jsonp",
		data: {'clientID':clientID},
		jsonpCallback: "_getData",
		cache: false,
		timeout: 5000,
		success: function(dataReturned) {
			if(dataReturned) {
				var dataArray = []
				var existingEntries = {};
				var tableData = [];
				var categoryItems = ''
				$.each(defaultTags, function( tagindex, tagvalue) {
					categoryItems +='<td>'+tagvalue+'</td>'
				})
				tableData.push('<tr>\
									<td>Date</td>\
									'+categoryItems+'\
									<td>Total</td>\
								</tr>')
				$.each(dataReturned, function( index, value ) {
					
					if(value && value.dateStamp && value.busyRate) {
						if(!existingEntries[value.dateStamp]) {
							var dataObject = {
								'date':value.dateStamp,
								'Total': value.busyRate==0?1:value.busyRate
							}
							
							var totalObj = {};
							var busyObj = {};
							var availableObj = {};
							$.each(value.objects, function( indexObject, valueObject ) {
								if(valueObject!=null) {
									if(!totalObj[valueObject.tag])
										totalObj[valueObject.tag] = 1;
									else
										totalObj[valueObject.tag]++;
									
									if(valueObject.available==1) {
										if(!availableObj[valueObject.tag])
											availableObj[valueObject.tag] = 1;
										else
											availableObj[valueObject.tag]++;
									}
									else {
										if(!busyObj[valueObject.tag])
											busyObj[valueObject.tag] = 1;
										else
											busyObj[valueObject.tag]++;
									}
								}
							})
							
							
							
							var tableContent = '';
							$.each(defaultTags, function( tagindex, tagvalue) {
								var itemBusyRate = totalObj[tagindex]? Math.round(((totalObj[tagindex]-(availableObj[tagindex]?availableObj[tagindex]:0))/totalObj[tagindex])*100, 2):'';
								dataObject[tagvalue] = itemBusyRate;
								tableContent += '<td>'+itemBusyRate+'</td>'
							})
							dataArray.push(dataObject)
							existingEntries[value.dateStamp] = 1;
							
							
							tableData.push('\
								<tr>\
									<td>'+value.dateStamp+'</td>\
									'+tableContent+'\
									<td>'+value.busyRate+'</td>\
								</tr>\
							')
						}
						
					}
					
				})
				var tableContent = tableData.join('');
				$('#dataTable').html(''+tableContent);

				if(dataArray.length>0)
					drawGraph(dataArray);
				
			}
			if(!reloadOnly && dataReturned[0]) {
				$.each(dataReturned[0].objects, function( index, value ) {
					data.items[value.id] = value;
					positionElement(value);
				})
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('error ' + textStatus + " " + errorThrown);
		}
	});
}

	/*  checks if an object was already registered */
	function exist_object(id){
		for(var i = 0;i<data.images.length;++i){
			if(data.images[i].id == id)
				return i;
			}
			return -1;
	}
