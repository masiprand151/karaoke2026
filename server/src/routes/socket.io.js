const { Server } = require("socket.io");
const prisma = require("../configs/prisma");

const rooms = new Map();
let io;

const createIo = (server) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    // room join
    socket.on("room-join", async ({ roomId, name }) => {
      const channel = name;
      socket.join(channel);
      rooms.set(socket.id, { roomId, name, channel });
    });

    // kasir join
    socket.on("cashier-join", () => {
      socket.join("cashier");
    });

    // room call kasir
    socket.on("call", ({ roomId, name }) => {
      io.to("cashier").emit("call-cashier", { roomId, name, time: Date.now() });
    });

    // room chat ke kasir
    socket.on("chat", ({ to, data }) => {
      io.to(to).emit("chat", data);
    });

    // kasir balas ke room
    socket.on("reply-chat-room", ({ roomId, name, message }) => {
      const channel = name;

      io.to(channel).emit("chat", {
        from: "cashier",
        message,
        time: Date.now(),
      });
    });

    // kasir checkin + data transaction & session
    socket.on("cashier-checkin", ({ roomId, name, data }) => {
      const channel = name;

      const sockets = io.sockets.adapter.rooms.get(channel);

      // kirim ke room dan trima di room
      io.to(channel).emit("room-checkin", {
        roomId,
        name,
        data,
      });
    });

    socket.on("disconnect", () => {
      const info = rooms.get(socket.id);
      if (info) {
        rooms.delete(socket.id);
      }
    });
  });
};

const getIo = () => {
  if (!io) throw new Error("Socket.IO belum diinisialisasi");

  return io;
};

module.exports = { createIo, getIo };
