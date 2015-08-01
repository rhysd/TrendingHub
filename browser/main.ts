import * as app from 'app';
import * as path from 'path';
import BrowserWindow = require('browser-window');
import * as Menu from 'menu';
import {openExternal} from 'shell';
import * as Config from './config';

require('crash-reporter').start();

// Initialization
var main_window = null;
var config = Config.load();

const idx = process.argv.indexOf('--lang');
if (idx != -1) {
    config.languages = process.argv.slice(idx);
}

// Application callbacks
app.on('window-all-closed', function(){ app.quit(); });

app.on('ready', function(){
    const display_size = require('screen').getPrimaryDisplay().workAreaSize;
    const getLength = prop => typeof(config[prop]) === 'number' ? config[prop] : display_size[prop];

    main_window = new BrowserWindow({
            width: getLength('width'),
            height: getLength('height'),
        });

    const html = 'file://' + path.resolve(__dirname, '..', 'static', 'index.html');
    main_window.loadUrl(html);

    main_window.on('closed', function(){
        main_window = null;
    });

    const template = [
        {
            label: 'TrendingHub',

            submenu: [
                {
                    label: 'Reload',
                    click: () => main_window.reload(),
                },
                {
                    label: 'DevTools',
                    click: () => main_window.toggleDevTools(),
                },
                {
                    label: 'Quit App',
                    accelerator: 'CommandOrControl+Q',
                    click: () => app.quit(),
                },
                {
                    type: 'separator'
                },
                {
                    label: 'About TrendingHub',
                    click: () => openExternal('https://github.com/rhysd/TrendingHub'),
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});
