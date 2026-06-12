import { io, Socket } from 'socket.io-client'
import type {
  PlayerInput, PlayerPublic, SeatIndex, WorldSnapshot, JoinResponse
} from '../protocol'

type Listener<T> = (v: T) => void

class GameSocket {
  private socket: Socket | null = null
  private serverUrl: string

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, { transports: ['websocket'], autoConnect: true })
      this.socket.once('connect', () => resolve())
      this.socket.once('connect_error', (e) => reject(e))
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  join(data: { roomId: string; name: string; preferredSeat?: SeatIndex }): Promise<JoinResponse> {
    return new Promise((resolve) => {
      this.socket!.emit('join', data, (resp: JoinResponse) => resolve(resp))
    })
  }

  leave(): void {
    this.socket?.emit('leave')
  }

  sendInput(input: PlayerInput): void {
    this.socket?.emit('input', input)
  }

  resync(): Promise<WorldSnapshot> {
    return new Promise((resolve) => {
      this.socket!.emit('resync', (snap: WorldSnapshot) => resolve(snap))
    })
  }

  onSnapshot(fn: Listener<WorldSnapshot>): void { this.socket?.on('snapshot', fn) }
  onPlayerJoined(fn: Listener<PlayerPublic>): void { this.socket?.on('playerJoined', fn) }
  onPlayerLeft(fn: Listener<SeatIndex>): void { this.socket?.on('playerLeft', fn) }
  onNotice(fn: Listener<{ kind: 'info' | 'warn' | 'error'; text: string }>): void { this.socket?.on('notice', fn) }

  offAll(): void {
    this.socket?.removeAllListeners()
  }
}

export { GameSocket }
