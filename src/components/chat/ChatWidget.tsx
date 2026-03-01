import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Minus, Send, Building2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useChatWidget } from "@/contexts/ChatWidgetContext";
import { useMessages, useSendMessage, useUnreadCount } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ChatWidget = () => {
  const { user } = useAuth();
  const { isOpen, isMinimized, threadId, target, toggleWidget, closeWidget, minimizeWidget } = useChatWidget();
  const { data: messages = [], isLoading } = useMessages(threadId);
  const sendMessage = useSendMessage();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  if (!user) return null;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !threadId) return;
    sendMessage.mutate({ threadId, text: trimmed });
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const showBubble = !isOpen && (isMinimized || threadId);

  return (
    <div className="fixed bottom-4 start-4 z-50 flex flex-col items-start gap-2" dir="rtl">
      {/* Floating bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleWidget}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && threadId && target && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl"
            style={{ height: "420px" }}
          >
            {/* Header with identity */}
            <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={target.avatarUrl || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {(target.fullName || "؟").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-foreground">{target.fullName}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {target.availableForWork ? "متاح للعمل" : "متصل الآن"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={minimizeWidget}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={closeWidget}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <span className="text-3xl">👋</span>
                  <p className="text-sm font-medium text-muted-foreground">ابدأ المحادثة</p>
                  <p className="text-xs text-muted-foreground">اكتب رسالتك وخلّنا نبدأ</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                        isMine ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md bg-secondary text-foreground"
                      )}>
                        <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                        <div className={cn("mt-1 flex items-center gap-1 text-[10px]", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          <span>{new Date(msg.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                          {isMine && <span>{msg.is_read ? "✓✓" : "✓"}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t bg-card p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ maxHeight: "80px" }}
                />
                <Button size="icon" className="h-9 w-9 shrink-0 rounded-xl" disabled={!text.trim() || sendMessage.isPending} onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
