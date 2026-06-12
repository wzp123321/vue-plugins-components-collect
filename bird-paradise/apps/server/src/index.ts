import http from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@bird-paradise/shared'
import { bindRoomHandlers } from './room.js'

const PORT = Number(process.env.PORT ?? 4000)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, rooms: 0, time: Date.now() })
})

const server = http.createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

io.on('connection', (socket) => {
  bindRoomHandlers(io, socket)
})

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[bird-paradise-server] listening on http://localhost:${PORT}`)
})
