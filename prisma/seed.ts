import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// ---------------------------------------------------------------------------
// Test seed data for local Feed/recommendation testing. No external APIs are
// called - stance/topic/emotion/keywords are assigned by fixed rule per
// category/opinion instead of going through the Phase 5 Claude analyzer, so
// this costs nothing to run.
// ---------------------------------------------------------------------------

type Stance = "SUPPORT" | "OPPOSE" | "NEUTRAL";

type Opinion = { text: string; stance: Stance };

type Category = {
  key: string;
  tags: string[];
  emotions: string[];
  templates: string[];
  topics: string[];
  opinions: Opinion[];
};

const CATEGORIES: Category[] = [
  {
    key: "stock",
    tags: ["stocks", "crypto", "finance"],
    emotions: ["焦虑", "兴奋", "怀疑", "纠结"],
    topics: [
      "特斯拉", "茅台", "英伟达", "比亚迪", "苹果", "宁德时代", "阿里巴巴",
      "腾讯", "比特币", "以太坊", "狗狗币", "黄金", "恒生指数", "纳斯达克",
      "A股", "美股",
    ],
    opinions: [
      { text: "要起飞了，赶紧上车", stance: "SUPPORT" },
      { text: "就是个大号韭菜收割机", stance: "OPPOSE" },
      { text: "值得长期持有", stance: "SUPPORT" },
      { text: "泡沫已经很大了，小心站岗", stance: "OPPOSE" },
      { text: "现在进场纯纯接盘", stance: "OPPOSE" },
      { text: "基本面很扎实，不慌", stance: "SUPPORT" },
      { text: "跌成这样谁还敢碰", stance: "OPPOSE" },
      { text: "短期看空，长期看多", stance: "NEUTRAL" },
      { text: "别人恐惧我贪婪，正在加仓", stance: "SUPPORT" },
      { text: "该跑路就跑路吧", stance: "OPPOSE" },
      { text: "涨跌都跟我没关系，纯路人", stance: "NEUTRAL" },
      { text: "技术面已经走坏了", stance: "OPPOSE" },
      { text: "这波是主力在洗盘，别慌", stance: "NEUTRAL" },
      { text: "闭眼梭哈，梭就完事了", stance: "SUPPORT" },
      { text: "已经清仓观望了", stance: "NEUTRAL" },
      { text: "全靠信仰在扛", stance: "SUPPORT" },
    ],
    templates: [
      "我觉得{topic}{opinion}，纯个人看法，不是投资建议。",
      "刚看了{topic}的走势，感觉{opinion}。",
      "身边好多人在讨论{topic}，我的判断是{opinion}。",
      "说真的，{topic}这波{opinion}，你们怎么看？",
      "作为一个韭菜，我对{topic}的看法是{opinion}。",
      "{topic}最近太离谱了，{opinion}。",
      "熬夜看盘，{topic}{opinion}，心态崩了。",
      "不吹不黑，{topic}目前来看{opinion}。",
      "刚追加了仓位，{topic}我觉得{opinion}。",
      "看了半天K线，{topic}这个位置{opinion}。",
      "朋友一直劝我买{topic}，我觉得{opinion}，暂时不敢动。",
      "{topic}这个板块最近很热，个人观点是{opinion}。",
      "说句得罪人的话，{topic}真的{opinion}。",
      "盯盘一天，{topic}让我觉得{opinion}。",
      "对{topic}我一直是这个态度：{opinion}。",
      "身边的人都在聊{topic}，我唯一的想法就是{opinion}。",
      "从技术角度看，{topic}短期内{opinion}。",
      "别问我为什么，{topic}这波我就是觉得{opinion}。",
    ],
  },
  {
    key: "social",
    tags: ["society", "news"],
    emotions: ["愤怒", "无奈", "担忧", "讽刺"],
    topics: [
      "996工作制", "延迟退休", "彩礼", "内卷", "躺平", "催婚", "学区房",
      "职场性别歧视", "外卖骑手权益", "高房价", "内容审核", "网络暴力",
      "环保话题", "地域黑", "消费主义", "公务员热",
    ],
    opinions: [
      { text: "早就该改一改了", stance: "SUPPORT" },
      { text: "其实没那么严重，大家想多了", stance: "OPPOSE" },
      { text: "真的太离谱了，必须重视", stance: "SUPPORT" },
      { text: "这就是社会现实，没啥好抱怨的", stance: "OPPOSE" },
      { text: "希望能有更多人关注这个问题", stance: "SUPPORT" },
      { text: "键盘侠太多了，没必要上纲上线", stance: "OPPOSE" },
      { text: "身边就有活生生的例子，真的心疼", stance: "SUPPORT" },
      { text: "这锅不该让普通人来背", stance: "SUPPORT" },
      { text: "说到底还是钱和资源分配的问题", stance: "NEUTRAL" },
      { text: "每代人都有自己的难处，别老拿来比", stance: "NEUTRAL" },
      { text: "支持严格监管，早该管管了", stance: "SUPPORT" },
      { text: "过度解读了，没必要这么焦虑", stance: "OPPOSE" },
      { text: "希望政策能真正落地，不是喊口号", stance: "SUPPORT" },
      { text: "个人觉得利大于弊", stance: "SUPPORT" },
      { text: "弊大于利，副作用被忽视了", stance: "OPPOSE" },
      { text: "站着说话不腰疼的人太多了", stance: "OPPOSE" },
    ],
    templates: [
      "说到{topic}，我的态度很明确：{opinion}。",
      "身边朋友最近老聊{topic}，我觉得{opinion}。",
      "关于{topic}这件事，{opinion}，别喷我。",
      "每次看到{topic}相关的新闻，我都觉得{opinion}。",
      "{topic}这个话题吵了这么多年，我的看法是{opinion}。",
      "不想当键盘侠，但{topic}这事我真的觉得{opinion}。",
      "作为普通人，我对{topic}的感受就是{opinion}。",
      "看了一圈评论区，关于{topic}我还是坚持{opinion}。",
      "{topic}又上热搜了，说实话{opinion}。",
      "身边有真实案例，所以对{topic}我{opinion}。",
      "理性讨论一下{topic}，个人立场是{opinion}。",
      "这届年轻人对{topic}的看法基本都是{opinion}，我也一样。",
      "每次聚会都会提到{topic}，我的观点始终是{opinion}。",
      "{topic}这件事没有标准答案，但我{opinion}。",
      "刷到关于{topic}的讨论，忍不住想说一句：{opinion}。",
      "说句可能不中听的话，关于{topic}我{opinion}。",
    ],
  },
  {
    key: "daily",
    tags: ["daily-life", "lifestyle"],
    emotions: ["治愈", "满足", "烦躁", "emo"],
    topics: [
      "早起", "熬夜", "点外卖", "做饭", "健身", "减肥", "养猫", "养狗",
      "囤货", "断舍离", "租房", "搬家", "天气突然变冷", "失眠",
      "刷手机到凌晨", "周末宅家",
    ],
    opinions: [
      { text: "真的能改变生活质量", stance: "SUPPORT" },
      { text: "纯纯自我感动，坚持不了几天", stance: "OPPOSE" },
      { text: "已经成为我生活里最治愈的事", stance: "SUPPORT" },
      { text: "真的太痛苦了，谁懂啊", stance: "OPPOSE" },
      { text: "强烈推荐大家试试", stance: "SUPPORT" },
      { text: "劝退，别学我", stance: "OPPOSE" },
      { text: "越来越离不开了", stance: "SUPPORT" },
      { text: "浪费时间又浪费钱", stance: "OPPOSE" },
      { text: "只有经历过的人才懂那种快乐", stance: "SUPPORT" },
      { text: "真的会上瘾，根本停不下来", stance: "NEUTRAL" },
      { text: "已经是我每天的仪式感了", stance: "SUPPORT" },
      { text: "第三次立flag了，这次一定坚持", stance: "NEUTRAL" },
      { text: "身体在报警，但就是改不掉", stance: "OPPOSE" },
      { text: "钱包已经开始报警了", stance: "OPPOSE" },
      { text: "感觉整个人都被治愈了", stance: "SUPPORT" },
    ],
    templates: [
      "最近开始{topic}，感觉{opinion}。",
      "说真的，{topic}这件事对我来说{opinion}。",
      "已经坚持{topic}好几天了，{opinion}。",
      "身边朋友都在{topic}，我试了一下，{opinion}。",
      "{topic}真的是我生活里绕不开的话题，{opinion}。",
      "每次{topic}之后，我都觉得{opinion}。",
      "本来只是随便试试{topic}，结果{opinion}。",
      "关于{topic}，我的真实感受就是{opinion}。",
      "今天又{topic}了，{opinion}，下次还敢。",
      "{topic}这件小事，{opinion}，谁懂啊。",
      "从今天开始又要{topic}了，希望这次{opinion}。",
      "反思了一下自己的{topic}习惯，发现{opinion}。",
      "身边人都在劝我别{topic}了，但我觉得{opinion}。",
      "深夜emo时刻，{topic}让我{opinion}。",
      "又双叒叕开始{topic}，{opinion}。",
    ],
  },
  {
    key: "workplace",
    tags: ["work", "career"],
    emotions: ["疲惫", "愤怒", "无奈", "emo"],
    topics: [
      "加班", "开会", "汇报", "甲方", "领导画大饼", "裁员", "涨薪",
      "年终奖", "团建", "KPI", "周报", "背锅", "内卷同事", "远程办公",
      "试用期", "面试造假",
    ],
    opinions: [
      { text: "真的很想离职", stance: "OPPOSE" },
      { text: "这操作我真的绷不住了", stance: "OPPOSE" },
      { text: "打工人不易，互相理解", stance: "NEUTRAL" },
      { text: "领导画的饼我一个字都不信", stance: "OPPOSE" },
      { text: "已经麻了，继续搬砖", stance: "NEUTRAL" },
      { text: "这波操作我是真的服了", stance: "OPPOSE" },
      { text: "还挺人性化的，公司算有良心", stance: "SUPPORT" },
      { text: "纯纯形式主义，没啥用", stance: "OPPOSE" },
      { text: "打工人的悲哀，谁懂啊", stance: "OPPOSE" },
      { text: "终于有点盼头了", stance: "SUPPORT" },
      { text: "该反抗的时候还是要反抗", stance: "SUPPORT" },
      { text: "已经开始偷偷投简历了", stance: "OPPOSE" },
      { text: "只能靠摸鱼续命了", stance: "NEUTRAL" },
      { text: "职场就是这样，习惯就好", stance: "NEUTRAL" },
      { text: "这种公司文化真的该改改了", stance: "OPPOSE" },
    ],
    templates: [
      "今天又{topic}了，{opinion}。",
      "公司这次{topic}的操作，{opinion}。",
      "说说{topic}这件事吧，{opinion}，打工人不易。",
      "刚经历完{topic}，{opinion}。",
      "同事都在吐槽{topic}，我的感受是{opinion}。",
      "每次{topic}我都想离职，{opinion}。",
      "领导又提{topic}了，说实话{opinion}。",
      "关于{topic}，作为一个牛马我只想说：{opinion}。",
      "刚开完会讨论{topic}，{opinion}。",
      "又是{topic}的一天，{opinion}。",
      "身边同事因为{topic}都emo了，我也{opinion}。",
      "这个月{topic}的事让我彻底{opinion}。",
      "本来对{topic}没意见，直到今天{opinion}。",
      "公司在{topic}这件事上，{opinion}。",
      "打工人版本更新：{topic}，{opinion}。",
      "每次聊到{topic}，办公室都会有一种默契：{opinion}。",
    ],
  },
  {
    key: "entertainment",
    tags: ["entertainment", "celebrity"],
    emotions: ["八卦", "惊讶", "看戏", "无语"],
    topics: [
      "顶流塌房", "综艺剪辑", "明星恋情", "选秀翻车", "网红翻车", "短剧上头",
      "偶像剧", "演唱会抢票", "粉丝互撕", "影视剧烂尾", "网络热梗",
      "直播带货翻车", "明星离婚", "顶流新剧", "跨界营业", "真人秀剧本",
    ],
    opinions: [
      { text: "纯纯看戏，不站队", stance: "NEUTRAL" },
      { text: "早就看出苗头了", stance: "NEUTRAL" },
      { text: "粉丝滤镜也太厚了吧", stance: "OPPOSE" },
      { text: "这剧本编得我脚趾抠地", stance: "OPPOSE" },
      { text: "真情实感嗑到了", stance: "SUPPORT" },
      { text: "全程尴尬到不行", stance: "OPPOSE" },
      { text: "这波公关也太失败了", stance: "OPPOSE" },
      { text: "吃瓜吃到饱", stance: "NEUTRAL" },
      { text: "支持一下，别太苛责了", stance: "SUPPORT" },
      { text: "塌房速度刷新我认知", stance: "OPPOSE" },
      { text: "这内容质量属实拉胯", stance: "OPPOSE" },
      { text: "笑不活了，太搞笑了", stance: "NEUTRAL" },
      { text: "真情实感为角色难过", stance: "SUPPORT" },
      { text: "营销痕迹太重了", stance: "OPPOSE" },
      { text: "这波是真的爷青回", stance: "SUPPORT" },
    ],
    templates: [
      "刷到{topic}的新闻，{opinion}。",
      "说说{topic}这件事吧，{opinion}。",
      "又是{topic}，{opinion}，瓜田不空。",
      "热搜挂着{topic}，我的看法是{opinion}。",
      "关于{topic}，个人观点：{opinion}。",
      "本来不想吃瓜，但{topic}这事{opinion}。",
      "这次{topic}的操作，{opinion}。",
      "评论区都在聊{topic}，我也想说一句：{opinion}。",
      "看完{topic}的全过程，只能说{opinion}。",
      "{topic}又上热搜了，{opinion}。",
      "作为一个吃瓜群众，对{topic}的态度是{opinion}。",
      "追了这么久{topic}，最后发现{opinion}。",
      "身边人都在讨论{topic}，我的结论是{opinion}。",
      "看到{topic}的通稿，{opinion}。",
      "熬夜追完{topic}相关内容，{opinion}。",
    ],
  },
];

const NICKNAME_PREFIXES = [
  "摸鱼的", "沉默的", "emo的", "理性的", "冲动的", "佛系", "破产", "加班",
  "熬夜", "单身", "躺平", "打工人", "韭菜", "咸鱼", "柠檬精", "打野", "内卷", "反卷",
];
const NICKNAME_SUFFIXES = [
  "小张", "小李", "阿强", "阿伟", "观察员", "冲浪选手", "股民", "打工人",
  "猫", "柯基", "码农", "设计师", "路人甲", "吃瓜群众", "牛马", "夜猫子", "干饭人",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNickname(usedNames: Set<string>): string {
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(NICKNAME_PREFIXES)}${pick(NICKNAME_SUFFIXES)}`;
    attempts++;
    if (attempts > 50) {
      name = `${name}${Math.floor(Math.random() * 1000)}`;
      break;
    }
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

function randomAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

function randomPastDate(withinDays: number): Date {
  const now = Date.now();
  const offsetMs = Math.random() * withinDays * 24 * 60 * 60 * 1000;
  return new Date(now - offsetMs);
}

const NUM_USERS = 18;
const TARGET_CONTENT_COUNT = 200;

type GeneratedContent = {
  body: string;
  tags: string[];
  analysis: {
    stance: Stance;
    topic: string;
    emotion: string;
    keywords: string[];
  };
};

function generateContentForCategory(
  category: Category,
  count: number,
  usedBodies: Set<string>,
): GeneratedContent[] {
  const results: GeneratedContent[] = [];
  let attempts = 0;
  const maxAttempts = count * 20;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const template = pick(category.templates);
    const topic = pick(category.topics);
    const opinion = pick(category.opinions);
    const body = template
      .replace(/\{topic\}/g, topic)
      .replace(/\{opinion\}/g, opinion.text);

    if (body.length < 20 || body.length > 150) continue;
    if (usedBodies.has(body)) continue;
    usedBodies.add(body);

    results.push({
      body,
      tags: category.tags,
      analysis: {
        stance: opinion.stance,
        topic,
        emotion: pick(category.emotions),
        keywords: Array.from(new Set([topic, category.key, ...category.tags])).slice(0, 6),
      },
    });
  }

  return results;
}

async function main() {
  const seedEmails = Array.from(
    { length: NUM_USERS },
    (_, i) => `seed-user-${i + 1}@test.votely.local`,
  );

  const usedNames = new Set<string>();
  const users: { id: string }[] = [];
  for (const email of seedEmails) {
    const name = randomNickname(usedNames);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        image: randomAvatarUrl(email),
        isAnonymous: false,
      },
      update: {},
    });
    users.push(user);
  }
  console.log(`Upserted ${users.length} seed users.`);

  // Re-running the seed shouldn't pile up duplicate content - clear out
  // whatever these seed users authored last time first.
  const userIds = users.map((u) => u.id);
  const deleted = await prisma.content.deleteMany({
    where: { authorId: { in: userIds } },
  });
  console.log(`Cleared ${deleted.count} previously seeded content rows.`);

  const usedBodies = new Set<string>();
  const perCategory = Math.ceil(TARGET_CONTENT_COUNT / CATEGORIES.length);
  const generated = CATEGORIES.flatMap((category) =>
    generateContentForCategory(category, perCategory, usedBodies),
  ).slice(0, TARGET_CONTENT_COUNT);

  const rows = generated.map((item) => {
    const isPublic = Math.random() < 0.8;
    const isAnonymous = Math.random() < 0.3;
    const authorId = pick(users).id;

    return {
      authorId,
      body: item.body,
      isPublic,
      isAnonymous,
      tags: item.tags,
      analysis: item.analysis,
      createdAt: randomPastDate(21),
    };
  });

  await prisma.content.createMany({ data: rows });

  console.log(`Created ${rows.length} seed content rows.`);
  console.log(
    `  public: ${rows.filter((r) => r.isPublic).length}, private: ${rows.filter((r) => !r.isPublic).length}`,
  );
  console.log(
    `  anonymous: ${rows.filter((r) => r.isAnonymous).length}, attributed: ${rows.filter((r) => !r.isAnonymous).length}`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
