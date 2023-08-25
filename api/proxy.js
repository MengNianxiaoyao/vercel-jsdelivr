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
    const fetch = await import("node-fetch");
    const response = await fetch.default(destination);
    const contentType = response.headers.get("content-type");
    const content = contentType.startsWith("text/") ? await response.text() : await response.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(content);
  } else {
    res.status(403).send("Package or repository not allowed");
  }
};
