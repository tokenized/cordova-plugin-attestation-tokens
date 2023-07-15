package com.tokenized.cordova.attestation_tokens;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.AppCheckToken;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;

public class AttestationTokens extends CordovaPlugin {
    private static final String TAG = "AttestationTokensPlugin";

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);

        // An after_prepare hook script, debugSwitch.js, selects between
        // DebugAppCheckProviderFactory and PlayIntegrityAppCheckProviderFactory,
        // by modifying the copy of this file created by Cordova in the platform dir
        FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
        firebaseAppCheck.installAppCheckProviderFactory(PlayIntegrityAppCheckProviderFactory.getInstance());
    }

    public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) {
        if (action.equals("getToken")) {
            getToken(callbackContext);
            return true;
        } else if (action.equals("getLimitedUseToken")) {
            getLimitedUseToken(callbackContext);
            return true;
        }

        // Unknown action
        return false;
    }

    private void getToken(CallbackContext callbackContext) {
        FirebaseAppCheck.getInstance()
            .getAppCheckToken(false)
            .addOnCompleteListener(new OnCompleteListener<AppCheckToken>() {
                @Override
                public void onComplete(Task<AppCheckToken> task) {
                    if (task.isSuccessful() && task.getResult().getToken() != null) {
                        cordova.getActivity().runOnUiThread(() ->
                            callbackContext.success(task.getResult().getToken()));
                    } else {
                        Exception exception = task.getException();
                        if (exception != null && exception.getLocalizedMessage() != null) {
                            cordova.getActivity().runOnUiThread(() ->
                                callbackContext.error(exception.getLocalizedMessage()));
                        } else {
                            cordova.getActivity().runOnUiThread(() ->
                                callbackContext.error("Couldn't get attestation token"));
                        }
                    }
                }
            });
    }

    private void getLimitedUseToken(CallbackContext callbackContext) {
        FirebaseAppCheck.getInstance()
            .getLimitedUseAppCheckToken()
            .addOnCompleteListener(new OnCompleteListener<AppCheckToken>() {
                @Override
                public void onComplete(Task<AppCheckToken> task) {
                    if (task.isSuccessful() && task.getResult().getToken() != null) {
                        cordova.getActivity().runOnUiThread(() ->
                            callbackContext.success(task.getResult().getToken()));
                    } else {
                        Exception exception = task.getException();
                        if (exception != null && exception.getLocalizedMessage() != null) {
                            cordova.getActivity().runOnUiThread(() ->
                                callbackContext.error(exception.getLocalizedMessage()));
                        } else {
                            cordova.getActivity().runOnUiThread(() ->
                                callbackContext.error("Couldn't get attestation token"));
                        }
                    }
                }
            });
    }
}
