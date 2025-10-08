import Foundation
import AVFoundation

@objc(VideoEditorModule)
class VideoEditorModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc(trim:resolver:rejecter:)
  func trim(options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let path = options["path"] as? String else {
      rejecter("EINVAL", "path missing", nil)
      return
    }
    let start = options["start"] as? Double ?? 0
    let end = options["end"] as? Double ?? 0
    let muted = options["muted"] as? Bool ?? false

    let url = URL(fileURLWithPath: path)
    let asset = AVURLAsset(url: url)
    let composition = AVMutableComposition()

    let timeRange = CMTimeRange(start: CMTime(seconds: start, preferredTimescale: 600),
                                end: CMTime(seconds: end > 0 ? end : asset.duration.seconds, preferredTimescale: 600))

    // Video track
    if let videoTrack = asset.tracks(withMediaType: .video).first,
       let compVideo = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) {
      do {
        try compVideo.insertTimeRange(timeRange, of: videoTrack, at: .zero)
        compVideo.preferredTransform = videoTrack.preferredTransform
      } catch {
        rejecter("EINSERT", "Failed to insert video track", error)
        return
      }
    }

    if !muted, let audioTrack = asset.tracks(withMediaType: .audio).first,
       let compAudio = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
      do { try compAudio.insertTimeRange(timeRange, of: audioTrack, at: .zero) } catch {}
    }

    let export = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality)
    let outPath = (NSTemporaryDirectory() as NSString).appendingPathComponent("trim_\(UUID().uuidString).mp4")
    let outURL = URL(fileURLWithPath: outPath)
    export?.outputURL = outURL
    export?.outputFileType = .mp4
    export?.shouldOptimizeForNetworkUse = true
    export?.exportAsynchronously(completionHandler: {
      if export?.status == .completed {
        resolver(outPath)
      } else {
        rejecter("EEXPORT", export?.error?.localizedDescription ?? "Unknown", export?.error)
      }
    })
  }
}

