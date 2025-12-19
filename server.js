const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port, turbo: dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer(async (req, res) => {
      try {
        await handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    // 跟踪所有连接（避免 httpServer.close() 因活跃连接无限等待）
    const connections = new Set();
    httpServer.on("connection", (conn) => {
      connections.add(conn);
      conn.on("close", () => connections.delete(conn));
    });

    httpServer.listen(port, () =>
      console.log(`> Ready on http://${hostname}:${port}`),
    );

    let shuttingDown = false;
    const shutdown = (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;

      console.log(`> 收到 ${signal}，开始优雅退出（最多等待 5 秒）...`);

      const forceExitTimeout = setTimeout(() => {
        console.error("> 超过 5 秒仍未退出，强制结束进程（exit=1）");
        process.exit(1);
      }, 5000);
      forceExitTimeout.unref();

      const destroyConnectionsTimeout = setTimeout(() => {
        const count = connections.size;
        if (count <= 0) return;

        console.log(`> 仍有 ${count} 个活跃连接，开始强制断开...`);
        if (typeof httpServer.closeAllConnections === "function") {
          httpServer.closeAllConnections();
          return;
        }

        connections.forEach((conn) => conn.destroy());
      }, 3000);
      destroyConnectionsTimeout.unref();

      httpServer.close(() => {
        clearTimeout(forceExitTimeout);
        clearTimeout(destroyConnectionsTimeout);
        console.log("> HTTP 服务器已关闭，进程退出（exit=0）");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
