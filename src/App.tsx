import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { ArrowUp, Square } from "lucide-react";
import "./App.css";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  systemPrompt: string;
}

function App() {
  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("conversations");
    if (saved) {
      const parsed: Conversation[] = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) setSelectedId(parsed[0].id);
    } else {
      // Start with a default Chat 1 and a default system prompt for markdown
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        name: "Chat 1",
        messages: [],
        systemPrompt:
          "You are CrookDai, a helpful assistant. Always use markdown for formatting: use **bold** for important words, _italics_ for emphasis, and support code blocks, lists, and links. Respond in a friendly, concise manner.",
      };
      setConversations([newConv]);
      setSelectedId(newConv.id);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Rename Chat 1 to first prompt
  useEffect(() => {
    if (!selectedConv || selectedConv.name !== "Chat 1") return;
    const firstUserMsg = selectedConv.messages.find((m) => m.role === "user");
    if (firstUserMsg && firstUserMsg.content.trim()) {
      // Truncate to 24 chars, add ellipsis if needed
      let newName = firstUserMsg.content.trim();
      if (newName.length > 24) newName = newName.slice(0, 21) + "...";
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id ? { ...c, name: newName } : c
        )
      );
    }
  }, [selectedConv, selectedConv?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv) return;
    const userMessage: Message = { role: "user", content: input };
    // Add user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c
      )
    );
    setInput("");
    setIsLoading(true);
    try {
      const aiResponse = await getChatCompletion(
        [...(selectedConv.messages || []), userMessage],
        selectedConv.systemPrompt
      );
      // Add empty AI message to start typewriter effect
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, messages: [...c.messages, { role: "ai", content: "" }] }
            : c
        )
      );
      let i = 0;
      const typeLetter = () => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== selectedId) return c;
            const updated = [...c.messages];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "ai") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: aiResponse.slice(0, i + 1),
              };
            }
            return { ...c, messages: updated };
          })
        );
        if (i < aiResponse.length - 1) {
          i++;
          setTimeout(typeLetter, 18);
        } else {
          setIsLoading(false);
        }
      };
      typeLetter();
    } catch (error) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { role: "ai", content: "Sorry, I encountered an error." },
                ],
              }
            : c
        )
      );
      setIsLoading(false);
    }
  };

  // API call to backend
  async function getChatCompletion(
    messages: Message[],
    systemPrompt: string
  ): Promise<string> {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Error en la respuesta del backend");
      }

      return data.response;
    } catch (error) {
      console.error('Error calling backend:', error);
      throw error;
    }
  }

  // Sidebar actions
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      name: `Chat ${conversations.length + 1}`,
      messages: [],
      systemPrompt: "",
    };
    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) {
      // Select another conversation or none
      const remaining = conversations.filter((c) => c.id !== id);
      setSelectedId(remaining[0]?.id || null);
    }
  };

  // Simple markdown rendering function
  const renderMarkdown = (text: string) => {
    let content = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');
    return content;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h1>
            <button
              onClick={handleNewConversation}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              aria-label="New conversation"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 ${
                conv.id === selectedId
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="truncate flex-1 text-sm">{conv.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                aria-label="Delete conversation"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* System Prompt Header */}
        {selectedConv && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                System Prompt:
              </label>
              <input
                type="text"
                value={selectedConv.systemPrompt}
                onChange={(e) => {
                  const newPrompt = e.target.value;
                  setConversations(prev => prev.map(c =>
                    c.id === selectedConv.id ? { ...c, systemPrompt: newPrompt } : c
                  ));
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. You are a helpful assistant."
              />
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {!selectedConv || selectedConv.messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-medium mb-2">Start a conversation</h2>
                <p>Send a message to begin chatting with CrookDai</p>
              </div>
            ) : (
              selectedConv.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {/* AI Avatar */}
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      CD
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  }`}>
                    {msg.role === "ai" ? (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      U
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 min-w-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CrookDai or @mention an agent..."
                  disabled={isLoading || !selectedConv}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !selectedConv}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                aria-label={isLoading ? "Stop generation" : "Send message"}
              >
                {isLoading ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
