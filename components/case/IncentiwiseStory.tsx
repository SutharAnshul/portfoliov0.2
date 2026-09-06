import { Settle } from '@/components/Settle'

/**
 * Incentiwise, built on the spine of the deck.
 *
 * Its best idea is that it runs on two tracks. A cyan-labelled step is a thing
 * that shipped; a red-labelled one on warm ground is a road not taken. Here
 * they alternate — every step is followed at once by the version of it that was
 * rejected — so scrolling the page is scrolling the argument, and the reader
 * passes in and out of the warm bands where the product went wrong. One device
 * sectioning the page, sequencing it, and saying which of two kinds of thing
 * you are reading, which is why nothing else marks a beginning or an end.
 *
 * The role colours are the deck's, sampled from the slides rather than guessed.
 * They are load-bearing, because who may do what is what this product is: the
 * same three pills head every step, and the deck's own access diagrams carry
 * the same three again.
 *
 * Every screen here is a whole composition lifted off its slide, not a screen
 * cut out of one. The deck offsets, stacks and overlaps deliberately — the
 * login panel with its two reset states down the right, the three appreciation
 * cards running off both edges — and cropping each rectangle out separately
 * would throw that away.
 *
 * The crops are tight, and the breathing room around each one is painted here
 * instead, on a frame filled with the colour that slide used. Padding is the
 * page's job: a margin baked into the picture lands at a different size on
 * every image, because they scale by different amounts to fit one column,
 * whereas a frame gives them all the identical gap in the same unit as the
 * space around everything else.
 *
 * The writing is new throughout. Only the pictures are the deck's.
 */

/** The three access colours, used everywhere the question is "who". */
type Role = 'admin' | 'lead' | 'emp'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  lead: 'Dept / Team lead',
  emp: 'Employee',
}

const ALL: Role[] = ['admin', 'lead', 'emp']

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

/** The access key. It lived in the slide's title column, which is cropped off. */
function Chip({ role }: { role: Role }) {
  return (
    <span className={`chip chip-${role}`}>
      <span className="sr-only">{ROLE_LABEL[role]}</span>
    </span>
  )
}

function Legend() {
  return (
    <div className="legend">
      {ALL.map((r) => (
        <span key={r}>
          <Chip role={r} /> {ROLE_LABEL[r]}
        </span>
      ))}
    </div>
  )
}

function Beat({ children, air }: { children: React.ReactNode; air?: boolean }) {
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
        <div className="shots">{children}</div>
      </section>
    </Settle>
  )
}

/**
 * A version that did not ship. Full-bleed warm ground, red label, and the
 * reasoning beside the screen rather than under it — the argument is the point
 * here, and the screen is only its evidence.
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

const SRC = (name: string) => `/images/incentiwise/story/${name}.png`

/**
 * A screen on its frame. `ground` names the slide's own background where it
 * is not the usual near-black, so the frame and the picture stay one material.
 */
function Shot({
  src,
  alt,
  cap,
  ground,
}: {
  src: string
  alt: string
  cap?: string
  ground?: string
}) {
  return (
    <figure className="shot">
      <div className="frame" style={ground ? ({ '--ground': ground } as React.CSSProperties) : undefined}>
        <img src={SRC(src)} alt={alt} loading="lazy" />
      </div>
      {cap && <figcaption className="cap">{cap}</figcaption>}
    </figure>
  )
}

/**
 * A diagram from the deck. Even across the whole column it cannot show eleven
 * features by three roles at the size it was drawn, so it carries a link to
 * the file — the one honest answer to a picture of type scaled past reading.
 */
function Diagram({ src, alt, cap }: { src: string; alt: string; cap: string }) {
  return (
    <figure className="shot">
      <div className="frame">
        <img src={SRC(src)} alt={alt} loading="lazy" />
      </div>
      <figcaption className="cap">
        {cap}{' '}
        <a href={SRC(src)} target="_blank" rel="noreferrer" className="full">
          Open full size ↗
        </a>
      </figcaption>
    </figure>
  )
}

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

      <Settle mass="medium">
        <Shot
          src="cover"
          ground="#0b1a24"
          alt="The Incentiwise feed, organisation and badges screens, shown in perspective"
        />
      </Settle>

      {/* ── Who is on it ───────────────────────────────────────────── */}
      <Beat>
        <p className="eyebrow">Four people</p>
        <p className="say say-mid">Only one of them is here to be thanked.</p>
        <div className="cast">
          <div className="who-card">
            <img src={SRC('p-admin')} alt="" className="face" loading="lazy" />
            <Pill role="admin" />
            <p>
              Owns the programme. Funds the pool, builds the badges, and signs off what the leads
              ask for.
            </p>
          </div>
          <div className="who-card">
            <img src={SRC('p-dept')} alt="" className="face" loading="lazy" />
            <Pill role="lead">Dept. head</Pill>
            <p>
              Approves what the leads ask for, and answers for the culture underneath.
            </p>
          </div>
          <div className="who-card">
            <img src={SRC('p-lead')} alt="" className="face" loading="lazy" />
            <Pill role="lead">Team lead</Pill>
            <p>
              Recognises their own team against a quarterly budget. Asks for more when it runs dry.
            </p>
          </div>
          <div className="who-card">
            <img src={SRC('p-emp')} alt="" className="face" loading="lazy" />
            <Pill role="emp" />
            <p>Sends and receives appreciation. Collects badges, holds points, spends them.</p>
          </div>
        </div>
      </Beat>

      {/* ── Access, and the shape it makes ─────────────────────────── */}
      <Beat>
        <p className="eyebrow">Platform access</p>
        <h2 className="hmono">Role-based feature mapping</h2>
        <Diagram
          src="map"
          alt="Role-based feature mapping: eleven features across Admin, Dept and Team lead, and Employee columns"
          cap="Read across a row and it is one feature. Read down a column and it is a different product. Cost–benefit analytics is the sharpest case — a number the buyer needs and the employee never sees."
        />
      </Beat>

      <Beat>
        <p className="eyebrow">Structure</p>
        <h2 className="hmono">Information architecture</h2>
        <Legend />
        <Diagram
          src="ia"
          alt="Information architecture: Login branching to Feed, Rewards, Organisation and Culture, every node marked with the roles that can reach it"
          cap="Access is drawn onto the architecture rather than kept in a settings page. What you can reach is what you are."
        />
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
          src="s1-login"
          alt="Incentiwise sign-in with email, password, Google Workspace and Teams, beside the two states of password reset"
          cap="Reset sits beside sign-in rather than on a page of its own — it is the one flow everybody hits on day one."
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
        <Shot
          src="s2-import"
          alt="An empty Organisation screen beside the bulk import panel, before and after a file is chosen and its columns mapped"
          cap="An empty state that says what to do next, and a mapper that does not assume your spreadsheet matches ours."
        />
        <Shot
          src="s2-confirm"
          alt="Confirm import listing new, existing and failed rows, beside the populated Organisation teams view"
          cap="Every row is shown before anything is written, including the ones that will fail and why. What comes out the other side is teams that already carry their own numbers."
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
          src="s3-badges"
          alt="The badges dashboard with totals, rarity counts and the badge catalogue"
          cap="Rarity sits next to points, because the two together are the whole of what a badge means."
        />
        <Shot
          src="s3-badges-create"
          alt="The empty badges screen beside the create-badge panel with artwork, points, category and a per-team access list"
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
          src="s4-feed"
          alt="The activity feed with a composer at the top, points owned, and a badge leaderboard"
          cap="The feed is the whole product for most people: send from the top, see what came back below."
        />
        <Shot
          src="s4-tags"
          alt="The send dialog with the value-tag list open over the card"
          cap="Tags carry the reason, and are picked on the card itself, so you never lose sight of what you are sending."
        />
        <Shot
          src="s4-variants"
          alt="Three appreciation cards side by side, attaching points, a reward and a badge"
          cap="Points, reward and badge are one control with three states rather than three flows. Kept in the deck's own arrangement, because seeing the three side by side is what shows the card never changes shape."
        />
        <Shot
          src="s4-card-new"
          alt="The final appreciation card addressed to two people, with an editable prompt and the sender's available points"
          cap="Where it ended up: several recipients, a prompt that asks to be typed in, and the balance in view."
        />
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
              alt="Two earlier appreciation cards overlapping, showing no visible points balance and a message that looks fixed"
            />
            <Shot
              src="it-card-new"
              alt="The replacement card, with a searchable multi-select of recipients"
            />
          </>
        }
      >
        <p>Four faults, all of them found by using it rather than by looking at it.</p>
        <ol className="faults">
          <li>
            <b>One recipient at a time.</b> Most thanks owed in a team is owed to more than one
            person.
          </li>
          <li>
            <b>No search.</b> You scrolled a list of everyone until you found the name.
          </li>
          <li>
            <b>No balance.</b> You could not see how many points you had left to give.
          </li>
          <li>
            <b>A message that looked fixed.</b> It was editable, nothing about it said so, and so
            everybody sent the default.
          </li>
        </ol>
      </Iteration>

      {/* ── The close ──────────────────────────────────────────────── */}
      <Beat air>
        <p className="say say-mid">One more, using the product itself.</p>
        <Shot
          src="thanks"
          ground="#222831"
          alt="An appreciation card addressed to Recruiters, tagged patient and supportive, reading thank you for this opportunity, worth one million points"
        />
      </Beat>
    </div>
  )
}
