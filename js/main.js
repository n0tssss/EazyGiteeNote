/*
 * @Author: N0ts
 * @Date: 2021-10-08 00:37:22
 * @LastEditTime: 2021-10-08 17:15:16
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
    Trees: null, // 仓库下的所有文件
    content: null, // 当前内容
    contentSelectIndex: -1, // 当前选择的文件
    treeMenu: "文件", // 菜单默认选择
    loadContent: false // 笔记加载遮罩
});

// 创建 Vue 应用
const App = createApp({
    mounted() {
        // 加载主题
        this.loadTheme();
        // 获取目录 Tree
        this.getTrees();
        //
        this.getContents("README.md");
    },
    setup() {
        return {
            ...toRefs(data)
        };
    },
    methods: {
        /**
         * 加载主题
         */
        loadTheme() {
            let link = document.createElement("link");
            // link.type = "text/css";
            link.rel = "stylesheet";
            link.href = `../css/${config.Themes[0]}.css`;
            document.querySelector("head").appendChild(link);
        },

        /**
         * 获取目录 Tree
         */
        getTrees() {
            axios
                .get(`${config.serverBase}/get/trees`)
                .then((resData) => {
                    this.Trees = resData.data;
                    // 数据过滤，保留 md 后缀的文件
                    this.Trees.tree = this.Trees.tree
                        .map((item) => {
                            // 取消显示 README
                            if (item.path == "README.md") {
                                return null;
                            }
                            if (item.path.substring(item.path.length - 3, item.path.length) == ".md") {
                                return item;
                            }
                        })
                        .filter(Boolean);
                    // 调试语句
                    console.log(this.Trees);
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
        getContents(path, index) {
            // 数据验证
            if (!path) {
                return;
            }

            // 索引修改
            this.contentSelectIndex = index;

            // 加载遮罩启动
            this.loadContent = true;

            axios
                .get(`${config.serverBase}/get/contents`, {
                    params: {
                        path
                    }
                })
                .then((res) => {
                    this.loadContent = false;
                    this.content = res.data;
                    // 是否存在内容
                    if (!this.content.content || this.content.content.trim() == "") {
                        return this.notify("这里还是空的哦~", "warning");
                    }
                    // 转为 html
                    this.content.content = marked(this.content.content);
                })
                .catch((err) => {
                    this.loadContent = false;
                    console.log("报错啦", err);
                });
        },

        /**
         * 消息弹框提示
         * @param {String} message 消息
         * @param {success, warning, info, error} type 类型
         */
        notify(message, type) {
            this.$notify({
                message,
                type,
                showClose: true
            });
        }
    }
});

// 使用 ElementUI
App.use(ElementPlus);

// 挂载到根节点
App.mount("#main");
