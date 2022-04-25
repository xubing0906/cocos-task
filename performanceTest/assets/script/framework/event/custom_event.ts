
import { error, _decorator } from 'cc';
const { ccclass } = _decorator;

export class OneToMultiListener {
    handlers: any = {};
    supportEvent: any = {};

    private _addListener (eventName: string, handler: Function, target: any, isOnce = false) {
        let objHandler = { handler: handler, target: target, isOnce: isOnce };
        let handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (let i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    }

    once (eventName: string, handler: Function, target: any) {
        this._addListener(eventName, handler, target, true);
    }

    on (eventName: string, handler: Function, target: any) {
        this._addListener(eventName, handler, target, false);
    }

    off (eventName: string, handler: Function, target: any) {
        var handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (var i = 0; i < handlerList.length; i++) {
            var oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    }

    dispatchEvent (eventName: string/**/, ...args: any) {
        // if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
        //     cc.error("please add the event into clientEvent.js");
        //     return;
        // }

        let handlerList = this.handlers[eventName];

        let arrArgs = [];
        for (let i = 1; i < arguments.length; i++) {
            arrArgs.push(arguments[i]);
        }

        if (!handlerList) {
            return;
        }

        let cloneList = handlerList.slice(); //避免回调的时候会出现把函数从handlerList中移除
        for (let i = 0; i < cloneList.length; i++) {
            let objHandler = cloneList[i];
            if (objHandler.handler) {
                objHandler.handler.apply(objHandler.target, arrArgs);
            }

            if (objHandler.isOnce) {
                //派发完后，需要移除掉
                cloneList.splice(i, 1);
                i--;
            }
        }
    }

    setSupportEventList (arrSupportEvent: string[]) {
        if (!(arrSupportEvent instanceof Array)) {
            error("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (var i in arrSupportEvent) {
            var eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }


        return true;
    }

}


@ccclass('CustomEvent')
export class CustomEvent {
    _listeners: any[][] = [];

    static _eventListener = new OneToMultiListener();

    //===================== 自定义事件，非全局 ====================
    addListener (cb: Function, target?: Object, isOnce = false) {
        let listeners = this._listeners;
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i][0] === cb && listeners[i][1] === target) {
                return;
            }
        }
        this._listeners.push([cb, target, isOnce]);
    }

    removeListener (cb: Function, target?: Object) {
        let listeners = this._listeners;
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i][0] === cb) {
                listeners.splice(i, 1);
                return;
            }
        }
    }

    invoke (...args: any) {
        let arrArgs: any[] = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arrArgs[_i] = arguments[_i];
        }
        let listeners = this._listeners;
        for (let i = 0; i < listeners.length; i++) {
            let l = listeners[i];
            l[0].apply(l[1], arrArgs);

            if (l[2]) {
                //表示只监听一次，那就干掉
                listeners.splice(i, 1);
                i--; //让后续i++变成现有的值
            }
        }
    }

    clearAllListener () {
        this._listeners = [];
    }

    //===================== 全局事件 =======================
    public static on (eventName: string, handler: Function, target: any) {
        this._eventListener.on(eventName, handler, target);
    }

    public static off (eventName: string, handler: Function, target: any) {
        this._eventListener.off(eventName, handler, target);
    }

    public static dispatchEvent (eventName: string, ...args: any) {
        this._eventListener.dispatchEvent(eventName, ...args);
    }
}
