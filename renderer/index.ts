/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
/// <reference path="lib.d.ts" />
/// <reference path="trending_view.ts" />
/// <reference path="keyboard.ts" />

var remote = require('remote');
var views: TrendingHub.TrendingView[] = [];
var focused_idx = 0;

function removeAllChildren (elem) {
    while (elem.hasChildNodes()) {
        elem.removeChild(elem.firstChild);
    }
}

function addTrendingPage(lang, width) {
    // Note: document.body.clientHeight doesn't work here.
    const height = window.innerHeight;
    const view = new TrendingHub.TrendingView(lang, width, height);
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

function currentWebview() {
    return views[focused_idx].webview;
}

function enableShortcuts(shortcuts: Object) {
    let receiver = new TrendingHub.KeyReceiver(shortcuts);

    receiver.on('PreviousLang', () => focusMove(false));
    receiver.on('NextLang', () => focusMove(true));
    receiver.on('SelectNext', () => console.log('Not implemented yet!'));
    receiver.on('SelectPrevious', () => console.log('Not implemented yet!'));
    receiver.on('Reload', () => remote.getCurrentWindow().reload());
    receiver.on('Cut', () => currentWebview().cut());
    receiver.on('Paste', () => currentWebview().paste());
    receiver.on('Copy', () => currentWebview().copy());
    receiver.on('ScrollUp', () => currentWebview().executeJavaScript('window.scrollBy(0, window.innerHeight / 5)'));
    receiver.on('ScrollDown', () => currentWebview().executeJavaScript('window.scrollBy(0, -window.innerHeight / 5)'));
    receiver.on('QuitApp', () => remote.require('app').quit());
    receiver.on('DevTools', () => remote.getCurrentWindow().toggleDevTools());
    receiver.on('GoForward', () => currentWebview().goForward());
    receiver.on('GoBack', () => currentWebview().goBack());
    return receiver;
}

window.onload = function() {
    const config = remote.require('./config').load();

    enableShortcuts(config.shortcuts);

    const pane_width = document.body.clientWidth / config.languages.length;
    removeAllChildren(document.body);

    for (const lang of config.languages) {
        addTrendingPage(lang, pane_width);
    }

    views[focused_idx].focus();
};

Mousetrap.bind('l', () => focusMove(true));
Mousetrap.bind('h', () => focusMove(false));
