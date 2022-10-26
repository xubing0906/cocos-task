import { _decorator, Component, Node, Camera, RenderTexture, TextureCube, director, Vec3, math, Material, native, view, Texture2D, assetManager, ImageAsset, Quat, Vec4, Mat4} from 'cc';
import { NATIVE } from 'cc/env';
import { CaptureUtils } from './Test'
import { protocol } from 'electron';
const { ccclass, property } = _decorator;

@ccclass('cameraController')
export class cameraController extends Component {
    [x: string]: any;
    // @property(RenderTexture)
    // rt: RenderTexture | null;
    @property(String)
    renderTexName = "renderTex1";
    
    @property(Camera)
    camera:|Camera|null;

    @property(Node)
    protected testNode: Node | null = null;

    @property(Texture2D)
    textutre: Texture2D | null = null;

    private _quat: Quat = new Quat();//爱心旋转
    start() {
        // this._camera = this.getComponent(Camera);
        // this._width = this._camera.camera.width;
        // this._height = this._camera.camera.height;

        // this._renderTex = new RenderTexture();
        // this._renderTex.reset({
        //     width: this._width,
        //     height: this._height,
        // });
        // if (this._camera) {
        //     this._camera.targetTexture = this._renderTex;
        // }

       
        // this.scheduleOnce(function(){
        //     if (this.material) {
        //         this.material.setProperty(this.renderTexName, this._renderTex, 0);
        //     }
        // });   
    
    }
    update(deltaTime: number) {
        Quat.fromEuler(this._quat, 0, 60 * deltaTime, 0);
        this.node.rotate(this._quat);
    }

    onFocusInEditor()
    {
        //this.capturePlanar();
    } 

    public capturePlanar () {
        if (!this.camera) {
            console.log('the reflection camera is null,please set the reflection camera');
            return;
        }

        const planeNormal = this.testNode?.up;
        const planePos = this.testNode?.getWorldPosition();
        Vec3.add(planePos!, planePos!, planeNormal!);

        // 获取视空间平面，使用反射矩阵，将图像根据平面对称上下颠倒
        const planVS = new Vec4(planeNormal!.x, planeNormal!.y, planeNormal!.z, -Vec3.dot(planeNormal!, planePos!));
        const reflectionMat = this.caculateReflectionMatrixNew(planVS);

        // const mat = new Mat4();
        // Mat4.multiply(mat, reflectionMat, this.testNode.worldMatrix);

        // const pos = new Vec3();
        // Vec3.transformMat4(pos, this.camera.node.getWorldPosition(), reflectionMat);

        // this.node.worldPosition = pos;
        
        let refPos = new Vec3();
        Vec3.subtract(refPos,this.testNode.worldPosition,this.camera.node.worldPosition);

        Vec3.project(refPos, refPos, this.testNode.up);

        refPos.multiplyScalar(2);

        refPos.add(this.camera.node.worldPosition);

        this.node.worldPosition = refPos;

    



        let forward = new Vec3();
        Vec3.project(forward, this.camera.node.forward, this.testNode.up);

        forward.multiplyScalar(-2);

        forward.add(this.camera.node.forward);

        this.node.forward = forward;



      
    }

    public caculateReflectionMatrixNew (plane:Vec4) {
        const reflectM = new Mat4();
        reflectM.m00 = 1.0 - 2.0 * plane.x * plane.x;
        reflectM.m04 = -1.0 * plane.x * plane.y;
        reflectM.m08 = -2.0 * plane.x * plane.z;
        reflectM.m12 = -2.0 * plane.w * plane.x;

        reflectM.m01 = -2.0 * plane.y * plane.x;
        reflectM.m05 = 1.0 - 2.0 * plane.y * plane.y;
        reflectM.m09 = -2.0 * plane.y * plane.z;
        reflectM.m13 = -2.0 * plane.w * plane.y;

        reflectM.m02 = -2.0 * plane.x * plane.z;
        reflectM.m06 = -2.0 * plane.y * plane.z;
        reflectM.m10 = 1.0 - 2.0 * plane.z * plane.z;
        reflectM.m14 = -2.0 * plane.w * plane.z;

        reflectM.m03 = 0.0;
        reflectM.m07 = 0.0;
        reflectM.m11 = 0.0;
        reflectM.m15 = 1.0;
        return reflectM;
    }
}

