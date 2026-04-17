import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Chat with Groq
  ai: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string(),
        systemPrompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
          throw new Error("GROQ_API_KEY is not configured");
        }

        const systemPrompt = input.systemPrompt || "You are a helpful and friendly assistant. Respond in Thai language.";

        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mixtral-8x7b-32768",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: input.message },
              ],
              temperature: 0.7,
              max_tokens: 1024,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
          }

          const data = await response.json();
          return {
            success: true,
            reply: data.choices[0]?.message?.content || "ไม่สามารถได้รับคำตอบ",
          };
        } catch (error) {
          console.error("Groq API error:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
