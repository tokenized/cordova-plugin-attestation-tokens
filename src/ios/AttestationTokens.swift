import Foundation
import FirebaseCore
import FirebaseAppCheck

class AttestationTokensAppCheckProviderFactory: NSObject, AppCheckProviderFactory {
  func createProvider(with app: FirebaseApp) -> AppCheckProvider? {
    return AppAttestProvider(app: app)
  }
}

@objc(AttestationTokens) class AttestationTokens: CDVPlugin {
    override func pluginInitialize() {
        super.pluginInitialize()

        if FirebaseApp.app() != nil {
            fatalError("AttestationTokens plugin initialized with Firebase already configured. Move it earlier in the plugin list.")
        }

        // An after_prepare hook script, debugSwitch.js, selects between
        // AppCheckDebugProviderFactory and AttestationTokensAppCheckProviderFactory,
        // by modifying the copy of this file created by Cordova in the platform dir
        let providerFactory = AttestationTokensAppCheckProviderFactory()
        AppCheck.setAppCheckProviderFactory(providerFactory)

        FirebaseApp.configure()
    }

    @objc(getToken:)
    func getToken(_ command: CDVInvokedUrlCommand) {
        AppCheck.appCheck().token(forcingRefresh: false) { token, error in
            var pluginResult: CDVPluginResult

            if let error {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_ERROR,
                    messageAs: error.localizedDescription
                )
                self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
                return
            }
            guard let token else {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_ERROR,
                    messageAs: "Couldn't get attestation token"
                )
                self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
                return
            }

            pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: token.token)
            self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
        }
    }

    @objc(getLimitedUseToken:)
    func getLimitedUseToken(_ command: CDVInvokedUrlCommand) {
        AppCheck.appCheck().limitedUseToken() { token, error in
            var pluginResult: CDVPluginResult

            if let error {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_ERROR,
                    messageAs: error.localizedDescription
                )
                self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
                return
            }
            guard let token else {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_ERROR,
                    messageAs: "Couldn't get attestation token"
                )
                self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
                return
            }

            pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: token.token)
            self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
        }
    }
}
