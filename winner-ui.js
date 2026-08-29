(() => {
  'use strict';

  const COPY = {
    ko: {
      pageTitle: '방청 당첨 확인',
      modalTitle: '방청 당첨 내역이 없습니다',
      modalBody: '입력하신 Muniverse 가입 이메일과 닉네임으로 확인된 방청 당첨 내역이 없습니다. 입력 정보를 다시 확인해 주세요.',
      close: '확인',
      mismatch: '당첨자 정보와 일치하지 않습니다.'
    },
    en: {
      pageTitle: 'Audience Winner Check',
      modalTitle: 'No winning record found',
      modalBody: 'We could not find an audience winning record matching the Muniverse email and nickname you entered. Please check your information and try again.',
      close: 'OK',
      mismatch: 'The information does not match a winner record.'
    },
    ja: {
      pageTitle: '観覧当選確認',
      modalTitle: '観覧当選情報が見つかりません',
      modalBody: '入力されたMuniverse登録メールアドレスとニックネームに一致する観覧当選情報はありません。入力内容をご確認ください。',
      close: '確認',
      mismatch: '当選者情報と一致しません。'
    },
    'zh-TW': {
      pageTitle: '觀眾中獎確認',
      modalTitle: '找不到觀眾中獎紀錄',
      modalBody: '以您輸入的 Muniverse 註冊信箱與暱稱，未查到相符的觀眾中獎紀錄。請確認輸入資訊後再試一次。',
      close: '確認',
      mismatch: '資料與中獎者資訊不符。'
    },
    'zh-CN': {
      pageTitle: '观众中奖确认',
      modalTitle: '未找到观众中奖记录',
      modalBody: '根据您输入的 Muniverse 注册邮箱和昵称，未查到匹配的观众中奖记录。请确认输入信息后重试。',
      close: '确认',
      mismatch: '信息与中奖者记录不符。'
    }
  };

  const lang = document.getElementById('lang');
  const heroTitle = document.getElementById('heroTitle');
  const verifyMessage = document.getElementById('verifyMessage');

  let backdrop;
  let modalTitle;
  let modalBody;
  let closeButton;
  let lastFocused;
  let modalOpen = false;

  function currentCopy() {
    return COPY[lang?.value] || COPY.ko;
  }

  function updateModalCopy() {
    if (!modalTitle || !modalBody || !closeButton) return;
    const copy = currentCopy();
    modalTitle.textContent = copy.modalTitle;
    modalBody.textContent = copy.modalBody;
    closeButton.textContent = copy.close;
  }

  function applyPageTitle() {
    const copy = currentCopy();
    if (heroTitle) heroTitle.textContent = copy.pageTitle;
    document.title = `it's Live FANS PICK | ${copy.pageTitle}`;
    if (modalOpen) updateModalCopy();
  }

  function closeModal() {
    if (!backdrop || !modalOpen) return;
    modalOpen = false;
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('winner-modal-open');
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  function ensureModal() {
    if (backdrop) return;

    backdrop = document.createElement('div');
    backdrop.className = 'winner-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    const modal = document.createElement('section');
    modal.className = 'winner-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'winnerModalTitle');
    modal.setAttribute('aria-describedby', 'winnerModalBody');

    modalTitle = document.createElement('h2');
    modalTitle.className = 'winner-modal-title';
    modalTitle.id = 'winnerModalTitle';

    modalBody = document.createElement('p');
    modalBody.className = 'winner-modal-body';
    modalBody.id = 'winnerModalBody';

    closeButton = document.createElement('button');
    closeButton.className = 'winner-modal-button';
    closeButton.type = 'button';
    closeButton.addEventListener('click', closeModal);

    modal.append(modalTitle, modalBody, closeButton);
    backdrop.append(modal);
    document.body.append(backdrop);

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (modalOpen && event.key === 'Escape') closeModal();
    });
  }

  function showNotWinner() {
    ensureModal();
    updateModalCopy();
    lastFocused = document.activeElement;
    modalOpen = true;
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('winner-modal-open');
    requestAnimationFrame(() => closeButton?.focus());
  }

  function isMismatchMessage(text) {
    const normalized = text.trim();
    return Object.values(COPY).some((copy) => copy.mismatch === normalized);
  }

  if (verifyMessage) {
    const observer = new MutationObserver(() => {
      const text = verifyMessage.textContent || '';
      if (!isMismatchMessage(text)) return;
      verifyMessage.textContent = '';
      showNotWinner();
    });
    observer.observe(verifyMessage, { childList: true, characterData: true, subtree: true });
  }

  lang?.addEventListener('change', applyPageTitle);
  applyPageTitle();
})();
