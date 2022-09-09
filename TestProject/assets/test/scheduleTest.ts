import { _decorator, Component, Node, director, FogInfo, Light,ShadowsInfo,AmbientInfo,SkyboxInfo,OctreeInfo} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('scheduleTest')
export class scheduleTest extends Component {
    start() {
        let scene = director.getScene();
        
        
        let light = this.getComponent(Light);
        this.scheduleOnce(()=>{
            console.log("设置雾的类型1");
            scene.globals.fog.type=FogInfo.FogType.EXP;
            console.log("fog type========"+FogInfo.FogType.EXP);
            console.log("fog type========"+FogInfo.FogType.EXP_SQUARED);
            console.log("fog type========"+FogInfo.FogType.LAYERED);
            console.log("fog type========"+FogInfo.FogType.LINEAR);
            console.log("设置雾的类型2");
        },0.1);
    }

    update(deltaTime: number) {
        
    }
}


