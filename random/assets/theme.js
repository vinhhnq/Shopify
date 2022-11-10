window.theme = window.theme || {};
theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];
    $(document).on('shopify:section:load', this._onSectionLoad.bind(this)).on('shopify:section:unload', this._onSectionUnload.bind(this)).on('shopify:section:select', this._onSelect.bind(this)).on('shopify:section:deselect', this._onDeselect.bind(this)).on('shopify:block:select', this._onBlockSelect.bind(this)).on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};
theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
    _createInstance: function(container, constructor) {
        var $container = $(container);
        var id = $container.attr('data-section-id');
        var type = $container.attr('data-section-type');
        constructor = constructor || this.constructors[type];
        if (_.isUndefined(constructor)) {
            return;
        }
        var instance = _.assignIn(new constructor(container), {
            id: id,
            type: type,
            container: container
        });
        this.instances.push(instance);
    },
    _onSectionLoad: function(evt) {
        var container = $('[data-section-id]', evt.target)[0];
        if (container) {
            this._createInstance(container);
        }
    },
    _onSectionUnload: function(evt) {
        this.instances = _.filter(this.instances, function(instance) {
            var isEventInstance = instance.id === evt.detail.sectionId;
            if (isEventInstance) {
                if (_.isFunction(instance.onUnload)) {
                    instance.onUnload(evt);
                }
            }
            return !isEventInstance;
        });
    },
    _onSelect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
            instance.onSelect(evt);
        }
    },
    _onDeselect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
            instance.onDeselect(evt);
        }
    },
    _onBlockSelect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
            instance.onBlockSelect(evt);
        }
    },
    _onBlockDeselect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
            instance.onBlockDeselect(evt);
        }
    },
    register: function(type, constructor) {
        this.constructors[type] = constructor;
        $('[data-section-type=' + type + ']').each(function(index, container) {
            this._createInstance(container, constructor);
        }.bind(this));
    }
});
window.slate = window.slate || {};
slate.rte = {
    wrapTable: function(options) {
        options.$tables.wrap('<div class="' + options.tableWrapperClass + '"></div>');
    },
    wrapIframe: function(options) {
        options.$iframes.each(function() {
            $(this).wrap('<div class="' + options.iframeWrapperClass + '"></div>');
            this.src = this.src;
        });
    }
};
window.slate = window.slate || {};
slate.a11y = {
    pageLinkFocus: function($element) {
        var focusClass = 'js-focus-hidden';
        $element.first().attr('tabIndex', '-1').focus().addClass(focusClass).one('blur', callback);

        function callback() {
            $element.first().removeClass(focusClass).removeAttr('tabindex');
        }
    },
    focusHash: function() {
        var hash = window.location.hash;
        if (hash && document.getElementById(hash.slice(1))) {
            this.pageLinkFocus($(hash));
        }
    },
    bindInPageLinks: function() {
        $('a[href*=#]').on('click', function(evt) {
            this.pageLinkFocus($(evt.currentTarget.hash));
        }.bind(this));
    },
    trapFocus: function(options) {
        var eventName = options.namespace ? 'focusin.' + options.namespace : 'focusin';
        if (!options.$elementToFocus) {
            options.$elementToFocus = options.$container;
        }
        options.$container.attr('tabindex', '-1');
        options.$elementToFocus.focus();
        $(document).off('focusin');
        $(document).on(eventName, function(evt) {
            if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
                options.$container.focus();
            }
        });
    },
    removeTrapFocus: function(options) {
        var eventName = options.namespace ? 'focusin.' + options.namespace : 'focusin';
        if (options.$container && options.$container.length) {
            options.$container.removeAttr('tabindex');
        }
        $(document).off(eventName);
    }
};
theme.Images = (function() {
    function preload(images, size) {
        if (typeof images === 'string') {
            images = [images];
        }
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            this.loadImage(this.getSizedImageUrl(image, size));
        }
    }

    function loadImage(path) {
        new Image().src = path;
    }

    function switchImage(image, element, callback) {
        var size = this.imageSize(element.src);
        var imageUrl = this.getSizedImageUrl(image.src, size);
        if (callback) {
            callback(imageUrl, image, element);
        } else {
            element.src = imageUrl;
        }
    }

    function imageSize(src) {
        var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\\.@]/);
        if (match !== null) {
            if (match[2] !== undefined) {
                return match[1] + match[2];
            } else {
                return match[1];
            }
        } else {
            return null;
        }
    }

    function getSizedImageUrl(src, size) {
        if (size === null) {
            return src;
        }
        if (size === 'master') {
            return this.removeProtocol(src);
        }
        var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
        if (match !== null) {
            var prefix = src.split(match[0]);
            var suffix = match[0];
            return this.removeProtocol(prefix[0] + '_' + size + suffix);
        }
        return null;
    }

    function removeProtocol(path) {
        return path.replace(/http(s)?:/, '');
    }
    return {
        preload: preload,
        loadImage: loadImage,
        switchImage: switchImage,
        imageSize: imageSize,
        getSizedImageUrl: getSizedImageUrl,
        removeProtocol: removeProtocol
    };
})();
theme.Currency = (function() {
    var moneyFormat = '${{amount}}';

    function formatMoney(cents, format) {
        if (typeof cents === 'string') {
            cents = cents.replace('.', '');
        }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = format || moneyFormat;

        function formatWithDelimiters(number, precision, thousands, decimal) {
            thousands = thousands || ',';
            decimal = decimal || '.';
            if (isNaN(number) || number === null) {
                return 0;
            }
            number = (number / 100.0).toFixed(precision);
            var parts = number.split('.');
            var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
            var centsAmount = parts[1] ? decimal + parts[1] : '';
            return dollarsAmount + centsAmount;
        }
        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
            case 'amount_no_decimals_with_space_separator':
                value = formatWithDelimiters(cents, 0, ' ');
                break;
        }
        return formatString.replace(placeholderRegex, value);
    }
    return {
        formatMoney: formatMoney
    };
})();
slate.Variants = (function() {
    function Variants(options) {
        this.$container = options.$container;
        this.product = options.product;
        this.singleOptionSelector = options.singleOptionSelector;
        this.originalSelectorId = options.originalSelectorId;
        this.enableHistoryState = options.enableHistoryState;
        this.currentVariant = this._getVariantFromOptions();
        $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
    }
    Variants.prototype = _.assignIn({}, Variants.prototype, {
        _getCurrentOptions: function() {
            var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
                var $element = $(element);
                var type = $element.attr('type');
                var currentOption = {};
                if (type === 'radio' || type === 'checkbox') {
                    if ($element[0].checked) {
                        currentOption.value = $element.val();
                        currentOption.index = $element.data('index');
                        return currentOption;
                    } else {
                        return false;
                    }
                } else {
                    currentOption.value = $element.val();
                    currentOption.index = $element.data('index');
                    return currentOption;
                }
            });
            currentOptions = _.compact(currentOptions);
            return currentOptions;
        },
        _getVariantFromOptions: function() {
            var selectedValues = this._getCurrentOptions();
            var variants = this.product.variants;
            var found = _.find(variants, function(variant) {
                return selectedValues.every(function(values) {
                    return _.isEqual(variant[values.index], values.value);
                });
            });
            return found;
        },
        _onSelectChange: function() {
            var variant = this._getVariantFromOptions();
            this.$container.trigger({
                type: 'variantChange',
                variant: variant
            });
            if (!variant) {
                return;
            }
            this._updateMasterSelect(variant);
            this._updateImages(variant);
            this._updatePrice(variant);
            this._updateSKU(variant);
            this.currentVariant = variant;
            if (this.enableHistoryState) {
                this._updateHistoryState(variant);
            }
        },
        _updateImages: function(variant) {
            var variantImage = variant.featured_image || {};
            var currentVariantImage = this.currentVariant.featured_image || {};
            if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
                return;
            }
            this.$container.trigger({
                type: 'variantImageChange',
                variant: variant
            });
        },
        _updatePrice: function(variant) {
            if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
                return;
            }
            this.$container.trigger({
                type: 'variantPriceChange',
                variant: variant
            });
        },
        _updateSKU: function(variant) {
            if (variant.sku === this.currentVariant.sku) {
                return;
            }
            this.$container.trigger({
                type: 'variantSKUChange',
                variant: variant
            });
        },
        _updateHistoryState: function(variant) {
            if (!history.replaceState || !variant) {
                return;
            }
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
            window.history.replaceState({
                path: newurl
            }, '', newurl);
        },
        _updateMasterSelect: function(variant) {
            $(this.originalSelectorId, this.$container).val(variant.id);
        }
    });
    return Variants;
})();
theme.Drawers = (function() {
    function Drawer(id, position, options) {
        var defaults = {
            close: '.js-drawer-close',
            open: '.js-drawer-open-' + position,
            openClass: 'js-drawer-open',
            dirOpenClass: 'js-drawer-open-' + position
        };
        this.nodes = {
            $parent: $('html').add('body'),
            $page: $('#PageContainer')
        };
        this.config = $.extend(defaults, options);
        this.position = position;
        this.$drawer = $('#' + id);
        if (!this.$drawer.length) {
            return false;
        }
        this.drawerIsOpen = false;
        this.init();
    }
    Drawer.prototype.init = function() {
        $(this.config.open).on('click', $.proxy(this.open, this));
        this.$drawer.on('click', this.config.close, $.proxy(this.close, this));
    };
    Drawer.prototype.open = function(evt) {
        var externalCall = false;
        if (evt) {
            evt.preventDefault();
        } else {
            externalCall = true;
        }
        if (evt && evt.stopPropagation) {
            evt.stopPropagation();
            this.$activeSource = $(evt.currentTarget);
        }
        if (this.drawerIsOpen && !externalCall) {
            return this.close();
        }
        this.$drawer.prepareTransition();
        this.nodes.$parent.addClass(this.config.openClass + ' ' + this.config.dirOpenClass);
        this.drawerIsOpen = true;
        slate.a11y.trapFocus({
            $container: this.$drawer,
            namespace: 'drawer_focus'
        });
        if (this.config.onDrawerOpen && typeof this.config.onDrawerOpen === 'function') {
            if (!externalCall) {
                this.config.onDrawerOpen();
            }
        }
        if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
            this.$activeSource.attr('aria-expanded', 'true');
        }
        this.bindEvents();
        return this;
    };
    Drawer.prototype.close = function() {
        if (!this.drawerIsOpen) {
            return;
        }
        $(document.activeElement).trigger('blur');
        this.$drawer.prepareTransition();
        this.nodes.$parent.removeClass(this.config.dirOpenClass + ' ' + this.config.openClass);
        this.drawerIsOpen = false;
        slate.a11y.removeTrapFocus({
            $container: this.$drawer,
            namespace: 'drawer_focus'
        });
        this.unbindEvents();
    };
    Drawer.prototype.bindEvents = function() {
        this.nodes.$parent.on('keyup.drawer', $.proxy(function(evt) {
            if (evt.keyCode === 27) {
                this.close();
                return false;
            } else {
                return true;
            }
        }, this));
        this.nodes.$page.on('touchmove.drawer', function() {
            return false;
        });
        this.nodes.$page.on('click.drawer', $.proxy(function() {
            this.close();
            return false;
        }, this));
    };
    Drawer.prototype.unbindEvents = function() {
        this.nodes.$page.off('.drawer');
        this.nodes.$parent.off('.drawer');
    };
    return Drawer;
})();
window.theme = window.theme || {};
theme.Header = (function() {
    var selectors = {
        body: 'body',
        navigation: '#AccessibleNav',
        siteNavHasDropdown: '.site-nav--has-dropdown',
        siteNavChildLinks: '.site-nav__child-link',
        siteNavActiveDropdown: '.site-nav--active-dropdown',
        siteNavLinkMain: '.site-nav__link--main',
        siteNavChildLink: '.site-nav__link--last'
    };
    var config = {
        activeClass: 'site-nav--active-dropdown',
        childLinkClass: 'site-nav__child-link'
    };
    var cache = {};

    function init() {
        cacheSelectors();
        cache.$parents.on('click.siteNav', function(evt) {
            var $el = $(this);
            if (!$el.hasClass(config.activeClass)) {
                // evt.preventDefault();
                evt.stopImmediatePropagation();
            }
            showDropdown($el);
        });
        $(selectors.siteNavChildLink).on('focusout.siteNav', function() {
            setTimeout(function() {
                if ($(document.activeElement).hasClass(config.childLinkClass) || !cache.$activeDropdown.length) {
                    return;
                }
                hideDropdown(cache.$activeDropdown);
            });
        });
        cache.$topLevel.on('focus.siteNav', function() {
            if (cache.$activeDropdown.length) {
                hideDropdown(cache.$activeDropdown);
            }
        });
        cache.$subMenuLinks.on('click.siteNav', function(evt) {
            evt.stopImmediatePropagation();
        });
    }

    function cacheSelectors() {
        cache = {
            $nav: $(selectors.navigation),
            $topLevel: $(selectors.siteNavLinkMain),
            $parents: $(selectors.navigation).find(selectors.siteNavHasDropdown),
            $subMenuLinks: $(selectors.siteNavChildLinks),
            $activeDropdown: $(selectors.siteNavActiveDropdown)
        };
    }

    function showDropdown($el) {
        $el.addClass(config.activeClass);
        if (cache.$activeDropdown.length) {
            hideDropdown(cache.$activeDropdown);
        }
        cache.$activeDropdown = $el;
        $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'true');
        setTimeout(function() {
            $(window).on('keyup.siteNav', function(evt) {
                if (evt.keyCode === 27) {
                    hideDropdown($el);
                }
            });
            $(selectors.body).on('click.siteNav', function() {
                hideDropdown($el);
            });
        }, 250);
    }

    function hideDropdown($el) {
        $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'false');
        $el.removeClass(config.activeClass);
        cache.$activeDropdown = $(selectors.siteNavActiveDropdown);
        $(selectors.body).off('click.siteNav');
        $(window).off('keyup.siteNav');
    }

    function unload() {
        $(window).off('.siteNav');
        cache.$parents.off('.siteNav');
        cache.$subMenuLinks.off('.siteNav');
        cache.$topLevel.off('.siteNav');
        $(selectors.siteNavChildLink).off('.siteNav');
        $(selectors.body).off('.siteNav');
    }
    return {
        init: init,
        unload: unload
    };
})();
window.theme = window.theme || {};
theme.MobileNav = (function() {
    var classes = {
        mobileNavOpenIcon: 'mobile-nav--open',
        mobileNavCloseIcon: 'mobile-nav--close',
        navLinkWrapper: 'mobile-nav__item',
        navLink: 'mobile-nav__link',
        subNavLink: 'mobile-nav__sublist-link',
        return: 'mobile-nav__return-btn',
        subNavActive: 'is-active',
        subNavClosing: 'is-closing',
        navOpen: 'js-menu--is-open',
        subNavShowing: 'sub-nav--is-open',
        thirdNavShowing: 'third-nav--is-open',
        subNavToggleBtn: 'js-toggle-submenu'
    };
    var cache = {};
    var isTransitioning;
    var $activeSubNav;
    var $activeTrigger;
    var menuLevel = 1;
    var mediaQuerySmall = 'screen and (max-width: 749px)';

    function init() {
        cacheSelectors();
        cache.$mobileNavToggle.on('click', toggleMobileNav);
        cache.$subNavToggleBtn.on('click.subNav', toggleSubNav);
        enquire.register(mediaQuerySmall, {
            unmatch: function() {
                closeMobileNav();
            }
        });
    }

    function toggleMobileNav() {
        if (cache.$mobileNavToggle.hasClass(classes.mobileNavCloseIcon)) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    function cacheSelectors() {
        cache = {
            $pageContainer: $('#PageContainer'),
            $siteHeader: $('.site-header'),
            $mobileNavToggle: $('.js-mobile-nav-toggle'),
            $mobileNavContainer: $('.mobile-nav-wrapper'),
            $mobileNav: $('#MobileNav'),
            $sectionHeader: $('#shopify-section-header'),
            $subNavToggleBtn: $('.' + classes.subNavToggleBtn)
        };
    }

    function openMobileNav() {
        var translateHeaderHeight = cache.$siteHeader.outerHeight() + cache.$siteHeader.position().top;
        cache.$mobileNavContainer.prepareTransition().addClass(classes.navOpen);
        cache.$mobileNavContainer.css({
            transform: 'translateY(' + translateHeaderHeight + 'px)'
        });
        cache.$pageContainer.css({
            transform: 'translate3d(0, ' + cache.$mobileNavContainer[0].scrollHeight + 'px, 0)'
        });
        slate.a11y.trapFocus({
            $container: cache.$sectionHeader,
            $elementToFocus: cache.$mobileNav.find('.' + classes.navLinkWrapper + ':first').find('.' + classes.navLink),
            namespace: 'navFocus'
        });
        cache.$mobileNavToggle.addClass(classes.mobileNavCloseIcon).removeClass(classes.mobileNavOpenIcon);
        $(window).on('keyup.mobileNav', function(evt) {
            if (evt.which === 27) {
                closeMobileNav();
            }
        });
    }

    function closeMobileNav() {
        cache.$mobileNavContainer.prepareTransition().removeClass(classes.navOpen);
        cache.$mobileNavContainer.css({
            transform: 'translateY(-100%)'
        });
        cache.$pageContainer.removeAttr('style');
        cache.$mobileNavContainer.one('TransitionEnd.navToggle webkitTransitionEnd.navToggle transitionend.navToggle oTransitionEnd.navToggle', function() {
            slate.a11y.removeTrapFocus({
                $container: cache.$mobileNav,
                namespace: 'navFocus'
            });
        });
        cache.$mobileNavToggle.addClass(classes.mobileNavOpenIcon).removeClass(classes.mobileNavCloseIcon);
        $(window).off('keyup.mobileNav');
    }

    function toggleSubNav(evt) {
        if (isTransitioning) {
            return;
        }
        var $toggleBtn = $(evt.currentTarget);
        var isReturn = $toggleBtn.hasClass(classes.return);
        isTransitioning = true;
        if (isReturn) {
            $('.' + classes.subNavToggleBtn + '[data-level="' + (menuLevel - 1) + '"]').removeClass(classes.subNavActive);
            if ($activeTrigger && $activeTrigger.length) {
                $activeTrigger.removeClass(classes.subNavActive);
            }
        } else {
            $toggleBtn.addClass(classes.subNavActive);
        }
        $activeTrigger = $toggleBtn;
        goToSubnav($toggleBtn.data('target'));
    }

    function goToSubnav(target) {
        var $targetMenu = target ? $('.mobile-nav__dropdown[data-parent="' + target + '"]') : cache.$mobileNav;
        menuLevel = $targetMenu.data('level') ? $targetMenu.data('level') : 1;
        if ($activeSubNav && $activeSubNav.length) {
            $activeSubNav.prepareTransition().addClass(classes.subNavClosing);
        }
        $activeSubNav = $targetMenu;
        var $elementToFocus = target ? $targetMenu.find('.' + classes.subNavLink + ':first') : $activeTrigger;
        var translateMenuHeight = $targetMenu.outerHeight();
        var openNavClass = menuLevel > 2 ? classes.thirdNavShowing : classes.subNavShowing;
        cache.$mobileNavContainer.css('height', translateMenuHeight).removeClass(classes.thirdNavShowing).addClass(openNavClass);
        if (!target) {
            cache.$mobileNavContainer.removeClass(classes.thirdNavShowing).removeClass(classes.subNavShowing);
        }
        cache.$mobileNavContainer.one('TransitionEnd.subnavToggle webkitTransitionEnd.subnavToggle transitionend.subnavToggle oTransitionEnd.subnavToggle', function() {
            slate.a11y.trapFocus({
                $container: $targetMenu,
                $elementToFocus: $elementToFocus,
                namespace: 'subNavFocus'
            });
            cache.$mobileNavContainer.off('.subnavToggle');
            isTransitioning = false;
        });
        cache.$pageContainer.css({
            transform: 'translateY(' + translateMenuHeight + 'px)'
        });
        $activeSubNav.removeClass(classes.subNavClosing);
    }
    return {
        init: init,
        closeMobileNav: closeMobileNav
    };
})(jQuery);
window.theme = window.theme || {};
theme.Search = (function() {
    var selectors = {
        search: '.search',
        searchSubmit: '.search__submit',
        searchInput: '.search__input',
        siteHeader: '.site-header',
        siteHeaderSearchToggle: '.site-header__search-toggle',
        siteHeaderSearch: '.site-header__search',
        searchDrawer: '.search-bar',
        searchDrawerInput: '.search-bar__input',
        searchHeader: '.search-header',
        searchHeaderInput: '.search-header__input',
        searchHeaderSubmit: '.search-header__submit',
        mobileNavWrapper: '.mobile-nav-wrapper'
    };
    var classes = {
        focus: 'search--focus',
        mobileNavIsOpen: 'js-menu--is-open'
    };

    function init() {
        if (!$(selectors.siteHeader).length) {
            return;
        }
        initDrawer();
        searchSubmit();
        $(selectors.searchHeaderInput).add(selectors.searchHeaderSubmit).on('focus blur', function() {
            $(selectors.searchHeader).toggleClass(classes.focus);
        });
        $(selectors.siteHeaderSearchToggle).on('click', function() {
            var searchHeight = $(selectors.siteHeader).outerHeight();
            var searchOffset = $(selectors.siteHeader).offset().top - searchHeight;
            $(selectors.searchDrawer).css({
                height: searchHeight + 'px',
                top: searchOffset + 'px'
            });
        });
    }

    function initDrawer() {
        $('#PageContainer').addClass('drawer-page-content');
        $('.js-drawer-open-top').attr('aria-controls', 'SearchDrawer').attr('aria-expanded', 'false');
        theme.SearchDrawer = new theme.Drawers('SearchDrawer', 'top', {
            onDrawerOpen: searchDrawerFocus
        });
    }

    function searchDrawerFocus() {
        searchFocus($(selectors.searchDrawerInput));
        if ($(selectors.mobileNavWrapper).hasClass(classes.mobileNavIsOpen)) {
            theme.MobileNav.closeMobileNav();
        }
    }

    function searchFocus($el) {
        $el.focus();
        $el[0].setSelectionRange(0, $el[0].value.length);
    }

    function searchSubmit() {
        $(selectors.searchSubmit).on('click', function(evt) {
            var $el = $(evt.target);
            var $input = $el.parents(selectors.search).find(selectors.searchInput);
            if ($input.val().length === 0) {
                evt.preventDefault();
                searchFocus($input);
            }
        });
    }
    return {
        init: init
    };
})();
(function() {
    var selectors = {
        backButton: '.return-link'
    };
    var $backButton = $(selectors.backButton);
    if (!document.referrer || !$backButton.length || !window.history.length) {
        return;
    }
    $backButton.one('click', function(evt) {
        evt.preventDefault();
        var referrerDomain = urlDomain(document.referrer);
        var shopDomain = urlDomain(window.location.href);
        if (shopDomain === referrerDomain) {
            history.back();
        }
        return false;
    });

    function urlDomain(url) {
        var anchor = document.createElement('a');
        anchor.ref = url;
        return anchor.hostname;
    }
})();
(function() {
    var $filterBy = $('#BlogTagFilter');
    if (!$filterBy.length) {
        return;
    }
    $filterBy.on('change', function() {
        location.href = $(this).val();
    });
})();
window.theme = theme || {};
// RecoverPassword Page Login
theme.customerTemplates = (function() {
    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /* Show/Hide recover password form */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /* Show reset password success message */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
          return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /* Show/hide customer address forms */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
          return;
        }

        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify) {
            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(
                'AddressCountryNew',
                'AddressProvinceNew',
                {
                  hideElement: 'AddressProvinceContainerNew'
                }
            );
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function() {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });

        // Toggle new/edit address forms
        $('.address-new-toggle').on('click', function() {
            $newAddressForm.toggleClass('hide');
        });

        $('.address-edit-toggle').on('click', function() {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function() {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (
                confirm(
                    confirmMessage || 'Are you sure you wish to delete this address?'
                )
            ) {
                Shopify.postLink('/account/addresses/' + formId, {
                    parameters: { _method: 'delete' }
                });
            }
        });
    }

    /* Check URL for reset password hash */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
          toggleRecoverPasswordForm();
        }
    }

    return {
        init: function() {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();
// RecoverPassword Popup Index
theme.customerloginTemplates = (function() {
    function initEventsListeners() {
        // Show reset password form
        $('#RecoversPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordFormIndex();
        });

        // Hide reset password form
        $('#HideRecoverPasswordIndex').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordFormIndex();
        });
    }

    /* Show/Hide recover password form */
    function toggleRecoverPasswordFormIndex() {
        $('#RecoverPasswordFormIndex').toggleClass('hide');
        $('#CustomerAccountForm .block-form-login').toggleClass('hide');
    }

    return {
        init: function() {
            initEventsListeners();
        }
    };
})();
window.theme = window.theme || {};
theme.Cart = (function() {
    var selectors = {
        edit: '.js-edit-toggle'
    };
    var config = {
        showClass: 'cart__update--show',
        showEditClass: 'cart__edit--active',
        cartNoCookies: 'cart--no-cookies'
    };

    function Cart(container) {
        this.$container = $(container);
        this.$edit = $(selectors.edit, this.$container);
        if (!this.cookiesEnabled()) {
            this.$container.addClass(config.cartNoCookies);
        }
        this.$edit.on('click', this._onEditClick.bind(this));
    }
    Cart.prototype = _.assignIn({}, Cart.prototype, {
        onUnload: function() {
            this.$edit.off('click', this._onEditClick);
        },
        _onEditClick: function(evt) {
            var $evtTarget = $(evt.target);
            var $updateLine = $('.' + $evtTarget.data('target'));
            $evtTarget.toggleClass(config.showEditClass);
            $updateLine.toggleClass(config.showClass);
        },
        cookiesEnabled: function() {
            var cookieEnabled = navigator.cookieEnabled;
            if (!cookieEnabled) {
                document.cookie = 'testcookie';
                cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
            }
            return cookieEnabled;
        }
    });
    return Cart;
})();
window.theme = window.theme || {};
theme.Filters = (function() {
    var constants = {
        SORT_BY: 'sort_by'
    };
    var selectors = {
        filterSelection: '#SortTags',
        sortSelection: '#SortBy',
        defaultSort: '#DefaultSortBy'
    };

    function Filters(container) {
        var $container = (this.$container = $(container));
        this.$filterSelect = $(selectors.filterSelection, $container);
        this.$sortSelect = $(selectors.sortSelection, $container);
        this.$selects = $(selectors.filterSelection, $container).add($(selectors.sortSelection, $container));
        this.defaultSort = this._getDefaultSortValue();
        this._resizeSelect(this.$selects);
        this.$selects.removeClass('hidden');
        this.$filterSelect.on('change', this._onFilterChange.bind(this));
        this.$sortSelect.on('change', this._onSortChange.bind(this));
    }
    Filters.prototype = _.assignIn({}, Filters.prototype, {
        _onSortChange: function(evt) {
            var sort = this._sortValue();
            if (sort.length) {
                window.location.search = sort;
            } else {
                window.location.href = window.location.href.replace(window.location.search, '');
            }
            this._resizeSelect($(evt.target));
        },
        _onFilterChange: function(evt) {
            var filter = this._getFilterValue();
            var search = document.location.search.replace(/\?(page=\w+)?&?/, '');
            if (Shopify.designMode) {
                if (search.match('sort_by')) {
                    search = search.substring(search.indexOf('sort_by'));
                } else {
                    search = '';
                }
            }
            if (search.match(constants.SORT_BY)) {
                search = '?' + search;
            }
            document.location.href = filter + search;
            this._resizeSelect($(evt.target));
        },
        _getFilterValue: function() {
            return this.$filterSelect.val();
        },
        _getSortValue: function() {
            return this.$sortSelect.val() || this.defaultSort;
        },
        _getDefaultSortValue: function() {
            return $(selectors.defaultSort, this.$container).val();
        },
        _sortValue: function() {
            var sort = this._getSortValue();
            var query = '';
            if (sort !== this.defaultSort) {
                query = constants.SORT_BY + '=' + sort;
            }
            return query;
        },
        _resizeSelect: function($selection) {
            $selection.each(function() {
                var $this = $(this);
                var arrowWidth = 10;
                var text = $this.find('option:selected').text();
                var $test = $('<span>').html(text);
                $test.appendTo('body');
                var width = $test.width();
                $test.remove();
                $this.width(width + arrowWidth);
            });
        },
        onUnload: function() {
            this.$filterSelect.off('change', this._onFilterChange);
            this.$sortSelect.off('change', this._onSortChange);
        }
    });
    return Filters;
})();
window.theme = window.theme || {};
theme.HeaderSection = (function() {
    function Header() {
        theme.Header.init();
        theme.MobileNav.init();
        theme.Search.init();
    }
    Header.prototype = _.assignIn({}, Header.prototype, {
        onUnload: function() {
            theme.Header.unload();
        }
    });
    return Header;
})();
theme.Maps = (function() {
    var config = {
        zoom: 14
    };
    var apiStatus = null;
    var mapsToLoad = [];
    var errors = {
        addressNoResults: theme.strings.addressNoResults,
        addressQueryLimit: theme.strings.addressQueryLimit,
        addressError: theme.strings.addressError,
        authError: theme.strings.authError
    };
    var selectors = {
        section: '[data-section-type="map"]',
        map: '[data-map]',
        mapOverlay: '[data-map-overlay]'
    };
    var classes = {
        mapError: 'map-section--load-error',
        errorMsg: 'map-section__error errors text-center'
    };
    window.gm_authFailure = function() {
        if (!Shopify.designMode) {
            return;
        }
        $(selectors.section).addClass(classes.mapError);
        $(selectors.map).remove();
        $(selectors.mapOverlay).after('<div class="' + classes.errorMsg + '">' + theme.strings.authError + '</div>');
    };

    function Map(container) {
        this.$container = $(container);
        this.$map = this.$container.find(selectors.map);
        this.key = this.$map.data('api-key');
        if (typeof this.key === 'undefined') {
            return;
        }
        if (apiStatus === 'loaded') {
            this.createMap();
        } else {
            mapsToLoad.push(this);
            if (apiStatus !== 'loading') {
                apiStatus = 'loading';
                if (typeof window.google === 'undefined') {
                    $.getScript('https://maps.googleapis.com/maps/api/js?key=' + this.key).then(function() {
                        apiStatus = 'loaded';
                        initAllMaps();
                    });
                }
            }
        }
    }

    function initAllMaps() {
        $.each(mapsToLoad, function(index, instance) {
            instance.createMap();
        });
    }

    function geolocate($map) {
        var deferred = $.Deferred();
        var geocoder = new google.maps.Geocoder();
        var address = $map.data('address-setting');
        geocoder.geocode({
            address: address
        }, function(results, status) {
            if (status !== google.maps.GeocoderStatus.OK) {
                deferred.reject(status);
            }
            deferred.resolve(results);
        });
        return deferred;
    }
    Map.prototype = _.assignIn({}, Map.prototype, {
        createMap: function() {
            var $map = this.$map;
            return geolocate($map).then(function(results) {
                var mapOptions = {
                    zoom: config.zoom,
                    center: results[0].geometry.location,
                    draggable: true,
                    gestureHandling: 'cooperative',
                    styles: [{
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#f5f5f5"
                        }]
                    }, {
                        "elementType": "labels.icon",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#616161"
                        }]
                    }, {
                        "elementType": "labels.text.stroke",
                        "stylers": [{
                            "color": "#f5f5f5"
                        }]
                    }, {
                        "featureType": "administrative.land_parcel",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#bdbdbd"
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#eeeeee"
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#757575"
                        }]
                    }, {
                        "featureType": "poi.park",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#e5e5e5"
                        }]
                    }, {
                        "featureType": "poi.park",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#9e9e9e"
                        }]
                    }, {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#ffffff"
                        }]
                    }, {
                        "featureType": "road.arterial",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#757575"
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#dadada"
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#616161"
                        }]
                    }, {
                        "featureType": "road.local",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#9e9e9e"
                        }]
                    }, {
                        "featureType": "transit.line",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#e5e5e5"
                        }]
                    }, {
                        "featureType": "transit.station",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#eeeeee"
                        }]
                    }, {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#ededed"
                        }]
                    }, {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#ededed"
                        }]
                    }]
                };
                var map = (this.map = new google.maps.Map($map[0], mapOptions));
                var center = (this.center = map.getCenter());
                var marker = new google.maps.Marker({
                    map: map,
                    position: map.getCenter()
                });
                google.maps.event.addDomListener(window, 'resize', $.debounce(250, function() {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(center);
                    $map.removeAttr('style');
                }));
            }.bind(this)).fail(function() {
                var errorMessage;
                switch (status) {
                    case 'ZERO_RESULTS':
                        errorMessage = errors.addressNoResults;
                        break;
                    case 'OVER_QUERY_LIMIT':
                        errorMessage = errors.addressQueryLimit;
                        break;
                    case 'REQUEST_DENIED':
                        errorMessage = errors.authError;
                        break;
                    default:
                        errorMessage = errors.addressError;
                        break;
                }
                if (Shopify.designMode) {
                    $map.parent().addClass(classes.mapError).html('<div class="' + classes.errorMsg + '">' + errorMessage + '</div>');
                }
            });
        },
        onUnload: function() {
            if (this.$map.length === 0) {
                return;
            }
            google.maps.event.clearListeners(this.map, 'resize');
        }
    });
    return Map;
})();
theme.Product = (function() {
    function Product(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        this.settings = {
            mediaQueryMediumUp: 'screen and (min-width: 750px)',
            mediaQuerySmall: 'screen and (max-width: 749px)',
            bpSmall: false,
            enableHistoryState: $container.data('enable-history-state') || false,
            namespace: '.slideshow-' + sectionId,
            sectionId: sectionId,
            sliderActive: false,
            zoomEnabled: false
        };
        this.selectors = {
            addToCart: '#AddToCart-' + sectionId,
            addToCartText: '#AddToCartText-' + sectionId,
            comparePrice: '#ComparePrice-' + sectionId,
            originalPrice: '#ProductPrice-' + sectionId,
            SKU: '.variant-sku',
            originalPriceWrapper: '.product-price__price-' + sectionId,
            originalSelectorId: '#ProductSelect-' + sectionId,
            productImageWraps: '.product-single__photo',
            productPrices: '.product-single__price-' + sectionId,
            productThumbImages: '.product-single__thumbnail--' + sectionId,
            productThumbs: '.product-single__thumbnails-' + sectionId,
            saleClasses: 'product-price__sale product-price__sale--single',
            saleLabel: '.product-price__sale-label-' + sectionId,
            singleOptionSelector: '.single-option-selector-' + sectionId
        };
        if (!$('#ProductJson-' + sectionId).html()) {
            return;
        }
        this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);
        this.settings.zoomEnabled = $(this.selectors.productImageWraps).hasClass('js-zoom-enabled');
        this._initBreakpoints();
        this._stringOverrides();
        this._initVariants();
        this._initImageSwitch();
        this._setActiveThumbnail();
    }
    Product.prototype = _.assignIn({}, Product.prototype, {
        _stringOverrides: function() {
            theme.productStrings = theme.productStrings || {};
            $.extend(theme.strings, theme.productStrings);
        },
        _initBreakpoints: function() {
            var self = this;
            enquire.register(this.settings.mediaQuerySmall, {
                match: function() {
                    if ($(self.selectors.productThumbImages).length > 3) {
                        self._initThumbnailSlider();
                    }
                    if (self.settings.zoomEnabled) {
                        $(self.selectors.productImageWraps).each(function() {
                            _destroyZoom(this);
                        });
                    }
                    self.settings.bpSmall = true;
                },
                unmatch: function() {
                    if (self.settings.sliderActive) {
                        self._destroyThumbnailSlider();
                    }
                    self.settings.bpSmall = false;
                }
            });
            enquire.register(this.settings.mediaQueryMediumUp, {
                match: function() {
                    if (self.settings.zoomEnabled) {
                        $(self.selectors.productImageWraps).each(function() {
                            _enableZoom(this);
                        });
                    }
                }
            });
        },
        _initVariants: function() {
            var options = {
                $container: this.$container,
                enableHistoryState: this.$container.data('enable-history-state') || false,
                singleOptionSelector: this.selectors.singleOptionSelector,
                originalSelectorId: this.selectors.originalSelectorId,
                product: this.productSingleObject
            };
            this.variants = new slate.Variants(options);
            this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
            this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
            this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
            this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
        },
        _initImageSwitch: function() {
            if (!$(this.selectors.productThumbImages).length) {
                return;
            }
            var self = this;
            $(this.selectors.productThumbImages).on('click', function(evt) {
                evt.preventDefault();
                var $el = $(this);
                var imageId = $el.data('thumbnail-id');
                self._switchImage(imageId);
                self._setActiveThumbnail(imageId);
            });
        },
        _setActiveThumbnail: function(imageId) {
            var activeClass = 'active-thumb';
            if (typeof imageId === 'undefined') {
                imageId = $(this.selectors.productImageWraps + ":not('.hide')").data('image-id');
            }
            var $thumbnail = $(this.selectors.productThumbImages + "[data-thumbnail-id='" + imageId + "']");
            $(this.selectors.productThumbImages).removeClass(activeClass);
            $thumbnail.addClass(activeClass);
        },
        _switchImage: function(imageId) {
            var $newImage = $(this.selectors.productImageWraps + "[data-image-id='" + imageId + "']", this.$container);
            var $otherImages = $(this.selectors.productImageWraps + ":not([data-image-id='" + imageId + "'])", this.$container);
            $newImage.removeClass('hide');
            $otherImages.addClass('hide');
        },
        _initThumbnailSlider: function() {
            var options = {
                slidesToShow: 4,
                slidesToScroll: 3,
                infinite: false,
                prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
                nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
                responsive: [{
                    breakpoint: 321,
                    settings: {
                        slidesToShow: 3
                    }
                }]
            };
            $(this.selectors.productThumbs).slick(options);
            this.settings.sliderActive = true;
        },
        _destroyThumbnailSlider: function() {
            $(this.selectors.productThumbs).slick('unslick');
            this.settings.sliderActive = false;
        },
        _updateAddToCart: function(evt) {
            var variant = evt.variant;
            if (variant) {
                $(this.selectors.productPrices).removeClass('visibility-hidden').attr('aria-hidden', 'true');
                if (variant.available) {
                    $(this.selectors.addToCart).prop('disabled', false);
                    $(this.selectors.addToCartText).text(theme.strings.addToCart);
                } else {
                    $(this.selectors.addToCart).prop('disabled', true);
                    $(this.selectors.addToCartText).text(theme.strings.soldOut);
                }
            } else {
                $(this.selectors.addToCart).prop('disabled', true);
                $(this.selectors.addToCartText).text(theme.strings.unavailable);
                $(this.selectors.productPrices).addClass('visibility-hidden').attr('aria-hidden', 'false');
            }
        },
        _updateImages: function(evt) {
            var variant = evt.variant;
            var imageId = variant.featured_image.id;
            this._switchImage(imageId);
            this._setActiveThumbnail(imageId);
        },
        _updatePrice: function(evt) {
            var variant = evt.variant;
            $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
            if (variant.compare_at_price > variant.price) {
                $(this.selectors.comparePrice).html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat)).removeClass('hide');
                $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);
                $(this.selectors.saleLabel).removeClass('hide');
            } else {
                $(this.selectors.comparePrice).addClass('hide');
                $(this.selectors.saleLabel).addClass('hide');
                $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
            }
        },
        _updateSKU: function(evt) {
            var variant = evt.variant;
            $(this.selectors.SKU).html(variant.sku);
        },
        onUnload: function() {
            this.$container.off(this.settings.namespace);
        }
    });

    function _enableZoom(el) {
        var zoomUrl = $(el).data('zoom');
        $(el).zoom({
            url: zoomUrl
        });
    }

    function _destroyZoom(el) {
        $(el).trigger('zoom.destroy');
    }
    return Product;
})();
theme.Nov_Owlcarousel = (function() {
    function Nov_Owlcarousel(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slider = (this.slider = '#shopify-section-' + sectionId + ' .nov-owl-carousel');
        if ($('html').hasClass('lang-rtl'))
            var rtl = true;
        else
            var rtl = false;
        var autoplay = $(slider).data('autoplay'),
            autoplaytimeout = $(slider).data('autoplaytimeout'),
            items = $(slider).data('items'),
            margin = $(slider).data('margin'),
            nav = $(slider).data('nav'),
            dots = $(slider).data('dots'),
            loop = $(slider).data('loop'),
            items_tablet = $(slider).data('items_tablet'),
            items_mobile = $(slider).data('items_mobile'),
            center = $(slider).data('center'),
            start = $(slider).data('start'),
            autowidth = $(slider).data('autowidth');
        $(slider).owlCarousel({
            navText: ['<i class="zmdi zmdi-chevron-left"></i>', '<i class="zmdi zmdi-chevron-right"></i>'],
            lazyLoad: true,
            lazyContent: true,
            loop: loop,
            autoplay: autoplay,
            autoplayTimeout: autoplaytimeout,
            items: items,
            margin: margin,
            rtl: rtl,
            dots: dots,
            nav: nav,
            center: center,
            autoWidth: autowidth,
            responsive: {
                0: {
                    items: items_mobile,
                    loop: true,
                    autoHeight: true,
                    autoWidth: false
                },
                768: {
                    items: items_tablet,
                    autoWidth: false
                },
                1200: {
                    items: items,
                    center: center
                },
            }
        });
    }
    return Nov_Owlcarousel;
})();
theme.Nov_Slickcarousel = (function() {
    function Nov_Slickcarousel(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slider = (this.slider = '#shopify-section-' + sectionId + ' .nov-slick-carousel');
        if ($('html').hasClass('lang-rtl'))
            var rtl = true;
        else
            var rtl = false;
        var autoplay = $(slider).data("autoplay"),
            autoplaytimeout = $(slider).data("autoplaytimeout"),
            infinite = $(slider).data("loop"),
            dots = $(slider).data("dots"),
            nav = $(slider).data("nav"),
            rows = $(slider).data("row"),
            row_mobile = $(slider).data("row_mobile") ? $(slider).data("row_mobile") : 1;
            loop = $(slider).data('loop'),
            fade = $(slider).data("fade"),
            items = $(slider).data("items"),
            items_lg = $(slider).data("items_lg"),
            items_md = $(slider).data("items_md"),
            items_sm = $(slider).data("items_sm"),
            items_xs = $(slider).data("items_xs") ? $(slider).data("items_xs") : 1;
            unslick_xs = $(slider).data("unslick"),
            custnav = $(slider).data("custnav");
        if (typeof custnav!= "undefined" && $(window).width() > 1199) {
          nav = false;
        }
        $(slider).on('init reInit afterChange', function(event, slick, currentSlide) {
          const
            items = $(this).data('items');
            page = Math.ceil(((currentSlide || 0) + 1) / items),
            numPages = Math.ceil(slick.slideCount / items);
            $('.current_nav', '#shopify-section-' + sectionId).text(`${page}`);
            $('.total_nav', '#shopify-section-' + sectionId).text(`${numPages}`);
        });

        $(slider).slick({
            nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right" aria-hidden="true"></i></div>',
            prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left" aria-hidden="true"></i></i></div>',
            rtl: rtl,
            slidesToShow: items,
            slidesToScroll: items,
            rows: rows,
            arrows: nav,
            dots: dots,
            infinite: infinite,
            fade: fade,
            autoplay: autoplay,
            autoplaySpeed: autoplaytimeout,
            responsive: [
                {
                    breakpoint: 1920,
                    settings: {
                        slidesToShow: items,
                        slidesToScroll: items
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: items_lg,
                        slidesToScroll: items_lg
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: items_md,
                        slidesToScroll: items_md
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: items_sm,
                        slidesToScroll: items_sm,
                        rows: row_mobile
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: items_xs,
                        slidesToScroll: items_xs,
                        rows: row_mobile
                    }
                }
            ]
        });
        if (typeof custnav != "undefined") {
            $('.prev_custom', '#shopify-section-' + sectionId).click(function(){
               $(slider).slick('slickPrev');
            });
            $('.next_custom', '#shopify-section-' + sectionId).click(function(){
               $(slider).slick('slickNext');
            })
        }
        if ($(window).width() < 576 && unslick_xs == true ) {
            $(slider).slick('unslick');
        }
    }
    return Nov_Slickcarousel;
})();
theme.Nov_SliderShow = (function() {
    function Nov_SliderShow(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slideText = (this.slideText = '#shopify-section-' + sectionId + ' .bl_t_c');
        var slideWrapper = (this.slideWrapper = '#shopify-section-' + sectionId + ' .main-slider'),
            arrows_text = $(slideText).data('arrows'),
            autoplay = $(slideWrapper).data("autoplay"),
            speed = $(slideWrapper).data('speed'),
            arrows = $(slideWrapper).data('arrows'),
            dots = $(slideWrapper).data('dots'),
            iframes = $(slideWrapper).find('.embed-player'),
            lazyImages = $(slideWrapper).find('.slide-image'),
            lazyCounter = 0;
        function postMessageToPlayer(player, command) {
            if (player == null || command == null) return;
            player.contentWindow.postMessage(JSON.stringify(command), "*");
        }

        function resizePlayer(iframes, ratio) {
            if (!iframes[0]) return;
            var win = $(".main-slider"),
                width = win.width(),
                playerWidth, height = win.height(),
                playerHeight, ratio = ratio || 16 / 9;
            iframes.each(function() {
                var current = $(this);
                if (width / ratio < height) {
                    playerWidth = Math.ceil(height * ratio);
                    current.width(playerWidth).height(height).css({
                        left: (width - playerWidth) / 2,
                        top: 0
                    });
                } else {
                    playerHeight = Math.ceil(width / ratio);
                    current.width(width).height(playerHeight).css({
                        left: 0,
                        top: (height - playerHeight) / 2
                    });
                }
            });
        }
        $(function() {
           $(slideText).on("init", function(slick) {
                slick = $(slick.currentTarget);
                resizePlayer(iframes, 16 / 9);
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).addClass(caption);
                });
            });
           $(slideText).on("beforeChange", function(event, slick) {
                slick = $(slick.$slider);
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).removeClass(caption);
                });
            });
           $(slideText).on("afterChange", function(event, slick) {
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).addClass(caption);
                });
                slick = $(slick.$slider);
            });
           $(slideWrapper).on("lazyLoaded", function(event, slick, image, imageSource) {
                lazyCounter++;
                if (lazyCounter === lazyImages.length) {
                    lazyImages.addClass('show');
                }
            });
            if($('html').hasClass('lang-rtl'))
            var rtl = true;
            else
            var rtl = false;

           $(slideWrapper).slick({
                nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right"></i></div>',
                prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left"></i></div>',
                autoplay: autoplay,
                autoplaySpeed: speed,
                lazyLoad: "progressive",
                speed: 600,
                arrows: false,
                dots: false,
                cssEase: "cubic-bezier(0.87, 0.03, 0.41, 0.9)",
                rtl: rtl,
                adaptiveHeight: true,
                asNavFor: slideText
            });
           $(slideText).on('init reInit afterChange', function(event, slick, currentSlide) {
             const
               items = 1;
               page = Math.ceil(((currentSlide || 0) + 1) / 1),
               numPages = Math.ceil(slick.slideCount / 1);
               $('.current_nav', '#shopify-section-' + sectionId).text(`${page}`);
               $('.total_nav', '#shopify-section-' + sectionId).text(`${numPages}`);
           });
           $(slideText).slick({
                infinite: true,
                dots: false,
                arrows: false,
                speed: 600,
                rtl: rtl,
                fade: true,
                asNavFor: slideWrapper,
            });
           if ($(window).width() > 767) {
               $('.prev_custom', '#shopify-section-' + sectionId).click(function(){
                  $(slideText).slick('slickPrev');
               });
               $('.next_custom', '#shopify-section-' + sectionId).click(function(){
                  $(slideText).slick('slickNext');
               })
           }
        });
        $(window).on("resize.slickVideoPlayer", function() {
            resizePlayer(iframes, 16 / 9);
        });
    }
    return Nov_SliderShow;
})();
theme.callbackReview = function() {
    if ($(".shopify-product-reviews-badge").length > 0) {
        return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
    }
}
theme.Quotes = (function() {
    var config = {
        mediaQuerySmall: 'screen and (max-width: 749px)',
        mediaQueryMediumUp: 'screen and (min-width: 750px)',
        slideCount: 0
    };
    var defaults = {
        accessibility: true,
        arrows: false,
        dots: true,
        autoplay: false,
        touchThreshold: 20,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    function Quotes(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var wrapper = (this.wrapper = '.quotes-wrapper');
        var slider = (this.slider = '#Quotes-' + sectionId);
        var $slider = $(slider, wrapper);
        var sliderActive = false;
        var mobileOptions = $.extend({}, defaults, {
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true
        });
        config.slideCount = $slider.data('count');
        if (config.slideCount < defaults.slidesToShow) {
            defaults.slidesToShow = config.slideCount;
            defaults.slidesToScroll = config.slideCount;
        }
        $slider.on('init', this.a11y.bind(this));
        enquire.register(config.mediaQuerySmall, {
            match: function() {
                initSlider($slider, mobileOptions);
            }
        });
        enquire.register(config.mediaQueryMediumUp, {
            match: function() {
                initSlider($slider, defaults);
            }
        });

        function initSlider(sliderObj, args) {
            if (sliderActive) {
                sliderObj.slick('unslick');
                sliderActive = false;
            }
            sliderObj.slick(args);
            sliderActive = true;
        }
    }
    Quotes.prototype = _.assignIn({}, Quotes.prototype, {
        onUnload: function() {
            enquire.unregister(config.mediaQuerySmall);
            enquire.unregister(config.mediaQueryMediumUp);
            $(this.slider, this.wrapper).slick('unslick');
        },
        onBlockSelect: function(evt) {
            var $slide = $('.quotes-slide--' + evt.detail.blockId + ':not(.slick-cloned)');
            var slideIndex = $slide.data('slick-index');
            $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
        },
        a11y: function(event, obj) {
            var $list = obj.$list;
            var $wrapper = $(this.wrapper, this.$container);
            $list.removeAttr('aria-live');
            $wrapper.on('focusin', function(evt) {
                if ($wrapper.has(evt.target).length) {
                    $list.attr('aria-live', 'polite');
                }
            });
            $wrapper.on('focusout', function(evt) {
                if ($wrapper.has(evt.target).length) {
                    $list.removeAttr('aria-live');
                }
            });
        }
    });
    return Quotes;
})();
theme.slideshows = {};
theme.SlideshowSection = (function() {
    function SlideshowSection(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slideshow = (this.slideshow = '#Slideshow-' + sectionId);
        theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
    }
    return SlideshowSection;
})();
theme.SlideshowSection.prototype = _.assignIn({}, theme.SlideshowSection.prototype, {
    onUnload: function() {
        delete theme.slideshows[this.slideshow];
    },
    onBlockSelect: function(evt) {
        var $slideshow = $(this.slideshow);
        var $slide = $('.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)');
        var slideIndex = $slide.data('slick-index');
        $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
    },
    onBlockDeselect: function() {
        $(this.slideshow).slick('slickPlay');
    }
});
$(document).ready(function() {
    var sections = new theme.Sections();
    sections.register('cart-template', theme.Cart);
    sections.register('product', theme.Product);
    sections.register('collection-template', theme.Filters);
    sections.register('product-template', theme.Product);
    sections.register('header-section', theme.HeaderSection);
    sections.register('map', theme.Maps);
    sections.register('slideshow-section', theme.Nov_SliderShow);
    sections.register('nov-owl', theme.Nov_Owlcarousel);
    sections.register('nov-owl-blog', theme.Nov_Owlcarousel);
    sections.register('nov-slick', theme.Nov_Slickcarousel);
});
theme.init = function() {
    theme.customerTemplates.init();
    theme.customerloginTemplates.init();
    var tableSelectors = '.rte table,' + '.custom__item-inner--html table';
    slate.rte.wrapTable({
        $tables: $(tableSelectors),
        tableWrapperClass: 'scrollable-wrapper'
    });
    slate.a11y.pageLinkFocus($(window.location.hash));
    $('.in-page-link').on('click', function(evt) {
        slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
    });
    $('a[href="#"]').on('click', function(evt) {
        evt.preventDefault();
    });
};
$(theme.init);