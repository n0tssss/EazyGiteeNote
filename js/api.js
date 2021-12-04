/*
 * @Author: N0ts
 * @Date: 2021-10-13 21:04:32
 * @LastEditTime: 2021-12-04 21:33:16
 * @Description: api 配置
 * @FilePath: /eazy-gitee-note/js/api.js
 * @Mail：mail@n0ts.cn
 */

// 导入配置文件
import config from "./config.js";

export default {
    // 获取文件数
    getTree: `api/v5/repos/${config.gitee.owner}/${config.gitee.repo}/git/trees/${config.gitee.sha}?access_token={0}&recursive=1`,
    // 获取具体文件内容
    getContent: `api/v5/repos/${config.gitee.owner}/${config.gitee.repo}/contents/`
}