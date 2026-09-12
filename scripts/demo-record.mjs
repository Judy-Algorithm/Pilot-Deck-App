// Records the Later walkthrough as a video: register, sign in, save three
// belongings, then read them back from Today, My Storage and Search.
// Bilingual narration is injected into the page so it is captured in frame.
//
//   node scripts/demo-record.mjs
//
// Photos are read from demo-cases/ (milk.jpg, warranty.jpg, shoes.jpg).
import {chromium} from 'playwright';
import {existsSync, mkdirSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';

const APP = process.env.DEMO_URL || 'http://localhost:5173';
const CASES = resolve(process.env.DEMO_CASES || 'demo-cases');
const OUT = resolve(process.env.DEMO_OUT || 'demo-out');
const photo = (name) => {
  const file = resolve(CASES, name);
  if (!existsSync(file)) throw new Error(`Missing ${file}. Put the demo photos in ${CASES}: ${readdirSync(CASES).join(', ') || '(empty)'}`);
  return file;
};

const CAPTION = `
/* pointer-events:none keeps the narration from swallowing clicks meant for the app. */
#demo-caption{position:fixed;left:12px;right:12px;bottom:96px;z-index:99999;pointer-events:none;
display:flex;flex-direction:column;gap:3px;padding:12px 16px;border-radius:16px;
background:rgba(16,22,15,.86);color:#fff;font-family:-apple-system,"PingFang SC",sans-serif;
text-align:center;backdrop-filter:blur(8px);opacity:0;transition:opacity .3s ease}
#demo-caption.on{opacity:1}
#demo-caption b{font-size:15px;font-weight:600;line-height:1.45}
#demo-caption span{font-size:12px;line-height:1.4;color:rgba(255,255,255,.72)}`;

async function ensureCaption(page) {
  await page.evaluate((css) => {
    if (document.getElementById('demo-caption')) return;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const bar = document.createElement('div');
    bar.id = 'demo-caption';
    bar.innerHTML = '<b></b><span></span>';
    document.body.appendChild(bar);
  }, CAPTION);
}

// Show one bilingual line and hold it long enough to read.
async function say(page, zh, en, hold = 2600) {
  await ensureCaption(page);
  await page.evaluate(([zh, en]) => {
    const bar = document.getElementById('demo-caption');
    bar.querySelector('b').textContent = zh;
    bar.querySelector('span').textContent = en;
    bar.classList.add('on');
  }, [zh, en]);
  await page.waitForTimeout(hold);
}

async function clearCaption(page) {
  await page.evaluate(() => document.getElementById('demo-caption')?.classList.remove('on'));
  await page.waitForTimeout(400);
}

const addDays = (n) => {
  const d = new Date(Date.now() + n * 86400000);
  return d.toISOString().slice(0, 10);
};

// Upload one photo and confirm what the agent read back.
async function saveCase(page, {file, zhIntro, enIntro, zhRead, enRead, space, deadline, note}) {
  await say(page, zhIntro, enIntro);
  await clearCaption(page);
  await page.click('.fab');
  await page.waitForSelector('.add-actions', {timeout: 15000});
  await page.waitForTimeout(600);
  await page.setInputFiles('input[aria-label="Photo library"]', file);

  await say(page, '上传后，agent 在后台读取凭证', 'The agent reads the evidence in the background', 2200);
  await page.waitForSelector('.name-input', {timeout: 90000});
  await clearCaption(page);
  await page.waitForTimeout(800);

  const read = await page.evaluate(() => ({
    name: document.querySelector('.name-input')?.value,
    kind: document.querySelector('.seg button.on')?.textContent,
    dates: [...document.querySelectorAll('.date-row')].map((r) => r.textContent),
  }));
  console.log('  recognised:', JSON.stringify(read));

  await say(page, zhRead, enRead, 3200);
  await clearCaption(page);

  if (space) {
    await page.click(`.seg button:text-is("${space}")`);
    await page.waitForTimeout(500);
  }
  if (deadline) {
    await say(page, '这张照片没有日期，手动补上退货期限', 'No date on the photo, so set the return deadline by hand', 2400);
    await page.fill('.date-row:nth-of-type(2) input[type=date]', deadline);
    await page.waitForTimeout(600);
    await clearCaption(page);
  }
  if (note) {
    await say(page, '写一句备注，agent 以后据此提醒', 'A note tells the agent what to raise later', 2200);
    await page.fill('.note-row textarea', note);
    await page.waitForTimeout(700);
    await clearCaption(page);
  }

  await page.click('.bottom-bar .btn');
  await page.waitForSelector('.item-name', {timeout: 30000});
  await page.waitForTimeout(1200);
}

async function main() {
  mkdirSync(OUT, {recursive: true});
  const milk = photo('milk.jpg');
  const warranty = photo('warranty.jpg');
  const shoes = photo('shoes.jpg');

  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const context = await browser.newContext({
    viewport: {width: 390, height: 844},
    deviceScaleFactor: 2,
    recordVideo: {dir: OUT, size: {width: 390, height: 844}},
  });
  const page = await context.newPage();

  // 1 — a brand new account
  await page.goto(APP, {waitUntil: 'load', timeout: 30000});
  await page.waitForSelector('.auth', {timeout: 20000});
  await page.waitForTimeout(1200);
  await say(page, 'Later 记住你物品的期限，在该提醒的时候提醒你', 'Later keeps the paper and remembers the date for you', 3400);
  await say(page, '先注册一个全新账号', 'Start by creating a new account', 2400);
  await clearCaption(page);

  await page.click('.auth-actions .btn');
  await page.waitForSelector('.auth-field input', {timeout: 10000});
  await page.waitForTimeout(600);
  const fields = page.locator('.auth-field input');
  await fields.nth(0).type('Judy', {delay: 90});
  await fields.nth(1).type('judy@later.app', {delay: 70});
  await fields.nth(2).type('later1234', {delay: 70});
  await page.waitForTimeout(500);
  await page.click('.auth-form form .btn');

  await page.waitForSelector('.head', {timeout: 20000});
  await page.waitForTimeout(1200);
  await say(page, '刚注册的账号是空的，一切从第一张凭证开始', 'A new account is empty. It starts with one receipt', 3000);
  await clearCaption(page);

  // 2 — three belongings
  await saveCase(page, {
    file: milk,
    zhIntro: '第一件：一盒牛奶，只拍包装上的日期',
    enIntro: 'First: a carton of milk, photographed as it is',
    zhRead: 'agent 认出了商品并读出包装上的保质日期',
    enRead: 'The agent named the product and read the printed dates',
  });
  await page.click('.topnav .icon-btn');
  await page.waitForSelector('.head', {timeout: 15000});
  await page.waitForTimeout(1000);

  await saveCase(page, {
    file: warranty,
    zhIntro: '第二件：MacBook 的 Apple 保修单',
    enIntro: 'Second: the Apple warranty document for a MacBook',
    zhRead: '购买日期和 AppleCare+ 到期日都被自动归到「保修」',
    enRead: 'Purchase date and AppleCare+ end date, filed under Warranty',
  });
  await page.click('.topnav .icon-btn');
  await page.waitForSelector('.head', {timeout: 15000});
  await page.waitForTimeout(1000);

  await saveCase(page, {
    file: shoes,
    zhIntro: '第三件：一双鞋，照片上没有任何日期',
    enIntro: 'Third: a pair of shoes, with no date anywhere on the photo',
    zhRead: '照片读不出日期时，你可以自己补充',
    enRead: 'When the photo carries no date, you supply it',
    space: 'Return',
    deadline: addDays(7),
    note: 'Return window closes in 7 days.',
  });

  // 3 — reading it back
  await page.click('.topnav .icon-btn');
  await page.waitForSelector('.feature', {timeout: 20000});
  await page.waitForTimeout(1200);
  await say(page, 'Today 按紧急程度排列，最近要处理的排在最前', 'Today puts whatever is closest to its deadline first', 3400);
  await clearCaption(page);

  await page.click('.head .avatar');
  await page.waitForSelector('.sheet', {timeout: 10000});
  await page.waitForTimeout(900);
  await say(page, '右上角是个人资料，进入 My Storage', 'The profile opens My Storage', 2600);
  await clearCaption(page);
  await page.click('.sheet .row');
  await page.waitForSelector('.row-card', {timeout: 15000});
  await page.waitForTimeout(1200);
  await say(page, '所有保存过的东西都在这里，可以搜索', 'Everything saved lives here, searchable', 3000);
  await clearCaption(page);

  await page.click('.row-card');
  await page.waitForSelector('.item-name', {timeout: 15000});
  await page.waitForTimeout(1000);
  await say(page, '点进任何一件，都能看到 agent 的解读和原始凭证', 'Each item shows the agent’s read and the original evidence', 3400);
  await page.evaluate(() => window.scrollTo({top: 320, behavior: 'smooth'}));
  await page.waitForTimeout(1600);
  await clearCaption(page);

  // 4 — search (leave the item page first; the tab bar is hidden there)
  await page.click('.topnav .icon-btn');
  await page.waitForSelector('.tabbar', {timeout: 15000});
  await page.waitForTimeout(800);
  await page.click('.tabbar .tab:nth-of-type(3)');
  await page.waitForSelector('.searchbox input', {timeout: 15000});
  await page.waitForTimeout(900);
  await say(page, '搜索任何一件物品', 'Search for anything you saved', 2200);
  await page.type('.searchbox input', 'milk', {delay: 180});
  await page.waitForTimeout(1200);
  await clearCaption(page);
  await page.click('.row-card');
  await page.waitForSelector('.item-name', {timeout: 15000});
  await page.waitForTimeout(1200);
  await say(page, '从搜索进入，同样是解读与凭证', 'From search, the same read and the same evidence', 3200);
  await clearCaption(page);

  await say(page, 'Save now. Remember later.', 'Later', 3000);
  await page.waitForTimeout(800);

  await context.close();
  await browser.close();
  const video = readdirSync(OUT).filter((f) => f.endsWith('.webm')).pop();
  console.log('video:', resolve(OUT, video));
}

main().catch((error) => {
  console.error('demo failed:', error.message);
  process.exit(1);
});
