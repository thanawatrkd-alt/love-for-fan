import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

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

  // AI Chat with Manus LLM
  ai: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string(),
        systemPrompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = input.systemPrompt || "You are a helpful and friendly assistant. Respond in Thai language.";

        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });

          return {
            success: true,
            reply: result.choices[0]?.message?.content || "ไม่สามารถได้รับคำตอบ",
          };
        } catch (error) {
          console.error("LLM error:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
