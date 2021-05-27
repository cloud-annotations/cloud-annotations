import http from "http";

import { RedisClient } from "redis";
import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";

const host = process.env.REDIS_HOST ?? "redis";
const port = parseInt(process.env.REDIS_PORT ?? "6379", 10);
const password = process.env.REDIS_PASSWORD;

function multiuser(server: http.Server) {
  const io = new Server(server);

  const pubClient = new RedisClient({
    host,
    port,
    password,
  });

  pubClient.on("ready", () => {
    console.log("pub client ready");
    const subClient = pubClient.duplicate();
    subClient.on("ready", () => {
      console.log("sub client ready");
      console.log("creating addapter");
      io.adapter(createAdapter({ pubClient, subClient }));
    });
    subClient.on("error", () => {
      // do nothing
    });
  });
  pubClient.on("error", () => {
    // do nothing
  });

  function broadcastHeadcount(room: string) {
    if (room.startsWith("image:")) {
      const count = io.of("/").adapter.rooms.get(room)?.size;
      io.to(room).emit("headcount", count);
    }
  }

  io.of("/").adapter.on("join-room", (room, _id) => {
    broadcastHeadcount(room);
  });

  io.of("/").adapter.on("leave-room", (room, _id) => {
    broadcastHeadcount(room);
  });

  io.on("connection", (socket: Socket) => {
    socket.on("patch", (res: any) => {
      const projectRoom = [...socket.rooms].find((r) =>
        r.startsWith("project:")
      );
      if (projectRoom !== undefined) {
        socket.to(projectRoom).emit("patch", res);
      }
    });

    socket.on("join", async (res: any) => {
      const projectRoom = `project:${res.project}`;
      const imageRoom = `image:${res.project}:${res.image}`;

      // TODO: we should check that you are allowed to join the room.

      for (const room of socket.rooms) {
        if (room !== imageRoom || room !== projectRoom) {
          socket.leave(room);
        }
      }

      socket.join(projectRoom);
      socket.join(imageRoom);
    });
  });
}

export default multiuser;
