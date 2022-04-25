
import { _decorator, Component, Node, EventMouse, EventTouch, systemEvent, SystemEvent, Camera, Vec3, Tween } from 'cc';
import { PanelManager } from '../ui/panel_manager';
import { CameraManager } from './camera_manager';
const { ccclass, property } = _decorator;

export class CameraMoveArgs {
    pos?: Vec3;
    euler?: Vec3;
    time: number = -1;
    easingStr: string = "linear";
}

@ccclass('CameraController')
export class CameraController extends Component {
    public static controllerTypes = [];
    nodeCameraUI: Node;
    isMoving = false;
    move2TargetSpeed = 300;
    tweenMoving: Tween<Node>;

    onLoad () {
        //@ts-ignore
        CameraController.controllerTypes.push(this.__classname__);
        this.nodeCameraUI = PanelManager.instance.getRootNode();
    }

    onEnable () {
        CameraManager.mainCamera = this.getComponent(Camera);
        if (!this.nodeCameraUI || !this.nodeCameraUI.isValid) {
            this.nodeCameraUI = PanelManager.instance.getRootNode();
        }

        if (this.nodeCameraUI) {
            this.nodeCameraUI.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
            this.nodeCameraUI.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.nodeCameraUI.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.nodeCameraUI.on(Node.EventType.TOUCH_END, this.onTouchEndCancel, this);
            this.nodeCameraUI.on(Node.EventType.TOUCH_CANCEL, this.onTouchEndCancel, this);

            this.nodeCameraUI.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.nodeCameraUI.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
            this.nodeCameraUI.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
            this.nodeCameraUI.on(Node.EventType.MOUSE_LEAVE, this.onMouseOut, this);
        }

        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable () {
        if (this.nodeCameraUI) {
            this.nodeCameraUI.off(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
            this.nodeCameraUI.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.nodeCameraUI.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.nodeCameraUI.off(Node.EventType.TOUCH_END, this.onTouchEndCancel, this);
            this.nodeCameraUI.off(Node.EventType.TOUCH_CANCEL, this.onTouchEndCancel, this);

            this.nodeCameraUI.off(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.nodeCameraUI.off(Node.EventType.MOUSE_UP, this.onMouseUp, this);
            this.nodeCameraUI.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
            this.nodeCameraUI.off(Node.EventType.MOUSE_LEAVE, this.onMouseOut, this);
        }

        systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }


    start () {
        // [3]
    }

    protected onMouseWheel (event: EventMouse) {

    }

    protected onMouseMove (event: EventMouse) {

    }

    protected onMouseOut (event: EventMouse) {

    }

    protected onMouseUp (event: EventMouse) {

    }

    protected onMouseDown (event: EventMouse) {

    }

    protected onTouchStart (event: EventTouch) {

    }

    protected onTouchMove (event: EventTouch) {

    }

    protected onTouchEndCancel (event: EventTouch) {

    }

    protected onKeyDown (event: any) {
    }

    protected onKeyUp (event: any) {

    }

    /**
     * 相机定点漫游
     * @param posTarget 位置
     * @param eulerTarget 旋转极爱哦度
     * @param time 消耗时间
     * @param easingStr easing方式
     * @param callback 回调
     */
    moveCameraToTarget (target: CameraMoveArgs, callback?: Function) {
        this.isMoving = true;


        if (target.time === -1) {
            target.time = Vec3.distance(target.pos, this.node.position) / this.move2TargetSpeed;
        }

        if (this.tweenMoving) {
            this.tweenMoving.stop();
            this.tweenMoving = null;
        }


        // @ts-ignore
        this.tweenMoving = new Tween(this.node).to(target.time, { position: target.pos, eulerAngles: target.euler }, { easing: target.easingStr }).call(() => {
            this.isMoving = false;
            this.tweenMoving = null;

            callback && callback();
        }).start();
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
