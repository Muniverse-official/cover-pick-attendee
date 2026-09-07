(() => {
  'use strict';
  const API = 'https://kkaoerbblpuszptiibvo.supabase.co/functions/v1/attendee-config?program=fans_pick';
  const $ = (id) => document.getElementById(id);
  const lang = () => $('lang')?.value || 'ko';
  const copy = {
    ko:{tba:'방청일은 추후 별도 안내됩니다.',notOpen:'아직 방청 당첨 확인 기간이 시작되지 않았습니다.',closed:'방청 당첨 확인 및 정보 등록 기간이 종료되었습니다.'},
    en:{tba:'The attendance date will be announced separately.',notOpen:'Winner verification has not opened yet.',closed:'Winner verification and registration have closed.'},
    ja:{tba:'観覧日は後日別途ご案内します。',notOpen:'当選者確認期間はまだ開始していません。',closed:'当選者確認・登録期間は終了しました。'},
    'zh-TW':{tba:'觀眾活動日期將另行通知。',notOpen:'中獎者確認尚未開始。',closed:'中獎確認與登記期間已結束。'},
    'zh-CN':{tba:'观众活动日期将另行通知。',notOpen:'中奖者确认尚未开始。',closed:'中奖确认与登记已结束。'}
  };
  let config = null;
  const tr = (key) => (copy[lang()] || copy.en)[key];
  function showState(text) {
    ['step1','step2','done','already'].forEach(id => $(id)?.classList.add('hidden'));
    let card = $('scheduleStateCard');
    if (!card) {
      card = document.createElement('section');
      card.id = 'scheduleStateCard'; card.className = 'card'; card.style.textAlign = 'center';
      document.querySelector('.hero')?.insertAdjacentElement('afterend', card);
    }
    card.innerHTML = `<h1>${text}</h1><p class="lead">Muniverse</p>`;
  }
  function apply() {
    if (!config) return;
    const now = Date.now(), open = config.openAt ? Date.parse(config.openAt) : NaN, close = config.closeAt ? Date.parse(config.closeAt) : NaN;
    if (Number.isFinite(open) && now < open) return showState(tr('notOpen'));
    if (Number.isFinite(close) && now >= close) return showState(tr('closed'));
    $('scheduleStateCard')?.remove(); $('step1')?.classList.remove('hidden');
    const note = $('eventScheduleNotice');
    if (note) { note.textContent = config.eventDateTba ? tr('tba') : ''; note.classList.toggle('hidden', !config.eventDateTba); }
  }
  async function load() { try { const r = await fetch(API,{cache:'no-store'}); const j = await r.json(); if(j.ok){config=j;apply();} } catch {} }
  $('lang')?.addEventListener('change', apply); load();
})();
