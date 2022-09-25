package com.example.scrabbleprototype.activities

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.*
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.model.ChatAdapter
import com.example.scrabbleprototype.model.Message
import com.example.scrabbleprototype.model.SocketHandler
import com.example.scrabbleprototype.model.Users
import com.google.android.material.snackbar.BaseTransientBottomBar
import com.google.android.material.snackbar.Snackbar
import io.socket.client.Socket

class ChatActivity : AppCompatActivity() {

    val messages = mutableListOf<Message>()
    val currentUser = Users.currentUser
    lateinit var chatSocket: Socket

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        val returnButton = findViewById<TextView>(R.id.return_button)
        returnButton.setOnClickListener {
            startActivity(Intent(this@ChatActivity, ConnectionActivity::class.java))
        }

        findViewById<LinearLayout>(R.id.chat_layout).setOnTouchListener { v, event ->
            when (event?.action) {
                MotionEvent.ACTION_DOWN -> {
                    hideKeyboard()
                }
            }
            v?.onTouchEvent(event) ?: true
        }

        SocketHandler.setSocket()
        SocketHandler.establishConnection()
        chatSocket = SocketHandler.getSocket()
        setupChatBox()

        chatSocket.on("receiveRoomMessage"){ message->
            addMessage(message[0] as String)
        }
    }

    private fun setupChatBox() {
        val messagesList = findViewById<ListView>(R.id.chat_box)
        val chatAdapter = ChatAdapter(this, R.layout.chat_message_style, messages)
        messagesList.adapter = chatAdapter
        messagesList.transcriptMode = AbsListView.TRANSCRIPT_MODE_ALWAYS_SCROLL

        val sendButton = findViewById<ImageButton>(R.id.send_button)
        sendButton.setOnClickListener{
            sendMessage()
        }
        val messageInput = findViewById<EditText>(R.id.message_input)
        messageInput.setOnKeyListener(View.OnKeyListener {v, keyCode, event ->
            if(keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage()
                return@OnKeyListener true
            }
            false
        })
    }

    private fun sendMessage() {
        val messageInput = findViewById<EditText>(R.id.message_input)
        val message = Message(messageInput.text.toString(), currentUser)

        if(validateMessage(messageInput.text.toString())) {
            chatSocket.emit("sendRoomMessage", message.message)
            addMessage(message.message)
            messageInput.setText("")
        } else messageInput.error = "Le message ne peut pas être vide"
    }

    private fun validateMessage(message: String): Boolean {
        return message.isNotBlank()
    }

    private fun addMessage(message: String) {
        val messagesList = findViewById<ListView>(R.id.chat_box)
        Log.d("times", "timmemmms" );
        messages.add( Message(message, "etienne"))
        // Scroll to bottom if last message received is visible
        if(messagesList.lastVisiblePosition + 1 == messagesList.adapter.count - 1) messagesList.setSelection(messagesList.adapter.count - 1)
        // Else send notif of new message and don't scroll down since the use is looking through old messages
        else {
            val newMessageNotif = Snackbar.make(findViewById(android.R.id.content), "Nouveau Message!", BaseTransientBottomBar.LENGTH_LONG)
            newMessageNotif.show()
        }
    }

    private fun hideKeyboard() {
        val imm = this.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(this.currentFocus!!.windowToken, 0)
    }
}
