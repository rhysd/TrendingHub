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
    let v = views[focused_idx];
    v.focus();

    const top = document.body.scrollTop;
    const left_edge = document.body.scrollLeft;
    const right_edge = left_edge + window.innerWidth;
    const elem_left = v.element.offsetLeft;
    const elem_right = elem_left + v.element.offsetWidth;

    if (right_edge < elem_right) {
        window.scrollTo(elem_right, top);
    } else if (elem_left < left_edge) {
        window.scrollTo(elem_left, top);
    }
}

function currentWebview() {
    return views[focused_idx].webview;
}

// XXX: It doesn't work now.
function simulateKeyPress(view: ElectronWebview, keycode: number, shift: boolean) {
    return `
    function() {
        let e = document.createEvent('KeyboardEvent');
        e.initKeyboardEvent('keypress', true, true, window, ${keycode}, ${keycode}, DOM_KEY_LOCATION_STANDARD, '${shift ? 'shift' : ''}');
        document.body.dispatchEvent(e);
    }();
    `;
}

function enableShortcuts(shortcuts: Object) {
    let receiver = new TrendingHub.KeyReceiver(shortcuts);

    receiver.on('PreviousLang', () => focusMove(false));
    receiver.on('NextLang', () => focusMove(true));
    receiver.on('SelectNext', () => currentWebview().executeJavaScript('window.scrollBy(0, window.innerHeight / 5)')); // Temporarily
    receiver.on('SelectPrevious', () => currentWebview().executeJavaScript('window.scrollBy(0, -window.innerHeight / 5)')); // Temporarily
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
        addTrendingPage(lang.toLowerCase(), pane_width);
    }

    views[focused_idx].focus();
};

