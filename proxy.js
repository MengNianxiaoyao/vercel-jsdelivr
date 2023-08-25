/*
 * @Description: 代理js
 * @Author: 安知鱼
 * @Email: anzhiyu-c@qq.com
 * @Date: 2023-08-25 22:53:32
 * @LastEditTime: 2023-08-25 22:53:37
 * @LastEditors: 安知鱼
 */
const npmWhitelist = require("./npm-whitelist.json");
const ghWhitelist = require("./gh-whitelist.json");

function pathMatch(path, pattern) {
  const regex = new RegExp("^" + pattern.split("*").join(".*") + "$");
  return regex.test(path);
}

module.exports = (req, res) => {
  const pathSegments = req.url.split("/");
  const type = pathSegments[1];
  const packageOrRepo = pathSegments[2];
  const version = pathSegments[3];
  const path = "/" + pathSegments.slice(4).join("/");

  if (type === "npm-proxy") {
    const allowedPackage = npmWhitelist.packages.find(
      pkg => pkg.name === packageOrRepo && (pkg.version === "*" || pkg.version === version)
    );

    if (allowedPackage && pathMatch(path, allowedPackage.path)) {
      return res.status(200).send("Proxying npm package");
    }
  }

  if (type === "gh-proxy") {
    const allowedRepo = ghWhitelist.repos.find(
      repo => repo.repo === packageOrRepo && (repo.version === "*" || repo.version === version)
    );

    if (allowedRepo && pathMatch(path, allowedRepo.path)) {
      return res.status(200).send("Proxying GitHub repo");
    }
  }

  return res.status(403).send("Package or repository not allowed");
};
