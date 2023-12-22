// src/components/Chatbot.tsx

import React, { useState, useEffect, useRef } from "react"
import { askGPT4 } from "../services/OpenAIService"
import "./Chatbot.css" // Import CSS for styling
import Markdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import gfm from "remark-gfm"
import { solarizedlight, dark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CopyToClipboard } from "react-copy-to-clipboard"

const messagesStored = JSON.parse(localStorage.getItem("child-bot-history") ?? "[]")
const Chatbot: React.FC = () => {
  const [inputText, setInputText] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    {
      role: "system",
      content: `You are Childbot, a chatbot communicating with a human, a capable but novice programmer.`,
    },
    {
      role: "system",
      content: `Your codebase is located at a public github URL here: https://github.com/Plexus-Notes/ADA.git`,
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

    const newHistory = [...chatHistory, { role: "user", content: inputText }]
    setChatHistory(newHistory)

    const messages = newHistory.map((message) => {
      const { role, content } = message
      return { role: role.toLowerCase(), content }
    })
    
    const response = await askGPT4(messages)

    if (typeof response === "string") {
      setChatHistory((chatHistory) => [...chatHistory, { role: "assistant", content: response }])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setInputText("")
      handleSendMessage()
    }
  }
  const inputRef = useRef(null)

  const Pre = ({ children }: any) => (
    <pre className="blog-pre">
      <CodeCopyBtn>{children}</CodeCopyBtn>
      {children}
    </pre>
  )

  return (
    <div className="chatbot-container">
      {process.env.REACT_APP_OPENAI_API_KEY ? (
        <></>
      ) : (
        <div>No api key provided (reload to provide)</div>
      )}
      
      <div className="chat-window" ref={chatWindowRef}>
        <div>
          <a href="https://github.com/Plexus-Notes/ADA.git" target="_blank" rel="noopener noreferrer">
            Codebase Link
          </a>
        </div>

        {chatHistory.map((message, index) => (
            <div key={index} className={(message.role === "user" ? "user-message" : "ai-message") + " message"}>
              <b>{message.role}</b> 
              <Markdown
                components={{
                  pre: Pre,
                  code(props) {
                    const { children, className, ...rest } = props
                    const match = /language-(\w+)/.exec(className || "")
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        children={String(children).replace(/\n$/, "")}
                        language={match[1]}
                        style={dark}
                        wrapLongLines={true}
                      />
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    )
                  },
                }}
                remarkPlugins={[gfm]}
              >
                {message.content}
              </Markdown>
            </div>
          ))}
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Message Childbot..."
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
        className="clear-button"
      >
        Clear Chat History
      </button>
    </div>
  )
}

export default Chatbot

export function CodeCopyBtn({ children }: any) {
  const [copyOk, setCopyOk] = React.useState(false)
  const iconColor = copyOk ? "#0af20a" : "#ddd"
  const icon = copyOk ? "fa-check-square" : "fa-copy"
  const handleClick = (e: any) => {
    navigator.clipboard.writeText(children[0].props.children[0])
    setCopyOk(true)
    setTimeout(() => {
      setCopyOk(false)
    }, 500)
  }

  return (
    <div className="code-copy-btn">
      <i className={`fas ${icon}`} onClick={handleClick} style={{ color: iconColor }} />
    </div>
  )
}