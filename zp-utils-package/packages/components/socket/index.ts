/**
 * scoket 连接方法
 * @param {String} scoketUrl scoket连接url
 * @param {Boolean} isConcent scoket 连接状态
 * @type {}
 * @return {}
 */

let scoket: WebSocket;
let isConcent = false; //连接状态

export const webScoketInit = (options: { url: string; onmessage?: (ev: MessageEvent) => any }): Promise<WebSocket> => {
	const { url, onmessage } = options;
	return new Promise((reslove) => {
		try {
			scoket = new WebSocket(url);
			if (typeof WebSocket == undefined) {
				alert("您的浏览器不支持socket！使用谷歌浏览器！");
			} else {
				scoket.onopen = () => {
					isConcent = true;
					heartCheck.start();
					reslove(scoket);
				};
				scoket.onmessage = (ev: MessageEvent) => {
					if (ev.data == "HeartBeat") {
						heartCheck.reset();
					} else {
						onmessage && onmessage(ev);
					}
				};
				//监听socket错误信息
				scoket.onerror = (err) => {
					if (!err) {
						isConcent = false;
					}
				};
				scoket.onclose = () => {
					isConcent = false;
					scoket.close();
					console.log("执行重连");
					webScoketInit({
						url,
						onmessage,
					});
				};
			}
		} catch {
			throw "scoket连接错误";
		}
	});
};

/**
 *  向服务端发送消息的方法
 * @param {String} message 发送的内容（必须是字符串）
 * @return {}
 */
export const messageSend = (message: string) => {
	if (typeof message === "object") {
		message = JSON.stringify(message);
	}
	const { readyState, OPEN, CLOSED, CLOSING, CONNECTING } = scoket;
	switch (readyState) {
		// CONNECTING：值为0，表示正在连接。
		case CONNECTING:
			break;
		// OPEN：值为1，表示连接成功，可以通信了。
		case OPEN:
			scoket.send(message);
			break;
		// CLOSING：值为2，表示连接正在关闭。
		case CLOSING:
			break;
		// CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
		case CLOSED:
			break;
		default:
			break;
	}
};

/*
  scoket 心跳检测机制方法
  每间隔 30s 向服务端发起一个询问 HeartBeat 如果服务端返回消息表示连接正常则重置心跳
  如果scoket 抛错则需要进行scoket重连
*/
const heartCheck = {
	timeout: 3000,
	timeoutObj: undefined,
	reset: function () {
		clearTimeout(heartCheck.timeoutObj);
		heartCheck.start();
	},
	start: function () {
		(heartCheck.timeoutObj as unknown as NodeJS.Timeout) = setTimeout(() => {
			console.log("发送心跳检测");
			if (isConcent) {
				scoket.send("HeartBeat");
			} else {
				clearTimeout(heartCheck.timeoutObj);
			}
		}, heartCheck.timeout);
	},
};
