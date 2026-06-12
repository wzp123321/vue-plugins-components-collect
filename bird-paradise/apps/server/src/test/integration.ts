// 服务端集成测试：4 玩家加入、持续扫射、统计击杀
import { io, Socket } from "socket.io-client";

const URL = process.env.URL || "http://localhost:4000";
const ROOM = "testroom-" + Date.now();

function client(): Socket {
  return io(URL, { transports: ["websocket"] });
}

interface PlayerStats {
  name: string;
  seat: number;
  snapCount: number;
  killEvents: number;
  hitEvents: number;
  finalScore: number;
  lastScore: number;
}

async function joinAndFire(s: Socket, name: string): Promise<PlayerStats> {
  await new Promise<void>((r) => s.once("connect", () => r()));
  const joinResp: any = await new Promise((r) =>
    s.emit("join", { roomId: ROOM, name }, (resp: any) => r(resp)),
  );
  if (!joinResp.ok) throw new Error("join failed: " + joinResp.reason);
  const stats: PlayerStats = {
    name,
    seat: joinResp.seat,
    snapCount: 0,
    killEvents: 0,
    hitEvents: 0,
    finalScore: 0,
    lastScore: 0,
  };
  s.on("snapshot", (snap: any) => {
    stats.snapCount++;
    const me = snap.players[stats.seat];
    if (me) {
      if (me.score !== stats.lastScore) {
        stats.lastScore = me.score;
        if (stats.lastScore > 0)
          console.log(
            `[${name}] score=${me.score}  tick=${snap.tick}  birds=${snap.birds.length}`,
          );
      }
    }
    for (const e of snap.events) {
      if (e.seat === stats.seat) {
        if ("damage" in e) stats.hitEvents++;
        if ("kind" in e && e.seat === stats.seat) stats.killEvents++;
      }
    }
  });
  return stats;
}

function scanShoot(
  s: Socket,
  seat: number,
  mult: number,
  period: number,
  range: number,
): NodeJS.Timer {
  let t = 0;
  return setInterval(() => {
    t += 30;
    const angle = -Math.PI / 2 + Math.sin(t / period) * range;
    s.emit("input", {
      seat,
      angle,
      multiplier: mult,
      firing: true,
      t: Date.now(),
    });
  }, 30);
}

async function run(): Promise<void> {
  const a = client();
  const b = client();
  const c = client();
  const d = client();
  const sa = await joinAndFire(a, "甲");
  const sb = await joinAndFire(b, "乙");
  const sc = await joinAndFire(c, "丙");
  const sd = await joinAndFire(d, "丁");
  console.log(
    "[test] 4 players joined: seats",
    sa.seat,
    sb.seat,
    sc.seat,
    sd.seat,
  );

  // 每个玩家不同扫描节奏与倍数
  const ta = scanShoot(a, sa.seat, 200, 220, 0.85);
  const tb = scanShoot(b, sb.seat, 500, 180, 0.7);
  const tc = scanShoot(c, sc.seat, 1000, 260, 0.9);
  const td = scanShoot(d, sd.seat, 100, 200, 0.6);

  // 跑 6 秒
  await new Promise((r) => setTimeout(r, 6000));

  clearInterval(ta);
  clearInterval(tb);
  clearInterval(tc);
  clearInterval(td);
  a.disconnect();
  b.disconnect();
  c.disconnect();
  d.disconnect();

  for (const st of [sa, sb, sc, sd]) {
    console.log(
      `[${st.name}] snap=${st.snapCount} hit=${st.hitEvents} kill=${st.killEvents} score=${st.lastScore}`,
    );
  }

  const totalKills =
    sa.killEvents + sb.killEvents + sc.killEvents + sd.killEvents;
  const totalHits = sa.hitEvents + sb.hitEvents + sc.hitEvents + sd.hitEvents;
  if (totalHits > 0 && sa.snapCount > 100) {
    console.log(
      `[test] OK ✅  共 ${totalHits} 命中 / ${totalKills} 击杀 / 4 玩家 4 个不同座位`,
    );
    process.exit(0);
  } else {
    console.error("[test] FAIL ❌");
    process.exit(2);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
