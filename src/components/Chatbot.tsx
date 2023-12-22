// src/components/Chatbot.tsx

import React, { useState, useEffect, useRef } from "react";
import { askGPT4 } from "../services/OpenAIService";
import "./Chatbot.css"; // Import your CSS for styling
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";

const messagesStored = JSON.parse(localStorage.getItem("chatbot-history") || "[]");

const Chatbot: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>(
    [...messagesStored]
  );

  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat window when chat history updates
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
    localStorage.setItem("chatbot-history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;
    
    // Add user message to chat history
    const newHistory = [...chatHistory, { role: "user", content: inputText }];
    setChatHistory(newHistory);

    // Call OpenAI API
    const messages = newHistory.map((message) => {
      const { role, content } = message;
      return { role: role.toLowerCase(), content };
    })
    const response = await askGPT4(messages);

    // Add AI response to chat history
    if (typeof response === "string") {
      setChatHistory(prevChatHistory => [
        ...prevChatHistory,
        { role: "assistant", content: response },
      ]);
    }

    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {process.env.REACT_APP_OPENAI_API_KEY ? (
        <>
          <div className="chat-window" ref={chatWindowRef}>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`${message.role}-message message`}
              >
                <b>{message.role}:</b>
                <Markdown remarkPlugins={[gfm]} children={message.content} />
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Message chatbot..."
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("chatbot-history"); 
              window.location.reload();
            }} 
            className="clear-button"
          >
            Clear History
          </button>
        </>
      ) : (
        <div>No API key provided. Please reload.</div>
      )}
    </div>
  );
};

export default Chatbot;
