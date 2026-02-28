import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TalentsSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">الإعدادات</h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">الإعدادات</h3>
          <p className="text-sm text-muted-foreground mt-1">إدارة إعدادات حسابك — قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentsSettings;
