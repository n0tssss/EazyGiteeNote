/*
 * @Author: N0ts
 * @Date: 2021-10-08 00:37:22
 * @LastEditTime: 2021-10-09 17:14:26
 * @Description: main
 * @FilePath: /eazy-gitee-note/js/main.js
 * @Mail：mail@n0ts.cn
 */

// 从 Vue 中引入
const { createApp, reactive, toRefs, ref } = Vue;

// 配置文件导入
import config from "./config.js";

// 数据
const data = reactive({
    Trees: null, // 仓库下的所有文件
    content: null, // 当前内容
    contentSelectIndex: -1, // 当前选择的文件
    treeMenu: "文件", // 菜单默认选择
    loadContent: false, // 笔记加载遮罩
    menuData: null, // 文章目录数据
    menuSelectIndex: 0 // 当前目录选择索引
});

// 创建 Vue 应用
const App = createApp({
    mounted() {
        // 加载主题
        this.loadTheme();
        // 获取目录 Tree
        this.getTrees();
        // 获取仓库具体路径下的内容
        this.getContents("README.md");
    },
    setup() {
        let contentDom = ref(null);

        return {
            ...toRefs(data),
            contentDom
        };
    },
    methods: {
        /**
         * 加载主题
         */
        loadTheme() {
            let link = document.createElement("link");
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
                    // console.log(this.Trees);
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
                    marked.setOptions({
                        breaks: false, // 如果为true，添加<br>一个换行符（copies GitHub）。需要gfm是true。
                        renderer: new marked.Renderer(), // 将标记渲染为HTML的函数的对象。有关详细信息，请参阅扩展性
                        gfm: true, // 如果为true，使用被认可的GitHub Flavored Markdown（GFM）规范
                        pedantic: false, // 如果为true，尽可能遵照原始markdown.pl。不修复原有的错误或表现。关闭并覆盖gfm。
                        sanitize: false, // 如果为true，使用sanitizer函数对传递到markdownstring的HTML进行清理。
                        tables: true, // 如果为true且gfm为true，使用GFM Tables扩展。
                        smartLists: true, // 如果为true，使用比markdown.pl拥有的更智能的列表行为。
                        smartypants: false, // 如果为true，使用“智能”排版标点符号来表示引号和短划线。
                        headerIds: true, // 如果为true，在生成标题时包含id属性。（h1，h2，h3等）
                        // 一个函数用于突出显示代码块的功能，请参阅Asynchronous highlighting.。
                        highlight: function (code) {
                            return hljs.highlightAuto(code).value;
                        }
                    });
                    this.content.content = marked(this.content.content);

                    // 获取文章目录
                    setTimeout(() => {
                        // 索引复原
                        this.menuSelectIndex = 0;

                        // 滚动条回到顶部
                        this.contentDom.$el.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                        // 获取文章目录
                        this.getContentMenu();
                    }, 0);
                })
                .catch((err) => {
                    this.loadContent = false;
                    console.log("报错啦", err);
                });
        },

        /**
         * 获取文章目录
         */
        getContentMenu() {
            let dom = this.contentDom.$el.querySelectorAll("h1, h2, h3, h4");
            this.menuData = [...dom].map((item) => {
                // 获取标签名，id，内容，距离顶边高度
                let { tagName, id, textContent, offsetTop } = item;
                return {
                    tagName,
                    id,
                    textContent,
                    offsetTop
                };
            });
            // 调试语句
            console.log(this.menuData);
        },

        /**
         * 目录选择
         * @param {*} index 索引
         * @param {*} top 滚动距离
         */
        menuSelect(index, top) {
            this.menuSelectIndex = index;
            this.contentDom.$el.scrollTo({
                // top: top - 30,
                top,
                behavior: "smooth"
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
