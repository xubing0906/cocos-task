
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = spring_system
 * DateTime = Tue Jan 25 2022 13:59:19 GMT+0800 (中国标准时间)
 * Author = lzy369999
 * FileBasename = spring_system.ts
 * FileBasenameNoExtension = spring_system
 * URL = db://assets/script/framework/3d/spring/spring_system.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('SpringSystem')
export class SpringSystem {
    // [1]
    // dummy = '';

    // 节点范围半径
    public radius = 0.05;

    // 刚体系数 数值越大刚度越强,布料和头发应减小
    public stiffnessForce = 0.008;

    // 阻力系数 数值越小越像弹簧
    public dragForce = 0.6;

    // 插值权重 数值越小spring bone的影响越小
    public dynamicRatio = 1.0;

    // 弹簧骨骼系统是否可用
    public enable = true;

    private isInit = false;

    static _instance: SpringSystem;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new SpringSystem();
        return this._instance;
    }

    init () {

    }

    // private updateParameters () {
    //     let springBones = this.node.getComponentsInChildren(SpringBone);
    //     let count = springBones.length;
    //     if (count > 0) {
    //         for (let i = 0; i < count; i++) {
    //             if (springBones[i].useSeparateParameter === true) {
    //                 springBones[i].radius = this.radius;
    //                 springBones[i].stiffnessForce = this.stiffnessForce;
    //                 springBones[i].dragForce = this.dragForce;
    //                 springBones[i].dynamicRatio = this.dynamicRatio;
    //             }
    //         }
    //     }
    // }

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
