import https from 'https';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'icons8-fluency-app');

// All icons with ID and commonName from Icons8 API (id|commonName)
const icons = [
  // Batch 1 (offset 0)
  {id:"63788",name:"apple-app-store"},{id:"fKXXelWgP1B6",name:"apple-app-store--v3"},{id:"118619",name:"tinder"},{id:"63316",name:"spotify"},{id:"JBDiZwh5LGP3",name:"spotify--v3"},{id:"20519",name:"netflix"},{id:"kM0cd7be1NC1",name:"tiktok--v2"},{id:"118640",name:"tiktok"},{id:"M725CLW4L7wE",name:"discord--v2"},{id:"60469",name:"twitter-squared"},{id:"108842",name:"viber"},{id:"13912",name:"facebook"},{id:"OcH8C89hZ9SZ",name:"quizlet"},{id:"FZOlSfo3osM1",name:"workspace-one"},{id:"OYtBxIlJwMGA",name:"phone-pe"},{id:"anOixXmhg0XE",name:"microsoft-planner-2019"},{id:"lAWjO4LexGga",name:"canva"},{id:"pY2bcYb7nGEW",name:"google-one"},{id:"4Mc1R5t6NdTD",name:"roku"},{id:"hylX6EPAOYOQ",name:"ibis-paint-x"},{id:"vzOZWe7EiFAC",name:"play-games"},{id:"HDN7L1bEX0XG",name:"yandex-drive"},{id:"XXstpx6zCu9y",name:"lunacy-new"},{id:"3ov4bPH7QfYB",name:"color-widgets"},{id:"F6H2fsqXKBwH",name:"notion"},{id:"FUwceJUAs8kb",name:"notion--v2"},{id:"ThRvGefstewL",name:"adobe-scan"},{id:"A9Yu0Sfpf7h2",name:"windows-defender"},{id:"4ZmeN8MJXdn9",name:"skillshare"},{id:"13983",name:"youtube"},{id:"3lD0uoEr2qZa",name:"youtube--v2"},{id:"p4rU35mvmXMQ",name:"youtube--v3"},{id:"QMpOneRGvpws",name:"accuweather"},{id:"34945",name:"shazam"},{id:"13669",name:"soundcloud"},{id:"20494",name:"hulu"},{id:"0m71tmRjlxEe",name:"zalo"},{id:"63304",name:"itunes"},{id:"MFaX6nJlDgiU",name:"todoist"},{id:"118497",name:"facebook-new"},{id:"30464",name:"google-docs"},{id:"ZSYgDi4fFbDc",name:"google-docs--v2"},{id:"2HLblWmpNcuQ",name:"camscanner"},{id:"DcygmpZqBEd9",name:"google-maps-new"},{id:"EfMn8k9jB5Fg",name:"touch-opera"},{id:"E1Io1QTAzIaF",name:"goodnotes"},{id:"19318",name:"youtube-play"},{id:"OQw4CZcC7K3C",name:"windscribe"},{id:"WWBvMGOIYALS",name:"dymo-connect"},{id:"106741",name:"lastpass"},{id:"ad8rYYTOKcyQ",name:"student-vue"},{id:"4ESQSg1Xprvl",name:"bitwarden"},{id:"21624",name:"ios-application-placeholder"},{id:"HeJHeV0rkObx",name:"team-snap"},{id:"19979",name:"dashcube"},{id:"63301",name:"ibeacon"},{id:"mKRoptcMjdDf",name:"zedge"},{id:"yOn9Tx2zUQuZ",name:"google-docs--v3"},{id:"20469",name:"hbo-go"},{id:"13661",name:"google-news"},{id:"A2ME5jtXkheX",name:"calendar-app"},{id:"EWzVSK2hyV9H",name:"telegram-app--v2"},{id:"7jrHorBRorpX",name:"telegram-app--v3"},{id:"MIMjVKoXINIT",name:"telegram-app--v4"},{id:"25n4hOEoY7ss",name:"telegram-app--v5"},{id:"63306",name:"telegram-app"},{id:"21746",name:"line-me"},{id:"wAf9QrUv1xSD",name:"spark-logo"},{id:"3ObE1fQSwgCn",name:"apple-fitness"},{id:"32323",name:"instagram-new"},{id:"ZRiAFreol5mE",name:"instagram-new--v2"},{id:"J6pBf3G6DZGM",name:"imessage"},{id:"30843",name:"google-photos"},{id:"g0O6cMpaOTj0",name:"shortcuts"},{id:"20419",name:"facebook-messenger"},{id:"fOcYhPvJWEv3",name:"facebook-messenger--v2"},{id:"ZdtiMuVlxCyi",name:"facebook-messenger--v5"},{id:"67001",name:"oovoo"},{id:"Ei4ZhVQvIMHE",name:"prometheus-app"},{id:"30655",name:"google-keep"},{id:"114441",name:"facebook-circled"},{id:"aP2AQnuFNo85",name:"facebook-circled--v2"},{id:"RKyEJ3DPnVXk",name:"facebook-circled--v3"},{id:"lRtQAp17Ei7V",name:"facebook-circled--v4"},{id:"CtrV2SV33rD9",name:"facebook-circled--v5"},{id:"41222",name:"bluestacks"},{id:"qpuOQzhOVZ0a",name:"amazon-kindle"},{id:"CdptRhPn3Xn0",name:"monzo"},{id:"CB8RecJzLKk2",name:"gaana"},{id:"5RcHTSNy4fbL",name:"bhim"},{id:"ZNtQCzldxlMj",name:"app-distribution"},{id:"NsCIoEt5vdsV",name:"study-bunny"},{id:"7IUXaatN5qNL",name:"weather-bug"},{id:"mf5Zl1ZPLPVG",name:"measure"},{id:"13963",name:"twitter"},{id:"xWVjuc9hryql",name:"twitter--v2"},{id:"zXhRTdxWEKE5",name:"twitter--v3"},{id:"ULM26f07x6SD",name:"twitter--v4"},{id:"P7UIlhbpWzZm",name:"gmail-new"},{id:"S00OGZLUzaz9",name:"triller-app"},
  // Batch 2 (offset 100)
  {id:"19622",name:"odnoklassniki"},{id:"nTLVtpxsNPaz",name:"mercado-pago"},{id:"13657",name:"dropbox"},{id:"19978",name:"slack"},{id:"20905",name:"yelp"},{id:"PzQe0PIZabip",name:"microsoft-teams-2025"},{id:"5E24fZ9ORelo",name:"bilibili"},{id:"9pogsim4zHfB",name:"microsoft-onedrive-2025"},{id:"jRmjA1TGgpLs",name:"ancestry"},{id:"Ybi8ywicoCfB",name:"cms"},{id:"EqxMzyq5jqdz",name:"microsoft-word-2025"},{id:"dqlXCvQrhIDX",name:"snapseed"},{id:"101664",name:"linux-mint"},{id:"117566",name:"skype-2019--v2"},{id:"7csVZvHoQrLW",name:"zoom"},{id:"c70ES3kZFhLz",name:"dynamics-365"},{id:"60037",name:"google-calendar"},{id:"WKF3bm1munsk",name:"google-calendar--v2"},{id:"OsYb6orOaOVV",name:"yolo"},{id:"pE97I4t7Il9M",name:"google-meet"},{id:"8NWdsOk0dw5s",name:"google-meet--v3"},{id:"DiGZkjCzyZXn",name:"cursor-ai"},{id:"vndRkJftsYKS",name:"depop-logo"},{id:"Lk2Q5FRKDWGI",name:"express"},{id:"ZoxjA0jZDdFZ",name:"kotlin"},{id:"JGUF5JEj6n3J",name:"anki"},{id:"qjbTrcfmKDpq",name:"microsoft-sharepoint-2025"},{id:"r4WYZ1U1Rca9",name:"google-assistant"},{id:"lTgaraGSnTgk",name:"google-assistant--v2"},{id:"PDvKwBMp7F4n",name:"sirius-xm"},{id:"jQspry5Tmnu5",name:"wallpaper-engine"},{id:"jDBdOdLAtiTa",name:"logic-pro-x"},{id:"63801",name:"safari"},{id:"51974",name:"xcode"},{id:"38792",name:"virtualbox"},{id:"68104",name:"launch-box"},{id:"41495",name:"imvu"},{id:"37246",name:"gmail"},{id:"tnnUFgHrPmR0",name:"gmail--v2"},{id:"36210",name:"waze"},{id:"31085",name:"heroku"},{id:"32480",name:"deezer"},{id:"32215",name:"google-maps"},{id:"38641",name:"xamarin"},{id:"20797",name:"google-wallet"},{id:"63204",name:"skype"},{id:"13653",name:"ms-one-note"},{id:"YWOidjGxCpFW",name:"deepseek"},{id:"cMcoaHrBqlbp",name:"google-my-maps"},{id:"y5utoW4FUM92",name:"microsoft-excel-2025"},{id:"RUIFhdJm8fbJ",name:"microsoft-outlook-2025"},{id:"L7OJwxgQue0k",name:"byjus"},{id:"mTYp2rELH4P2",name:"ozon"},{id:"kUwZnzomzbTj",name:"mpesa"},{id:"CUVeX1Xqt1IS",name:"wise"},{id:"I24lanX6Nq71",name:"apple-phone"},{id:"znqq179L1K9g",name:"clickup"},{id:"HElKBlFRuBXu",name:"internet-download-manager"},{id:"HQPitXKj0IMC",name:"microsoft-powerpoint-2025"},{id:"TtXEs5SeYLG8",name:"flask"},{id:"ezDTR0SCQIf2",name:"pronote-logo"},{id:"zbxme5NaU9Uj",name:"rhinoceros-6"},{id:"lzgRAD4GQaxK",name:"google-contacts"},{id:"dGZ5XrZ0b11t",name:"nordvpn"},{id:"q53th37bGbV0",name:"obsidian"},{id:"D5nuxA0qwo6w",name:"microsoft-intune"},{id:"38TurCX4SQxd",name:"microsoft-lens"},{id:"TUk7vxvtu6hX",name:"chatgpt"},{id:"19329",name:"user-location"},{id:"iLPRCGztudyE",name:"add-an-app"},{id:"Ubc2ZHjTgAqX",name:"medical-mobile-app"},{id:"19977",name:"weixing"},{id:"TfhgUym1Y8vb",name:"amazon-shopping-app"},{id:"w0Q1gPyrSGaP",name:"wish"},{id:"uJLYpOn8pv5L",name:"tweakbox"},{id:"dHIjQsce2H0X",name:"widgetsmith"},{id:"IZ3NTAENlA0T",name:"my-orange"},{id:"ww1M5Fj3neV9",name:"clr-nyx-music-player"},{id:"V8k6jzzBF039",name:"vivlio"},{id:"dtgQpnTWPtKF",name:"vivlio--v2"},{id:"A5xv8IPDV5vl",name:"facebook-messenger--v3"},{id:"p6ZAFUCWBZuX",name:"facebook-messenger--v4"},{id:"gQ4NaXzMSLil",name:"signal-app"},{id:"EXFNiIYv2q6u",name:"uplay-app"},{id:"530H17CT0nYA",name:"cash-app"},{id:"hVG97ugHET17",name:"android-app-drawer"},{id:"_--y0r1BhCxa",name:"mylivn"},{id:"KzvEsG9M5XWu",name:"logmein-hamachi"},{id:"CPt6dvVSzIHn",name:"color-switch"},{id:"K1B8L80ukSJn",name:"zoomerang--v2"},{id:"P20vkfI6j65n",name:"vlive"},{id:"Krpqjeuvs4TM",name:"weverse"},{id:"100023",name:"zoosk"},{id:"rFUzrL2DU0bb",name:"teamsnap-t"},{id:"0KMCYACIcuIU",name:"flipgrid"},{id:"BfxcvceDl78F",name:"remind-app"},{id:"qpR93f8ISREH",name:"defold"},{id:"GyA495QxM8El",name:"google-lens"},{id:"13971",name:"uninstalling-updates"},{id:"6YqQdIA5djHe",name:"color-by-number"},
  // Batch 3 (offset 200)
  {id:"7jxi2xUXFoi4",name:"notability"},{id:"qt7fMdMcUD9G",name:"taskbar"},{id:"CL2zYlGmXB2v",name:"picsew"},{id:"PHZXtJlSmVDg",name:"kanopy"},{id:"k2Lzy16DmV22",name:"dapp"},{id:"4MnQHRJzz76A",name:"premid"},{id:"rHq5s3KDkFej",name:"malwarebytes"},{id:"38209",name:"jelly-band"},{id:"74560",name:"threema"},{id:"94121",name:"lunacy"},{id:"38640",name:"9gag"},{id:"38555",name:"cydia"},{id:"63775",name:"launchpad"},{id:"45604",name:"map-pokemon"},{id:"CAo6tDWIegcA",name:"google-meet--v2"},{id:"56177",name:"epilepsy-smart-watch"},{id:"123594",name:"kik-messenger"},{id:"1FvdM9u76boH",name:"powerchart"},{id:"13421",name:"xaml"},{id:"iion52puusl0",name:"microsoft-defender-2025"},{id:"MVbRhmT0CKSN",name:"skype--v3"},{id:"hVXP25IORnCF",name:"skype--v4"},{id:"JDVg6weoTEIb",name:"skype--v5"},{id:"sGyK5cKD64bH",name:"skype--v6"},{id:"CwWIdFdO0Eba",name:"world-app"},{id:"21047",name:"vine"},{id:"33azDzsKg9Ms",name:"dashlane"},{id:"54099",name:"coollector"},{id:"d09D0HZZyY64",name:"voicemeeter"},{id:"1C9ID1vdI1KL",name:"voice-meeter"},{id:"xolrBFMn0xwt",name:"mapquest"},{id:"J8s4wLtM8DFB",name:"igtv"},{id:"63786",name:"blackberry-app-world"},{id:"QkjiraFZq1th",name:"instacart"},{id:"R5rBNaeGJulV",name:"itranslate"},{id:"A96TmOG8T8tK",name:"nearpod"},{id:"niyiurzVo1C0",name:"streamlabs-obs"},{id:"HWekz3GBUXbM",name:"google-files"},{id:"jsJFqy8GtJD8",name:"wombo-by-dream"},{id:"8OnYjPJ79kfx",name:"arattai"},{id:"cf0MMLzlCBVR",name:"jour"},{id:"Y6Lkz5eHe2Ol",name:"rockettv"},{id:"G7aypYM0Cvnn",name:"webnovel"},{id:"qUMUQyquglWa",name:"homebrew-logo"},{id:"Cx0QKOLT1cVR",name:"red-razer-cortex"},{id:"MK1gnfbcGSSB",name:"dexcom-g6"},{id:"Qf1OupKjc8Yk",name:"microsoft-onenote-2025"},{id:"2JiNrwVCxw3j",name:"vmware-vsphere"},{id:"g5LB9gkN4CCp",name:"prequel-app"},{id:"1IHEab0rk5oi",name:"huawei-app-gallery"},{id:"ortlsYTZxMvT",name:"netflix-desktop-app"},{id:"pPfYsGX5lNIe",name:"netflix-desktop-app--v2"},{id:"9N3LO52MKuiT",name:"yahoo-mail-app"},{id:"BkugfgmBwtEI",name:"whatsapp--v2"},{id:"uZWiLUyryScN",name:"whatsapp--v3"},{id:"964RahB4l606",name:"whatsapp--v4"},{id:"QkXeKixybttw",name:"whatsapp--v5"},{id:"16713",name:"whatsapp"},{id:"7OeRNqg6S7Vf",name:"whatsapp--v6"},{id:"xF9ZbyGPFTC2",name:"microsoft-to-do-app"},{id:"30368",name:"playstore"},{id:"-rCyFDOtRiYg",name:"facetime"},{id:"36628",name:"snapchat-circled-logo"},{id:"7UEdo71zpeNV",name:"google-photos-new"},{id:"WgFRYprc5oEN",name:"simple-app"},{id:"22m2NmC5Xv2j",name:"edmodo-app"},{id:"qrOXrfUDKkOX",name:"apple-calculator"},{id:"23032",name:"snapchat"},{id:"124363",name:"priscope"},{id:"I287LY26AyNa",name:"in-app-messaging"},{id:"vRcgRqzxesl6",name:"apple-store-app"},{id:"21923",name:"app-symbol"},{id:"D6vOfsyDtxbt",name:"snapchat-circled-logo--v2"},{id:"BSCvKHdqLNel",name:"snapchat-circled-logo--v3"},{id:"8sZA3YkBZApI",name:"snapchat-circled-logo--v4"},{id:"ke1I2dIOGrWN",name:"snapchat-circled-logo--v5"},{id:"mNhj6ePnTBkQ",name:"chime"},{id:"BqtesutdNpfI",name:"paperio-2"},{id:"QKT4pCeQepA1",name:"snaptube"},{id:"71257",name:"angularjs"},{id:"p6TjI8xRp5qI",name:"shopeefood"},{id:"ui4CTPMMDCFh",name:"google-ads"},{id:"108776",name:"facebook-f"},{id:"dhcmjLTxlXqa",name:"rakuten-viki"},{id:"21049",name:"trello"},{id:"lxwUaALAeQmr",name:"amazon-music"},{id:"C3MpENApv7Rd",name:"amazon-music--v3"},{id:"eAMGjpJ4skFB",name:"instagram-reel"},{id:"rFdotO9u820V",name:"grammarly"},{id:"62452",name:"firebase"},{id:"kikR2jIn6485",name:"slack-new"},{id:"9OFkKNlsMDfv",name:"yandex-music-new"},{id:"12071",name:"download"},{id:"Fv6IBmFteKFe",name:"download--v2"},{id:"JHqfaUfF7bLY",name:"kahoot"},{id:"bMkmDxPRZAld",name:"grafana"},
  // Batch 4 (offset 300)
  {id:"bxiJgqowYKhT",name:"foxit-reader"},{id:"cIe827NWAnMf",name:"apple-contacts"},{id:"HaXrCH33RuCO",name:"google-books"},{id:"BH0XTdh770dG",name:"kakaotalk"},{id:"YtYpp1VdEB8M",name:"google-duo"},{id:"1oypaxFNhwB9",name:"twitter-circled--v5"},{id:"114450",name:"twitter-circled"},{id:"LrnxenI1UpEd",name:"samsung-internet"},{id:"Byk3DgEqETzO",name:"google-voice"},{id:"zOCGOOcdZ6jd",name:"audiomaster"},{id:"NOkU35cLSwqQ",name:"huji"},{id:"AIqeYeIznnFS",name:"pureref"},{id:"RffCjm5IOnEC",name:"youtube-studio"},{id:"22988",name:"google-play"},{id:"jJS472JMXlsE",name:"duolingo-logo"},{id:"Q8UWXRoNOwZm",name:"fonts-app"},{id:"GxTfhOdKVbw5",name:"pandora-app"},{id:"XvRFJSfgZ328",name:"mcdonalds-app"},{id:"N1tTKPEhzeBm",name:"uber-app"},{id:"mKBKjBTjj2ZO",name:"socratic"},{id:"amvoepVlk1On",name:"face-swapper"},{id:"VOjx1DGEy1FY",name:"current-mobile-bank"},{id:"gK64WT7eNwOa",name:"dailyart"},{id:"pzw1cdJx6RMv",name:"filmmaker-pro"},{id:"kjPOYPirujKx",name:"dailymotion"},{id:"hFymiMxbaYxv",name:"pichon"},{id:"9QDgntqRYc01",name:"wtforecast"},{id:"rD15EcpCkinR",name:"netlify"},{id:"QVajESThHfln",name:"genius"},{id:"Pjdv4HHWbK91",name:"facebook-gaming"},{id:"Jv2nhff6PnZI",name:"no-desktop"},{id:"nfTjBONootA9",name:"life360"},{id:"35858",name:"medium-monogram"},{id:"59265",name:"enlightened"},{id:"ghVAWkaA9980",name:"zepeto"},{id:"HCXA5tcMpsSK",name:"disney-now"},{id:"0T8u7oPd91di",name:"parler"},{id:"cFCpHI5MkKVt",name:"mojaru"},{id:"bfsd8JHZN05o",name:"libby"},{id:"wSaaoMWOB5tq",name:"joox"},{id:"rVYeVmJY5wPr",name:"voot-kids"},{id:"F9wf6zL0PwtX",name:"lyft"},{id:"LZKTTiYmHpgq",name:"vercel"},{id:"HX9Tg3dK66dX",name:"gameloop"},{id:"mnmSvvqHktO8",name:"pleex"},{id:"dl28idKhn0hF",name:"scale-tool"},{id:"c6t9U8B2AsN1",name:"questrade"},{id:"JGNPjsYiQK5E",name:"eventidea"},{id:"s5uaWdNkUV2g",name:"twitter-circled--v2"},{id:"CtMFJTP5iLtm",name:"twitter-circled--v4"},{id:"5xOfjBXNfQiN",name:"twitter-circled--v3"},{id:"14943",name:"2f-tap"},{id:"iYC3xWbn7q4K",name:"bitmoji-new"},{id:"4aiAt2in50N0",name:"krunker"},{id:"ZIo8vhGiJlks",name:"cute-cut-pro"},{id:"A9go0aKSJ4WQ",name:"adapticons--v2"},{id:"blxTb98Kf6uR",name:"gas-buddy"},{id:"FsYji0ON8kKH",name:"accomolish"},{id:"ESLt6KaSzGIa",name:"onix-client"},{id:"UPa16pG2n6JY",name:"google-voice--v2"},{id:"qbVfS5PPMXoa",name:"anime-digital-network"},{id:"MKfz0p2st2O7",name:"uworld"},{id:"dB95xZEEARgS",name:"home-health"},{id:"EVK3W0O1pFht",name:"iobit-uninstaller"},{id:"uWOO9ls6OdGp",name:"mystic-messenger"},{id:"W864KQKLKmWj",name:"grok"},{id:"USGXKHXKl9X7",name:"grok--v2"},{id:"flyFkP7sj07V",name:"apple-settings"},{id:"7gI7umt81dwD",name:"uber-eats-app"},{id:"42650",name:"baby-app"},{id:"13978",name:"myspace-squared"},{id:"38398",name:"timeout-app"},{id:"ZSdEaNKGQR2L",name:"translate-app"},{id:"M5VSwN8gRfLq",name:"blackboard-app"},{id:"X5YZ2OUzP87M",name:"pixel-art-app"},{id:"102558",name:"squared-menu"},{id:"1BAthQhs6fmK",name:"clue"},{id:"43P1mdkTk83J",name:"samsung-flow"},{id:"102548",name:"circled-menu"},{id:"21608",name:"ios-app-icon-shape"},{id:"ot8QhAKun4rZ",name:"youtube-shorts"},{id:"GcHAhJmJIDHm",name:"yandex-music"},{id:"Pb0c8A4rGpq1",name:"mb-way"},{id:"MtU6xSr1b8sL",name:"talabat"},{id:"1FGDDW2jnBwJ",name:"grubhub"},{id:"stfa9z6i4KRj",name:"ring-doorbell"},{id:"527gx57f8tmL",name:"facebook-light"},{id:"8d7SL54liifr",name:"landbank"},{id:"13630",name:"google-drive"},{id:"ya4CrqO7PgnY",name:"google-drive--v2"},{id:"ouYlSyYhEAKU",name:"payoneer"},{id:"wX8Rs6zgIOgN",name:"wearfit-pro"},{id:"nA6AEq6JcvqD",name:"fabulous"},{id:"72728",name:"spoken"},{id:"85IfZJIizNup",name:"wumpus"},
];

// Deduplicate by id
const seen = new Set();
const uniqueIcons = icons.filter(icon => {
  if (seen.has(icon.id)) return false;
  seen.add(icon.id);
  return true;
});
console.log(`Total unique icons to download: ${uniqueIcons.length}`);

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

      // Skip if already downloaded and valid
      if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
        success++;
        return;
      }

      // Use ID-based URL (works for all icons)
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
