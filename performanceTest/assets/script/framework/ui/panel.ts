
import { _decorator, Component, Node, UITransform, Enum } from 'cc';
import { CustomEvent } from '../event/custom_event';
const { ccclass, property } = _decorator;

// /**
//  * 场景元素的分组
//  * @enum PANEL_GROUP
//  * @type {Object}
//  */
// enum PANEL_GROUP {
//     /**
//      * ui 分组，静止
//      * @property UI_ROOT
//      * @type {Number}
//      * @value 0
//      * @static
//     */
//     UI_ROOT = 0, // ui 分组，静止
//     /**
//      * 游戏分组，运动
//      * @property GAME_ROOT
//      * @type {Number}
//      * @value 1
//      * @static
//     */
//     GAME_ROOT = 1, // 游戏分组，运动
// }

// Enum(PANEL_GROUP)

/**
 * 层级
 * @enum PANEL_HIERARCHY
 * @type {Object}
 */
enum PANEL_HIERARCHY {
    /**
     * 基础层级
     * @property BASE
     * @type {Number}
     * @value 1
     * @static
    */
    BASE = 1, // 基础层级
    /**
     * 跑马灯层级，在弹窗之下，底层之上
     * @property MARQUEE
     * @type {Number}
     * @value 5000
     * @static
    */
    MARQUEE = 5000, // 跑马灯层级，在弹窗之下，底层之上
    /**
     * 二级界面层级，用于常见的界面等
     * @property MODAL
     * @type {Number}
     * @value 10000
     * @static
    */
    MODAL = 10000, // 二级界面层级，用于常见的界面等
    /**
     * 三级界面层级，用于二级界面的弹出层等
     * @property POPUP
     * @type {Number}
     * @value 15000
     * @static
    */
    POPUP = 15000, // 三级界面层级，用于二级界面的弹出层等
    /**
     * 提示层级，用于浮动提示框、确认提示框等
     * @property TIPS
     * @type {Number}
     * @value 20000
     * @static
    */
    TIPS = 20000, // 提示层级，用于浮动提示框、确认提示框等
}

Enum(PANEL_HIERARCHY)

@ccclass('Panel')
export class Panel extends Component {

    // static PANEL_GROUP = PANEL_GROUP;

    /**
     * 层级
     * @enum PANEL_HIERARCHY
     * @type {Object}
     */
    static PANEL_HIERARCHY = PANEL_HIERARCHY;

    _panelHierachy: number = PANEL_HIERARCHY.MODAL;
    @property({ tooltip: '设置当前界面的分组：\nuiRoot-常用于 UI 层级\ngameRoot-常用于游戏层级', type: PANEL_HIERARCHY })
    public get panelHierachy (): PANEL_HIERARCHY {
        return this._panelHierachy;
    }
    public set panelHierachy (value: PANEL_HIERARCHY) {
        this._panelHierachy = value;
    }

    // @property
    // _panelGroup = PANEL_GROUP.UI_ROOT;

    // @property({ 'type': PANEL_GROUP, tooltip: '设置当前界面的分组：\nuiRoot-常用于 UI 层级\ngameRoot-常用于游戏层级' })
    // public get panelGroup (): PANEL_GROUP {
    //     return this._panelGroup;
    // }
    // public set panelGroup (value: PANEL_GROUP) {
    //     this._panelGroup = value;
    // }

    @property({ tooltip: '若勾选上，重复显示窗口时，会等待上一个关闭后再显示下一个' })
    inQueue = false;

    eventMap = {};

    manager: any;  //panelManager,后续加载时动态设置

    // FIXME: 存在 onLoad() 会在 start() 之后触发的情况
    onLoad () {
        this.eventMap = {}; // 记录事件的持久化情况（即是否需要在 onDisable 时注销）
    }

    onEnable () { }

    onDisable () {
        this.clearAllEvents();
        this.clearAllMonitors();
    }

    // /**
    //  * 获取当前所在分组
    //  */
    // getGroup () {
    //     return this.panelGroup;
    // }

    /**
     * 获取当前所在层级
     */
    getHierachy () {
        return this.panelHierachy;
    }

    /**
     * 显示界面
     */
    onShow (...params) {
        this.node.active = true;
    }

    /**
     * 隐藏界面
     */
    onHide (...params) {
        this.node.active = false;
    }

    hide () {
        this.manager?.hidePanel(this.node.name);
    }

    /**
     * 注册游戏逻辑事件
     * @param {string} name 事件名称
     * @param {function} cb 监听函数
     * @param {object} target 监听对象
     * @param {boolean} persistence 是否持久化
     * @method registerCustomEvent
     */
    registerCustomEvent (name: string, cb: Function, target: any = this, persistence = false) {
        let legal = false;
        if (this.eventMap[name]) {
            console.log(`[panel] ${name} is already register.`);
        } else if (typeof name !== 'string') {
            console.error('[panel] eventName must be string.');
        } else {
            legal = true;
        }

        if (!legal) return;

        this.eventMap[name] = {
            name,
            cb,
            target,
            persistence,
        };

        CustomEvent.on(name, cb, target);
    }

    /**
     * 清空所有注册事件
     */
    clearAllEvents () {
        for (const eventName in this.eventMap) {
            if (this.eventMap.hasOwnProperty(eventName)) {
                const data = this.eventMap[eventName];
                const {
                    name,
                    cb,
                    target,
                    persistence,
                } = data;

                if (!persistence) {
                    CustomEvent.off(name, cb, target);

                    delete this.eventMap[eventName];
                }
            }
        }
    }


    /**
     * 根据名字获取节点，要求节点不能重名
     * @param {string} name 检点名
     * @param {cc.Node} node 父节点
     */
    getNode (name: string, node: Node) {
        const curNode = node || this.node;
        let ret = curNode.getChildByName(name);
        if (!ret) {
            if (curNode.children.length === 0) {
                ret = null;
            } else {
                for (const child of curNode.children) {
                    const target = this.getNode(name, child);
                    if (target) {
                        ret = target;
                        break;
                    }
                }
            }
        }

        return ret;
    }

    /**
     * 获取是否队列显示的状态
     */
    getInQueue () {
        return this.inQueue;
    }

    /**
     * 监听数据变化
     * @param {object} moduleData 监听对象
     * @param {string} path 监听路径
     * @param {function} func 监听函数
     * @method watch
     */
    // watch (moduleData: any, path: string, func: Function) {
    //     const func1 = (...params) => { if (this.node.isValid && this.node.activeInHierarchy) func.apply(this, params); };
    //     if (typeof this.monitors === 'undefined') this.monitors = [];
    //     this.monitors.push({ moduleData, path, func1 });
    //     ModuleData.watch(moduleData, path, func1, null);
    // }

    // func1 () {

    // }

    clearAllMonitors () {
        // if (typeof this.monitors === 'undefined') return;
        // this.monitors.forEach((element) => {
        //     const { moduleData, path, func1 } = element;
        //     ModuleData.unwatch(moduleData, path, func1, null);
        // });

        // this.monitors = [];
    }

    /**
     * 按钮绑定显示界面的事件，仅能在按钮回调中使用。
     * 如果显示界面时需要传递参数，请手动写接口
     * @param {cc.Event} event 按钮点击事件
     * @param {string} panelName 界面名
     */
    onBtnShowPanelClick (event: Event, panelName: string) {
        if (typeof panelName !== 'string' || !panelName) {
            console.error('[panel.onBtnShowPanelClick] panelName must be valid string!');
            return;
        }

        this.manager?.showPanel(panelName);
    }

    /**
     * 按钮绑定隐藏界面的事件，仅能在按钮回调中使用。
     * 如果隐藏界面时需要传递参数，请手动写接口
     * @param {cc.Event} event 点击事件
     * @param {string} panelName 界面名
     */
    onBtnHidePanelClick (event: Event, panelName: string) {
        if (typeof panelName !== 'string' || !panelName) {
            console.error('[panel.onBtnHidePanelClick] panelName must be valid string!');
            return;
        }

        this.manager?.hidePanel(panelName);
    }
}