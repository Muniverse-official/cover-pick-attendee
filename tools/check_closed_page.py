#!/usr/bin/env python3
"""Verify the approved FANS PICK design and fail-closed, administrator-driven gate.

The homepage may now reopen within the administrator's configured window.
Registration controls must stay hidden until the shared availability gate opens.
No winner lookups, personal-data submissions, or administrator logins are made.
"""
from __future__ import annotations
import argparse, hashlib, json, os, shutil, subprocess, tempfile, time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
ROOT=Path(__file__).resolve().parents[1]
PUBLIC_URL='https://muniverse-official.github.io/cover-pick-attendee/'
CONFIG_URL='https://kkaoerbblpuszptiibvo.supabase.co/functions/v1/attendee-config?program=fans_pick'
SHARED={'/music-core-attendee/availability.css','/music-core-attendee/availability.js'}
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=set();self.assets=[];self.scripts=[];self.availability=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.ids.add(a.get('id',''))
  if tag=='html':self.availability=a.get('data-availability')
  if tag=='link' and a.get('rel')=='stylesheet':self.assets.append(a.get('href',''))
  if tag=='script':self.scripts.append(a.get('src',''));self.assets.append(a.get('src',''))
def validate(raw,source=True):
 text=raw.decode('utf-8');page=Page();page.feed(text)
 if not {'closedCard','closedTitle','closedDesc','step1','step2','verifyBtn','submitBtn'}<=page.ids:raise ValueError('Availability panel or registration controls missing')
 if source and page.availability!='blocked':raise ValueError('Homepage must fail closed before configuration loads')
 if '/music-core-attendee/availability.js' not in [urlsplit(s).path for s in page.scripts]:raise ValueError('Approved availability gate missing')
 if any('deadline-ui.js' in s or 'closed-page.js' in s for s in page.scripts):raise ValueError('Conflicting legacy gate detected')
 if 'connect-src https://kkaoerbblpuszptiibvo.supabase.co' not in text:raise ValueError('Unexpected API origin policy')
 return page
def fetch(url):
 with urlopen(Request(url,headers={'User-Agent':'Attendee-Pages-Verification/3.0'}),timeout=15) as r:
  if r.status!=200:raise ValueError(f'HTTP {r.status}')
  return r.read()
def capture(url,output):
 chrome=next((p for n in ('google-chrome','google-chrome-stable','chromium') if(p:=shutil.which(n))),None)
 if not chrome:raise RuntimeError('Chrome missing')
 output.mkdir(parents=True,exist_ok=True)
 for label,size in (('desktop','1000,850'),('mobile','390,844')):
  config=json.loads(fetch(CONFIG_URL));expected='open' if config.get('state')=='OPEN' else 'blocked'
  with tempfile.TemporaryDirectory(prefix='fans-browser-') as profile:
   result=subprocess.run([chrome,'--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--hide-scrollbars','--force-device-scale-factor=1',f'--user-data-dir={profile}',f'--window-size={size}','--virtual-time-budget=5000','--dump-dom',f'--screenshot={output/(label+".png")}',url],capture_output=True,timeout=60,check=True)
   dom=validate(result.stdout,source=False)
   if dom.availability!=expected:raise ValueError('Rendered availability does not match server configuration')
   if config.get('state')=='CLOSED' and '방청 발표가 마감되었습니다.' not in result.stdout.decode('utf-8'):raise ValueError('Approved closure message missing')
   (output/(label+'-dom.html')).write_bytes(result.stdout)
   print(f'LIVE BROWSER PASS {label}: state={config.get("state")}; gate={dom.availability}',flush=True)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--url');parser.add_argument('--screenshots',type=Path);args=parser.parse_args();expected=(ROOT/'index.html').read_bytes();page=validate(expected)
 for asset in page.assets:
  path=urlsplit(asset).path
  if path in SHARED:continue
  if not asset.startswith('./') or not(ROOT/path).is_file():raise ValueError(f'Unexpected or missing asset: {asset}')
 print('SOURCE PASS: fail-closed markup; shared gate; branded closure panel retained',flush=True)
 if not args.url:return
 if args.url.rstrip('/')+'/'!=PUBLIC_URL:raise ValueError('Unexpected publication target')
 end=time.monotonic()+230;fresh=PUBLIC_URL+'?v='+hashlib.sha256(expected).hexdigest()[:16]
 while True:
  try:
   for url in (PUBLIC_URL,fresh):
    raw=fetch(url);validate(raw)
    if raw!=expected:raise ValueError('Published HTML differs from source')
   for asset in page.assets:
    live=fetch(urljoin(PUBLIC_URL,asset));path=urlsplit(asset).path
    if path not in SHARED and live!=(ROOT/path).read_bytes():raise ValueError(f'Asset not converged: {asset}')
    if path.endswith('/availability.css') and b'data-availability' not in live:raise ValueError('Fail-closed CSS missing')
   break
  except Exception as e:
   if time.monotonic()>end:raise
   print(f'Waiting for publication: {e}',flush=True);time.sleep(8)
 print('LIVE HTTP PASS: published HTML/assets match; approved shared gate present',flush=True)
 if args.screenshots:capture(fresh,args.screenshots)
 if os.environ.get('GITHUB_STEP_SUMMARY'):
  with open(os.environ['GITHUB_STEP_SUMMARY'],'a',encoding='utf-8')as out:out.write('## FANS PICK schedule gate verified\n\nApproved closed design retained. Registration controls are only visible when the administrator-controlled window is open.\n')
if __name__=='__main__':main()
