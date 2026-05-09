"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Figma,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (reset) {
        ta.style.height = `${minHeight}px`;
        return;
      }
      ta.style.height = `${minHeight}px`;
      const newHeight = Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Infinity));
      ta.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const onResize = () => adjustHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          ref={ref}
          className={cn(
            "flex w-full rounded-md bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0"
            style={{ boxShadow: "0 0 0 2px rgba(255,45,45,0.30)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export function AnimatedAIChat({ compact = false, onSubmit }: { compact?: boolean; onSubmit?: () => void } = {}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const commandSuggestions: CommandSuggestion[] = [
    { icon: <ImageIcon className="w-4 h-4" />, label: "Clone UI", description: "Generate a UI from a screenshot", prefix: "/clone" },
    { icon: <Figma className="w-4 h-4" />, label: "Import Figma", description: "Import a design from Figma", prefix: "/figma" },
    { icon: <MonitorIcon className="w-4 h-4" />, label: "Create Page", description: "Generate a new web page", prefix: "/page" },
    { icon: <Sparkles className="w-4 h-4" />, label: "Improve", description: "Improve existing UI design", prefix: "/improve" },
  ];

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const idx = commandSuggestions.findIndex((c) => c.prefix.startsWith(value));
      setActiveSuggestion(idx);
    } else {
      setShowCommandPalette(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!inputFocused) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        raf = 0;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inputFocused]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector("[data-command-button]");
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSendMessage = () => {
    if (!value.trim()) return;
    const userText = value.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    onSubmit?.();
    startTransition(() => {
      setIsTyping(true);
      setValue("");
      adjustHeight(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((m) => [...m, { role: "ai", text: "Thanks! I'll get back to you on that." }]);
      }, 2200);
    });
  };

  const selectCommandSuggestion = (index: number) => {
    const c = commandSuggestions[index];
    setValue(c.prefix + " ");
    setShowCommandPalette(false);
    setRecentCommand(c.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((p) => (p < commandSuggestions.length - 1 ? p + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((p) => (p > 0 ? p - 1 : commandSuggestions.length - 1));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) selectCommandSuggestion(activeSuggestion);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isTyping) return;
      handleSendMessage();
    }
  };

  const handleAttachFile = () => {
    const mock = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((p) => [...p, mock]);
  };

  const removeAttachment = (i: number) => setAttachments((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className={cn("flex flex-col w-full bg-transparent text-foreground relative overflow-hidden", compact ? "h-full p-3" : "min-h-full items-center justify-center p-6")}>
      {!compact && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full filter blur-[128px] animate-pulse" style={{ background: "rgba(255,45,45,0.10)" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full filter blur-[128px] animate-pulse delay-700" style={{ background: "rgba(184,0,0,0.10)" }} />
          <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full filter blur-[96px] animate-pulse delay-1000" style={{ background: "rgba(60,255,122,0.06)" }} />
        </div>
      )}

      {compact && (
        <div className="flex-1 min-h-0 overflow-y-auto w-full pr-1 mb-2 space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                layout
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.6 }}
              >
                <div
                  className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm")}
                  style={
                    m.role === "user"
                      ? { background: "rgba(255,45,45,0.18)", color: "#fff", border: "1px solid rgba(255,45,45,0.35)", boxShadow: "0 4px 18px rgba(255,45,45,0.18)" }
                      : { background: "rgba(255,255,255,0.04)", color: "#d8d8dc", border: "1px solid #2A2A2A" }
                  }
                >
                  {m.role === "ai" ? (
                    <span className="inline-block">
                      {m.text.split(" ").map((w, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.025, duration: 0.25, ease: "easeOut" }}
                          className="inline-block mr-1"
                        >
                          {w}
                        </motion.span>
                      ))}
                    </span>
                  ) : (
                    m.text
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                key="typing"
                layout
                className="flex justify-start"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.94, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              >
                <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2A2A2A" }}>
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className={cn("w-full mx-auto relative", compact ? "max-w-full" : "max-w-2xl")}>
        <motion.div
          className={cn("relative z-10", compact ? "space-y-2" : "space-y-12")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {!compact && (
          <div className="text-center space-y-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="inline-block">
              <h1 className="font-display text-3xl font-medium tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgba(216,216,220,0.95), rgba(255,45,45,0.85))" }}>
                How can I help today?
              </h1>
              <motion.div
                className="h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,45,0.45), transparent)" }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
            <motion.p className="text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Type a command or ask a question
            </motion.p>
          </div>
          )}

          <motion.div
            className="relative backdrop-blur-2xl rounded-2xl border shadow-2xl"
            style={{ background: "rgba(17,17,19,0.65)", borderColor: "#2A2A2A" }}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div
                  ref={commandPaletteRef}
                  className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl rounded-lg z-50 shadow-lg border overflow-hidden"
                  style={{ background: "rgba(8,8,8,0.95)", borderColor: "#2A2A2A" }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="py-1">
                    {commandSuggestions.map((s, index) => (
                      <motion.div
                        key={s.prefix}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                          activeSuggestion === index
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        style={activeSuggestion === index ? { background: "rgba(255,45,45,0.10)" } : undefined}
                        onClick={() => selectCommandSuggestion(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className="w-5 h-5 flex items-center justify-center text-primary">{s.icon}</div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-weak text-xs ml-1">{s.prefix}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask the startup runtime a question..."
                containerClassName="w-full"
                className={cn(
                  "w-full px-4 py-3 resize-none bg-transparent border-none text-foreground text-sm",
                  "focus:outline-none placeholder:text-weak min-h-[60px]",
                )}
                style={{ overflow: "hidden" }}
                showRing={false}
              />
            </div>

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  className="px-4 pb-3 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg text-muted-foreground"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <span>{file}</span>
                      <button onClick={() => removeAttachment(index)} className="text-weak hover:text-foreground transition-colors">
                        <XIcon className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 border-t flex items-center justify-between gap-4" style={{ borderColor: "#2A2A2A" }}>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={handleAttachFile}
                  whileTap={{ scale: 0.94 }}
                  className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors relative group"
                >
                  <Paperclip className="w-4 h-4" />
                </motion.button>
                <motion.button
                  type="button"
                  data-command-button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommandPalette((p) => !p);
                  }}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "p-2 rounded-lg transition-colors relative group",
                    showCommandPalette ? "text-primary" : "text-muted-foreground hover:text-primary",
                  )}
                  style={showCommandPalette ? { background: "rgba(255,45,45,0.10)" } : undefined}
                >
                  <Command className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                type="button"
                onClick={handleSendMessage}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isTyping || !value.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed",
                )}
                style={
                  value.trim()
                    ? { background: "#FF2D2D", color: "#fff", boxShadow: "0 0 24px rgba(255,45,45,0.35)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#5C5C63" }
                }
              >
                {isTyping ? <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" /> : <SendIcon className="w-4 h-4" />}
                <span>Send</span>
              </motion.button>
            </div>
          </motion.div>

        </motion.div>
      </div>

      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-2xl rounded-full px-4 py-2 shadow-lg border"
            style={{ background: "rgba(17,17,19,0.75)", borderColor: "#2A2A2A" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,45,45,0.15)" }}>
                <span className="text-xs font-semibold text-primary">AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Thinking</span>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inputFocused && (
        <motion.div
          className="fixed w-[40rem] h-[40rem] rounded-full pointer-events-none z-0 opacity-[0.05] blur-[96px]"
          style={{ background: "radial-gradient(circle, #FF2D2D, transparent 60%)" }}
          animate={{ x: mousePosition.x - 320, y: mousePosition.y - 320 }}
          transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 rounded-full mx-0.5"
          style={{ background: "#FF2D2D", boxShadow: "0 0 4px rgba(255,45,45,0.5)" }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
