## 安知鱼公益CDN

这是一个镜像了 https://www.jsdelivr.com/ npm模块的CDN项目

本项目采用白名单模式，如果您的公开库需要使用请向本仓库提交issuse

1. 您的项目是开源的
2. 您的项目内资源遵循中国大陆法律
3. 仅仅只能代理代码部分（图片等资源不接受代理），请您提交的时候提交您需要代理的目录与文件

例如：
```json
{
  "name": "hexo-theme-anzhiyu",
  "allowedPaths": ["source/js/*"]
}
```

即可使用 https://cdn.anheyu.com/npm/hexo-theme-anzhiyu/source/js/ 访问其目录下的所有资源