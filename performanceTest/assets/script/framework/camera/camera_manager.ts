
import { _decorator, Component, Camera, Vec3, SystemEventType } from 'cc';
import { CustomEvent } from '../event/custom_event';
import { CameraController, CameraMoveArgs } from './camera_controller';
const { ccclass, property } = _decorator;

export class CAMERA_CONTROLLER_TYPE {
    public static ROAM = "RoamCamera"; // 漫游相机
    public static ORBIT = "OrbitCamera"; // 轨道相机
    public static FOLLOW = "FollowCamera"; // 跟随相机
    public static PREVIEW = "PreviewCamera"; // 预览相机
}

export class CAMERA_EASING_TYPE {
    public static LINEAR = "linear";
    public static CIRCOUT = "circOut";
}

@ccclass('CameraManager')
export class CameraManager extends Component {
    public static mainCamera: Camera | null = null;

    oldCameraPos: Vec3 = new Vec3();
    oldCameraForward: Vec3 = new Vec3();

    onEnable () {
        CameraManager.mainCamera = this.node.getComponent(Camera);
        CustomEvent.on("changeCameraType", this.changeCameraType, this);
        this.node.on(SystemEventType.TRANSFORM_CHANGED, this.onCameraTransformChange, this);

        CustomEvent.on('moveCameraToTarget', this.moveCameraToTarget, this);
    }

    onDisable () {
        CustomEvent.off("changeCameraType", this.changeCameraType, this);
        this.node.off(SystemEventType.TRANSFORM_CHANGED, this.onCameraTransformChange, this);

        CustomEvent.off('moveCameraToTarget', this.moveCameraToTarget, this);
    }

    start () {

    }

    changeCameraType (type: string) {
        let camera = this.node.getComponent(type);
        if (camera) {
            this.forbiddenBaseCamera();
            camera.enabled = true;
        }
    }

    forbiddenBaseCamera () {
        let arrCamera = this.getComponents(CameraController);
        arrCamera.forEach((camera) => {
            camera.enabled = false;
        });
    }

    onCameraTransformChange () {
        let cameraForward = this.node.forward.clone();
        let cameraPos = this.node.position.clone();

        if (!Vec3.equals(this.oldCameraPos, cameraPos) || !Vec3.equals(this.oldCameraForward, cameraForward)) {
            //通知摄像机改变
            CustomEvent.dispatchEvent('CameraTransformChanged');

            this.oldCameraForward = cameraForward;
            this.oldCameraPos = cameraPos;
        }
    }

    moveCameraToTarget (target: CameraMoveArgs, callback?: Function) {
        let arrCamera = this.getComponents(CameraController);
        for (let idx = 0; idx < arrCamera.length; idx++) {
            let camera = arrCamera[idx];

            if (camera && camera.enabled) {
                camera.moveCameraToTarget(target, callback);
            }
        }


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
