/// <reference path="lib.d.ts" />

namespace TrendingHub {
    const shell = require('shell');

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
            webview.addEventListener('dom-ready', function(e: any){
                webview.addEventListener('did-start-loading', function(e: any){
                    const url = webview.getUrl();
                    webview.stop();
                    shell.openExternal(url);
                });

                // Note: Skip headers
                webview.executeJavaScript(`
                    (function() {
                        'use strict';

                        const navbar = document.querySelector('header.nav-bar');
                        if (navbar) {
                            navbar.style.display = 'none';
                        }

                        const control = document.querySelector('div.pulse-control');
                        if (control) {
                            control.style.display = 'none';
                        }

                        const nav = document.querySelector('nav.tabs');
                        if (nav) {
                            nav.style.display = 'none';
                        }
                    })();
                `);
            });

            return webview;
        }

        private prepareWrapper(width: number, height: number) {
            let element = document.createElement('div');
            element.id = 'unfocused';
            element.className = 'trending-window';
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.style.minWidth = '375px';  // iPhone6

            element.appendChild(this.prepareHeader('Dummy'));

            this.webview = this.prepareWebview(width, height);
            element.appendChild(this.webview);

            return element;
        }

        constructor(public lang: string, width: number, height: number) {
            this.element = this.prepareWrapper(width, height);
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
            this.element.id = 'focused';
            this.webview.focus();
        }

        blur(): void {
            this.element.id = 'unfocused';
        }
    }
}
