package com.example.scrabbleprototype.activities

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet.Constraint
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.Users

class ConnectionActivity : AppCompatActivity() {
    val users = Users

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_connection)

        val connectionButton = findViewById<Button>(R.id.connection_button)
        connectionButton.setOnClickListener {
            onConnection()
        }

        findViewById<ConstraintLayout>(R.id.connection_layout).setOnTouchListener { v, event ->
            when (event?.action) {
                MotionEvent.ACTION_DOWN -> {
                    hideKeyboard()
                }
            }
            v?.onTouchEvent(event) ?: true
        }
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }

    fun onConnection() {
        val username = findViewById<EditText>(R.id.username)
        val serverIp = findViewById<EditText>(R.id.server_ip)
        //validate username and ip
        users.currentUser = username.text.toString()
        val intent = Intent(this, ChatActivity::class.java)
        startActivity(intent)
    }
}
