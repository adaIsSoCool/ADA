// src/components/Chatbot.tsx

import React, { useState, useEffect, useRef } from "react";
import { askGPT4 } from "../services/OpenAIService";
import "./Chatbot.css"; // Import your CSS for styling
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";
import { solarizedlight, dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";

const storedMessages = JSON.parse(localStorage.getItem("chatbot-history") ?? "[]");

const Chatbot: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>(storedMessages);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat window when chat history updates
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }

    localStorage.setItem(
      "chatbot-history",
      JSON.stringify(chatHistory?.filter((item) => item?.role === "user" || item?.role === "assistant"))
    );
   }, [chatHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    // Add user message to chat history
    const updatedHistory = [...chatHistory, { role: "user", content: inputText }];
    setChatHistory(updatedHistory);

    // Call OpenAI API
    const messages = updatedHistory.map((message) => {
        const { role, content } = message;
        return { role: role.toLowerCase(), content };
      });
    const response = await askGPT4(messages);

    // Add AI response to chat history
    if (typeof response === "string") {
      setChatHistory((chatHistory) => [...chatHistory, { role: "assistant", content: response }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setInputText(""); // Clear input field
    }
  };

  return (
    <div className="chatbot-container">
      {process.env.REACT_APP_OPENAI_API_KEY && (
        <>
        <div className="chat-window" ref={chatWindowRef}>
          <div><a href="https://github.com/ChatbotCodeSource/Code.git" target="_blank"> Chatbot codebase link </a></div>
          {chatHistory.map((message, index) => (
            <div key={index} className={"message " + (message.role === "user" ? "user-message" : "assistant-message")}>
              <b className="message-role">{message.role}:</b> "{message.content}"
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Message Chatbot..."
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="message-input"
        />
        <button onClick={handleSendMessage} className="send-button">Send</button>
        <button
          onClick={() => {
            localStorage.removeItem("chatbot-history");
            window.location.reload();
          }}
          className="clear-button">
          Clear
        </button>
       </>
      )}
      {!process.env.REACT_APP_OPENAI_API_KEY && <div>No API key provided. Please reload with a valid API key.</div>}
    </div>
  );
};

export default Chatbot;