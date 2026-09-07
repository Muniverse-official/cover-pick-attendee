(() => {
  'use strict';

  // Display-only page: no winner verification, registration, or API requests.
  const COPY = {
    ko: {
      title: '방청 발표가 마감되었습니다.',
      desc: '다가오는 다음 팬즈픽을 기대해주세요!',
      hero: '방청 당첨 확인',
      pageTitle: "it's Live FANS PICK | 방청 발표 마감 안내"
    },
    en: {
      title: 'The audience winner announcement has ended.',
      desc: 'Look forward to the next FANS PICK!',
      hero: 'Audience Winner Check',
      pageTitle: "it's Live FANS PICK | Announcement Closed"
    },
    ja: {
      title: '観覧当選発表は終了しました。',
      desc: '次回のFANS PICKをお楽しみに！',
      hero: '観覧当選確認',
      pageTitle: "it's Live FANS PICK | 観覧当選発表終了"
    },
    'zh-TW': {
      title: '觀眾中獎名單公告已結束。',
      desc: '敬請期待下一期 FANS PICK！',
      hero: '觀眾中獎確認',
      pageTitle: "it's Live FANS PICK | 中獎公告已結束"
    },
    'zh-CN': {
      title: '观众中奖名单公告已结束。',
      desc: '敬请期待下一期 FANS PICK！',
      hero: '观众中奖确认',
      pageTitle: "it's Live FANS PICK | 中奖公告已结束"
    }
  };

  const language = document.getElementById('lang');
  function applyLanguage() {
    const value = language?.value || 'ko';
    const lang = Object.prototype.hasOwnProperty.call(COPY, value) ? value : 'ko';
    const copy = COPY[lang];
    document.documentElement.lang = lang;
    document.title = copy.pageTitle;
    for (const [id, text] of Object.entries({
      closedTitle: copy.title, closedDesc: copy.desc, heroTitle: copy.hero
    })) {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    }
  }
  language?.addEventListener('change', applyLanguage);
  applyLanguage();
})();
