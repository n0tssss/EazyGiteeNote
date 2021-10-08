/*
 * @Author: N0ts
 * @Date: 2021-10-08 00:37:22
 * @LastEditTime: 2021-10-08 14:23:17
 * @Description: main
 * @FilePath: \eazy-gitee-note\js\main.js
 * @Mail：mail@n0ts.cn
 */

// 从 Vue 中引入
const { createApp, reactive, toRefs } = Vue;

// 配置文件导入
import config from "./config.js";

// 数据
const data = reactive({
    hello: "hello wdnmd"
});

// 创建 Vue 应用
const App = createApp({
    mounted() {
        // 获取目录 Tree
        this.getTrees();
    },
    setup() {
        return {
            ...toRefs(data)
        };
    },
    methods: {
        /**
         * 获取目录 Tree
         */
        getTrees() {
            axios
                .get(`https://gitee.com/api/v5/repos/${config.owner}/${config.repo}/git/trees/${config.sha}`)
                .then((resData) => {
                    let result = resData.data;
                    console.log(result);
                })
                .catch((err) => {
                    console.log("报错啦", err);
                });
        },
        /**
         * 获取仓库具体路径下的内容
         * @param {*} path 文件名
         * @returns 文件数据
         */
        getContents(path) {
            // 数据验证
            if (!path) {
                return;
            }

            // url 转码
            path = encodeURIComponent(path);

            axios
                .get(`https://gitee.com/api/v5/repos/${config.owner}/${config.repo}/contents/${path}`)
                .then((resData) => {
                    // Base64 解密
                    resData.data.content = new Buffer(resData.data.content, "base64").toString();
                    console.log(resData.data);
                })
                .catch((err) => {
                    console.log("报错啦", err);
                });
        }
    }
});

// 使用 ElementUI
App.use(ElementPlus);

// 挂载到根节点
App.mount("#main");
