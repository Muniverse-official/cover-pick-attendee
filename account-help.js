(() => {
  'use strict';

  const copy = {
  "ko": [
    "계정 정보 확인 방법",
    "뮤니버스 앱·웹 로그인",
    "마이페이지에서 확인"
  ],
  "en": [
    "Find your account details",
    "Sign in to the Muniverse app or website",
    "Open My Page"
  ],
  "ja": [
    "登録情報の確認方法",
    "Muniverseアプリ・ウェブサイトにログイン",
    "マイページで確認"
  ],
  "zh-TW": [
    "如何查看帳號資料",
    "登入 Muniverse 應用程式或網站",
    "前往「我的頁面」"
  ],
  "zh-CN": [
    "如何查看账号信息",
    "登录 Muniverse 应用或网站",
    "前往「我的页面」"
  ]
};
  const ids = ['accountHelpTitle', 'accountHelpSignIn', 'accountHelpMyPage'];
  const lang = document.getElementById('lang');

  function apply() {
    const labels = copy[lang?.value] ?? copy.ko;
    ids.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) element.textContent = labels[index];
    });
  }

  lang?.addEventListener('change', apply);
  window.addEventListener('attendee-language-change', apply);
  apply();
})();
