import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Send,
  ImagePlus,
  ChefHat,
  RefreshCcw,
  Loader2,
  XCircle,
  Globe,
  User
} from "lucide-react";
import RecipeCard from "./components/RecipeCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TRANSLATIONS = {
  en: {
    appTitle: "AI Chef",
    welcomeMessage: "Welcome to the kitchen! 👨‍🍳 Tell me what ingredients you have, or upload a picture of your fridge, and let's get cooking!",
    resetBtn: "Reset Kitchen",
    inputPlaceholder: "Type your ingredients or answer the Chef...",
    sendBtn: "Send",
    thinking: "Chef is thinking...",
    serverError: "Sorry, the kitchen is currently closed due to a server error.",
    bonAppetit: "Bon Appétit! Here is your recipe:"
  },
  ar: {
    appTitle: "الشيف الذكي",
    welcomeMessage: "أهلاً بك في المطبخ! 👨‍🍳 أخبرني بالمكونات التي لديك، أو ارفع صورة لثلاجتك، ودعنا نطبخ!",
    resetBtn: "تفريغ المطبخ",
    inputPlaceholder: "اكتب مكوناتك أو أجب الشيف...",
    sendBtn: "إرسال",
    thinking: "الشيف يفكر...",
    serverError: "عذراً، المطبخ مغلق حالياً بسبب مشكلة في الخادم.",
    bonAppetit: "بالهناء والشفاء! إليك وصفتك:"
  }
};

export default function App() {
  const [lang, setLang] = useState("ar"); // Default to Arabic
  const t = TRANSLATIONS[lang];

  const [messages, setMessages] = useState([
    {
      role: "chef",
      type: "chat",
      data: TRANSLATIONS["ar"].welcomeMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    // Keep history, but translate the welcome message if it's the first message
    setMessages((prev) => {
      const newMessages = [...prev];
      if (
        newMessages.length > 0 &&
        (newMessages[0].data === TRANSLATIONS["ar"].welcomeMessage ||
          newMessages[0].data === TRANSLATIONS["en"].welcomeMessage)
      ) {
        newMessages[0].data = TRANSLATIONS[newLang].welcomeMessage;
      }
      return newMessages;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const newUserMsg = { role: "user", text: input, image: imagePreview };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      let base64String = null;
      if (selectedImage) {
        base64String = await convertToBase64(selectedImage);
      }

      const sentText = input;
      setInput("");
      clearImageSelection();

      const response = await axios.post(`${API_URL}/chef/chat`, {
        message: sentText,
        image_base64: base64String,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "chef",
          type: response.data.type,
          data: response.data.data,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "chef",
          type: "chat",
          data: t.serverError,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = async () => {
    await axios.post(`${API_URL}/chef/reset`);
    setMessages([
      {
        role: "chef",
        type: "chat",
        data: t.welcomeMessage,
      },
    ]);
  };

  const isRtl = lang === "ar";

  return (
    <div 
      dir={isRtl ? "rtl" : "ltr"} 
      className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-[#1a1c29] to-gray-900 text-gray-100 font-sans selection:bg-accent selection:text-black transition-colors duration-500"
    >
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 p-3 md:p-4 flex flex-wrap justify-between items-center shadow-lg sticky top-0 z-10 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-accent text-black p-1.5 sm:p-2 rounded-full shadow-lg shadow-accent/20">
            <ChefHat size={24} className="sm:w-6 sm:h-6 w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-yellow-200">
            {t.appTitle}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-700/50 hover:bg-gray-600 border border-gray-600 transition-all active:scale-95"
          >
            <Globe size={16} className="text-accent" />
            <span className="text-sm font-medium">{lang === "ar" ? "English" : "عربي"}</span>
          </button>

          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <RefreshCcw size={16} className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">{t.resetBtn}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 sm:space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
          <div
            key={index}
            className={`flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${isUser ? "" : "bg-gray-800/40 rounded-3xl"}`}
          >
            <div className="max-w-4xl mx-auto w-full flex gap-3 sm:gap-5 p-4 sm:p-6">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${isUser ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-accent/10 border-accent/30 text-accent"}`}>
                {isUser ? <User size={20} className="sm:w-6 sm:h-6" /> : <ChefHat size={20} className="sm:w-6 sm:h-6" />}
              </div>

              <div className="flex-1 pt-1">
                {isUser && (
                  <div>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Upload"
                        className="max-w-sm w-full rounded-2xl mb-4 object-cover shadow-lg border border-gray-700/50"
                      />
                    )}
                    <p className="text-gray-100 text-[15px] sm:text-base leading-relaxed">{msg.text}</p>
                  </div>
                )}

                {!isUser && msg.type === "chat" && (
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-[15px] sm:text-base">
                    {msg.data.replace(/\*/g, '')}
                  </p>
                )}

                {!isUser && msg.type === "recipes" && (
                  <div className="w-full">
                    <p className="text-accent mb-4 font-semibold flex items-center gap-2 text-lg">
                      <ChefHat size={20} /> {t.bonAppetit}
                    </p>
                    {msg.data.map((recipe, idx) => (
                      <RecipeCard key={idx} recipe={recipe} lang={lang} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )})}

        {isLoading && (
          <div className="flex gap-4 text-gray-400 animate-in fade-in">
            <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center animate-pulse border border-gray-700 text-accent">
              <ChefHat size={22} />
            </div>
            <p className="mt-3 flex items-center gap-2 font-medium">
              <Loader2 size={18} className="animate-spin text-accent" /> {t.thinking}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-gray-800/80 backdrop-blur-md p-4 md:p-6 border-t border-gray-700/50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)]">
        {imagePreview && (
          <div className="mb-4 relative inline-block animate-in zoom-in-95 duration-200">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-xl border-2 border-accent shadow-lg"
            />
            <button
              onClick={clearImageSelection}
              className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3 max-w-5xl mx-auto items-end sm:items-center">
          <label className="cursor-pointer bg-gray-700/50 hover:bg-gray-600 transition-all p-3 sm:p-4 text-accent rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-600 hover:border-accent group flex-shrink-0 h-12 sm:h-14">
            <ImagePlus size={22} className="group-hover:scale-110 transition-transform sm:w-6 sm:h-6" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="flex-1 bg-gray-700/50 text-white rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-gray-700 transition-all border border-transparent focus:border-accent/30 placeholder-gray-400 text-sm sm:text-base h-12 sm:h-14"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-accent to-yellow-400 text-black font-bold p-3 sm:px-8 rounded-xl sm:rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0 h-12 sm:h-14"
          >
            <Send size={18} className={`${isRtl ? "sm:ml-2" : "sm:mr-2"} sm:w-5 sm:h-5`} /> <span className="hidden sm:inline">{t.sendBtn}</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
