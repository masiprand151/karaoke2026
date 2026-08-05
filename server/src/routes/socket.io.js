const { Server } = require("socket.io");

const rooms = new Map();

const createIo = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // room join
    socket.on("room-join", ({ roomId, name }) => {
      const channel = name;
      socket.join(channel);
      rooms.set(socket.id, { roomId, name, channel });
      console.log(`${channel} joined`);
    });

    // kasir join
    socket.on("cashier-join", () => {
      socket.join("cashier");
      console.log("Cashier joined");
    });

    // room call kasir
    socket.on("call", ({ roomId, name }) => {
      console.log(`${roomId} called cashier`);

      io.to("cashier").emit("call-cashier", { roomId, name, time: Date.now() });
    });

    // room chat ke kasir
    socket.on("chat", ({ to, data }) => {
      console.log(to, ":", data);

      io.to(to).emit("chat", data);
    });

    // kasir balas ke room
    socket.on("reply-chat-room", ({ roomId, name, message }) => {
      const channel = name;

      console.log(channel, { from: "cashier", message, time: Date.now() });

      io.to(channel).emit("chat", {
        from: "cashier",
        message,
        time: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      const info = rooms.get(socket.id);
      if (info) {
        console.log(`Room ${info.channel} disconnected`);
        rooms.delete(socket.id);
      } else {
        console.log("Client disconnected:", socket.id);
      }
    });
  });
};

module.exports = { createIo };
