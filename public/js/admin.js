// a nice function that takes a jquery selector or any element
// ... and returns all [name]'d data within that element.
function getFormData(selector){
	var d = {};
	$(selector+' [name]').each(function(){
		$this = $(this);
		var shouldwrite = true;
		// exclude unchecked checkboxes:
		if($this.attr('type') == 'checkbox' && !$this.is(':checked')) shouldwrite = false;
		if($this.attr('type') == 'file') shouldwrite = false;
		
		if(shouldwrite){
			var name = $this.attr('name');
			
			// get the value:
			var val = $this.val();
			
			// get the value if it's a tinymce rich text editor:
			if(typeof(tinymce)!='undefined'){
				if($this.is('textarea')){
					// try to find a tinymce rte connected to this textarea:
					var ed = tinymce.get($this.attr('id'));
					if(ed != null){
						val = ed.getContent();
					}
				}
			}
			
			// if this name ends in [] that means it should be an array being sent:
			if(name.indexOf('[]', name.length - 2) !== -1){
				name = name.substr(0, name.length - 2); // strip the [] off the end
				// if this is the first one, define that var as an array before appending it to the array
				if(typeof(d[name])=='undefined'){
					d[name] = [];
				}
				d[name].push(val);
			}else{ // it's not an array name
				d[name] = val;
			}
		}
	});
	return d;
}

var feedpage = {};
feedpage.sortable_group = null;
feedpage.init = function(url, singular_noun){
	if(url.substr(-1) != '/') url += '/';
	feedpage.url = url;
	feedpage.singular_noun = singular_noun;
	feedpage.load();

	// changing any filter makes the feed load again:
	let $filters = $('form.feedpage-filters');
	if($filters.length > 0){
		$filters.find('select').on('change', feedpage.load);
		$filters.find('input').on('input', feedpage.load);

		// export button needs to append filters
		$('.export.button').each(function(){
			$(this).on('click', function(e){
				e.preventDefault();

				// append filters to the URL
				let export_url = $(this).attr('href');
				if(export_url.substr(-1) != '/') export_url += '/';
				export_url += '&'+$filters.serialize();
				location.href = export_url;
			});
		});
	}
};
feedpage.load = function(){
	let url = feedpage.url + 'feed';

	// if form#filters exists, pass that data, too
	let data = {};
	let $filters = $('form.feedpage-filters');
	if($filters.length > 0) data = $filters.serialize();

	$.post(url, data, function(response){
		$('#results').html(response);
		feedpage.init_sortable();
	});
};
feedpage.deactivate = function(id){
	var url = feedpage.url + 'deactivate';
	$.post(url, {id:id}, function(response){
		feedpage.response(response, 'deactivated');
	});
};
feedpage.activate = function(id){
	var url = feedpage.url + 'activate';
	$.post(url, {id:id}, function(response){
		feedpage.response(response, 'activated');
	});
};
feedpage.delete = function(id){
	if(confirm('Are you sure you want to permanently delete this '+feedpage.singular_noun+'?')){
		var url = feedpage.url + 'delete';
		$.post(url, {id:id}, function(response){
			feedpage.response(response, 'deleted');
		});
	}
};
feedpage.response = function(response, action){
	if(response == 'ok'){
		flash.success(feedpage.singular_noun + ' ' + action);
	}else{
		flash.error(response);
	}
	feedpage.load();
};
feedpage.init_sortable = function(){
	feedpage.sortable_group = $('.feed').sortable({
		handle: '.sort.icon',
		onDrop: function($item, container, _super){
			var data = feedpage.sortable_group.sortable('serialize').get()[0];
			var ids = [];
			for(var i = 0; i < data.length; i++) ids.push(data[i].id);
			$.post(feedpage.url+'sort', {ids:ids}, function(response){
				// nothing?
			});
			_super($item, container);
		}
	});
};


var markdown = {};
markdown.help = function(){
	var html = '';
	html += '<header><h2>Markdown Help</h2></header>';
	html += '<section class="content">';
	html += '<p>Markdown is a format of text that allows both easy editing and clean data.</p>';
	html += '<p>This is how you can control the format of your text</p>';
	html += '<pre>';
	html += '*italics*\n';
	html += '**bold**\n';
	html += '***bold and italics***\n';
	html += '</pre>';
	html += '<p>You can make headers (in HTML terms, h1-h6 tags). Please note that you almost certainly do not want to make a header 1 because there should only be one h1 tag on a final page, and there is probably an h1 already on the page.</p>';
	html += '<pre>';
	html += '# This is a header 1\n';
	html += '## This is a header 2\n';
	html += '### This is a header 3\n';
	html += '#### This is a header 4\n';
	html += '##### This is a header 5\n';
	html += '###### This is a header 6';
	html += '</pre>';
	html += '<p>This is how you can make a bulleted list.</p>';
	html += '<pre>';
	html += '- Unordered\n';
	html += '- List\n';
	html += '- Of\n';
	html += '- Items\n';
	html += '</pre>';
	html += '<p>This is how you can make a numbered list. You can number each line if you want, but using all 1s allows easy editing.</p>';
	html += '<pre>';
	html += '1. Ordered\n';
	html += '1. List\n';
	html += '1. Of\n';
	html += '1. Items\n';
	html += '</pre>';
	html += '<p>This is how to make a link.</p>';
	html += '<pre>';
	html += '[Link Text](https://www.runwayanalytics.com)\n';
	html += '</pre>';
	html += '<p>This is how you can display images you upload on the <a href="/admin/images" target="_blank">Images Page</a>. The number here is the corresponding "id" for your image.</p>';
	html += '<pre>';
	html += '[img.1234]';
	html += '</pre>';
	html += '</section>';

	html += '<footer>';
	html += '<a class="button" onclick="modal.close();">Got It</a> ';
	html += 'Feel free to contact Web Elements, LLC. with any questions.';
	html += '</footer>';
	modal.html(html);
};


var imagefield = {};

// actually performs the file upload
imagefield.upload = function($filefield){
	if($filefield.attr('type')!='file') throw 'uploadFile() parameter 2 needs to be the selector to an input[type=file]';
	$imagefield = $filefield.closest('.imagefield');
	
	// pack up the files in a nice FormData object:
	var file = $filefield[0].files[0];
	var data = new FormData();
	data.append('image', file);

	// also include the alt text
	var $alt_field = $imagefield.find('input[type=text][name$="[alt]"]');
	if($alt_field.length) data.append('alt', $alt_field.val());
	
	// perform the ajax request:
	$.ajax({
		url:'/admin/images/upload',
		type:'POST',
		data:data,
		cache:false,
		dataType:'html',
		processData:false,
		contentType:false,
		success:function(response){
			response = JSON.parse(response);
			$imagefield.find('input[type=hidden]').val(response.id).change();
			$imagefield.find('img').attr('src', response.url);
		},
		error:function(response){
			flash.error(response.responseText);
		},
		complete:function(){
			modal.close();
		},
	});
};

imagefield.init = function(){
	// automatically upload the image when one is selected
	$('.imagefield input[type=file]').on('change', function(){
		$filefield = $(this);
		$imagefield = $filefield.closest('.imagefield');
		$imagefield.addClass('loading');
		imagefield.upload($filefield, {}, function(){
			// nothing special on success
		}, function(response){
			// error. flash an error and clear the file
			flash.error(response.responseText);
		}, function(){
			// complete. either way, remove the loading class
			$imagefield.removeClass('loading');
		});
	});
	// when you click an image, bring up the upload dialog
	$('.imagefield img').on('click', function(){
		var $img = $(this);
		var $imagefield = $img.closest('.imagefield');
		var $hiddeninput = $imagefield.find('input[type=hidden]');
		var name = $hiddeninput.attr('name');
		if($img.attr('src') == ''){
			imagefield.openuploaddialog(name);
		}else{
			// show a modal with the full image and some options
			var html = '';
			html += '<header>Image Preview</header>';
			html += '<div class="content">';
			html += '<img src="'+$img.attr('src')+'"/>';
			html += '</div>';
			html += '<footer>'
			html += '<a class="button" onclick="modal.close();">Cancel</a>';
			html += '<a class="button" onclick="imagefield.delete(\''+name+'\');">Delete</a>';
			html += '<a class="button" onclick="imagefield.openuploaddialog(\''+name+'\');">Replace</a>';
			html += '</footer>';
			modal.html(html);
		}
	});
};
imagefield.delete = function(name){
	$hiddeninput = $('input[type=hidden][name="'+name+'"]');
	$imagefield = $hiddeninput.closest('.imagefield');
	$imagefield.find('img').attr('src', '');
	$hiddeninput.val(0).change();
	modal.close();
};
imagefield.openuploaddialog = function(name){
	$('input[type=hidden][name="'+name+'"]').closest('.imagefield').find('input[type=file]').click();
};


// make the tabs system automatically load image fields
if(typeof(tabs) != 'undefined'){
	tabs.onload.push(imagefield.init);
}



// plural "images" field. for multiple images easily.
var imagesfield = {};
imagesfield.$current_field = null;
imagesfield.open_modal = function(ele, image_id){
	imagesfield.$current_field = $(ele).closest('.imagesfield');
	if(typeof(image_id)=='undefined') image_id = 0;
	modal.get('/admin/images/imagesfield_modal/'+image_id, function(){
		$('.modal form').on('submit', function(e){
			e.preventDefault();
			imagesfield.save_modal(image_id);
		});
	});
};

imagesfield.save_modal = function(image_id){
	if(typeof(image_id)=='undefined') image_id = 0;
	var $hidden = imagesfield.$current_field.find('input[type=hidden]');
	var form = document.querySelector('.modal form');
	var data = new FormData(form);
	$.ajax({
		url:'/admin/images/imagesfield_modal/'+image_id,
		type:'POST',
		data:data,
		cache:false,
		dataType:'html',
		processData:false,
		contentType:false,
		success:function(image_id){
			// update the input[type=hidden] with the potentially new image_id
			var ids = $hidden.val().split(',').filter(function(val){return val!='';});
			if(!ids.includes(image_id)) ids.push(image_id);
			$hidden.val(ids.join(','));
			imagesfield.refresh_thumbnails(imagesfield.$current_field);
		},
		error:function(response){
			flash.error(response.responseText);
		},
		complete:function(){
			modal.close();
		},
	});
};
imagesfield.refresh_thumbnails = function($imagesfield){
	var $thumbnails = $imagesfield.find('.thumbnails');
	var data = {};
	data.image_ids = $imagesfield.find('input[type=hidden]').val();
	$.post('/admin/images/imagesfield_thumbnails', data, function(response){
		$thumbnails.html(response);
	});
};
imagesfield.delete = function(image_id){
	var $hidden = imagesfield.$current_field.find('input[type=hidden]');

	// remove the image_id from the list of selected images
	var ids = $hidden.val().split(',').filter(function(val){return val!='';});
	var idx = ids.indexOf(image_id);
	if(idx >= 0) ids.splice(idx, 1);
	$hidden.val(ids.join(','));
	imagesfield.refresh_thumbnails(imagesfield.$current_field);
	modal.close();
};

var tabs = {};
tabs.ajax = null;
// an array of functions that will be called after every tab load
tabs.onload = [];


tabs.url = function($tab){
	return $tab.attr('href') + '/' + $tabs.attr('data-id');
}
tabs.load = function($tab){
	$tabs = $tab.closest('.tabs');
	
	// update the .active class
	$tabs.find('nav>a').removeClass('active');
	$tab.addClass('active');
	
	// get the new tab content
	if(tabs.ajax) tabs.ajax.abort();
	tabs.ajax = $.get(tabs.url($tab), function(response){
		$tabs.find('.content').html(response);
		for(var i in tabs.onload) tabs.onload[i]();
	});
};
tabs.save = function(onValidSave){
	$tab = $('.tabs a.active');
	var url = tabs.url($tab);
	var data = getFormData('.tabs .content');
	if(tabs.ajax) tabs.ajax.abort();
	tabs.ajax = $.post(url, data, function(response){
		if(response == ''){
			flash.success('Saved!');
		}else{
			flash.error(response);
		}
	});
};

// reloads all tabs on the page
tabs.reload = function(){
	$('div.tabs a.active').each(function(){
		tabs.load($(this));
	});
};
tabs.init = function(){
	// click on a tab to load a tab
	$('.tabs a').click(function(){
		tabs.load($(this));
		return false;
	});
	
	// load the active tab, or the first one
	$tab = $('.tabs a.active');
	if(!$tab.length) $tab = $('.tabs a');
	$tab.first().each(function(){
		tabs.load($(this));
	});
};


var modal = {};
modal.onopen = [];
modal.onclose = [];

modal.html = function(html, callback){
	modal.close();
	$('body').append('<div class="modal-overlay"></div>');
	$('body').append('<div class="modal">'+html+'</div>');
	$('.modal input[type=text]').first().focus();
	for(var i in modal.onopen) modal.onopen[i]();
	if(typeof(callback) == 'function') callback();
};
modal.get = function(url, callback){
	$.get(url, function(html){
		modal.html(html);
		if(typeof(callback)=='function') callback(html);
	});
};
modal.close = function(callback){
	if($('.modal').length){
		$('.modal').remove();
		$('.modal-overlay').remove();
		for(var i in modal.onclose) modal.onclose[i]();
		if(typeof(callback) == 'function') callback();
	}
};
modal.init = function(){
	// close the modal if you click a modal overlay
	$('body').on('click', '.modal-overlay', modal.close);

	// close the modal if you press escape (keyCode 27)
	$('body').on('keydown', function(e){
		if(e.keyCode==27) modal.close();
	});
};


var flash = {};

flash.show = function(type, msg){
	var html = '<p class="'+type+'">'+msg+'</p>';
	$container = $('.flash');
	// create a .flash container if one doesn't exist
	if($container.length==0){
		$('body').append('<div class="flash"></div>');
		$container = $('<div class="flash"></div>').appendTo('body');
	}
	$(html).appendTo($container).delay(7000).fadeOut('fast');
};
flash.message = function(msg){
	flash.show('message', msg);
};
flash.error = function(msg){
	flash.show('error', msg);
};
flash.success = function(msg){
	flash.show('success', msg);
}
flash.init = function(){
	$('body').on('click', '.flash p', function(){
		$(this).remove();
	});
};


// put data-slugify="OTHER_INPUT_ID" to automatically slugify a different field
var slug = {};
slug.init = function(){
	$('input[data-slugify]').each(function(){
		var $slugfield = $(this);
		var otherfield_id = $slugfield.attr('data-slugify');
		var $otherfield = $('#'+otherfield_id);

		if($slugfield.val() == ''){
			$slugfield.addClass('generate');
			$slugfield.on('input', function(){
				$slugfield.removeClass('generate');
			});
			$otherfield.on('input', function(){
				if($slugfield.hasClass('generate')){
					var val = $otherfield.val();
					if(val == ''){
						$slugfield.val('');
					}else{
						var slugpath = $slugfield.attr('data-slugpath');
						if(typeof(slugpath)=='undefined'){
							slugpath = slug.generate_path();
						}
						$.post(slugpath, {val:val}, function(response){
							$slugfield.val(response);
						});
					}
				}
			});
		}
	});
};
slug.generate_path = function(){
	// attempt to generate the slugpath based on current url
	var path_parts = location.href.split('/');

	// find "admin" and the one that comes after it
	for(var i = 0; i < path_parts.length; i++){
		if(path_parts[i] == 'admin'){
			return '/admin/'+path_parts[i+1]+'/generateslug';
		}
	}

	throw 'Unable to generate slug path, and no [data-slugpath] defined on slug field.';
};

$(function(){
	imagefield.init();
	flash.init();
	tabs.init();
	modal.init();
	slug.init();
});



// jquery sortable
!function(d,B,m,f){function v(a,b){var c=Math.max(0,a[0]-b[0],b[0]-a[1]),e=Math.max(0,a[2]-b[1],b[1]-a[3]);return c+e}function w(a,b,c,e){var k=a.length;e=e?"offset":"position";for(c=c||0;k--;){var g=a[k].el?a[k].el:d(a[k]),l=g[e]();l.left+=parseInt(g.css("margin-left"),10);l.top+=parseInt(g.css("margin-top"),10);b[k]=[l.left-c,l.left+g.outerWidth()+c,l.top-c,l.top+g.outerHeight()+c]}}function p(a,b){var c=b.offset();return{left:a.left-c.left,top:a.top-c.top}}function x(a,b,c){b=[b.left,b.top];c=
c&&[c.left,c.top];for(var e,k=a.length,d=[];k--;)e=a[k],d[k]=[k,v(e,b),c&&v(e,c)];return d=d.sort(function(a,b){return b[1]-a[1]||b[2]-a[2]||b[0]-a[0]})}function q(a){this.options=d.extend({},n,a);this.containers=[];this.options.rootGroup||(this.scrollProxy=d.proxy(this.scroll,this),this.dragProxy=d.proxy(this.drag,this),this.dropProxy=d.proxy(this.drop,this),this.placeholder=d(this.options.placeholder),a.isValidTarget||(this.options.isValidTarget=f))}function s(a,b){this.el=a;this.options=d.extend({},
z,b);this.group=q.get(this.options);this.rootGroup=this.options.rootGroup||this.group;this.handle=this.rootGroup.options.handle||this.rootGroup.options.itemSelector;var c=this.rootGroup.options.itemPath;this.target=c?this.el.find(c):this.el;this.target.on(t.start,this.handle,d.proxy(this.dragInit,this));this.options.drop&&this.group.containers.push(this)}var z={drag:!0,drop:!0,exclude:"",nested:!0,vertical:!0},n={afterMove:function(a,b,c){},containerPath:"",containerSelector:"ol, ul",distance:0,delay:0,
handle:"",itemPath:"",itemSelector:"li",bodyClass:"dragging",draggedClass:"dragged",isValidTarget:function(a,b){return!0},onCancel:function(a,b,c,e){},onDrag:function(a,b,c,e){a.css(b)},onDragStart:function(a,b,c,e){a.css({height:a.outerHeight(),width:a.outerWidth()});a.addClass(b.group.options.draggedClass);d("body").addClass(b.group.options.bodyClass)},onDrop:function(a,b,c,e){a.removeClass(b.group.options.draggedClass).removeAttr("style");d("body").removeClass(b.group.options.bodyClass)},onMousedown:function(a,
b,c){if(!c.target.nodeName.match(/^(input|select|textarea)$/i))return c.preventDefault(),!0},placeholderClass:"placeholder",placeholder:'<li class="placeholder"></li>',pullPlaceholder:!0,serialize:function(a,b,c){a=d.extend({},a.data());if(c)return[b];b[0]&&(a.children=b);delete a.subContainers;delete a.sortable;return a},tolerance:0},r={},y=0,A={left:0,top:0,bottom:0,right:0},t={start:"touchstart.sortable mousedown.sortable",drop:"touchend.sortable touchcancel.sortable mouseup.sortable",drag:"touchmove.sortable mousemove.sortable",
scroll:"scroll.sortable"};q.get=function(a){r[a.group]||(a.group===f&&(a.group=y++),r[a.group]=new q(a));return r[a.group]};q.prototype={dragInit:function(a,b){this.$document=d(b.el[0].ownerDocument);var c=d(a.target).closest(this.options.itemSelector);c.length&&(this.item=c,this.itemContainer=b,!this.item.is(this.options.exclude)&&this.options.onMousedown(this.item,n.onMousedown,a)&&(this.setPointer(a),this.toggleListeners("on"),this.setupDelayTimer(),this.dragInitDone=!0))},drag:function(a){if(!this.dragging){if(!this.distanceMet(a)||
!this.delayMet)return;this.options.onDragStart(this.item,this.itemContainer,n.onDragStart,a);this.item.before(this.placeholder);this.dragging=!0}this.setPointer(a);this.options.onDrag(this.item,p(this.pointer,this.item.offsetParent()),n.onDrag,a);a=this.getPointer(a);var b=this.sameResultBox,c=this.options.tolerance;(!b||b.top-c>a.top||b.bottom+c<a.top||b.left-c>a.left||b.right+c<a.left)&&!this.searchValidTarget()&&(this.placeholder.detach(),this.lastAppendedItem=f)},drop:function(a){this.toggleListeners("off");
this.dragInitDone=!1;if(this.dragging){if(this.placeholder.closest("html")[0])this.placeholder.before(this.item).detach();else this.options.onCancel(this.item,this.itemContainer,n.onCancel,a);this.options.onDrop(this.item,this.getContainer(this.item),n.onDrop,a);this.clearDimensions();this.clearOffsetParent();this.lastAppendedItem=this.sameResultBox=f;this.dragging=!1}},searchValidTarget:function(a,b){a||(a=this.relativePointer||this.pointer,b=this.lastRelativePointer||this.lastPointer);for(var c=
x(this.getContainerDimensions(),a,b),e=c.length;e--;){var d=c[e][0];if(!c[e][1]||this.options.pullPlaceholder)if(d=this.containers[d],!d.disabled){if(!this.$getOffsetParent()){var g=d.getItemOffsetParent();a=p(a,g);b=p(b,g)}if(d.searchValidTarget(a,b))return!0}}this.sameResultBox&&(this.sameResultBox=f)},movePlaceholder:function(a,b,c,e){var d=this.lastAppendedItem;if(e||!d||d[0]!==b[0])b[c](this.placeholder),this.lastAppendedItem=b,this.sameResultBox=e,this.options.afterMove(this.placeholder,a,b)},
getContainerDimensions:function(){this.containerDimensions||w(this.containers,this.containerDimensions=[],this.options.tolerance,!this.$getOffsetParent());return this.containerDimensions},getContainer:function(a){return a.closest(this.options.containerSelector).data(m)},$getOffsetParent:function(){if(this.offsetParent===f){var a=this.containers.length-1,b=this.containers[a].getItemOffsetParent();if(!this.options.rootGroup)for(;a--;)if(b[0]!=this.containers[a].getItemOffsetParent()[0]){b=!1;break}this.offsetParent=
b}return this.offsetParent},setPointer:function(a){a=this.getPointer(a);if(this.$getOffsetParent()){var b=p(a,this.$getOffsetParent());this.lastRelativePointer=this.relativePointer;this.relativePointer=b}this.lastPointer=this.pointer;this.pointer=a},distanceMet:function(a){a=this.getPointer(a);return Math.max(Math.abs(this.pointer.left-a.left),Math.abs(this.pointer.top-a.top))>=this.options.distance},getPointer:function(a){var b=a.originalEvent||a.originalEvent.touches&&a.originalEvent.touches[0];
return{left:a.pageX||b.pageX,top:a.pageY||b.pageY}},setupDelayTimer:function(){var a=this;this.delayMet=!this.options.delay;this.delayMet||(clearTimeout(this._mouseDelayTimer),this._mouseDelayTimer=setTimeout(function(){a.delayMet=!0},this.options.delay))},scroll:function(a){this.clearDimensions();this.clearOffsetParent()},toggleListeners:function(a){var b=this;d.each(["drag","drop","scroll"],function(c,e){b.$document[a](t[e],b[e+"Proxy"])})},clearOffsetParent:function(){this.offsetParent=f},clearDimensions:function(){this.traverse(function(a){a._clearDimensions()})},
traverse:function(a){a(this);for(var b=this.containers.length;b--;)this.containers[b].traverse(a)},_clearDimensions:function(){this.containerDimensions=f},_destroy:function(){r[this.options.group]=f}};s.prototype={dragInit:function(a){var b=this.rootGroup;!this.disabled&&!b.dragInitDone&&this.options.drag&&this.isValidDrag(a)&&b.dragInit(a,this)},isValidDrag:function(a){return 1==a.which||"touchstart"==a.type&&1==a.originalEvent.touches.length},searchValidTarget:function(a,b){var c=x(this.getItemDimensions(),
a,b),e=c.length,d=this.rootGroup,g=!d.options.isValidTarget||d.options.isValidTarget(d.item,this);if(!e&&g)return d.movePlaceholder(this,this.target,"append"),!0;for(;e--;)if(d=c[e][0],!c[e][1]&&this.hasChildGroup(d)){if(this.getContainerGroup(d).searchValidTarget(a,b))return!0}else if(g)return this.movePlaceholder(d,a),!0},movePlaceholder:function(a,b){var c=d(this.items[a]),e=this.itemDimensions[a],k="after",g=c.outerWidth(),f=c.outerHeight(),h=c.offset(),h={left:h.left,right:h.left+g,top:h.top,
bottom:h.top+f};this.options.vertical?b.top<=(e[2]+e[3])/2?(k="before",h.bottom-=f/2):h.top+=f/2:b.left<=(e[0]+e[1])/2?(k="before",h.right-=g/2):h.left+=g/2;this.hasChildGroup(a)&&(h=A);this.rootGroup.movePlaceholder(this,c,k,h)},getItemDimensions:function(){this.itemDimensions||(this.items=this.$getChildren(this.el,"item").filter(":not(."+this.group.options.placeholderClass+", ."+this.group.options.draggedClass+")").get(),w(this.items,this.itemDimensions=[],this.options.tolerance));return this.itemDimensions},
getItemOffsetParent:function(){var a=this.el;return"relative"===a.css("position")||"absolute"===a.css("position")||"fixed"===a.css("position")?a:a.offsetParent()},hasChildGroup:function(a){return this.options.nested&&this.getContainerGroup(a)},getContainerGroup:function(a){var b=d.data(this.items[a],"subContainers");if(b===f){var c=this.$getChildren(this.items[a],"container"),b=!1;c[0]&&(b=d.extend({},this.options,{rootGroup:this.rootGroup,group:y++}),b=c[m](b).data(m).group);d.data(this.items[a],
"subContainers",b)}return b},$getChildren:function(a,b){var c=this.rootGroup.options,e=c[b+"Path"],c=c[b+"Selector"];a=d(a);e&&(a=a.find(e));return a.children(c)},_serialize:function(a,b){var c=this,e=this.$getChildren(a,b?"item":"container").not(this.options.exclude).map(function(){return c._serialize(d(this),!b)}).get();return this.rootGroup.options.serialize(a,e,b)},traverse:function(a){d.each(this.items||[],function(b){(b=d.data(this,"subContainers"))&&b.traverse(a)});a(this)},_clearDimensions:function(){this.itemDimensions=
f},_destroy:function(){var a=this;this.target.off(t.start,this.handle);this.el.removeData(m);this.options.drop&&(this.group.containers=d.grep(this.group.containers,function(b){return b!=a}));d.each(this.items||[],function(){d.removeData(this,"subContainers")})}};var u={enable:function(){this.traverse(function(a){a.disabled=!1})},disable:function(){this.traverse(function(a){a.disabled=!0})},serialize:function(){return this._serialize(this.el,!0)},refresh:function(){this.traverse(function(a){a._clearDimensions()})},
destroy:function(){this.traverse(function(a){a._destroy()})}};d.extend(s.prototype,u);d.fn[m]=function(a){var b=Array.prototype.slice.call(arguments,1);return this.map(function(){var c=d(this),e=c.data(m);if(e&&u[a])return u[a].apply(e,b)||this;e||a!==f&&"object"!==typeof a||c.data(m,new s(c,a));return this})}}(jQuery,window,"sortable");


var bridge_field = {};
bridge_field.init = function(){
	$('.bridge_field').each(function(){
		let bf = $(this);
		bf.on('input', function(){
			bridge_field.search(bf);
		});
	});
};
bridge_field.search = function($bf){
	let $sf = $bf.find('input[type=search]');
	let $searchResults = $bf.find('.search-results');
	let search_val = $sf.val();

	// if there is nothing in the search field,
	// hide the results and don't do anything else.
	if(search_val == ''){
		$searchResults.hide();
		return;
	}

	let ajax_path = $bf.attr('data-ajax_path');
	$.get(ajax_path+'?q='+$sf.val(), function(records){
		let html = '';
		for(let id in records){
			html += '<li data-id="'+id+'">'+records[id]+'</li>';
		}
		$searchResults.html(html);
		$searchResults.find('li').on('click', function(){
			let $li = $(this);
			let id = $li.attr('data-id');
			bridge_field.select($bf, id, $li.text());
			$bf.find('input[type=search]').focus();
		});
		$searchResults.show();
	});
};
bridge_field.select = function($bf, id, label){
	// add the id to the hidden input, which contains all the ids
	let $hidden = $bf.find('input[type=hidden]');
	let ids = $hidden.val().split(',').filter(function(i){return i!=''});
	if(!ids.includes(id)){
		// change the hidden value (ids)
		ids.push(id);
		$hidden.val(ids).change();

		// add the tag to the page
		let li = document.createElement('li');
		li.innerHTML = label;
		li.dataset.id = id;
		li.addEventListener('click', function(){
			bridge_field.deselect(li);
		});
		let $tags = $bf.find('.tags');
		$tags.append(li);

		$bf.find('.search-results').hide();
		$bf.find('input[type=search]').val('').focus();
	}
};
bridge_field.deselect = function(tag_ele){
	let $tag = $(tag_ele);
	let $bf = $tag.closest('.bridge_field');
	let id = $tag.attr('data-id');
	let $hidden = $bf.find('input[type=hidden]');
	let ids = $hidden.val().split(',').filter(function(i){return i!='';});

	// find and remove it from ids
	let idx = ids.indexOf(id);
	if(idx >= 0){
		ids.splice(idx, 1);
		$hidden.val(ids).change();
	}

	$tag.remove();
}
$(bridge_field.init);


// Mobile Navigation
document.addEventListener("DOMContentLoaded", function(){
	document.querySelector('.hamburger').addEventListener('click', function(){
		document.querySelector('body>nav').classList.toggle('show');
		document.querySelector('.overlay').classList.toggle('show');
	});
	document.querySelector('.overlay').addEventListener('click', function(){
		document.querySelector('body>nav').classList.toggle('show');
		document.querySelector('.overlay').classList.toggle('show');
	});
});