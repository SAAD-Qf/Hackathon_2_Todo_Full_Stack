"use client";
import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [genAI, setGenAI] = useState(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setGenAI(new GoogleGenerativeAI(storedApiKey));
    }
  }, []);

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setGenAI(new GoogleGenerativeAI(apiKey));
    alert("API Key saved!");
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !genAI) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      const botMessage = { text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Sorry, I encountered an error. Please check your API key and try again.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {!genAI ? (
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Enter your Gemini API Key</h2>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
            placeholder="Your API Key"
          />
          <button
            onClick={handleSaveApiKey}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Save API Key
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600"
                      : "bg-gray-700"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-800">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 p-2 rounded-l-md bg-gray-700 text-white"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-md"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
