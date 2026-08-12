(() => {
  'use strict';

  const API = 'https://tcxugltvmatbgsmcepso.supabase.co/functions/v1/cover-pick';
  const $ = (id) => document.getElementById(id);

  const T = {
    ko: {
      test: '\ud14c\uc2a4\ud2b8 \ubaa8\ub4dc',
      hero: '\ubc29\uccad \ub2f9\ucca8\uc790 \uc815\ubcf4 \ub4f1\ub85d',
      s1: '\ub2f9\ucca8\uc790 \ud655\uc778',
      s1d: '\ud604\uc7ac \ud14c\uc2a4\ud2b8 \ubaa8\ub4dc\uc785\ub2c8\ub2e4. \uc544\ubb34 \uc774\uba54\uc77c\uacfc \ub2c9\ub124\uc784\uc73c\ub85c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.',
      email: 'Muniverse \uac00\uc785 \uc774\uba54\uc77c',
      nick: 'Muniverse \ub2c9\ub124\uc784',
      consent: '[\ud544\uc218] \uac1c\uc778\uc815\ubcf4 \uc218\uc9d1\u00b7\uc774\uc6a9\uc5d0 \ub3d9\uc758\ud569\ub2c8\ub2e4.',
      privacyTitle: '\uac1c\uc778\uc815\ubcf4 \uc218\uc9d1\u00b7\uc774\uc6a9 \uc548\ub0b4',
      privacy: '\ud604\uc7ac \ud14c\uc2a4\ud2b8 \ubaa8\ub4dc\uc5d0\uc11c\ub294 \uc785\ub825\ud55c \uac1c\uc778\uc815\ubcf4\ub97c DB\uc5d0 \uc800\uc7a5\ud558\uac70\ub098 \uc774\uba54\uc77c\ub85c \ubc1c\uc1a1\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.',
      verify: '\ud655\uc778 \ud6c4 \ub2e4\uc74c',
      verified: '\ud655\uc778\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
      missingIdentity: '\uc774\uba54\uc77c\uacfc \ub2c9\ub124\uc784\uc744 \ubaa8\ub450 \uc785\ub825\ud574 \uc8fc\uc138\uc694.',
      consentNeeded: '\uac1c\uc778\uc815\ubcf4 \uc218\uc9d1\u00b7\uc774\uc6a9 \ub3d9\uc758\uac00 \ud544\uc694\ud569\ub2c8\ub2e4.',
      network: '\uc11c\ubc84 \uc5f0\uacb0\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.',
      s2: '\ubc29\uccad\uc790 \uc815\ubcf4 \uc785\ub825',
      s2d: '\ub179\ud654 \ub2f9\uc77c \ubcf8\uc778 \ud655\uc778\uacfc \uc548\ub0b4\uc5d0 \uc0ac\uc6a9\ud560 \uc815\ubcf4 \uc785\ub825 \ud750\ub984\uc744 \ud14c\uc2a4\ud2b8\ud569\ub2c8\ub2e4.',
      name: '\uc774\ub984', nationality: '\uad6d\uc801', birth: '\uc0dd\ub144\uc6d4\uc77c', phone: '\uc5f0\ub77d\ucc98', contact: '\ubc29\uccad \uc548\ub0b4\uc6a9 \uc774\uba54\uc77c',
      hint: '\ud574\uc678 \ubc88\ud638\ub294 \ubb38\uc790 \uc218\uc2e0\uc774 \uc5b4\ub824\uc6b8 \uc218 \uc788\uc5b4 \uc774\uba54\uc77c\ub3c4 \ud568\uaed8 \uc218\uc9d1\ud569\ub2c8\ub2e4.',
      notice: '\ub9cc 15\uc138 \uc774\uc0c1\ub9cc \ucc38\uc5ec\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \ub179\ud654 \ub2f9\uc77c \uc2e0\ubd84\uc99d \uc9c0\ucc38\uc774 \ud544\uc218\uc774\uba70, \ubc29\uccad\uad8c \uc591\ub3c4\u00b7\ud310\ub9e4\u00b7\uba85\uc758 \ubcc0\uacbd\uc740 \ubd88\uac00\ud569\ub2c8\ub2e4. \uc2e4\uc81c \uc6b4\uc601 \uc804\uc5d0 \ub2f9\ucca8\uc790 \uac80\uc99d\uacfc \uc911\ubcf5 \uc81c\ucd9c \ucc28\ub2e8\uc744 \ub2e4\uc2dc \ud65c\uc131\ud654\ud569\ub2c8\ub2e4.',
      submit: '\uc81c\ucd9c \ud14c\uc2a4\ud2b8',
      missing: '\ubaa8\ub4e0 \ud56d\ubaa9\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694.',
      under15: '\ub9cc 15\uc138 \uc774\uc0c1\ub9cc \ubc29\uccad\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.',
      done: '\ud14c\uc2a4\ud2b8 \ub4f1\ub85d\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
      doneDesc: '\ud604\uc7ac \ud14c\uc2a4\ud2b8 \ubaa8\ub4dc\uc774\ubbc0\ub85c \uc785\ub825 \uc815\ubcf4\ub294 \uc800\uc7a5\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.'
    },
    en: {
      test:'TEST MODE',hero:'Audience winner registration',s1:'Verify winner',s1d:'Test mode is active. Any email and nickname can be verified.',email:'Muniverse account email',nick:'Muniverse nickname',consent:'[Required] I agree to the collection and use of personal information.',privacyTitle:'Privacy notice',privacy:'In test mode, entered personal information is not stored or emailed.',verify:'Verify & Continue',verified:'Verified.',missingIdentity:'Enter both email and nickname.',consentNeeded:'Privacy consent is required.',network:'Could not connect to the server. Please try again.',s2:'Attendee information',s2d:'Enter information for the audience registration flow test.',name:'Full name',nationality:'Nationality',birth:'Date of birth',phone:'Phone number',contact:'Email for event notices',hint:'Email is also collected as a fallback for international SMS.',notice:'Participants must be at least 15 years old. Bring a valid ID on the recording day. Transfer, resale, and name changes are not allowed. Real winner verification and duplicate protection will be re-enabled before production.',submit:'Test submit',missing:'Complete all fields.',under15:'Only participants aged 15 or older may attend.',done:'Test registration complete',doneDesc:'No information was stored because test mode is active.'
    },
    ja: {
      test:'\u30c6\u30b9\u30c8\u30e2\u30fc\u30c9',hero:'\u89b3\u89a7\u5f53\u9078\u8005 \u60c5\u5831\u767b\u9332',s1:'\u5f53\u9078\u8005\u78ba\u8a8d',s1d:'\u73fe\u5728\u30c6\u30b9\u30c8\u30e2\u30fc\u30c9\u3067\u3059\u3002\u4efb\u610f\u306e\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u3068\u30cb\u30c3\u30af\u30cd\u30fc\u30e0\u3067\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002',email:'Muniverse\u767b\u9332\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9',nick:'Muniverse\u30cb\u30c3\u30af\u30cd\u30fc\u30e0',consent:'\u3010\u5fc5\u9808\u3011\u500b\u4eba\u60c5\u5831\u306e\u53ce\u96c6\u30fb\u5229\u7528\u306b\u540c\u610f\u3057\u307e\u3059\u3002',privacyTitle:'\u500b\u4eba\u60c5\u5831\u306e\u53d6\u6271\u3044',privacy:'\u30c6\u30b9\u30c8\u30e2\u30fc\u30c9\u3067\u306f\u5165\u529b\u3057\u305f\u500b\u4eba\u60c5\u5831\u3092\u4fdd\u5b58\u30fb\u9001\u4fe1\u3057\u307e\u305b\u3093\u3002',verify:'\u78ba\u8a8d\u3057\u3066\u6b21\u3078',verified:'\u78ba\u8a8d\u3057\u307e\u3057\u305f\u3002',missingIdentity:'\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u3068\u30cb\u30c3\u30af\u30cd\u30fc\u30e0\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',consentNeeded:'\u500b\u4eba\u60c5\u5831\u306e\u53ce\u96c6\u30fb\u5229\u7528\u3078\u306e\u540c\u610f\u304c\u5fc5\u8981\u3067\u3059\u3002',network:'\u30b5\u30fc\u30d0\u30fc\u306b\u63a5\u7d9a\u3067\u304d\u307e\u305b\u3093\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002',s2:'\u89b3\u89a7\u8005\u60c5\u5831\u5165\u529b',s2d:'\u753b\u9762\u3068\u5165\u529b\u30d5\u30ed\u30fc\u306e\u30c6\u30b9\u30c8\u7528\u3067\u3059\u3002',name:'\u6c0f\u540d',nationality:'\u56fd\u7c4d',birth:'\u751f\u5e74\u6708\u65e5',phone:'\u96fb\u8a71\u756a\u53f7',contact:'\u89b3\u89a7\u6848\u5185\u7528\u30e1\u30fc\u30eb',hint:'\u6d77\u5916SMS\u306e\u88dc\u52a9\u3068\u3057\u3066\u30e1\u30fc\u30eb\u3082\u53ce\u96c6\u3057\u307e\u3059\u3002',notice:'\u6e8015\u6b73\u4ee5\u4e0a\u306e\u65b9\u306e\u307f\u53c2\u52a0\u3067\u304d\u307e\u3059\u3002\u53ce\u9332\u5f53\u65e5\u306f\u8eab\u5206\u8a3c\u660e\u66f8\u304c\u5fc5\u8981\u3067\u3001\u89b3\u89a7\u6a29\u306e\u8b72\u6e21\u30fb\u8ca9\u58f2\u30fb\u540d\u7fa9\u5909\u66f4\u306f\u3067\u304d\u307e\u305b\u3093\u3002',submit:'\u30c6\u30b9\u30c8\u9001\u4fe1',missing:'\u3059\u3079\u3066\u306e\u9805\u76ee\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',under15:'\u6e8015\u6b73\u4ee5\u4e0a\u306e\u65b9\u306e\u307f\u89b3\u89a7\u3067\u304d\u307e\u3059\u3002',done:'\u30c6\u30b9\u30c8\u767b\u9332\u5b8c\u4e86',doneDesc:'\u30c6\u30b9\u30c8\u30e2\u30fc\u30c9\u306e\u305f\u3081\u60c5\u5831\u306f\u4fdd\u5b58\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002'
    },
    'zh-CN': {
      test:'\u6d4b\u8bd5\u6a21\u5f0f',hero:'\u73b0\u573a\u89c2\u4f17\u4e2d\u5956\u8005\u4fe1\u606f\u767b\u8bb0',s1:'\u4e2d\u5956\u8005\u9a8c\u8bc1',s1d:'\u5f53\u524d\u4e3a\u6d4b\u8bd5\u6a21\u5f0f\uff0c\u53ef\u4f7f\u7528\u4efb\u610f\u90ae\u7bb1\u548c\u6635\u79f0\u9a8c\u8bc1\u3002',email:'Muniverse \u6ce8\u518c\u90ae\u7bb1',nick:'Muniverse \u6635\u79f0',consent:'\u3010\u5fc5\u9009\u3011\u6211\u540c\u610f\u6536\u96c6\u53ca\u4f7f\u7528\u4e2a\u4eba\u4fe1\u606f\u3002',privacyTitle:'\u4e2a\u4eba\u4fe1\u606f\u8bf4\u660e',privacy:'\u6d4b\u8bd5\u6a21\u5f0f\u4e0b\uff0c\u8f93\u5165\u7684\u4e2a\u4eba\u4fe1\u606f\u4e0d\u4f1a\u4fdd\u5b58\u6216\u53d1\u9001\u90ae\u4ef6\u3002',verify:'\u9a8c\u8bc1\u5e76\u7ee7\u7eed',verified:'\u9a8c\u8bc1\u6210\u529f\u3002',missingIdentity:'\u8bf7\u8f93\u5165\u90ae\u7bb1\u548c\u6635\u79f0\u3002',consentNeeded:'\u5fc5\u987b\u540c\u610f\u4e2a\u4eba\u4fe1\u606f\u6536\u96c6\u53ca\u4f7f\u7528\u3002',network:'\u65e0\u6cd5\u8fde\u63a5\u670d\u52a1\u5668\uff0c\u8bf7\u91cd\u8bd5\u3002',s2:'\u586b\u5199\u89c2\u4f17\u4fe1\u606f',s2d:'\u7528\u4e8e\u6d4b\u8bd5\u9875\u9762\u548c\u8f93\u5165\u6d41\u7a0b\u3002',name:'\u59d3\u540d',nationality:'\u56fd\u7c4d',birth:'\u51fa\u751f\u65e5\u671f',phone:'\u8054\u7cfb\u7535\u8bdd',contact:'\u63a5\u6536\u89c2\u4f17\u901a\u77e5\u7684\u90ae\u7bb1',hint:'\u6d77\u5916\u77ed\u4fe1\u53ef\u80fd\u4e0d\u7a33\u5b9a\uff0c\u56e0\u6b64\u4e5f\u6536\u96c6\u90ae\u7bb1\u3002',notice:'\u4ec5\u9650\u5e74\u6ee115\u5468\u5c81\u8005\u53c2\u52a0\u3002\u5f55\u5236\u5f53\u5929\u5fc5\u987b\u643a\u5e26\u6709\u6548\u8eab\u4efd\u8bc1\u4ef6\u3002\u89c2\u4f17\u8d44\u683c\u4e0d\u5f97\u8f6c\u8ba9\u3001\u51fa\u552e\u6216\u66f4\u6539\u59d3\u540d\u3002',submit:'\u6d4b\u8bd5\u63d0\u4ea4',missing:'\u8bf7\u586b\u5199\u6240\u6709\u9879\u76ee\u3002',under15:'\u4ec5\u9650\u5e74\u6ee115\u5468\u5c81\u8005\u53c2\u52a0\u3002',done:'\u6d4b\u8bd5\u767b\u8bb0\u5b8c\u6210',doneDesc:'\u6d4b\u8bd5\u6a21\u5f0f\u4e0b\u4fe1\u606f\u672a\u88ab\u4fdd\u5b58\u3002'
    },
    'zh-TW': {
      test:'\u6e2c\u8a66\u6a21\u5f0f',hero:'\u73fe\u5834\u89c0\u773e\u4e2d\u734e\u8005\u8cc7\u8a0a\u767b\u8a18',s1:'\u4e2d\u734e\u8005\u9a57\u8b49',s1d:'\u76ee\u524d\u70ba\u6e2c\u8a66\u6a21\u5f0f\uff0c\u53ef\u4f7f\u7528\u4efb\u610f\u4fe1\u7bb1\u8207\u66b1\u7a31\u9a57\u8b49\u3002',email:'Muniverse \u8a3b\u518a\u4fe1\u7bb1',nick:'Muniverse \u66b1\u7a31',consent:'\u3010\u5fc5\u586b\u3011\u6211\u540c\u610f\u8490\u96c6\u53ca\u4f7f\u7528\u500b\u4eba\u8cc7\u6599\u3002',privacyTitle:'\u500b\u4eba\u8cc7\u6599\u8aaa\u660e',privacy:'\u6e2c\u8a66\u6a21\u5f0f\u4e0b\uff0c\u8f38\u5165\u7684\u500b\u4eba\u8cc7\u6599\u4e0d\u6703\u5132\u5b58\u6216\u5bc4\u9001\u90f5\u4ef6\u3002',verify:'\u9a57\u8b49\u4e26\u7e7c\u7e8c',verified:'\u9a57\u8b49\u6210\u529f\u3002',missingIdentity:'\u8acb\u8f38\u5165\u4fe1\u7bb1\u8207\u66b1\u7a31\u3002',consentNeeded:'\u5fc5\u9808\u540c\u610f\u500b\u4eba\u8cc7\u6599\u8490\u96c6\u53ca\u4f7f\u7528\u3002',network:'\u7121\u6cd5\u9023\u7dda\u4f3a\u670d\u5668\uff0c\u8acb\u91cd\u8a66\u3002',s2:'\u586b\u5beb\u89c0\u773e\u8cc7\u8a0a',s2d:'\u7528\u65bc\u6e2c\u8a66\u9801\u9762\u8207\u8f38\u5165\u6d41\u7a0b\u3002',name:'\u59d3\u540d',nationality:'\u570b\u7c4d',birth:'\u51fa\u751f\u65e5\u671f',phone:'\u806f\u7d61\u96fb\u8a71',contact:'\u89c0\u773e\u901a\u77e5\u7528\u96fb\u5b50\u90f5\u4ef6',hint:'\u6d77\u5916\u7c21\u8a0a\u53ef\u80fd\u4e0d\u7a69\u5b9a\uff0c\u56e0\u6b64\u4e5f\u6536\u96c6\u96fb\u5b50\u90f5\u4ef6\u3002',notice:'\u50c5\u9650\u5e74\u6eff15\u6b72\u8005\u53c3\u52a0\u3002\u9304\u5f71\u7576\u5929\u5fc5\u9808\u651c\u5e36\u6709\u6548\u8eab\u5206\u8b49\u4ef6\u3002\u89c0\u773e\u8cc7\u683c\u4e0d\u5f97\u8f49\u8b93\u3001\u8ca9\u552e\u6216\u8b8a\u66f4\u59d3\u540d\u3002',submit:'\u6e2c\u8a66\u63d0\u4ea4',missing:'\u8acb\u586b\u5beb\u6240\u6709\u9805\u76ee\u3002',under15:'\u50c5\u9650\u5e74\u6eff15\u6b72\u8005\u53c3\u52a0\u3002',done:'\u6e2c\u8a66\u767b\u8a18\u5b8c\u6210',doneDesc:'\u6e2c\u8a66\u6a21\u5f0f\u4e0b\u8cc7\u8a0a\u672a\u88ab\u5132\u5b58\u3002'
    }
  };

  let lang = localStorage.getItem('cover_pick_lang') || 'ko';
  if (!T[lang]) lang = 'ko';

  function tr(key) { return T[lang][key] || T.en[key] || key; }
  function setText(id, key) { $(id).textContent = tr(key); }

  function render() {
    document.documentElement.lang = lang;
    $('lang').value = lang;
    setText('testBadge','test'); setText('heroTitle','hero');
    setText('step1Title','s1'); setText('step1Desc','s1d');
    setText('emailLabel','email'); setText('nicknameLabel','nick'); setText('consentLabel','consent');
    setText('privacyTitle','privacyTitle'); setText('privacyText','privacy'); setText('verifyBtn','verify');
    setText('step2Title','s2'); setText('step2Desc','s2d'); setText('nameLabel','name');
    setText('nationalityLabel','nationality'); setText('birthLabel','birth'); setText('phoneLabel','phone');
    setText('contactLabel','contact'); setText('contactHint','hint'); setText('noticeText','notice'); setText('submitBtn','submit');
    setText('doneTitle','done'); setText('doneDesc','doneDesc');
  }

  async function call(action, payload) {
    const response = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      headers: {'content-type':'application/json','x-cover-pick-request':'1'},
      body: JSON.stringify(payload),
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.code || 'API_ERROR');
    return data;
  }

  function setMessage(id, text, isError=false) {
    const el = $(id);
    el.textContent = text || '';
    el.classList.toggle('error', isError);
  }

  function ageOnRecordingDay(dateString) {
    if (!dateString) return -1;
    const birth = new Date(`${dateString}T00:00:00Z`);
    if (Number.isNaN(birth.getTime())) return -1;
    const event = new Date('2026-09-14T00:00:00Z');
    let age = event.getUTCFullYear() - birth.getUTCFullYear();
    const month = event.getUTCMonth() - birth.getUTCMonth();
    if (month < 0 || (month === 0 && event.getUTCDate() < birth.getUTCDate())) age--;
    return age;
  }

  $('lang').addEventListener('change', (e) => {
    lang = e.target.value;
    localStorage.setItem('cover_pick_lang', lang);
    render();
  });

  $('verifyBtn').addEventListener('click', async () => {
    const email = $('email').value.trim();
    const nickname = $('nickname').value.trim();
    if (!email || !nickname) return setMessage('verifyMessage', tr('missingIdentity'), true);
    if (!$('consent').checked) return setMessage('verifyMessage', tr('consentNeeded'), true);

    const btn = $('verifyBtn');
    btn.classList.add('busy'); btn.disabled = true; setMessage('verifyMessage','');
    try {
      await call('verify', {email, nickname});
      setMessage('verifyMessage', tr('verified'));
      $('contactEmail').value = email;
      $('step1').classList.add('hidden');
      $('step2').classList.remove('hidden');
      window.scrollTo({top:0, behavior:'smooth'});
    } catch (_) {
      setMessage('verifyMessage', tr('network'), true);
    } finally {
      btn.classList.remove('busy'); btn.disabled = false;
    }
  });

  $('submitBtn').addEventListener('click', async () => {
    const payload = {
      name: $('name').value.trim(),
      nationality: $('nationality').value.trim(),
      birth_date: $('birthDate').value,
      phone: $('phone').value.trim(),
      contact_email: $('contactEmail').value.trim()
    };
    if (Object.values(payload).some(v => !v)) return setMessage('submitMessage', tr('missing'), true);
    if (ageOnRecordingDay(payload.birth_date) < 15) return setMessage('submitMessage', tr('under15'), true);

    const btn = $('submitBtn');
    btn.classList.add('busy'); btn.disabled = true; setMessage('submitMessage','');
    try {
      await call('submit', payload);
      $('step2').classList.add('hidden');
      $('done').classList.remove('hidden');
      window.scrollTo({top:0, behavior:'smooth'});
    } catch (_) {
      setMessage('submitMessage', tr('network'), true);
    } finally {
      btn.classList.remove('busy'); btn.disabled = false;
    }
  });

  render();
})();
