package com.example.scrabbleprototype.model

import java.util.*

class Message(var message: String, var messageUser: String) {

    var messageTime: Long = Date().time
}