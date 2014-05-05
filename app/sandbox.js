(function(define) {

    require([ './require.config' ], function() {
        require([ 'underscore', 'jquery', 'q', 'bootstrap' ], module);
    });

    function module(_, $, Q) {

        function bindPopover(button) {
            var popoverSelector = button.data('popover');
            if (!popoverSelector)
                return;
            var popover = $(popoverSelector);
            var left = popover.hasClass('left');
            function updatePopoverPosition(button, popover) {
                var offset = button.offset();
                if (left) {
                    offset.left -= popover.outerWidth();
                } else {
                    offset.left += button.outerWidth();
                }
                offset.top -= (popover.outerHeight() - button.outerHeight()) / 2;
                var arrow = popover.find('.arrow');
                var arrowTop = offset.top + popover.outerHeight() / 2;
                offset.top = Math.max(offset.top, 0);
                arrowTop -= offset.top;
                arrow.css({
                    top : arrowTop
                });
                popover.css({
                    left : offset.left,
                    top : offset.top,
                    position : 'absolute',
                });
            }

            var index = bindPopover.index = bindPopover.index || {};
            function clearTimer() {
                var timer = index[popoverSelector];
                if (timer) {
                    clearTimeout(timer);
                    delete index[popoverSelector];
                }
            }

            function showPopover() {
                clearTimer();
                popover.show();
            }
            function hidePopover() {
                clearTimer();
                index[popoverSelector] = setTimeout(function() {
                    popover.hide();
                }, 250);
            }
            button.mouseover(function(event) {
                updatePopoverPosition($(event.target), popover);
                showPopover();
                clearEvent(event);
            })
            popover.mouseover(showPopover);
            popover.mouseout(hidePopover);
            button.mouseout(hidePopover);
        }

        function swapPanel(panel) {

        }

        function clearEvent(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        $(function() {

            $('.btn').each(function() {
                var button = $(this);
                bindPopover(button);
                button.click(function(event) {
                    button.parent().toggleClass('active');
                    clearEvent(event);
                });
            });

        })

        function updateSize() {
            var win = $(window);
            var width = win.width();
            var height = win.height();
            $('.full-height').each(function() {
                var e = $(this);
                var top = e.offset().top;
                e.height(height - top);
            })
        }
        // $(window).resize(updateSize);
        // $(updateSize);

        /**
         * Return a promise for the data loaded from the specified URL
         */
        function loadJson(url) {
            var deferred = Q.defer();
            $.get(url, function(data) {
                deferred.resolve(data);
            }).fail(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
})(typeof define === 'function' ? define : require('amdefine')(module));
