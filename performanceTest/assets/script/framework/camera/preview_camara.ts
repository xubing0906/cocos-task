
import { CCFloat, EventTouch, Quat, sys, Touch, Vec3 } from 'cc';
import { _decorator, Component, Node, Camera, EventMouse, Vec2 } from 'cc';
import Util from '../util/util';
import { CameraController } from './camera_controller';
import { CameraManager } from './camera_manager';
const { ccclass, property } = _decorator;

let _tmpVec2 = new Vec2();
let _tmpVec2_2 = new Vec2();

@ccclass('PreviewCamara')
export class PreviewCamara extends CameraController {

    @property
    _viewNode: Node | null = null;
    @property({ type: Node, tooltip: '查看的对象节点' })
    get viewNode () {
        return this._viewNode;
    }
    set viewNode (node: Node) {
        this._viewNode = node;

        if (this._viewNode) {
            this.originScale = this.viewNode.scale;
        }
    }

    //鼠标按下的位置
    private mouseDownLocation: Vec2 | undefined = undefined;

    @property({ type: CCFloat, tooltip: '节点旋转的速度' })
    public rotateSpeed: number = 1;

    @property({ type: CCFloat, tooltip: '每次缩放的比例' })
    public scaleFactor: number = 0.1;

    @property({ type: CCFloat, tooltip: '最大缩放比例' })
    public maxScale: number = 10;

    @property({ type: CCFloat, tooltip: '最小缩放' })
    public minScale: number = 0.1;

    @property({ type: CCFloat, tooltip: '最大偏移量' })
    private maxOffsetY: number = 10;

    @property({ type: CCFloat, tooltip: '最小偏移量' })
    private minOffsetY: number = -10;

    @property({ tooltip: "是否允许缩放" })
    public enableScale: boolean = true;

    @property({ tooltip: "是否允许X轴旋转" })
    public enableRotateXAxis: boolean = true;

    @property({ tooltip: "是否允许Y轴旋转" })
    public enableRotateYAxis: boolean = true;

    @property({ tooltip: "是否允许上下拖动" })
    private enableMoveYAxis: boolean = true;

    @property({ type: CCFloat, tooltip: '每次移动的比例' })
    private moveFactor: number = 0.1;

    //查看节点 初始缩放尺寸
    private initScale: number = 1;

    // //记录触摸ID
    // private touchIds: number[] = [];

    // //记录触摸的location信息
    // private touchLocationMap: Record<number, Record<string, Vec2>> = {};

    //上一次不为0的偏移量
    // private preNotZeroOffsetX: number | undefined;

    touches: Touch[] = []; //引入该变量，为修复引擎 再点击事件中传入的touch会出现一个及多个的情况，导致在缩放及拖动中来回切换的问题

    public enableAutoRot: boolean = false;

    _scaleFactor: number = 0.1;
    _maxScale: number = 10;
    _minScale: number = 0.1;
    originScale = new Vec3();

    touch1Pos = new Vec2();
    touch2Pos = new Vec2();

    start () {
        this._scaleFactor = this.scaleFactor;
        this._maxScale = this.maxScale;
        this._minScale = this.minScale;
        if (this.viewNode) {
            this.originScale = this.viewNode.scale;
        }

    }

    onMouseDown (event: EventMouse) {
        this.mouseDownLocation = event.getLocation().clone();
    }

    resetViewNode () {
        if (this.viewNode) {
            this.setNodeScale(1);
            this.viewNode.eulerAngles = new Vec3(0, 0, 0);
        }

    }

    onMouseMove (event: EventMouse) {
        if (this.mouseDownLocation === undefined || this.viewNode === null) return;
        let curLocation = event.getLocation();
        let offsetX = curLocation.x - this.mouseDownLocation!.x;
        let offsetY = curLocation.y - this.mouseDownLocation!.y;
        let euler = Quat.fromEuler(new Quat(), this.enableRotateXAxis ? -offsetY * this.rotateSpeed : 0, this.enableRotateYAxis ? offsetX * this.rotateSpeed : 0, 0);
        this.viewNode.rotate(euler, Node.NodeSpace.WORLD);
        this.mouseDownLocation = event.getLocation().clone();
    }

    onMouseUp () {
        this.mouseDownLocation = undefined;
    }

    private setNodeScale (scale: number) {
        if (scale < this.minScale * this.initScale) {
            scale = this.minScale * this.initScale;
        } else if (scale > this.maxScale * this.initScale) {
            scale = this.maxScale * this.initScale;
        }

        this.viewNode!.setScale(new Vec3(scale, scale, scale));
    }

    onMouseWheel (event: EventMouse) {
        if (!this.enableScale) {
            return;
        }

        let wheel = 0;
        if (event.getScrollY() > 0) {
            wheel = 1;
        } else if (event.getScrollY() < 0) {
            wheel = -1;
        }
        let curScale = this.viewNode!.scale.x;
        let targetScale = curScale + this.scaleFactor * wheel;
        this.setNodeScale(targetScale);
    }

    // private setInitTouchLocationInfo (event: EventTouch) {
    //     let touchId = event.getID();
    //     if (touchId != null) {
    //         let location = event.getLocation();
    //         if (!this.touchLocationMap[touchId]) {
    //             this.touchLocationMap[touchId] = {
    //                 startLocation: location,
    //                 preLocation: location,
    //                 curLocation: location
    //             }
    //         }
    //     }
    // }

    onTouchStart (event: EventTouch) {
        // let touchId = event.getID();
        // if (touchId != null && this.touchIds.indexOf(touchId) === -1) {
        //     this.touchIds.push(touchId);
        //     this.setInitTouchLocationInfo(event);
        // }

        Util.remove(this.touches, (touch: Touch) => {
            return touch.getID() === event.touch!.getID();
        });

        this.touches.push(event.touch!);

        this.mouseDownLocation = event.getLocation().clone();
    }

    onTouchMove (event: EventTouch) {
        // let touchId = event.getID();
        // if (touchId !== null) {
        //     let location = event.getLocation();
        //     if (!this.touchLocationMap[touchId]) {
        //         this.setInitTouchLocationInfo(event);
        //     } else {
        //         this.touchLocationMap[touchId] = {
        //             preLocation: this.touchLocationMap[touchId].curLocation,
        //             curLocation: location
        //         }
        //     }
        // }
        // let touchId = event.getID();
        // if (touchId !== null) {
        //     if (!this.touchLocationMap[touchId]) {
        //         this.setInitTouchLocationInfo(event);
        //         return;
        //     }
        // }

        //更新数据
        this.touches.forEach((touch, idx) => {
            if (event.getID() === touch.getID()) {
                this.touches[idx] = event.touch;
            }

        });

        if (this.viewNode === null) return;


        if (this.touches.length === 1) {
            if (this.mouseDownLocation) {
                let curLocation = event.getLocation();
                let offsetX = curLocation.x - this.mouseDownLocation!.x;
                let offsetY = curLocation.y - this.mouseDownLocation!.y;
                let euler = Quat.fromEuler(new Quat(), this.enableRotateXAxis ? -offsetY * this.rotateSpeed : 0, this.enableRotateYAxis ? offsetX * this.rotateSpeed : 0, 0);
                this.viewNode.rotate(euler, Node.NodeSpace.WORLD);
                this.mouseDownLocation = event.getLocation().clone();
            }
        } else if (this.touches.length == 2) {
            this.touches[0].getLocation(this.touch1Pos);
            this.touches[1].getLocation(this.touch2Pos);
            let prePos1 = new Vec2();
            let prePos2 = new Vec2();
            this.touches[0].getPreviousLocation(prePos1);
            this.touches[1].getPreviousLocation(prePos2);
            Vec2.subtract(_tmpVec2, this.touch1Pos, prePos1);
            Vec2.subtract(_tmpVec2_2, this.touch2Pos, prePos2);


            if ((_tmpVec2.y > 0 && _tmpVec2_2.y > 0) || (_tmpVec2.y < 0 && _tmpVec2_2.y < 0)) {
                //属于镜头上移下移
                let max = Math.abs(_tmpVec2.y) > Math.abs(_tmpVec2_2.y) ? _tmpVec2.y : _tmpVec2_2.y;

                if (this.enableMoveYAxis) {
                    let pos = this.viewNode.position.clone();
                    pos.y += max * this.moveFactor;
                    this.viewNode.position = pos;

                }
            } else {
                //缩放
                let preDistance = Vec2.distance(prePos2, prePos1);
                let curDistance = Vec2.distance(this.touch2Pos, this.touch1Pos);
                let offset = curDistance - preDistance;
                if (offset === 0) {
                    return;
                }

                offset = offset > 0 ? 1 : -1;

                if (!this.enableScale) {
                    return;
                }

                let curScale = this.viewNode!.scale.x;
                let targetScale = curScale + this.scaleFactor * offset / 4;
                console.log(offset, curScale, targetScale);

                this.setNodeScale(targetScale);
            }
        }
    }

    onTouchEndCancel (event: EventTouch) {
        // let touchId = event.getID();

        // if (touchId !== null) {
        //     let index = this.touchIds.indexOf(touchId);
        //     console.log("index:", index);
        //     if (index > -1) {
        //         this.touchIds.splice(index, 1);
        //     }
        //     delete this.touchLocationMap[touchId];
        //     this.preNotZeroOffsetX = undefined;

        // }
        this.mouseDownLocation = undefined;

        Util.remove(this.touches, (touch: Touch) => {
            return touch.getID() === event.touch!.getID();
        });
    }

    update () {
        // console.log(this.touchIds);
        // if (!sys.isMobile) {
        //     return;
        // }

        // //多指操作 放大缩小
        // if (this.touchIds.length >= 2) {
        //     let touchId1 = this.touchIds[0];
        //     let touchId2 = this.touchIds[1];
        //     let touchInfo1 = this.touchLocationMap[touchId1];
        //     let touchInfo2 = this.touchLocationMap[touchId2];
        //     if (!touchInfo1 || !touchInfo2) return;


        //     // Vec2.subtract(_tmpVec2, touchInfo1.preLocation, touchInfo1.curLocation);
        //     // Vec2.subtract(_tmpVec2_2, touchInfo2.preLocation, touchInfo2.curLocation);
        //     // if ((_tmpVec2.y > 0 && _tmpVec2_2.y > 0) || (_tmpVec2.y < 0 && _tmpVec2_2.y < 0)) {
        //     //     //属于镜头上移下移
        //     //     let max = Math.abs(_tmpVec2.y) > Math.abs(_tmpVec2_2.y) ? _tmpVec2.y : _tmpVec2_2.y;

        //     //     if (this.enableMoveYAxis) {
        //     //         let pos = this.viewNode.position.clone();
        //     //         pos.y += max * this.moveFactor;
        //     //         this.viewNode.position = pos;

        //     //     }
        //     // } else {
        //     //缩放
        //     let preDistance = Vec2.distance(touchInfo2.preLocation, touchInfo1.preLocation);
        //     let curDistance = Vec2.distance(touchInfo2.curLocation, touchInfo1.curLocation);
        //     console.log(curDistance, preDistance);
        //     let offset = curDistance - preDistance > 0 ? 1 : -1;
        //     if (!this.enableScale) {
        //         return;
        //     }

        //     let curScale = this.viewNode!.scale.x;
        //     let targetScale = curScale + this.scaleFactor * offset / 4;
        //     console.log(offset, curScale, targetScale);

        //     this.setNodeScale(targetScale);
        //     // this.viewNode!.setScale(new Vec3(targetScale, targetScale, targetScale));
        //     // }
        // } else if (this.touchIds.length == 1) {//单指操作  旋转
        //     let touchId = this.touchIds[0];
        //     let locationInfo = this.touchLocationMap[touchId];
        //     if (!locationInfo) return;
        //     let offsetX = locationInfo.curLocation.x - locationInfo.preLocation.x;
        //     let offsetY = locationInfo.curLocation.y - locationInfo.preLocation.y;
        //     //长按  自动旋转
        //     if (this.enableAutoRot) {
        //         if (offsetX == 0) {
        //             if (this.preNotZeroOffsetX !== undefined) {
        //                 offsetX = this.preNotZeroOffsetX;
        //             } else {
        //                 offsetX = 1;
        //             }
        //         } else {
        //             this.preNotZeroOffsetX = offsetX;
        //         }
        //         let euler = Quat.fromEuler(new Quat(), this.enableRotateXAxis ? -offsetY * this.rotateSpeed : 0, this.enableRotateYAxis ? offsetX * this.rotateSpeed : 0, 0);
        //         this.viewNode!.rotate(euler, Node.NodeSpace.WORLD);
        //     }
        // }
    }

    /**
     * 设置模型缩放值
     * @param maxScale 最大值
     * @param minScale 最小值
     * @param scaleFactor 每次缩放的数值
     */
    setModelScale (maxScale: number, minScale: number, scaleFactor: number) {
        this.maxScale = maxScale;
        this.minScale = minScale;
        this.scaleFactor = scaleFactor;
    }

    revertModelScale () {
        this.maxScale = this._maxScale;
        this.minScale = this._minScale;
        this.scaleFactor = this._scaleFactor;
    }

}
