import https from "node:https";
import http from "node:http";

// 从服务器获取并解析 whitelist.json 文件：
// - 支持 HTTP/HTTPS 协议
// - 文件不存在、网络异常、JSON 非法都视为硬失败
// - 失败时通过 Promise reject 返回错误信息
function fetchWhitelist(url) {
  return new Promise((resolve, reject) => {
    // 根据 URL 协议选择对应的客户端
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        // 分块接收响应数据
        res.on("data", (chunk) => {
          data += chunk;
        });
        // 响应接收完成后解析 JSON
        res.on("end", () => {
          try {
            const config = JSON.parse(data);
            // 验证 dependencies 字段格式
            if (!Array.isArray(config.dependencies)) {
              reject(
                new Error(
                  "whitelist.json 格式错误，dependencies 必须是字符串数组",
                ),
              );
              return;
            }
            // 仅允许字符串项，避免对象配置导致规则理解不一致
            const invalid = config.dependencies.filter(
              (item) => typeof item !== "string" || item.trim() === "",
            );
            if (invalid.length > 0) {
              reject(
                new Error(
                  "whitelist.json 格式错误，dependencies 只能包含非空字符串",
                ),
              );
              return;
            }
            // 返回与 loadWhitelist 相同的数据结构，便于统一使用
            resolve({
              url,
              // 用 Set 做 O(1) 查询，减少每次依赖匹配开销
              list: Array.from(
                new Set(config.dependencies.map((item) => item.trim())),
              ),
            });
          } catch (error) {
            reject(new Error(`解析 JSON 失败: ${error.message}`));
          }
        });
      })
      .on("error", (error) => {
        // 网络请求失败（如 DNS 解析失败、连接超时等）
        reject(new Error(`请求失败: ${error.message}`));
      });
  });
}

export { fetchWhitelist };
