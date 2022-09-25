package com.example.scrabbleprototype.model

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.LayoutRes
import com.example.scrabbleprototype.R
import java.text.SimpleDateFormat
import java.util.*

class ChatAdapter(context: Context, @LayoutRes private val layoutResource: Int, private val messages: List<Message>):
    ArrayAdapter<Message>(context, layoutResource, messages) {

    private var _messages: List<Message> = messages

    override fun getCount(): Int {
        return _messages.size
    }

    override fun getItem(position: Int): Message? {
        return _messages[position]
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        return createViewFromResource(position, convertView, parent)
    }

    override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup?): View {
        return createViewFromResource(position, convertView, parent)
    }

    private fun createViewFromResource(position: Int, convertView: View?, parent: ViewGroup?): View {

        val view: LinearLayout = if(convertView == null) {
            convertView as LinearLayout? ?: LayoutInflater.from(context).inflate(layoutResource, parent, false) as LinearLayout
        } else convertView as LinearLayout

        val messageUser = view.findViewById<TextView>(R.id.message_user)
        val messageTime = view.findViewById<TextView>(R.id.message_time)
        val message = view.findViewById<TextView>(R.id.message)

        messageUser.text = _messages[position].messageUser
        val timestampFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        messageTime.text = timestampFormat.format(_messages[position].messageTime)
        message.text = _messages[position].message

        return view
    }
}