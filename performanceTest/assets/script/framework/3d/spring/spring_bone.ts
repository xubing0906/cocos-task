
import { _decorator, Component, Node, Vec3, Quat } from 'cc';
import { EDITOR } from 'cc/env';
import { SpringCollider } from './spring_collider';
import { SpringSystem } from './spring_system';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = spring_bone
 * DateTime = Tue Jan 25 2022 13:55:04 GMT+0800 (中国标准时间)
 * Author = lzy369999
 * FileBasename = spring_bone.ts
 * FileBasenameNoExtension = spring_bone
 * URL = db://assets/script/framework/3d/spring_bone/spring_bone.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('SpringBone')
@executeInEditMode
export class SpringBone extends Component {

    public boneAxis = new Vec3(-1.0, 0.0, 0.0);

    @property({ tooltip: "是否单独设置参数, 默认false参数由SpringSystem统一设置" })
    public useCustomParameter = false;

    @property({ tooltip: "节点范围半径", slide: true, step: 0.01 })
    public get radius () {
        if (this.collider) {
            return this.collider.radius;
        }

        return 0;
    };

    public set radius (val: number) {
        if (this.collider) {
            this.collider.radius = val;
        }
    }

    @property({ tooltip: "碰撞框", type: SpringCollider })
    public collider: SpringCollider;

    @property({ tooltip: "刚体系数 数值越大刚度越强,布料和头发应减小" })
    public stiffnessForce = 0.008;

    @property({ tooltip: "阻力系数 数值越小越像弹簧" })
    public dragForce = 0.6;

    @property({ tooltip: "插值权重 数值越小spring bone的影响越小" })
    public dynamicRatio = 1.0;

    // 碰撞体节点
    // @property({ tooltip: "与当前弹簧骨骼相碰撞的碰撞框", type: [SpringCollider] })
    private springColliders: SpringCollider[] = [];

    @property({ tooltip: "与当前弹簧骨骼相碰撞的碰撞框节点", type: [Node] })
    public springCollidersGroups: Node[] = [];

    public springForce = new Vec3(0.0, 0.0, 0.0);

    private springLength = 1.0;

    private currTipPos = new Vec3();
    private prevTipPos = new Vec3();

    public localRotation = new Quat();

    onLoad () {
        if (!this.collider) {
            this.collider = this.node.addComponent(SpringCollider);
        }
    }

    init () {
        if (this.collider) {
            this.collider.isBoneCollider = true;
        }

        this.springColliders = [];
        this.springCollidersGroups.forEach((node: Node) => {
            this.springColliders.push(...node.getComponents(SpringCollider));
        })

        // [3]
        Quat.copy(this.localRotation, this.node.rotation);
        let child = this.node.children[0];
        if (!child) {
            console.log("末端不能加弹簧骨")
            return;
        }

        this.springLength = Vec3.distance(this.node.worldPosition, child.worldPosition);

        Vec3.copy(this.currTipPos, this.node.worldPosition);
        Vec3.copy(this.prevTipPos, this.node.worldPosition);

        // let count = this.colliderNodes.length;
        // if (count > 0) {
        //     for (let i = 0; i < count; i++) {
        //         if (this.colliderNodes[i]) {
        //             let collider = this.colliderNodes[i].getComponent(SpringCollider);
        //             if (collider) {
        //                 this.springColliders[i] = collider;
        //             }
        //         }
        //     }
        // }

        // if (!EDITOR) {
        //     this.collider.enabled = false;
        // }
    }

    updateSpring (deltaTime: number) {
        if (EDITOR) {
            return;
        }

        if (!SpringSystem.instance.enable) {
            return;
        }

        let _tempVec3 = new Vec3();
        this.node.setRotation(this.localRotation);
        this.node.updateWorldTransform();
        let trsRot = this.node.worldRotation;
        let trsPos = this.node.worldPosition;

        ///////////////////////////////////////////////////
        let sqrDt = deltaTime * deltaTime;

        //////////////////////////////////////////////////////////////////////
        let force = new Vec3();
        Vec3.multiplyScalar(_tempVec3, this.boneAxis, this.stiffnessForce);
        Vec3.transformQuat(_tempVec3, _tempVec3, trsRot);
        Vec3.multiplyScalar(_tempVec3, _tempVec3, 1.0 / sqrDt);
        Vec3.copy(force, _tempVec3);

        //////////////////////////////////////////////////////////////////////
        Vec3.subtract(_tempVec3, this.prevTipPos, this.currTipPos);
        Vec3.multiplyScalar(_tempVec3, _tempVec3, this.dragForce / sqrDt);
        Vec3.add(force, force, _tempVec3);

        //////////////////////////////////////////////////////////////////////
        Vec3.multiplyScalar(_tempVec3, this.springForce, 1.0 / sqrDt);
        Vec3.add(force, force, _tempVec3);

        //////////////////////////////////////////////////////////////////////
        let temp = new Vec3();
        Vec3.copy(temp, this.currTipPos);

        //////////////////////////////////////////////////////////////////////
        Vec3.subtract(_tempVec3, this.currTipPos, this.prevTipPos);
        Vec3.add(_tempVec3, _tempVec3, this.currTipPos);
        Vec3.copy(this.currTipPos, _tempVec3);
        Vec3.multiplyScalar(_tempVec3, force, sqrDt);
        Vec3.add(this.currTipPos, this.currTipPos, _tempVec3);

        //////////////////////////////////////////////////////////////////////
        Vec3.subtract(_tempVec3, this.currTipPos, trsPos);
        Vec3.normalize(_tempVec3, _tempVec3);
        Vec3.multiplyScalar(_tempVec3, _tempVec3, this.springLength);
        Vec3.add(this.currTipPos, _tempVec3, trsPos);

        let count = this.springColliders.length;
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let collider = this.springColliders[i];
                if (collider) {
                    let dist = Vec3.distance(collider.worldPosition, this.currTipPos);
                    if (dist <= (this.radius + collider.radius)) {
                        Vec3.subtract(_tempVec3, this.currTipPos, collider.worldPosition);
                        Vec3.normalize(_tempVec3, _tempVec3);

                        Vec3.multiplyScalar(_tempVec3, _tempVec3, this.radius + collider.radius);
                        Vec3.add(this.currTipPos, collider.worldPosition, _tempVec3);

                        Vec3.subtract(_tempVec3, this.currTipPos, trsPos);
                        Vec3.normalize(_tempVec3, _tempVec3);
                        Vec3.multiplyScalar(_tempVec3, _tempVec3, this.springLength);
                        Vec3.add(this.currTipPos, _tempVec3, trsPos);
                    }
                }

            }
        }

        //////////////////////////////////////////////////////////////////////
        Vec3.copy(this.prevTipPos, temp);

        //////////////////////////////////////////////////////////////////////
        let aimVector = new Vec3();
        Vec3.transformQuat(_tempVec3, this.boneAxis, trsRot);
        Vec3.normalize(aimVector, _tempVec3);
        let direct = new Vec3();
        Vec3.subtract(_tempVec3, this.currTipPos, trsPos);
        Vec3.normalize(direct, _tempVec3);
        let aimRotation = new Quat();
        Quat.rotationTo(aimRotation, direct, aimVector);

        //////////////////////////////////////////////////////////////////////
        let secondaryRotation = new Quat();
        Quat.multiply(secondaryRotation, aimRotation, trsRot);

        let finalRot = new Quat();
        Quat.lerp(finalRot, trsRot, secondaryRotation, this.dynamicRatio);

        this.node.setWorldRotation(finalRot);
    }

    lateUpdate (deltaTime: number) {
        this.updateSpring(deltaTime);
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
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
