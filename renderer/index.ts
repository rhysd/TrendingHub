/// <reference path="lib.d.ts" />
/// <reference path="trending_view.ts" />

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
    return view;
}

window.onload = function() {
    const langs = ['all', 'vim', 'crystal', 'rust', 'go'];
    const pane_width = document.body.clientWidth / langs.length;

    removeAllChildren(document.body);

    for (const lang of langs) {
        addTrendingPage(lang, pane_width);
    }
};

