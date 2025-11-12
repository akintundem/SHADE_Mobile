package com.capsule.video

import android.media.*
import com.facebook.react.bridge.*
import java.io.File
import java.nio.ByteBuffer

class VideoEditorModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "VideoEditor"

  @ReactMethod
  fun trim(options: ReadableMap, promise: Promise) {
    val path = options.getString("path") ?: return promise.reject("EINVAL", "path missing")
    val start = options.getDouble("start")
    val end = options.getDouble("end")
    val muted = if (options.hasKey("muted")) options.getBoolean("muted") else false

    try {
      val outFile = File(ctx.cacheDir, "trim_${System.currentTimeMillis()}.mp4")
      muxTrim(path, outFile.absolutePath, (start * 1_000_000L).toLong(), (end * 1_000_000L).toLong(), muted)
      promise.resolve(outFile.absolutePath)
    } catch (e: Exception) {
      promise.reject("EEXPORT", e)
    }
  }

  private fun muxTrim(inputPath: String, outputPath: String, startUs: Long, endUs: Long, muted: Boolean) {
    val extractor = MediaExtractor()
    extractor.setDataSource(inputPath)
    val muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
    val trackCount = extractor.trackCount
    val indexMap = HashMap<Int, Int>(trackCount)

    for (i in 0 until trackCount) {
      extractor.selectTrack(i)
      val format = extractor.getTrackFormat(i)
      val mime = format.getString(MediaFormat.KEY_MIME) ?: ""
      if (muted && mime.startsWith("audio/")) continue
      val dstIndex = muxer.addTrack(format)
      indexMap[i] = dstIndex
      extractor.unselectTrack(i)
    }

    muxer.start()

    val bufferSize = 1 * 1024 * 1024
    val buffer = ByteBuffer.allocate(bufferSize)
    val bufferInfo = MediaCodec.BufferInfo()

    for (i in 0 until trackCount) {
      extractor.selectTrack(i)
      val format = extractor.getTrackFormat(i)
      val mime = format.getString(MediaFormat.KEY_MIME) ?: ""
      if (muted && mime.startsWith("audio/")) continue

      extractor.seekTo(startUs, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)
      while (true) {
        bufferInfo.offset = 0
        bufferInfo.size = extractor.readSampleData(buffer, 0)
        if (bufferInfo.size < 0) {
          bufferInfo.size = 0
          break
        }
        val sampleTime = extractor.sampleTime
        if (sampleTime > endUs) break
        bufferInfo.presentationTimeUs = sampleTime - startUs
        bufferInfo.flags = extractor.sampleFlags

        val trackIndex = extractor.sampleTrackIndex
        val dstIndex = indexMap[trackIndex] ?: continue
        muxer.writeSampleData(dstIndex, buffer, bufferInfo)
        extractor.advance()
      }
      extractor.unselectTrack(i)
    }

    muxer.stop()
    muxer.release()
    extractor.release()
  }
}

