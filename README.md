# EazyGiteeNote

## 开发中

做一个简约实用，基于Gitee的学习笔记吧！

开发中...

[预览地址](https://n0ts.gitee.io/eazy-gitee-note/)



## 使用教程

前往 [Gitee AccessToken 管理平台 (n0ts.cn)](https://gitee.n0ts.cn/) 注册一个账号，并录入自己码云的 Access Token，权限最少需要给与 Project 操作权限

然后在 `js/config.js` 中修改如下选项

后端地址为：https://giteeapi.n0ts.cn/编号，编号来源于刚刚设置 Access Token 主面板会显示；

码云账号与仓库名称填上，就可以使用了！

```json
// Gitee 配置
gitee: {
    // 账号
    owner: "n0ts",
    // 仓库名称
    repo: "note",
    // 分支名
    sha: "master"
},
// 后端地址
serverBase: "https://giteeapi.n0ts.cn/10015",
```



## 笔记是怎样展示的？

全部 markdown 文件丢到仓库根目录即可！

参考：[note: 个人笔记 (gitee.com)](https://gitee.com/n0ts/note)
