import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MessageSquare, Inbox, Send, Archive, Eye, Mail, ExternalLink, Search, ArrowRight, Building2, User, CheckCheck, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useThreads, useMessages, useSendMessage, ThreadWithDetails } from "@/hooks/useMessages";
import { useContactMessages, useUpdateContactStatus, useNewContactCount, ContactMessage } from "@/hooks/useContactMessages";
import { useGetOrCreateThread } from "@/hooks/useMessages";

const messageTypeLabels: Record<string, string> = {
  hiring: "توظيف", consulting: "استشارة", service: "خدمة", collaboration: "تعاون", other: "أخرى",
};
const statusLabels: Record<string, string> = {
  new: "جديد", read: "مقروء", replied: "تم الرد", archived: "مؤرشف",
};

const TalentsMessages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const defaultTab = searchParams.get("tab") || "chats";

  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: threads = [] } = useThreads();
  const { data: messages = [] } = useMessages(selectedThread);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contactFilter, setContactFilter] = useState("all");
  const { data: contactMessages = [] } = useContactMessages(contactFilter);
  const updateStatus = useUpdateContactStatus();
  const { data: newCount = 0 } = useNewContactCount();
  const getOrCreateThread = useGetOrCreateThread();

  const activeThread = threads.find((t) => t.id === selectedThread);
  const filteredThreads = threads.filter((t) =>
    !searchQuery || t.other_user?.full_name?.includes(searchQuery) || t.other_user?.org_name?.includes(searchQuery)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = () => {
    if (!chatInput.trim() || !selectedThread) return;
    sendMessage.mutate({ threadId: selectedThread, text: chatInput });
    setChatInput("");
  };

  const handleMarkRead = (id: string) => {
    updateStatus.mutate({ id, status: "read" });
    toast({ title: "تم التعليم كمقروء ✅" });
  };

  const handleArchive = (id: string) => {
    updateStatus.mutate({ id, status: "archived" });
    toast({ title: "تم الأرشفة ✅" });
  };

  const handleOpenChat = (senderUserId: string) => {
    getOrCreateThread.mutate(senderUserId, {
      onSuccess: (threadId) => setSelectedThread(threadId),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة الرسائل</h1>
        <p className="text-sm text-muted-foreground">محادثاتك المباشرة ورسائل الموقع</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="chats" className="gap-2">
            <MessageSquare className="h-4 w-4" />المحادثات
          </TabsTrigger>
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />رسائل الموقع
            {newCount > 0 && (
              <Badge className="mr-1 h-5 min-w-5 rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">
                {newCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Chats */}
        <TabsContent value="chats">
          <div className="grid h-[calc(100vh-300px)] min-h-[400px] gap-0 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
            {/* Thread list */}
            <div className={`flex flex-col border-l ${selectedThread ? "hidden lg:flex" : "flex"}`}>
              <div className="border-b p-3">
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
                {filteredThreads.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">لا توجد محادثات بعد</p>
                  </div>
                ) : (
                  filteredThreads.map((thread: ThreadWithDetails) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread.id)}
                      className={`flex w-full items-center gap-3 border-b p-4 text-right transition-all hover:bg-secondary/50 ${
                        selectedThread === thread.id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                      }`}
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
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {thread.other_user?.full_name || "مستخدم"}
                            </p>
                            <Badge
                              variant="outline"
                              className={`shrink-0 text-[9px] px-1.5 py-0 h-4 ${
                                thread.other_user?.user_type === "org"
                                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}
                            >
                              {thread.other_user?.user_type === "org" ? "جمعية" : "كادر"}
                            </Badge>
                          </div>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true, locale: ar })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="truncate text-xs text-muted-foreground">
                            {thread.last_message || "ابدأ المحادثة"}
                          </p>
                          {thread.unread_count > 0 && (
                            <Badge className="h-5 min-w-5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                              {thread.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex flex-col ${!selectedThread ? "hidden lg:flex" : "flex"}`}>
              {!activeThread ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <MessageSquare className="h-14 w-14 text-muted-foreground/20" />
                  <h2 className="text-lg font-bold text-muted-foreground">اختر محادثة</h2>
                  <p className="text-sm text-muted-foreground">اختر محادثة من القائمة للبدء</p>
                </div>
              ) : (
                <>
                  {/* Chat Header with full identity */}
                  <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden shrink-0"
                      onClick={() => setSelectedThread(null)}
                    >
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
                          <Link
                            to={activeThread.other_user.profile_link}
                            className="truncate text-sm font-bold text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {activeThread.other_user.full_name}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-bold text-foreground">
                            {activeThread.other_user?.full_name || "مستخدم"}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[9px] px-1.5 py-0 h-4 ${
                            activeThread.other_user?.user_type === "org"
                              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {activeThread.other_user?.user_type === "org" ? "جمعية" : "كادر"}
                        </Badge>
                      </div>
                      {activeThread.other_user?.profile_link && (
                        <Link
                          to={activeThread.other_user.profile_link}
                          className="text-[11px] text-primary hover:underline"
                        >
                          عرض الملف الشخصي ←
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <span className="text-3xl">👋</span>
                        <p className="text-sm font-medium text-muted-foreground">ابدأ المحادثة</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                isMine
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-secondary text-foreground rounded-bl-md"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                              <div className={`mt-1 flex items-center gap-1 text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                <span>{new Date(msg.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                                {isMine && (msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="اكتب رسالتك..."
                        className="rounded-xl"
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                      />
                      <Button
                        size="icon"
                        className="shrink-0 rounded-xl"
                        onClick={handleSendChat}
                        disabled={!chatInput.trim() || sendMessage.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Contact Messages Inbox */}
        <TabsContent value="inbox">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={contactFilter} onValueChange={setContactFilter}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="read">مقروء</SelectItem>
                  <SelectItem value="replied">تم الرد</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contactMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">لا توجد رسائل من الموقع بعد</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {contactMessages.map((msg: ContactMessage) => (
                  <Card key={msg.id} className="rounded-2xl border transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-foreground">{msg.sender_name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {messageTypeLabels[msg.message_type] || msg.message_type}
                            </Badge>
                            <Badge className={`text-[10px] ${
                              msg.status === "new" ? "bg-primary/10 text-primary hover:bg-primary/10"
                                : msg.status === "archived" ? "bg-muted text-muted-foreground hover:bg-muted"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary"
                            }`}>
                              {statusLabels[msg.status] || msg.status}
                            </Badge>
                          </div>
                          {msg.subject && <p className="text-sm font-medium text-foreground">{msg.subject}</p>}
                          <p className="line-clamp-2 text-sm text-muted-foreground">{msg.message}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{msg.sender_email}</span>
                            {msg.sender_phone && <span>{msg.sender_phone}</span>}
                            <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ar })}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1.5">
                          <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate(`/talents/messages/contact/${msg.id}`)}>
                            <Eye className="h-3.5 w-3.5" />عرض
                          </Button>
                          {msg.status === "new" && (
                            <Button size="sm" variant="ghost" className="rounded-lg gap-1.5 text-xs" onClick={() => handleMarkRead(msg.id)}>تعليم كمقروء</Button>
                          )}
                          {msg.status !== "archived" && (
                            <Button size="sm" variant="ghost" className="rounded-lg gap-1.5 text-xs text-muted-foreground" onClick={() => handleArchive(msg.id)}>
                              <Archive className="h-3.5 w-3.5" />أرشفة
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="rounded-lg gap-1.5 text-xs" asChild>
                            <a href={`mailto:${msg.sender_email}`}><Mail className="h-3.5 w-3.5" />رد بالبريد</a>
                          </Button>
                          {msg.sender_user_id && (
                            <Button size="sm" variant="ghost" className="rounded-lg gap-1.5 text-xs text-primary" onClick={() => handleOpenChat(msg.sender_user_id!)} disabled={getOrCreateThread.isPending}>
                              <ExternalLink className="h-3.5 w-3.5" />فتح محادثة
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalentsMessages;
