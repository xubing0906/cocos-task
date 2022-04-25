
import { _decorator, Component, Node, CCFloat, SphereCollider, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = spring_collider
 * DateTime = Tue Jan 25 2022 13:55:51 GMT+0800 (中国标准时间)
 * Author = lzy369999
 * FileBasename = spring_collider.ts
 * FileBasenameNoExtension = spring_collider
 * URL = db://assets/script/framework/3d/spring_bone/spring_collider.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('SpringCollider')
@executeInEditMode
export class SpringCollider extends Component {
    @property({ type: CCFloat })
    public get radius () {
        if (this.collider) {
            return this.collider.radius * this.node.worldScale.z;
        }

        return 0;
    };
    public set radius (val: number) {
        if (this.collider) {
            this.collider.radius = val / this.node.worldScale.z;
        }
    }

    @property(SphereCollider)
    collider: SphereCollider;

    isBoneCollider = false;

    onLoad () {
        // [3]
        if (!this.collider) {
            this.collider = this.node.addComponent(SphereCollider);
        }
    }

    start () {
        if (!EDITOR) {
            this.collider.enabled = false;
        }
    }

    get worldPosition () {
        return Vec3.transformMat4(new Vec3(), this.collider.center, this.node.worldMatrix);
    }

    lateUpdate (deltaTime: number) {
        // [4]
        // if (!this.isBoneCollider && !EDITOR) {
        //     window.testBox.worldPosition = this.worldPosition;
        // }
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
