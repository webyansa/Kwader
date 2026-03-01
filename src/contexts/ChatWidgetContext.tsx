import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ChatTarget {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  headline?: string;
  availableForWork?: boolean;
}

interface ChatWidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  threadId: string | null;
  target: ChatTarget | null;
  openChat: (threadId: string, target: ChatTarget) => void;
  toggleWidget: () => void;
  closeWidget: () => void;
  minimizeWidget: () => void;
}

const ChatWidgetContext = createContext<ChatWidgetState>({
  isOpen: false,
  isMinimized: false,
  threadId: null,
  target: null,
  openChat: () => {},
  toggleWidget: () => {},
  closeWidget: () => {},
  minimizeWidget: () => {},
});

export const useChatWidget = () => useContext(ChatWidgetContext);

export const ChatWidgetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [target, setTarget] = useState<ChatTarget | null>(null);

  const openChat = useCallback((tid: string, t: ChatTarget) => {
    setThreadId(tid);
    setTarget(t);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const toggleWidget = useCallback(() => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isOpen, isMinimized]);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setThreadId(null);
    setTarget(null);
  }, []);

  const minimizeWidget = useCallback(() => {
    setIsMinimized(true);
    setIsOpen(false);
  }, []);

  return (
    <ChatWidgetContext.Provider value={{ isOpen, isMinimized, threadId, target, openChat, toggleWidget, closeWidget, minimizeWidget }}>
      {children}
    </ChatWidgetContext.Provider>
  );
};
