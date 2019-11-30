package com.skydoves.planes

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.KeyEvent
import android.view.KeyEvent.*
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import io.reactivex.Observable
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.schedulers.Schedulers
import kotlinx.android.synthetic.main.activity_main.*
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

  // composite all disposable observables
  private val compositeDisposable = CompositeDisposable()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    // initialize webView settings
    initializeWebView()
    // initialize interval emmit resource from observable
    initializeIntervalObservable()
    // initialize UI things
    initializeUI()
  }

  @SuppressLint("SetJavaScriptEnabled")
  private fun initializeWebView() {
    webView.settings.javaScriptEnabled = true
    webView.loadUrl("file:///android_asset/plane/index.html")
    webView.webViewClient = object : WebViewClient() {
    }
  }

  private fun initializeIntervalObservable() {
    val observable = Observable.interval(200L, TimeUnit.MILLISECONDS).timeInterval()
      .subscribeOn(Schedulers.io()).observeOn(AndroidSchedulers.mainThread()).subscribe {
        webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, KEYCODE_W))
      }
    this.compositeDisposable.add(observable)
  }

  private fun initializeUI() {
    button_go.setOnClickListener {
      actionUpAllKeys()
      webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, KEYCODE_DPAD_DOWN))
    }
    button_left.setOnClickListener {
      actionUpAllKeys()
      webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, KEYCODE_DPAD_LEFT))
    }
    button_stop.setOnClickListener {
      actionUpAllKeys()
    }
    button_right.setOnClickListener {
      actionUpAllKeys()
      webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, KEYCODE_DPAD_RIGHT))
    }
    button_back.setOnClickListener {
      actionUpAllKeys()
      webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, KEYCODE_DPAD_UP))
    }
  }

  private fun actionUpAllKeys() {
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_UP))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_LEFT))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_RIGHT))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_DOWN))
  }

  override fun onDestroy() {
    this.compositeDisposable.dispose()
    super.onDestroy()
  }
}
