/**
 * ZUI ScrollSnapper is a scrollView plugin to replace YUI3 ScrollViewPaginator plugin.
 * It provides same interface and namespace, and better user interaction.
 *
 * @module gallery-zui-scrollsnapper
 */

/**
 * ScrollSnapper is a ScrollView plugin to replace YUI3 ScrollViewPaginator.
 *
 * @class ScrollSnapper
 * @namespace zui 
 * @extends Plugin.Base
 * @constructor
 */
var ScrollSnapper = function () {
        ScrollSnapper.superclass.constructor.apply(this, arguments);
    };

ScrollSnapper.NAME = 'pluginScrollSnapper';
ScrollSnapper.NS = 'pages';
ScrollSnapper.ATTRS = {
    /**
     * CSS selector for a page inside the scrollview. The scrollview
     * will snap to the closest page.
     *
     * @attribute selector
     * @type {String}
     */
    selector: {
        value: null
    },

    /**
     * The active page number for a paged scrollview
     *
     * @attribute index
     * @type {Number}
     * @default 0
     */
    index: {
        value: 0,
        lazyAdd: false,
        setter: function (val) {
            var T = this.get('total'),
                I = this.get('index'),
                V = Math.max(Math.floor(val), 0);

            if (T && (V >= T)) {
                V = T - 1;
            }

            if (this._pages) {
                this.scrollTo(V, (I == V) ? -1 : 0);
            }

            return V;
        }
    },

    /**
     * The total number of pages
     *
     * @attribute total
     * @type {Number}
     * @default 0
     */
    total: {
        value: 0
    }
};

Y.namespace('zui').ScrollSnapper = Y.extend(ScrollSnapper, Y.Plugin.Base, {
    initializer: function () {
        this._host = this.get('host').setAttrs({
     //       deceleration: 0.6,
     //       bounce: 0
        });
        this._vertical = this._host._scrollsVertical;
        this._snapAttr = this._vertical ? 'offsetTop' : 'offsetLeft';
        this._snapRange = this._vertical ? 'offsetHeight' : 'offsetWidth';
        this._snapSource = this._vertical ? 'scrollY' : 'scrollX';
        this.afterHostMethod('_uiDimensionsChange', this._updatePages);
        this.afterHostEvent('render', this._updatePages);
        this.afterHostEvent('scrollEnd', this._scrollEnded);
        this._updatePages();
    },

    /**
     * Update page positions
     *
     * @method _updatePages
     * @protected
     */
    _updatePages: function () {
        var cb = this._host.get('contentBox'),
            S = this.get('selector');

        this._pages = S ? cb.all(S) : cb.get('children');
        this.set('total', this._pages.size());
    },

    /**
     * internal scrollEnd event handler
     *
     * @method _scrollEnded
     * @protected
     */
    _scrollEnded: function (E) {
        if (this._host._flicking) {
            this._snapping = false;
            return;
        }
        if (!this._snapping) {
            this.snapTo(this.snapIndex());
        } else {
            this._snapping = false;
        }
    },

    /**
     * Snap to a page, same as set('index', page)
     *
     * @method snapTo
     * @param page {Number} page index, start from 0
     */
    snapTo: function (page) {
        this.set('index', page);
    },

    /**
     * Scroll to a given page in the scrollview
     *
     * @method scrollTo
     * @param page {Number} page index, start from 0
     * @param duration {Number} The number of ms the animation should last
     * @param easing {String} The timing function to use in the animation
     */
    scrollTo: function (page, duration, easing) {
        var V = Math.max(Math.floor(page), 0),
            T = Math.max(duration, 0),
            O = this._pages.item(V),
            D = O ? O.get(this._snapAttr) : 0;

        if (T > 0) {
            this._snapping = true;
        }
        if (this._vertical) {
            this._host.scrollTo(0, D, T, easing);
        } else {
            this._host.scrollTo(D, 0, T, easing);
        }
    },

    /**
     * Scroll to the next page in the scrollview, with animation
     *
     * @method next
     */
    next: function () {
        var index = this.get('index');
        if(index < this.get('total') - 1) {
            this.set('index', index + 1);
        }
    },

    /**
     * Scroll to the previous page in the scrollview, with animation
     *
     * @method prev
     */
    prev: function () {
        var index = this.get('index');
        if(index > 0) {
            this.set('index', index - 1);
        }
    },

    /**
     * Get nearest page index
     *
     * @method snapIndex
     */
    snapIndex: function () {
        var A = this._snapAttr,
            R = this._snapRange,
            C = this._host.get(this._snapSource), // + this._range,
            I, O,
            pages = this._pages,
            T = pages.size();
        for (I=0;I<T;I++) {
            O = pages.item(I);
            if (C < O.get(A) + O.get(R) / 2) {
                return I;
            }
        }
        return null;
    }
});
