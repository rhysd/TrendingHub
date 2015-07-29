import * as app from 'app';
import * as path from 'path';
import BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;

const idx = process.argv.indexOf('--lang');
var langs = []; // Note: Select random languages
if (idx != -1) {
    langs = process.argv.slice(idx);
}

app.on('window-all-closed', function(){ app.quit(); });

app.on('ready', function(){
    const display_size = require('screen').getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
            width: display_size.width,
            height: display_size.height,
        });

    const html = 'file://' + path.resolve(__dirname, '..', 'static', 'index.html');
    mainWindow.loadUrl(html);

    mainWindow.on('closed', function(){
        mainWindow = null;
    });
});

