import { prisma } from "@/lib/prisma";

/**
 * Placeholder heuristics for per-user profile scores, pending the product's
 * real formulas:
 * - emoScore: average RVS across all of the user's vote events (0-1) -
 *   how quickly/reactively they tend to vote.
 * - stanceBias: (support - oppose) / (support + oppose), -1..1 - how
 *   one-sided their votes are, ignoring skips.
 * - emotionSensitivity: fraction of votes that were "fast" reactions
 *   (rvs === 0.9), 0-1 - how often they react instantly vs. deliberate.
 * - interestTags: top 5 tags (by frequency) among content this user has
 *   voted SUPPORT on - feeds the Feed recommendation's "similar" bucket.
 */
export async function recomputeUserProfile(userId: string) {
  const events = await prisma.voteEvent.findMany({
    where: { userId },
    include: {
      vote: { select: { type: true } },
      content: { select: { tags: true } },
    },
  });

  if (events.length === 0) return;

  const emoScore =
    events.reduce((sum, event) => sum + event.rvs, 0) / events.length;

  const supportCount = events.filter(
    (event) => event.vote.type === "SUPPORT",
  ).length;
  const opposeCount = events.filter(
    (event) => event.vote.type === "OPPOSE",
  ).length;
  const decidedCount = supportCount + opposeCount;
  const stanceBias =
    decidedCount > 0 ? (supportCount - opposeCount) / decidedCount : 0;

  const fastReactionCount = events.filter(
    (event) => event.rvs === 0.9,
  ).length;
  const emotionSensitivity = fastReactionCount / events.length;

  const tagCounts = new Map<string, number>();
  for (const event of events) {
    if (event.vote.type !== "SUPPORT") continue;
    for (const tag of event.content.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const interestTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, emoScore, stanceBias, emotionSensitivity, interestTags },
    update: { emoScore, stanceBias, emotionSensitivity, interestTags },
  });
}

type ProfileTagInput = {
  emoScore: number;
  stanceBias: number;
  emotionSensitivity: number;
};

export function deriveProfileTags(profile: ProfileTagInput): string[] {
  const tags: string[] = [];

  if (profile.stanceBias > 0.3) tags.push("Mostly Supportive");
  else if (profile.stanceBias < -0.3) tags.push("Mostly Critical");
  else tags.push("Balanced Voter");

  if (profile.emotionSensitivity > 0.6) tags.push("Quick Reactor");
  else if (profile.emotionSensitivity < 0.2) tags.push("Deliberate Thinker");

  if (profile.emoScore > 0.7) tags.push("Highly Engaged");

  return tags;
}
