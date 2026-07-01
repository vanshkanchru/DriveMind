const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const healthRoutes = require("./routes/healthRoutes");
const telemetryRoutes = require("./routes/telemetryRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const roadRiskRoutes = require("./routes/roadRiskRoutes");
const graphRoutes = require("./routes/graphRoutes");
const connectDB = require("./config/db");
const { connectNeo4j } = require("./config/neo4j");
const { initSocket } = require("./services/socketService");

dotenv.config();
connectDB();
connectNeo4j();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initSocket(io);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "DriveMind backend is running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/road-risk", roadRiskRoutes);
app.use("/api/graph", graphRoutes);

io.on("connection", (socket) => {
  console.log("Vehicle/dashboard connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`DriveMind backend running on port ${PORT}`);
});