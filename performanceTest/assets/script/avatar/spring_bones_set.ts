
import { _decorator, Component, Node, RigidBody, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { SpringBone } from '../framework/3d/spring/spring_bone';
import { SpringCollider } from '../framework/3d/spring/spring_collider';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = obj_spring_bone_set
 * DateTime = Sat Apr 02 2022 19:21:37 GMT+0800 (中国标准时间)
 * Author = 857721938
 * FileBasename = obj_spring_bone_set.ts
 * FileBasenameNoExtension = obj_spring_bone_set
 * URL = db://assets/script/avatar/obj_spring_bone_set.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('SpringBonesSet')
export class SpringBonesSet extends Component {
    // [1]
    // dummy = '';

    // springCollider: SpringCollider[] = [];

    @property([Node])
    springBoneNode: Node[] = [];

    @property([Node])
    bodySpringBoneGroup: Node[] = [];
    // [2]
    // @property
    // serializableDummy = 0;


    // @property({ displayName: "生成弹簧骨" })
    // set generateSpringBone (val: boolean) {
    //     if (val) {
    //         if (EDITOR) {
    //             for (let index = 0; index < this.springBoneNode.length; index++) {
    //                 if (!this.springBoneNode) {
    //                     continue;
    //                 }
    //                 if (this.springBoneNode) {
    //                     if (this.springBoneNode[index].getComponent(SpringBone)) {
    //                         continue;
    //                     }
    //                     this.springBoneNode[index].addComponent(SpringBone);
    //                     this.springBoneNode[index].getComponent(SpringCollider).radius = 0.03;
    //                     // console.log(index);

    //                     // this.springBoneNode[index].getComponent(SpringBone).springForce = new Vec3(-1, 0, 0);
    //                     // this.springBoneNode[index].getComponent(SpringBone).boneAxis = new Vec3(-1, 0, 0);
    //                     this.springBoneNode[index].getComponent(SpringBone).dynamicRatio = 0.95;
    //                     this.springBoneNode[index].getComponent(SpringBone).stiffnessForce = 0.013;
    //                     this.springBoneNode[index].getComponent(SpringBone).dragForce = 0.95;
    //                     // this.springBoneNode[index].getComponent(SpringBone).springCollidersGroups = AvatarPinchFaceAbility.instance.reference.bodySpringBoneGroup;
    //                     // this.springBoneNode[index].addComponent(RigidBody).useGravity = false;
    //                 }


    //             }


    //         }
    //     }
    // }
    // get generateSpringBone () {
    //     return false;
    // }
    start () {
        // [3]
        for (let index = 0; index < this.springBoneNode.length; index++) {
            if (!this.springBoneNode) {
                continue;
            }
            if (this.springBoneNode) {
                this.springBoneNode[index].getComponent(SpringBone).boneAxis = new Vec3(-1, 0, 0);
                this.springBoneNode[index].getComponent(SpringBone).springCollidersGroups = this.bodySpringBoneGroup;
                this.springBoneNode[index].getComponent(SpringBone).init();
                // this.springBoneNode[index].addComponent(RigidBody).useGravity = false;
            }


        }

    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
