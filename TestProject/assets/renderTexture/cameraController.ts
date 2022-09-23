import { _decorator, Component, Node, Camera, RenderTexture, TextureCube, director, Vec3, math, Material, native, view, Texture2D, assetManager, ImageAsset, Quat} from 'cc';
import { NATIVE } from 'cc/env';
import { CaptureUtils } from './Test'
import { protocol } from 'electron';
const { ccclass, property } = _decorator;

@ccclass('cameraController')
export class cameraController extends Component {
    [x: string]: any;
    // @property(RenderTexture)
    // rt: RenderTexture | null;
    @property([Material])
    material: Material[] = [];
    @property(String)
    renderTexName = "renderTex1";
    @property(Camera)
    camera:|Camera|null;
    _camera: Camera | null;
    private _width = 512;
    private _height = 512;
    private _renderTex = null;
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

        // if (this.material) {
        //     // let defines = this.material.passes[0].defines;
        //     // defines["SAMPLE_FROM_RT"] = true;
        //     //this.material.recompileShaders(defines);
        //     this.material.setProperty(this.renderTexName, this._renderTex, 0);
        // }
        // this.scheduleOnce(function(){
        //     const pixelData = this._renderTex.readPixels();
        //     console.log(pixelData);
        //     //let path = "D://cocosProject//cocos-task//TestProject//assets//renderTexture//testRT.png";
        //     //native.saveImageData(pixelData, this._renderTex.width, this._renderTex.height, path);
        //     // let url = CaptureUtils.toImgUrl(this._renderTex);
        //     // assetManager.loadRemote<ImageAsset>(url, { ext: '.png' }, (err, img) => { 
        //     //     let texture = new Texture2D;
        //     //     texture.image = img;
        //     //     this.material.setProperty("mainTexture", texture, 0);
        //     // });   
        // });   
        // let ccsharp = sharp("cccc");
        // console.log(ccsharp.metadata);
    
    }
    update(deltaTime: number) {
        Quat.fromEuler(this._quat, 0, 120 * deltaTime, 0);
        this.node.rotate(this._quat);
    }
}


