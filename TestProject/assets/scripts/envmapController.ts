import { TextureCube,_decorator, Component, Button, labelAssembler, game, director, Node, Scene, renderer, CameraComponent, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('envMapControl')
export class envMapControl extends Component {
    @property(TextureCube)
    envmapNormal: TextureCube | null;
    @property(TextureCube)
    envmapConvolution: TextureCube | null;
    private _skyBox : renderer.scene.Skybox=null!; 
    @property(Button)
    button: Button | null = null;
    label: Label|null = null;
    start() {
        const pipeline = director.root!.pipeline;
        this._skyBox = pipeline.pipelineSceneData.skybox;
        this.label = this.button.getComponentInChildren(Label);
        if (this._skyBox.envmap.isUsingOfflineMipmaps()) {
            this.label.string = "ConvolutionMap";  
        }else{
            this.label.string = "Normal"; 
        }
    }

    update(deltaTime: number) {
        
    }
    onLoad () {
        if (this.button!=null)
            this.button.node.on(Button.EventType.CLICK, this.switchEnvmap, this);
    }
    switchEnvmap (button: Button)
    {
        this._skyBox.envmap = this._skyBox.envmap === this.envmapNormal ? this.envmapConvolution : this.envmapNormal;
        if (this._skyBox.envmap === this.envmapNormal) {
            this.label.string = "Normal"
        } else {
            this.label.string = "ConvolutionMap"
        }
    }
}


