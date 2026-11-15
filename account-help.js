(() => {
  'use strict';

  const COPY = {
    "ko": "뮤니버스 로그인 후 마이페이지에서\n가입 이메일과 닉네임을 확인해 주세요.",
    "ja": "登録メールアドレスとニックネームは、\nMuniverseのマイページで確認できます。",
    "en": "Find your account email and nickname\non My Page after signing in to Muniverse.",
    "zh-TW": "登入 Muniverse 後，前往「我的頁面」\n即可查看帳號的註冊信箱與暱稱。",
    "zh-CN": "登录 Muniverse 后，进入「我的页面」\n即可查看账号的注册邮箱和昵称。",
  };

  const lang = document.getElementById('lang');
  const help = document.getElementById('step1AccountHelp');

  function apply() {
    if (!help) return;
    const key = lang?.value || 'ko';
    help.textContent = COPY[key] || COPY.ko;
  }

  lang?.addEventListener('change', apply);
  window.addEventListener('attendee-language-change', apply);
  apply();
})();
