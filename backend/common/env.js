const path = require("path");
const fs = require("fs");

const loadSharedEnv = () => {
  const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
  const backendEnvPath = path.resolve(__dirname, "..", ".env");
  require("dotenv").config({ path: fs.existsSync(rootEnvPath) ? rootEnvPath : backendEnvPath });
};

module.exports = { loadSharedEnv };
