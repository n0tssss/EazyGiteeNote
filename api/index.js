/*
 * @Author: N0ts
 * @Date: 2021-10-08 13:32:19
 * @LastEditTime: 2021-10-08 15:38:09
 * @Description: EazyGiteeNote
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
function back(err, data) {
    return {
        error: err,
        data: data
    };
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

/**
 * 获取目录 Tree
 */
app.get("/get/trees", function (req, res) {
    axios
        .get(`https://gitee.com/api/v5/repos/${config.owner}/${config.repo}/git/trees/${config.sha}`, {
            params: {
                access_token: config.access_token
            }
        })
        .then((resData) => {
            let result = resData.data;
            // 附带上仓库地址
            result.giteeURL = `https://gitee.com/${config.owner}/${config.repo}/`;
            res.json(result);
        })
        .catch((err) => {
            res.json(back(err, null));
        });
});

/**
 * 获取仓库具体路径下的内容
 */
app.get("/get/contents", function (req, res) {
    let { path } = req.query;

    // 数据验证
    if (!path) {
        return res.json(back("缺少 path 参数！", null));
    }

    // url 转码
    path = encodeURIComponent(path);

    axios
        .get(`https://gitee.com/api/v5/repos/${config.owner}/${config.repo}/contents/${path}`, {
            params: {
                access_token: config.access_token
            }
        })
        .then((resData) => {
            // Base64 解密
            resData.data.content = new Buffer.from(resData.data.content, "base64").toString();
            res.json(resData.data);
        })
        .catch((err) => {
            res.json(back(err, null));
        });
});

/**
 * 其他页面处理
 */
app.get("*", function (req, res) {
    res.send("Ok");
});

/**
 * 服务器开启
 */
app.listen(3002, function () {
    console.log("服务端已启动！访问地址：http://localhost:3002");
});
