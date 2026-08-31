(() => {
  'use strict';

  const COPY = {
    ko: {
      label: 'X 계정',
      hint: '@아이디 또는 X 프로필 주소를 입력해 주세요. (예: @Muniverse_io)',
      invalid: 'X 계정 형식을 확인해 주세요. (예: @username)',
      collectionSuffix: ', X 계정'
    },
    en: {
      label: 'X account',
      hint: 'Enter @username or an X profile URL. (e.g. @Muniverse_io)',
      invalid: 'Check the X account format. (e.g. @username)',
      collectionSuffix: ', and X account'
    },
    ja: {
      label: 'Xアカウント',
      hint: '@ユーザー名またはXプロフィールURLを入力してください。（例：@Muniverse_io）',
      invalid: 'Xアカウントの形式を確認してください。（例：@username）',
      collectionSuffix: '、Xアカウント'
    },
    'zh-TW': {
      label: 'X 帳號',
      hint: '請輸入 @使用者名稱或 X 個人檔案網址。（例：@Muniverse_io）',
      invalid: '請確認 X 帳號格式。（例：@username）',
      collectionSuffix: '、X 帳號'
    },
    'zh-CN': {
      label: 'X 账号',
      hint: '请输入 @用户名或 X 个人主页网址。（例：@Muniverse_io）',
      invalid: '请确认 X 账号格式。（例：@username）',
      collectionSuffix: '、X 账号'
    }
  };

  const $ = (id) => document.getElementById(id);
  const currentLanguage = () => COPY[$('lang')?.value] ? $('lang').value : 'en';
  const currentCopy = () => COPY[currentLanguage()];

  function normalizeXAccount(value) {
    let raw = String(value || '').normalize('NFKC').trim();
    raw = raw.replace(/^https?:\/\/(?:(?:www|mobile)\.)?(?:x\.com|twitter\.com)\//i, '');
    raw = raw.split(/[/?#]/u)[0].replace(/^@+/u, '');
    if (!/^[A-Za-z0-9_]{1,15}$/.test(raw)) return '';
    return `@${raw}`;
  }

  function ensureField() {
    if ($('xAccount')) return;
    const contactField = $('contactEmail')?.closest('.field');
    if (!contactField) return;

    const field = document.createElement('div');
    field.className = 'field field-top';
    field.innerHTML = [
      '<label for="xAccount" id="xAccountLabel">X account</label>',
      '<input id="xAccount" type="text" maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="@username" aria-describedby="xAccountHint">',
      '<p class="hint" id="xAccountHint">Enter @username or an X profile URL.</p>'
    ].join('');
    contactField.before(field);
    bindInput();
  }

  function patchPrivacyNotice() {
    const collectedItems = $('privacyText')?.querySelector('.privacy-grid > div:nth-child(2) dd');
    if (!collectedItems || collectedItems.dataset.xAccountPatched === '1') return;
    collectedItems.append(document.createTextNode(currentCopy().collectionSuffix));
    collectedItems.dataset.xAccountPatched = '1';
  }

  function applyLanguage() {
    ensureField();
    if ($('xAccountLabel')) $('xAccountLabel').textContent = currentCopy().label;
    if ($('xAccountHint')) $('xAccountHint').textContent = currentCopy().hint;
    patchPrivacyNotice();
  }

  function clearMessage() {
    if ($('submitMessage')) $('submitMessage').textContent = '';
  }

  function bindInput() {
    const input = $('xAccount');
    if (!input || input.dataset.xAccountBound === '1') return;
    input.dataset.xAccountBound = '1';
    input.addEventListener('input', clearMessage);
    input.addEventListener('blur', () => {
      const normalized = normalizeXAccount(input.value);
      if (normalized) input.value = normalized;
    });
  }

  function validateBeforeSubmit(event) {
    const button = event.target instanceof Element ? event.target.closest('#submitBtn') : null;
    if (!button) return;

    ensureField();
    const input = $('xAccount');
    const normalized = normalizeXAccount(input?.value || '');
    if (!normalized) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if ($('submitMessage')) $('submitMessage').textContent = currentCopy().invalid;
      input?.focus();
      return;
    }
    if (input) input.value = normalized;
  }

  function isSubmitRequest(input) {
    let rawUrl = '';
    if (typeof input === 'string' || input instanceof URL) rawUrl = String(input);
    else if (input instanceof Request) rawUrl = input.url;
    if (!rawUrl) return false;

    try {
      const url = new URL(rawUrl, window.location.href);
      if (url.pathname.endsWith('/functions/v1/cover-pick-register')) return true;
      return url.pathname.endsWith('/functions/v1/cover-pick') && url.searchParams.get('action') === 'submit';
    } catch {
      return false;
    }
  }

  const routedFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (isSubmitRequest(input) && init && typeof init.body === 'string') {
      try {
        const body = JSON.parse(init.body);
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          body.x_account = normalizeXAccount($('xAccount')?.value || '');
          init = { ...init, body: JSON.stringify(body) };
        }
      } catch {}
    }
    return routedFetch(input, init);
  };

  document.addEventListener('click', validateBeforeSubmit, true);
  window.addEventListener('attendee-language-change', applyLanguage);
  $('lang')?.addEventListener('change', () => queueMicrotask(applyLanguage));

  ensureField();
  bindInput();
  applyLanguage();

  if (new URLSearchParams(window.location.search).get('preview') === 'step2' && $('xAccount')) {
    $('xAccount').value = '@Muniverse_io';
  }

  Object.defineProperty(window, '__FANS_PICK_X_ACCOUNT__', {
    value: Object.freeze({ normalize: normalizeXAccount }),
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
