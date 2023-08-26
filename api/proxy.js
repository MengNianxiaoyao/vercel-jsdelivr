// api/proxy.js
const allowedPackages = require("../allowed-packages.json");

module.exports = async (req, res) => {
  const { packageName, version, path } = req.query;

  const packageConfig = allowedPackages.find(pkg => pkg.name === packageName);

  if (!packageConfig) {
    res.status(403).send({ allowed: false, message: "Package not allowed" });
    return;
  }

  const pathMatch = packageConfig.allowedPaths.some(allowedPath => {
    if (allowedPath === "*") {
      return true;
    }
    return path.startsWith(allowedPath);
  });

  if (!pathMatch) {
    res.status(403).send({ allowed: false, message: "Path not allowed" });
    return;
  }

  const versionSegment = version ? `@${version}` : "";
  const pathSegment = path ? `/${path}` : "";
  const url = `https://cdn.jsdelivr.net/npm/${packageName}${versionSegment}${pathSegment}`;

  const fetchModule = await import("node-fetch");
  const fetch = fetchModule.default;
  const response = await fetch(url);

  if (!response.ok) {
    res.status(response.status).send(await response.text());
    return;
  }

  res.setHeader("Content-Type", response.headers.get("Content-Type"));
  res.status(response.status).send(await response.buffer());
};
