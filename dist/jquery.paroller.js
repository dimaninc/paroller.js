/**
 * jQuery plugin paroller.js v1.4.4
 * https://github.com/tgomilar/paroller.js
 * preview: https://tgomilar.github.io/paroller/
 **/
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('parollerjs', ['jquery'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(require('jquery'));
    }
    else {
        factory(window.Zepto || window.jQuery || window.$);
    }
})(function ($) {
    'use strict';

    var working = false;
    var scrollAction = function() {
        working = false;
    };

    var setDirection = {
        bgVertical: function (elem, bgOffset) {
            return elem.css({'background-position': 'center ' + -bgOffset + 'px'});
        },
        bgHorizontal: function (elem, bgOffset) {
            return elem.css({'background-position': -bgOffset + 'px' + ' center'});
        },
        vertical: function (elem, elemOffset, oldTransform) {
            (!oldTransform || oldTransform === 'none' ? oldTransform = '' : true);
            return elem.css({
                '-webkit-transform': 'translate3d(0, ' + elemOffset + 'px, 0) ' + oldTransform,
                '-moz-transform': 'translate3d(0, ' + elemOffset + 'px, 0) ' + oldTransform,
                'transform': 'translate3d(0, ' + elemOffset + 'px, 0) ' + oldTransform,
                'transition': 'transform linear',
                'will-change': 'transform'
            });
        },
        horizontal: function (elem, elemOffset, oldTransform) {
            (!oldTransform || oldTransform === 'none' ? oldTransform = '' : true);
            return elem.css({
                '-webkit-transform': 'translate3d(' + elemOffset + 'px, 0, 0) ' + oldTransform,
                '-moz-transform': 'translate3d(' + elemOffset + 'px, 0, 0) ' + oldTransform,
                'transform': 'translate3d(' + elemOffset + 'px, 0, 0) ' + oldTransform,
                'transition': 'transform linear',
                'will-change': 'transform'
            });
        }
    };

    var setMovement = {
        factor: function (elem, width, options) {
            var factor = elem.data('paroller-factor') || options.factor;
            if (width < 576) {
                return elem.data('paroller-factor-xs') || options.factorXs || factor;
            } else if (width <= 768) {
                return elem.data('paroller-factor-sm') || options.factorSm || factor;
            } else if (width <= 1024) {
                return elem.data('paroller-factor-md') || options.factorMd || factor;
            } else if (width <= 1200) {
                return elem.data('paroller-factor-lg') || options.factorLg || factor;
            } else if (width <= 1920) {
                return elem.data('paroller-factor-xl') || options.factorXl || factor;
            } else {
                return factor;
            }
        },
        bgOffset: function (mode, factor, scrollTop, offset) {
            return mode === 'scroll' || true
                ? Math.round((offset - scrollTop) * factor)
                : Math.round(offset * factor);
        },
        transform: function (mode, factor, scrollTop, offset, windowHeight, height) {
            return mode === 'scroll' || true
                ? Math.round(((offset - (windowHeight / 2) + height) - scrollTop) * factor)
                : Math.round((offset - (windowHeight / 2) + height) * factor);
        }
    };

    var clearPositions = {
        background: function (elem) {
            return elem.css({
                'background-position': 'unset'
            });
        },
        foreground: function (elem) {
            return elem.css({
                'transform' : 'unset',
                'transition' : 'unset'
            });
        }
    };

    $.fn.paroller = function (options) {
        // default options
        options = $.extend({
            factor: 0, // - to +
            factorXs: 0, // - to +
            factorSm: 0, // - to +
            factorMd: 0, // - to +
            factorLg: 0, // - to +
            factorXl: 0, // - to +
            type: 'background', // foreground
            direction: 'vertical' // horizontal
        }, options);

        return this.each(function () {
            var $this = $(this);
            var $window = $(window);
            var $document = $(document);
            var $viewport = $($this.data('paroller-viewport') || $this);
            var type = $this.data('paroller-type') || options.type;
            var direction = $this.data('paroller-direction') || options.direction;
            var windowHeight;
            var documentHeight;
            var width;
            var offset;
            var height;
            var factor;
            var bgOffset;
            var transform;
            var scrollTop, scrollBottom;

            var updatePosition = function(mode, force) {
                scrollTop = $window.scrollTop();
                windowHeight = $window.height();
                scrollBottom = scrollTop + windowHeight;
                documentHeight = $document.height();
                width = $window.width();
                offset = $this.offset().top; //$this[0].offsetTop;
                height = $this.outerHeight();
                factor = setMovement.factor($this, width, options);

                var viewportTop = $viewport.offset().top; //$viewport[0].offsetTop;
                var viewportHeight = $viewport.outerHeight();
                var viewportBottom = viewportTop + viewportHeight;

                var isVisible = viewportBottom > scrollTop && viewportTop < scrollBottom;

                if (!isVisible && !force) {
                    return;
                }

                if (!working) {
                    window.requestAnimationFrame(scrollAction);
                    working = true;
                }

                if (type === 'background') {
                    bgOffset = setMovement.bgOffset(mode, factor, offset, scrollTop);
                    mode !== 'scroll' && clearPositions.background($this);
                    if (direction === 'vertical') {
                        setDirection.bgVertical($this, bgOffset);
                    } else if (direction === 'horizontal') {
                        setDirection.bgHorizontal($this, bgOffset);
                    }
                } else if ((type === 'foreground') && (scrollTop <= documentHeight)) {
                    transform = setMovement.transform(mode, factor, scrollTop, offset, windowHeight, height);
                    mode !== 'scroll' && clearPositions.foreground($this);
                    if (direction === 'vertical') {
                        setDirection.vertical($this, transform);
                    } else if (direction === 'horizontal') {
                        setDirection.horizontal($this, transform);
                    }
                }
            };

            $window
                .on('resize.paroller', function () {
                    updatePosition('resize');
                })
                .on('scroll.paroller', function () {
                    updatePosition('scroll');
                });

            updatePosition('scroll', true);
        });
    };
});
