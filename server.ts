import { app } from './app'
import connectDB from './utils/db'
import * as http from "http";
import {initSocketServer} from "./socket-server";

require('dotenv').config()

const server = http.createServer(app)

initSocketServer(server);

// create server
server.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`)
  void connectDB().then(res => {
    console.log('Connect DB is true')
  })
})
