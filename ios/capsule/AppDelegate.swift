import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "capsule",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    // Use explicit URL for Metro bundler on port 8082
    // iOS Simulator can use localhost, but for physical devices use your machine's IP
    #if targetEnvironment(simulator)
      return URL(string: "http://localhost:8082/index.bundle?platform=ios&dev=true")
    #else
      // For physical devices, you need to use your machine's IP address
      // Find your IP with: ipconfig getifaddr en0 (or check System Preferences > Network)
      // Common local network IPs: 192.168.x.x or 10.0.x.x
      // Update the IP below to match your machine's IP address on the same network
      let deviceIP = "192.168.2.17" // TODO: Update this to your machine's IP
      return URL(string: "http://\(deviceIP):8082/index.bundle?platform=ios&dev=true")
    #endif
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
