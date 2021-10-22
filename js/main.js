/*
 * @Author: N0ts
 * @Date: 2021-10-08 00:37:22
 * @LastEditTime: 2021-10-22 16:13:05
 * @Description: main
 * @FilePath: /eazy-gitee-note/js/main.js
 * @Mail：mail@n0ts.cn
 */

// 从 Vue 中引入
const { createApp, reactive, toRefs, ref } = Vue;

// 配置文件导入
import config from "./config.js";
import api from "./api.js";

// 主题获取
var localThemeSave = window.localStorage.getItem("theme");

// 数据
const data = reactive({
    Trees: null, // 仓库下的所有文件
    content: null, // 当前内容
    contentSelectIndex: -1, // 当前选择的文件
    treeMenu: "文件", // 菜单默认选择
    loadContent: false, // 笔记加载遮罩
    menuData: null, // 文章目录数据
    menuSelectIndex: 0, // 当前目录选择索引
    menuShow: true, // 菜单是否展开
    timeOut: null, // 计算屏幕长度，防抖
    timeOut2: null, // 计算内容滚动距离，防抖
    ThemeIndex: 0 // 当前主题选择
});

// 创建 Vue 应用
const App = createApp({
    created() {
        // 本地主题设置
        this.ThemeIndex = !isNaN(localThemeSave) ? localThemeSave : 0;

        // 加载主题
        this.loadTheme();
    },
    mounted() {
        // 获取目录 Tree
        this.getTrees();

        // 根据屏幕宽度决定菜单收缩状态
        this.screenWidthMenuState();
        // 屏幕宽度发生变化
        window.onresize = () => {
            this.screenWidthMenuState();
        };
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
            // 如果不存在 || 是否为最后一个主题
            if (!this.ThemeIndex || this.ThemeIndex == config.Themes.length) {
                this.ThemeIndex = 0;
            }

            // 当前主题保存
            window.localStorage.setItem("theme", this.ThemeIndex);

            // 修改主题
            let link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `../css/${config.Themes[this.ThemeIndex++]}.css`;
            document.querySelector("head").appendChild(link);
        },

        /**
         * 获取目录 Tree
         */
        getTrees() {
            console.log(api.getTree);
            axios
                .get(config.serverBase, {
                    params: {
                        path: api.getTree
                    }
                })
                .then((resData) => {
                    this.Trees = resData.data;

                    // 数据验证
                    if (!this.Trees.tree) {
                        this.content = `## 仓库是空的？\n快去检查吧！`;
                        // 设置内容
                        return this.setContent();
                    }

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

                    // 获取仓库具体路径下的内容
                    this.getContents("README.md");
                    // 调试语句
                    // console.log(this.Trees);
                })
                .catch((err) => {
                    console.error("报错啦！错误信息：", err);
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
                .get(config.serverBase, {
                    params: {
                        path: api.getContent + encodeURIComponent(path) + "?access_token={0}"
                    }
                })
                .then((res) => {
                    this.loadContent = false;
                    this.content = res.data.content;

                    // 是否存在内容
                    if (!this.content || this.content.trim() == "") {
                        this.content = `## 这里空空如也～\n没写点东西还好意思上传？`;
                    }

                    // 设置内容
                    this.setContent();
                })
                .catch((err) => {
                    this.loadContent = false;
                    console.log("报错啦", err);
                });
        },

        /**
         * 设置内容
         */
        setContent() {
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

            // 转换为 html，超链接新建页面打开
            this.content = marked(Base64.decode(this.content)).replaceAll("<a ", "<a target='_blank' ");

            setTimeout(() => {
                // 索引复原
                this.menuSelectIndex = 0;

                // 滚动条回到顶部
                this.backTop(0);

                // 获取文章目录
                this.getContentMenu();

                // 文章内图片查看加载
                this.loadImgView();

                // 监听内容区滚动条
                this.listenContentScroll();
            }, 0);
        },

        /**
         * 获取文章目录
         */
        getContentMenu() {
            this.menuData = null;
            let dom = this.contentDom.querySelectorAll("h1, h2, h3, h4");
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
        },

        /**
         * 文章内图片查看加载
         */
        loadImgView() {
            let img = this.contentDom.querySelectorAll("img");
            img.forEach((item) => {
                new Viewer(item);
            });
        },

        /**
         * 目录选择
         * @param {*} index 索引
         * @param {*} top 滚动距离
         */
        menuSelect(index, top) {
            this.menuSelectIndex = index;
            this.contentDom.scrollTo({
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
        },

        /**
         * 滚动条到指定位置
         */
        backTop(top) {
            this.contentDom.scrollTo({
                top,
                behavior: "smooth"
            });
        },

        /**
         * 菜单展开与隐藏
         */
        menuShowOrHide() {
            this.menuShow = !this.menuShow;
        },

        /**
         * 切换主题
         */
        checkTheme() {
            this.loadTheme();
        },

        /**
         * 打开设置
         */
        openSetting() {
            this.notify("开发中，敬请期待！", "info");
        },

        /**
         * 根据屏幕宽度决定菜单收缩状态
         * 用于动态自适应
         */
        screenWidthMenuState() {
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            let state = document.body.clientWidth <= 820;
            this.timeOut = setTimeout(() => {
                // 当屏幕小于820 且 菜单是打开的情况下
                if (state && this.menuShow) {
                    this.menuShowOrHide();
                }
            }, 100);
        },

        /**
         * 监听内容区滚动条
         */
        listenContentScroll() {
            this.contentDom.addEventListener("scroll", (e) => {
                if (this.timeOut2) {
                    clearTimeout(this.timeOut2);
                }
                this.timeOut2 = setTimeout(() => {
                    let top = e.target.scrollTop + 30;
                    let trees = JSON.parse(JSON.stringify(this.menuData));
                    for (let i = 0; i < trees.length; i++) {
                        if (top >= trees[i].offsetTop) {
                            this.menuSelectIndex = i;
                        }
                    }
                }, 50);
            });
        }
    }
});

// 使用 ElementUI
App.use(ElementPlus);

// 挂载到根节点
App.mount("#app");
