/// <reference path="lib.d.ts" />

namespace TrendingHub {
    const shell = require('shell');
    const remote = require('remote');
    const lang_color = remote.require('./lang_color');

    export class TrendingView {
        element: HTMLElement;
        webview: ElectronWebview;

        private prepareHeader(lang: string) {
            let header = document.createElement('header');
            header.className = 'lang-header';

            let icon_span = document.createElement('span');
            icon_span.className = 'header-icon';
            let icon = document.createElement('i');
            icon.className = 'fa fa-github';
            icon_span.appendChild(icon);
            header.appendChild(icon_span);

            lang_color.colorOf(lang, color => {
                header.style.borderColor = color;
                icon_span.style.color = color;
            });

            let lang_name = document.createElement('span');
            lang_name.innerText = lang;
            lang_name.className = 'header-text';
            header.appendChild(lang_name);

            return header;
        }

        private prepareWebview(width: number, height: number) {
            let webview = <ElectronWebview>document.createElement('webview');
            webview.className = 'trending-window';
            webview.style.width = width + 'px';
            webview.style.minWidth = '375px';  // iPhone6
            webview.style.height = height + 'px';
            webview.addEventListener('new-window', function(e: any){
                console.log('Guest window tries to open new window: ' + e.url);
                shell.openExternal(e.url);
            });
            webview.addEventListener('dom-ready', function(e: Event){
                // Note:
                // Remove headers. webview.insertCSS() doesn't work.
                //
                // XXX:
                // Set link's target to 'new' to open the link in external browser.
                // using node.js integration and 'onclick' event doesn't work.
                webview.executeJavaScript(`
                    (function() {
                        'use strict';
                        const navbar = document.querySelector('.nav-bar');
                        if (navbar) {
                            navbar.style.display = 'none';
                        }

                        const control = document.querySelector('.pulse-control');
                        if (control) {
                            control.style.display = 'none';
                        }

                        const nav = document.querySelector('.tabs');
                        if (nav) {
                            nav.style.display = 'none';
                        }

                        const links = document.querySelectorAll('a');
                        for (let i = 0; i < links.length; ++i) {
                            let link = links.item(i);
                            if (link.href) {
                                link.setAttribute('target', 'new');
                            }
                        }
                    })();
                `);
            });

            return webview;
        }

        private prepareWrapper(width: number, height: number, lang: string) {
            let element = document.createElement('div');
            element.id = 'unfocused';
            element.className = 'unfocused';
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.style.minWidth = '375px';  // iPhone6

            element.appendChild(this.prepareHeader(lang));

            this.webview = this.prepareWebview(width, height);
            element.appendChild(this.webview);

            return element;
        }

        constructor(public lang: string, width: number, height: number) {
            // XXX: 36 means the height of header
            this.element = this.prepareWrapper(width, height - 36, lang);
        }

        load(): void {
            this.webview.useragent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53';
            if (this.lang === 'all') {
                this.webview.src = 'https://github.com/trending';
            } else {
                this.webview.src = 'https://github.com/trending?l=' + this.lang;
            }
        }

        focus(): void {
            this.element.className = 'focused';
            this.webview.focus();
        }

        blur(): void {
            this.element.className = 'unfocused';
        }
    }
}
