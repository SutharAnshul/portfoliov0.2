import { Settle } from '@/components/Settle'

/**
 * Incentiwise, told in spreads.
 *
 * One idea to a screen. Each spread holds a single claim, set large enough to
 * land before anything else on it, with whatever evidence that claim needs in
 * small type underneath. Nothing is numbered and nothing is ruled off — a
 * spread ends because the next one begins a screen later, which the eye reads
 * as a break without being told.
 *
 * Two things carry the hierarchy, because the only images here are the product:
 * the distance between a 56px serif claim and a 15px monospace note, and a
 * five-colour pill system that says what kind of thing you are looking at
 * before you read a word of it. Lime is what shipped, amber is what was held
 * back, rose is what hurt, cyan is a question, violet is a decision. The colour
 * is never the only signal — the pill's word always says the same thing.
 *
 * Nothing from the source deck: not its artwork, not its sentences. Only what
 * happened, and only what was recorded — no adoption numbers, no engagement
 * lift, no test scores, because the project produced none.
 */

type Tone = 'lime' | 'amber' | 'rose' | 'cyan' | 'violet' | 'plain'

/** One screen, one idea. Vertically centred so the claim sits at eye level. */
function Spread({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <Settle mass="light">
      <section className={`spread${tall ? ' spread-tall' : ''}`}>{children}</section>
    </Settle>
  )
}

/** The claim. Sized to be read first, and to work without a heading above it. */
function Say({ children }: { children: React.ReactNode }) {
  return <p className="say">{children}</p>
}

/** A quieter claim, for spreads whose evidence needs the room. */
function Mid({ children }: { children: React.ReactNode }) {
  return <p className="say say-mid">{children}</p>
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="note">{children}</p>
}

function Pill({
  tone = 'plain',
  solid,
  children,
}: {
  tone?: Tone
  solid?: boolean
  children: React.ReactNode
}) {
  return <span className={`pil pil-${tone}${solid ? ' pil-solid' : ''}`}>{children}</span>
}

/** A row of pills, used where a spread needs a heading it does not deserve. */
function Pills({ children }: { children: React.ReactNode }) {
  return <div className="pils">{children}</div>
}

function Card({
  tag,
  tone = 'plain',
  title,
  children,
}: {
  tag?: string
  tone?: Tone
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={`c c-${tone}`}>
      {tag && <Pill tone={tone}>{tag}</Pill>}
      <h3 className="c-t">{title}</h3>
      <p className="c-b">{children}</p>
    </div>
  )
}

function Screen({ src, alt, title, note }: { src: string; alt: string; title: string; note: string }) {
  return (
    <figure className="shot-plain">
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>
        <h3 className="c-t">{title}</h3>
        <p className="note">{note}</p>
      </figcaption>
    </figure>
  )
}

export function IncentiwiseStory() {
  return (
    <div className="cs">
      {/* 1 — what it is */}
      <Spread>
        <Pills>
          <Pill tone="lime" solid>
            Rewards &amp; recognition
          </Pill>
          <Pill tone="plain">Indian SMEs</Pill>
          <Pill tone="plain">Ten weeks</Pill>
        </Pills>
        <Say>
          Asked for a way to say thank you. Built the machinery that decides whether thank you ever
          gets said.
        </Say>
      </Spread>

      {/* 2 — the problem */}
      <Spread>
        <Pills>
          <Pill tone="rose">The brief</Pill>
        </Pills>
        <Say>Tools that thrive elsewhere go flat here.</Say>
        <Note>
          The client had watched the category leaders fail to move morale in companies like the ones
          they knew. That was a hunch, not a finding. I went to check it.
        </Note>
      </Spread>

      {/* 3 — the questions */}
      <Spread>
        <Pills>
          <Pill tone="cyan">Three questions</Pill>
        </Pills>
        <ol className="asks">
          <li>
            <span className="ask-n">01</span>
            <span>What do the incumbents actually do?</span>
          </li>
          <li>
            <span className="ask-n">02</span>
            <span>What do people say when nobody is asking?</span>
          </li>
          <li>
            <span className="ask-n">03</span>
            <span>Who decides whether recognition happens at all?</span>
          </li>
        </ol>
      </Spread>

      {/* 4 — the competitors */}
      <Spread>
        <Pills>
          <Pill tone="cyan">Two market leaders, worked directly</Pill>
        </Pills>
        <div className="tbl">
          <div className="tr th">
            <span />
            <span>
              <Pill tone="violet">Comprehensive</Pill>
            </span>
            <span>
              <Pill tone="violet">Focused</Pill>
            </span>
          </div>
          <div className="tr">
            <span className="t-label">Built for</span>
            <span>Large organisations</span>
            <span>Small teams, founders</span>
          </div>
          <div className="tr">
            <span className="t-label">Bet</span>
            <span>Everything, in one place</span>
            <span>One thing, done narrowly</span>
          </div>
          <div className="tr">
            <span className="t-label">Strain</span>
            <span>Heavy to learn; measures engagement, not return</span>
            <span>Thin integrations; nothing to grow into</span>
          </div>
        </div>
        <Note>Each had taken an end of the trade-off. Nobody held the middle.</Note>
      </Spread>

      {/* 5 — the forums */}
      <Spread>
        <Pills>
          <Pill tone="cyan">Unprompted, in public</Pill>
        </Pills>
        <Mid>Three complaints, over and over.</Mid>
        <div className="cards c3">
          <Card tone="rose" tag="Hollow" title="Praise with nothing behind it">
            Quota-driven thanks arrives unearned and lands as noise.
          </Card>
          <Card tone="rose" tag="Opaque" title="Rules nobody can see">
            An unstated bar looks like favouritism to whoever misses it.
          </Card>
          <Card tone="rose" tag="Misjudged" title="Gestures that miss the room">
            The same public praise flatters one team and embarrasses another.
          </Card>
        </div>
      </Spread>

      {/* 6 — the turn */}
      <Spread>
        <Say>All of it came from one rung of the ladder.</Say>
        <Note>
          Nobody who funds a programme, approves it or runs it weekly had said a word. So I asked
          them, and none of it overlapped.
        </Note>
        <div className="cards c3">
          <Card tone="amber" tag="Buyer" title="Nothing to justify the spend">
            Cost could not be tied to anything it produced.
          </Card>
          <Card tone="amber" tag="Operator" title="A chore to run">
            Slow enough that managers quietly stopped.
          </Card>
          <Card tone="amber" tag="Both" title="Tools that overreach">
            Swallowing the HR stack bought confusion, then abandonment.
          </Card>
        </div>
      </Spread>

      {/* 7 — the definition */}
      <Spread>
        <Say>Three audiences. One interface. That was the whole problem.</Say>
        <div className="cards c3">
          <Card tone="violet" tag="Pays for it" title="Evidence">
            Wants proof it works, and a bill that stays predictable.
          </Card>
          <Card tone="violet" tag="Runs it" title="Speed">
            Wants it shaped to their team, and wants it now.
          </Card>
          <Card tone="violet" tag="Receives it" title="Specificity">
            Wants the particular thing seen by the people who decide.
          </Card>
        </div>
      </Spread>

      {/* 8 — the cuts */}
      <Spread>
        <Pills>
          <Pill tone="plain">Ten weeks to a shippable MVP</Pill>
        </Pills>
        <div className="cuts">
          <div className="cut cut-lime">
            <Pill tone="lime" solid>
              Kept
            </Pill>
            <ul>
              <li>Appreciations feed</li>
              <li>Rewards library</li>
              <li>Organisation database</li>
              <li>Appreciation analytics</li>
            </ul>
          </div>
          <div className="cut cut-amber">
            <Pill tone="amber" solid>
              Deferred
            </Pill>
            <ul>
              <li>Insight-to-action prompts</li>
              <li>Pulse surveys</li>
              <li>Scheduled campaigns</li>
              <li>Peer nominations</li>
            </ul>
          </div>
          <div className="cut cut-rose">
            <Pill tone="rose" solid>
              Dropped
            </Pill>
            <ul>
              <li>Wellness tracking</li>
              <li>Video appreciations</li>
            </ul>
          </div>
        </div>
        <Note>
          The amber column was the hard one. Every item in it was defensible, and shipping all of
          them is how you become the incumbent you are replacing.
        </Note>
      </Spread>

      {/* 9 — the decision */}
      <Spread>
        <Pills>
          <Pill tone="violet">Decision</Pill>
        </Pills>
        <Say>Permission became the structure, not a settings page.</Say>
        <div className="tbl tbl-4">
          <div className="tr th">
            <span />
            <span>
              <Pill tone="violet">Admin</Pill>
            </span>
            <span>
              <Pill tone="cyan">Lead</Pill>
            </span>
            <span>
              <Pill tone="lime">Employee</Pill>
            </span>
          </div>
          <div className="tr">
            <span className="t-label">Appreciations</span>
            <span>Send, receive</span>
            <span>Send, receive</span>
            <span>Receive</span>
          </div>
          <div className="tr">
            <span className="t-label">Budget</span>
            <span>Allocate</span>
            <span>Request</span>
            <span className="nil">—</span>
          </div>
          <div className="tr">
            <span className="t-label">Policy</span>
            <span>Manage</span>
            <span>Manage</span>
            <span>View</span>
          </div>
          <div className="tr">
            <span className="t-label">Analytics</span>
            <span>Whole org</span>
            <span>Their team</span>
            <span>Their own</span>
          </div>
        </div>
        <Note>Budget is the clearest case: a decision, a request, or nothing at all.</Note>
      </Spread>

      {/* 10 — the other two decisions */}
      <Spread>
        <div className="cards c2">
          <Card tone="violet" tag="Decision" title="Give the thank you a value">
            Points that redeem against real vouchers. Badges kept for standing, not used as the
            prize — symbolic praise was the complaint we started from.
          </Card>
          <Card tone="violet" tag="Decision" title="Borrow the interface layer">
            An open-source system adopted whole, then warmed: a friendlier typeface, and the tables
            and reward cards it had no answer for. Ten weeks does not buy a button.
          </Card>
        </div>
      </Spread>

      {/* 11 — review */}
      <Spread>
        <Pills>
          <Pill tone="amber">Shipped to the client, then picked apart</Pill>
        </Pills>
        <Mid>The hierarchy held. Three things did not.</Mid>
        <div className="cards c3">
          <Card tone="lime" tag="Split" title="Policy and budget shared an engine">
            Related, but different judgements by different people. Budget got its own surface.
          </Card>
          <Card tone="lime" tag="Collected" title="Analytics sat beside what they measured">
            Good for one decision, useless for judging the programme. Pulled into one view.
          </Card>
          <Card tone="lime" tag="Warmed" title="It read like an admin console">
            On a product whose job is morale, tone is a functional defect. Navigation moved up, and
            colour was allowed back.
          </Card>
        </div>
      </Spread>

      {/* 12 — the product */}
      <Spread tall>
        <Pills>
          <Pill tone="lime" solid>
            Shipped
          </Pill>
        </Pills>
        <Say>Built around the organisation, not only the employee.</Say>
        <div className="shots">
          <Screen
            src="/images/incentiwise/02-feed.png"
            alt="Incentiwise activity feed with appreciation composer, points balance and leaderboard"
            title="The feed"
            note="An employee's whole product: send, see, and see what it was worth."
          />
          <Screen
            src="/images/incentiwise/03-send-appreciation.png"
            alt="Composing an appreciation with value tags and an attached reward"
            title="Sending"
            note="Tags carry the reason, a reward rides along. Specific, not routine."
          />
          <Screen
            src="/images/incentiwise/05-rewards-catalog.png"
            alt="Rewards catalogue of redeemable vouchers"
            title="Rewards"
            note="Points spend on things that exist off the platform."
          />
          <Screen
            src="/images/incentiwise/15-culture.png"
            alt="Budget allocated across departments with pending approval requests"
            title="Budget"
            note="What review produced. Allocation, requests, utilisation — apart from policy."
          />
          <Screen
            src="/images/incentiwise/13-admins.png"
            alt="Administration screen assigning rights per person and department"
            title="Administration"
            note="The hierarchy, made editable."
          />
          <Screen
            src="/images/incentiwise/12-member-detail.png"
            alt="A member profile showing points earned, badges held and history"
            title="A person"
            note="Where someone checks whether their work is visible."
          />
        </div>
      </Spread>

      {/* 13 — reflection */}
      <Spread>
        <Mid>What I took from it.</Mid>
        <div className="cards c3">
          <Card tone="cyan" tag="Scope" title="The brief was smaller than the problem">
            Asked for a thank you. The work was the permissions and budgets that decide if one
            happens.
          </Card>
          <Card tone="cyan" tag="Research" title="I had only heard from one side">
            The easiest evidence to find came entirely from people it happened to.
          </Card>
          <Card tone="cyan" tag="Craft" title="The wins were rearrangements">
            Split, collect, divide. Nothing new was added in any of them.
          </Card>
        </div>
      </Spread>
    </div>
  )
}
