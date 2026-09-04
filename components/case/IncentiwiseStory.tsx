import { Settle } from '@/components/Settle'

/**
 * Incentiwise, built on the spine of the deck rather than a copy of it.
 *
 * The deck's own best idea is its two tracks. A cyan-labelled step is a thing
 * that shipped; a red-labelled one on warm ground is a road not taken. Here
 * they alternate — every step is followed immediately by the version of it
 * that was rejected — so scrolling the page is scrolling through the argument,
 * and the reader passes physically in and out of the warm bands where the
 * product went wrong. It is the one device on the page doing three jobs at
 * once: sectioning, sequencing, and saying which of two things you are reading.
 *
 * The role colours are the deck's, sampled from the slides: indigo Admin, red
 * lead, amber employee. They are load-bearing rather than decorative, because
 * who may do what is what this product actually is — the same three pills mark
 * the feature map, the architecture and the head of every step.
 *
 * What is not carried over is the deck's writing. Every sentence here is new,
 * and the two diagrams — the feature map and the architecture — are redrawn as
 * markup rather than pasted as pictures, so they reflow, stay searchable and
 * can be read aloud. The screens, the portraits and the cover are the deck's
 * own, cropped out of the slides.
 */

/** The three access colours, used everywhere the question is "who". */
type Role = 'admin' | 'lead' | 'emp'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  lead: 'Dept / Team lead',
  emp: 'Employee',
}

function Pill({ role, children }: { role?: Role; children?: React.ReactNode }) {
  return <span className={`pil${role ? ` pil-${role}` : ''}`}>{children ?? ROLE_LABEL[role!]}</span>
}

/** Who a step is for. Sits at the head of the step, opposite its title. */
function Who({ roles }: { roles: Role[] }) {
  return (
    <div className="who">
      {roles.map((r) => (
        <Pill key={r} role={r} />
      ))}
    </div>
  )
}

/** The small square that marks access on the architecture tree. */
function Chip({ role }: { role: Role }) {
  return (
    <span className={`chip chip-${role}`}>
      <span className="sr-only">{ROLE_LABEL[role]}</span>
    </span>
  )
}

function Beat({
  children,
  air,
}: {
  children: React.ReactNode
  air?: boolean
}) {
  return (
    <Settle mass="light">
      <section className={`beat${air ? ' beat-air' : ''}`}>{children}</section>
    </Settle>
  )
}

/** A step that shipped. Cyan, on the page's own ground. */
function Step({
  n,
  title,
  roles,
  blurb,
  children,
}: {
  n: number
  title: string
  roles: Role[]
  blurb: string
  children: React.ReactNode
}) {
  return (
    <Settle mass="light">
      <section className="beat step">
        <header className="head">
          <div>
            <p className="eyebrow">
              Step {n} <span className="sep">·</span> {title}
            </p>
            <p className="blurb">{blurb}</p>
          </div>
          <Who roles={roles} />
        </header>
        {children}
      </section>
    </Settle>
  )
}

/**
 * A version that did not ship. Full-bleed warm ground, red label, and the
 * reasoning set beside the screen rather than under it — the argument is the
 * point here, and the screen is only the evidence for it.
 */
function Iteration({
  title,
  roles,
  children,
  shots,
}: {
  title: string
  roles?: Role[]
  children: React.ReactNode
  shots: React.ReactNode
}) {
  return (
    <Settle mass="light">
      <section className="beat iter">
        <div className="iter-in">
          <header className="head">
            <p className="eyebrow eyebrow-no">
              Iteration <span className="sep">·</span> not shipped
            </p>
            {roles && <Who roles={roles} />}
          </header>
          <div className="iter-body">
            <div className="iter-why">
              <h3 className="hmono">{title}</h3>
              {children}
            </div>
            <div className="iter-shots">{shots}</div>
          </div>
        </div>
      </section>
    </Settle>
  )
}

function Shot({ src, alt, cap }: { src: string; alt: string; cap?: string }) {
  return (
    <figure className="shot">
      <img src={`/images/incentiwise/story/${src}.png`} alt={alt} loading="lazy" />
      {cap && <figcaption className="cap">{cap}</figcaption>}
    </figure>
  )
}

/** One row of the feature map: what it is, then what each role may do with it. */
function Row({ f, a, l, e }: { f: string; a: string; l: string; e: string }) {
  return (
    <div className="mrow">
      <span className="mf">{f}</span>
      <span data-r="Admin">{a}</span>
      <span data-r="Dept / Team lead">{l}</span>
      <span data-r="Employee">{e === '—' ? <em className="nil">—</em> : e}</span>
    </div>
  )
}

/** A branch of the architecture: a section, its access, and what sits under it. */
function Branch({
  name,
  roles,
  leaves,
}: {
  name: string
  roles: Role[]
  leaves: { name: string; roles: Role[] }[]
}) {
  return (
    <div className="branch">
      <div className="node">
        <span className="node-n">{name}</span>
        <span className="chips">
          {roles.map((r) => (
            <Chip key={r} role={r} />
          ))}
        </span>
      </div>
      <ul className="leaves">
        {leaves.map((l) => (
          <li key={l.name}>
            <span>{l.name}</span>
            <span className="chips">
              {l.roles.map((r) => (
                <Chip key={r} role={r} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ALL: Role[] = ['admin', 'lead', 'emp']

export function IncentiwiseStory() {
  return (
    <div className="cs">
      {/* ── The thesis ─────────────────────────────────────────────── */}
      <Beat air>
        <div className="pils">
          <Pill>B2B product design</Pill>
          <Pill>HR tech</Pill>
        </div>
        <p className="say">
          A point is money. Which makes saying thank you a <em>spend</em>.
        </p>
        <p className="note">
          Colleagues award each other badges; every badge carries points, drawn from a pool someone
          funded and redeemable against real vouchers. The whole design problem is in that sentence.
          The gesture has to stay warm, and the ledger underneath it has to stay exact.
        </p>
      </Beat>

      {/* The three surfaces the product actually is, before any of it is
          explained. Bleeds the full width of the column: it is the only
          picture here doing a purely atmospheric job. */}
      <Settle mass="medium">
        <figure className="cover">
          <img
            src="/images/incentiwise/story/cover.png"
            alt="The Incentiwise feed, organisation and badges screens, shown in perspective"
          />
        </figure>
      </Settle>

      {/* ── Who is on it ───────────────────────────────────────────── */}
      <Beat>
        <p className="eyebrow">Four people</p>
        <p className="say say-mid">Only one of them is here to be thanked.</p>
        <div className="cast">
          <div className="who-card wc-admin">
            <img
              className="face"
              src="/images/incentiwise/story/p-admin.png"
              alt="Portrait used for the Admin persona"
              loading="lazy"
            />
            <Pill role="admin" />
            <p>
              Owns the programme. Funds the pool, builds the badges, brings people in, and signs off
              what the leads ask for.
            </p>
          </div>
          <div className="who-card wc-lead">
            <img
              className="face"
              src="/images/incentiwise/story/p-dept.png"
              alt="Portrait used for the Dept. head persona"
              loading="lazy"
            />
            <Pill role="lead">Dept. head</Pill>
            <p>
              Approves budget requests coming up from the leads, and answers for the culture of
              everything underneath.
            </p>
          </div>
          <div className="who-card wc-lead">
            <img
              className="face"
              src="/images/incentiwise/story/p-lead.png"
              alt="Portrait used for the Team lead persona"
              loading="lazy"
            />
            <Pill role="lead">Team lead</Pill>
            <p>
              Recognises their own team against a quarterly budget, and asks for more when it runs
              dry.
            </p>
          </div>
          <div className="who-card wc-emp">
            <img
              className="face"
              src="/images/incentiwise/story/p-emp.png"
              alt="Portrait used for the Employee persona"
              loading="lazy"
            />
            <Pill role="emp" />
            <p>Sends and receives appreciation. Collects badges, holds points, spends them.</p>
          </div>
        </div>
      </Beat>

      {/* ── The feature map ────────────────────────────────────────── */}
      <Beat>
        <p className="eyebrow">Platform access</p>
        <h2 className="hmono">Role-based feature mapping</h2>
        <div className="map">
          <div className="mrow mhead">
            <span />
            <span>
              <Pill role="admin" />
            </span>
            <span>
              <Pill role="lead" />
            </span>
            <span>
              <Pill role="emp" />
            </span>
          </div>
          <Row f="Appreciation" a="Send, view all" l="Send, receive, view team" e="Send, own" />
          <Row f="Reactions & comments" a="React, comment" l="React, comment" e="React, comment" />
          <Row f="Recognition flow" a="Send" l="Send" e="Send, receive" />
          <Row f="Collectibles & badges" a="Create, assign" l="Award to members" e="Earn, view" />
          <Row f="Custom rewards" a="Create, manage" l="Nominate, approve" e="Receive" />
          <Row f="Rewards library" a="Manage, curate" l="Recommend, redeem" e="Browse, redeem" />
          <Row f="Catalogue items" a="Add new" l="Create team-level" e="Redeem" />
          <Row f="Appreciation analytics" a="Org-level" l="Team metrics" e="Personal insights" />
          <Row f="Cost–benefit analytics" a="Budget utilisation" l="Dept / team spend" e="—" />
          <Row f="Recognition analytics" a="Org-wide trends" l="Dept / team distribution" e="Personal stats" />
          <Row f="Dashboards" a="All" l="Dept / team" e="Personal" />
        </div>
        <p className="note">
          Read across a row and it is one feature. Read down a column and it is a different product.
          Budget is the sharpest case: a decision, a request, or nothing at all.
        </p>
      </Beat>

      {/* ── The architecture ───────────────────────────────────────── */}
      <Beat>
        <p className="eyebrow">Structure</p>
        <h2 className="hmono">Information architecture</h2>
        <div className="legend">
          <span>
            <Chip role="admin" /> Admin
          </span>
          <span>
            <Chip role="lead" /> Dept / team lead
          </span>
          <span>
            <Chip role="emp" /> Employee
          </span>
        </div>
        <div className="tree">
          <Branch
            name="Feed"
            roles={ALL}
            leaves={[
              { name: 'Send appreciations', roles: ['admin', 'lead'] },
              { name: 'Redeem points', roles: ALL },
              { name: 'Leaderboard', roles: ALL },
            ]}
          />
          <Branch
            name="Rewards"
            roles={ALL}
            leaves={[
              { name: 'Overview', roles: ALL },
              { name: 'Catalogue', roles: ['admin', 'lead'] },
              { name: 'Badges', roles: ['admin', 'lead'] },
              { name: 'Transactions', roles: ['admin', 'lead'] },
            ]}
          />
          <Branch
            name="Organisation"
            roles={['admin', 'lead']}
            leaves={[
              { name: 'View org.', roles: ['lead', 'emp'] },
              { name: 'People', roles: ['admin'] },
              { name: 'Teams', roles: ['admin'] },
              { name: 'Departments', roles: ['admin'] },
              { name: 'Admins', roles: ['admin'] },
              { name: 'Import', roles: ['admin'] },
            ]}
          />
          <Branch
            name="Culture"
            roles={['admin', 'lead']}
            leaves={[
              { name: 'Overview', roles: ['admin', 'lead'] },
              { name: 'Budget', roles: ['admin', 'lead'] },
              { name: 'Transactions', roles: ['admin'] },
            ]}
          />
        </div>
        <p className="note">
          Nothing is hidden behind a settings page. What you can reach is what you are.
        </p>
      </Beat>

      {/* ── The walkthrough ────────────────────────────────────────── */}
      <Beat air>
        <p className="eyebrow">How it works</p>
        <p className="say">
          <span className="dim">A recognition programme, running in</span> four steps.
        </p>
        <p className="note">Each one followed by the version of it that did not survive.</p>
      </Beat>

      <Step
        n={1}
        title="Log in"
        roles={ALL}
        blurb="A registered ID, or the workspace the company already lives in."
      >
        <Shot
          src="login"
          alt="Incentiwise sign-in with email and password, plus Google Workspace and Microsoft Teams options"
          cap="Password reset runs in the same panel rather than a separate page — it is the one flow people hit on day one."
        />
      </Step>

      <Iteration
        title="Role tiles before sign-in"
        roles={ALL}
        shots={
          <Shot
            src="it-role-tiles"
            alt="A rejected screen asking the user to pick Admin, Department head, Team lead or Employee before signing in"
          />
        }
      >
        <p>
          Asking who you are before you have signed in makes one product read as four. It also
          invites optimism — people chose the most senior tile that looked plausible, then met a
          permission wall on the very next screen.
        </p>
        <p>Your role is a fact about your account. It was never a question worth asking.</p>
      </Iteration>

      <Step
        n={2}
        title="Import and onboard"
        roles={['admin']}
        blurb="The whole organisation in one pass: upload a sheet, map the columns, confirm what will be created."
      >
        <div className="pair">
          <Shot
            src="import-start"
            alt="An empty Organisation screen alongside the bulk import panel with column mapping"
            cap="An empty state that says what to do next, and a mapper that does not assume your spreadsheet matches ours."
          />
          <Shot
            src="import-confirm"
            alt="Confirm import listing sixteen people with new, existing and error rows"
            cap="Every row is shown before anything is written, including the ones that will fail and why."
          />
        </div>
        <Shot
          src="org-teams"
          alt="Organisation teams view showing rewards given, budget used and redemption ratio per team"
          cap="What the import produces: teams that already carry their own numbers."
        />
      </Step>

      <Iteration
        title="Leads invite their own teams"
        roles={['admin']}
        shots={
          <Shot
            src="it-leads-invite"
            alt="A rejected screen where a team lead invites their own team by email and watches their budget grow"
          />
        }
      >
        <p>
          Faster on paper, and an operational problem in practice. Onboarding stops being one
          afternoon and becomes a queue of people to chase.
        </p>
        <p>
          A recognition programme that launches half-populated looks broken to the half who are
          already in it.
        </p>
      </Iteration>

      <Step
        n={3}
        title="Set up badges"
        roles={['admin', 'lead']}
        blurb="Badges are the vocabulary. Artwork, what it is worth, and exactly who can earn it."
      >
        <Shot
          src="badges"
          alt="Badges dashboard with totals, most common and most rare, and the badge catalogue"
          cap="Rarity is shown next to points, because the two together are what makes a badge mean anything."
        />
        <Shot
          src="badge-create"
          alt="Create badge panel with image picker, points, category, attached values and a per-team access list"
          cap="Access is set at creation, down to the team. A badge everyone can earn is not a badge."
        />
      </Step>

      <Iteration
        title="Badges as pure collectibles"
        roles={['admin']}
        shots={
          <Shot
            src="it-badge-collectible"
            alt="A rejected create-badge dialog where badges carry rarity but no points, with points awarded separately"
          />
        }
      >
        <p>
          Badges with no points attached, and points awarded as a second, separate action. Cleaner
          as a model, worse as a moment: two gestures for one piece of thanks.
        </p>
        <p>
          It also broke the ledger. If a badge is not worth anything, the pool no longer explains
          where the money went.
        </p>
      </Iteration>

      <Step
        n={4}
        title="Send an appreciation"
        roles={ALL}
        blurb="Pick someone, say why, and attach what it is worth — points, a reward, or a badge."
      >
        <Shot
          src="feed"
          alt="The activity feed with a composer, points owned, and a badge leaderboard"
          cap="The feed is the whole product for most people: send from the top, see what came back below."
        />
        <div className="pair">
          <Shot
            src="send-badge"
            alt="Send appreciation dialog with tags, a written message and a badge attached"
            cap="Tags carry the reason. Points, reward and badge are one control, not three flows."
          />
          <Shot
            src="card-new"
            alt="The final appreciation card addressed to two people with an editable prompt and the sender's available points"
            cap="Where it ended up. Several recipients, a prompt that asks to be typed in, and the balance in view."
          />
        </div>
      </Step>

      <Iteration
        title="The card, before it worked"
        roles={ALL}
        shots={
          <>
            <Shot
              src="it-card-old-a"
              alt="An earlier appreciation card with a single recipient chosen from an unsearchable scrolling list"
            />
            <Shot
              src="it-card-old-b"
              alt="Two earlier appreciation cards showing no visible points balance and a message that looks fixed"
            />
          </>
        }
      >
        <p>Four faults, all of them found by using it rather than by looking at it.</p>
        <ol className="faults">
          <li>
            <b>One recipient at a time.</b> Most thanks in a team is owed to more than one person.
          </li>
          <li>
            <b>No search.</b> You scrolled a list of everyone until you found the name.
          </li>
          <li>
            <b>No balance.</b> You could not see how many points you had left to give.
          </li>
          <li>
            <b>A message that looked fixed.</b> It was editable, and nothing about it said so, so
            everybody sent the default.
          </li>
        </ol>
      </Iteration>

      {/* ── The close ──────────────────────────────────────────────── */}
      <Beat air>
        <p className="say say-mid">One more, using the product itself.</p>
        <Shot
          src="thanks"
          alt="An appreciation card addressed to Recruiters, tagged patient and supportive, reading thank you for this opportunity, worth one million points"
        />
      </Beat>
    </div>
  )
}
