import { io, Socket } from "socket.io-client";
import type {
  PlayerAccount,
  PlayerInput,
  PlayerPublic,
  SeatIndex,
  TopUpResponse,
  WorldSnapshot,
  JoinResponse,
} from "@bird-paradise/shared";

type Listener<T> = (v: T) => void;

class GameSocket {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        // 先尝试 websocket，失败后由 socket.io 自动降级到 polling
        transports: ["websocket", "polling"],
        // 避免一创建就立即连接（让 join 显式触发，便于做重试）
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 500,
        reconnectionDelayMax: 2000,
        timeout: 5000,
      });
      let settled = false;
      this.socket.once("connect", () => {
        if (settled) return;
        settled = true;
        resolve();
      });
      this.socket.once("connect_error", (e) => {
        if (settled) return;
        // 给 socket.io 客户端库 1.5s 自我重试窗口，再判失败
        setTimeout(() => {
          if (settled) return;
          if (this.socket?.connected) {
            settled = true;
            resolve();
          } else {
            settled = true;
            reject(new Error(`连接服务失败：${e?.message ?? "服务端未就绪"}`));
          }
        }, 1500);
      });
      this.socket.connect();
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  join(data: {
    roomId: string;
    name: string;
    preferredSeat?: SeatIndex;
  }): Promise<JoinResponse> {
    return new Promise((resolve) => {
      this.socket!.emit("join", data, (resp: JoinResponse) => resolve(resp));
    });
  }

  leave(): void {
    this.socket?.emit("leave");
  }

  sendInput(input: PlayerInput): void {
    this.socket?.emit("input", input);
  }

  resync(): Promise<WorldSnapshot> {
    return new Promise((resolve) => {
      this.socket!.emit("resync", (snap: WorldSnapshot) => resolve(snap));
    });
  }

  topUp(amount: number): Promise<TopUpResponse> {
    return new Promise((resolve) => {
      this.socket!.emit("topUp", { amount }, (resp: TopUpResponse) =>
        resolve(resp),
      );
    });
  }

  onSnapshot(fn: Listener<WorldSnapshot>): void {
    this.socket?.on("snapshot", fn);
  }
  onPlayerJoined(fn: Listener<PlayerPublic>): void {
    this.socket?.on("playerJoined", fn);
  }
  onPlayerLeft(fn: Listener<SeatIndex>): void {
    this.socket?.on("playerLeft", fn);
  }
  onAccountUpdated(
    fn: Listener<{ seat: SeatIndex; account: PlayerAccount }>,
  ): void {
    this.socket?.on("accountUpdated", fn);
  }
  onNotice(
    fn: Listener<{ kind: "info" | "warn" | "error"; text: string }>,
  ): void {
    this.socket?.on("notice", fn);
  }

  offAll(): void {
    this.socket?.removeAllListeners();
  }
}

export { GameSocket };
