(() => {
  'use strict';

  // Absolute UTC instants corresponding to KST public registration hours.
  // Open: 2026-09-01 17:00:00 KST
  // Close: 2026-09-07 17:00:00 KST (16:59:59 is the last accepted second)
  const OPEN_AT = Date.parse('2026-09-01T08:00:00Z');
  const CLOSE_AT = Date.parse('2026-09-07T08:00:00Z');

  const COPY = {
    ko: {
      notOpen: '방청자 정보 입력은 9월 1일 17:00(KST)부터 가능합니다.',
      expired: '입력기한이 초과되었습니다.'
    },
    en: {
      notOpen: 'Attendee registration opens on September 1 at 17:00 (KST).',
      expired: 'The submission deadline has passed.'
    },
    ja: {
      notOpen: '観覧者情報の入力は9月1日17:00（KST）から開始します。',
      expired: '入力期限を過ぎています。'
    },
    'zh-TW': {
      notOpen: '觀眾資料登記將於 9 月 1 日 17:00（KST）開放。',
      expired: '已超過填寫期限。'
    },
    'zh-CN': {
      notOpen: '观众信息登记将于 9 月 1 日 17:00（KST）开放。',
      expired: '已超过填写期限。'
    }
  };

  const $ = (id) => document.getElementById(id);
  const lang = () => COPY[$('lang')?.value] ? $('lang').value : 'ko';
  const state = () => {
    const now = Date.now();
    if (now < OPEN_AT) return 'notOpen';
    if (now >= CLOSE_AT) return 'expired';
    return 'open';
  };

  function messageTarget(button) {
    return button?.id === 'submitBtn' ? $('submitMessage') : $('verifyMessage');
  }

  function guard(event) {
    const button = event.target instanceof Element ? event.target.closest('#verifyBtn, #submitBtn') : null;
    if (!button) return;

    const current = state();
    if (current === 'open') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const target = messageTarget(button);
    if (target) target.textContent = COPY[lang()][current];
  }

  // Capture phase ensures the window rule runs before the existing verification
  // and registration click handlers while keeping the page as one seamless flow.
  document.addEventListener('click', guard, true);

  window.addEventListener('attendee-language-change', () => {
    const current = state();
    if (current === 'open') return;
    const verifyMessage = $('verifyMessage');
    const submitMessage = $('submitMessage');
    if (verifyMessage?.textContent) verifyMessage.textContent = COPY[lang()][current];
    if (submitMessage?.textContent) submitMessage.textContent = COPY[lang()][current];
  });

  Object.defineProperty(window, '__FANS_PICK_REGISTRATION_WINDOW__', {
    value: Object.freeze({
      openAt: '2026-09-01T17:00:00+09:00',
      closeAt: '2026-09-07T17:00:00+09:00',
      state
    }),
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
