import { exec } from 'child_process';
import { writeFile } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const filename = fileURLToPath(import.meta.url);
const dr = dirname(filename);
console.log(dr);

/**
 * 生成json文件
 */
function genJsonFile(json) {
  writeFile(resolve(dr, '../public/about.json'), json, 'utf8', (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('git.json 生成成功！');
    }
  });
}
/**
 * 获取commitId
 */
function getGitCommitId() {
  return new Promise((resolve, reject) => {
    try {
      exec('git rev-parse HEAD', (error, stdout) => {
        resolve(stdout);
      });
    } catch (error) {
      reject(error);
    }
  });
}
// 使用函数获取commit ID
getGitCommitId().then((res) => {
  const jsonData = {
    commitId: res.trim(),
    date: new Date(),
  };
  genJsonFile(JSON.stringify(jsonData));
});
