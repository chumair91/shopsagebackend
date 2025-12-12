import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/UserRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000",process.env.VERCEL_FRONTEND_URL,process.env.VERCEL_ADMIN_URL], // Add your frontend URLs
    credentials: true
  },
  transports: ['websocket', 'polling']
});


// Socket.IO Chat Logic
let clients = {};    // { clientId: { socketId, userId, email, messages: [] } }
let agents = {};     // { socketId: true }

// Helper: send current clients list to all agents
function broadcastClientsList() {
  const list = Object.keys(clients);
  for (const agentId of Object.keys(agents)) {
    io.to(agentId).emit("clients_list", list);
  }
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Agent registers (admin)
  socket.on("agent_register", () => {
    agents[socket.id] = true;
    console.log("Agent registered:", socket.id);

    // send clients list
    socket.emit("clients_list", Object.keys(clients));

    // send chat history for each client
    for (const clientId of Object.keys(clients)) {
      socket.emit("chat_history", { 
        clientId, 
        messages: clients[clientId].messages || [],
        userInfo: {
          email: clients[clientId].email,
          name: clients[clientId].name
        }
      });
    }
  });

  // Client registers with user info
  socket.on("client_register", (data) => {
    const { clientId, userId, email, name } = data;
    
    // If user is logged in, use their actual ID
    const finalClientId = userId ? `user_${userId}` : clientId;
    
    clients[finalClientId] = clients[finalClientId] || { 
      socketId: socket.id, 
      messages: [],
      userId,
      email,
      name,
      isGuest: !userId
    };
    
    clients[finalClientId].socketId = socket.id;
    console.log("Client registered:", finalClientId, email);

    // notify agents about new/updated client list
    broadcastClientsList();
  });

  // Client -> server -> agents
  socket.on("client_message", ({ clientId, message, metadata }) => {
    if (!clients[clientId]) {
      // ensure client record exists
      clients[clientId] = { 
        socketId: socket.id, 
        messages: [],
        isGuest: true
      };
      broadcastClientsList();
    }

    const msgObj = { 
      from: "client", 
      text: message, 
      time: Date.now(),
      metadata: metadata || {}
    };
    
    clients[clientId].messages.push(msgObj);

    // Send to all agents
    for (const agentId of Object.keys(agents)) {
      io.to(agentId).emit("new_message", { 
        clientId, 
        message: msgObj,
        userInfo: {
          email: clients[clientId].email,
          name: clients[clientId].name
        }
      });
    }

    console.log(`Client (${clientId}) -> message:`, message);
  });

  // Agent -> server -> target client
  socket.on("agent_message", ({ clientId, message }) => {
    const msgObj = { 
      from: "agent", 
      text: message, 
      time: Date.now() 
    };

    if (!clients[clientId]) {
      console.warn("agent_message: unknown clientId", clientId);
      return;
    }

    clients[clientId].messages.push(msgObj);

    // send only to that client socket
    io.to(clients[clientId].socketId).emit("new_message", { 
      clientId, 
      message: msgObj 
    });

    console.log(`Agent -> ${clientId}:`, message);
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    // remove agent if present
    if (agents[socket.id]) {
      delete agents[socket.id];
      return;
    }

    // remove client by socketId
    for (const cid of Object.keys(clients)) {
      if (clients[cid].socketId === socket.id) {
        console.log("Removing client:", cid);
        delete clients[cid];
        broadcastClientsList();
        break;
      }
    }
  });
});

// middleware
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRoute);

// Start server
server.listen(port, () => {
  console.log(`Server started with Socket.IO at: http://localhost:${port}`);
});