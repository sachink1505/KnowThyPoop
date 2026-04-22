package com.pooptracker.site;

import android.os.Bundle;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    CookieManager cm = CookieManager.getInstance();
    cm.setAcceptCookie(true);
    cm.setAcceptThirdPartyCookies(this.bridge.getWebView(), true);
    cm.flush();
  }

  @Override
  public void onPause() {
    super.onPause();
    CookieManager.getInstance().flush();
  }
}
