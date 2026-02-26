import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ الرابط" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Share2 className="h-4 w-4" />مشاركة:</span>
      <Button variant="outline" size="sm" onClick={copyLink} className="gap-1 text-xs">
        <Copy className="h-3.5 w-3.5" />نسخ الرابط
      </Button>
      <Button variant="outline" size="sm" asChild className="text-xs">
        <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer">واتساب</a>
      </Button>
      <Button variant="outline" size="sm" asChild className="text-xs">
        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">تويتر</a>
      </Button>
    </div>
  );
};

export default ShareButtons;
