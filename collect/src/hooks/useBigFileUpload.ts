import { ref, computed, type Ref } from 'vue'
import { calculateFileHash, formatFileSize } from '@/utils/file'

export interface ChunkInfo {
  index: number
  start: number
  end: number
  blob: Blob
  status: 'pending' | 'uploading' | 'success' | 'error'
  retryCount: number
}

export interface UseBigFileUploadOptions {
  chunkSize?: number
  concurrentUploads?: number
  maxRetries?: number
  uploadChunk: (formData: FormData) => Promise<void>
  notifyMerge?: (hash: string, fileName: string, totalChunks: number) => Promise<void>
}

export function useBigFileUpload(options: UseBigFileUploadOptions) {
  const {
    chunkSize = 10 * 1024 * 1024,
    concurrentUploads = 3,
    maxRetries = 3,
    uploadChunk: uploadChunkFn,
    notifyMerge,
  } = options

  const currentFile: Ref<File | null> = ref(null)
  const fileHash = ref('')
  const chunkList = ref<ChunkInfo[]>([])
  const uploading = ref(false)
  const paused = ref(false)
  const uploadedChunks = ref(0)
  const hashProgress = ref(0)

  const uploadProgress = computed(() => {
    if (chunkList.value.length === 0) return 0
    return (uploadedChunks.value / chunkList.value.length) * 100
  })

  const uploadSpeed = computed(() => {
    if (uploadProgress.value === 0 || uploadProgress.value === 100) return '0 KB/s'
    const elapsed = (Date.now() - startTime.value) / 1000
    if (elapsed === 0) return '0 KB/s'
    const speed = (uploadedChunks.value * chunkSize) / elapsed
    return formatFileSize(speed) + '/s'
  })

  const startTime = ref(0)

  function createChunks(file: File): ChunkInfo[] {
    const chunks: ChunkInfo[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      chunks.push({
        index: i,
        start,
        end,
        blob: file.slice(start, end),
        status: 'pending',
        retryCount: 0,
      })
    }
    return chunks
  }

  async function computeHash(file: File) {
    hashProgress.value = 0
    fileHash.value = await calculateFileHash(file, chunkSize, (percent) => {
      hashProgress.value = percent
    })
    return fileHash.value
  }

  function setupFile(file: File) {
    currentFile.value = file
    fileHash.value = ''
    chunkList.value = []
    uploadedChunks.value = 0
    hashProgress.value = 0
  }

  function resetUpload() {
    uploading.value = false
    paused.value = false
    uploadedChunks.value = 0
    chunkList.value.forEach((chunk) => {
      chunk.status = 'pending'
      chunk.retryCount = 0
    })
  }

  function pauseUpload() {
    paused.value = true
  }

  async function uploadChunk(chunk: ChunkInfo) {
    chunk.status = 'uploading'

    const formData = new FormData()
    formData.append('file', chunk.blob)
    formData.append('hash', fileHash.value)
    formData.append('index', chunk.index.toString())
    formData.append('total', chunkList.value.length.toString())
    formData.append('filename', currentFile.value!.name)

    try {
      await uploadChunkFn(formData)
      chunk.status = 'success'
      uploadedChunks.value++
    } catch (error) {
      chunk.status = 'error'
      chunk.retryCount++

      if (chunk.retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        chunk.status = 'pending'
        await uploadChunk(chunk)
      }
    }
  }

  async function uploadChunksConcurrently() {
    const pendingChunks = chunkList.value.filter((chunk) => chunk.status === 'pending')

    if (pendingChunks.length === 0) {
      if (chunkList.value.every((chunk) => chunk.status === 'success')) {
        await notifyMergeComplete()
      }
      return
    }

    const uploadPromises: Promise<void>[] = []
    let currentIndex = 0

    const uploadNextChunk = async () => {
      while (currentIndex < pendingChunks.length && paused.value) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (currentIndex >= pendingChunks.length || paused.value) {
        return
      }

      const chunk = pendingChunks[currentIndex]
      currentIndex++

      if (chunk.status !== 'pending') {
        return uploadNextChunk()
      }

      await uploadChunk(chunk)

      if (!paused.value) {
        return uploadNextChunk()
      }
    }

    for (let i = 0; i < Math.min(concurrentUploads, pendingChunks.length); i++) {
      uploadPromises.push(uploadNextChunk())
    }

    await Promise.all(uploadPromises)

    if (!paused.value) {
      const allSuccess = chunkList.value.every((chunk) => chunk.status === 'success')
      if (allSuccess) {
        await notifyMergeComplete()
      }
    }
  }

  async function notifyMergeComplete() {
    uploading.value = false
    if (notifyMerge) {
      await notifyMerge(fileHash.value, currentFile.value!.name, chunkList.value.length)
    }
  }

  function startUpload() {
    if (!currentFile.value || !fileHash.value) return
    uploading.value = true
    paused.value = false
    startTime.value = Date.now()
    return uploadChunksConcurrently()
  }

  async function prepareAndUpload(file: File) {
    setupFile(file)
    chunkList.value = createChunks(file)
    await computeHash(file)
    return startUpload()
  }

  return {
    currentFile,
    fileHash,
    chunkList,
    uploading,
    paused,
    uploadedChunks,
    uploadProgress,
    uploadSpeed,
    hashProgress,
    setupFile,
    createChunks,
    computeHash,
    startUpload,
    pauseUpload,
    resetUpload,
    prepareAndUpload,
    uploadChunksConcurrently,
  }
}