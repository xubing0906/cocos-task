
import { _decorator, Component, Node, isValid, resources, Prefab, instantiate, find, CanvasComponent, UITransformComponent, WidgetComponent, director, CameraComponent, gfx, renderer, Layers, UITransform, view, loader, BlockInputEvents, assetManager, AssetManager } from 'cc';
import PoolManager from '../util/pool_manager';
import { Panel } from './panel';
const { ccclass, property } = _decorator;

const SHOW_STR_INTERVAL_TIME = 800;

@ccclass('PanelManager')
export class PanelManager extends Component {
    dictSharedPanel: any = {}
    dictLoading: any = {}
    arrPopupDialog: any = []
    showTipsTime: number = 0

    prefabPrefix = "prefab/panel/";

    uiRoot: Node | null = null;
    maskNode: Node | null = null;

    preloadFlag = false; // 是否开启预加载
    isShowingPanel = false; // 是否正在打开界面
    needResumePreload = false; // 是否需要自动恢复预加载
    preloadFinish = false; // 是否预加载完成
    preloadIndex = 0; // 当前预加载的元素下标
    isShowingQueue = false; // 正在显示队列界面
    activeContainer: Record<string, Record<string, Node>> = {}; // 当前已显示的界面
    panelActiveState: Record<string, boolean> = {}; // 界面显示情况
    cachePanelParams = []; // 缓存界面显示的参数（未预加载的队列界面显示时参数顺序会混乱）
    updatingCacheParams = false; // 正在更新缓存的参数，剔除已显示过的界面的参数

    panelContainer: Record<string, Node> = {}; // 已实例化的界面
    prefabContainer: Record<string, Prefab> = {}; // 缓存预加载完毕的 prefab
    paths: Record<string, Record<string, string>> = {}; // resources 文件夹下所有的 prefab 列表，key 为名字，value 为 AssetTable
    prefabList: string[] = null; // prefab 的名字列表

    static _instance: PanelManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PanelManager();
        return this._instance;
    }

    /**
     * 场景必须要调用的接口，初始化场景内的节点数据
     * @param {cc.Node} uiRoot 场景上用于挂载界面元素的节点
     * @param {cc.Node} maskNode 场景上的遮罩节点
     */
    initGraphic (uiRoot: Node, maskNode?: Node) {
        this.uiRoot = uiRoot;
        this.maskNode = maskNode;
        if (this.maskNode) {
            this.maskNode.active = false;
            let transform = this.maskNode.getComponent(UITransform);
            transform.width = view.getCanvasSize().width;
            transform.height = view.getCanvasSize().height;
            this._stopEventsPropagation(this.maskNode);
        }

        this._resetData();
    }

    /**
     * 预加载 prefab 开关
     * @param {Boolean} flag 是否打开预加载
     */
    setPreload (flag: boolean) {
        // 是否是暂停预加载的判断
        if (!this.preloadFinish && this.preloadFlag && !flag) {
            this.needResumePreload = true;
        }

        // 已经预加载完成，或与当前预加载状态一致，则退出
        if (this.preloadFinish || this.preloadFlag === flag) {
            return;
        }

        this.preloadFlag = flag;
        if (this.preloadFlag) {
            this._preloadPanel();
        }
    }

    /**
     * 显示界面，提供给外部调用，虽然只是做一些界面显示之前的预处理工作
     * @param {string} panelName 界面的名字
     * @param  {...any} params 可选，界面的 show 接口能够接收的参数
     */
    showPanel (panelName: string, ...params: any) {
        this.isShowingPanel = true;
        this.panelActiveState[panelName] = true;

        // 缓存显示界面时的参数
        let cachedParams = this._saveParams(panelName, params);

        // 停止预加载，优先显示界面
        if (this.preloadFlag) {
            this.setPreload(false);
        }

        let panel = this.panelContainer[panelName];
        if (!panel) {
            let prefab = this.prefabContainer[panelName];
            if (!prefab) {
                this._loadPrefab(panelName, (prefabItem) => {
                    if (prefabItem) {
                        this.prefabContainer[panelName] = prefabItem;
                        if (!this.panelContainer[panelName]) {
                            panel = instantiate(prefabItem);
                            // _initPanel 中通过 panel 的 _name 判断是否同一个界面
                            // 通过复制 prefab 方式制作的界面可能存在 prefab 根节点名字忘记修改的情况
                            // 因此在这里强制修改 panel 的名字
                            panel.name = panelName;
                            this.panelContainer[panelName] = panel;
                        }
                    } else {
                        this.panelActiveState[panelName] = false;
                        // 缓存的参数 showed 设为 true，在 this._tryShowPanel 中自动被回收
                        cachedParams.showed = true;
                    }

                    // 同时显示多个界面时，如果第一个界面获取 prefab 出错，也需要调用 this._tryShowPanel 来继续流程
                    this._tryShowPanel();
                });
                return;
            }

            panel = instantiate(prefab);
            this.panelContainer[panelName] = panel;
        }

        this._tryShowPanel();
    }

    /**
     * 隐藏界面
     * @param {String} panelName 界面的名字
     * @param  {...any} params 可选，隐藏界面时 hide 接口接收的参数
     */
    hidePanel (panelName: string, params: any = null) {
        console.log(`[panelManager] ===> hidePanel: ${panelName}`);

        this.panelActiveState[panelName] = false;

        let panel = this.panelContainer[panelName];
        if (!panel) {
            console.warn(`[panelManager] ${panelName} not instantiate yet.`);
            return;
        }

        if (panel.active) {
            let panelComponent = panel.getComponent(Panel);
            if (!panelComponent) {
                // console.error(`[panelManager] component name on prefab ${panelName} must be same.`);
                console.error(`[panelManager] prefab ${panelName} must have base class Panel.`);
                return;
            }

            // if (panelComponent.hide === 'function') {
            //     panelComponent.hide(params);
            // }
            panelComponent.onHide(params);

            panel.active = false;

            this._removeFromActiveContainer(panelName);
            panel.parent = null;

            // modal 类型界面被移除后自动调整 mask 节点的层级
            if (this._isModal(panelComponent.getHierachy())) {
                this._adjustMask();
            }

            // 判断是否有队列显示的界面需要再显示
            if (this.isShowingQueue && panelComponent.getInQueue && panelComponent.getInQueue()) {
                this.isShowingQueue = false;
                this._tryShowPanel();
            }
        } else {
            console.warn(`[panelManager] ${panelName} not active, don't need to hide.`);
        }
    }

    /**
     * 释放界面资源
     * @param {String} panelName 界面名
     */
    removePanel (panelName: string) {
        //！！！！！！！！removePanel目前无效，需要后续补充实现
        return;

        let start = Date.now();
        let panel = this.panelContainer[panelName];
        if (panel) {
            if (panel.active) {
                this.hidePanel(panelName, {});
            }
        }

        let path = this._getPrefabPath(panelName);
        if (path) {
            let deps = [];
            // 获取 panel 所在的目录
            let filePath = path.split('/').slice(0, path.split('/').length - 1).join('/');
            // @ts-ignore
            let pathToUuid = loader._resources._pathToUuid;
            for (let p in pathToUuid) {
                // cc.loader._resources._pathToUuid 通过 cc.js.createMap(true) 创建
                // 创建出的 Object 是无 prototype 的对象，因此使用 for...in 时无需判断 hasOwnProperty
                // @see https://docs.cocos.com/creator/api/zh/modules/js.html#createmap
                if (p.indexOf(filePath) === -1) continue;
                let res = loader.getRes(p);
                if (!res) continue;

                let entry = pathToUuid[p];
                let resUuid = null;
                let tempUuids = [];
                if (entry && entry.constructor === Array) {
                    // 同名不同类型的资源会放到同一个数组中
                    for (let entryItem of entry) {
                        resUuid = entryItem.uuid;
                        if (resUuid && deps.indexOf(resUuid) === -1) {
                            tempUuids.push(resUuid);
                        }
                    }
                } else {
                    resUuid = entry.uuid;
                    if (resUuid && deps.indexOf(resUuid) === -1) {
                        tempUuids.push(resUuid);
                    }
                }

                let { length } = tempUuids;
                for (let i = 0; i < length; i += 1) {
                    let tempUuid = tempUuids[i];
                    let tempDeps = loader.getDependsRecursively(tempUuid);
                    for (let uuid of tempDeps) {
                        if (!this._isDependedByOtherPanel(uuid, panelName) && deps.indexOf(uuid) === -1) {
                            deps.push(uuid);
                        }
                    }
                }
            }

            // TODO: 留意一下，如果 deps 中的资源有正在被加载的，也需要剔除。等开发资源管理器的时候处理
            console.log(deps);
            loader.release(deps);
            delete this.panelContainer[panelName];
            delete this.prefabContainer[panelName];

            let end = Date.now();
            console.log(`[panelManager] remove ${panelName} finished. Cost time: ${(end - start) / 1000} ms`);
        } else {
            console.error(`[panelManager] ${panelName} not loaded, can't be release.`);
        }
    }

    /**
     * 屏蔽节点上的点击事件与鼠标事件，用于 mask 的防穿透
     * @param {cc.Node} node 节点
     */
    _stopEventsPropagation (node: Node) {
        if (!node.isValid) {
            // let eventList = [
            //     'touchstart',
            //     'touchend',
            //     'touchmove',
            //     'touchcancel',
            //     'mousedown',
            //     'mouseenter',
            //     'mousemove',
            //     'mouseleave',
            //     'mousewheel',
            // ];

            // for (let i = 0; i < eventList.length; i += 1) {
            //     let eventName = eventList[i];
            //     node.on(eventName, (event) => {
            //         event.stopPropagation();
            //     });
            // }
            if (!node.getComponent(BlockInputEvents)) {
                node.addComponent(BlockInputEvents);
            }

        }
    }

    /**
     * 初始化 panelManager 数据
     */
    _resetData () {
        this.preloadFlag = false; // 是否开启预加载
        this.isShowingPanel = false; // 是否正在打开界面
        this.needResumePreload = false; // 是否需要自动恢复预加载
        this.preloadFinish = false; // 是否预加载完成
        this.preloadIndex = 0; // 当前预加载的元素下标
        this.isShowingQueue = false; // 正在显示队列界面
        this.activeContainer = {}; // 当前已显示的界面
        this.panelActiveState = {}; // 界面显示情况
        this._resetActiveContainer();
        this.cachePanelParams = []; // 缓存界面显示的参数（未预加载的队列界面显示时参数顺序会混乱）
        this.updatingCacheParams = false; // 正在更新缓存的参数，剔除已显示过的界面的参数

        this.panelContainer = this.panelContainer || {}; // 已实例化的界面
        this.prefabContainer = this.prefabContainer || {}; // 缓存预加载完毕的 prefab
        // this.paths = this.paths || this.addBundlePanels(resources); // resources 文件夹下所有的 prefab 列表，key 为名字，value 为 AssetTable
        this.addBundlePanels(resources);// resources 文件夹下所有的 prefab 列表，key 为名字，value 为 AssetTable
        this.prefabList = this.prefabList || Object.keys(this.paths); // prefab 的名字列表
    }

    /**
     * 重置存储使用中的界面的容器
     */
    _resetActiveContainer () {
        if (!this.activeContainer) {
            this.activeContainer = {};
        }

        for (let key in Panel.PANEL_HIERARCHY) {
            if (Panel.PANEL_HIERARCHY.hasOwnProperty(key)) {
                this.activeContainer[key] = {};
            }
        }
    }

    /**
     * 根据 z 值获取层级的名字
     * @param {Number} hierarchy 层级的 z 值
     * @returns {String} 层级的名字，即 Panel.PANEL_HIERARCHY 的 key 值
     */
    _getHierarchyName (hierarchy: number) {
        let ret = null;
        for (let key in Panel.PANEL_HIERARCHY) {
            if (Panel.PANEL_HIERARCHY.hasOwnProperty(key)) {
                let val = Number(Panel.PANEL_HIERARCHY[key]);
                if (hierarchy === val) {
                    ret = key;
                }
            }
        }

        return ret;
    }

    /**
     * 获取项目所有 prefab 的路径
     */
    _getAllPrefabPaths () {
        // let paths = {};

        // let pathToUuid = loader._resources._pathToUuid;
        // let resPaths = Object.keys(pathToUuid);

        // let { length } = resPaths;
        // for (let i = 0; i < length; i += 1) {
        //     let aliasPath = resPaths[i];
        //     let entryObj = pathToUuid[aliasPath];

        //     let entry = entryObj;
        //     let getTarget = false;
        //     if (entryObj.constructor === Array) {
        //         let { length: entryLength } = entryObj;
        //         for (let j = 0; j < entryLength; j += 1) {
        //             entry = entryObj[j];
        //             // 同名的资源中不会出现同类型的资源，因此只要检测到 prefab 立即跳出循环
        //             if (entry && entry.type && entry.type === Prefab) {
        //                 getTarget = true;
        //                 break;
        //             }
        //         }
        //     }

        //     if (getTarget || (entry && entry.type && entry.type === Prefab)) {
        //         let aliasArr = aliasPath.split('/');
        //         let name = aliasArr[aliasArr.length - 1];

        //         if (added.indexOf(name) > -1) {
        //             console.error(`[panelManager] ${name} of ${aliasPath} clash with ${paths[name]}`);
        //         } else {
        //             paths[name] = aliasPath;
        //             added.push(name);
        //         }
        //     }
        // }

        let paths = {};
        let added = [];
        resources.config.paths.forEach((elems: any[]) => {
            elems.forEach((elem) => {
                let aliasPath: string = elem.path;
                if (aliasPath.startsWith(this.prefabPrefix) && elem.ctor === Prefab) {
                    //属于要加入的列表
                    let aliasArr = aliasPath.split('/');
                    let name = aliasArr[aliasArr.length - 1];

                    if (added.indexOf(name) > -1) {
                        console.error(`[panelManager] ${name} of ${aliasPath} clash with ${paths[name]}`);
                    } else {
                        paths[name] = aliasPath;
                        added.push(name);
                    }
                }
            })
        });

        return paths;
    }

    addBundlePanels (bundle) {

        let paths = {};
        let added = [];
        bundle.config.paths.forEach((elems: any[]) => {
            elems.forEach((elem) => {
                let aliasPath: string = elem.path;
                if (aliasPath.startsWith(this.prefabPrefix) && elem.ctor === Prefab) {
                    //属于要加入的列表
                    let aliasArr = aliasPath.split('/');
                    let name = aliasArr[aliasArr.length - 1];

                    if (added.indexOf(name) > -1) {
                        console.error(`[panelManager] ${name} of ${aliasPath} clash with ${paths[name]}`);
                    } else {
                        paths[name] = aliasPath;
                        added.push(name);
                    }
                }
            })
        });
        this.paths[bundle.config.name] = paths;
        console.log(this.paths);

        // return paths;
    }

    /**
     * 获取某个 prefab 的路径
     * @param {String} name prefab 的名字
     */
    _getPrefabPath (name: string) {
        for (let key in this.paths) {
            if (this.paths[key][name]) {
                return this.paths[key][name];
            }
        }

    }


    /**
     * 预加载界面，初始化界面实例，但是不进行显示
     */
    _preloadPanel () {
        if (this.preloadFinish) {
            return;
        }

        let prefabLength = 0;
        for (const key in this.prefabList) {
            prefabLength++;
        }

        if (this.preloadIndex >= prefabLength) {
            console.log('[panelManager] preload finished!');
            this.preloadFinish = true;
            return;
        }

        if (!this.preloadFlag || this.isShowingPanel) {
            return;
        }

        let name = this.prefabList[this.preloadIndex];
        this.preloadIndex += 1;
        if (this.prefabContainer[name]) {
            this._preloadPanel();
        } else {
            console.log(`[panelManager] preload prefab: ${name}`);
            this._loadPrefab(name, (prefab) => {
                if (prefab) {
                    this.prefabContainer[name] = prefab;
                }

                this._preloadPanel();
            });
        }
    }


    /**
     * 加载 prefab
     * @param {String} name prefab 的名字
     * @param {Function} cb 回调
     */
    _loadPrefab (name: string, cb?: Function) {
        // let path = this._getPrefabPath(name);
        let bundleName = "";
        let path = "";
        for (let key in this.paths) {
            if (this.paths[key][name]) {
                bundleName = key;
                path = this.paths[key][name];
                break;
            }
        }
        assetManager.loadBundle(bundleName, (error, bundle) => {
            bundle.load(path, Prefab, (error, prefab) => {
                console.log(`[panelManager] load: ${name} finished.`);
                if (error) {
                    console.error(error);
                    prefab = null;
                }

                cb(prefab);
            });
        })


    }


    /**
     * 缓存界面显示时 show 接口的参数
     * @param {String} panelName 界面的名字
     * @param {Array} params 界面的 show 接口接收的参数
     */
    _saveParams (panelName: string, params: any) {
        let data = {
            panelName,
            params,
            showed: false,
        };
        this.cachePanelParams.push(data);

        return data;
    }

    /**
     * 界面显示后，从缓存参数的数组中去掉已显示界面的参数
     */
    _updateParams () {
        let { length: cacheLength } = this.cachePanelParams;
        for (let i = 0; i < cacheLength; i += 1) {
            let panelObj = this.cachePanelParams[i];
            let { showed } = panelObj;
            if (showed) {
                this.cachePanelParams.splice(i, 1);
                i -= 1;
                cacheLength = this.cachePanelParams.length;
            }
        }
    }

    /**
     * 尝试进行界面显示，在加载完 prefab 后、隐藏界面后均会调用到此接口
     * 此接口最后不一定会显示界面，因此叫 “尝试”
     */
    _tryShowPanel () {
        let { length } = this.cachePanelParams;
        if (length === 0) {
            this._resetPanelFlag();
            return;
        }

        let allSkip = true;
        for (let i = 0; i < length; i += 1) {
            let panelObject = this.cachePanelParams[i];
            if (panelObject.showed) {
                continue;
            }
            let { panelName, params } = panelObject;
            let panel = this.panelContainer[panelName];
            // 同时显示 n 个界面，可能存在后显示的界面先加载完（同时也先实例化）
            // 因此需要保证界面显示时按顺序显示。遇到没实例化的界面就中断显示流程
            if (!panel) {
                return;
            }

            // 界面上必须挂载与界面名相同的脚本
            let panelComponent = panel.getComponent(Panel);
            if (!panelComponent) {
                console.error(`[panelManager] prefab ${panelName} must have base class Panel.`);
                panelObject.showed = true;
                continue;
            }

            // 队列显示，如果有已经显示的队列界面，先跳过本次显示
            let inQueue = panelComponent.getInQueue();
            if (inQueue) {
                if (!this.isShowingQueue) {
                    this.isShowingQueue = true;
                    allSkip = false;
                    panelObject.showed = true;
                    // 界面队列关闭时 panelActiveState 被设为 false，这里需要设为 true 才会显示
                    this.panelActiveState[panelName] = true;
                    this._initPanel(panelName, params);
                } else {
                    continue;
                }
            } else {
                allSkip = false;
                panelObject.showed = true;
                this._initPanel(panelName, params);
            }
        }

        // 剔除 this.cachePanelParams 中 showed 为 true 的元素
        this._updateParams();

        if (allSkip) {
            this.isShowingPanel = false;
            this._tryResumePreload();
        }
    }

    /**
     * 实际上显示界面的接口
     * @param {String} panelName 界面名
     * @param {Array} params 可选，界面 show 接口接收的参数
     */
    _initPanel (panelName: string, params: any[]) {
        console.log(`[panelManager] ===> showPanel: ${panelName}`);

        if (!this.panelActiveState[panelName]) {
            this._resetPanelFlag();
            return;
        }

        let panel = this.panelContainer[panelName];
        let panelComponent = panel.getComponent(Panel);
        if (!panelComponent) {
            console.error(`[panelManager] prefab ${panelName} must have base class Panel.`);
            return;
        }

        panelComponent.manager = this;

        let parent = this.uiRoot;
        if (!parent) {
            parent = this.getRootNode();
        }

        // 根据界面层级类型进行层级调整
        let hierarchy = panelComponent.getHierachy();
        let hierarchyName = this._getHierarchyName(hierarchy);
        // 如果最大 zIndex 界面是当前界面，则不增加 zIndex
        let highestPanel = this._getHighestPanel(hierarchyName);
        let z = hierarchy;
        if (highestPanel) {
            z = highestPanel.getSiblingIndex();

            if (highestPanel.name !== panelName) {
                z = highestPanel.getSiblingIndex() + 2;
            }
        }

        // 界面挂载到父节点
        if (panel.getParent() !== parent) {
            // panel.parent = parent;
            parent.addChild(panel);
        }

        panel.setSiblingIndex(z);
        // console.log(`${panelName}: ${z}`);

        // 添加到 this.activeContainer 必须放到 this._getHighestZOrPanel() 之后
        // 否则曾经显示过的界面的 zIndex 会影响 this._getHighestZOrPanel() 的返回值
        this._addToActiveContainer(panelName);

        // 调整 mask 的层级
        if (this._isModal(hierarchy)) {
            this._adjustMask();
        }

        // 显示界面
        panel.active = true;

        panelComponent.manager = this;

        // 调用界面的 show 接口
        if (typeof panelComponent.onShow === 'function') {
            panelComponent.onShow(...params);
        }
    }

    /**
     * 调整 mask 的显示和层级
     * @param {cc.Node} panel 界面实例化后的节点
     */
    _setMask (panel: Node) {
        if (this.maskNode) {
            this.maskNode.parent = panel.getParent();
            this.maskNode.setSiblingIndex(panel.getSiblingIndex() - 1);
            this.maskNode.active = true;
        }
    }

    /**
     * 重置 mask 的状态
     */
    _resetMask () {
        if (this.maskNode) {
            this.maskNode.parent = null;
            this.maskNode.setSiblingIndex(Panel.PANEL_HIERARCHY.MODAL);
            this.maskNode.active = false;
        }
    }

    /**
     * 根据当前显示的最高层级的界面，自动调整 mask 的显示与层级
     */
    _adjustMask () {
        let panel = this._getHighestPanel(this._getHierarchyName(Panel.PANEL_HIERARCHY.MODAL));
        if (!panel) {
            this._resetMask();
        } else {
            this._setMask(panel);
        }
    }

    /**
     * 获取某个层级类型下，层级数最高的界面，也可以返回最高层级的数值
     * @param {String} type 层级的名字
     */
    _getHighestPanel (type: string) {
        let container = this.activeContainer[type];
        let ret: Node = null;
        let maxZ = -1;
        for (let panelName in container) {
            if (container.hasOwnProperty(panelName)) {
                let panel = container[panelName];
                let z = panel.getSiblingIndex();


                if (z > maxZ) {
                    maxZ = z;
                    ret = panel;
                }
            }
        }

        return ret;
    }

    _getHighestZOrder (type: string) {
        let panel = this._getHighestPanel(type);
        return panel.getSiblingIndex();
    }

    /**
     * 判断界面是否为模态界面
     * @param {Number} hierarchy 层级类型的类型值
     */
    _isModal (hierarchy: number) {
        return hierarchy === Panel.PANEL_HIERARCHY.MODAL;
    }

    /**
     * 尝试重新进行 prefab 预加载。因为可能不需要预加载，因此为 “尝试”
     */
    _tryResumePreload () {
        if (!this.preloadFinish && !this.isShowingQueue) {
            if (this.needResumePreload) {
                this.setPreload(true);
            }
        } else {
            this.needResumePreload = false;
        }
    }

    /**
     * 将界面加入到显示的界面的存储容器中
     * @param {String} name 界面名
     */
    _addToActiveContainer (name: string) {
        let panel = this.panelContainer[name];
        let component = panel.getComponent(Panel);
        let hierarchy = component.getHierachy();
        let containerName = this._getHierarchyName(hierarchy);
        let container = this.activeContainer[containerName];
        container[name] = panel;
    }

    /**
     * 将界面从存储显示的界面的容器中移除
     * @param {String} name 界面名
     */
    _removeFromActiveContainer (name: string) {
        let panel = this.panelContainer[name];
        let component = panel.getComponent(Panel);
        let hierarchy = component.getHierachy();
        let containerName = this._getHierarchyName(hierarchy);
        let container = this.activeContainer[containerName];
        delete container[name];
    }

    /**
     * 重置界面显示的标记值，目前有
     * 1. 是否正在显示界面
     * 2. 是否正在显示队列界面
     */
    _resetPanelFlag () {
        this.isShowingPanel = false;
        this.isShowingQueue = false;
    }

    /**
     * 获取某个资源是否被其他界面依赖，可以强制过滤某些界面
     * @param {String} uuid 资源的 uuid
     * @param {Name} exceptPanel 排除的界面
     */
    _isDependedByOtherPanel (uuid: string, exceptPanel: string) {
        let paths = Object.keys(this.paths);
        let { length } = paths;
        let ret = false;
        for (let i = 0; i < length; i += 1) {
            let panelName = paths[i];
            if (panelName !== exceptPanel) {
                let path = this._getPrefabPath(panelName);
                let deps = loader.getDependsRecursively(path);
                if (deps.indexOf(uuid) > -1) {
                    console.warn(`[panelManager] ${uuid} is depended by ${panelName}. Can't be release.`);
                    ret = true;
                    break;
                }
            }
        }

        return ret;
    }

    getRootNode () {
        if (this.uiRoot && isValid(this.uiRoot)) {
            return this.uiRoot;
        }

        let node = find("Canvas");
        if (!node) {
            //需要创建一个
            node = new Node("Canvas");
            node.addComponent(CanvasComponent);
            node.addComponent(UITransformComponent);
            let widget = node.addComponent(WidgetComponent);
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;

            let cameraNode = new Node("Camera");
            cameraNode.parent = node;
            let cameraCmp = cameraNode.addComponent(CameraComponent);
            cameraCmp.priority = 99999;
            cameraCmp.clearFlags = gfx.ClearFlagBit.DEPTH;
            cameraCmp.clearDepth = 1;
            cameraCmp.projection = renderer.scene.CameraProjection.ORTHO;
            cameraCmp.fovAxis = renderer.scene.CameraFOVAxis.VERTICAL;
            cameraCmp.fov = 45;
            cameraCmp.visibility = Layers.BitMask.UI_2D;


            director.getScene().addChild(node);

        }

        this.uiRoot = node;

        return node;
    }
}