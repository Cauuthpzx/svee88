import https from 'https';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'icons8-fluency-business');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// All business icons with ID and commonName from Icons8 API
const icons = [
  // Batch 1 (offset 0)
  {id:"Xvgz6ComUhTH",name:"business-1"},{id:"13539",name:"business"},{id:"4gURKWl6bT1u",name:"business-goal"},{id:"4y5FyfJdxJ3h",name:"my-bussiness"},{id:"103978",name:"business-report"},{id:"103932",name:"client-company"},{id:"13548",name:"business-contact"},{id:"18901",name:"small-business"},{id:"mpguOF4lje5K",name:"big-eats-small"},{id:"503j6SdYoAjV",name:"creative-commons-by"},{id:"O713QAUVtMnH",name:"rank"},{id:"AiQl68c2wBxW",name:"complaint"},{id:"zSQn3y9iquS0",name:"bribery"},{id:"naDnVpQ3BNkR",name:"portfolio"},{id:"q7LHVXMYOprT",name:"satisfaction"},{id:"EUM1sHPZXmLO",name:"privacy-policy"},{id:"30477",name:"complaints"},{id:"108334",name:"conference-skin-type-7"},{id:"WYjftAA1GZOF",name:"cover-up"},{id:"12368",name:"medium-priority"},{id:"CFFVJs7cRGxS",name:"slice"},{id:"9eHeCmCgxxbX",name:"salesman-skin-type-4"},{id:"F4acP4fvdWXU",name:"real-estate-agent-skin-type-4"},{id:"M7SHc6j8x8PI",name:"administrator-male-skin-type-1"},{id:"1wOILhZiKNMY",name:"marriott-hotels"},{id:"Sn2hY7aKAbJ9",name:"creative-commons-remix"},{id:"eemjIaM30ISd",name:"administrator-male-skin-type-4"},{id:"yqC1lzGLFAQm",name:"creative-commons-nd"},{id:"xEu7rh8lgJCl",name:"travel-agency"},{id:"V5Kk4nDElTAD",name:"atlassian-confluence"},{id:"12813",name:"scatter-plot"},{id:"13979",name:"xing"},{id:"ipB3w422Q4br",name:"car-sale"},{id:"8oJuaAFwq6vn",name:"salesman"},{id:"13010",name:"shop"},{id:"21001",name:"bbc-logo"},{id:"KfJseF7y0QPW",name:"ubisoft"},{id:"35859",name:"submt-idea"},{id:"103408",name:"company"},{id:"ccnDpWW9Rcdw",name:"administrator-male-skin-type-2"},{id:"fCtvaTDdAVMD",name:"remax"},{id:"13023",name:"sell"},{id:"0zy7lQ66ltnN",name:"creative-commons-commercial"},{id:"uA7LOmGReY2V",name:"headline"},{id:"1KqVicbOW8M3",name:"40-percents"},{id:"YdSocs3LKhgN",name:"salesman-skin-type-3"},{id:"5GKV0BxduhCw",name:"internship"},{id:"fcKpGwAbxxfP",name:"google-analytics"},{id:"E3LXX36F5CiI",name:"administrator-male-skin-type-5"},{id:"5RkvwOlQiHpJ",name:"agree"},{id:"rrsDuB2OFLnr",name:"creative-commons-all-rights-reserved"},{id:"NfGoJxFUAdq5",name:"real-estate-agent-skin-type-3"},{id:"eM3Phy3a1hZN",name:"salesman-skin-type-1"},{id:"dab2tZoidPfS",name:"vestige"},{id:"VGwh4Kj8jTOE",name:"export-collections"},{id:"aemAJ33A8uDo",name:"port"},{id:"utiKBYyMZ6Ba",name:"cisco-webex-meetings"},{id:"qRw39Ga7doP7",name:"collaborating-in-circle"},{id:"0deQ8Ours5Yg",name:"language-skill"},{id:"stAq15Oezrpl",name:"real-estate-agent-skin-type-2"},{id:"SROvvC91x7DL",name:"analytics"},{id:"FiHkOhXP0khj",name:"creative-commons-pd"},{id:"hyqK1oqL2L3R",name:"60-percents"},{id:"S5Y2VZahXoH9",name:"tidal"},{id:"9i9Pl6sOAQwO",name:"creative-commons-sa"},{id:"RsKuo8tsFP3Q",name:"administrator-male-skin-type-3"},{id:"8zUQhUZNTATf",name:"real-estate-agent-skin-type-1"},{id:"g8rsmDGZv9Uw",name:"bankrupt"},{id:"JCUz1r1VVqWK",name:"creative-commons-zero"},{id:"SkulAzFK58lm",name:"group-of-companies"},{id:"Ies5ekctQmH9",name:"hurry"},{id:"8IxldQ0K5YRz",name:"salesman-skin-type-2"},{id:"13525",name:"shipped"},{id:"YtVwIRgiyeX0",name:"real-estate-agent-skin-type-5"},{id:"cmAKesTKuYmE",name:"salesman-skin-type-5"},{id:"1Oexg4nLORo5",name:"onboarding"},{id:"UvtPEes6zryO",name:"creative-commons-nc"},{id:"NnGjehEt1Anp",name:"creative-commons-share"},{id:"uZYDM2YjDmOA",name:"wellsfargo"},{id:"16384",name:"stapler"},{id:"104233",name:"project-management"},{id:"16386",name:"paper-clamp"},{id:"9U0cvIxdYkng",name:"fast-track"},{id:"wjmIz86BWbyf",name:"linkedin-circled--v4"},{id:"kFJzAZryEscq",name:"linkedin-circled--v3"},{id:"114445",name:"linkedin-circled"},{id:"GNvM541FBQu7",name:"linkedin-circled--v2"},{id:"PmVIP6qPDgZv",name:"linkedin-circled--v5"},{id:"K2e3XRZlbIp2",name:"office"},{id:"15657",name:"meeting"},{id:"13547",name:"organization"},{id:"mvWJErZzJEcK",name:"project-setup"},{id:"13232",name:"currency"},{id:"20777",name:"refund"},{id:"19844",name:"crowdfunding"},{id:"63221",name:"rebalance-portfolio"},{id:"13930",name:"linkedin"},{id:"k3TB9aqrLpwq",name:"sale--v3"},{id:"13123",name:"new-product"},{id:"63206",name:"sale"},
  // Batch 2 (offset 100)
  {id:"13527",name:"businesswoman"},{id:"R4bD37AVDMph",name:"man-with-money"},{id:"qerRQWBCmFLD",name:"airport-building"},{id:"13542",name:"parallel-tasks"},{id:"13731",name:"contact-card"},{id:"104229",name:"project"},{id:"73FzjxcPcYuF",name:"manzana"},{id:"104228",name:"new-contact"},{id:"13027",name:"briefcase"},{id:"47454",name:"merchant-account"},{id:"ftv3foQkv3DY",name:"order-completed"},{id:"59184",name:"ledger"},{id:"122811",name:"people-working-together"},{id:"3WwjkT45sYrS",name:"press-kit"},{id:"63269",name:"service-mark"},{id:"43096",name:"sprint-iteration"},{id:"114323",name:"leadership"},{id:"47roIg7hqbZd",name:"leadership--v2"},{id:"12002",name:"department"},{id:"23278",name:"add-user-group-woman-woman"},{id:"13163",name:"school-director"},{id:"KxVPhAdHCn8j",name:"walesonline-logo"},{id:"12208",name:"handshake"},{id:"TPAsV6Sqk7pu",name:"handshake--v2"},{id:"qYfwpsRXEcpc",name:"power-bi"},{id:"40465",name:"podio"},{id:"13519",name:"businessman"},{id:"ovTJRuVq9f3b",name:"secretary-woman"},{id:"Ny0t2MYrJ70p",name:"power-bi-2021"},{id:"dpzXEznS-uVo",name:"bbb"},{id:"18360",name:"oil-offshore-rig"},{id:"23232",name:"identification-documents"},{id:"WI2430i4UecN",name:"downtown"},{id:"9Kvi1p1F0tUo",name:"tableau-software"},{id:"12313",name:"manager"},{id:"nUU5CmiUuPM2",name:"greedy"},{id:"nrEFWOZ9YrxK",name:"attract-customers"},{id:"63504",name:"new-company"},{id:"cYvyO429iKfr",name:"visa-stamp"},{id:"13545",name:"org-unit"},{id:"sI6ewl9liy1D",name:"photocopier"},{id:"13562",name:"serial-tasks"},{id:"86098",name:"lost-opportunity"},{id:"86100",name:"opportunity"},{id:"63201",name:"viacoin"},{id:"cUn1sl6y4Whd",name:"realtime-database"},{id:"87330",name:"google-firebase-console"},{id:"x4DPVcJ7BuBu",name:"hand-out"},{id:"pnqNrhSZPBJj",name:"staff"},{id:"aoy8nOwoutQY",name:"cash-back-card"},{id:"63272",name:"trademark"},{id:"mPGqFM7tLdfV",name:"cash-back"},{id:"rxLGOgDDtfqX",name:"fast-track-female"},{id:"uSHYbs6PJfMT",name:"shopify"},{id:"tL0ju6exnnS2",name:"product-knowledge"},{id:"63765",name:"goal"},{id:"103412",name:"sales-channels"},{id:"49Vr71WHkc6c",name:"ordinator"},{id:"rMoP9fdy7jJa",name:"transfer-money"},{id:"cA6IhNFdjYHc",name:"card-exchange--v2"},{id:"63529",name:"card-exchange"},{id:"AZdybqR3xsWC",name:"rich"},{id:"16183",name:"agreement"},{id:"HOaunZsdV3cV",name:"purchase-for-euro"},{id:"13532",name:"ratings"},{id:"IQoGuxn2kFxM",name:"bradesco"},{id:"104077",name:"group-task"},{id:"2d0VB7OgIEgb",name:"methodology"},{id:"22539",name:"money"},{id:"zm6VoLdCd3Jh",name:"money--v2"},{id:"104232",name:"link-company-child"},{id:"63197",name:"swedish-krona"},{id:"ogqZERiwxSgV",name:"refusing"},{id:"45080",name:"aliexpress"},{id:"13133",name:"move-by-trolley"},{id:"8QASwqAzA6XX",name:"man-holding-bags-with-money-skin-type-3"},{id:"9fJqCj34nBdt",name:"man-holding-bags-with-money-skin-type-5"},{id:"5wLqfo401Utw",name:"man-holding-bags-with-money-skin-type-1"},{id:"C4TKplJhdeee",name:"man-holding-bags-with-money-skin-type-4"},{id:"V4kg4um6dffu",name:"man-holding-bags-with-money"},{id:"lHryJimxqd9n",name:"man-holding-bags-with-money-skin-type-2"},{id:"21280",name:"black-tie"},{id:"103933",name:"commercial-development-management"},{id:"FLNAa0uEX7XA",name:"commercial-development-management--v2"},{id:"zOIFfKvrWdYz",name:"commercial-development-management--v3"},{id:"5JczT9beFF7q",name:"commercial-development-management--v4"},{id:"JuOolQbf2O7K",name:"commercial-development-management--v5"},{id:"w9tKW2IR6pYt",name:"commercial-development-management--v6"},{id:"7rOWVa2g5Rok",name:"commercial-development-management--v7"},{id:"VtWFJXFKPRu8",name:"commercial-development-management--v8"},{id:"nt6xs95tdCdA",name:"allocate"},{id:"FZOlSfo3osM1",name:"workspace-one"},{id:"20913",name:"sellsy"},{id:"24460",name:"blockchain"},{id:"84736",name:"blockchain-technology"},{id:"20915",name:"british-airways"},{id:"s-10x6ABTRbE",name:"daf"},
];

// Deduplicate by id
const seen = new Set();
const uniqueIcons = icons.filter(icon => {
  if (seen.has(icon.id)) return false;
  seen.add(icon.id);
  return true;
});
console.log(`Total unique business icons to download: ${uniqueIcons.length}`);

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function downloadAll() {
  let success = 0;
  let failed = 0;
  const failures = [];
  const CONCURRENCY = 5;

  for (let i = 0; i < uniqueIcons.length; i += CONCURRENCY) {
    const batch = uniqueIcons.slice(i, i + CONCURRENCY);
    const promises = batch.map(async ({ id, name }) => {
      const safeName = name.replace(/^-+/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || name;
      const filename = `${safeName}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
        success++;
        return;
      }

      const url = `https://img.icons8.com/?size=512&id=${id}&format=png&color=000000`;
      try {
        await downloadFile(url, filepath);
        const size = fs.statSync(filepath).size;
        if (size < 500) {
          fs.unlinkSync(filepath);
          throw new Error('File too small');
        }
        success++;
        process.stdout.write(`\r  Downloaded: ${success}/${uniqueIcons.length} | Failed: ${failed}`);
      } catch (err) {
        failed++;
        failures.push({ name, id, error: err.message });
        process.stdout.write(`\r  Downloaded: ${success}/${uniqueIcons.length} | Failed: ${failed}`);
      }
    });
    await Promise.all(promises);
  }

  console.log(`\n\nDone! Success: ${success}, Failed: ${failed}`);
  if (failures.length > 0) {
    console.log(`\nFailed icons (${failures.length}):`);
    failures.forEach(f => console.log(`  - ${f.name} (${f.id}): ${f.error}`));
  }
}

downloadAll();
