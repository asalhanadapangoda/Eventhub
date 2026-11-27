const path = require("path");

const loadBackendEnv = () => {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
};

module.exports = { loadSharedEnv: loadBackendEnv, loadBackendEnv };
