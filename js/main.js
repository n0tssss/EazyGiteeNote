/*
 * @Author: N0ts
 * @Date: 2021-10-08 00:37:22
 * @LastEditTime: 2021-10-08 01:08:04
 * @Description: main
 * @FilePath: \eazy-gitee-note\js\main.js
 * @Mail：mail@n0ts.cn
 */

const { createApp, reactive, toRefs } = Vue;

const data = reactive({
    hello: "hello wdnmd"
});

const App = Vue.createApp({
    setup() {
        return {
            ...toRefs(data)
        };
    }
});

App.use(ElementPlus);

App.mount("#main")