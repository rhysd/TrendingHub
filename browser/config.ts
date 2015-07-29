import * as yaml from 'js-yaml';
import * as app from 'app';
import * as path from 'path';
import * as fs from 'fs';

export interface Config {
    languages: string[];
    shortcuts: Object;
}

export function load(): Config {
    if (this.cache) {
        return this.cache
    }

    this.cache = <Config>{
        languages: ['all', 'vim', 'crystal', 'rust', 'go'], // XXX: temporary
        shortcuts: {
            'h': 'PreviousLang',
            'l': 'NextLang',
            'j': 'SelectNext',
            'k': 'SelectPrevious',
            'mod+r': 'Reload',
            'mod+x': 'Cut',
            'mod+c': 'Copy',
            'mod+v': 'Paste',
            'mod+n': 'ScrollUp',
            'mod+p': 'ScrollDown',
            'mod+q': 'QuitApp',
        },
    };

    function mergeConfig(c1: Config, c2: Object) {
        for (const k in c2) {
            const v2 = c2[k];

            if (k in c1) {
                let v1 = c1[k];
                if (typeof(v1) === 'object' && typeof(v2) === 'object') {
                    mergeConfig(v1, v2);
                    continue;
                }
            }

            c1[k] = c2[k];
        }
    }

    const file = path.join(app.getPath('userData'), 'config.yml');
    try {
        const user_config = yaml.load(fs.readFileSync(file, {encoding: 'utf8'}));
        mergeConfig(this.cache, user_config);
    } catch(e) {
        console.log('Configuration file not found: ' + file);
    }

    return this.cache;
}
