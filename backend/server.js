const app = require("./app");
const env = require("./src/config/env");
const { initDb } = require("./src/config/db");

async function start() {
  await initDb();

  app.listen(env.port, () => {
    console.log(`Ahorra Market API escuchando en http://127.0.0.1:${env.port}`);
  });
}

start();
