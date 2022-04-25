// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { bezier, math, Node, Vec3, _decorator } from "cc";

const { ccclass, property } = _decorator;

/**
 * 工具类
 *
 * @export
 * @class Util
 */
@ccclass
export default class Util {


    /**
     * 将序列的所有元素随机排序
     * @param {array} arr 序列数据
     * @returns {object} ret 随机后数列
     * @method shuffle
     */
    public static shuffle (arr: Array<any>) {
        if (!arr || arr.constructor !== Array) {
            console.error('[utils] parameters of utils.shufle() must be array');
            return null;
        }

        const { length } = arr;
        for (let i = 0; i < length; i += 1) {
            const randomIndex = Math.round(Math.random() * (length - i - 1) + i);
            [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
        }

        return arr;
    }

    /**
     * !#zh 拷贝object。
     */
    public static clone (sObj: any) {
        if (sObj === null || typeof sObj !== "object") {
            return sObj;
        }

        let s: any = {};
        if (sObj.constructor === Array) {
            s = [];
        }

        for (let i in sObj) {
            if (sObj.hasOwnProperty(i)) {
                s[i] = this.clone(sObj[i]);
            }
        }

        return s;
    }

    /**
     * 深拷贝
     * @param {object} data 拷贝对象
     * @returns {object} ret 拷贝后对象
     * @method cloneDeep
     */
    public static cloneDeep (data: any) {
        if (typeof data !== 'object') {
            console.error('[utils] data not a object, don\'t need use utils.clone().');
            return null;
        }

        const isArray = data.constructor === Array;
        let ret: any = null;
        if (isArray) {
            ret = [...data];
        } else {
            ret = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    ret[key] = data[key];
                }
            }
        }

        return ret;
    }

    /**
     * 将序列元素随机取元素
     * @param {array} arr 随机原数组
     * @param {number} count 随机个数
     * @param {boolean} repeat 是否重复
     * @returns {array} ret 随机后数组
     * @method getRandomElements
     */
    public static getRandomElements (arr: Array<any>, count: number, repeat = false) {
        const ret = [];
        const { length } = arr;
        for (let i = 0; i < count; i += 1) {
            const index = Math.floor(Math.random() * length);
            const element = arr[index];
            if (!repeat && ret.indexOf(element) > -1) {
                i -= 1;
                continue;
            }

            ret.push(element);
        }

        return ret;
    }

    /**
     * 随机获取指定范围中的整数
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @method getRandomInt
     */
    public static getRandomInt (min: number, max: number) {
        const r = Math.random();
        const rr = r * (max - min + 1) + min;
        return Math.floor(rr);
    }

    /**
     * 将object转化为数组。
     * @param {object} srcObj 需要转化的对象
     * @method objectToArray
     */
    public static objectToArray (srcObj: any) {

        var resultArr = [];

        // to array
        for (var key in srcObj) {
            if (!srcObj.hasOwnProperty(key)) {
                continue;
            }

            resultArr.push(srcObj[key]);
        }

        return resultArr;
    }

    /**
     * !#zh 将数组转化为object。
     */
    public static arrayToObject (srcObj: any, objectKey: any) {

        var resultObj: any = {};

        // to object
        for (var key in srcObj) {
            if (!srcObj.hasOwnProperty(key) || !srcObj[key][objectKey]) {
                continue;
            }

            resultObj[srcObj[key][objectKey]] = srcObj[key];
        }

        return resultObj;
    }

    public static random (max?: number, min?: number) {
        max = max || 1;
        min = min || 0;

        //@ts-ignore
        Math.seed = (Math.seed * 9301 + 49297) % 233280;

        //@ts-ignore
        let rnd = Math.seed / 233280.0;

        return Math.floor(min + rnd * (max - min));
    }

    /**
     * 格式化钱数，超过10000 转换位 10K   10000K 转换为 10M
     */
    /**
     * 格式化数字 单位支持'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'
     * @param {number} number
     * @returns {string} strValue 格式化后的字符串
     * @method formatNumber1
     */
    public static formatNumber (num: number) {
        const arrUnit = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];

        let strValue = '';
        for (let idx = 0; idx < arrUnit.length; idx++) {
            if (num >= 10000) {
                num /= 1000;
            } else {
                strValue = Math.floor(num) + arrUnit[idx];
                break;
            }
        }

        if (strValue === '') {
            strValue = `${Math.floor(num)}U`; // 超过最大值就加个U
        }

        return strValue;
    }

    /**
     * 格式化显示千位分隔符
     * @param num 要格式化显示的数值
     * @method formatThousandSeperator
     */
    public static formatThousandSeperator (num: number) {
        return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    }

    /**
     * 字符串转字符串数组
     * @param {string} str 字符串
     * @method stringToArray
     */
    public static stringToArray (str: string) {
        // 用于判断emoji的正则们
        const rsAstralRange = '\\ud800-\\udfff';
        const rsZWJ = '\\u200d';
        const rsVarRange = '\\ufe0e\\ufe0f';
        const rsComboMarksRange = '\\u0300-\\u036f';
        const reComboHalfMarksRange = '\\ufe20-\\ufe2f';
        const rsComboSymbolsRange = '\\u20d0-\\u20ff';
        const rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
        const reHasUnicode = RegExp(`[${rsZWJ}${rsAstralRange}${rsComboRange}${rsVarRange}]`);

        const rsFitz = '\\ud83c[\\udffb-\\udfff]';
        const rsOptVar = `[${rsVarRange}]?`;
        const rsCombo = `[${rsComboRange}]`;
        const rsModifier = `(?:${rsCombo}|${rsFitz})`;
        const reOptMod = `${rsModifier}?`;
        const rsAstral = `[${rsAstralRange}]`;
        const rsNonAstral = `[^${rsAstralRange}]`;
        const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
        const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
        const rsOptJoin = `(?:${rsZWJ}(?:${[rsNonAstral, rsRegional, rsSurrPair].join('|')})${rsOptVar}${reOptMod})*`;
        const rsSeq = rsOptVar + reOptMod + rsOptJoin;
        const rsSymbol = `(?:${[`${rsNonAstral + rsCombo}?`, rsCombo, rsRegional, rsSurrPair, rsAstral].join('|')})`;
        const reUnicode = RegExp(`${rsFitz}(?=${rsFitz})|${rsSymbol}${rsSeq}`, 'g');

        const hasUnicode = (val: string) => { return reHasUnicode.test(val) };

        const unicodeToArray = function (val: string) {
            return val.match(reUnicode) || [];
        };

        const asciiToArray = (val: string) => { return val.split('') };

        return hasUnicode(str) ? unicodeToArray(str) : asciiToArray(str);
    }

    /**
     * 格式化昵称
     * @param {string} name 用户昵称
     * @param {number} limit 限制字符串长度
     * @returns {string}
     * @method formatName
     */
    public static formatName (name: string, limit: number, lastStr: string = '...') {
        limit = limit || 6;
        const nameArray = this.stringToArray(name);
        let str = '';
        const length = nameArray['length'];
        if (length > limit) {
            for (let i = 0; i < limit; i++) {
                str += nameArray[i];
            }

            str += lastStr;
        } else {
            str = name;
        }

        return str;
    }

    /**
     * 格式化数字长度
     * @param {number} num 整数
     * @param {number} len 格式化后的长度
     * @method formatLen
     */
    public static formatLen (num: number, len: number) {
        let result = num.toString();

        if (result.length >= len) {
            return result;
        }

        while (result.length < len) {
            result = `0${result}`;
        }
        return result;
    }

    // private method for UTF-8 encoding
    public static utf8Encode (string: string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    public static base64encode (input: string) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
        input = this.utf8Encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    }

    /**
     * 数据加密
     * @param {String} str 
     */
    public static encrypt (str: string) {
        let b64Data = this.base64encode(str);

        let n = 6;
        if (b64Data.length % 2 === 0) {
            n = 7;
        }

        let encodeData = '';

        for (let idx = 0; idx < (b64Data.length - n + 1) / 2; idx++) {
            encodeData += b64Data[2 * idx + 1];
            encodeData += b64Data[2 * idx];
        }

        encodeData += b64Data.slice(b64Data.length - n + 1);

        return encodeData;
    }

    /**
     * 数据解密
     * @param {String} b64Data 
     */
    public static decrypt (b64Data: string) {
        let n = 6;
        if (b64Data.length % 2 === 0) {
            n = 7;
        }

        let decodeData = '';
        for (var idx = 0; idx < b64Data.length - n; idx += 2) {
            decodeData += b64Data[idx + 1];
            decodeData += b64Data[idx];
        }

        decodeData += b64Data.slice(b64Data.length - n + 1);

        decodeData = this.base64Decode(decodeData);

        return decodeData;
    }

    public static base64Decode (input: string) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1;
        var chr2;
        var chr3;
        var enc1;
        var enc2;
        var enc3;
        var enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this.utf8Decode(output);
        return output;
    }

    public static utf8Decode (utftext: string) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }

    public static remove (array: any[], predicate: Function) {
        var result: any[] = [];
        var indexes: any[] = [];
        array.forEach(function (item, index) {
            if (predicate(item)) {
                result.push(item);
                indexes.push(index);
            }
        });

        this.basePullAt(array, indexes);
        return result;
    }

    public static basePullAt (array: any[], indexes: any[]) {
        var length = array ? indexes.length : 0;
        var lastIndex = length - 1;
        var previous;

        while (length--) {
            var index = indexes[length];
            if (length === lastIndex || index !== previous) {
                previous = index;
                Array.prototype.splice.call(array, index, 1);
            }
        }

        return array;
    }

    /**
     * 根据剩余秒数格式化剩余时间 返回 HH:MM:SS
     * @param {Number} leftSec 
     */
    public static formatTimeForSecond (leftSec: number) {
        var timeStr = '';
        var sec = leftSec % 60;

        var leftMin = Math.floor(leftSec / 60);
        leftMin = leftMin < 0 ? 0 : leftMin;

        var hour = Math.floor(leftMin / 60);
        var min = leftMin % 60;

        if (hour > 0) {
            timeStr += hour > 9 ? hour.toString() : '0' + hour;
            timeStr += ':';
        }

        timeStr += min > 9 ? min.toString() : '0' + min;
        timeStr += ':';
        timeStr += sec > 9 ? sec.toString() : '0' + sec;
        return timeStr;
    }

    public static base64ToUint8Array (base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    public static byteToString (arr: any) {
        if (typeof arr === 'string') {
            return arr;
        }
        var str = '',
            _arr = arr;
        for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for (var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
        return str;
    }

    public static contains (refNode: HTMLElement, otherNode: HTMLElement) {
        if (typeof refNode.contains == 'function') {
            return refNode.contains(otherNode);
        } else if (typeof refNode.compareDocumentPosition == 'function') {
            return !!(refNode.compareDocumentPosition(otherNode) & 16);
        } else {
            var node = otherNode.parentNode;
            if (node) {
                do {
                    if (node === refNode) {
                        return true;
                    } else {
                        node = node.parentNode;
                    }
                } while (node !== null);
            }
            return false;
        }
    }

    public static formateMeter (meter: number) {
        if (meter < 0 && meter > 0.01) {
            return Math.floor(meter * 100) + 'cm';
        } else if (meter < 1000) {
            return meter.toFixed(1) + 'm';
        } else {
            return (meter / 1000).toFixed(2) + 'km';
        }
    }

    public static formateArea (meter: number) {
        if (meter < 1000000) {
            return meter.toFixed(1) + '平方米';
        } else {
            return (meter / 1000000).toFixed(2) + '平方公里';
        }
    }

    public static reqWithGet (url: string, callback: Function) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) { //xhr.DONE 在android上为undefined
                if (xhr.status >= 200 && xhr.status < 400) {
                    callback(null, xhr.responseText);
                } else {
                    callback('failed', xhr.status);
                }
            }
        }

        xhr.open('GET', url, true);
        xhr.send();
    }


    public static CalculControlPoint (points: Vec3[], smoothValue: number) {

        let outPoints: Vec3[] = [];//求出所有的控制点

        if (typeof points === 'undefined' || points.length < 3) return outPoints;

        for (let pIndex = 0; pIndex < points.length - 2; pIndex++) {

            let xc1 = (points[0 + pIndex].x + points[1 + pIndex].x) / 2.0;
            let yc1 = (points[0 + pIndex].y + points[1 + pIndex].y) / 2.0;
            let zc1 = (points[0 + pIndex].z + points[1 + pIndex].z) / 2.0;

            let xc2 = (points[1 + pIndex].x + points[2 + pIndex].x) / 2.0;
            let yc2 = (points[1 + pIndex].y + points[2 + pIndex].y) / 2.0;
            let zc2 = (points[1 + pIndex].z + points[2 + pIndex].z) / 2.0;



            let len1 = points[1 + pIndex].clone().subtract(points[0 + pIndex].clone()).length();
            let len2 = points[2 + pIndex].clone().subtract(points[1 + pIndex].clone()).length();



            let k1: number = len1 / (len1 + len2);//控制点在直线上的位置

            let xm1 = xc1 + (xc2 - xc1) * k1;
            let ym1 = yc1 + (yc2 - yc1) * k1;
            let zm1 = zc1 + (zc2 - zc1) * k1;



            if (pIndex === 0) {
                // let xc3 = (points[0].x + points[2].x) / 2.0;
                // let yc3 = (points[0].y + points[2].y) / 2.0;
                // let zc3 = (points[0].z + points[2].z) / 2.0;

                // let len3 = points[2].subtract(points[0]).length();
                // let k2: number = len3 / (len1 + len3);

                // let xm2 = xc3 + (xc1 - xc3) * k2;
                // let ym2 = yc3 + (yc1 - yc3) * k2;
                // let zm2 = xc3 + (zc1 - zc3) * k2;


                outPoints.push(points[0].clone());//第一个只有一个控制点
                let pointK1 = Vec3.subtract(new Vec3(), points[2], points[0]);
                let pointK2 = Vec3.subtract(new Vec3(), points[1], points[0]);
                let pointDir = Vec3.subtract(new Vec3(), pointK1, pointK2).multiplyScalar(0.5);
                outPoints.push(Vec3.add(new Vec3(), points[0], pointDir.multiplyScalar(0.1)));//第一个只有一个控制点

            }


            let posLeft = new Vec3();
            let posRight = new Vec3();
            //左侧控制点
            posLeft.x = (xm1 + (xc1 - xm1) * smoothValue + points[1 + pIndex].x - xm1);
            posLeft.y = (ym1 + (yc1 - ym1) * smoothValue + points[1 + pIndex].y - ym1);
            posLeft.z = (zm1 + (zc1 - zm1) * smoothValue + points[1 + pIndex].z - zm1);
            //右侧控制点
            posRight.x = (xm1 + (xc2 - xm1) * smoothValue + points[1 + pIndex].x - xm1);
            posRight.y = (ym1 + (yc2 - ym1) * smoothValue + points[1 + pIndex].y - ym1);
            posRight.z = (zm1 + (zc2 - zm1) * smoothValue + points[1 + pIndex].z - zm1);
            outPoints.push(posLeft);
            outPoints.push(posRight);


            if (pIndex === points.length - 3) {
                // let xc3 = (points[points.length - 3].x + points[points.length - 1].x) / 2.0;
                // let yc3 = (points[points.length - 3].y + points[points.length - 1].y) / 2.0;
                // let zc3 = (points[points.length - 3].z + points[points.length - 1].z) / 2.0;

                // let len3 = points[points.length - 1].subtract(points[points.length - 3]).length();
                // let k2: number = len2 / (len2 + len3);

                // let xm2 = xc2 + (xc3 - xc2) * k2;
                // let ym2 = yc2 + (yc3 - yc2) * k2;
                // let zm2 = zc2 + (zc3 - zc2) * k2;

                //outPoints[(points.length - 2) * 2 + 1] = points[points.length - 1];//最后一个也只有一个控制点
                // outPoints[(points.length - 2) * 2 + 2] = points[points.length - 1];//最后一个也只有一个控制点

                let pointK1 = Vec3.subtract(new Vec3(), points[points.length - 3], points[points.length - 1]);
                let pointK2 = Vec3.subtract(new Vec3(), points[points.length - 2], points[points.length - 1]);
                let pointDir = Vec3.subtract(new Vec3(), pointK1, pointK2).multiplyScalar(0.5);
                outPoints.push(Vec3.add(new Vec3(), points[points.length - 1], pointDir.multiplyScalar(0.1)));//第一个只有一个控制点
                outPoints.push(points[points.length - 1].clone());//第一个只有一个控制点

            }

            // //左侧控制点
            // outPoints[2 + pIndex * 2].x = (xm1 + (xc1 - xm1) * smoothValue + points[1 + pIndex].x - xm1);
            // outPoints[2 + pIndex * 2].y = (ym1 + (yc1 - ym1) * smoothValue + points[1 + pIndex].y - ym1);
            // outPoints[2 + pIndex * 2].z = (zm1 + (zc1 - zm1) * smoothValue + points[1 + pIndex].z - zm1);
            // //右侧控制点
            // outPoints[3 + pIndex * 2].x = (xm1 + (xc2 - xm1) * smoothValue + points[1 + pIndex].x - xm1);
            // outPoints[3 + pIndex * 2].y = (ym1 + (yc2 - ym1) * smoothValue + points[1 + pIndex].y - ym1);
            // outPoints[3 + pIndex * 2].z = (zm1 + (zc2 - zm1) * smoothValue + points[1 + pIndex].z - zm1);

        }
        return outPoints;

    }

    //三阶贝塞尔曲线 根据控制点以及时间线求出点
    public static bezier3Point (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number) {
        let point: Vec3 = new Vec3();
        let temp = 1 - t;//求贝塞尔曲线点 系数为1 3 3 1
        point.x = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
        point.y = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
        point.z = p0.z * temp * temp * temp + 3 * p1.z * t * temp * temp + 3 * p2.z * t * t * temp + p3.z * t * t * t;
        return point;
    }

    //二阶贝塞尔曲线
    public static bezier2Point (p0: Vec3, p1: Vec3, p2: Vec3, t: number) {
        let point: Vec3 = new Vec3();
        let temp = 1 - t;
        point.x = p0.x * temp * temp + 2 * p1.x * t * temp + p2.x * t * t;
        return point;

    }

    //求贝塞尔曲线的控制点p0，到p3之间的曲线的长度， pointCount为中间的点数
    public static bezier3Length (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number = 1, pointCount: number = 100) {
        if (pointCount < 2) return 0;
        let length: number = 0.0;

        let lastPoint = this.bezier3Point(p0, p1, p2, p3, 0.0 / pointCount);

        for (let i = 1; i <= pointCount * t; i++) {
            let point = this.bezier3Point(p0, p1, p2, p3, i * 1.0 / pointCount);
            length += Vec3.distance(lastPoint, point);
            lastPoint = point;
        }
        return length;
    }

    //求贝塞尔曲线X方向的速度
    public static bezierSpeedX (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number = 1, pointCount: number = 30) {
        return -3 * p0.x * Math.pow(1 - t, 2) + 3 * p1.x * Math.pow(1 - t, 2) - 6 * p1.x * (1 - t) * t + 6 * p2.x * (1 - t) * t - 3 * p2.x * Math.pow(t, 2) + 3 * p3.x * Math.pow(t, 2);
    }

    public static bezierSpeedY (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number = 1, pointCount: number = 30) {
        return -3 * p0.y * Math.pow(1 - t, 2) + 3 * p1.y * Math.pow(1 - t, 2) - 6 * p1.y * (1 - t) * t + 6 * p2.y * (1 - t) * t - 3 * p2.y * Math.pow(t, 2) + 3 * p3.y * Math.pow(t, 2);
    }
    public static bezierSpeedZ (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number = 1, pointCount: number = 30) {
        return -3 * p0.z * Math.pow(1 - t, 2) + 3 * p1.z * Math.pow(1 - t, 2) - 6 * p1.z * (1 - t) * t + 6 * p2.z * (1 - t) * t - 3 * p2.z * Math.pow(t, 2) + 3 * p3.z * Math.pow(t, 2);
    }

    //求贝塞尔X方向上的坐标
    public static bezier3X (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number) {
        let temp = 1 - t;//求贝塞尔曲线点 系数为1 3 3 1
        let retn = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
        return retn;
    }
    public static bezier3Y (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number) {
        let temp = 1 - t;//求贝塞尔曲线点 系数为1 3 3 1
        let retn = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
        return retn;
    }
    public static bezier3Z (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number) {
        let temp = 1 - t;//求贝塞尔曲线点 系数为1 3 3 1
        let retn = p0.z * temp * temp * temp + 3 * p1.z * t * temp * temp + 3 * p2.z * t * t * temp + p3.z * t * t * t;
        return retn;
    }

    //输出匀速rt值,水平方向匀速的点，水平的平均速度求出对应的真实t值，可以扩展为三维求T
    public tToRt (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number) {
        //定义真实时间与差时变量
        let realtTime = 0.0;
        let deltaTime = 0.0;
        //曲线上的X坐标
        let bezierX = 0.0;
        //计算t对应曲线上匀速的X坐标
        let x = p0.x + (p3.x - p0.x) * t;
        realtTime = 1.0;
        do {
            //半分，二分查找法
            if (deltaTime > 0) {
                realtTime -= realtTime / 2.0;
            } else {
                realtTime += realtTime / 2.0;
            }
            //计算本次rt 对应曲线上的x坐标
            bezierX = Util.bezier3X(p0, p1, p2, p3, realtTime);
            //计算时差
            deltaTime = bezierX - x;
            //时差逼近0时跳出循环
        } while (Math.abs(deltaTime - 0) > 0.001);

        return realtTime;
    }

    //求三阶贝塞尔曲线的切线方向
    public static bezier3Tangent (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
        let u = 1 - t;
        let uu = u * u;
        let tu = t * u;
        let tt = t * t;

        let pTang: Vec3 = new Vec3();
        pTang.add(p0.clone().multiplyScalar(-1.0 * 3 * uu));
        pTang.add(p1.clone().multiplyScalar(3 * (uu - 2 * tu)));
        pTang.add(p2.clone().multiplyScalar(3 * (2 * tu - tt)));
        pTang.add(p3.clone().multiplyScalar(3 * (tt)));

        //返回单位向量
        return pTang.normalize();
    }

    //求二阶贝塞尔曲线的切线方向
    public static bezier2Tangent (p0: Vec3, p1: Vec3, p2: Vec3, t: number): Vec3 {
        let u = 1 - t;
        let uu = u * u;
        let tu = t * u;
        let tt = t * t;
        let pTang: Vec3 = new Vec3();
        pTang.add(p0.clone().multiplyScalar(-1.0 * 2 * u));
        pTang.add(p1.clone().multiplyScalar(2 - 4 * t));
        pTang.add(p2.clone().multiplyScalar(2 * t));

        return pTang.normalize();
    }

    //分片迭代求某个点的T值
    public static bezier3ComputeT (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, p: Vec3, startT: number = 0, endT: number = 1, preDst: number): number {
        startT = math.clamp(startT, 0, 1);
        endT = math.clamp(endT, 0, 1);

        let t = startT;
        let minDistance = Infinity;
        let minDistanceT = 0;
        let count = 100;
        let step = (endT - startT) / count;
        for (let i = 0; i < count; i++) {
            let point = Util.bezier3Point(p0, p1, p2, p3, t);
            let dst = Vec3.distance(point, p);
            if (dst < minDistance) {
                minDistance = dst;
                minDistanceT = t;
                if (Math.abs(minDistance - preDst) < 0.0001) {
                    return t;
                }
            }
            if (dst < 0.0001) {
                return t;
            }
            t += step;
        }
        //细分
        return Util.bezier3ComputeT(p0, p1, p2, p3, p, minDistanceT - step, minDistanceT + step, minDistance);

    }

    //分片迭代求某个长度的T值
    public static bezier3LenghtComputeT (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, length: number, startT: number = 0, endT: number = 1, preDst: number): number {
        startT = math.clamp(startT, 0, 1);
        endT = math.clamp(endT, 0, 1);

        let t = startT;
        let minDistance = Infinity;
        let minDistanceT = 0;
        let count = 100;
        let step = (endT - startT) / count;
        for (let i = 0; i < count; i++) {
            let len = Util.bezier3Length(p0, p1, p2, p3, t, 100);
            let dst = Math.abs(length - len);
            if (dst < minDistance) {
                minDistance = dst;
                minDistanceT = t;
                if (Math.abs(minDistance - preDst) < 0.0001) {
                    return t;
                }
            }
            if (dst < 0.01) {
                return t;
            }
            t += step;
        }
        return Util.bezier3LenghtComputeT(p0, p1, p2, p3, length, minDistanceT - step, minDistanceT + step, minDistance);
    }

    //二分查找法求某个点的T值
    //二分查找法求某个长度的T值

    //t时间上的均等分某一小段的t，l是均等分之后的一段长度，返回真实的t
    public static bezier3InvertT (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number, l: number): number {
        let t1 = t;
        let t2 = 0;
        let v1 = Vec3.multiplyScalar(new Vec3(), p0, -3);
        v1.add(Vec3.multiplyScalar(new Vec3(), p1, 9));
        v1.add(Vec3.multiplyScalar(new Vec3(), p2, -9));
        v1.add(Vec3.multiplyScalar(new Vec3(), p3, 3));

        let v2 = Vec3.multiplyScalar(new Vec3(), p0, 6);
        v2.add(Vec3.multiplyScalar(new Vec3(), p1, -12));
        v2.add(Vec3.multiplyScalar(new Vec3(), p2, 6));

        let v3 = Vec3.multiplyScalar(new Vec3(), p0, -3);
        v3.add(Vec3.multiplyScalar(new Vec3(), p1, 3));

        do {
            let vs = v1.clone().multiplyScalar(Math.pow(t1, 2)).add(v2.clone().multiplyScalar(t1)).add(v3.clone());
            t2 = t1 - (this.bezier3Length(p0, p1, p2, p3, t1) - l) / vs.length();
            //t1无限接tt2
            if (Math.abs(t1 - t2) < 0.000001) {
                break;
            }
            t1 = t2;
        } while (true);

        return t2;
    }

    /**
         * 根据节点名称获取某个节点下的节点
         * @param nodeName 
         * @param parentNode 
         * @returns 
         */
    // @ts-ignore
    public static findChildNodeByName (nodeName: string, parentNode: Node) {
        for (let index = 0; index < parentNode.children.length; index++) {
            let childNode = parentNode.children[index];
            if (childNode.name === nodeName) {
                return childNode;
            } else {
                if (childNode.children.length === 0) {
                    continue;
                } else {
                    // @ts-ignore
                    let findResult = this.findChildNodeByName(nodeName, childNode);
                    if (findResult !== null) {
                        return findResult;
                    }
                }
            }
        }

        return null;
    }
}
