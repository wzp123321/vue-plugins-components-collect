// useFileUpload.ts
import { ref, Ref } from 'vue';
import SparkMD5 from 'spark-md5';

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_CONCURRENT = 10;

interface FastUploadResponse {
  exists: boolean;
}

export function useBigFileUpload() {
  const file: Ref<File | null> = ref(null);
  const progress: Ref<number> = ref(0);

  const selectFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      file.value = target.files[0];
    }
  };

  const calculateFileHash = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const chunkSize = 10 * 1024 * 1024;
      const chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();

      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          spark.append(e.target.result as ArrayBuffer);
          currentChunk++;
          if (currentChunk < chunks) {
            loadNext();
          } else {
            resolve(spark.end());
          }
        }
      };
      fileReader.onerror = () => reject('文件读取失败');
      function loadNext() {
        const start = currentChunk * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        fileReader.readAsArrayBuffer(file.slice(start, end));
      }
      loadNext();
    });
  };

  // 并发批量上传分片
  const uploadChunks = async (file: File, hash: string) => {
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
    const chunks: Blob[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      chunks.push(file.slice(start, end));
    }

    let uploadedCount = 0;
    progress.value = 0;

    // 分片上传任务队列
    const tasks = chunks.map((chunk, index) => async () => {
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('hash', hash);
      formData.append('index', index.toString());
      formData.append('filename', file.name);
      await fetch('/api/upload-chunk', { method: 'POST', body: formData });
      uploadedCount++;
      progress.value = Math.floor((uploadedCount / chunkCount) * 100);
    });

    // 控制并发的执行器
    const runConcurrent = async (taskList: (() => Promise<void>)[], limit: number) => {
      let idx = 0;
      const runners: Promise<void>[] = [];
      const next = async () => {
        if (idx >= taskList.length) return;
        const task = taskList[idx++];
        await task();
        await next();
      };
      for (let i = 0; i < Math.min(limit, taskList.length); i++) {
        runners.push(next());
      }
      await Promise.all(runners);
    };

    await runConcurrent(tasks, MAX_CONCURRENT);
    await uploadComplete(hash, file.name);
  };

  const uploadComplete = async (hash: string, filename: string) => {
    await fetch('/api/upload-complete', {
      method: 'POST',
      body: JSON.stringify({ hash, filename }),
      headers: { 'Content-Type': 'application/json' },
    });
    alert('所有分片上传完成');
  };

  const upload = async () => {
    if (!file.value) return;
    const hash = await calculateFileHash(file.value);
    const fastRes = await fetch('/api/fast-upload', {
      method: 'POST',
      body: JSON.stringify({ hash, filename: file.value.name }),
      headers: { 'Content-Type': 'application/json' },
    });
    const fastData: FastUploadResponse = await fastRes.json();
    if (fastData.exists) {
      progress.value = 100;
      alert('秒传成功，无需上传');
      return;
    }
    await uploadChunks(file.value, hash);
  };

  return {
    file,
    progress,
    selectFile,
    upload,
  };
}
