/*
 * @Author: N0ts
 * @Date: 2021-10-13 21:04:32
 * @LastEditTime: 2021-10-14 00:23:47
 * @Description: api 配置
 * @FilePath: \eazy-gitee-note\js\api.js
 * @Mail：mail@n0ts.cn
 */

// 导入配置文件
import config from "./config.js";

export default {
    // 获取接口地址
    get: function(func, data) {
        // 获取目录 Tree
        if(func == "trees") {
            return `${config.serverBase}/api/v5/repos/${config.gitee.owner}/${config.gitee.repo}/git/trees/${config.gitee.sha}`;
        }
        // 获取仓库具体路径下的内容
        if(func == "contents") {
            return `${config.serverBase}/api/v5/repos/${config.gitee.owner}/${config.gitee.repo}/contents/${data[0]}`;
        }
    }
}