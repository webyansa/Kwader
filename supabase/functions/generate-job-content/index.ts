import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const {
      title,
      department,
      city,
      remote_type,
      employment_type,
      experience_level,
      skills,
      org_short_description,
      style = "professional",
      action = "generate", // "generate" | "rewrite"
      section_to_rewrite,
      section_content,
    } = await req.json();

    const styleMap: Record<string, string> = {
      brief: "مختصر ومباشر، فقرات قصيرة ونقاط محددة",
      detailed: "تفصيلي وشامل مع شرح وافٍ لكل نقطة",
      professional: "مهني راقٍ بأسلوب سعودي أبيض بسيط",
      formal: "رسمي وأكاديمي بلغة عربية فصحى",
    };

    const remoteMap: Record<string, string> = {
      onsite: "حضوري",
      remote: "عن بعد",
      hybrid: "هجين",
    };
    const empMap: Record<string, string> = {
      full_time: "دوام كامل",
      part_time: "دوام جزئي",
      contract: "عقد مؤقت",
      intern: "تدريب تعاوني",
      consultant: "استشاري",
      volunteer: "تطوعي",
    };
    const levelMap: Record<string, string> = {
      junior: "مبتدئ",
      mid: "متوسط",
      senior: "خبير",
      leadership: "قيادي",
      any: "غير محدد",
    };

    let systemPrompt: string;
    let userPrompt: string;

    if (action === "rewrite") {
      systemPrompt = `أنت كاتب محتوى محترف متخصص في إعلانات التوظيف للقطاع غير الربحي في المملكة العربية السعودية.
أعد صياغة النص التالي بأسلوب ${styleMap[style] || styleMap.professional}.
اكتب بالعربية فقط. تجنب المصطلحات التقنية المبالغ فيها. استخدم نقاطاً واضحة.`;

      userPrompt = `القسم: ${section_to_rewrite}\nالنص الحالي:\n${section_content}\n\nأعد صياغته بأسلوب ${styleMap[style] || styleMap.professional}.`;
    } else {
      systemPrompt = `أنت كاتب محتوى توظيف محترف متخصص في القطاع غير الربحي السعودي.
مهمتك كتابة محتوى إعلان وظيفي احترافي بأسلوب ${styleMap[style] || styleMap.professional}.

القواعد:
- اكتب بالعربية فقط
- استخدم أسلوباً سعودياً أبيض بسيطاً ومهنياً
- تجنب المصطلحات التقنية المبالغ فيها
- المسؤوليات والمتطلبات كنقاط واضحة (6-10 نقاط لكل قسم)
- الملخص 2-3 أسطر فقط
- اجعل الوصف يعكس طبيعة العمل في القطاع غير الربحي`;

      userPrompt = `أنشئ محتوى إعلان وظيفي احترافي بناءً على:
- المسمى الوظيفي: ${title || "غير محدد"}
- القسم: ${department || "غير محدد"}
- المدينة: ${city || "غير محددة"}
- نمط العمل: ${remoteMap[remote_type] || "غير محدد"}
- نوع الدوام: ${empMap[employment_type] || "غير محدد"}
- المستوى: ${levelMap[experience_level] || "غير محدد"}
- المهارات: ${skills?.length ? skills.join("، ") : "غير محددة"}
- نبذة عن الجمعية: ${org_short_description || "غير متوفرة"}`;
    }

    const tools =
      action === "rewrite"
        ? [
            {
              type: "function",
              function: {
                name: "rewrite_section",
                description: "أعد صياغة قسم محدد من إعلان الوظيفة",
                parameters: {
                  type: "object",
                  properties: {
                    rewritten_text: {
                      type: "string",
                      description: "النص المُعاد صياغته",
                    },
                  },
                  required: ["rewritten_text"],
                  additionalProperties: false,
                },
              },
            },
          ]
        : [
            {
              type: "function",
              function: {
                name: "generate_job_content",
                description: "إنشاء محتوى إعلان وظيفي احترافي",
                parameters: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "string",
                      description: "ملخص سريع للوظيفة في 2-3 أسطر",
                    },
                    description: {
                      type: "string",
                      description: "وصف تفصيلي للوظيفة",
                    },
                    responsibilities: {
                      type: "string",
                      description:
                        "المسؤوليات كنقاط، كل نقطة في سطر تبدأ بـ •",
                    },
                    requirements: {
                      type: "string",
                      description: "المتطلبات كنقاط، كل نقطة في سطر تبدأ بـ •",
                    },
                    suggested_skills: {
                      type: "array",
                      items: { type: "string" },
                      description: "5-8 مهارات مقترحة",
                    },
                  },
                  required: [
                    "summary",
                    "description",
                    "responsibilities",
                    "requirements",
                    "suggested_skills",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ];

    const toolChoice =
      action === "rewrite"
        ? { type: "function", function: { name: "rewrite_section" } }
        : { type: "function", function: { name: "generate_job_content" } };

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: toolChoice,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "يلزم إضافة رصيد لاستخدام الذكاء الاصطناعي",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في خدمة الذكاء الاصطناعي" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "لم يتم توليد محتوى" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-job-content error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "خطأ غير معروف",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
