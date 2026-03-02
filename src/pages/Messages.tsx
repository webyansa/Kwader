import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { MessageSquare, Send, ArrowRight, Search, CheckCheck, Check, Building2 } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useThreads, useMessages, useSendMessage, ThreadWithDetails } from "@/hooks/useMessages";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

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
  const { isOtherTyping, sendTyping } = useTypingIndicator(activeThreadId);

  const filteredThreads = threads.filter((t) =>
    !searchQuery || t.other_user?.full_name?.includes(searchQuery) || t.other_user?.org_name?.includes(searchQuery)
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
            <Button asChild className="rounded-xl"><Link to="/login">تسجيل الدخول</Link></Button>
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
                  <Input placeholder="ابحث عن محادثة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-xl pr-10" />
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
                    <button
                      key={thread.id}
                      onClick={() => setSearchParams({ thread: thread.id })}
                      className={`flex w-full items-center gap-3 p-4 text-right transition-all hover:bg-secondary/50 ${thread.id === activeThreadId ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={thread.other_user?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {thread.other_user?.user_type === "org"
                              ? <Building2 className="h-5 w-5" />
                              : (thread.other_user?.full_name || "م").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-sm truncate ${thread.unread_count > 0 ? "font-bold" : "font-semibold"} text-foreground`}>
                              {thread.other_user?.full_name || "مستخدم"}
                            </span>
                            <Badge
                              variant="outline"
                              className={`shrink-0 text-[9px] px-1.5 py-0 h-4 ${
                                thread.other_user?.user_type === "org"
                                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}
                            >
                              {thread.other_user?.user_type === "org" ? "كيان" : "كادر"}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {new Date(thread.last_message_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">{thread.last_message || "لا رسائل بعد"}</p>
                          {thread.unread_count > 0 && (
                            <Badge className="h-5 min-w-5 rounded-full bg-primary px-1.5 text-[10px]">{thread.unread_count}</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex flex-col ${!activeThreadId ? "hidden md:flex" : "flex"}`}>
              {activeThread ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                    <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSearchParams({})}>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={activeThread.other_user?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {activeThread.other_user?.user_type === "org"
                          ? <Building2 className="h-5 w-5" />
                          : (activeThread.other_user?.full_name || "م").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {activeThread.other_user?.profile_link ? (
                          <Link to={activeThread.other_user.profile_link} className="truncate text-sm font-bold text-foreground hover:text-primary transition-colors hover:underline">
                            {activeThread.other_user.full_name}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-bold text-foreground">{activeThread.other_user?.full_name || "مستخدم"}</span>
                        )}
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[9px] px-1.5 py-0 h-4 ${
                            activeThread.other_user?.user_type === "org"
                              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {activeThread.other_user?.user_type === "org" ? "كيان" : "كادر"}
                        </Badge>
                      </div>
                      {activeThread.other_user?.profile_link && (
                        <Link to={activeThread.other_user.profile_link} className="text-[11px] text-primary hover:underline">
                          عرض الملف الشخصي ←
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
                        <span className="text-3xl">👋</span>
                        <p className="text-sm font-medium text-muted-foreground">ابدأ المحادثة بإرسال رسالة</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.sender_id === user.id;
                        return (
                          <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-start" : "justify-end"}`}>
                                <span className={`text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                  {new Date(msg.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {isMine && (msg.is_read ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" /> : <Check className="h-3 w-3 text-primary-foreground/60" />)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Typing indicator */}
                  {isOtherTyping && (
                    <div className="px-4 pb-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span>يكتب الآن...</span>
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Input placeholder="اكتب رسالتك..." value={messageText} onChange={(e) => { setMessageText(e.target.value); sendTyping(); }} onKeyDown={handleKeyDown} className="flex-1 rounded-xl" maxLength={2000} />
                      <Button size="icon" className="rounded-xl" onClick={handleSend} disabled={!messageText.trim() || sendMessage.isPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {sendMessage.isError && (
                      <p className="mt-2 text-xs text-destructive">
                        {(sendMessage.error as any)?.message?.includes("Rate limit") ? "تم تجاوز الحد المسموح. انتظر قليلاً." : "حدث خطأ. حاول مرة أخرى."}
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

export default Messages;
