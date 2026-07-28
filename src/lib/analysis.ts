import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic();

const ContentAnalysisSchema = z.object({
  stance: z
    .enum(["SUPPORT", "OPPOSE", "NEUTRAL"])
    .describe("The overall stance the opinion itself is taking on its topic"),
  topic: z
    .string()
    .describe("The main topic/subject of the opinion, in a few words"),
  emotion: z
    .string()
    .describe(
      "The single dominant emotional tone of the opinion, e.g. 'anger', 'humor', 'pride'",
    ),
  keywords: z
    .array(z.string())
    .describe("Relevant keywords capturing the opinion's content, at most 30"),
});

export type ContentAnalysis = z.infer<typeof ContentAnalysisSchema>;

// Called after a Content row is created (see src/lib/actions/content.ts).
// Failures are caught by the caller so a slow/failed analysis never blocks
// publishing - analysis is best-effort enrichment, not a hard dependency.
export async function analyzeContent(
  contentId: string,
  body: string,
): Promise<void> {
  const message = await anthropic.messages.parse({
    model: "claude-opus-5",
    max_tokens: 1024,
    system:
      "You analyze short user-submitted opinion posts for a social voting app. Extract structured metadata only - do not add commentary or engage with the opinion's content.",
    messages: [{ role: "user", content: body }],
    output_config: {
      format: zodOutputFormat(ContentAnalysisSchema),
    },
  });

  const parsed = message.parsed_output;
  if (!parsed) {
    throw new Error(
      `Content analysis returned no parsed output for content ${contentId} (stop_reason: ${message.stop_reason})`,
    );
  }

  const analysis: ContentAnalysis = {
    ...parsed,
    keywords: parsed.keywords.slice(0, 30),
  };

  await prisma.content.update({
    where: { id: contentId },
    data: { analysis },
  });
}
