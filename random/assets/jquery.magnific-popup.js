/*! Magnific Popup - v1.0.0 - 2014-12-12
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2014 Dmitry Semenov; */
;(function (factory) { 
if (typeof define === 'function' && define.amd) { 
 // AMD. Register as an anonymous module. 
 define(['jquery'], factory); 
 } else if (typeof exports === 'object') { 
 // Node/CommonJS 
 factory(require('jquery')); 
 } else { 
 // Browser globals 
 factory(window.jQuery || window.Zepto); 
 } 
 }(function($) { 

/*>>core*/
/**
 * 
 * Magnific Popup Core JS file
 * 
 */


/**
 * Private static constants
 */
var CLOSE_EVENT = 'Close',
	BEFORE_CLOSE_EVENT = 'BeforeClose',
	AFTER_CLOSE_EVENT = 'AfterClose',
	BEFORE_APPEND_EVENT = 'BeforeAppend',
	MARKUP_PARSE_EVENT = 'MarkupParse',
	OPEN_EVENT = 'Open',
	CHANGE_EVENT = 'Change',
	NS = 'nov',
	EVENT_NS = '.' + NS,
	READY_CLASS = 'nov-ready',
	REMOVING_CLASS = 'nov-removing',
	PREVENT_CLOSE_CLASS = 'nov-prevent-close';


/**
 * Private vars 
 */
var nov, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
	MagnificPopup = function(){},
	_isJQ = !!(window.jQuery),
	_prevStatus,
	_window = $(window),
	_body,
	_document,
	_prevContentType,
	_wrapClasses,
	_currPopupType;


/**
 * Private functions
 */
var _novOn = function(name, f) {
		nov.ev.on(NS + name + EVENT_NS, f);
	},
	_getEl = function(className, appendTo, html, raw) {
		var el = document.createElement('div');
		el.className = 'nov-'+className;
		if(html) {
			el.innerHTML = html;
		}
		if(!raw) {
			el = $(el);
			if(appendTo) {
				el.appendTo(appendTo);
			}
		} else if(appendTo) {
			appendTo.appendChild(el);
		}
		return el;
	},
	_novTrigger = function(e, data) {
		nov.ev.triggerHandler(NS + e, data);

		if(nov.st.callbacks) {
			// converts "novEventName" to "eventName" callback and triggers it if it's present
			e = e.charAt(0).toLowerCase() + e.slice(1);
			if(nov.st.callbacks[e]) {
				nov.st.callbacks[e].apply(nov, $.isArray(data) ? data : [data]);
			}
		}
	},
	_getCloseBtn = function(type) {
		if(type !== _currPopupType || !nov.currTemplate.closeBtn) {
			nov.currTemplate.closeBtn = $( nov.st.closeMarkup.replace('%title%', nov.st.tClose ) );
			_currPopupType = type;
		}
		return nov.currTemplate.closeBtn;
	},
	// Initialize Magnific Popup only when called at least once
	_checkInstance = function() {
		if(!$.magnificPopup.instance) {
			nov = new MagnificPopup();
			nov.init();
			$.magnificPopup.instance = nov;
		}
	},
	// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
	supportsTransitions = function() {
		var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
			v = ['ms','O','Moz','Webkit']; // 'v' for vendor

		if( s['transition'] !== undefined ) {
			return true; 
		}
			
		while( v.length ) {
			if( v.pop() + 'Transition' in s ) {
				return true;
			}
		}
				
		return false;
	};



/**
 * Public functions
 */
MagnificPopup.prototype = {

	constructor: MagnificPopup,

	/**
	 * Initializes Magnific Popup plugin. 
	 * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
	 */
	init: function() {
		var appVersion = navigator.appVersion;
		nov.isIE7 = appVersion.indexOf("MSIE 7.") !== -1; 
		nov.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
		nov.isLowIE = nov.isIE7 || nov.isIE8;
		nov.isAndroid = (/android/gi).test(appVersion);
		nov.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
		nov.supportsTransition = supportsTransitions();

		// We disable fixed positioned lightbox on devices that don't handle it nicely.
		// If you know a better way of detecting this - let me know.
		nov.probablyMobile = (nov.isAndroid || nov.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent) );
		_document = $(document);

		nov.popupsCache = {};
	},

	/**
	 * Opens popup
	 * @param  data [description]
	 */
	open: function(data) {

		if(!_body) {
			_body = $(document.body);
		}

		var i;

		if(data.isObj === false) { 
			// convert jQuery collection to array to avoid conflicts later
			nov.items = data.items.toArray();

			nov.index = 0;
			var items = data.items,
				item;
			for(i = 0; i < items.length; i++) {
				item = items[i];
				if(item.parsed) {
					item = item.el[0];
				}
				if(item === data.el[0]) {
					nov.index = i;
					break;
				}
			}
		} else {
			nov.items = $.isArray(data.items) ? data.items : [data.items];
			nov.index = data.index || 0;
		}

		// if popup is already opened - we just update the content
		if(nov.isOpen) {
			nov.updateItemHTML();
			return;
		}
		
		nov.types = []; 
		_wrapClasses = '';
		if(data.mainEl && data.mainEl.length) {
			nov.ev = data.mainEl.eq(0);
		} else {
			nov.ev = _document;
		}

		if(data.key) {
			if(!nov.popupsCache[data.key]) {
				nov.popupsCache[data.key] = {};
			}
			nov.currTemplate = nov.popupsCache[data.key];
		} else {
			nov.currTemplate = {};
		}



		nov.st = $.extend(true, {}, $.magnificPopup.defaults, data ); 
		nov.fixedContentPos = nov.st.fixedContentPos === 'auto' ? !nov.probablyMobile : nov.st.fixedContentPos;

		if(nov.st.modal) {
			nov.st.closeOnContentClick = false;
			nov.st.closeOnBgClick = false;
			nov.st.showCloseBtn = false;
			nov.st.enableEscapeKey = false;
		}
		

		// Building markup
		// main containers are created only once
		if(!nov.bgOverlay) {

			// Dark overlay
			nov.bgOverlay = _getEl('bg').on('click'+EVENT_NS, function() {
				nov.close();
			});

			nov.wrap = _getEl('wrap').attr('tabindex', -1).on('click'+EVENT_NS, function(e) {
				if(nov._checkIfClose(e.target)) {
					nov.close();
				}
			});

			nov.container = _getEl('container', nov.wrap);
		}

		nov.contentContainer = _getEl('content');
		if(nov.st.preloader) {
			nov.preloader = _getEl('preloader', nov.container, nov.st.tLoading);
		}


		// Initializing modules
		var modules = $.magnificPopup.modules;
		for(i = 0; i < modules.length; i++) {
			var n = modules[i];
			n = n.charAt(0).toUpperCase() + n.slice(1);
			nov['init'+n].call(nov);
		}
		_novTrigger('BeforeOpen');


		if(nov.st.showCloseBtn) {
			// Close button
			if(!nov.st.closeBtnInside) {
				nov.wrap.append( _getCloseBtn() );
			} else {
				_novOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
					values.close_replaceWith = _getCloseBtn(item.type);
				});
				_wrapClasses += ' nov-close-btn-in';
			}
		}

		if(nov.st.alignTop) {
			_wrapClasses += ' nov-align-top';
		}

	

		if(nov.fixedContentPos) {
			nov.wrap.css({
				overflow: nov.st.overflowY,
				overflowX: 'hidden',
				overflowY: nov.st.overflowY
			});
		} else {
			nov.wrap.css({ 
				top: _window.scrollTop(),
				position: 'absolute'
			});
		}
		if( nov.st.fixedBgPos === false || (nov.st.fixedBgPos === 'auto' && !nov.fixedContentPos) ) {
			nov.bgOverlay.css({
				height: _document.height(),
				position: 'absolute'
			});
		}

		

		if(nov.st.enableEscapeKey) {
			// Close on ESC key
			_document.on('keyup' + EVENT_NS, function(e) {
				if(e.keyCode === 27) {
					nov.close();
				}
			});
		}

		_window.on('resize' + EVENT_NS, function() {
			nov.updateSize();
		});


		if(!nov.st.closeOnContentClick) {
			_wrapClasses += ' nov-auto-cursor';
		}
		
		if(_wrapClasses)
			nov.wrap.addClass(_wrapClasses);


		// this triggers recalculation of layout, so we get it once to not to trigger twice
		var windowHeight = nov.wH = _window.height();

		
		var windowStyles = {};

		if( nov.fixedContentPos ) {
            if(nov._hasScrollBar(windowHeight)){
                var s = nov._getScrollbarSize();
                if(s) {
                    windowStyles.marginRight = s;
                }
            }
        }

		if(nov.fixedContentPos) {
			if(!nov.isIE7) {
				windowStyles.overflow = 'hidden';
			} else {
				// ie7 double-scroll bug
				$('body, html').css('overflow', 'hidden');
			}
		}

		
		
		var classesToadd = nov.st.mainClass;
		if(nov.isIE7) {
			classesToadd += ' nov-ie7';
		}
		if(classesToadd) {
			nov._addClassToMFP( classesToadd );
		}

		// add content
		nov.updateItemHTML();

		_novTrigger('BuildControls');

		// remove scrollbar, add margin e.t.c
		$('html').css(windowStyles);
		
		// add everything to DOM
		nov.bgOverlay.add(nov.wrap).prependTo( nov.st.prependTo || _body );

		// Save last focused element
		nov._lastFocusedEl = document.activeElement;
		
		// Wait for next cycle to allow CSS transition
		setTimeout(function() {
			
			if(nov.content) {
				nov._addClassToMFP(READY_CLASS);
				nov._setFocus();
			} else {
				// if content is not defined (not loaded e.t.c) we add class only for BG
				nov.bgOverlay.addClass(READY_CLASS);
			}
			
			// Trap the focus in popup
			_document.on('focusin' + EVENT_NS, nov._onFocusIn);

		}, 16);

		nov.isOpen = true;
		nov.updateSize(windowHeight);
		_novTrigger(OPEN_EVENT);

		return data;
	},

	/**
	 * Closes the popup
	 */
	close: function() {
		if(!nov.isOpen) return;
		_novTrigger(BEFORE_CLOSE_EVENT);

		nov.isOpen = false;
		// for CSS3 animation
		if(nov.st.removalDelay && !nov.isLowIE && nov.supportsTransition )  {
			nov._addClassToMFP(REMOVING_CLASS);
			setTimeout(function() {
				nov._close();
			}, nov.st.removalDelay);
		} else {
			nov._close();
		}
	},

	/**
	 * Helper for close() function
	 */
	_close: function() {
		_novTrigger(CLOSE_EVENT);

		var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

		nov.bgOverlay.detach();
		nov.wrap.detach();
		nov.container.empty();

		if(nov.st.mainClass) {
			classesToRemove += nov.st.mainClass + ' ';
		}

		nov._removeClassFromMFP(classesToRemove);

		if(nov.fixedContentPos) {
			var windowStyles = {marginRight: ''};
			if(nov.isIE7) {
				$('body, html').css('overflow', '');
			} else {
				windowStyles.overflow = '';
			}
			$('html').css(windowStyles);
		}
		
		_document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
		nov.ev.off(EVENT_NS);

		// clean up DOM elements that aren't removed
		nov.wrap.attr('class', 'nov-wrap').removeAttr('style');
		nov.bgOverlay.attr('class', 'nov-bg');
		nov.container.attr('class', 'nov-container');

		// remove close button from target element
		if(nov.st.showCloseBtn &&
		(!nov.st.closeBtnInside || nov.currTemplate[nov.currItem.type] === true)) {
			if(nov.currTemplate.closeBtn)
				nov.currTemplate.closeBtn.detach();
		}


		if(nov._lastFocusedEl) {
			$(nov._lastFocusedEl).focus(); // put tab focus back
		}
		nov.currItem = null;	
		nov.content = null;
		nov.currTemplate = null;
		nov.prevHeight = 0;

		_novTrigger(AFTER_CLOSE_EVENT);
	},
	
	updateSize: function(winHeight) {

		if(nov.isIOS) {
			// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
			var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
			var height = window.innerHeight * zoomLevel;
			nov.wrap.css('height', height);
			nov.wH = height;
		} else {
			nov.wH = winHeight || _window.height();
		}
		// Fixes #84: popup incorrectly positioned with position:relative on body
		if(!nov.fixedContentPos) {
			nov.wrap.css('height', nov.wH);
		}

		_novTrigger('Resize');

	},

	/**
	 * Set content of popup based on current index
	 */
	updateItemHTML: function() {
		var item = nov.items[nov.index];

		// Detach and perform modifications
		nov.contentContainer.detach();

		if(nov.content)
			nov.content.detach();

		if(!item.parsed) {
			item = nov.parseEl( nov.index );
		}

		var type = item.type;	

		_novTrigger('BeforeChange', [nov.currItem ? nov.currItem.type : '', type]);
		// BeforeChange event works like so:
		// _novOn('BeforeChange', function(e, prevType, newType) { });
		
		nov.currItem = item;

		

		

		if(!nov.currTemplate[type]) {
			var markup = nov.st[type] ? nov.st[type].markup : false;

			// allows to modify markup
			_novTrigger('FirstMarkupParse', markup);

			if(markup) {
				nov.currTemplate[type] = $(markup);
			} else {
				// if there is no markup found we just define that template is parsed
				nov.currTemplate[type] = true;
			}
		}

		if(_prevContentType && _prevContentType !== item.type) {
			nov.container.removeClass('nov-'+_prevContentType+'-holder');
		}
		
		var newContent = nov['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, nov.currTemplate[type]);
		nov.appendContent(newContent, type);

		item.preloaded = true;

		_novTrigger(CHANGE_EVENT, item);
		_prevContentType = item.type;
		
		// Append container back after its content changed
		nov.container.prepend(nov.contentContainer);

		_novTrigger('AfterChange');
	},


	/**
	 * Set HTML content of popup
	 */
	appendContent: function(newContent, type) {
		nov.content = newContent;
		
		if(newContent) {
			if(nov.st.showCloseBtn && nov.st.closeBtnInside &&
				nov.currTemplate[type] === true) {
				// if there is no markup, we just append close button element inside
				if(!nov.content.find('.nov-close').length || !nov.content.find('.zmdi-close').length) {
					nov.content.append(_getCloseBtn());
				}
			} else {
				nov.content = newContent;
			}
		} else {
			nov.content = '';
		}

		_novTrigger(BEFORE_APPEND_EVENT);
		nov.container.addClass('nov-'+type+'-holder');

		nov.contentContainer.append(nov.content);
	},



	
	/**
	 * Creates Magnific Popup data object based on given data
	 * @param  {int} index Index of item to parse
	 */
	parseEl: function(index) {
		var item = nov.items[index],
			type;

		if(item.tagName) {
			item = { el: $(item) };
		} else {
			type = item.type;
			item = { data: item, src: item.src };
		}

		if(item.el) {
			var types = nov.types;

			// check for 'nov-TYPE' class
			for(var i = 0; i < types.length; i++) {
				if( item.el.hasClass('nov-'+types[i]) ) {
					type = types[i];
					break;
				}
			}

			item.src = item.el.attr('data-nov-src');
			if(!item.src) {
				item.src = item.el.attr('href');
			}
		}

		item.type = type || nov.st.type || 'inline';
		item.index = index;
		item.parsed = true;
		nov.items[index] = item;
		_novTrigger('ElementParse', item);

		return nov.items[index];
	},


	/**
	 * Initializes single popup or a group of popups
	 */
	addGroup: function(el, options) {
		var eHandler = function(e) {
			e.novEl = this;
			nov._openClick(e, el, options);
		};

		if(!options) {
			options = {};
		} 

		var eName = 'click.magnificPopup';
		options.mainEl = el;
		
		if(options.items) {
			options.isObj = true;
			el.off(eName).on(eName, eHandler);
		} else {
			options.isObj = false;
			if(options.delegate) {
				el.off(eName).on(eName, options.delegate , eHandler);
			} else {
				options.items = el;
				el.off(eName).on(eName, eHandler);
			}
		}
	},
	_openClick: function(e, el, options) {
		var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


		if(!midClick && ( e.which === 2 || e.ctrlKey || e.metaKey ) ) {
			return;
		}

		var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

		if(disableOn) {
			if($.isFunction(disableOn)) {
				if( !disableOn.call(nov) ) {
					return true;
				}
			} else { // else it's number
				if( _window.width() < disableOn ) {
					return true;
				}
			}
		}
		
		if(e.type) {
			e.preventDefault();

			// This will prevent popup from closing if element is inside and popup is already opened
			if(nov.isOpen) {
				e.stopPropagation();
			}
		}
			

		options.el = $(e.novEl);
		if(options.delegate) {
			options.items = el.find(options.delegate);
		}
		nov.open(options);
	},


	/**
	 * Updates text on preloader
	 */
	updateStatus: function(status, text) {

		if(nov.preloader) {
			if(_prevStatus !== status) {
				nov.container.removeClass('nov-s-'+_prevStatus);
			}

			if(!text && status === 'loading') {
				text = nov.st.tLoading;
			}

			var data = {
				status: status,
				text: text
			};
			// allows to modify status
			_novTrigger('UpdateStatus', data);

			status = data.status;
			text = data.text;

			nov.preloader.html(text);

			nov.preloader.find('a').on('click', function(e) {
				e.stopImmediatePropagation();
			});

			nov.container.addClass('nov-s-'+status);
			_prevStatus = status;
		}
	},


	/*
		"Private" helpers that aren't private at all
	 */
	// Check to close popup or not
	// "target" is an element that was clicked
	_checkIfClose: function(target) {

		if($(target).hasClass(PREVENT_CLOSE_CLASS)) {
			return;
		}

		var closeOnContent = nov.st.closeOnContentClick;
		var closeOnBg = nov.st.closeOnBgClick;

		if(closeOnContent && closeOnBg) {
			return true;
		} else {

			// We close the popup if click is on close button or on preloader. Or if there is no content.
			if(!nov.content || $(target).hasClass('nov-close') || $(target).hasClass('zmdi-close') || (nov.preloader && target === nov.preloader[0]) ) {
				return true;
			}

			// if click is outside the content
			if(  (target !== nov.content[0] && !$.contains(nov.content[0], target))  ) {
				if(closeOnBg) {
					// last check, if the clicked element is in DOM, (in case it's removed onclick)
					if( $.contains(document, target) ) {
						return true;
					}
				}
			} else if(closeOnContent) {
				return true;
			}

		}
		return false;
	},
	_addClassToMFP: function(cName) {
		nov.bgOverlay.addClass(cName);
		nov.wrap.addClass(cName);
	},
	_removeClassFromMFP: function(cName) {
		this.bgOverlay.removeClass(cName);
		nov.wrap.removeClass(cName);
	},
	_hasScrollBar: function(winHeight) {
		return (  (nov.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()) );
	},
	_setFocus: function() {
		//(nov.st.focus ? nov.content.find(nov.st.focus).eq(0) : nov.wrap).focus();
	},
	_onFocusIn: function(e) {
		if( e.target !== nov.wrap[0] && !$.contains(nov.wrap[0], e.target) ) {
			nov._setFocus();
			return false;
		}
	},
	_parseMarkup: function(template, values, item) {
		var arr;
		if(item.data) {
			values = $.extend(item.data, values);
		}
		_novTrigger(MARKUP_PARSE_EVENT, [template, values, item] );

		$.each(values, function(key, value) {
			if(value === undefined || value === false) {
				return true;
			}
			arr = key.split('_');
			if(arr.length > 1) {
				var el = template.find(EVENT_NS + '-'+arr[0]);

				if(el.length > 0) {
					var attr = arr[1];
					if(attr === 'replaceWith') {
						if(el[0] !== value[0]) {
							el.replaceWith(value);
						}
					} else if(attr === 'img') {
						if(el.is('img')) {
							el.attr('src', value);
						} else {
							el.replaceWith( '<img src="'+value+'" class="' + el.attr('class') + '" />' );
						}
					} else {
						el.attr(arr[1], value);
					}
				}

			} else {
				template.find(EVENT_NS + '-'+key).html(value);
			}
		});
	},

	_getScrollbarSize: function() {
		// thx David
		if(nov.scrollbarSize === undefined) {
			var scrollDiv = document.createElement("div");
			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			document.body.appendChild(scrollDiv);
			nov.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);
		}
		return nov.scrollbarSize;
	}

}; /* MagnificPopup core prototype end */




/**
 * Public static functions
 */
$.magnificPopup = {
	instance: null,
	proto: MagnificPopup.prototype,
	modules: [],

	open: function(options, index) {
		_checkInstance();	

		if(!options) {
			options = {};
		} else {
			options = $.extend(true, {}, options);
		}
			

		options.isObj = true;
		options.index = index || 0;
		return this.instance.open(options);
	},

	close: function() {
		return $.magnificPopup.instance && $.magnificPopup.instance.close();
	},

	registerModule: function(name, module) {
		if(module.options) {
			$.magnificPopup.defaults[name] = module.options;
		}
		$.extend(this.proto, module.proto);			
		this.modules.push(name);
	},

	defaults: {   

		// Info about options is in docs:
		// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options
		
		disableOn: 0,	

		key: null,

		midClick: false,

		mainClass: '',

		preloader: true,

		focus: '', // CSS selector of input to focus after popup is opened
		
		closeOnContentClick: false,

		closeOnBgClick: true,

		closeBtnInside: true, 

		showCloseBtn: true,

		enableEscapeKey: true,

		modal: false,

		alignTop: false,
	
		removalDelay: 0,

		prependTo: null,
		
		fixedContentPos: 'auto', 
	
		fixedBgPos: 'auto',

		overflowY: 'auto',

		closeMarkup: '<button title="%title%" type="button" class="nov-close">x</button>',

		tClose: 'Close (Esc)',

		tLoading: 'Loading...'

	}
};



$.fn.magnificPopup = function(options) {
	_checkInstance();

	var jqEl = $(this);

	// We call some API method of first param is a string
	if (typeof options === "string" ) {

		if(options === 'open') {
			var items,
				itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
				index = parseInt(arguments[1], 10) || 0;

			if(itemOpts.items) {
				items = itemOpts.items[index];
			} else {
				items = jqEl;
				if(itemOpts.delegate) {
					items = items.find(itemOpts.delegate);
				}
				items = items.eq( index );
			}
			nov._openClick({novEl:items}, jqEl, itemOpts);
		} else {
			if(nov.isOpen)
				nov[options].apply(nov, Array.prototype.slice.call(arguments, 1));
		}

	} else {
		// clone options obj
		options = $.extend(true, {}, options);
		
		/*
		 * As Zepto doesn't support .data() method for objects 
		 * and it works only in normal browsers
		 * we assign "options" object directly to the DOM element. FTW!
		 */
		if(_isJQ) {
			jqEl.data('magnificPopup', options);
		} else {
			jqEl[0].magnificPopup = options;
		}

		nov.addGroup(jqEl, options);

	}
	return jqEl;
};


//Quick benchmark
/*
var start = performance.now(),
	i,
	rounds = 1000;

for(i = 0; i < rounds; i++) {

}
console.log('Test #1:', performance.now() - start);

start = performance.now();
for(i = 0; i < rounds; i++) {

}
console.log('Test #2:', performance.now() - start);
*/


/*>>core*/

/*>>inline*/

var INLINE_NS = 'inline',
	_hiddenClass,
	_inlinePlaceholder, 
	_lastInlineElement,
	_putInlineElementsBack = function() {
		if(_lastInlineElement) {
			_inlinePlaceholder.after( _lastInlineElement.addClass(_hiddenClass) ).detach();
			_lastInlineElement = null;
		}
	};

$.magnificPopup.registerModule(INLINE_NS, {
	options: {
		hiddenClass: 'hide', // will be appended with `nov-` prefix
		markup: '',
		tNotFound: 'Content not found'
	},
	proto: {

		initInline: function() {
			nov.types.push(INLINE_NS);

			_novOn(CLOSE_EVENT+'.'+INLINE_NS, function() {
				_putInlineElementsBack();
			});
		},

		getInline: function(item, template) {

			_putInlineElementsBack();

			if(item.src) {
				var inlineSt = nov.st.inline,
					el = $(item.src);

				if(el.length) {

					// If target element has parent - we replace it with placeholder and put it back after popup is closed
					var parent = el[0].parentNode;
					if(parent && parent.tagName) {
						if(!_inlinePlaceholder) {
							_hiddenClass = inlineSt.hiddenClass;
							_inlinePlaceholder = _getEl(_hiddenClass);
							_hiddenClass = 'nov-'+_hiddenClass;
						}
						// replace target inline element with placeholder
						_lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
					}

					nov.updateStatus('ready');
				} else {
					nov.updateStatus('error', inlineSt.tNotFound);
					el = $('<div>');
				}

				item.inlineElement = el;
				return el;
			}

			nov.updateStatus('ready');
			nov._parseMarkup(template, {}, item);
			return template;
		}
	}
});

/*>>inline*/

/*>>ajax*/
var AJAX_NS = 'ajax',
	_ajaxCur,
	_removeAjaxCursor = function() {
		if(_ajaxCur) {
			_body.removeClass(_ajaxCur);
		}
	},
	_destroyAjaxRequest = function() {
		_removeAjaxCursor();
		if(nov.req) {
			nov.req.abort();
		}
	};

$.magnificPopup.registerModule(AJAX_NS, {

	options: {
		settings: null,
		cursor: 'nov-ajax-cur',
		tError: '<a href="%url%">The content</a> could not be loaded.'
	},

	proto: {
		initAjax: function() {
			nov.types.push(AJAX_NS);
			_ajaxCur = nov.st.ajax.cursor;

			_novOn(CLOSE_EVENT+'.'+AJAX_NS, _destroyAjaxRequest);
			_novOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
		},
		getAjax: function(item) {

			if(_ajaxCur)
				_body.addClass(_ajaxCur);

			nov.updateStatus('loading');

			var opts = $.extend({
				url: item.src,
				success: function(data, textStatus, jqXHR) {
					var temp = {
						data:data,
						xhr:jqXHR
					};

					_novTrigger('ParseAjax', temp);

					nov.appendContent( $(temp.data), AJAX_NS );

					item.finished = true;

					_removeAjaxCursor();

					nov._setFocus();

					setTimeout(function() {
						nov.wrap.addClass(READY_CLASS);
					}, 16);

					nov.updateStatus('ready');

					_novTrigger('AjaxContentAdded');
				},
				error: function() {
					_removeAjaxCursor();
					item.finished = item.loadError = true;
					nov.updateStatus('error', nov.st.ajax.tError.replace('%url%', item.src));
				}
			}, nov.st.ajax.settings);

			nov.req = $.ajax(opts);

			return '';
		}
	}
});





	

/*>>ajax*/

/*>>image*/
var _imgInterval,
	_getTitle = function(item) {
		if(item.data && item.data.title !== undefined) 
			return item.data.title;

		var src = nov.st.image.titleSrc;

		if(src) {
			if($.isFunction(src)) {
				return src.call(nov, item);
			} else if(item.el) {
				return item.el.attr(src) || '';
			}
		}
		return '';
	};

$.magnificPopup.registerModule('image', {

	options: {
		markup: '<div class="nov-figure">'+
					'<div class="nov-close"></div>'+
					'<figure>'+
						'<div class="nov-img"></div>'+
						'<figcaption>'+
							'<div class="nov-bottom-bar">'+
								'<div class="nov-title"></div>'+
								'<div class="nov-counter"></div>'+
							'</div>'+
						'</figcaption>'+
					'</figure>'+
				'</div>',
		cursor: 'nov-zoom-out-cur',
		titleSrc: 'title', 
		verticalFit: true,
		tError: '<a href="%url%">The image</a> could not be loaded.'
	},

	proto: {
		initImage: function() {
			var imgSt = nov.st.image,
				ns = '.image';

			nov.types.push('image');

			_novOn(OPEN_EVENT+ns, function() {
				if(nov.currItem.type === 'image' && imgSt.cursor) {
					_body.addClass(imgSt.cursor);
				}
			});

			_novOn(CLOSE_EVENT+ns, function() {
				if(imgSt.cursor) {
					_body.removeClass(imgSt.cursor);
				}
				_window.off('resize' + EVENT_NS);
			});

			_novOn('Resize'+ns, nov.resizeImage);
			if(nov.isLowIE) {
				_novOn('AfterChange', nov.resizeImage);
			}
		},
		resizeImage: function() {
			var item = nov.currItem;
			if(!item || !item.img) return;

			if(nov.st.image.verticalFit) {
				var decr = 0;
				// fix box-sizing in ie7/8
				if(nov.isLowIE) {
					decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'),10);
				}
				item.img.css('max-height', nov.wH-decr);
			}
		},
		_onImageHasSize: function(item) {
			if(item.img) {
				
				item.hasSize = true;

				if(_imgInterval) {
					clearInterval(_imgInterval);
				}
				
				item.isCheckingImgSize = false;

				_novTrigger('ImageHasSize', item);

				if(item.imgHidden) {
					if(nov.content)
						nov.content.removeClass('nov-loading');
					
					item.imgHidden = false;
				}

			}
		},

		/**
		 * Function that loops until the image has size to display elements that rely on it asap
		 */
		findImageSize: function(item) {

			var counter = 0,
				img = item.img[0],
				novSetInterval = function(delay) {

					if(_imgInterval) {
						clearInterval(_imgInterval);
					}
					// decelerating interval that checks for size of an image
					_imgInterval = setInterval(function() {
						if(img.naturalWidth > 0) {
							nov._onImageHasSize(item);
							return;
						}

						if(counter > 200) {
							clearInterval(_imgInterval);
						}

						counter++;
						if(counter === 3) {
							novSetInterval(10);
						} else if(counter === 40) {
							novSetInterval(50);
						} else if(counter === 100) {
							novSetInterval(500);
						}
					}, delay);
				};

			novSetInterval(1);
		},

		getImage: function(item, template) {

			var guard = 0,

				// image load complete handler
				onLoadComplete = function() {
					if(item) {
						if (item.img[0].complete) {
							item.img.off('.novloader');
							
							if(item === nov.currItem){
								nov._onImageHasSize(item);

								nov.updateStatus('ready');
							}

							item.hasSize = true;
							item.loaded = true;

							_novTrigger('ImageLoadComplete');
							
						}
						else {
							// if image complete check fails 200 times (20 sec), we assume that there was an error.
							guard++;
							if(guard < 200) {
								setTimeout(onLoadComplete,100);
							} else {
								onLoadError();
							}
						}
					}
				},

				// image error handler
				onLoadError = function() {
					if(item) {
						item.img.off('.novloader');
						if(item === nov.currItem){
							nov._onImageHasSize(item);
							nov.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
						}

						item.hasSize = true;
						item.loaded = true;
						item.loadError = true;
					}
				},
				imgSt = nov.st.image;


			var el = template.find('.nov-img');
			if(el.length) {
				var img = document.createElement('img');
				img.className = 'nov-img';
				if(item.el && item.el.find('img').length) {
					img.alt = item.el.find('img').attr('alt');
				}
				item.img = $(img).on('load.novloader', onLoadComplete).on('error.novloader', onLoadError);
				img.src = item.src;

				// without clone() "error" event is not firing when IMG is replaced by new IMG
				// TODO: find a way to avoid such cloning
				if(el.is('img')) {
					item.img = item.img.clone();
				}

				img = item.img[0];
				if(img.naturalWidth > 0) {
					item.hasSize = true;
				} else if(!img.width) {										
					item.hasSize = false;
				}
			}

			nov._parseMarkup(template, {
				title: _getTitle(item),
				img_replaceWith: item.img
			}, item);

			nov.resizeImage();

			if(item.hasSize) {
				if(_imgInterval) clearInterval(_imgInterval);

				if(item.loadError) {
					template.addClass('nov-loading');
					nov.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
				} else {
					template.removeClass('nov-loading');
					nov.updateStatus('ready');
				}
				return template;
			}

			nov.updateStatus('loading');
			item.loading = true;

			if(!item.hasSize) {
				item.imgHidden = true;
				template.addClass('nov-loading');
				nov.findImageSize(item);
			} 

			return template;
		}
	}
});



/*>>image*/

/*>>zoom*/
var hasMozTransform,
	getHasMozTransform = function() {
		if(hasMozTransform === undefined) {
			hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
		}
		return hasMozTransform;		
	};

$.magnificPopup.registerModule('zoom', {

	options: {
		enabled: false,
		easing: 'ease-in-out',
		duration: 300,
		opener: function(element) {
			return element.is('img') ? element : element.find('img');
		}
	},

	proto: {

		initZoom: function() {
			var zoomSt = nov.st.zoom,
				ns = '.zoom',
				image;
				
			if(!zoomSt.enabled || !nov.supportsTransition) {
				return;
			}

			var duration = zoomSt.duration,
				getElToAnimate = function(image) {
					var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('nov-animated-image'),
						transition = 'all '+(zoomSt.duration/1000)+'s ' + zoomSt.easing,
						cssObj = {
							position: 'fixed',
							zIndex: 9999,
							left: 0,
							top: 0,
							'-webkit-backface-visibility': 'hidden'
						},
						t = 'transition';

					cssObj['-webkit-'+t] = cssObj['-moz-'+t] = cssObj['-o-'+t] = cssObj[t] = transition;

					newImg.css(cssObj);
					return newImg;
				},
				showMainContent = function() {
					nov.content.css('visibility', 'visible');
				},
				openTimeout,
				animatedImg;

			_novOn('BuildControls'+ns, function() {
				if(nov._allowZoom()) {

					clearTimeout(openTimeout);
					nov.content.css('visibility', 'hidden');

					// Basically, all code below does is clones existing image, puts in on top of the current one and animated it
					
					image = nov._getItemToZoom();

					if(!image) {
						showMainContent();
						return;
					}

					animatedImg = getElToAnimate(image); 
					
					animatedImg.css( nov._getOffset() );

					nov.wrap.append(animatedImg);

					openTimeout = setTimeout(function() {
						animatedImg.css( nov._getOffset( true ) );
						openTimeout = setTimeout(function() {

							showMainContent();

							setTimeout(function() {
								animatedImg.remove();
								image = animatedImg = null;
								_novTrigger('ZoomAnimationEnded');
							}, 16); // avoid blink when switching images 

						}, duration); // this timeout equals animation duration

					}, 16); // by adding this timeout we avoid short glitch at the beginning of animation


					// Lots of timeouts...
				}
			});
			_novOn(BEFORE_CLOSE_EVENT+ns, function() {
				if(nov._allowZoom()) {

					clearTimeout(openTimeout);

					nov.st.removalDelay = duration;

					if(!image) {
						image = nov._getItemToZoom();
						if(!image) {
							return;
						}
						animatedImg = getElToAnimate(image);
					}
					
					
					animatedImg.css( nov._getOffset(true) );
					nov.wrap.append(animatedImg);
					nov.content.css('visibility', 'hidden');
					
					setTimeout(function() {
						animatedImg.css( nov._getOffset() );
					}, 16);
				}

			});

			_novOn(CLOSE_EVENT+ns, function() {
				if(nov._allowZoom()) {
					showMainContent();
					if(animatedImg) {
						animatedImg.remove();
					}
					image = null;
				}	
			});
		},

		_allowZoom: function() {
			return nov.currItem.type === 'image';
		},

		_getItemToZoom: function() {
			if(nov.currItem.hasSize) {
				return nov.currItem.img;
			} else {
				return false;
			}
		},

		// Get element postion relative to viewport
		_getOffset: function(isLarge) {
			var el;
			if(isLarge) {
				el = nov.currItem.img;
			} else {
				el = nov.st.zoom.opener(nov.currItem.el || nov.currItem);
			}

			var offset = el.offset();
			var paddingTop = parseInt(el.css('padding-top'),10);
			var paddingBottom = parseInt(el.css('padding-bottom'),10);
			offset.top -= ( $(window).scrollTop() - paddingTop );


			/*
			
			Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

			 */
			var obj = {
				width: el.width(),
				// fix Zepto height+padding issue
				height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
			};

			// I hate to do this, but there is no another option
			if( getHasMozTransform() ) {
				obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
			} else {
				obj.left = offset.left;
				obj.top = offset.top;
			}
			return obj;
		}

	}
});



/*>>zoom*/

/*>>iframe*/

var IFRAME_NS = 'iframe',
	_emptyPage = '//about:blank',
	
	_fixIframeBugs = function(isShowing) {
		if(nov.currTemplate[IFRAME_NS]) {
			var el = nov.currTemplate[IFRAME_NS].find('iframe');
			if(el.length) { 
				// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
				if(!isShowing) {
					el[0].src = _emptyPage;
				}

				// IE8 black screen bug fix
				if(nov.isIE8) {
					el.css('display', isShowing ? 'block' : 'none');
				}
			}
		}
	};

$.magnificPopup.registerModule(IFRAME_NS, {

	options: {
		markup: '<div class="nov-iframe-scaler">'+
					'<div class="nov-close"></div>'+
					'<iframe class="nov-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
				'</div>',

		srcAction: 'iframe_src',

		// we don't care and support only one default type of URL by default
		patterns: {
			youtube: {
				index: 'youtube.com', 
				id: 'v=', 
				src: '//www.youtube.com/embed/%id%?autoplay=1'
			},
			vimeo: {
				index: 'vimeo.com/',
				id: '/',
				src: '//player.vimeo.com/video/%id%?autoplay=1'
			},
			gmaps: {
				index: '//maps.google.',
				src: '%id%&output=embed'
			}
		}
	},

	proto: {
		initIframe: function() {
			nov.types.push(IFRAME_NS);

			_novOn('BeforeChange', function(e, prevType, newType) {
				if(prevType !== newType) {
					if(prevType === IFRAME_NS) {
						_fixIframeBugs(); // iframe if removed
					} else if(newType === IFRAME_NS) {
						_fixIframeBugs(true); // iframe is showing
					} 
				}// else {
					// iframe source is switched, don't do anything
				//}
			});

			_novOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
				_fixIframeBugs();
			});
		},

		getIframe: function(item, template) {
			var embedSrc = item.src;
			var iframeSt = nov.st.iframe;
				
			$.each(iframeSt.patterns, function() {
				if(embedSrc.indexOf( this.index ) > -1) {
					if(this.id) {
						if(typeof this.id === 'string') {
							embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length, embedSrc.length);
						} else {
							embedSrc = this.id.call( this, embedSrc );
						}
					}
					embedSrc = this.src.replace('%id%', embedSrc );
					return false; // break;
				}
			});
			
			var dataObj = {};
			if(iframeSt.srcAction) {
				dataObj[iframeSt.srcAction] = embedSrc;
			}
			nov._parseMarkup(template, dataObj, item);

			nov.updateStatus('ready');

			return template;
		}
	}
});



/*>>iframe*/

/*>>gallery*/
/**
 * Get looped index depending on number of slides
 */
var _getLoopedId = function(index) {
		var numSlides = nov.items.length;
		if(index > numSlides - 1) {
			return index - numSlides;
		} else  if(index < 0) {
			return numSlides + index;
		}
		return index;
	},
	_replaceCurrTotal = function(text, curr, total) {
		return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
	};

$.magnificPopup.registerModule('gallery', {

	options: {
		enabled: false,
		arrowMarkup: '<button title="%title%" type="button" class="nov-arrow nov-arrow-%dir%"></button>',
		preload: [0,2],
		navigateByImgClick: true,
		arrows: true,

		tPrev: 'Previous (Left arrow key)',
		tNext: 'Next (Right arrow key)',
		tCounter: '%curr% of %total%'
	},

	proto: {
		initGallery: function() {

			var gSt = nov.st.gallery,
				ns = '.nov-gallery',
				supportsFastClick = Boolean($.fn.novFastClick);

			nov.direction = true; // true - next, false - prev
			
			if(!gSt || !gSt.enabled ) return false;

			_wrapClasses += ' nov-gallery';

			_novOn(OPEN_EVENT+ns, function() {

				if(gSt.navigateByImgClick) {
					nov.wrap.on('click'+ns, '.nov-img', function() {
						if(nov.items.length > 1) {
							nov.next();
							return false;
						}
					});
				}

				_document.on('keydown'+ns, function(e) {
					if (e.keyCode === 37) {
						nov.prev();
					} else if (e.keyCode === 39) {
						nov.next();
					}
				});
			});

			_novOn('UpdateStatus'+ns, function(e, data) {
				if(data.text) {
					data.text = _replaceCurrTotal(data.text, nov.currItem.index, nov.items.length);
				}
			});

			_novOn(MARKUP_PARSE_EVENT+ns, function(e, element, values, item) {
				var l = nov.items.length;
				values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
			});

			_novOn('BuildControls' + ns, function() {
				if(nov.items.length > 1 && gSt.arrows && !nov.arrowLeft) {
					var markup = gSt.arrowMarkup,
						arrowLeft = nov.arrowLeft = $( markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left') ).addClass(PREVENT_CLOSE_CLASS),			
						arrowRight = nov.arrowRight = $( markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right') ).addClass(PREVENT_CLOSE_CLASS);

					var eName = supportsFastClick ? 'novFastClick' : 'click';
					arrowLeft[eName](function() {
						nov.prev();
					});			
					arrowRight[eName](function() {
						nov.next();
					});	

					// Polyfill for :before and :after (adds elements with classes nov-a and nov-b)
					if(nov.isIE7) {
						_getEl('b', arrowLeft[0], false, true);
						_getEl('a', arrowLeft[0], false, true);
						_getEl('b', arrowRight[0], false, true);
						_getEl('a', arrowRight[0], false, true);
					}

					nov.container.append(arrowLeft.add(arrowRight));
				}
			});

			_novOn(CHANGE_EVENT+ns, function() {
				if(nov._preloadTimeout) clearTimeout(nov._preloadTimeout);

				nov._preloadTimeout = setTimeout(function() {
					nov.preloadNearbyImages();
					nov._preloadTimeout = null;
				}, 16);		
			});


			_novOn(CLOSE_EVENT+ns, function() {
				_document.off(ns);
				nov.wrap.off('click'+ns);
			
				if(nov.arrowLeft && supportsFastClick) {
					nov.arrowLeft.add(nov.arrowRight).destroyNovFastClick();
				}
				nov.arrowRight = nov.arrowLeft = null;
			});

		}, 
		next: function() {
			nov.direction = true;
			nov.index = _getLoopedId(nov.index + 1);
			nov.updateItemHTML();
		},
		prev: function() {
			nov.direction = false;
			nov.index = _getLoopedId(nov.index - 1);
			nov.updateItemHTML();
		},
		goTo: function(newIndex) {
			nov.direction = (newIndex >= nov.index);
			nov.index = newIndex;
			nov.updateItemHTML();
		},
		preloadNearbyImages: function() {
			var p = nov.st.gallery.preload,
				preloadBefore = Math.min(p[0], nov.items.length),
				preloadAfter = Math.min(p[1], nov.items.length),
				i;

			for(i = 1; i <= (nov.direction ? preloadAfter : preloadBefore); i++) {
				nov._preloadItem(nov.index+i);
			}
			for(i = 1; i <= (nov.direction ? preloadBefore : preloadAfter); i++) {
				nov._preloadItem(nov.index-i);
			}
		},
		_preloadItem: function(index) {
			index = _getLoopedId(index);

			if(nov.items[index].preloaded) {
				return;
			}

			var item = nov.items[index];
			if(!item.parsed) {
				item = nov.parseEl( index );
			}

			_novTrigger('LazyLoad', item);

			if(item.type === 'image') {
				item.img = $('<img class="nov-img" />').on('load.novloader', function() {
					item.hasSize = true;
				}).on('error.novloader', function() {
					item.hasSize = true;
					item.loadError = true;
					_novTrigger('LazyLoadError', item);
				}).attr('src', item.src);
			}


			item.preloaded = true;
		}
	}
});

/*
Touch Support that might be implemented some day

addSwipeGesture: function() {
	var startX,
		moved,
		multipleTouches;

		return;

	var namespace = '.nov',
		addEventNames = function(pref, down, move, up, cancel) {
			nov._tStart = pref + down + namespace;
			nov._tMove = pref + move + namespace;
			nov._tEnd = pref + up + namespace;
			nov._tCancel = pref + cancel + namespace;
		};

	if(window.navigator.msPointerEnabled) {
		addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
	} else if('ontouchstart' in window) {
		addEventNames('touch', 'start', 'move', 'end', 'cancel');
	} else {
		return;
	}
	_window.on(nov._tStart, function(e) {
		var oE = e.originalEvent;
		multipleTouches = moved = false;
		startX = oE.pageX || oE.changedTouches[0].pageX;
	}).on(nov._tMove, function(e) {
		if(e.originalEvent.touches.length > 1) {
			multipleTouches = e.originalEvent.touches.length;
		} else {
			//e.preventDefault();
			moved = true;
		}
	}).on(nov._tEnd + ' ' + nov._tCancel, function(e) {
		if(moved && !multipleTouches) {
			var oE = e.originalEvent,
				diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

			if(diff > 20) {
				nov.next();
			} else if(diff < -20) {
				nov.prev();
			}
		}
	});
},
*/


/*>>gallery*/

/*>>retina*/

var RETINA_NS = 'retina';

$.magnificPopup.registerModule(RETINA_NS, {
	options: {
		replaceSrc: function(item) {
			return item.src.replace(/\.\w+$/, function(m) { return '@2x' + m; });
		},
		ratio: 1 // Function or number.  Set to 1 to disable.
	},
	proto: {
		initRetina: function() {
			if(window.devicePixelRatio > 1) {

				var st = nov.st.retina,
					ratio = st.ratio;

				ratio = !isNaN(ratio) ? ratio : ratio();

				if(ratio > 1) {
					_novOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
						item.img.css({
							'max-width': item.img[0].naturalWidth / ratio,
							'width': '100%'
						});
					});
					_novOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
						item.src = st.replaceSrc(item, ratio);
					});
				}
			}

		}
	}
});

/*>>retina*/

/*>>fastclick*/
/**
 * FastClick event implementation. (removes 300ms delay on touch devices)
 * Based on https://developers.google.com/mobile/articles/fast_buttons
 *
 * You may use it outside the Magnific Popup by calling just:
 *
 * $('.your-el').novFastClick(function() {
 *     console.log('Clicked!');
 * });
 *
 * To unbind:
 * $('.your-el').destroyNovFastClick();
 * 
 * 
 * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
 * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
 * 
 */

(function() {
	var ghostClickDelay = 1000,
		supportsTouch = 'ontouchstart' in window,
		unbindTouchMove = function() {
			_window.off('touchmove'+ns+' touchend'+ns);
		},
		eName = 'novFastClick',
		ns = '.'+eName;


	// As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
	$.fn.novFastClick = function(callback) {

		return $(this).each(function() {

			var elem = $(this),
				lock;

			if( supportsTouch ) {

				var timeout,
					startX,
					startY,
					pointerMoved,
					point,
					numPointers;

				elem.on('touchstart' + ns, function(e) {
					pointerMoved = false;
					numPointers = 1;

					point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
					startX = point.clientX;
					startY = point.clientY;

					_window.on('touchmove'+ns, function(e) {
						point = e.originalEvent ? e.originalEvent.touches : e.touches;
						numPointers = point.length;
						point = point[0];
						if (Math.abs(point.clientX - startX) > 10 ||
							Math.abs(point.clientY - startY) > 10) {
							pointerMoved = true;
							unbindTouchMove();
						}
					}).on('touchend'+ns, function(e) {
						unbindTouchMove();
						if(pointerMoved || numPointers > 1) {
							return;
						}
						lock = true;
						e.preventDefault();
						clearTimeout(timeout);
						timeout = setTimeout(function() {
							lock = false;
						}, ghostClickDelay);
						callback();
					});
				});

			}

			elem.on('click' + ns, function() {
				if(!lock) {
					callback();
				}
			});
		});
	};

	$.fn.destroyNovFastClick = function() {
		$(this).off('touchstart' + ns + ' click' + ns);
		if(supportsTouch) _window.off('touchmove'+ns+' touchend'+ns);
	};
})();

/*>>fastclick*/
 _checkInstance(); }));