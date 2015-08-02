import * as yaml from 'js-yaml';
import * as https from 'https';

// Returns {lang_name => color_str}
export function allColors(callback: (colors: Object) => void) {
    if (this.cache) {
        callback(this.cache);
    }

    https.get('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml', response => {
        let body = '';
        this.cache = {};

        response.on('data', data => body += data.toString())
                .on('end', () => {
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
    }).on('error', function(err){
        console.log('Error on loading language YAML file: ' + err);
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
