/*
 * @Description:
 * @Author: 安知鱼
 * @Email: anzhiyu-c@qq.com
 * @Date: 2023-08-25 22:53:32
 * @LastEditTime: 2023-08-25 23:43:30
 * @LastEditors: 安知鱼
 */
const fetch = require("node-fetch");
const npmWhitelist = require("../npm-whitelist.json");
const ghWhitelist = require("../gh-whitelist.json");

function pathMatch(path, pattern) {
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return regex.test(path);
}

module.exports = async (req, res) => {
  const pathSegments = req.url.split("/");
  const type = pathSegments[1];
  const packageOrRepo = pathSegments[2];
  const version = pathSegments[3];
  const path = "/" + pathSegments.slice(4).join("/");

  let destination = "";

  if (type === "npm") {
    const allowedPackage = npmWhitelist.packages.find(
      pkg => pkg.name === packageOrRepo && (pkg.version === "*" || pkg.version === version)
    );

    if (allowedPackage && pathMatch(path, allowedPackage.path)) {
      destination = `https://cdn.jsdelivr.net/npm/${packageOrRepo}@${version}${path}`;
    }
  }

  if (type === "gh") {
    const allowedRepo = ghWhitelist.repos.find(
      repo => repo.repo === packageOrRepo && (repo.version === "*" || repo.version === version)
    );

    if (allowedRepo && pathMatch(path, allowedRepo.path)) {
      destination = `https://cdn.jsdelivr.net/gh/${packageOrRepo}@${version}${path}`;
    }
  }

  if (destination) {
    const response = await fetch(destination);
    const contentType = response.headers.get("content-type");
    const content = contentType.startsWith("text/") ? await response.text() : await response.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(content);
  } else {
    res.status(403).send("Package or repository not allowed");
  }
};
