import {ReflectionProbeManager,_decorator, Component, Node, RenderTexture, director, Director, Camera, native, renderer, Label, Root, Sprite, SpriteFrame, resources, assetManager, ImageAsset, Texture2D, Light, Color, Quat, UITransform, Vec2, Size, Material } from 'cc';
import { HTML5, NATIVE, PREVIEW } from 'cc/env';
const { ccclass, property } = _decorator;
@ccclass('renderTextureTest')
export class renderTextureTest extends Component {
    @property(Camera)
    public camera: Camera | null = null;
    @property(Material)
    public material: Material | null = null;
    private _rt = null;
    private _width = 0;
    private _height = 0;
    start() {
    }
    update(deltaTime: number) {
    }
    async waitForNextFrame() {
        return new Promise<void>((resolve, reject) => {
            director.once(Director.EVENT_END_FRAME, () => {
                resolve();
            });
        });
    }
    resetInEditor(){
    }
    onFocusInEditor()
    {
        let caps =  director.root.device.capabilities;
        if (caps.clipSpaceMinZ == -1) {
        }
        if (caps.clipSpaceSignY == -1) {
        }
        this._rt = new RenderTexture();
        this._rt.reset({ width: this.camera.camera.width, height: this.camera.camera.width });
        this.camera.targetTexture = this._rt;
        this._width = this.camera.camera.width;
        this._height = this.camera.camera.height;


        this.scheduleOnce(function () {
            let pixelData = this._rt.readPixels();
            let caps =  director.root.device.capabilities;
            if (caps.clipSpaceMinZ == -1) {
                pixelData = this.flipImageX(pixelData);
            }
            if (caps.clipSpaceSignY == -1) {
                pixelData = this.flipImageY(pixelData);
            }
            pixelData = this.flipImageY(pixelData);
            if (this.material) {
                this.material.setProperty("mainTexture", this._rt, 0);
            }
            console.log(this._width);
            console.log(this._height);
            const path = 'D:/cocosProject/cocos-task/TestProject/assets/renderTexture/';
            const fileName = 'testRendercc.png';
            let fullpath = path + fileName;
            console.log("full path========"+fullpath);

            // this.saveDataToImage(pixelData, this._width, this._height, fullpath, (res) => {
            //     console.log(res);
            // });
            //this.renderCamera(this.camera);
            ReflectionProbeManager.probeManager.addProbe(this.camera);
            
        });
    }
    flipImageX(data:Uint8Array){
        //图片数组纵向翻转
        let newData = new Uint8Array(data.length);
        for(let i = 0; i < this._height; i++){
            for(let j = 0; j < this._width; j++){
                let index = (this._width * i + j) * 4;
                let newIndex = (this._width * (this._height - i - 1) + j) * 4;
                newData[newIndex] = data[index];
                newData[newIndex + 1] = data[index + 1];
                newData[newIndex + 2] = data[index + 2];
                newData[newIndex + 3] = data[index + 3];
            }
        }
        return newData;
    }
    flipImageY(data: Uint8Array) {
        //图片数组横向翻转
        let newData = new Uint8Array(data.length);
        for(let i = 0; i < this._height; i++){
            for(let j = 0; j < this._width; j++){
                let newIndex = (this._width * i + j) * 4;
                let index =(this._width - j + i * this._width) * 4;
                newData[newIndex] = data[index];
                newData[newIndex + 1] = data[index + 1];
                newData[newIndex + 2] = data[index + 2];
                newData[newIndex + 3] = data[index + 3];
            }
        }
        return newData;
    }


}


