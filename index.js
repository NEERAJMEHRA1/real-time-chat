//NPM
import http from "http";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import database from "./src/helper/config/db.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const socket = require("socket.io")
import userRouter from "./src/api/users/index.js";
import { createRoomId, getUserChatList, readChatList } from "./src/api/chat/controller.js";

const app = express();
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

const corsOption = {
    origin: "*",
    Credential: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOption));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    console.log("Hello Neeraj");
    res.send("Hello this is testing server.")
})

//API's routing
app.use("/users", userRouter);

//server connection
const server = http.createServer(app);

//socket connection setup
var io = socket(server);
io.on('connection', socket => {
    console.log("Socket connected");

    // create char room id
    socket.on("createRoomId", async (data) => {
        await createRoomId(data);
    });

    //read chat
    socket.on("readMessage", async (data) => {
        console.log("message Read");
        await readChatList(data);
    });

    //read chat
    socket.on("getUserChatList", async (data) => {
        console.log("Get user chat list");
        await getUserChatList(data);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(port, () => console.log(`Server running at: http://localhost:${port}`));
database;