import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=path.resolve(import.meta.dirname,'..'),host='https://muniverse-official.github.io',origin='https://kkaoerbblpuszptiibvo.supabase.co';
await mkdir(path.join(base,'qa-screenshots'),{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext();
const errors=[];context.on('page',page=>page.on('pageerror',e=>errors.push(e.message)));
await context.route(host+'/music-core-attendee/**',async route=>{const u=new URL(route.request().url());let relative=decodeURIComponent(u.pathname.replace('/music-core-attendee/',''));if(!relative||relative.endsWith('/'))relative+='index.html';const file=path.resolve(base,'qa-music/site',relative);if(!file.startsWith(path.join(base,'qa-music/site')+path.sep))return route.abort();try{const body=await readFile(file);const ext=path.extname(file);return route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[ext]||'text/plain'});}catch{return route.fulfill({status:404})}});
await context.route(host+'/cover-pick-attendee/**',async route=>{let relative=new URL(route.request().url()).pathname.replace('/cover-pick-attendee/','')||'index.html';try{const file=path.join(base,relative),body=await readFile(file);return route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'text/plain'});}catch{return route.fulfill({status:404})}});
let selection='reserve',registered=false;const submissions=[];
const config={ok:true,program:'fans_pick',publishedAt:new Date().toISOString(),openAt:new Date(Date.now()-3600000).toISOString(),closeAt:new Date(Date.now()+3600000).toISOString(),paused:false,testMode:false,eventDateTba:false,eventDate:'2026-09-19',showEventDate:false};
await context.route(origin+'/**',async route=>{let result;
const u=new URL(route.request().url());
if(u.pathname.includes('/storage/'))result=config;
else if(u.searchParams.get('action')==='clock')result={ok:true,serverTime:new Date().toISOString()};
else if(u.searchParams.get('action')==='submit'){submissions.push(route.request().postDataJSON());registered=true;result={ok:true,registered:true,selectionType:selection,deliveryQueued:false,eventDate:'2026-09-19'};}
else result=registered?{ok:false,code:'ALREADY_SUBMITTED',selectionType:selection}:{ok:true,selectionType:selection,token:'mock-only',eventDate:'2026-09-19'};
return route.fulfill({status:result.ok?200:404,contentType:'application/json',headers:{'access-control-allow-origin':host},body:JSON.stringify(result)});
});
try{
const page=await context.newPage();await page.setViewportSize({width:390,height:844});await page.goto(host+'/cover-pick-attendee/');await page.waitForFunction(()=>document.documentElement.dataset.availability==='open');
await page.selectOption('#lang','ko');await page.fill('#email','reserve@example.invalid');await page.fill('#nickname','예비 테스트');await page.locator('.consent-box').click();await page.click('#verifyBtn');await page.locator('#reserve').waitFor({state:'visible'});
assert.equal(await page.locator('#reserveTitle').textContent(),'예비 당첨자로 선정되셨습니다.');assert.match(await page.locator('#reserveBody').textContent(),/개별 연락/);assert.equal(await page.locator('#step2').isVisible(),true);assert.equal(await page.locator('#reserveBack').count(),0);
const titleCopy={ko:'예비 당첨자로 선정되셨습니다.',en:'You have been selected as a reserve winner.',ja:'補欠当選者に選ばれました。','zh-TW':'您已入選候補名單。','zh-CN':'您已入选候补名单。'};
const doneCopy={ko:'예비 당첨자 정보 등록 완료',en:'Reserve winner information registered',ja:'補欠当選者情報の登録が完了しました','zh-TW':'候補中獎者資料登記完成','zh-CN':'候补中奖者信息登记完成'};
const caveat={ko:/방청이 확정되지 않습니다/,en:/does not confirm attendance/,ja:/観覧は確定しません/,'zh-TW':/不代表已確定/,'zh-CN':/不代表已确定/};
const fields=['#name','#birthDate','#koreanPhone','#xAccount','#contactEmail'];
for(const lang of ['en','ja','zh-TW','zh-CN','ko']){await page.selectOption('#lang',lang);assert.equal(await page.locator('#reserveTitle').textContent(),titleCopy[lang]);assert.ok((await page.locator('#reserveInstruction').textContent()).length>15);assert.equal(await page.locator('#reserve').isVisible(),true);for(const id of fields)assert.equal(await page.locator(id).isVisible(),true,id+' same field');}
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.screenshot({path:path.join(base,'qa-screenshots/reserve-mobile.png'),fullPage:true});
await page.click('#submitBtn');assert.equal(submissions.length,0);assert.ok((await page.locator('#submitMessage').textContent()).length>0);
await page.fill('#name','Reserve QA');await page.fill('#birthDate','2000-01-01');await page.locator('label').filter({has:page.locator('input[name="nationalityMode"][value="NON_KR"]')}).click();await page.selectOption('#country','JP');await page.locator('label').filter({has:page.locator('input[name="phoneMode"][value="INTL"]')}).click();await page.fill('#internationalPhone','+81 90 1234 5678');await page.fill('#xAccount','@reserve_qa');await page.click('#submitBtn');await page.locator('#done').waitFor({state:'visible'});
assert.equal(submissions.length,1);assert.equal(submissions[0].name,'Reserve QA');assert.equal(submissions[0].nationality,'JP');assert.equal(submissions[0].birth_date,'2000-01-01');assert.equal(submissions[0].phone,'+819012345678');assert.equal(submissions[0].x_account,'@reserve_qa');assert.equal(submissions[0].contact_email,'reserve@example.invalid');assert.equal(await page.locator('#step2').isVisible(),false);assert.equal(await page.locator('#reserve').isVisible(),false);
for(const lang of ['en','ja','zh-TW','zh-CN','ko']){await page.selectOption('#lang',lang);assert.equal(await page.locator('#doneTitle').textContent(),doneCopy[lang]);assert.match(await page.locator('#doneDesc').textContent(),caveat[lang]);}
await page.screenshot({path:path.join(base,'qa-screenshots/reserve-registered-mobile.png'),fullPage:true});
async function lookup(email,nickname){await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.availability==='open');await page.selectOption('#lang','ko');await page.fill('#email',email);await page.fill('#nickname',nickname);await page.locator('.consent-box').click();await page.click('#verifyBtn');}
await lookup('reserve@example.invalid','예비 테스트');await page.locator('#already').waitFor({state:'visible'});
for(const lang of ['en','ja','zh-TW','zh-CN','ko']){await page.selectOption('#lang',lang);await page.waitForFunction(()=>document.querySelector('#alreadyMessage').textContent.length>0);assert.match(await page.locator('#alreadyReserveNote').textContent(),caveat[lang]);assert.match(await page.locator('#alreadyMessage').textContent(),/예비|reserve|補欠|候補|候补/);}
selection='primary';registered=false;await lookup('primary@example.invalid','본 테스트');await page.locator('#step2').waitFor({state:'visible'});assert.equal(await page.locator('#reserve').isVisible(),false);for(const id of fields)assert.equal(await page.locator(id).isVisible(),true);
await page.fill('#name','Primary QA');await page.fill('#birthDate','2000-01-01');await page.fill('#koreanPhone','01012345678');await page.fill('#xAccount','@primary_qa');await page.click('#submitBtn');await page.locator('#done').waitFor({state:'visible'});assert.equal(submissions.length,2);assert.doesNotMatch(await page.locator('#doneTitle').textContent(),/예비/);
assert.deepEqual(errors,[]);console.log('PASS FANS PICK reserve registration, required fields, five languages, repeated lookup and primary registration');
}finally{await browser.close()}
