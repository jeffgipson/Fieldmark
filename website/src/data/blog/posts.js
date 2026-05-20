/**
 * Blog post seed content — sourced from docs/MARKETING_PLAN.md SEO targets
 * and "Before March" content series. Edit here to add or update posts.
 */
export const BLOG_POSTS = [
  {
    slug: "farm-financial-planning-missouri",
    title: "Farm Financial Planning in Missouri: What Mid-Scale Operators Actually Need",
    excerpt:
      "Mid-scale corn and soybean farmers in Missouri don't need another spreadsheet. They need independent benchmarks, peer context, and a clear picture before March input commitments.",
    categoryId: "financial-planning",
    tagIds: ["missouri", "margins", "march"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-12",
    readTimeMinutes: 7,
    featured: true,
    heroImage: "/images/blog/cover-financial-planning.png",
    heroImageAlt: "Abstract field grid representing farm financial planning",
    seo: {
      title: "Farm Financial Planning Missouri | Fieldmark",
      description:
        "Independent farm financial planning for Missouri corn and soybean farmers — benchmarks, peer comparison, and margin clarity before March."
    },
    content: [
      {
        type: "p",
        text: "If you farm 500 to 5,000 acres of corn and soybeans in Missouri, you already track costs somewhere — a notebook, a co-op statement, maybe a farm management app. What most operators still lack is an independent answer to one question: are my numbers reasonable compared to farms like mine, before I commit capital in March?"
      },
      {
        type: "h2",
        text: "The gap isn't record-keeping — it's reference data"
      },
      {
        type: "p",
        text: "Your agronomist knows your fields. Your lender knows your balance sheet. Your co-op knows what you bought last year. None of those relationships are wrong — but none of them gives you a neutral benchmark when you're deciding whether $187 per acre in fertilizer is high, low, or average for a Central Missouri corn operation in 2026."
      },
      {
        type: "ul",
        items: [
          "Industry baselines from MU Extension 2026 crop budgets — university planning defaults, not vendor quotes",
          "Anonymized peer medians from farms in your region and commodity mix",
          "Scenario modeling for base case and downside margins before you sign",
          "A lender-ready report you can share without rebuilding the analysis in a spreadsheet"
        ]
      },
      {
        type: "h2",
        text: "Why Missouri, why now"
      },
      {
        type: "p",
        text: "Missouri sits at the intersection of northern and southern Corn Belt economics. Regional variation in seed, fertilizer, and chemical costs is real — a state average can mislead a Cape Girardeau County operator as easily as it helps one. Fieldmark anchors comparisons to MU Extension regional budgets, then layers anonymized peer data as the cohort grows."
      },
      {
        type: "blockquote",
        text: "Farmers don't buy software. They buy confidence from people they trust. The job is to know your margins before March — with data you haven't had access to before."
      },
      {
        type: "cta",
        text: "Start a 30-day free trial — enter your costs and see where you stand.",
        href: "register"
      }
    ]
  },
  {
    slug: "corn-soybean-input-cost-benchmarks",
    title: "Corn & Soybean Input Cost Benchmarks: What MU Extension 2026 Actually Shows",
    excerpt:
      "MU Extension publishes official crop planning budgets every year. Here is what the 2026 numbers say for Missouri corn and soybean operating costs — and how to use them.",
    categoryId: "benchmarks",
    tagIds: ["corn", "soybean", "mu-extension", "fertilizer", "seed"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-14",
    readTimeMinutes: 6,
    featured: false,
    heroImage: "/images/blog/cover-benchmarks.png",
    heroImageAlt: "Chart-style illustration of crop input benchmarks",
    seo: {
      title: "Corn Soybean Input Cost Benchmark | Fieldmark",
      description:
        "2026 MU Extension crop budget benchmarks for Missouri corn and soybean — seed, fertilizer, chemicals, and total operating costs per acre."
    },
    content: [
      {
        type: "p",
        text: "When farmers search for input cost benchmarks, they usually find vendor pricing sheets or generic national averages. MU Extension crop planning budgets are different: they are built for planning, published by a land-grant university, and broken out by region and commodity. Fieldmark seeds these numbers as the independent industry baseline in every comparison."
      },
      {
        type: "h2",
        text: "2026 Missouri operating cost highlights"
      },
      {
        type: "p",
        text: "The following figures come from MU Extension 2026 crop planning budgets for representative Missouri regions. Your exact region and rotation may differ — always compare against the budget that matches your farm's geography and commodity mix."
      },
      {
        type: "ul",
        items: [
          "Corn — seed: about $99/ac; fertilizer: about $187/ac; total operating: about $600/ac",
          "Soybean — seed: about $75/ac; fertilizer: about $91/ac; total operating: about $388/ac",
          "Categories include seed, fertilizer, chemicals, drying, fuel, repairs, labor, and interest on operating capital"
        ]
      },
      {
        type: "h2",
        text: "Benchmarks are a starting point, not a verdict"
      },
      {
        type: "p",
        text: "A benchmark tells you what university planners assumed for a typical operation in your region. It does not know your soil tests, your tile, or your marketing program. What it does give you is a neutral reference when someone quotes you a number in February — and a baseline for downside scenario modeling if prices or yields move against you."
      },
      {
        type: "p",
        text: "Fieldmark credits MU Extension on every benchmark comparison the farmer sees. That attribution matters: this is the same data extension agents use in their own planning conversations."
      },
      {
        type: "cta",
        text: "Compare your per-field costs to MU Extension benchmarks — free for 30 days.",
        href: "register"
      }
    ]
  },
  {
    slug: "farm-margin-calculator-missouri",
    title: "Farm Margin Calculator for Missouri: From Costs to Breakeven in Plain Numbers",
    excerpt:
      "A margin calculator only helps if you trust the cost side. Here is how to build a Missouri corn or soybean margin view you can take to your lender or agronomist.",
    categoryId: "financial-planning",
    tagIds: ["missouri", "margins", "corn", "soybean", "scenarios"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-16",
    readTimeMinutes: 8,
    featured: false,
    heroImage: "/images/blog/cover-breakeven.png",
    heroImageAlt: "Margin calculation concept for farm operations",
    seo: {
      title: "Farm Margin Calculator Missouri | Fieldmark",
      description:
        "Calculate corn and soybean margins for Missouri farms — operating costs, breakeven prices, and downside scenarios before March commitments."
    },
    content: [
      {
        type: "p",
        text: "Most margin tools ask for yield and price, then hand you a number. That skips the hard part: whether your cost structure leaves any room at all. For Missouri operators, a useful margin calculator starts with per-field input costs — seed, fertilizer, chemicals, and the rest — then layers yield assumptions grounded in USDA history for your region."
      },
      {
        type: "h2",
        text: "What to enter first"
      },
      {
        type: "ul",
        items: [
          "Per-field acres and commodity (corn, soybean, or both)",
          "Input costs by category — what you expect to spend or have already been quoted",
          "A base-case yield and a downside yield — not just your best year",
          "A realistic price assumption — futures minus basis, not the number you hope for"
        ]
      },
      {
        type: "h2",
        text: "Breakeven is the number that matters in March"
      },
      {
        type: "p",
        text: "Breakeven price tells you what you need to receive per bushel to cover operating costs at a given yield. For a Central Missouri corn farm near MU Extension average costs, breakeven often lands around $2.20–$2.30 per bushel at trend yields — but your field-level costs can move that materially. A farm paying 23% above the regional average on fertilizer does not have the same breakeven as its neighbor."
      },
      {
        type: "p",
        text: "Fieldmark runs base and downside scenarios side by side so you see margin compression before you commit — not in November when the combine tells you what yield actually was."
      },
      {
        type: "cta",
        text: "Run your scenarios in Fieldmark — 30 days free, no credit card.",
        href: "register"
      }
    ]
  },
  {
    slug: "mu-extension-crop-budget-2026",
    title: "MU Extension Crop Budget 2026: How to Read and Use the Official Numbers",
    excerpt:
      "The MU Extension crop budget is the most credible independent planning document Missouri farmers have. Here is how to read it — and how Fieldmark puts it to work.",
    categoryId: "benchmarks",
    tagIds: ["mu-extension", "missouri", "corn", "soybean"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-18",
    readTimeMinutes: 5,
    featured: false,
    heroImage: "/images/blog/cover-benchmarks.png",
    heroImageAlt: "MU Extension crop budget reference",
    seo: {
      title: "MU Extension Crop Budget 2026 | Fieldmark",
      description:
        "Guide to MU Extension 2026 crop planning budgets for Missouri — regions, categories, and how Fieldmark uses them as independent benchmarks."
    },
    content: [
      {
        type: "p",
        text: "Every year, University of Missouri Extension publishes crop planning budgets used by agents, lenders, and farm managers across the state. The 2026 budgets break operating costs into seed, fertilizer, chemicals, drying, fuel, repairs, interest, and more — by region and by commodity."
      },
      {
        type: "h2",
        text: "Why extension data beats vendor sheets"
      },
      {
        type: "p",
        text: "A seed company's price list tells you what they want to sell for. MU Extension tells you what planners assumed a typical Missouri operation would spend to produce a crop — independent of any single input supplier. That is the reference point farmers have been missing when they walk into March purchase conversations."
      },
      {
        type: "h2",
        text: "Regions matter"
      },
      {
        type: "p",
        text: "Fieldmark maps farms to northern, central, and southwest Missouri budget regions. Comparing a southeast Missouri operator to a northwest Missouri average misstates the benchmark. Always match region and commodity before you interpret a gap."
      },
      {
        type: "blockquote",
        text: "Extension agents love seeing their data used correctly. Fieldmark credits MU Extension on every benchmark comparison the farmer sees."
      },
      {
        type: "cta",
        text: "See your costs vs MU Extension 2026 budgets — start free.",
        href: "register"
      }
    ]
  },
  {
    slug: "compare-farm-input-costs-peers",
    title: "How to Compare Farm Input Costs to Peers Without Giving Up Privacy",
    excerpt:
      "Peer comparison only works if farms trust the math. Here is how anonymized regional cohorts let you see medians and percentiles — never another farmer's name.",
    categoryId: "peer-comparison",
    tagIds: ["peer-data", "missouri", "fertilizer", "seed"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-20",
    readTimeMinutes: 6,
    featured: true,
    heroImage: "/images/blog/cover-peer-comparison.png",
    heroImageAlt: "Anonymized peer comparison across farms",
    seo: {
      title: "Compare Farm Input Costs to Peers | Fieldmark",
      description:
        "Compare your farm input costs to anonymized Missouri peer medians and percentiles — private, aggregated, and independent of vendors."
    },
    content: [
      {
        type: "p",
        text: "Industry benchmarks tell you what university planners assumed. Peer data tells you what farms like yours are actually paying — aggregated, anonymized, and never tied to a farm name. That second layer is what turns a benchmark from academic to actionable."
      },
      {
        type: "h2",
        text: "How peer cohorts work on Fieldmark"
      },
      {
        type: "ul",
        items: [
          "Farms are grouped by region and primary commodity — corn, soybean, or both",
          "Only aggregated statistics are shown: medians, percentiles, cohort size",
          "No farm identity is ever exposed to other users",
          "Peer stats appear only when the cohort reaches a minimum size — currently five farms"
        ]
      },
      {
        type: "h2",
        text: "The moment the product pays for itself"
      },
      {
        type: "p",
        text: "When a farmer sees that their fertilizer cost is higher than 78% of similar farms in their region, that is not a software feature — that is ammunition. It changes the conversation with the co-op, the timing of a purchase, or the question you ask your agronomist. Fieldmark shows the gap in dollars per acre and total dollars across the operation."
      },
      {
        type: "p",
        text: "MU Extension provides the independent industry floor. Peer comparison shows you the live market of operators who use the same tool — without turning your data into a leaderboard."
      },
      {
        type: "cta",
        text: "Run a peer comparison on your operation — 30-day free trial.",
        href: "register"
      }
    ]
  },
  {
    slug: "know-margins-before-march",
    title: "Know Your Margins Before March: The 8-Month Gap Every Corn Farmer Carries",
    excerpt:
      "March is when you commit. November is when you get paid. Most farmers make that decision without knowing whether their costs leave any margin at all.",
    categoryId: "before-march",
    tagIds: ["march", "margins", "corn", "missouri"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-22",
    readTimeMinutes: 5,
    featured: false,
    heroImage: "/images/blog/cover-before-march.png",
    heroImageAlt: "Calendar timeline from March input commitments to harvest",
    seo: {
      title: "Know Your Margins Before March | Fieldmark",
      description:
        "Why Missouri farmers need margin clarity before March input commitments — the 8-month gap between purchase and payment."
    },
    content: [
      {
        type: "p",
        text: "There is one peak conversion window in farm financial planning: January and February, when operators commit to seed, fertilizer, and chemical programs for the spring. By March, purchase orders are signed. By November, you know yield and price. The anxiety lives in the eight months between."
      },
      {
        type: "h2",
        text: "The decision is six figures — the reference point often isn't"
      },
      {
        type: "p",
        text: "Mid-scale Missouri corn and soybean farmers routinely commit $50,000 to $100,000 in inputs before they have independent confirmation that those costs fit their margin structure. Their agronomist sells inputs. Their co-op sells inputs. Fieldmark was built to add a third voice: independent data with no vendor relationship."
      },
      {
        type: "blockquote",
        text: "Know your margins before March. That is not a tagline — it is the only window that matters for input decisions."
      },
      {
        type: "h2",
        text: "What to do in January instead of February panic"
      },
      {
        type: "ul",
        items: [
          "Enter per-field costs from quotes you already have",
          "Compare against MU Extension 2026 benchmarks for your region",
          "Run base and downside scenarios before you sign",
          "Share the lender report with your operating line reviewer if margin is tight"
        ]
      },
      {
        type: "cta",
        text: "Walk into March ready — start your free trial today.",
        href: "register"
      }
    ]
  },
  {
    slug: "missouri-corn-fertilizer-costs-2026",
    title: "What Missouri Corn Farmers Are Paying for Fertilizer in 2026",
    excerpt:
      "According to MU Extension 2026 crop budgets, Missouri corn operations budget about $187 per acre for fertilizer. How does your number compare?",
    categoryId: "before-march",
    tagIds: ["fertilizer", "corn", "mu-extension", "missouri"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-24",
    readTimeMinutes: 4,
    featured: false,
    heroImage: "/images/blog/cover-fertilizer-costs.png",
    heroImageAlt: "Fertilizer cost benchmark for Missouri corn",
    seo: {
      title: "Missouri Corn Fertilizer Costs 2026 | Fieldmark",
      description:
        "2026 MU Extension fertilizer benchmark for Missouri corn — about $187/ac. Compare your per-field costs before March commitments."
    },
    content: [
      {
        type: "p",
        text: "Fertilizer is usually the largest variable operating cost on a Missouri corn acre after seed. MU Extension's 2026 planning budget for representative Missouri corn operations assumes roughly $187 per acre — a figure built from university planning defaults, not a single retail quote from any one dealer."
      },
      {
        type: "h2",
        text: "Before March: one question worth asking"
      },
      {
        type: "p",
        text: "When your co-op or agronomist presents a fertilizer program, the useful question is not whether the products are right for your ground — you know your fields. The useful question is whether the total dollars per acre fit what similar operations in your region are carrying. A program that runs $47 per acre above the regional average on 400 corn acres is $18,800 of margin you may not get back at harvest."
      },
      {
        type: "p",
        text: "Fieldmark shows fertilizer cost per field against both the MU Extension benchmark and anonymized peer medians. Timing negotiations, product swaps, and application splits all start with knowing the gap."
      },
      {
        type: "cta",
        text: "Compare your fertilizer costs — free 30-day trial.",
        href: "register"
      }
    ]
  },
  {
    slug: "central-missouri-corn-breakeven-2026",
    title: "Breakeven Prices for Central Missouri Corn: What the Numbers Say in 2026",
    excerpt:
      "At MU Extension average costs and trend yields, Central Missouri corn breakeven often lands near $2.23 per bushel. Run your downside before you commit.",
    categoryId: "before-march",
    tagIds: ["corn", "margins", "missouri", "scenarios"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-26",
    readTimeMinutes: 5,
    featured: false,
    heroImage: "/images/blog/cover-breakeven.png",
    heroImageAlt: "Breakeven price analysis for corn",
    seo: {
      title: "Central Missouri Corn Breakeven 2026 | Fieldmark",
      description:
        "2026 breakeven price context for Central Missouri corn — operating costs, yield assumptions, and downside scenario planning."
    },
    content: [
      {
        type: "p",
        text: "Breakeven price is the market level where revenue covers operating costs at a given yield. For a Central Missouri corn farm near MU Extension 2026 average costs, breakeven at trend yield often falls around $2.23 per bushel — but field-level cost variation moves that number quickly."
      },
      {
        type: "h2",
        text: "Base case is not enough"
      },
      {
        type: "p",
        text: "Lenders and experienced operators plan for downside yields, not just APH. A scenario that only works at 190 bushels per acre is not a plan — it is a hope. Fieldmark models base and downside cases together so you see margin compression when yield drops 15% or when fertilizer came in above benchmark."
      },
      {
        type: "p",
        text: "At current futures levels, there may be margin at average costs — or there may not, depending on your basis and your cost position vs peers. The only way to know is to run your numbers, not the state's."
      },
      {
        type: "cta",
        text: "Model your breakeven and downside — start free.",
        href: "register"
      }
    ]
  },
  {
    slug: "carrying-cost-march-input-commitments",
    title: "The Carrying Cost of March Input Commitments: Eight Months on Operating Capital",
    excerpt:
      "At 5% interest on $120,000 in operating costs, a Missouri corn farmer can carry $6,000 in interest before selling the first bushel. That is part of the March decision too.",
    categoryId: "before-march",
    tagIds: ["march", "margins", "corn", "missouri"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-28",
    readTimeMinutes: 4,
    featured: false,
    heroImage: "/images/blog/cover-carrying-cost.png",
    heroImageAlt: "Operating capital carrying cost timeline",
    seo: {
      title: "Carrying Cost of Farm Input Commitments | Fieldmark",
      description:
        "How operating interest on March input commitments affects Missouri farm margins — eight months from purchase to harvest revenue."
    },
    content: [
      {
        type: "p",
        text: "Eight months. That is how long a Missouri corn farmer often carries input costs on an operating line before harvest revenue arrives. The purchase price is only part of the decision — interest on operating capital is a real cost that does not show up on the seed invoice."
      },
      {
        type: "h2",
        text: "A concrete example"
      },
      {
        type: "p",
        text: "Take $120,000 in operating costs on the line from April through November at 5% annual interest. That is roughly $6,000 in carrying cost before you sell a bushel — independent of whether fertilizer or seed was a good agronomic choice. When total operating costs run above MU Extension benchmarks, both the upfront spend and the carrying cost on that extra margin compound."
      },
      {
        type: "p",
        text: "Scenario modeling that ignores operating interest understates the downside. Fieldmark includes operating cost totals in margin views so the March decision reflects the full economic picture."
      },
      {
        type: "cta",
        text: "See your full operating cost picture — 30 days free.",
        href: "register"
      }
    ]
  },
  {
    slug: "independent-benchmarks-advisor-conversations",
    title: "Why Independent Benchmarks Change the Conversation With Your Agronomist",
    excerpt:
      "Fieldmark does not replace agronomists — it gives farmers data for better conversations. Here is why that matters for co-ops, lenders, and operators alike.",
    categoryId: "for-advisors",
    tagIds: ["co-ops", "lenders", "mu-extension", "margins"],
    author: { name: "Jeff Gipson", role: "Founder, Fieldmark" },
    publishedAt: "2026-05-30",
    readTimeMinutes: 6,
    featured: false,
    heroImage: "/images/blog/cover-advisors.png",
    heroImageAlt: "Farmer and advisor reviewing independent benchmark data",
    seo: {
      title: "Independent Farm Benchmarks for Advisors | Fieldmark",
      description:
        "How independent MU Extension benchmarks help agronomists, co-op reps, and lenders — better farmer conversations without replacing trusted advisors."
    },
    content: [
      {
        type: "p",
        text: "Agronomists and co-op reps influence 35–45% of farmer input decisions. Ag lenders influence another 35–40%. None of those relationships is the problem — the information asymmetry is. Farmers often commit capital without an independent reference point for what costs should look like on farms their size."
      },
      {
        type: "h2",
        text: "The pitch to trusted advisors"
      },
      {
        type: "blockquote",
        text: "We make your farmers more financially disciplined. Better conversations. More confident clients. We work through you, not around you."
      },
      {
        type: "p",
        text: "A farmer who walks in knowing their fertilizer cost is 23% above the regional average is a more informed buyer — and a better client for everyone in the room. Fieldmark gives them that context using MU Extension benchmarks and anonymized peer medians, interpreted by D.A.L.E., an independent analyst with no vendor relationships."
      },
      {
        type: "h2",
        text: "For lenders"
      },
      {
        type: "p",
        text: "Borrowers who show up with structured benchmark analysis, scenario modeling, and downside risk assessment make annual reviews faster and underwriting clearer. The lender report D.A.L.E. generates is designed for that conversation — benchmarks, margins, and risks in plain language."
      },
      {
        type: "cta",
        text: "See how Fieldmark supports advisor and lender conversations — try it free.",
        href: "register"
      }
    ]
  }
];

export default BLOG_POSTS;
