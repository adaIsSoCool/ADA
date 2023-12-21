// src/components/Chatbot.tsx

import React, { useState, useEffect, useRef } from "react";
import { askGPT4 } from "../services/OpenAIService";
import "./Chatbot.css"; // Import your CSS for styling
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight, dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import gfm from "remark-gfm";

// Retrieve messages from local storage
const messagesStored = JSON.parse(localStorage.getItem("chatbot-history") ?? "[]");

const Chatbot: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    {
      role: "system",
      content: "You are a chatbot...",
    },
    {
      role: "system",
      content: "Your codebase is located at a public github URL here...",
    },   
    ...messagesStored,
  ]);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat window when chat history updates
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }

    localStorage.setItem(
      "chatbot-history",
      JSON.stringify(chatHistory?.filter((e) => e?.role === "user" || e?.role === "assistant"))
    );
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
    const messages = newHistory
      .filter((E) => E)
      .map((message) => {
        const { role, content } = message;
        return { role: role.toLowerCase(), content };
      });
    const response = await askGPT4(messages);

    // Add AI response to chat history
    if (typeof response === "string")
      setChatHistory((chatHistory) => [...chatHistory, { role: "assistant", content: response }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setInputText(""); // Clear input field
      handleSendMessage();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const Pre = ({ children }: any) => (
    <pre className="blog-pre">
      <CodeCopyBtn>{children}</CodeCopyBtn>
      {children}
    </pre>
  );

  return (
    <div className="chatbot-container">
      {process.env.REACT_APP_OPENAI_API_KEY ? (
        <></>
      ) : (
        <div>No api key provided</div>
      )}
      
      <div className="chat-window" ref={chatWindowRef}>
        <a href="https://github.com/Plexus-Notes/ADA.git" target="_blank">
          chatbot codebase link
        </a>
        {chatHistory
          ?.filter((e) => e && e?.role !== "system")
          .map((message, index) => (
            <div key={index} className={(message.role === "user" ? "user-message" : "ai-message") + " message"}>
              <b className="message-role"> {message.role.toUpperCase()}</b>
              <Markdown components={{ pre: Pre }} remarkPlugins={[gfm]}>{message.content}</Markdown>
            </div>
          ))}
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Type your message..."
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="message-input"
      />

      <button onClick={handleSendMessage} className="send-button">
        Send
      </button>

      <button onClick={() => {
          localStorage.removeItem("chatbot-history");
          window.location.reload();
        }}
        className="clear-button"
      >
        Clear
      </button>

    </div>
  );
};

export default Chatbot;

export function CodeCopyBtn({ children }: any) {
  const [copyOk, setCopyOk] = React.useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(children);
    setCopyOk(true);
    setTimeout(() => { setCopyOk(false); }, 1000);
  };

  return (
    <div className="code-copy-btn">
      <i
        className={`fas ${copyOk ? 'fa-check-square' : 'fa-copy'}`}
        onClick={handleClick}
        style={{ color: copyOk ? 'green' : '#ccc' }}
      />
    </div>
  );
}