/**
 * vibeathon.us judge call-in simulation for zoom-demo.html
 */
(function (global) {
  const ORG = 'vibeathon.us';

  /** Anonymous judges — org name only (no personal names) */
  const JUDGES = [
    { id: 'judge-1', name: ORG, slot: 1, initials: 'V', bg: '#8e44ad', role: 'Official Judge' },
    { id: 'judge-2', name: ORG, slot: 2, initials: 'V', bg: '#2980b9', role: 'Official Judge' },
    { id: 'judge-3', name: ORG, slot: 3, initials: 'V', bg: '#16a085', role: 'Official Judge' },
    { id: 'judge-4', name: ORG, slot: 4, initials: 'V', bg: '#c0392b', role: 'Official Judge' },
  ];

  const BASE_PARTICIPANT_COUNT = 5;

  function JudgeCallManager(handlers) {
    this.handlers = handlers;
    this.queue = [...JUDGES];
    this.joined = [];
    this.ringing = null;
    this.ringTimer = null;
    this.chatRegistered = false;
  }

  JudgeCallManager.prototype.updateCount = function () {
    const n = BASE_PARTICIPANT_COUNT + this.joined.length;
    const info = document.querySelector('.meeting-info');
    const bottom = document.querySelector('.participant-count');
    const label = `${n} participant${n === 1 ? '' : 's'} · Recorded`;
    if (info) info.textContent = label;
    if (bottom) bottom.textContent = `${n} participants`;
    if (this.handlers.onCountChange) this.handlers.onCountChange(n);
  };

  JudgeCallManager.prototype.judgeBadge = function (judge) {
    return this.joined.length >= 1 ? `Judge ${judge.slot}` : 'Judge';
  };

  JudgeCallManager.prototype.createTile = function (judge) {
    const tile = document.createElement('div');
    tile.className = 'participant-tile judge-tile';
    tile.id = `tile-${judge.id}`;
    tile.style.animation = 'judgeJoin 0.45s ease-out';
    tile.innerHTML = `
      <div class="hand-raised" id="hand-${judge.id}"></div>
      <div class="participant-avatar" style="background:${judge.bg}">${judge.initials}</div>
      <div class="participant-name">${judge.name} <span class="judge-badge">${this.judgeBadge(judge)}</span></div>
      <div class="participant-icons"><div class="mic-icon muted">🔇</div></div>
      <div class="reaction-badge" id="react-${judge.id}"></div>
    `;
    return tile;
  };

  JudgeCallManager.prototype.registerChatSender = function (judge) {
    if (this.chatRegistered || !this.handlers.registerChatSender) return;
    this.handlers.registerChatSender(judge.name, {
      initials: judge.initials,
      bg: judge.bg,
      judge: true,
    });
    this.chatRegistered = true;
  };

  JudgeCallManager.prototype.accept = function () {
    if (!this.ringing) return null;
    const judge = this.ringing;
    this.hideIncoming();
    this.ringing = null;

    const container = document.getElementById('judge-participants');
    if (container) container.appendChild(this.createTile(judge));

    this.joined.push(judge);
    this.queue = this.queue.filter((j) => j.id !== judge.id);
    this.registerChatSender(judge);
    this.updateCount();

    const h = this.handlers;
    if (h.addChat) {
      const slotNote = this.joined.length > 1 ? ` (${this.judgeBadge(judge)})` : '';
      h.addChat(
        h.cohostSender?.() || 'Casey Morgan (Co-host)',
        `${ORG} joined the meeting${slotNote}.`,
        0
      );
      setTimeout(() => {
        if (h.addChat) {
          h.addChat(ORG, 'Thanks for having us — scoring panel from vibeathon.us is ready when you are.', 0);
        }
        if (h.setSpeaking) {
          h.setSpeaking(judge.id, true);
          setTimeout(() => h.setSpeaking(judge.id, false), 2800);
        }
      }, 900);
    }

    if (h.onJudgeJoined) h.onJudgeJoined(judge);
    return judge;
  };

  JudgeCallManager.prototype.decline = function () {
    if (!this.ringing) return;
    this.hideIncoming();
    this.ringing = null;
    if (this.handlers.addChat) {
      this.handlers.addChat(
        this.handlers.cohostSender?.() || 'Casey Morgan (Co-host)',
        `Missed call from ${ORG} — they can call back from the waiting room.`,
        0
      );
    }
  };

  JudgeCallManager.prototype.showIncoming = function (judge) {
    const overlay = document.getElementById('incoming-call');
    if (!overlay) return;
    const avatar = document.getElementById('caller-avatar');
    const name = document.getElementById('caller-name');
    const role = document.getElementById('caller-role');
    if (avatar) {
      avatar.textContent = judge.initials;
      avatar.style.background = judge.bg;
    }
    if (name) name.textContent = judge.name;
    if (role) role.textContent = judge.role;
    overlay.classList.add('show');
    document.body.classList.add('incoming-call-active');
    if (this.handlers.onRinging) this.handlers.onRinging(judge);
  };

  JudgeCallManager.prototype.hideIncoming = function () {
    const overlay = document.getElementById('incoming-call');
    if (overlay) overlay.classList.remove('show');
    document.body.classList.remove('incoming-call-active');
    if (this.ringTimer) clearTimeout(this.ringTimer);
    this.ringTimer = null;
  };

  JudgeCallManager.prototype.ring = function (judgeId) {
    if (this.ringing) return false;
    let judge = null;
    if (judgeId) {
      judge = this.queue.find((j) => j.id === judgeId) || JUDGES.find((j) => j.id === judgeId);
    } else {
      judge = this.queue[0];
    }
    if (!judge || this.joined.some((j) => j.id === judge.id)) return false;

    this.ringing = judge;
    this.showIncoming(judge);
    return true;
  };

  JudgeCallManager.prototype.ringNext = function (judgeId) {
    return this.ring(judgeId);
  };

  JudgeCallManager.prototype.reset = function () {
    this.hideIncoming();
    this.ringing = null;
    this.joined = [];
    this.queue = [...JUDGES];
    this.chatRegistered = false;
    const container = document.getElementById('judge-participants');
    if (container) container.innerHTML = '';
    this.updateCount();
    if (this.handlers.onReset) this.handlers.onReset();
  };

  JudgeCallManager.prototype.applyVibeathonBranding = function () {
    const title = document.querySelector('.meeting-title');
    if (title) title.textContent = `Fieldmark Demo — ${ORG}`;
  };

  JudgeCallManager.prototype.remaining = function () {
    return this.queue.length;
  };

  global.FieldmarkVibeathonOrg = ORG;
  global.FieldmarkVibeathonJudges = JUDGES;
  global.FieldmarkJudgeCallManager = JudgeCallManager;
})(typeof window !== 'undefined' ? window : globalThis);
