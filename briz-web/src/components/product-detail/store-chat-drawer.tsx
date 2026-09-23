"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Send, BadgeCheck, ShieldAlert } from "lucide-react";
import { DetailedProduct, formatPriceNPR } from "@/data/product-detail-data";

interface StoreChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: DetailedProduct;
}

interface Message {
  id: string;
  sender: "customer" | "seller";
  text: string;
  time: string;
}

export function StoreChatDrawer({
  isOpen,
  onClose,
  product,
}: StoreChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "seller",
      text: `Hello! Thanks for your interest in ${product.name}. We're open today in ${product.seller.address}. How can we help you?`,
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "customer",
      text: inputText.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate merchant reply for interactive prototype
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "seller",
          text: `Thank you for asking! Yes, this bottle is available in midnight blue at our ${product.seller.name} counter. We also offer same-day courier dispatch across Kathmandu Valley.`,
          time: "Just now",
        },
      ]);
    }, 1000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-chat-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#ebebeb] bg-slate-50">
              {product.seller.logo ? (
                <Image
                  src={product.seller.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-slate-700">
                  {product.seller.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h2 id="store-chat-title" className="text-sm font-bold text-[#202020]">
                  {product.seller.name}
                </h2>
                {product.seller.verified && (
                  <BadgeCheck className="h-4 w-4 fill-[#3e63dd] text-white" />
                )}
              </div>
              <span className="text-xs text-slate-400">Merchant · {product.seller.address}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close message panel"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#202020] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prototype Notice Banner */}
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 border-b border-amber-100 text-xs text-amber-800">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <span>Demo conversation. Messages are stored locally for preview.</span>
        </div>

        {/* Attached Product Context Card */}
        <div className="border-b border-[#ebebeb] bg-slate-50/80 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
            Attached Product
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-3 rounded-xl border border-[#ebebeb] bg-white p-2.5 shadow-xs transition hover:border-[#3e63dd]"
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50">
              <Image
                src={product.images[0] || "/products/bottle-main.svg"}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#202020] truncate">
                {product.name}
              </span>
              <span className="text-xs font-extrabold text-[#3e63dd]">
                {formatPriceNPR(product.currentPrice)}
              </span>
            </div>
          </Link>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg) => {
            const isCustomer = msg.sender === "customer";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  isCustomer ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isCustomer
                      ? "bg-[#3e63dd] text-white rounded-br-xs"
                      : "bg-slate-100 text-[#202020] rounded-bl-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border-t border-[#ebebeb] p-3 bg-white"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to the store..."
            className="flex-1 rounded-xl border border-[#ebebeb] bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-[#202020] focus:border-[#3e63dd] focus:bg-white focus:outline-none"
            aria-label="Message text"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3e63dd] text-white transition hover:bg-[#3354c7] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

