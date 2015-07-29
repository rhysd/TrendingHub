/// <reference path="lib.d.ts" />

namespace GHTrending {
    const shell = require('shell');

    export class TrendingView {
        public  element: HTMLElement;
        private webview: ElectronWebview;

        constructor(public lang: string, width: number, height: number) {
            this.element = document.createElement('div');
            this.element.className = 'trending-window';
            this.element.style.width = width + 'px';
            this.element.style.height = height + 'px';

            this.webview = <ElectronWebview>document.createElement('webview');
            this.webview.className = 'trending-window';
            this.webview.style.width = width + 'px';
            this.webview.style.height = height + 'px';
            this.element.appendChild(this.webview);
            this.webview.addEventListener('new-window', function(e: any){
                console.log('Guest window tries to open new window: ' + e.url);
                shell.openExternal(e.url);
            });
            this.webview.addEventListener('dom-ready', function(e: any){
                this.webview.addEventListener('did-start-loading', function(e: any){
                    e.preventDefault();
                    const url = this.webview.getUrl();
                    console.log('Guest window starts to open: ' + url);
                    this.webview.stop();
                    shell.openExternal(url);
                });
            });
        }

        load(): void {
            this.webview.useragent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53';
            if (this.lang === 'all') {
                this.webview.src = 'https://github.com/trending';
            } else {
                this.webview.src = 'https://github.com/trending?l=' + this.lang;
            }
        }
    }
}
