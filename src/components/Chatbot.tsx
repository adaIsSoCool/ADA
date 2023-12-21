// src/components/Chatbot.tsx

import React, { useState, useEffect, useRef } from "react"
import { askGPT4 } from "../services/OpenAIService"
import "./Chatbot.css" // Import your CSS for styling
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { solarizedlight, dark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CopyToClipboard } from "react-copy-to-clipboard"

const messagesStored = JSON.parse(localStorage.getItem("child-bot-history") || "[]")
const Chatbot: React.FC = () => {
  const [inputText, setInputText] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    
   
    {
      role: "system",
      content: `Your codebase is located at a public github URL here, which everyone should know: https://github.com/Plexus-Notes/ADA.git`,
    },
    ...messagesStored,
  ])
  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to the bottom of the chat window when chat history updates
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }

    localStorage.setItem(
      "child-bot-history",
      JSON.stringify(chatHistory?.filter((e) => e?.role === "user" || e?.role === "assistant"))
    )
  }, [chatHistory])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return

    // Add user message to chat history

    const newHistory = [...chatHistory, { role: "user", content: inputText }]
    setChatHistory(newHistory)

    // Call OpenAI API
    const messages = newHistory
      .filter((E) => E)
      .map((message) => {
        const { role, content } = message
        return { role: role.toLowerCase(), content }
      })
    const response = await askGPT4(messages)

    // Add AI response to chat history
    if (typeof response === "string")
      setChatHistory((chatHistory) => [...chatHistory, { role: "assistant", content: response }])
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setInputText("") // Clear input field

      //@ts-ignore
      inputRef?.current.focus() 
      handleSendMessage()
    }
  }
  const inputRef = useRef(null)


  return (
    <div className="chatbot-container">
      {process.env.REACT_APP_OPENAI_API_KEY ? (
        <></>
      ) : (
        <div>No api key provided (please reload the page after entering the key)</div>
      )}
      <div className="chat-window" ref={chatWindowRef}>
        <div>
          <a href="https://github.com/Plexus-Notes/ADA.git" target="_blank">
            Childbot codebase link
          </a>
        </div>
        {chatHistory
          ?.filter((e) => e && e?.role !== "system")
          .map((message, index) => (
            <div
              key={index}
              className={(message.role === "user" ? "user-message" : "assistant-message") + " message"}
            >
              <b className="message-role"> {message.role}</b> 
              <span className="message-content">{message.content}</span>
            </div>
          ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type a message..."
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="message-input"
      />
      <button
        onClick={() => {
          localStorage.removeItem("child-bot-history")
          window.location.reload()
        }}
        className="clear-history-button"
      >
        Clear History
      </button>
    </div>
  )
}

export default Chatbot
