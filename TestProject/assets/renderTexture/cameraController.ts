import sharp, { Sharp } from 'sharp';
import { _decorator, Component, Node, Camera, RenderTexture, TextureCube, director, Vec3, math, Material, native, view, Texture2D, assetManager, ImageAsset} from 'cc';
import { NATIVE } from 'cc/env';
import { CaptureUtils } from './Test'
import { protocol } from 'electron';
const { ccclass, property } = _decorator;

@ccclass('cameraController')
export class cameraController extends Component {
    [x: string]: any;
    // @property(RenderTexture)
    // rt: RenderTexture | null;
    @property(Material)
    material: Material | null;
    @property(String)
    renderTexName = "renderTex1";
    @property(Camera)
    camera:|Camera|null;
    _camera: Camera | null;
    private _width = 0;
    private _height = 0;
    private _renderTex = null;

    onFocusInEditor()
    {
        this._renderTex = new RenderTexture();
        this._renderTex.reset({
            width: this.camera.camera.width,
            height: this.camera.camera.height,
        });
        if (this.camera) {
            this.camera.targetTexture = this._renderTex;
        }
        this.scheduleOnce(function(){
            const pixelData = new Uint8Array(this._renderTex.width * this._renderTex.height * 4);
            this._renderTex.readPixels(0, 0,
                this._renderTex.width, this._renderTex.height,
                pixelData);

          console.log(pixelData);
          if (this.material) {
            this.material.setProperty("mainTexture", this._renderTex, 0);
        }
        });   
    }
    messageTest(fileName:string)
    {

    }
    
    start() {
        this._camera = this.getComponent(Camera);
        this._width = this._camera.camera.width;
        this._height = this._camera.camera.height;

        this._renderTex = new RenderTexture();
        this._renderTex.reset({
            width: this._width,
            height: this._height,
        });
        if (this._camera) {
            this._camera.targetTexture = this._renderTex;
        }

        // if (this.material) {
        //     // let defines = this.material.passes[0].defines;
        //     // defines["SAMPLE_FROM_RT"] = true;
        //     //this.material.recompileShaders(defines);
        //     this.material.setProperty(this.renderTexName, this._renderTex, 0);
        // }
        this.scheduleOnce(function(){
            const pixelData = new Uint8Array(this._renderTex.width * this._renderTex.height * 4);
            this._renderTex.readPixels(0, 0,
                this._renderTex.width, this._renderTex.height,
                pixelData);

            //let path = "D://cocosProject//cocos-task//TestProject//assets//renderTexture//testRT.png";
            //native.saveImageData(pixelData, this._renderTex.width, this._renderTex.height, path);
            // let url = CaptureUtils.toImgUrl(this._renderTex);
            // assetManager.loadRemote<ImageAsset>(url, { ext: '.png' }, (err, img) => { 
            //     let texture = new Texture2D;
            //     texture.image = img;
            //     this.material.setProperty("mainTexture", texture, 0);
            // });   
        });   
        // let ccsharp = sharp("cccc");
        // console.log(ccsharp.metadata);
    
    }
    toB64(arrayBuffer: ArrayBuffer): string {

        let canvas = document.createElement('canvas');

        let winSize = view.getVisibleSize();

        let width = canvas.width = Math.floor(winSize.width);

        let height = canvas.height = Math.floor(winSize.height);

        let ctx = canvas.getContext('2d')!;

        let imageU8Data = new Uint8Array(arrayBuffer);

        let rowBytes = width * 4;

        let rowBytesh = height * 4;

        for (let row = 0; row < rowBytesh; row++) {

            let sRow = row;

            let imageData = ctx.createImageData(width, 1);

            let start = sRow * rowBytes;

            for (let i = 0; i < rowBytes; i++) {

                imageData.data[i] = imageU8Data[start + i];

            }

            ctx.putImageData(imageData, 0, row);

        }

        var base64 = canvas.toDataURL("image/png"); //压缩语句
        //url = canvas.toDataURL('image/png');


        return base64;

    }
    update(deltaTime: number) {
    }
}


