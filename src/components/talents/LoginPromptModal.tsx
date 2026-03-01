import { Link } from "react-router-dom";
import { LogIn, UserPlus, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenContactForm?: () => void;
}

const LoginPromptModal = ({ open, onOpenChange, onOpenContactForm }: LoginPromptModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm sm:rounded-2xl text-center" dir="rtl">
      <DialogHeader>
        <DialogTitle>تسجيل الدخول مطلوب</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        لازم تسجّل دخول عشان تقدر تراسل الكادر مباشرة مثل لنكدإن
      </p>
      <div className="flex flex-col gap-2 pt-2">
        <Button asChild className="rounded-xl gap-2">
          <Link to="/login"><LogIn className="h-4 w-4" />تسجيل الدخول</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl gap-2">
          <Link to="/register/talent"><UserPlus className="h-4 w-4" />إنشاء حساب</Link>
        </Button>
      </div>
      {onOpenContactForm && (
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onOpenContactForm();
          }}
          className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          أو تواصل معي عبر النموذج
        </button>
      )}
    </DialogContent>
  </Dialog>
);

export default LoginPromptModal;
