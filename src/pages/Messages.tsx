import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, ArrowRight, Search, CheckCheck, Check } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useThreads, useMessages, useSendMessage, ThreadWithDetails } from "@/hooks/useMessages";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeThreadId = searchParams.get("thread");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: threadsLoading } = useThreads();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(activeThreadId);
  const sendMessage = useSendMessage();

  const filteredThreads = threads.filter((t) =>
    !searchQuery || t.other_user?.full_name?.includes(searchQuery)
  );

  const activeThread = threads.find((t) => t.id === activeThreadId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !activeThreadId) return;
    sendMessage.mutate({ threadId: activeThreadId, text: messageText });
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="space-y-4 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/40" />
            <h1 className="text-xl font-bold">سجل دخول لعرض رسائلك</h1>
            <Button asChild className="rounded-xl">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Helmet>
        <title>الرسائل | كوادر</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="flex-1">
        <div className="container max-w-6xl py-6">
          <div className="grid h-[calc(100vh-180px)] min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[340px_1fr]">
            {/* Thread list */}
            <div className={`flex flex-col border-l ${activeThreadId ? "hidden md:flex" : "flex"}`}>
              <div className="border-b p-4">
                <h1 className="mb-3 text-lg font-bold">الرسائل</h1>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن محادثة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl pr-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {threadsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">لا توجد محادثات بعد</p>
                    <p className="text-xs text-muted-foreground">ابدأ محادثة من صفحة أي كادر</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <ThreadItem
                      key={thread.id}
                      thread={thread}
                      isActive={thread.id === activeThreadId}
                      onClick={() => setSearchParams({ thread: thread.id })}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex flex-col ${!activeThreadId ? "hidden md:flex" : "flex"}`}>
              {activeThread ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 border-b p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSearchParams({})}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Avatar name={activeThread.other_user?.full_name} url={activeThread.other_user?.avatar_url} />
                    <div className="flex-1">
                      <h2 className="font-bold text-foreground">{activeThread.other_user?.full_name || "مستخدم"}</h2>
                      {activeThread.other_user?.username && (
                        <Link to={`/talent/${activeThread.other_user.username}`} className="text-xs text-primary hover:underline">
                          عرض الملف
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">ابدأ المحادثة بإرسال رسالة</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} isMine={msg.sender_id === user.id} />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="اكتب رسالتك..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 rounded-xl"
                        maxLength={2000}
                      />
                      <Button
                        size="icon"
                        className="rounded-xl"
                        onClick={handleSend}
                        disabled={!messageText.trim() || sendMessage.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {sendMessage.isError && (
                      <p className="mt-2 text-xs text-destructive">
                        {(sendMessage.error as any)?.message?.includes("Rate limit")
                          ? "تم تجاوز الحد المسموح. انتظر قليلاً قبل إرسال رسائل أخرى."
                          : "حدث خطأ أثناء الإرسال. حاول مرة أخرى."}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/20" />
                  <h2 className="text-lg font-bold text-muted-foreground">اختر محادثة</h2>
                  <p className="text-sm text-muted-foreground">اختر محادثة من القائمة أو ابدأ واحدة جديدة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ── Sub-components ──

function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  const initials = (name || "؟").charAt(0);
  if (url) {
    return <img src={url} alt={name || ""} className="h-10 w-10 rounded-full border object-cover" />;
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {initials}
    </div>
  );
}

function ThreadItem({ thread, isActive, onClick }: { thread: ThreadWithDetails; isActive: boolean; onClick: () => void }) {
  const timeStr = new Date(thread.last_message_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-secondary/50 ${isActive ? "bg-primary/5 border-r-2 border-primary" : ""}`}
    >
      <Avatar name={thread.other_user?.full_name} url={thread.other_user?.avatar_url} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${thread.unread_count > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
            {thread.other_user?.full_name || "مستخدم"}
          </span>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeStr}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{thread.last_message || "لا رسائل بعد"}</p>
          {thread.unread_count > 0 && (
            <Badge className="h-5 min-w-5 rounded-full bg-primary px-1.5 text-[10px]">{thread.unread_count}</Badge>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message, isMine }: { message: any; isMine: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? "justify-start" : "justify-end"}`}
    >
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message_text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-start" : "justify-end"}`}>
          <span className={`text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{time}</span>
          {isMine && (
            message.is_read
              ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
              : <Check className="h-3 w-3 text-primary-foreground/60" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Messages;
