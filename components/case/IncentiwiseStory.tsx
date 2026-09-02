import { Settle } from '@/components/Settle'
import { CornerMarks } from '@/components/CornerMarks'

/**
 * Incentiwise, told as a case study rather than shown as a screen dump.
 *
 * The page this replaces was two paragraphs and sixteen frames, which asked
 * the reader to reconstruct the reasoning from the artefacts. This is the
 * reasoning, with the artefacts as evidence for it — every claim here comes
 * from the project's own documentation, and nothing has been rounded up:
 * there are no adoption numbers, no engagement lifts and no test results,
 * because none were recorded.
 *
 * Built to be read at two speeds. The section labels, the statements and the
 * card headings carry the whole story on their own; the body underneath is
 * for a reader who wants the reasoning behind a particular move.
 */

/** A numbered section. The index is the only ornament any of them get. */
function Section({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Settle mass="light">
      <section className="cs-section">
        <hr className="rule" />
        <header className="cs-head">
          <span className="t-label cs-n">{n}</span>
          <h2 className="cs-title">{title}</h2>
        </header>
        {children}
      </section>
    </Settle>
  )
}

/** The one-line answer a section exists to give. */
function Statement({ children }: { children: React.ReactNode }) {
  return <p className="cs-statement">{children}</p>
}

function Body({ children }: { children: React.ReactNode }) {
  return <div className="cs-body t-body">{children}</div>
}

function Card({ n, title, children }: { n?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="cs-card">
      {n && <span className="t-label cs-card-n">{n}</span>}
      <h3 className="cs-card-title">{title}</h3>
      <p className="cs-card-body">{children}</p>
    </div>
  )
}

/** An artefact from the project, with the caption doing the arguing. */
function Figure({
  src,
  alt,
  caption,
  wide,
}: {
  src: string
  alt: string
  caption: string
  wide?: boolean
}) {
  return (
    <figure className={`cs-figure${wide ? ' cs-figure-wide' : ''}`}>
      <div className="plate relative">
        <CornerMarks />
        <img src={src} alt={alt} loading="lazy" />
      </div>
      <figcaption className="t-meta cs-caption">{caption}</figcaption>
    </figure>
  )
}

export function IncentiwiseStory() {
  return (
    <div className="cs">
      {/* ── 01 Intro ─────────────────────────────────────────────── */}
      <Settle mass="light">
        <p className="cs-summary">
          The brief was an MVP for an employee rewards and recognition platform. What shipped was a
          role-based system, with policy, budget and analytics engines behind it.
        </p>
      </Settle>

      {/* ── 02 The problem ───────────────────────────────────────── */}
      <Section n="02" title="The problem">
        <Statement>Platforms that worked abroad were not working in Indian SMEs.</Statement>
        <Body>
          <p>
            wTVision came to CNVRT Labs with a straightforward ask: build an MVP for an employee
            rewards and recognition platform for Indian small and mid-size enterprises. Their
            observation was that RnR tools with global success were not moving morale or
            productivity here.
          </p>
          <p>
            That was the hypothesis I was given. Before designing anything I wanted to know whether
            it held, and if so, what specifically was failing.
          </p>
        </Body>
      </Section>

      {/* ── 03 What I needed to understand ───────────────────────── */}
      <Section n="03" title="What I needed to understand">
        <div className="cs-questions">
          <div className="cs-q">How do these platforms actually work today?</div>
          <div className="cs-q">What do the people using them say about them?</div>
          <div className="cs-q">Who decides how recognition runs in a company?</div>
        </div>
        <Figure
          src="/images/incentiwise/a-competitors.png"
          alt="Competitor comparison: Empuls by XoxoDay against ThriveSparrow, across audience, USP, features, strengths and weaknesses"
          caption="Competitor audit — Empuls by XoxoDay and ThriveSparrow. Empuls is comprehensive but heavy: complexity, learning curve, and analytics aimed at engagement rather than ROI. ThriveSparrow is lighter but thinner on integrations and depth."
          wide
        />
      </Section>

      {/* ── 04 What I learned ────────────────────────────────────── */}
      <Section n="04" title="What I learned">
        <Body>
          <p>
            Forum threads on Reddit and Quora were the first real source — people describing
            recognition programmes they were actually subject to. Three themes repeated.
          </p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card n="01" title="Generic recognition">
            Praise reads as a chore when it is used to meet an engagement quota, with no
            personalisation and nothing attached to it.
          </Card>
          <Card n="02" title="Inconsistent implementation">
            Recognition feels arbitrary when the criteria are opaque, which reads as favouritism or
            as being overlooked.
          </Card>
          <Card n="03" title="Cultural misalignment">
            Recognition loses its effect when it ignores team norms and individual values. Context
            mattered more than the gesture.
          </Card>
        </div>

        <Statement>
          Then I noticed all of it came from one side of the org chart.
        </Statement>
        <Body>
          <p>
            Every voice was a non-managerial employee. I had almost nothing from the managers, HR
            and leaders who design and pay for these programmes — the people who decide whether
            recognition happens at all. So we talked to them.
          </p>
          <p>
            Those conversations added the half of the problem the forums could not see. Three
            findings mattered most.
          </p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card title="Poor measurability">
            Organisations could not track ROI or effectiveness. Without metrics, there was no case
            for continuing to spend on it.
          </Card>
          <Card title="Cumbersome to run">
            Recognition was slow and rigid — a mandatory task rather than something a manager
            reached for.
          </Card>
          <Card title="Overly complex tools">
            Platforms were feature-heavy, some trying to replace HR tools outright, which produced
            confusion and poor adoption.
          </Card>
        </div>

        <Statement>
          Recognition was not one workflow. It was three sets of needs sharing one product.
        </Statement>
      </Section>

      {/* ── 05 Defining the product ──────────────────────────────── */}
      <Section n="05" title="Defining the product">
        <Body>
          <p>
            The interviews resolved into three archetypes. They are not demographic sketches — each
            one wants a different thing from the same feature.
          </p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card title="The Leader">
            <em>&ldquo;If we can&rsquo;t measure it, we can&rsquo;t manage it.&rdquo;</em> C-suite
            and HR directors. Wants measurable ROI, consistency across departments, and predictable
            annual cost.
          </Card>
          <Card title="The Manager">
            <em>
              &ldquo;Recognition shouldn&rsquo;t be a chore, it should be effortless and meaningful
              for my team.&rdquo;
            </em>{' '}
            Wants control over their team&rsquo;s recognition culture without the admin.
          </Card>
          <Card title="The Grower">
            <em>
              &ldquo;I want my efforts to be seen for what they are, not lost in a sea of generic
              praise.&rdquo;
            </em>{' '}
            Early-career. Wants contribution visible to the people who decide.
          </Card>
        </div>

        <Statement>
          Indian companies need flexible, manager-driven recognition that adapts to their own
          culture, and gives leadership quantifiable metrics on what it returns.
        </Statement>
        <Body>
          <p>That restated brief reduced to three problems worth solving.</p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card n="01" title="Unmeasurable impact">
            Programmes feel generic and unpredictable, so ROI cannot be tracked.
          </Card>
          <Card n="02" title="Generic recognition">
            Employees want recognition for real achievements, not routine social gestures.
          </Card>
          <Card n="03" title="Tedious and rigid">
            Rewarding a team is slow and inflexible, which is why managers stop doing it.
          </Card>
        </div>

        <div className="cs-split">
          <div className="cs-list">
            <span className="t-label">What success looked like</span>
            <ol>
              <li>Recognition feels authentic to the workforce.</li>
              <li>Teams can adapt recognition to their own goals and achievement patterns.</li>
              <li>
                Leadership can connect recognition spending to team performance with confidence.
              </li>
              <li>Programmes scale across departments without losing relevance.</li>
            </ol>
          </div>
          <div className="cs-list">
            <span className="t-label">What constrained it</span>
            <ol>
              <li>MVP in 2.5 months, to allow early market entry and continued validation.</li>
              <li>No feature bloat — the complaint we had just documented in competitors.</li>
              <li>Customisation without overwhelming the person using it.</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* ── 06 Exploring the solution ────────────────────────────── */}
      <Section n="06" title="Exploring the solution">
        <Body>
          <p>
            I ran a gap analysis across three problem buckets — cultural misalignment, the tedium of
            the tools, and unmeasured ROI — putting the current state against the desired one and
            listing what would have to exist in between. It produced far more features than 2.5
            months could hold.
          </p>
        </Body>

        <Figure
          src="/images/incentiwise/a-prioritisation.png"
          alt="Effort-impact matrix plotting candidate features, marked as selected for MVP, discarded, or pushed to a later version"
          caption="Effort against impact. Four base features anchored the MVP — appreciations feed, rewards library, organisation database, appreciation analytics. Wellness tracking and video appreciations were dropped outright; AI insight cards, pulse surveys, campaign scheduling and peer nominations were deferred."
          wide
        />
      </Section>

      {/* ── 07 Key design decisions ──────────────────────────────── */}
      <Section n="07" title="Key design decisions">
        <div className="cs-decisions">
          <div className="cs-decision">
            <span className="t-label">Decision 01</span>
            <h3 className="cs-decision-title">One product, three dashboards</h3>
            <div className="cs-decision-grid">
              <div>
                <span className="t-label">Why</span>
                <p className="cs-card-body">
                  With the feature set settled, a single interface could not serve an admin
                  allocating budget, a lead running a team, and an employee receiving recognition.
                  Building one screen for all three is how competitors got to feature bloat.
                </p>
              </div>
              <div>
                <span className="t-label">Result</span>
                <p className="cs-card-body">
                  Features were mapped across a hierarchy — Admin, Dept lead, Team lead, Employee —
                  and each level got its own dashboard with only what it can act on.
                </p>
              </div>
            </div>
            <Figure
              src="/images/incentiwise/a-role-mapping.png"
              alt="Feature-by-role table showing what admins, team leads and employees can do with each feature"
              caption="Every feature resolved to a verb per role. Appreciations: admins and leads send and receive, employees receive. Budget: admins allocate, leads request, employees have none."
              wide
            />
          </div>

          <div className="cs-decision">
            <span className="t-label">Decision 02</span>
            <h3 className="cs-decision-title">Recognition tied to something real</h3>
            <div className="cs-decision-grid">
              <div>
                <span className="t-label">Why</span>
                <p className="cs-card-body">
                  Both the forums and the interviews said symbolic praise reads as empty, and that
                  people here value rewards with real-world value — vouchers, time off — over
                  arbitrary milestones.
                </p>
              </div>
              <div>
                <span className="t-label">Result</span>
                <p className="cs-card-body">
                  Points, badges and a redeemable rewards catalogue, so an appreciation carries a
                  value the recipient can actually spend.
                </p>
              </div>
            </div>
          </div>

          <div className="cs-decision">
            <span className="t-label">Decision 03</span>
            <h3 className="cs-decision-title">An existing design system, not a new one</h3>
            <div className="cs-decision-grid">
              <div>
                <span className="t-label">Why</span>
                <p className="cs-card-body">
                  2.5 months to MVP. Time spent inventing a button is time not spent on the
                  hierarchy problem, which was the actual design work.
                </p>
              </div>
              <div>
                <span className="t-label">Result</span>
                <p className="cs-card-body">
                  Forma 36 by Contentful, adapted: Work Sans in place of Geist for a less corporate
                  voice, plus custom tables, reward cards, appreciation cards and navigation the
                  system did not cover.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 08 Iteration ─────────────────────────────────────────── */}
      <Section n="08" title="What changed after review">
        <Body>
          <p>
            After five to six weeks the core screens went to the client as a working v.01, for
            testing and review before the supporting screens were built. The role hierarchy, the
            rewards mix and the bulk user management held up. Three things did not.
          </p>
        </Body>

        <div className="cs-iterations">
          <div className="cs-iteration">
            <h3 className="cs-iteration-title">Policies and budgets were sharing one engine</h3>
            <p className="cs-card-body">
              They are connected, so we had built them together. But approving a budget and writing
              a recognition policy are separate decisions with separate authorisation, and admins
              were confusing the two. We split the engine.
            </p>
            <Figure
              src="/images/incentiwise/a-iter-budget.png"
              alt="Before and after: v.01 policies screens on the left, v.02 dedicated budget screen on the right"
              caption="v.01 → v.02. Budget gets its own surface: allocation, per-department requests, approvals and utilisation."
              wide
            />
          </div>

          <div className="cs-iteration">
            <h3 className="cs-iteration-title">Analytics were scattered across the product</h3>
            <p className="cs-card-body">
              Putting each metric next to the thing it measured helped local decisions and made the
              programme as a whole impossible to judge — which was the Leader&rsquo;s entire
              problem. A unified dashboard was added, with the local figures kept where they were
              useful.
            </p>
            <Figure
              src="/images/incentiwise/a-iter-analytics.png"
              alt="Before and after: v.01 metrics scattered across four screens, v.02 unified analytics overview"
              caption="v.01 → v.02. Four scattered surfaces become one overview — ROI, policy engagement, employee engagement and rewards in a single view."
              wide
            />
          </div>

          <div className="cs-iteration">
            <h3 className="cs-iteration-title">It looked like an admin tool</h3>
            <p className="cs-card-body">
              The corporate aesthetic, and the side navigation in particular, read as rigid and
              utilitarian. For a product whose job is morale, that is a real functional problem, not
              a cosmetic one. Navigation moved to the top and the interface warmed up.
            </p>
            <Figure
              src="/images/incentiwise/a-iter-interface.png"
              alt="Before and after: v.01 side navigation, v.02 top navigation with a warmer interface"
              caption="v.01 → v.02. Side rail to top navigation, and more room for the reward cards to carry colour."
              wide
            />
          </div>
        </div>
      </Section>

      {/* ── 09 The final product ─────────────────────────────────── */}
      <Section n="09" title="The final product">
        <Statement>
          A recognition platform built around the organisation, not only the employee.
        </Statement>

        <div className="cs-screens">
          <Figure
            src="/images/incentiwise/02-feed.png"
            alt="Incentiwise activity feed with appreciation composer, points balance and leaderboard"
            caption="Feed — the employee&rsquo;s whole product. Send an appreciation, see what has been recognised, and what it is worth."
          />
          <Figure
            src="/images/incentiwise/03-send-appreciation.png"
            alt="Sending an appreciation, with value tags and an attached reward"
            caption="Sending. Tags carry the reason, and a reward can be attached, so the appreciation is specific rather than routine."
          />
          <Figure
            src="/images/incentiwise/05-rewards-catalog.png"
            alt="Rewards catalogue of redeemable vouchers and items"
            caption="Rewards. Points redeem against real vouchers — the tangible value the research kept asking for."
          />
          <Figure
            src="/images/incentiwise/15-culture.png"
            alt="Culture screen showing budget allocation across departments with approval requests"
            caption="Culture and budget. Admins allocate, leads request, and utilisation is visible per department."
          />
          <Figure
            src="/images/incentiwise/13-admins.png"
            alt="Admin permissions matrix assigning rights per person and department"
            caption="Administration. Permissions per person and scope — the role hierarchy made editable."
          />
          <Figure
            src="/images/incentiwise/12-member-detail.png"
            alt="A single member's profile with points earned, badges and transaction history"
            caption="A member. Points, badges and history in one place, which is how the Grower checks they are being seen."
          />
        </div>
      </Section>

      {/* ── 10 Reflection ────────────────────────────────────────── */}
      <Section n="10" title="Reflection">
        <div className="cs-cards cs-cards-3">
          <Card n="01" title="The brief was smaller than the problem">
            The ask was a recognition tool. The research moved the work to the policy, budget and
            permission systems underneath it, and that is where the product actually lives.
          </Card>
          <Card n="02" title="Ask the people who run it, not only the people it happens to">
            The forums gave one perspective loudly. The half I was missing belonged to the people
            who fund and administer the programme, and it changed the definition of the product.
          </Card>
          <Card n="03" title="Structure beat features">
            The largest improvements — role-based dashboards, splitting policy from budget, one
            analytics view — were rearrangements, not additions.
          </Card>
        </div>
      </Section>
    </div>
  )
}
