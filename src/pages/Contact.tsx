import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: "تم الإرسال", description: "شكراً لتواصلك معنا، سنرد عليك قريباً" });
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-bl from-primary/5 via-background to-accent/5 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-4xl font-black">اتصل بنا</h1>
            <p className="mt-3 text-muted-foreground">
              نسعد بتواصلك معنا. أرسل رسالتك وسنرد عليك في أقرب وقت
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-5">
            {/* Contact Info */}
            <div className="md:col-span-2">
              <h2 className="mb-6 font-display text-xl font-bold">معلومات التواصل</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">البريد الإلكتروني</p>
                    <a href="mailto:info@kawader.sa" className="text-sm text-primary hover:underline">info@kawader.sa</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">الهاتف</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">+966 11 000 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">العنوان</p>
                    <p className="text-sm text-muted-foreground">الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" required placeholder="اسمك الكامل" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" required placeholder="email@example.com" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">الموضوع</Label>
                  <Input id="subject" required placeholder="موضوع الرسالة" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea id="message" required rows={5} placeholder="اكتب رسالتك هنا..." className="mt-1" />
                </div>
                <Button type="submit" className="w-full font-display font-bold" disabled={submitting}>
                  {submitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
