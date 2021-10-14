/*
 * @Author: N0ts
 * @Date: 2021-10-08 13:32:19
 * @LastEditTime: 2021-10-14 23:28:17
 * @Description: Gitee 接口
 * @FilePath: \eazy-gitee-note\api\index.js
 * @Mail：mail@n0ts.cn
 */

// Express
const express = require("express");
// Axios
const axios = require("axios");
// 读取配置文件
const config = require("./config/config");
// 创建服务器
const app = express();

/**
 * 获取 post 参数
 */
app.use(
    express.urlencoded({
        extended: false
    })
);
app.use(express.json());

/**
 * 返回类型
 * @param {*} err 错误信息
 * @param {*} data 数据
 * @returns
 */
function back(type, err = "") {
    return `<h1>${config[type].msg}</h1><p>${err}</p><img src="${config[type].img}" />`;
}

/**
 * 跨域配置
 */
app.all("*", (req, res, next) => {
    try {
        // google需要配置，否则报错cors error
        res.setHeader("Access-Control-Allow-Credentials", "true");
        // 允许的地址,http://127.0.0.1:9000这样的格式
        res.setHeader("Access-Control-Allow-Origin", req.get("Origin"));
        // 允许跨域请求的方法
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
        // 允许跨域请求header携带哪些东西
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since");
    } catch {
        return next();
    }
    next();
});

app.all("*", (req, res) => {
    // 获取数据
    let {
        url, // 请求路径
        method, // 请求方式
        body, // post 数据
        query // get 数据
    } = req;

    // 只接受 Get
    if(method != "GET") {
        return res.send("不是Get不准过！");
    }

    // 数据验证
    if(url == "/") {
        return res.send(back("success"));
    }
    if(url.substring(0, 5) != "/api/") {
        return res.send(back("jb"));
    }

    // 携带令牌
    query.access_token = config.access_token;

    // 请求发送
    axios({
        url: "https://gitee.com" + url,
        method,
        data: body,
        params: query
    }).then(res1 => {
        let { data } = res1;

        // 获取文件内容解析base64
        if(data.encoding && data.encoding == "base64") {
            data.content = new Buffer.from(data.content, "base64").toString();
        }

        res.json(data);
    }).catch(err => {
        return res.send(back("error", `请求地址：${url}，保存信息：${err}`));
    });
});

/**
 * 服务器开启
 */
app.listen(3002, function () {
    console.log("服务端已启动！访问地址：http://localhost:3002");
});
