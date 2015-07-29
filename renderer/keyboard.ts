/// <reference path="../typings/mousetrap/mousetrap.d.ts" />

namespace TrendingHub {
    export class KeyReceiver {
        callbacks: Object;

        constructor(shortcuts: Object) {
            this.callbacks = {};
            const handler_for = action => () => this.dispatch(action);

            for (const keyinput in shortcuts) {
                Mousetrap.bind(keyinput, handler_for(shortcuts[keyinput]));
            }
        }

        on(action: string, callback: () => void): void {
            this.callbacks[action] = callback;
        }

        dispatch(action: string): void {
            if (action in this.callbacks) {
                this.callbacks[action]();
            }
        }
    }
}
