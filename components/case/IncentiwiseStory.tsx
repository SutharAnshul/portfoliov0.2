import { Settle } from '@/components/Settle'

/**
 * Incentiwise, told as a case study rather than shown as a screen dump.
 *
 * Two rules govern what is on this page.
 *
 * Nothing is borrowed. The source deck has a visual language of its own —
 * cobalt panels, its own serif, its own diagrams — and none of it appears
 * here; every table, matrix and list below is drawn in this site's material
 * from the underlying facts. The writing is the same: the deck's sentences
 * are not reused or reworded, only its findings.
 *
 * Nothing is inflated. There are no adoption figures, no engagement lifts and
 * no test scores, because the project recorded none. Where something was
 * explored rather than proven, it says so.
 *
 * The only imagery is the product itself, shown plainly — no plate, no border,
 * no corner marks. The screens are the one thing that is genuinely his.
 */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
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

/** The one line a section exists to deliver. */
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

/** A product screen, unframed. */
function Screen({ src, alt, title, note }: { src: string; alt: string; title: string; note: string }) {
  return (
    <figure className="cs-screen">
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>
        <h3 className="cs-screen-title">{title}</h3>
        <p className="t-meta cs-caption">{note}</p>
      </figcaption>
    </figure>
  )
}

/** Rows of a plain comparison, set in the site's own type. */
function Row({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="cs-row">
      <span className="t-label">{label}</span>
      <span className="cs-row-v">{a}</span>
      <span className="cs-row-v">{b}</span>
    </div>
  )
}

export function IncentiwiseStory() {
  return (
    <div className="cs">
      {/* ── 01 Intro ─────────────────────────────────────────────── */}
      <Settle mass="light">
        <p className="cs-summary">
          Asked for a recognition app. Delivered the machinery underneath one — who may recognise
          whom, out of whose budget, under which rules, and what leadership sees for the money.
        </p>
      </Settle>

      {/* ── 02 The problem ───────────────────────────────────────── */}
      <Section n="02" title="The problem">
        <Statement>Tools that thrived elsewhere were going flat in Indian SMEs.</Statement>
        <Body>
          <p>
            A client came to the studio wanting an MVP: an employee rewards and recognition product
            aimed at small and mid-size Indian companies. Their reason for commissioning it was that
            the category leaders, successful in other markets, were not shifting morale or output in
            firms like the ones they knew.
          </p>
          <p>
            That was a claim, not a finding. My first job was to establish whether it was true, and
            if so, which part of the experience was actually breaking.
          </p>
        </Body>
      </Section>

      {/* ── 03 What I needed to understand ───────────────────────── */}
      <Section n="03" title="What I needed to understand">
        <div className="cs-questions">
          <div className="cs-q">What do the incumbents actually do, and where do they strain?</div>
          <div className="cs-q">What do the people on the receiving end say when nobody is asking?</div>
          <div className="cs-q">Who decides whether recognition happens at all?</div>
        </div>

        <Body>
          <p>
            I worked two of the market leaders directly and read their public reception. They fail
            in opposite directions, which turned out to be the more useful observation.
          </p>
        </Body>

        <div className="cs-table">
          <div className="cs-row cs-row-head">
            <span className="t-label">&nbsp;</span>
            <span className="t-label">The comprehensive one</span>
            <span className="t-label">The focused one</span>
          </div>
          <Row label="Built for" a="Large organisations" b="Smaller teams and founders" />
          <Row
            label="Bet"
            a="One platform for every part of engagement"
            b="Recognition and feedback, done narrowly"
          />
          <Row
            label="Strength"
            a="Breadth, integrations, a deep rewards catalogue"
            b="Lighter to adopt, clearer to read"
          />
          <Row
            label="Strain"
            a="Weight and learning curve; measurement aimed at engagement, not return"
            b="Thinner integrations and shallower analysis; little room to grow into"
          />
        </div>
        <p className="t-meta cs-caption">
          Redrawn from my competitive audit. Neither product was wrong — they had each chosen an
          end of a trade-off, and the middle was empty.
        </p>
      </Section>

      {/* ── 04 What I learned ────────────────────────────────────── */}
      <Section n="04" title="What I learned">
        <Body>
          <p>
            Public forums came first — people describing, unprompted, the schemes they were subject
            to at work. The complaints sorted into three.
          </p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card n="01" title="Praise with nothing behind it">
            Where a quota drives it, thanks arrives unearned and lands as noise. Nothing attached,
            nothing specific, no reason to believe it.
          </Card>
          <Card n="02" title="Rules nobody can see">
            When the bar for being recognised is unstated, the result looks like favouritism to
            whoever misses out — and like luck to whoever does not.
          </Card>
          <Card n="03" title="Gestures that miss the room">
            What flatters one team embarrasses another. The same public praise plays differently
            depending on where it lands.
          </Card>
        </div>

        <Statement>Every one of those voices came from the same rung of the ladder.</Statement>
        <Body>
          <p>
            All of it was written by people on the receiving end. Nobody funding a programme,
            approving it or being asked to run it week to week had said a word — and those are the
            people who determine whether recognition happens at all. I went and spoke to them.
          </p>
          <p>What they added did not overlap with the forums at any point.</p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card title="No way to justify the spend">
            Leadership could not connect what recognition cost to anything it produced. A budget you
            cannot defend is a budget that eventually goes.
          </Card>
          <Card title="A chore for the people running it">
            For a manager, recognising a team was slow and inflexible enough that it became one more
            obligation rather than something they reached for.
          </Card>
          <Card title="Products that overreach">
            Several tools tried to absorb the HR stack entirely. The result was confusion at rollout
            and quiet abandonment afterwards.
          </Card>
        </div>

        <Statement>Three audiences had been handed one interface and told to share.</Statement>
      </Section>

      {/* ── 05 Defining the product ──────────────────────────────── */}
      <Section n="05" title="Defining the product">
        <Body>
          <p>
            The interviews settled into three positions. They are not demographics — each one wants
            something different from the same feature, and any of them can kill the programme.
          </p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card title="Whoever pays for it">
            Executives and HR leadership. Judge the programme on evidence, need cost to stay
            predictable as headcount grows, and want one standard applied across departments that
            do not resemble each other.
          </Card>
          <Card title="Whoever runs it">
            Team and department leads. Carry the programme day to day, want it shaped to how their
            own team works, and abandon it the moment it costs them time.
          </Card>
          <Card title="Whoever receives it">
            Early-career staff. Want the specific thing they did acknowledged, and want it visible
            to the people who make decisions about them.
          </Card>
        </div>

        <Statement>
          Recognition had to bend to each company&rsquo;s culture, sit in the hands of managers, and
          still return a number to the people paying for it.
        </Statement>
        <Body>
          <p>Which left three problems the product had to answer to.</p>
        </Body>

        <div className="cs-cards cs-cards-3">
          <Card n="01" title="Nothing to point at">
            Spending is untraceable, so the programme is defended on faith and cut on instinct.
          </Card>
          <Card n="02" title="Rewarding the routine">
            Recognition attached to attendance rather than achievement teaches people to discount
            it.
          </Card>
          <Card n="03" title="Too stiff to use">
            Every act of recognition costs the manager more effort than the moment is worth.
          </Card>
        </div>

        <div className="cs-split">
          <div className="cs-list">
            <span className="t-label">What would count as working</span>
            <ol>
              <li>People believe the recognition they receive.</li>
              <li>A team can set recognition to its own goals rather than inherit a default.</li>
              <li>Leadership can tie what was spent to what changed.</li>
              <li>It survives being rolled out to departments that work differently.</li>
            </ol>
          </div>
          <div className="cs-list">
            <span className="t-label">What we were working against</span>
            <ol>
              <li>Ten weeks to a shippable MVP, so scope had to be argued down early.</li>
              <li>No feature bloat — the exact failure we had just documented in a competitor.</li>
              <li>Configurability that does not arrive as a wall of settings.</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* ── 06 Exploring the solution ────────────────────────────── */}
      <Section n="06" title="Exploring the solution">
        <Body>
          <p>
            I took each problem, wrote down where things stood against where they needed to be, and
            listed what would have to exist to close the distance. It produced far more than ten
            weeks could hold, so everything went onto an effort-against-impact plot and most of it
            came off again.
          </p>
        </Body>

        <div className="cs-split cs-split-3">
          <div className="cs-list">
            <span className="t-label">Kept — the spine</span>
            <ol>
              <li>The appreciations feed</li>
              <li>A rewards library</li>
              <li>The organisation database</li>
              <li>Appreciation analytics</li>
            </ol>
          </div>
          <div className="cs-list">
            <span className="t-label">Deferred — real, but not yet</span>
            <ol>
              <li>Insight-to-action prompts</li>
              <li>Pulse surveys</li>
              <li>Scheduled campaigns</li>
              <li>Peer nominations</li>
            </ol>
          </div>
          <div className="cs-list">
            <span className="t-label">Dropped — not this product</span>
            <ol>
              <li>Wellness tracking</li>
              <li>Video appreciations</li>
            </ol>
          </div>
        </div>
        <p className="t-meta cs-caption">
          The deferred column mattered more than the kept one. Each item there was defensible, and
          shipping all of them is how the incumbents arrived at the weight we were trying to avoid.
        </p>
      </Section>

      {/* ── 07 Key design decisions ──────────────────────────────── */}
      <Section n="07" title="Key design decisions">
        <div className="cs-decisions">
          <div className="cs-decision">
            <span className="t-label">Decision 01</span>
            <h3 className="cs-decision-title">Stop designing one screen for three jobs</h3>
            <div className="cs-decision-grid">
              <div>
                <span className="t-label">Why</span>
                <p className="cs-card-body">
                  With the feature list settled, it was obvious that nothing sensible could hold an
                  executive allocating money, a lead running a team and someone receiving a thank
                  you. Trying to is how a product ends up feature-heavy without ever feeling
                  capable.
                </p>
              </div>
              <div>
                <span className="t-label">Result</span>
                <p className="cs-card-body">
                  Permission became the organising idea rather than a settings page. Every feature
                  was reduced to a verb per level of the hierarchy, and each level got a workspace
                  containing only what it can act on.
                </p>
              </div>
            </div>

            <div className="cs-table cs-table-4">
              <div className="cs-row cs-row-head">
                <span className="t-label">&nbsp;</span>
                <span className="t-label">Admin</span>
                <span className="t-label">Lead</span>
                <span className="t-label">Employee</span>
              </div>
              <div className="cs-row">
                <span className="t-label">Appreciations</span>
                <span className="cs-row-v">Send, receive</span>
                <span className="cs-row-v">Send, receive</span>
                <span className="cs-row-v">Receive</span>
              </div>
              <div className="cs-row">
                <span className="t-label">Budget</span>
                <span className="cs-row-v">Allocate</span>
                <span className="cs-row-v">Request</span>
                <span className="cs-row-v">—</span>
              </div>
              <div className="cs-row">
                <span className="t-label">Policy</span>
                <span className="cs-row-v">Manage</span>
                <span className="cs-row-v">Manage</span>
                <span className="cs-row-v">View</span>
              </div>
              <div className="cs-row">
                <span className="t-label">Analytics</span>
                <span className="cs-row-v">Whole org</span>
                <span className="cs-row-v">Their team</span>
                <span className="cs-row-v">Their own</span>
              </div>
            </div>
            <p className="t-meta cs-caption">
              Four rows from the mapping. Budget is the clearest case: the same feature is a
              decision, a request, or absent, depending on who is looking.
            </p>
          </div>

          <div className="cs-decision">
            <span className="t-label">Decision 02</span>
            <h3 className="cs-decision-title">Give the thank you a value</h3>
            <div className="cs-decision-grid">
              <div>
                <span className="t-label">Why</span>
                <p className="cs-card-body">
                  Both halves of the research landed in the same place: symbolic praise is
                  discounted, and people here would rather have something they can spend than
                  another milestone badge.
                </p>
              </div>
              <div>
                <span className="t-label">Result</span>
                <p className="cs-card-body">
                  Points that redeem against real vouchers, with badges kept for standing rather
                  than as the reward itself. An appreciation now costs the sender something and is
                  worth something to the receiver.
                </p>
              </div>
            </div>
          </div>

          <div className="cs-decision">
            <span className="t-label">Decision 03</span>
            <h3 className="cs-decision-title">Borrow the interface layer</h3>
            <div className="cs-decision-grid">
              <div>
                <span className="t-label">Why</span>
                <p className="cs-card-body">
                  Ten weeks. Any of it spent deciding a button&rsquo;s resting state is time taken
                  from the hierarchy problem, which was the part nobody else had solved.
                </p>
              </div>
              <div>
                <span className="t-label">Result</span>
                <p className="cs-card-body">
                  An open-source system adopted wholesale, then bent where it fought us: a warmer
                  typeface in place of its default, and bespoke tables, reward cards and navigation
                  it had no equivalent for.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 08 After review ──────────────────────────────────────── */}
      <Section n="08" title="What review changed">
        <Body>
          <p>
            The core screens went to the client as a working build, ahead of the supporting ones, to
            be used and picked apart. The hierarchy held. The reward mechanics held. Three things
            did not, and all three were structural.
          </p>
        </Body>

        <div className="cs-changes">
          <div className="cs-change">
            <span className="t-label">Change 01</span>
            <h3 className="cs-change-title">Two decisions were sharing one engine</h3>
            <p className="cs-card-body">
              Policy and budget are related, so we had built them as one thing. In use they are not
              one thing: setting the rule for what earns recognition and approving the money to pay
              for it are different judgements, made by different people, on different timescales.
              Admins kept conflating them. We pulled them apart and gave budget its own surface,
              with allocation, requests and utilisation in one place.
            </p>
          </div>

          <div className="cs-change">
            <span className="t-label">Change 02</span>
            <h3 className="cs-change-title">The numbers were scattered on purpose, and it backfired</h3>
            <p className="cs-card-body">
              Putting each metric beside the thing it described was meant to make local decisions
              easy, and it did. What it made impossible was judging the programme as a whole — which
              was the one thing the people paying for it needed. A single analytics view was added,
              and the local figures stayed where they were already earning their place.
            </p>
          </div>

          <div className="cs-change">
            <span className="t-label">Change 03</span>
            <h3 className="cs-change-title">It carried itself like an admin console</h3>
            <p className="cs-card-body">
              The interface, and the side rail in particular, read as procedural. On most B2B
              products that is fine. On one whose entire purpose is morale, a tone that says
              paperwork is a functional defect, so navigation moved to the top and the product
              stopped apologising for having colour in it.
            </p>
          </div>
        </div>
      </Section>

      {/* ── 09 The final product ─────────────────────────────────── */}
      <Section n="09" title="The final product">
        <Statement>Built around the organisation, not only around the employee.</Statement>

        <div className="cs-screens">
          <Screen
            src="/images/incentiwise/02-feed.png"
            alt="Incentiwise activity feed with an appreciation composer, points balance and leaderboard"
            title="The feed"
            note="An employee's entire product. Send something, see what has been recognised, and see what it was worth."
          />
          <Screen
            src="/images/incentiwise/03-send-appreciation.png"
            alt="Composing an appreciation with value tags and an attached reward"
            title="Sending"
            note="Tags carry the reason and a reward can ride along, so the message says what happened rather than thank you."
          />
          <Screen
            src="/images/incentiwise/05-rewards-catalog.png"
            alt="Rewards catalogue of redeemable vouchers"
            title="Rewards"
            note="Points spend against things that exist off the platform. This is the answer to praise with nothing behind it."
          />
          <Screen
            src="/images/incentiwise/15-culture.png"
            alt="Culture screen showing budget allocated across departments with pending approval requests"
            title="Budget"
            note="The surface that came out of review. Allocation, requests and utilisation per department, separate from policy."
          />
          <Screen
            src="/images/incentiwise/13-admins.png"
            alt="Administration screen assigning rights per person and department"
            title="Administration"
            note="The hierarchy made editable — who holds which rights, over which part of the organisation."
          />
          <Screen
            src="/images/incentiwise/12-member-detail.png"
            alt="A member profile showing points earned, badges held and transaction history"
            title="A person"
            note="Earned, held and spent in one view. This is where someone checks whether their work is visible."
          />
        </div>
      </Section>

      {/* ── 10 Reflection ────────────────────────────────────────── */}
      <Section n="10" title="Reflection">
        <div className="cs-cards cs-cards-3">
          <Card n="01" title="The brief was smaller than the problem">
            I was asked for a way to say thank you. The work turned out to be the permissions,
            budgets and rules that decide whether thank you is ever said — and that is the part with
            no competition in it.
          </Card>
          <Card n="02" title="I had only heard from one side">
            The loudest research was the easiest to find, and it was all from people the programme
            happened to. The half that changed the product came from the people who fund and run it.
          </Card>
          <Card n="03" title="The wins were rearrangements">
            Splitting policy from budget, collecting the analytics, dividing one interface into
            three. Nothing new was added in any of them.
          </Card>
        </div>
      </Section>
    </div>
  )
}
