import * as yaml from 'js-yaml';
import * as request from 'request';
import {load as loadConfig} from './config';

// Returns {lang_name => color_str}
export function allColors(callback: (colors: Object) => void) {
    if (this.cache) {
        callback(this.cache);
    }

    let opts: request.Options = {url: 'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml'};
    const config = loadConfig();
    if (config.proxy !== '') {
        opts.proxy = config.proxy;
    }

    request(opts, (err, res, body) => {
        if (err) {
            console.log(err);
            callback({all: '#333333'});
            return;
        }

        if (res.statusCode !== 200) {
            console.log('Request response has invalid status: ' + res.statusCode);
            callback({all: '#333333'});
            return;
        }

        this.cache = {};

        const langs = yaml.safeLoad(body);
        for (const name in langs) {
            const lang = langs[name];
            this.cache[name.toLowerCase()] = lang.color;
            if ('aliases' in lang) {
                for (const alias of lang.aliases) {
                    this.cache[alias.toLowerCase()] = lang.color;
                }
            }
        }

        callback(this.cache);
    });
}

export function colorOf(lang: string, callback: (color: string) => void) {
    allColors((colors: Object) => {
        if (lang in colors) {
            callback(colors[lang]);
        } else {
            callback('');
        }
    });
}

export function languageNames(callback: (names: string[]) => void) {
    allColors((colors: Object) => {
        callback(Object.keys(colors));
    });
}
