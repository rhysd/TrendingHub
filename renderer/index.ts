/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
/// <reference path="lib.d.ts" />
/// <reference path="trending_view.ts" />

var views: GHTrending.TrendingView[] = [];
var focused_idx = 0;

function removeAllChildren (elem) {
    while (elem.hasChildNodes()) {
        elem.removeChild(elem.firstChild);
    }
}

function addTrendingPage(lang, width) {
    // Note: document.body.clientHeight doesn't work here.
    const height = window.innerHeight;
    const view = new GHTrending.TrendingView(lang, width, height);
    document.body.appendChild(view.element);
    view.load();
    views.push(view);
}

function focusMove(advance: boolean) {
    views[focused_idx].blur();
    const offset = advance ? 1 : -1;
    focused_idx += offset;
    if (focused_idx >= views.length) {
        focused_idx = 0;
    } else if (focused_idx < 0) {
        focused_idx = views.length - 1;
    }
    views[focused_idx].focus();
}

window.onload = function() {
    const langs = ['all', 'vim', 'crystal', 'rust', 'go'];
    const pane_width = document.body.clientWidth / langs.length;

    removeAllChildren(document.body);

    for (const lang of langs) {
        addTrendingPage(lang, pane_width);
    }

    views[focused_idx].focus();

};

Mousetrap.bind('l', () => focusMove(true));
Mousetrap.bind('h', () => focusMove(false));
