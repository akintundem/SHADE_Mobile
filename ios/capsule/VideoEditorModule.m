#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoEditorModule, NSObject)

RCT_EXTERN_METHOD(trim:(NSDictionary)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

