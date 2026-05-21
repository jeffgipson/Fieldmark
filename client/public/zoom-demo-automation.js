/**
 * Fieldmark Zoom demo — scripted timeline + optional random audience moments.
 * Loaded by zoom-demo.html; presenter panel drives via postMessage.
 */
(function (global) {
  /** Answers chat while Jeff runs the live demo on screen share */
  const COHOST = {
    id: 'cohost',
    sender: 'Casey Morgan (Co-host)',
    initials: 'CM',
    avatarBg: 'linear-gradient(135deg, #e67e22, #d35400)',
  };

  const SCRIPT = {
    name: 'Fieldmark live demo (~7 min)',
    /** Planned beats (seconds from Play) */
    timeline: [
      { at: 4, type: 'judge-ring' },
      { at: 6, type: 'event', id: 'benchmark' },
      { at: 14, type: 'chat', sender: 'Waverly Farm Ops', text: 'Where does the benchmark data actually come from?' },
      { at: 20, type: 'chat', sender: COHOST.sender, text: 'MU Extension 2026 crop budgets — same numbers FSA and lenders reference.' },
      { at: 28, type: 'event', id: 'mike_wow' },
      { at: 38, type: 'chat', sender: 'Mike Henderson', text: 'So this is per-field, not just a farm average?' },
      { at: 45, type: 'chat', sender: COHOST.sender, text: 'Right — seed and fertilizer spend by field, then rolled up to the farm.' },
      { at: 52, type: 'event', id: 'dale_speaks' },
      { at: 68, type: 'chat', sender: 'Waverly Farm Ops', text: 'When you say peers — we never see other farm names, right?' },
      { at: 74, type: 'chat', sender: COHOST.sender, text: 'Correct. Regional medians only. No identities in the cohort.' },
      { at: 82, type: 'event', id: 'waverly_hand' },
      { at: 92, type: 'chat', sender: 'Mike Henderson', text: 'Does Dale recommend products? Who pays for the AI?' },
      { at: 98, type: 'chat', sender: 'Dale (AI)', text: 'No vendor relationships. I only interpret your numbers and MU benchmarks — nothing to sell you.' },
      { at: 108, type: 'speak', id: 'mike', duration: 2800 },
      { at: 108, type: 'reaction', id: 'mike', emoji: '🤔' },
      { at: 118, type: 'chat', sender: 'Mike Henderson', text: 'That’s what I needed before my agronomist meeting.' },
      { at: 115, type: 'judge-ring' },
      { at: 128, type: 'event', id: 'scenario' },
      { at: 142, type: 'chat', sender: 'Waverly Farm Ops', text: 'Can we model a price drop without re-entering every invoice?' },
      { at: 150, type: 'chat', sender: COHOST.sender, text: 'Scenarios sit on the costs you already entered — change corn price or yield and margin updates.' },
      { at: 165, type: 'chat', sender: 'Mike Henderson', text: 'What about something I can hand the lender?' },
      { at: 172, type: 'chat', sender: COHOST.sender, text: 'Analyst report — D.A.L.E. pulls benchmarks, scenarios, and downside into one PDF-ready narrative.' },
      { at: 182, type: 'event', id: 'chat_flood' },
      { at: 198, type: 'chat', sender: 'Waverly Farm Ops', text: 'We’ve been guessing on March nitrogen for three years.' },
      { at: 208, type: 'chat', sender: 'Mike Henderson', text: 'How is this different from the co-op’s planning tool?' },
      { at: 216, type: 'chat', sender: COHOST.sender, text: 'Co-op tools optimize their sale. Fieldmark is independent — built for your margin, not theirs.' },
      { at: 228, type: 'hand', id: 'waverly', duration: 5000 },
      { at: 228, type: 'chat', sender: 'Waverly Farm Ops', text: 'Could we see soybean benchmarks on the same farm?' },
      { at: 238, type: 'speak', id: COHOST.id, duration: 3200 },
      { at: 238, type: 'chat', sender: COHOST.sender, text: 'Yes — flip commodity per field; benchmarks follow corn vs soybean.' },
      { at: 252, type: 'reaction', id: 'waverly', emoji: '👍' },
      { at: 260, type: 'chat', sender: 'Mike Henderson', text: 'What does it cost after the trial?' },
      { at: 268, type: 'chat', sender: COHOST.sender, text: 'Farmer subscription — priced for mid-scale acres. Happy to follow up after today.' },
      { at: 280, type: 'speak', id: 'dale', duration: 4000 },
      { at: 280, type: 'reaction', id: 'dale', emoji: '🦉' },
      { at: 280, type: 'chat', sender: 'Dale (AI)', text: 'Remember: show your lender both base case and downside before March commitments.' },
      { at: 250, type: 'judge-ring' },
      { at: 295, type: 'event', id: 'mike_wow' },
      { at: 305, type: 'chat', sender: 'Mike Henderson', text: 'This is the ammunition we needed. Thank you.' },
    ],
    /** Fired between timeline beats when random mode is on */
    random: {
      enabled: true,
      intervalSec: [38, 72],
      pool: [
        { type: 'chat', sender: 'Mike Henderson', text: 'Does it work on mobile in the cab?' },
        { type: 'chat', sender: 'Waverly Farm Ops', text: 'Can we import from Excel later?' },
        { type: 'reaction', id: 'mike', emoji: '👍' },
        { type: 'reaction', id: 'waverly', emoji: '🔥' },
        { type: 'reaction', id: 'mike', emoji: '👀' },
        { type: 'chat', sender: 'Mike Henderson', text: 'How fresh is the peer data?' },
        { type: 'chat', sender: 'Waverly Farm Ops', text: 'What regions are supported today?' },
        { type: 'speak', id: 'mike', duration: 2200 },
        { type: 'speak', id: 'waverly', duration: 2200 },
        { type: 'hand', id: 'waverly', duration: 4500 },
        { type: 'chat', sender: 'Mike Henderson', text: 'Can Dale answer what-if questions in plain English?' },
        { type: 'chat', sender: 'Waverly Farm Ops', text: 'Is there a demo farm we can poke at?' },
        { type: 'reaction', id: COHOST.id, emoji: '✅' },
        { type: 'speak', id: COHOST.id, duration: 2200 },
        { type: 'chat', sender: COHOST.sender, text: 'Jeff’s walking through that on screen now — shout if you want a deeper dive.' },
        { type: 'chat', sender: 'Mike Henderson', text: 'Do you integrate with FBN or bushel?' },
      ],
    },
  };

  function pickRandom(pool, recent) {
    const available = pool.filter((item) => !recent.includes(item));
    const list = available.length ? available : pool;
    const item = list[Math.floor(Math.random() * list.length)];
    return item;
  }

  function DemoDirector(handlers) {
    this.handlers = handlers;
    this.plannedTimers = [];
    this.randomTimer = null;
    this.running = false;
    this.paused = false;
    this.startedAt = 0;
    this.pausedAt = 0;
    this.elapsedBeforePause = 0;
    this.recentRandom = [];
    this.onTick = null;
    this.tickTimer = null;
  }

  DemoDirector.prototype.runCue = function (cue) {
    const h = this.handlers;
    switch (cue.type) {
      case 'event':
        if (h.triggerEvent) h.triggerEvent(cue.id);
        break;
      case 'chat':
        if (h.addChat) h.addChat(cue.sender, cue.text, cue.delay || 0);
        break;
      case 'speak':
        if (h.setSpeaking) {
          h.setSpeaking(cue.id, true);
          if (cue.duration) {
            setTimeout(() => h.setSpeaking(cue.id, false), cue.duration);
          }
        }
        break;
      case 'reaction':
        if (h.showReaction) h.showReaction(cue.id, cue.emoji, cue.duration);
        break;
      case 'hand':
        if (h.raiseHand) {
          h.raiseHand(cue.id, cue.on !== false);
          if (cue.duration) setTimeout(() => h.raiseHand(cue.id, false), cue.duration);
        }
        break;
      case 'judge-ring':
        if (h.ringJudgeCall) h.ringJudgeCall(cue.judgeId);
        break;
      default:
        break;
    }
    if (h.onCue) h.onCue(cue);
  };

  DemoDirector.prototype.clearTimers = function () {
    this.plannedTimers.forEach((id) => clearTimeout(id));
    this.plannedTimers = [];
    if (this.randomTimer) clearTimeout(this.randomTimer);
    this.randomTimer = null;
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
  };

  DemoDirector.prototype.schedulePlanned = function () {
    const elapsed = this.elapsedMs();
    SCRIPT.timeline.forEach((cue) => {
      const delay = cue.at * 1000 - elapsed;
      if (delay < 0) return;
      const id = setTimeout(() => {
        if (!this.running || this.paused) return;
        this.runCue(cue);
      }, delay);
      this.plannedTimers.push(id);
    });
  };

  DemoDirector.prototype.scheduleRandom = function () {
    const cfg = SCRIPT.random;
    if (!cfg?.enabled || !cfg.pool?.length || !this.running || this.paused) return;

    const [min, max] = cfg.intervalSec;
    const jitter = min + Math.random() * (max - min);
    this.randomTimer = setTimeout(() => {
      if (!this.running || this.paused) return;
      const item = pickRandom(cfg.pool, this.recentRandom);
      this.recentRandom.push(item);
      if (this.recentRandom.length > 4) this.recentRandom.shift();
      this.runCue(item);
      this.scheduleRandom();
    }, jitter * 1000);
  };

  DemoDirector.prototype.elapsedMs = function () {
    if (!this.running) return 0;
    if (this.paused) return this.elapsedBeforePause;
    return this.elapsedBeforePause + (Date.now() - this.startedAt);
  };

  DemoDirector.prototype.status = function () {
    const ms = this.elapsedMs();
    const sec = Math.floor(ms / 1000);
    const next = SCRIPT.timeline.find((c) => c.at > sec);
    return {
      running: this.running,
      paused: this.paused,
      elapsedSec: sec,
      scriptName: SCRIPT.name,
      nextCue: next ? { at: next.at, label: cueLabel(next) } : null,
    };
  };

  function cueLabel(cue) {
    if (cue.type === 'judge-ring') return 'vibeathon.us judge calling';
    if (cue.type === 'event') return cue.id;
    if (cue.type === 'chat') {
      const t = cue.text.length > 42 ? `${cue.text.slice(0, 42)}…` : cue.text;
      return `${cue.sender}: ${t}`;
    }
    return cue.type;
  }

  DemoDirector.prototype.start = function (opts = {}) {
    this.stop({ silent: true });
    this.running = true;
    this.paused = false;
    this.elapsedBeforePause = 0;
    this.startedAt = Date.now();
    this.recentRandom = [];
    if (opts.random != null && SCRIPT.random) SCRIPT.random.enabled = !!opts.random;
    if (opts.reset && this.handlers.resetDemo) this.handlers.resetDemo();
    this.schedulePlanned();
    if (SCRIPT.random?.enabled) this.scheduleRandom();
    this.tickTimer = setInterval(() => {
      if (this.onTick) this.onTick(this.status());
    }, 500);
    if (this.onTick) this.onTick(this.status());
  };

  DemoDirector.prototype.pause = function () {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.elapsedBeforePause += Date.now() - this.startedAt;
    this.clearTimers();
    if (this.onTick) this.onTick(this.status());
  };

  DemoDirector.prototype.resume = function () {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.startedAt = Date.now();
    this.schedulePlanned();
    if (SCRIPT.random?.enabled) this.scheduleRandom();
    if (this.onTick) this.onTick(this.status());
  };

  DemoDirector.prototype.stop = function (opts = {}) {
    this.running = false;
    this.paused = false;
    this.elapsedBeforePause = 0;
    this.clearTimers();
    if (!opts.silent && this.onTick) this.onTick(this.status());
  };

  global.FieldmarkDemoCohost = COHOST;
  global.FieldmarkDemoScript = SCRIPT;
  global.FieldmarkDemoDirector = DemoDirector;
})(typeof window !== 'undefined' ? window : globalThis);
