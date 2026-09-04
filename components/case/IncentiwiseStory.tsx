import { Settle } from '@/components/Settle'

/**
 * Incentiwise, told as a story rather than a report.
 *
 * The shape is context → tension → resolution, and the page is built so you
 * can feel which of the three you are in without being told.
 *
 * Context is quiet: small type, a lot of air, one ruled table. Tension is
 * loud and crowded — overheard complaints at three different sizes, then the
 * reversal alone on a screen with nothing to read but itself. Resolution is
 * ordered: a number, a table, numbered steps, then the screens.
 *
 * Every beat gets its own layout. That is the point — thirteen spreads built
 * from one template read as a form, however carefully the type is set, and the
 * eye stops looking. A layout that changes is a layout that keeps being read.
 *
 * The claims are written to hand off: each one ends pointing at the next, so
 * the argument moves on "but" and "therefore" rather than "and then". The
 * closing line is the opening line turned over, which is the only ornament
 * here that exists purely because it is satisfying.
 *
 * Nothing from the source deck: not its artwork, not its sentences. Only what
 * happened, and only what was recorded — no adoption numbers, no engagement
 * lift, no test scores, because the project produced none.
 */

type Tone = 'lime' | 'amber' | 'rose' | 'cyan' | 'violet' | 'plain'

/**
 * One beat. `air` is for the three reversals, which need a screen to
 * themselves; `flow` is for the beats that are a sequence and should not
 * pretend to be centred on anything.
 */
function Beat({
  children,
  act,
  side,
  air,
  flow,
}: {
  children: React.ReactNode
  /**
   * Which act this belongs to. Sets the temperature of the light behind it:
   * cool while the ground is laid, hot through the complaints, cool again
   * while it gets built, one amber flare at the setback, lime once it ships.
   */
  act: 'ctx' | 'ten' | 'res' | 'set' | 'ship'
  /**
   * Which side the wash sits on. Passed rather than derived: Settle wraps
   * every section in its own div, so each one is an only child and
   * :nth-of-type can never see its neighbours.
   */
  side?: 'r'
  air?: boolean
  flow?: boolean
}) {
  return (
    <Settle mass="light">
      <section
        className={`beat beat-${act}${side === 'r' ? ' beat-r' : ''}${air ? ' beat-air' : ''}${flow ? ' beat-flow' : ''}`}
      >
        {children}
      </section>
    </Settle>
  )
}

function Say({ children }: { children: React.ReactNode }) {
  return <p className="say">{children}</p>
}

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

/** A row of pills, where a beat needs a heading it does not deserve. */
function Pills({ children }: { children: React.ReactNode }) {
  return <div className="pils">{children}</div>
}

export function IncentiwiseStory() {
  return (
    <div className="cs">
      {/* ═══ Context ═════════════════════════════════════════════════
          Quiet and factual. Nothing here is coloured except one pill, so
          that the noise three beats later actually reads as noise. */}

      {/* The ask, and a promise that it was wrong. */}
      <Beat act="ctx" air>
        <Say>The brief was an employee rewards app.</Say>
        <Note>It took two weeks of research to establish that this was the wrong brief.</Note>
      </Beat>

      {/* Why anyone thought there was an opening. */}
      <Beat act="ctx" side="r">
        <p className="lead">
          Two platforms dominate this category worldwide. The client had watched both of them fail
          to shift anything at the Indian companies they knew, and wanted to know why.
        </p>
        <Mid>A hunch, then. Worth testing before drawing a single screen.</Mid>
      </Beat>

      {/* The audit. A table because it is evidence, not argument. */}
      <Beat act="ctx">
        <Note>So I used both of them properly, for a fortnight, as a paying customer would.</Note>
        <div className="tbl">
          <div className="tr th">
            <span />
            <span>
              <Pill tone="cyan">The comprehensive one</Pill>
            </span>
            <span>
              <Pill tone="cyan">The focused one</Pill>
            </span>
          </div>
          <div className="tr">
            <span className="t-label">Built for</span>
            <span>Large organisations</span>
            <span>Small teams and founders</span>
          </div>
          <div className="tr">
            <span className="t-label">The bet</span>
            <span>Everything, in one place</span>
            <span>One thing, done narrowly</span>
          </div>
          <div className="tr">
            <span className="t-label">The cost</span>
            <span>Weeks to learn; measures engagement, never return</span>
            <span>Thin integrations; nothing to grow into</span>
          </div>
        </div>
        <Mid>One is too heavy to learn. The other has nothing to grow into.</Mid>
        <Note>Which explained the software. It said nothing at all about the people using it.</Note>
      </Beat>

      {/* ═══ Tension ═════════════════════════════════════════════════
          Crowded, hot, and deliberately harder to read cleanly. */}

      {/* The chorus. Three sizes, staggered, because they were overheard. */}
      <Beat act="ten" side="r">
        <Pills>
          <Pill tone="rose">Public forums, unprompted</Pill>
        </Pills>
        <div className="chorus">
          <p className="voice v1">“Thanks with nothing behind it.”</p>
          <p className="voice v2">“A bar nobody can see.”</p>
          <p className="voice v3">“Praise that lands wrong in the room.”</p>
        </div>
        <Note>
          Hundreds of posts about recognition software, and they collapsed into those three
          complaints.
        </Note>
      </Beat>

      {/* The reversal. Nothing else on the screen. */}
      <Beat act="ten" air>
        <Say>Every last one of them was an employee.</Say>
        <Note>
          Nobody who funds a programme, approves it, or runs it week to week had said a word.
        </Note>
      </Beat>

      {/* So I asked them. A roster — four voices, one line each. */}
      <Beat act="ten" side="r">
        <Note>So I went and found the other three.</Note>
        <dl className="roster">
          <div>
            <dt>
              <Pill tone="lime">Employee</Pill>
            </dt>
            <dd>To be seen for the particular thing they did.</dd>
          </div>
          <div>
            <dt>
              <Pill tone="cyan">Team lead</Pill>
            </dt>
            <dd>To recognise someone today, not at the next review.</dd>
          </div>
          <div>
            <dt>
              <Pill tone="amber">Operator</Pill>
            </dt>
            <dd>A programme that is not a weekly chore to keep alive.</dd>
          </div>
          <div>
            <dt>
              <Pill tone="violet">Founder</Pill>
            </dt>
            <dd>Evidence the spend does something, and a bill that holds still.</dd>
          </div>
        </dl>
        <Mid>No two of them wanted the same thing.</Mid>
      </Beat>

      {/* The thesis. The second reversal, and the hinge of the whole page. */}
      <Beat act="ten" air>
        <Say>Four people, one screen, nothing they agree on.</Say>
        <Note>
          The product was never the thank you. It was who may spend, who must approve, and who gets
          to see any of it.
        </Note>
      </Beat>

      {/* ═══ Resolution ══════════════════════════════════════════════
          Ordered and cool. A number, a table, numbered steps, screens. */}

      {/* The constraint, sized like the constraint it was. */}
      <Beat act="res" side="r">
        <div className="count">
          <span className="count-n">10</span>
          <span className="count-l">weeks to something shippable</span>
        </div>
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
          The amber column was the hard one. Every item in it answered a real need — and shipping
          all of them is precisely how the heavy platform got heavy.
        </Note>
      </Beat>

      {/* Decision one, which is the thesis made structural. */}
      <Beat act="res">
        <Mid>Permission stopped being a settings page and became the layout.</Mid>
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
        <Note>Budget makes it plainest: a decision, a request, or nothing at all.</Note>
      </Beat>

      {/* Decisions two and three, as steps rather than cards. */}
      <Beat act="res" side="r" flow>
        <ol className="steps">
          <li>
            <span className="step-n">02</span>
            <div>
              <h3 className="step-t">Points, not applause.</h3>
              <p className="step-b">
                Redeemable against real vouchers. Badges kept for standing and never used as the
                prize, because hollow praise was the complaint we started from.
              </p>
            </div>
          </li>
          <li>
            <span className="step-n">03</span>
            <div>
              <h3 className="step-t">Borrow the interface, then warm it.</h3>
              <p className="step-b">
                An open-source system taken whole, given a friendlier face and the two things it had
                no answer for: dense tables, and a reward that has to look worth having. Ten weeks
                does not buy a button.
              </p>
            </div>
          </li>
        </ol>
      </Beat>

      {/* The late setback. Short, blunt, and the last tension in the page. */}
      <Beat act="set">
        <Mid>Then the client took it apart.</Mid>
        <div className="fixes">
          <div className="fix">
            <p className="fix-a">Budget and policy shared one engine.</p>
            <p className="fix-b">
              Different judgements made by different people. Budget got its own surface.
            </p>
          </div>
          <div className="fix">
            <p className="fix-a">Analytics sat beside whatever they measured.</p>
            <p className="fix-b">
              Fine for one decision, useless for judging a programme. Collected into one view.
            </p>
          </div>
          <div className="fix">
            <p className="fix-a">It carried itself like an admin console.</p>
            <p className="fix-b">
              On a product whose job is morale, that is a functional defect. Navigation came up,
              colour came back.
            </p>
          </div>
        </div>
        <Note>Three rearrangements. Nothing new was added to build any of them.</Note>
      </Beat>

      {/* The product. */}
      <Beat act="ship" side="r" flow>
        <Pills>
          <Pill tone="lime" solid>
            Shipped
          </Pill>
        </Pills>
        <div className="shots">
          <figure className="shot-plain">
            <img
              src="/images/incentiwise/02-feed.png"
              alt="Incentiwise activity feed with appreciation composer, points balance and leaderboard"
              loading="lazy"
            />
            <figcaption>
              <h3 className="shot-t">The feed</h3>
              <p className="note">Send, see, and see what it was worth. An employee's whole product.</p>
            </figcaption>
          </figure>
          <figure className="shot-plain">
            <img
              src="/images/incentiwise/03-send-appreciation.png"
              alt="Composing an appreciation with value tags and an attached reward"
              loading="lazy"
            />
            <figcaption>
              <h3 className="shot-t">Sending</h3>
              <p className="note">Tags carry the reason and a reward rides along, so it cannot be routine.</p>
            </figcaption>
          </figure>
          <figure className="shot-plain">
            <img
              src="/images/incentiwise/05-rewards-catalog.png"
              alt="Rewards catalogue of redeemable vouchers"
              loading="lazy"
            />
            <figcaption>
              <h3 className="shot-t">Rewards</h3>
              <p className="note">Points spend on things that exist off the platform.</p>
            </figcaption>
          </figure>
          <figure className="shot-plain">
            <img
              src="/images/incentiwise/15-culture.png"
              alt="Budget allocated across departments with pending approval requests"
              loading="lazy"
            />
            <figcaption>
              <h3 className="shot-t">Budget</h3>
              <p className="note">What review produced: allocation, requests and utilisation, apart from policy.</p>
            </figcaption>
          </figure>
          <figure className="shot-plain">
            <img
              src="/images/incentiwise/13-admins.png"
              alt="Administration screen assigning rights per person and department"
              loading="lazy"
            />
            <figcaption>
              <h3 className="shot-t">Administration</h3>
              <p className="note">The table from four beats ago, made editable.</p>
            </figcaption>
          </figure>
          <figure className="shot-plain">
            <img
              src="/images/incentiwise/12-member-detail.png"
              alt="A member profile showing points earned, badges held and history"
              loading="lazy"
            />
            <figcaption>
              <h3 className="shot-t">A person</h3>
              <p className="note">Where someone goes to check whether their work is visible.</p>
            </figcaption>
          </figure>
        </div>
      </Beat>

      {/* The close: the opening line, turned over. */}
      <Beat act="ship" air>
        <Say>They asked for a thank you. What they needed was permission to give one.</Say>
        <ul className="ends">
          <li>The easiest research to find came entirely from one side of the problem.</li>
          <li>Every fix at review was a rearrangement, which is the cheapest kind of win.</li>
          <li>The brief was smaller than the problem, and I very nearly built the brief.</li>
        </ul>
      </Beat>
    </div>
  )
}
