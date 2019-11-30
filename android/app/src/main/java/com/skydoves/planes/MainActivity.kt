package com.skydoves.planes

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.KeyEvent
import android.view.KeyEvent.ACTION_DOWN
import android.view.KeyEvent.ACTION_UP
import android.view.KeyEvent.KEYCODE_DPAD_DOWN
import android.view.KeyEvent.KEYCODE_DPAD_LEFT
import android.view.KeyEvent.KEYCODE_DPAD_RIGHT
import android.view.KeyEvent.KEYCODE_DPAD_UP
import android.view.KeyEvent.KEYCODE_E
import android.view.KeyEvent.KEYCODE_Q
import android.view.KeyEvent.KEYCODE_W
import android.view.MotionEvent
import android.view.View
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import io.reactivex.Observable
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.schedulers.Schedulers
import kotlinx.android.synthetic.main.activity_main.button_back
import kotlinx.android.synthetic.main.activity_main.button_left
import kotlinx.android.synthetic.main.activity_main.button_right
import kotlinx.android.synthetic.main.activity_main.button_turn_left
import kotlinx.android.synthetic.main.activity_main.button_turn_right
import kotlinx.android.synthetic.main.activity_main.button_up
import kotlinx.android.synthetic.main.activity_main.webView
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
    setTurnKeyTouchListener(button_up, KEYCODE_DPAD_DOWN)
    setTurnKeyTouchListener(button_turn_left, KEYCODE_DPAD_LEFT)
    setTurnKeyTouchListener(button_turn_right, KEYCODE_DPAD_RIGHT)
    setTurnKeyTouchListener(button_back, KEYCODE_DPAD_UP)

    setMoveKeyTouchListener(button_left, KEYCODE_Q)
    setMoveKeyTouchListener(button_right, KEYCODE_E)
  }

  private fun setTurnKeyTouchListener(view: View, key: Int) {
    view.setOnTouchListener { _, motionEvent ->
      when (motionEvent.action) {
        MotionEvent.ACTION_DOWN or MotionEvent.ACTION_MOVE -> {
          webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, key))
        }
        MotionEvent.ACTION_UP -> actionUpAllTurnKeys()
      }
      false
    }
  }

  private fun setMoveKeyTouchListener(view: View, key: Int) {
    view.setOnTouchListener { _, motionEvent ->
      when (motionEvent.action) {
        MotionEvent.ACTION_DOWN or MotionEvent.ACTION_MOVE -> {
          webView.dispatchKeyEvent(KeyEvent(ACTION_DOWN, key))
        }
        MotionEvent.ACTION_UP -> actionUpAllMoveKeys()
      }
      false
    }
  }

  /** invokes action up all keys related to turn the plane. */
  private fun actionUpAllTurnKeys() {
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_UP))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_LEFT))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_RIGHT))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_DPAD_DOWN))
  }

  /** invokes action up all keys related to move the plane. */
  private fun actionUpAllMoveKeys() {
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_Q))
    webView.dispatchKeyEvent(KeyEvent(ACTION_UP, KEYCODE_E))
  }

  /** destroys all disposables. */
  override fun onDestroy() {
    this.compositeDisposable.dispose()
    super.onDestroy()
  }
}
