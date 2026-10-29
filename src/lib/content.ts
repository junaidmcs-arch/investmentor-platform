export type ContentKind = "lesson" | "study" | "market" | "faq";

export type ContentEntry = {
  id: string;
  slug: string;
  kind: ContentKind;
  title: string;
  excerpt: string;
  body: string;
  level?: number;
  category: string;
  readMinutes: number;
  publishedAt: string;
  author: string;
  featured?: boolean;
};

export const learningLevels = [
  { number: 1, title: "Build your foundation", description: "Understand the exchange, your account, and your responsibilities." },
  { number: 2, title: "Understand the business", description: "Read financial statements and ask better questions about a company." },
  { number: 3, title: "Explore valuation", description: "Connect a price to earnings, cash flows, and explicit assumptions." },
  { number: 4, title: "Think through risk", description: "Consider what can go wrong before considering what can go right." },
  { number: 5, title: "Read the wider market", description: "Understand economic context without turning it into a prediction." },
] as const;

function entry(number: number, value: Omit<ContentEntry, "id" | "publishedAt" | "author">): ContentEntry {
  return { id: `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`, publishedAt: "2026-10-28", author: "InvestMentor editorial", ...value };
}

export const contentEntries: ContentEntry[] = [
  entry(1, {
    slug: "understanding-the-psx", kind: "lesson", level: 1, category: "Getting started", readMinutes: 5, featured: true,
    title: "What you own when you buy a share",
    excerpt: "Start with the business behind the ticker. Understand shares, the exchange, and market capitalization.",
    body: `## A small ownership interest
A share represents an ownership interest in a company. The value of that interest depends on the business, the rights attached to the share, and what other investors are willing to pay. A rising share price does not, by itself, tell you whether a business has improved.

The Pakistan Stock Exchange provides a market where listed securities can be traded through authorized intermediaries. The exchange, your broker, and the company whose shares you own perform different roles.

## Price is one piece of information
Market capitalization is commonly calculated as **share price × shares outstanding**. A PKR 20 share is not automatically cheaper than a PKR 200 share: the number of shares and the earnings represented by each share matter.

Imagine two fictional businesses. One has 100 million shares priced at PKR 20; the other has 10 million shares priced at PKR 200. Both have an equity market value of PKR 2 billion. That calculation says nothing yet about their debts, profitability, or prospects.

## A first research checklist
- What does the company sell, and who buys it?
- Where can you find its annual report and exchange announcements?
- What might cause its earnings or cash flow to decline?
- Could you need the invested money during a market downturn?

Share prices can fall substantially. Begin by understanding the product and your capacity for loss, rather than by selecting a ticker from a social-media conversation.

**Try this:** explain the difference between a company's share price and its market capitalization in one sentence.

Further learning: [PSX Knowledge Center](https://knowledgecenter.psx.com.pk/).`,
  }),
  entry(2, {
    slug: "broker-trading-and-cdc-accounts", kind: "lesson", level: 1, category: "Getting started", readMinutes: 6,
    title: "Your broker, trading account, and CDC records",
    excerpt: "Understand the purpose of each relationship before opening an account or sharing your information.",
    body: `## Know who does what
Your broker provides access to trading services. A trading account records your activity and relationship with that broker. Securities custody and settlement involve additional infrastructure, including the Central Depository Company of Pakistan. The specific account arrangements available to you should be explained by your selected provider.

Account opening and know-your-customer requirements can change. Confirm current documentation, charges, custody arrangements, and withdrawal procedures directly with the relevant authorized provider. InvestMentor does not open accounts, collect your account-opening documents, or handle your funds.

## Questions to ask before choosing a broker
- How can you verify its current authorization using official information?
- What commissions, taxes, and other charges will apply?
- How are your cash and securities held, and how can you independently check records?
- How do you withdraw money, resolve an error, or submit a complaint?
- What security controls protect account access?

## Keep control of your information
Use the provider's verified website or official contact details. Never send a password, one-time code, or brokerage login to someone offering to invest on your behalf. Compare contract notes and account statements with your own records.

**Try this:** create a short comparison checklist for two providers. Record the source and date for each answer instead of relying on a forwarded screenshot.

Use [PSX](https://www.psx.com.pk/) and [CDC Pakistan](https://www.cdcpakistan.com/) to locate official information. Account setup guidance is educational; it is not a recommendation of a particular broker.`,
  }),
  entry(3, {
    slug: "investment-horizon-and-behavior", kind: "lesson", level: 1, category: "Investor mindset", readMinutes: 5,
    title: "Choose a process before choosing a stock",
    excerpt: "Separate your time horizon, cash needs, and investment reasoning from the excitement of a moving price.",
    body: `## Your time horizon changes the question
Traders and long-term investors may hold the same security for very different reasons. A short-term price hypothesis and a multi-year business thesis require different evidence, monitoring, and risk controls. Neither label removes the possibility of loss.

Before considering an investment, write down your goal, when you might need the money, and what a substantial decline would mean for you. Money needed for near-term expenses deserves different treatment from capital you can leave invested for years.

## Make your reasoning visible
An investment journal can record:
- The business facts you have checked.
- The assumptions you are making about the future.
- The important risks and unanswered questions.
- The evidence that would cause you to reconsider.
- When you will review the decision.

This record makes it easier to distinguish a change in evidence from a change in mood. It can also reveal whether an initial business thesis has quietly become a hope that the price will recover.

## Give yourself time to think
Urgent tips, guaranteed-profit claims, and selective screenshots are poor substitutes for research. A disciplined process allows you to leave a question unanswered when you do not have enough information.

**Try this:** write a hypothetical investment thesis without using the phrases “everyone is buying” or “it has already gone up.” Then list one fact that could contradict it.

Further learning: [PSX investor education](https://knowledgecenter.psx.com.pk/).`,
  }),
  entry(4, {
    slug: "reading-financial-statements", kind: "lesson", level: 2, category: "Financial statements", readMinutes: 7, featured: true,
    title: "Three financial statements, one business story",
    excerpt: "Connect profit, assets and liabilities, and cash movement instead of reading each number in isolation.",
    body: `## The income statement: performance over a period
The income statement describes revenue, expenses, and profit for a reporting period. Start by checking whether you are reading a quarter or a full year, and whether the accounts are consolidated or standalone. Comparisons become misleading when their bases differ.

Revenue growth can come from higher sales volumes, higher prices, an acquisition, or currency effects. A growing top line is a question to investigate, not a complete conclusion.

## The balance sheet: a snapshot
The balance sheet records assets, liabilities, and equity at a date. Look at cash, receivables, inventory, borrowing, and obligations. Ask whether assets can turn into cash when liabilities fall due.

## The cash-flow statement: movement of cash
Cash-flow statements separate operating, investing, and financing activities. Accounting profit and operating cash flow can differ because of timing, non-cash items, and working-capital changes. A difference is not automatically wrongdoing; the explanation matters.

## Read the notes
Notes can explain accounting policies, related-party transactions, contingencies, segments, and borrowing terms. The auditor's report and management discussion also deserve attention.

**Try this:** for a fictional business with rising profit and falling operating cash flow, list three possible explanations. Then identify which notes you would inspect to test each explanation.

Original financial reports and announcements should be the starting point. Find issuer disclosures through [PSX announcements](https://dps.psx.com.pk/announcements/) and the issuer's own investor-relations pages.`,
  }),
  entry(5, {
    slug: "financial-ratios-in-context", kind: "lesson", level: 2, category: "Fundamentals", readMinutes: 7,
    title: "What EPS, ROE, and margins can—and cannot—tell you",
    excerpt: "Use ratios to ask focused questions, with consistent reporting periods and appropriate comparisons.",
    body: `## Ratios help organize questions
Earnings per share, profit margins, return on equity, and return on assets each describe a different part of a business. A single high ratio rarely provides enough evidence for an investment decision.

**EPS** expresses earnings attributable to ordinary shareholders on a per-share basis. Check whether the figure is basic or diluted and whether it includes unusual gains. For annual comparisons, avoid mixing a single quarter with a full year.

**Net margin** compares net profit with revenue. Ask whether a change comes from operations, financing costs, taxes, or a one-off item.

**ROE** relates earnings to shareholders' equity, often using average equity for the period. High leverage or a small equity base can make ROE look impressive. Read it alongside borrowing and cash generation.

**ROA** compares earnings with assets. The meaning differs between asset-heavy and asset-light businesses, so sector context matters.

## Use comparable evidence
Compare several years and, where meaningful, companies with similar business models and accounting bases. A bank, a manufacturer, and a holding company should not be forced into the same checklist of thresholds.

## Watch for exceptional items
Asset sales, reversals, tax changes, and discontinued operations may affect reported profit. Adjustments should be explained and reconciled rather than silently substituted for reported numbers.

**Try this:** write three reasons why a rise in EPS might not imply the same rise in sustainable earning power.

Further learning: [PSX Knowledge Center](https://knowledgecenter.psx.com.pk/).`,
  }),
  entry(6, {
    slug: "profit-cash-and-debt", kind: "lesson", level: 2, category: "Financial health", readMinutes: 6,
    title: "Follow the cash and understand the debt",
    excerpt: "Look beyond reported profit to working capital, reinvestment, borrowing terms, and liquidity.",
    body: `## Profit does not pay every bill immediately
A company can recognize revenue before collecting cash. If receivables or inventory grow quickly, cash available for operations may be under pressure even while profit rises.

Examine operating cash flow over several periods. Then consider reinvestment requirements. A commonly used starting point for free cash flow is operating cash flow less capital expenditure, but valuation cash-flow definitions require further care and must remain consistent with the chosen method.

## Debt is a set of obligations
Debt-to-equity is a useful starting indicator for some non-financial businesses. It does not reveal everything about borrowing. Read maturity schedules, fixed versus floating rates, collateral, covenants, and currency exposure.

A company with long-term fixed-rate debt faces a different refinancing problem from one dependent on short-term floating-rate borrowing. Foreign-currency debt can introduce additional risk when operating cash flows are in rupees.

## Questions worth recording
- Are operating cash flows sufficient for recurring obligations?
- What is maintenance expenditure, and what is growth expenditure?
- When does debt need to be refinanced?
- How would lower sales or higher funding costs affect liquidity?
- Are guarantees or other commitments described in the notes?

**Try this:** write a downside scenario for a fictional manufacturer whose customers pay later while its bank borrowing becomes more expensive.

Source framework: [CFA Institute—free cash flow valuation](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/free-cash-flow-valuation).`,
  }),
  entry(7, {
    slug: "pe-valuation-and-assumptions", kind: "lesson", level: 3, category: "Valuation", readMinutes: 6, featured: true,
    title: "A valuation is a set of assumptions",
    excerpt: "Work through a simple P/E example and see why changing one input changes the answer.",
    body: `## A simple valuation exercise
In a P/E-based exercise, an estimated value per share can be calculated as **earnings per share × an assumed price-to-earnings multiple**.

Consider a fictional company with EPS of PKR 20. An assumed multiple of 8 produces PKR 160 per share. Against an illustrative price of PKR 120, the difference is 33.3%. That is an assumption-dependent price gap; it is not a promised return.

## The multiple needs a reason
Why use 8 rather than 6 or 10? Possible considerations include business quality, expected growth, cyclicality, capital needs, and comparable valuations. These considerations do not produce a uniquely correct multiple.

If the assumed multiple is 6, the same EPS produces PKR 120. If sustainable EPS is only PKR 16 and the multiple is 6, the exercise produces PKR 96. An apparently attractive valuation can change substantially when assumptions change.

## Keep your inputs consistent
Label EPS as historical, forecast, or normalized. State its reporting period and whether it is diluted. Explain unusual-item adjustments. Loss-making companies and very unstable earnings can make a simple P/E approach unhelpful.

**Try this:** use the [valuation lab](/tools/valuation) to change EPS and the multiple independently. Explain which assumption matters most in your example.

The lab uses hypothetical, user-entered figures. It does not fetch market prices or recommend securities.`,
  }),
  entry(8, {
    slug: "discounted-cash-flow-basics", kind: "lesson", level: 3, category: "Valuation", readMinutes: 8,
    title: "DCF: bringing future cash flows into today's terms",
    excerpt: "Understand discounting, terminal value, and the difference between valuing a business and its equity.",
    body: `## What discounting does
A discounted cash-flow model estimates value from expected future cash flows expressed in present-value terms. Each period's cash flow is discounted by a rate appropriate to its risk and definition.

For a finite explicit forecast followed by a terminal value:

**Value = sum of FCF(t) / (1 + r)^t + terminal value / (1 + r)^n**

Here, t identifies a forecast period, r is the discount rate, and n is the final explicit forecast period. Dividing one cash-flow number by a discount rate is a special constant-perpetuity case, not the general DCF method.

## Match the cash flow to the valuation
Free cash flow to the firm is generally discounted using the weighted average cost of capital. Further adjustments for financing claims and non-operating assets are needed to move from operating business value to common equity value.

Free cash flow to equity is discounted at the cost of equity and estimates equity value directly. Mixing the two approaches produces an inconsistent model.

## Terminal value deserves scrutiny
A terminal value describes the business beyond the explicit forecast. Small changes in long-run growth and the discount rate can have large effects. In a perpetual-growth terminal model, the discount rate must exceed the perpetual growth rate; assumptions must also be economically defensible.

## Start with sensitivity, not precision
Use a range of growth, margin, reinvestment, and discount-rate assumptions. Keep currency and inflation assumptions consistent. A detailed spreadsheet does not remove uncertainty about the future.

**Try this:** identify which assumptions would need to change if a company's sales grew quickly but its capital expenditure also rose sharply.

Sources: [CFA Institute—free cash flow valuation](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/free-cash-flow-valuation) and [NYU Stern—estimating terminal value](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/valquestions/termvalapproaches.htm).`,
  }),
  entry(9, {
    slug: "company-and-sector-risk", kind: "lesson", level: 4, category: "Risk management", readMinutes: 6,
    title: "Build a risk checklist before a valuation conclusion",
    excerpt: "Separate company-specific weaknesses from sector and economic exposures.",
    body: `## Write risks as mechanisms
“This company is risky” is difficult to investigate. “A loss of its largest customer could reduce cash available for debt payments” identifies a mechanism and suggests evidence to inspect.

Company risks may include customer concentration, borrowing, governance, execution, input dependence, litigation, and weak cash collection. Sector risks can include regulation, capacity expansion, demand cycles, and pricing pressure.

## Connect the risk to the financial statements
For each important risk, ask:
- What event or change could trigger it?
- Which part of revenue, costs, assets, or financing would be affected?
- How quickly could the effect appear?
- What evidence would show that the risk is becoming more serious?
- What information is still missing?

## Do not hide uncertainty in a score
A traffic-light label or numeric score can be useful for organizing a review, but it should not imply that risks are known with precision. A low historical volatility figure does not prove that permanent capital loss is unlikely.

## Revisit the checklist
Risks can change with new announcements, financing arrangements, or business conditions. Record the analysis date and the information available at that point.

**Try this:** choose a fictional business and identify one company risk, one sector risk, and one macroeconomic risk. Explain how each could affect cash generation.

Source documents to consult include annual-report notes and issuer announcements available through [PSX disclosures](https://dps.psx.com.pk/announcements/).`,
  }),
  entry(10, {
    slug: "diversification-and-concentration", kind: "lesson", level: 4, category: "Portfolio thinking", readMinutes: 6,
    title: "Diversification is about exposures, too",
    excerpt: "Holding several stocks does not automatically mean that your risks are well spread.",
    body: `## Count the sources of risk
Five different companies may still depend on the same commodity price, funding condition, or government policy. Diversification asks how investments might behave together, not simply how many tickers are in an account.

Sector, customer, currency, interest-rate, and liquidity exposures can overlap. Consider what happens if several holdings face the same adverse development at once.

## There is no universal percentage mix
A hypothetical portfolio is a teaching example. An appropriate allocation depends on goals, time horizon, cash needs, loss capacity, and other assets and obligations. A fixed set of sector percentages should not be treated as suitable for every investor.

Diversification can reduce exposure to individual investments, but it cannot eliminate market losses. Keeping money available for planned needs is also part of the discussion.

## Make a simple exposure map
For a fictional portfolio, list each holding's principal source of revenue, sector, borrowing exposure, and major downside risk. Then look for repeated dependencies.

**Try this:** imagine that three businesses all rely on imported inputs. Explain why their sector labels alone may understate their shared currency exposure.

This lesson does not recommend an allocation or provide a personalized portfolio assessment. Learn more through [PSX investor education](https://knowledgecenter.psx.com.pk/).`,
  }),
  entry(11, {
    slug: "interest-rates-and-businesses", kind: "lesson", level: 5, category: "Market context", readMinutes: 7,
    title: "How interest rates reach a company's accounts",
    excerpt: "Follow the possible effects on borrowing, demand, margins, and valuation without assuming a fixed market outcome.",
    body: `## Start with the transmission mechanism
Interest-rate changes can influence borrowing costs, savings returns, credit demand, and the rates used in valuations. The timing and size of the effect vary across businesses and financing arrangements.

A company with floating-rate debt may see funding costs change relatively quickly. A company with fixed-rate borrowing may experience a different timeline. Changes in customer demand may take longer to become visible.

## Banks have several moving parts
For a bank, asset yields, deposit costs, credit demand, investment values, and asset quality can move together or in different directions. A rate cut does not provide a mechanical instruction about the future direction of a bank's share price.

## Separate business effects from price effects
An economic change can help a business while already being reflected in its share price. Expectations, starting valuation, and other developments also matter.

## Read the actual policy communication
When discussing Pakistan's monetary policy, use the dated State Bank of Pakistan statement and distinguish a policy decision from your interpretation of its consequences. Avoid presenting an old rate as current.

**Try this:** compare a fictional cash-rich company with a heavily indebted company. List potential benefits and disadvantages of lower interest rates for each.

Sources: [SBP monetary policy](https://www.sbp.org.pk/our-operations/monetary-policy) and [BIS—interest-rate risk management by banks](https://www.bis.org/publications/qr-202309/interest-rate-risk-management-eme-banks).`,
  }),
  entry(12, {
    slug: "sentiment-and-market-evidence", kind: "lesson", level: 5, category: "Market context", readMinutes: 6,
    title: "Separate a market narrative from its evidence",
    excerpt: "Read market headlines, investor flows, and sector stories with a repeatable set of questions.",
    body: `## Narratives are hypotheses
“Investors are optimistic” may describe a market mood, but it does not explain the value of a specific business. Ask which observation supports the statement, what period it covers, and what alternative explanations exist.

Price movements, trading volume, investor flows, and economic releases describe different things. A flow statistic does not tell you every investor's motive or establish the future direction of prices.

## Use a consistent reading checklist
- What is the original source and publication date?
- Is the number an absolute value, a percentage change, or a forecast?
- What is the comparison period?
- Does the conclusion apply to the whole market or only part of it?
- What would contradict the narrative?

## Treat sector rotation as a possible pattern
Changes in interest rates, currency, regulation, demand, and commodity prices can affect sectors differently. Relationships are conditional and can change. A sector's business outlook and its valuation should be considered together.

## Keep a reviewable record
Write a short explanation of the evidence and uncertainty at the time of analysis. Avoid rewriting a past explanation to make it appear that the outcome was obvious.

**Try this:** take a hypothetical headline about falling inflation. List three pieces of additional information you would need before discussing its effect on one company.

Original sources include [SBP](https://www.sbp.org.pk/), [Pakistan Bureau of Statistics](https://www.pbs.gov.pk/), and [PSX disclosures](https://dps.psx.com.pk/announcements/).`,
  }),
  entry(13, {
    slug: "manufacturer-profit-and-cash", kind: "study", category: "Financial statements", readMinutes: 7, featured: true,
    title: "Growing sales. Slower cash collection.",
    excerpt: "A fictional manufacturer shows why higher accounting profit is only the beginning of the investigation.",
    body: `## Educational case study
**Company A is fictional. All figures are hypothetical, in PKR millions. This is a financial-statement exercise, not analysis of a listed security.**

Company A sells packaging to domestic businesses. Revenue rises from 1,000 to 1,200, while net profit rises from 80 to 96. At first glance, revenue and profit both grew by 20%, with net margin unchanged at 8%.

## The next question: where is the cash?
Suppose operating cash flow falls from 100 to 45. Receivables grow from 150 to 260, while inventory also rises. These figures suggest that more resources may be tied up in working capital, but they do not explain why.

Possible explanations include longer customer payment terms, seasonal production, a change in customer mix, or difficulty collecting receivables. The notes and management explanations would need to be checked.

## What would you investigate?
- Receivables aging and credit-loss provisions.
- Revenue-recognition policies and changes in payment terms.
- Inventory composition and the possibility of slow-moving goods.
- Borrowing used to finance the working-capital increase.
- Whether the pattern persists over more than one reporting period.

## Three possible paths
**Improving collection:** customers pay on time after a seasonal delay, allowing operating cash flow to recover.

**Persistent working-capital needs:** growing sales continue to require more financing, reducing cash available for other uses.

**Credit deterioration:** some receivables prove difficult to collect, affecting both cash flow and profit.

No probabilities are assigned to these scenarios. The exercise shows which evidence would help distinguish them.

## Your takeaway
Revenue growth, accounting profit, and cash conversion describe related but different aspects of a business. A useful company assessment connects all three.

Continue with [reading financial statements](/learn/reading-financial-statements) and [profit, cash, and debt](/learn/profit-cash-and-debt).`,
  }),
  entry(14, {
    slug: "valuation-sensitive-to-assumptions", kind: "study", category: "Valuation", readMinutes: 6,
    title: "One business, three valuation scenarios",
    excerpt: "See how earnings and valuation multiples change a hypothetical estimate—and the questions behind it.",
    body: `## Educational case study
**Company B is fictional. All per-share amounts are hypothetical PKR figures. No actual market price or security is represented.**

Assume Company B has an illustrative price of PKR 120 per share. A P/E exercise combines an earnings assumption with a valuation-multiple assumption.

## Downside illustration
EPS of PKR 16 and an assumed P/E of 6 produce PKR 96. Relative to the illustrative price, that is a difference of −20%.

This scenario could represent lower sustainable earnings and a less generous valuation. It is an illustration, not a forecast or a minimum possible value.

## Base illustration
EPS of PKR 20 and an assumed P/E of 8 produce PKR 160, a difference of approximately +33.3%.

Calling this a base case does not make it the most likely outcome. A reasoned analysis would need to support both inputs.

## Higher-value illustration
EPS of PKR 22 and an assumed P/E of 9 produce PKR 198, a difference of +65%.

Higher earnings and a higher multiple both contribute to the result. The assumptions may also move together in an adverse direction.

## What this exercise leaves out
It does not assign a timeline or probabilities, include dividends and costs, or establish whether reported earnings are sustainable. A P/E approach can be unsuitable when earnings are negative or unusually volatile.

## Questions before a conclusion
Which earnings period are you using? Are exceptional items included? What supports the multiple? What alternative method could challenge the result?

Explore the arithmetic in the [valuation lab](/tools/valuation), then read [a valuation is a set of assumptions](/learn/pe-valuation-and-assumptions).`,
  }),
  entry(15, {
    slug: "portfolio-shared-exposures", kind: "study", category: "Risk management", readMinutes: 5,
    title: "Three holdings, one shared vulnerability",
    excerpt: "A fictional portfolio demonstrates why different sector labels may hide similar risks.",
    body: `## Educational case study
**This portfolio is fictional and contains no recommended securities or allocation percentages.**

Imagine three businesses: a manufacturer that imports raw materials, a distributor that imports finished products, and an operator with foreign-currency borrowing. Their sector labels differ, but a weaker rupee could affect each of them.

## Map the mechanism
The manufacturer's costs may rise before it can change selling prices. The distributor may need more working capital to purchase the same inventory. The operator may need more rupees to service foreign-currency obligations.

The size of each effect depends on contracts, hedging, pricing power, debt terms, and any foreign-currency revenue. A company with export receipts may have a different net exposure.

## Ask what happens together
If all three holdings experience pressure at once, simply counting them as separate stocks can overstate diversification. Add customer concentration, interest-rate exposure, and liquidity to the same map.

## What the exercise does not tell you
It does not identify an optimal portfolio, predict an exchange rate, or measure actual correlations. Those tasks require a clear objective, appropriate data, and a much fuller assessment.

**Try this:** make one row per fictional holding and one column per major exposure. Identify which columns repeat.

Continue with [diversification and concentration](/learn/diversification-and-concentration).`,
  }),
  entry(16, {
    slug: "understanding-rate-cut-headlines", kind: "market", category: "Interest rates", readMinutes: 5, featured: true,
    title: "Reading a rate-cut headline with care",
    excerpt: "An evergreen framework for understanding possible business effects. No current policy-rate claim or market forecast.",
    body: `## Start with the dated decision
Read the original State Bank of Pakistan statement. Record the decision date, the policy change, and the stated economic context. This article is a general framework and does not report the current policy rate.

## Separate the channels
Lower financing costs may help some borrowers, depending on their loan terms. Demand may respond over time. Banks face changes in both asset yields and funding costs, while investment values and credit conditions can also change.

## Ask what was already expected
A policy decision can be widely anticipated before its announcement. Business fundamentals and market pricing can respond on different timelines. Other news may outweigh the effect of the rate decision.

## A useful note contains conditions
Instead of predicting that an entire sector will rise, explain which businesses may be affected, through which mechanism, and what could offset that effect. Check debt structure, pricing power, and starting valuation.

## Questions to carry forward
- Which borrowing is floating-rate, and when does it reprice?
- Could lower revenue or higher input costs offset funding savings?
- Does the company earn interest income that may also change?
- What new disclosure would help test the thesis?

Sources: [SBP monetary policy](https://www.sbp.org.pk/our-operations/monetary-policy) and [BIS interest-rate risk research](https://www.bis.org/publications/qr-202309/interest-rate-risk-management-eme-banks).`,
  }),
  entry(17, {
    slug: "currency-moves-and-sector-stories", kind: "market", category: "Macroeconomics", readMinutes: 5,
    title: "A currency move has more than one side",
    excerpt: "Consider revenue, input costs, borrowing, and timing before attaching a sector label to an exchange-rate story.",
    body: `## Begin with net exposure
A change in USD/PKR can affect a business through foreign-currency sales, imported inputs, foreign borrowing, and contractual arrangements. The net effect requires more detail than an “exporter” or “importer” label.

An exporter might receive more rupees for foreign-currency revenue while also paying more for imported materials. A domestic company may face imported input costs or have suppliers that pass those costs through.

## Timing matters
Contract prices, inventory already purchased, payment terms, and hedging arrangements can delay or alter the effect. Accounting translation effects should also be distinguished from operating cash flows.

## Build a conditional explanation
List the relevant currency exposures. Identify what can be repriced and how quickly. Consider whether customer demand or competitors could limit the ability to pass on costs.

## Keep the uncertainty visible
This is a framework for reading disclosures, not an exchange-rate forecast. It does not imply that every business in a sector will respond in the same way or that a business effect will translate directly into a share-price move.

Original sources: [SBP](https://www.sbp.org.pk/) and issuer disclosures through [PSX announcements](https://dps.psx.com.pk/announcements/).`,
  }),
  entry(18, { slug: "faq-is-learning-free", kind: "faq", category: "Using InvestMentor", readMinutes: 1, title: "Is the learning library free?", excerpt: "Yes. The MVP's published educational lessons, market explainers, and illustrative case studies are publicly readable.", body: "The MVP's published educational content is free to read. You do not need an account to browse it. Verified access is used for private question history. Paid packages and subscription billing are not part of this release." }),
  entry(19, { slug: "faq-investment-recommendations", kind: "faq", category: "Scope", readMinutes: 1, title: "Does InvestMentor provide buy or sell signals?", excerpt: "The MVP focuses on education, research methods, and understanding risk.", body: "The MVP does not provide automated recommendations, trade execution, or a signal subscription. Examples and tools teach methods using stated assumptions. A calculator result does not establish whether a security is suitable for you." }),
  entry(20, { slug: "faq-ask-without-account", kind: "faq", category: "Questions", readMinutes: 1, title: "Can I ask a question without creating an account?", excerpt: "You can submit a website question first. Email verification protects access to your private response and history.", body: "Website questions do not require prior registration. Provide an email address you control. Private history is accessible after verified sign-in. A reference number is a support identifier and cannot unlock a private response. WhatsApp contact is available when the consultant's contact number is configured." }),
  entry(21, { slug: "faq-urdu-questions", kind: "faq", category: "Questions", readMinutes: 1, title: "Can I write my question in Urdu or Roman Urdu?", excerpt: "Yes. Questions can be written in English, Urdu, or Roman Urdu.", body: "You can write in English, Urdu, or Roman Urdu. Include a clear subject and enough context to explain the concept you want to understand. Do not include passwords, one-time codes, CNIC images, or brokerage access details." }),
  entry(22, { slug: "faq-live-market-data", kind: "faq", category: "Data and examples", readMinutes: 1, title: "Are prices and calculator inputs live?", excerpt: "No. The valuation lab uses hypothetical or user-entered figures and does not fetch current PSX prices.", body: "The valuation lab has no live price feed. Its starting figures are hypothetical. Educational case studies explicitly identify fictional data. When reading any dated analysis, check the reporting period and sources rather than assuming it reflects current conditions." }),
  entry(23, { slug: "faq-educational-session", kind: "faq", category: "Sessions", readMinutes: 1, title: "How do educational session requests work?", excerpt: "Request a preferred time in Pakistan time. The consultant reviews it before confirming an appointment.", body: "A session request is not an immediate reservation. The consultant reviews the topic and preferred time, then confirms availability and meeting details. MVP sessions focus on educational questions and methods; they do not involve managing your brokerage account or handling your funds." }),
];

export function contentPath(content: Pick<ContentEntry, "kind" | "slug">): string {
  const prefix = content.kind === "lesson" ? "/learn" : content.kind === "study" ? "/company-studies" : content.kind === "market" ? "/market-notes" : "/learn";
  return content.kind === "faq" ? `${prefix}#${content.slug}` : `${prefix}/${content.slug}`;
}
