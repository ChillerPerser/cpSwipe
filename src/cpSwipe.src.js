/*!
 * jQuery Swipe Plugin v1.0.0
 * https://github.com/ChillerPerser/cpSwipe
 *
 * Copyright 2016 Christian 'ChillerPerser' Linke
 * Released under the MIT license
 */
;(function ( $, window, document, undefined ) {

    var pluginName = "cpSwipe",
        defaults = {
            mouse: false,                   // mouse events
            horizontal: true,               // enable horizontal swipe
            horizontalThreshold: 40,        // horizontal threshold
            preventDefaultAction: false,    // prevent the default action
            vertical: false,                // enable vertical swipe
            verticalThreshold: 40           // vertical threshold
        },
        browserEventNames = {
            'mouse': {
                'start': 'mousedown',
                'move' : 'mousemove',
                'end'  : 'mouseup'
            },
            'touch': {
                'start': 'touchstart',
                'move' : 'touchmove',
                'end'  : 'touchend'
            },
            'pointer': {
                'IE10': {
                    'start': 'MSPointerDown',
                    'move' : 'MSPointerMove',
                    'end'  : 'MSPointerUp'
                },
                'IE11': {
                    'start': 'pointerdown',
                    'move' : 'pointermove',
                    'end'  : 'pointerup'
                }
            }
        };

    function Plugin(element, options, events) {
        this.element = $(element);
        this._options = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._events = events;
        this._name = pluginName;
        this._isIE = false;

        this._eventActive = false;
        this._startPosition = {             // start position
            x: null,
            y: null
        };
        this._distance = {
            x: null,
            y: null
        };

        this._lastEventToTrigger = null;
        this._inputType = null;             // touch, pointer, mouse

        this._browserEvents = {
            'start': browserEventNames.touch.start,
            'move' : browserEventNames.touch.move,
            'end'  : browserEventNames.touch.end
        };

        // do not bind if no events given
        if (!this._events) {
            return;
        }

        this.init();
    }

    Plugin.prototype = {

        /**
         * check if the event is a mouse event
         * @param {object} event
         * @returns {boolean}
         */
        isMouseEvent: function(event) {

            var eType = event.type;
            return eType == browserEventNames.mouse.start || eType == browserEventNames.mouse.move || eType == browserEventNames.mouse.end;
        },

        /**
         * check if the event is a pointer event
         * @param {object} event
         * @return {boolean}
         */
        isPointerEvent: function(event) {

            var eType = event.type;
            if (eType == browserEventNames.pointer.IE10.start || eType == browserEventNames.pointer.IE10.move || eType == browserEventNames.pointer.IE10.end) {
                return true;
            }
            return (eType == browserEventNames.pointer.IE11.start || eType == browserEventNames.pointer.IE11.move || eType == browserEventNames.pointer.IE11.end);
        },

        /**
         * get event arguments
         * @return {object}
         */
        getEventArgs: function() {

            return {
                'type': this._inputType,
                'distance': this._distance
            };
        },

        /**
         * trigger event
         * @param {function} func
         */
        triggerEvent: function(func) {

            if (typeof func === 'function') {
                var args = this.getEventArgs();
                func.apply(this.element, [args]);
            }
        },

        /**
         * get current position
         * @param {object} event
         */
        getPosition: function(event) {

            var coord = false;

            if (this._isIE) {

                coord = {
                    "pageX": event.clientX + document.body.scrollLeft,
                    "pageY": event.clientY + document.body.scrollTop
                };
            }
            else if (this.isMouseEvent(event)) {

                // mouse event
                coord = {
                    "pageX": event.pageX,
                    "pageY": event.pageY
                };
            }
            else {

                // touch event
                coord = event.touches || event.originalEvent.touches;
                if (coord.length == 1) {
                    coord = coord[0];
                } else {

                    // empty touchlist on touchend, use changedTouches
                    try {
                        coord = event.originalEvent.changedTouches[0];
                    } catch (e) {

                    }
                }
            }

            return coord;
        },

        /**
         * get input type
         * @param {object} event
         * @return {string}
         */
        getInputType: function(event) {

            if (this.isMouseEvent(event)) {
                return 'mouse';
            }
            else if (this.isPointerEvent(event)) {
                return 'pointer';
            }

            return 'touch';
        },

        /**
         * move event handler
         * @param {object} event
         */
        eventMove: function(event) {

            // check for active event
            if (this._eventActive) {

                // get position
                var pos = this.getPosition(event);

                // get current coords
                var x = this._startPosition.x - pos.pageX,
                    y = this._startPosition.y - pos.pageY,
                    preventAction = false;

                if (this._options.vertical && Math.abs(y) >= this._options.verticalThreshold) {
                    preventAction = true;

                    if (y > 0) {
                        this._lastEventToTrigger = this._events.up;
                    } else {
                        this._lastEventToTrigger = this._events.down;
                    }
                } else if (this._options.horizontal && Math.abs(x) >= this._options.horizontalThreshold) {
                    preventAction = true;

                    if (x > 0) {
                        this._lastEventToTrigger = this._events.left;
                    } else {
                        this._lastEventToTrigger = this._events.right;
                    }
                }

                if (this._options.preventDefaultAction && preventAction) {

                    // prevent default action
                    event.preventDefault();
                }
            }

            this.triggerEvent(this._events.move);
        },

        /**
         * end event handler
         */
        eventEnd: function(event) {

            // check for active event
            if (this._eventActive) {

                // get position
                var pos = this.getPosition(event);

                // get input type
                this._inputType = this.getInputType(event);

                // update distance object
                this._distance.x = parseInt((this._startPosition.x - pos.pageX) * -1);
                this._distance.y = parseInt((this._startPosition.y - pos.pageY) * -1);

                // remove events
                this.element.off(this._browserEvents.move);
                this.element.off(this._browserEvents.end);

                // set event active status
                this._eventActive = false;

                // reset start coordinates
                this._startPosition.x = null;
                this._startPosition.y = null;

                // check for event
                if (this._lastEventToTrigger) {

                    // trigger event
                    this.triggerEvent(this._lastEventToTrigger);
                    this._lastEventToTrigger = null;
                }
            }

            this.triggerEvent(this._events.end);
        },

        /**
         * start event handler
         */
        eventStart: function(event) {

            // reset
            this._distance.x = 0;
            this._distance.y = 0;

            // get current input type
            this._inputType = this.getInputType(event);

            // get current position
            var pos = this.getPosition(event);

            if (pos !== false) {

                // get coord
                this._startPosition.x = pos.pageX;
                this._startPosition.y = pos.pageY;

                // event is active
                this._eventActive = true;

                var self = this;

                // bind move and end event
                this.element.on(this._browserEvents.move, function(event) {
                    self.eventMove(event);
                });
                this.element.on(this._browserEvents.end, function(event) {
                    self.eventEnd(event);
                });
            }

            this.triggerEvent(this._events.start);
        },

        /**
         * initialize
         */
        init: function() {

            // enable mouse events
            if (this._options.mouse) {
                this._browserEvents.start += ' ' + browserEventNames.mouse.start;
                this._browserEvents.move  += ' ' + browserEventNames.mouse.move;
                this._browserEvents.end   += ' ' + browserEventNames.mouse.end;
            }

            // check for IE10 pointer events
            if (window.navigator.pointerEnabled) {
                this._browserEvents.start += ' ' + browserEventNames.pointer.IE11.start;
                this._browserEvents.move  += ' ' + browserEventNames.pointer.IE11.move;
                this._browserEvents.end   += ' ' + browserEventNames.pointer.IE11.end;
                this.isIE = true;
            }
            // check for IE11 pointer events
            else if (window.navigator.msPointerEnabled) {
                this._browserEvents.start += ' ' + browserEventNames.pointer.IE10.start;
                this._browserEvents.move  += ' ' + browserEventNames.pointer.IE10.move;
                this._browserEvents.end   += ' ' + browserEventNames.pointer.IE10.end;
                this.isIE = true;
            }

            var self = this;
            this.element.on(this._browserEvents.start, function(event) {
                self.eventStart(event);
            });
        }
    };

    $.fn[pluginName] = function (options, events) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options, events));
            }
        });
    };
})(jQuery, window, document);