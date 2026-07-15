const FEEDS = [
  { winkel:"zooplus",   naam:"Zooplus",   url: process.env.FEED_ZOOPLUS   || "", type:"awin",     minKorting:35 },
  { winkel:"brekz",     naam:"Brekz",     url: process.env.FEED_BREKZ     || "", type:"tradetracker-csv", minKorting:0  },
  { winkel:"medpets",   naam:"Medpets",   url: process.env.FEED_MEDPETS   || "", type:"awin",     minKorting:35 },
  { winkel:"petsplace", naam:"Petsplace", url: process.env.FEED_PETSPLACE || "", type:"daisycon", minKorting:35 },
  { winkel:"bitiba",    naam:"Bitiba",    url: process.env.FEED_BITIBA    || "", type:"awin",     minKorting:35 },
  { winkel:"bol",       naam:"Bol.com",   url: process.env.FEED_BOL       || "", type:"awin",     minKorting:35 },
  { winkel:"joybuy",    naam:"Joybuy",    url: process.env.FEED_JOYBUY    || "", type:"awin",     minKorting:0  },
];

// Directe hondenvoer-indicatoren (altijd doorlaten)
const VOER_DIRECT = [
  "hondenvoer","dog food","hondensnack","hondensnacks","kibble","brokjes","droogvoer","natvoer","canin","hondenvoeding",
  // Rasgrootte-termen: uitsluitend gebruikt in diervoeding
  "large breed","medium breed","small breed","mini breed","maxi breed","giant breed","all breed",
  // Taalspecifieke "voor honden"-varianten
  "voor honden","für hunde","for dogs","per cane","pour chien",
  // Overige voer-specifieke termen
  "complete dog","adult dog","puppy food","dog treat","dog snack","hondensnacks",
];

// Speelgoed/non-food merken altijd blokkeren
const VOER_UITSLUIT = ["lego","schleich","playmobil","pokemon","brewdog","hondashi","bulldog sauce","speelgoed","figurine","figuur","robot hond"];

// Voedselingrediënten/-types die vereist zijn als "hond/dog" het enige signaal is
const VOER_INGREDIENTEN = [
  /\bvoer\b/,/snack/,/treat\b/,/traktatie/,/knabbel/,
  /\bvlees\b/,/\bkip\b/,/\brund\b/,/\blam\b/,/zalm/,/\bvis\b/,
  /\bchicken\b/,/\bbeef\b/,/\bsalmon\b/,/\blamb\b/,/\bfish\b/,
  /pat[eé]/,/\bbrok/,/recept/,/ingredi/,/grain/,/graanvrij/,/\bmeat/,
];

const MERK_MAP = {
  // Mainstream A-merken
  "royal canin":"royal-canin","royalcanin":"royal-canin",
  "hill's":"hills","hills":"hills","hills science":"hills","hill's science":"hills",
  "purina pro plan":"purina","pro plan":"purina",
  "purina one":"purina-one",
  "purina beneful":"purina-beneful","beneful":"purina-beneful",
  "eukanuba":"eukanuba",
  "pedigree":"pedigree",
  "iams":"iams",
  "josera":"josera",
  "frolic":"frolic",
  "edgard":"edgard-cooper","edgard & cooper":"edgard-cooper","edgard cooper":"edgard-cooper",
  "bonzo":"bonzo",
  "perfect fit":"perfect-fit","perfectfit":"perfect-fit",
  "chappi":"chappi",
  "vitakraft":"vitakraft",
  "cesar":"cesar",
  "butcher's":"butchers","butchers":"butchers",
  "winalot":"winalot",
  "goodboy":"goodboy","good boy":"goodboy",
  "meatyway":"meatyway","meaty way":"meatyway",
  // Premium / Super-premium
  "acana":"acana",
  "orijen":"orijen",
  "farmina":"farmina","n&d":"farmina","n & d":"farmina",
  "ziwi peak":"ziwi","ziwipeak":"ziwi","ziwi":"ziwi",
  "animonda":"animonda","grancarno":"animonda",
  "wolfsblut":"wolfsblut","wolf's blut":"wolfsblut","wolfs blut":"wolfsblut",
  "terra canis":"terra-canis","terracanis":"terra-canis",
  "mjamjam":"mjamjam","mjam mjam":"mjamjam",
  "inaba":"inaba",
  "rinti":"rinti",
  "happy dog":"happy-dog","happydog":"happy-dog",
  "taste of the wild":"taste-of-the-wild","totw":"taste-of-the-wild",
  "canagan":"canagan",
  "brit care":"brit","brit premium":"brit",
  "carnilove":"carnilove",
  "belcando":"belcando",
  "grau":"grau",
  "rocco":"rocco",
  "premiere":"premiere-petfood",
  "smilla":"smilla",
  "lukullus":"lukullus",
  "christopherus":"christopherus",
  "yarrah":"yarrah",
  "trovet":"trovet",
  "prins":"prins",
  "julius-k9":"julius-k9","julius k9":"julius-k9","juliusk9":"julius-k9",
  "purizon":"purizon",
  "lily's kitchen":"lilys-kitchen","lilys kitchen":"lilys-kitchen",
  "barking heads":"barking-heads",
  "markus mühle":"markus-muhle","markus muhle":"markus-muhle",
  "schesir":"schesir",
  "defu":"defu",
  "mac's":"macs",
  "wahre liebe":"wahre-liebe",
  "james wellbeloved":"james-wellbeloved",
  "harringtons":"harringtons",
  "forthglade":"forthglade",
  "merrick":"merrick",
  "stella & chewy":"stella-chewy","stella and chewy":"stella-chewy",
  "applaws":"applaws",
  "naturo":"naturo",
  "wainwright":"wainwrights","wainwright's":"wainwrights",
  "simpsons premium":"simpsons",
  "carna4":"carna4",
  "nutrivet":"nutrivet",
  "dukes farm":"dukes-farm","dukesfarm":"dukes-farm",
  "concept for life":"concept-for-life",
  "bewital":"bewital",
};

const TEXTUUR_MAP = [
  { textuur:"snacks",    keywords:["snack","treat","traktatie","kauw","dental","bot","bone","stick"] },
  { textuur:"natvoer",   keywords:["natvoer","wet","blik","pouch","sachet","kuip","mousse","pate","paté","jelly","loaf"] },
  { textuur:"droogvoer", keywords:["droogvoer","brok","kibble","dry","zak","bag","croquette"] },
];

const FASE_MAP = [
  { fase:"puppy",  keywords:["puppy","pup","junior","young"] },
  { fase:"senior", keywords:["senior","mature","ageing","aging","7+","8+","9+","10+","11+"] },
  { fase:"adult",  keywords:["adult","volwassen"] },
];

function detectBijzonder(naam) {
  const lower = naam.toLowerCase();
  return {
    graanvrij: ["graanvrij","grain free","grain-free","grainless"].some(k => lower.includes(k)),
    biologisch: ["biologisch","organic","bio ","bio-"].some(k => lower.includes(k)),
  };
}

function detectMerk(naam, merkVeld = "") {
  const tekst = (merkVeld + " " + naam).toLowerCase();
  for (const [key, val] of Object.entries(MERK_MAP)) {
    if (tekst.includes(key)) return {
      slug: val,
      naam: merkVeld || key.split(" ").map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(" ")
    };
  }
  return { slug:"overig", naam: merkVeld || "" };
}

function detectTextuur(naam) {
  const lower = naam.toLowerCase();
  for (const { textuur, keywords } of TEXTUUR_MAP) {
    if (keywords.some(k => lower.includes(k))) return textuur;
  }
  return "droogvoer";
}

function detectFase(naam) {
  const lower = naam.toLowerCase();
  for (const { fase, keywords } of FASE_MAP) {
    if (keywords.some(k => lower.includes(k))) return fase;
  }
  return "adult";
}

function isHondenvoer(naam, categorie = "") {
  const tekst = (naam + " " + categorie).toLowerCase().replace(/['"„"«»]/g, ' ');

  // Speelgoed, bier en andere non-food merken blokkeren
  if (VOER_UITSLUIT.some(k => tekst.includes(k))) return false;

  // Directe hondenvoer-termen → altijd voer
  if (VOER_DIRECT.some(k => tekst.includes(k))) return true;

  // "hond(en)" of "dog" als zelfstandig woord (vermijdt Hondashi, BrewDog, DOGADAN, Bulldog)
  const heeftHond = /\bhond(en)?\b/.test(tekst) || /\bdog\b/.test(tekst) ||
                    tekst.includes("puppy") || tekst.includes("chien");
  if (!heeftHond) return false;

  // Als enige signaal "hond/dog" is: verplicht ook een voedselingredient
  return VOER_INGREDIENTEN.some(r => r.test(tekst));
}

function isKattenproduct(naam, categorie = "") {
  const tekst = (naam + " " + categorie).toLowerCase();
  return (
    /\bkat(ten)?\b/.test(tekst) ||
    /\bcat\b/.test(tekst) ||
    /\bfeline\b/.test(tekst) ||
    /\bkitten\b/.test(tekst) ||
    tekst.includes("pour chat") ||
    tekst.includes("per gatto") ||
    /\bkonijn(en)?\b/.test(tekst) ||
    /\bhamster\b/.test(tekst) ||
    /\bvogel(voer|zaad)\b/.test(tekst) ||
    /\bbird food\b/.test(tekst) ||
    /\baquar/.test(tekst)
  );
}

function kortingPct(oud, nieuw) {
  if (!oud || !nieuw || oud <= nieuw) return 0;
  return Math.round(((oud - nieuw) / oud) * 100);
}

function bouwDeal(winkel, winkelnaam, i, naam, merkVeld, prijsStr, rrpStr, afbeelding, url, categorie, minKorting = 35) {
  if (!naam || !url) return null;
  const prijs = parseFloat((prijsStr||"").replace(",","."));
  const rrp   = parseFloat((rrpStr||"").replace(",","."));
  if (isNaN(prijs)) return null;
  const merk = detectMerk(naam, merkVeld);
  if (merk.slug === "overig") return null;           // onbekend merk → overslaan
  if (isKattenproduct(naam, categorie)) return null;  // geen kat/konijn/vogelvoer
  if (!isHondenvoer(naam, categorie)) return null;    // dubbele check: ook bekende merken kunnen non-food zijn (bijv. Bosch gereedschap)
  const pct = kortingPct(rrp, prijs);
  if (pct < minKorting) return null;
  const bijzonder = detectBijzonder(naam);
  return {
    id: `${winkel}-${i}`,
    winkel, winkelnaam, naam,
    merk: merk.slug, merkNaam: merk.naam,
    textuur: detectTextuur(naam),
    fase: detectFase(naam),
    graanvrij: bijzonder.graanvrij,
    biologisch: bijzonder.biologisch,
    prijs: prijs.toFixed(2),
    prijsOud: isNaN(rrp) ? null : rrp.toFixed(2),
    korting: pct,
    besparing: isNaN(rrp) ? null : (rrp - prijs).toFixed(2),
    afbeelding, url,
    gratis_verzending: true,
  };
}

function parseAwinCSV(csv, winkel, winkelnaam, debugInfo, minKorting = 35) {
  const lines = csv.split("\n");
  if (lines.length < 2) return [];
  const stripQ = (v) => (v || "").trim().replace(/^"|"$/g, '');
  const headers = lines[0].split("|").map(h => stripQ(h).toLowerCase());
  const col = (row, name) => { const i = headers.indexOf(name); return i >= 0 ? stripQ(row[i]) : ""; };

  if (debugInfo) {
    debugInfo.aantalRegels = lines.length - 1;
    debugInfo.kolommen = headers.join(", ");
    let hondenMatches = 0, kortingMatches = 0, voorbeeldNamen = [];
    for (let i = 1; i < Math.min(lines.length, 5001); i++) {
      const row = lines[i].split("|");
      const naam = col(row,"product_name")||col(row,"name");
      const cat  = col(row,"category_name")||col(row,"merchant_category");
      if (!naam) continue;
      if (isHondenvoer(naam, cat)) {
        hondenMatches++;
        const prijs        = parseFloat((col(row,"search_price")||"0").replace(",","."));
        const storePrijs   = col(row,"store_price");
        const displayPrijs = col(row,"display_price");
        const rrpPrijs     = col(row,"rrp");
        const rrp = parseFloat((rrpPrijs||displayPrijs||storePrijs||"0").replace(",","."));
        if (kortingPct(rrp, prijs) >= 35) kortingMatches++;
        if (voorbeeldNamen.length < 5) voorbeeldNamen.push({
          naam, search_price: col(row,"search_price"),
          store_price: storePrijs, display_price: displayPrijs, rrp: rrpPrijs,
          korting: kortingPct(rrp, prijs)
        });
      }
    }
    debugInfo.hondenvoerMatches = hondenMatches;
    debugInfo.kortingMatches = kortingMatches;
    debugInfo.voorbeeldNamen = voorbeeldNamen;
  }

  return lines.slice(1).map((line, i) => {
    const row = line.split("|");
    return bouwDeal(winkel, winkelnaam, i,
      col(row,"product_name")||col(row,"name"),
      col(row,"brand_name")||col(row,"brand"),
      col(row,"search_price")||col(row,"price"),
      col(row,"rrp")||col(row,"was_price")||col(row,"display_price")||col(row,"store_price"),
      col(row,"merchant_image_url")||col(row,"image_url")||col(row,"aw_image_url"),
      col(row,"aw_deep_link")||col(row,"merchant_deep_link"),
      col(row,"category_name")||col(row,"merchant_category"),
      minKorting
    );
  }).filter(Boolean);
}

function parseDaisyconXML(xml, winkel, winkelnaam) {
  const items = xml.match(/<product>([\s\S]*?)<\/product>/g) || [];
  return items.map((item, i) => {
    const get = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return m ? (m[1]||m[2]||"").trim() : "";
    };
    return bouwDeal(winkel, winkelnaam, i,
      get("name")||get("title"),
      get("brand"),
      get("price"),
      get("originalPrice")||get("listPrice")||get("priceold"),
      get("imageUrl")||get("image"),
      get("productUrl")||get("url")||get("deeplink"),
      get("category")
    );
  }).filter(Boolean);
}

function parseTradeTrackerCSV(csv, winkel, winkelnaam, debugInfo, minKorting = 35) {
  const lines = csv.split("\n");
  if (lines.length < 2) return [];
  const stripQ = (v) => (v || "").trim().replace(/^"|"$/g, '');
  const headers = lines[0].split(";").map(h => stripQ(h).toLowerCase());
  const col = (row, name) => { const i = headers.indexOf(name); return i >= 0 ? stripQ(row[i]) : ""; };

  if (debugInfo) {
    debugInfo.aantalRegels = lines.length - 1;
    debugInfo.kolommen = headers.join(", ");
    let hondenMatches = 0, kortingMatches = 0, voorbeeldNamen = [];
    for (let i = 1; i < Math.min(lines.length, 5001); i++) {
      const row = lines[i].split(";");
      const naam = col(row, "name");
      const cat  = col(row, "categories") || col(row, "categorypath");
      if (!naam) continue;
      if (isHondenvoer(naam, cat)) {
        hondenMatches++;
        const prijs = parseFloat((col(row, "price") || "0").replace(",", "."));
        const rrp   = parseFloat((col(row, "fromprice") || "0").replace(",", "."));
        if (kortingPct(rrp, prijs) >= 35) kortingMatches++;
        if (voorbeeldNamen.length < 5) voorbeeldNamen.push({
          naam, price: col(row, "price"), fromprice: col(row, "fromprice"),
          brand: col(row, "brand"), korting: kortingPct(rrp, prijs)
        });
      }
    }
    debugInfo.hondenvoerMatches = hondenMatches;
    debugInfo.kortingMatches    = kortingMatches;
    debugInfo.voorbeeldNamen    = voorbeeldNamen;
  }

  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const row = line.split(";");
    return bouwDeal(winkel, winkelnaam, i,
      col(row, "name"),
      col(row, "brand"),
      col(row, "price"),
      col(row, "fromprice"),
      col(row, "imageurl") || col(row, "imageurl_large"),
      col(row, "producturl"),
      col(row, "categories") || col(row, "categorypath"),
      minKorting
    );
  }).filter(Boolean);
}

function parseTradeTrackerXML(xml, winkel, winkelnaam) {
  const items = xml.match(/<product>([\s\S]*?)<\/product>/g) ||
                xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return items.map((item, i) => {
    const get = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return m ? (m[1]||m[2]||"").trim() : "";
    };
    return bouwDeal(winkel, winkelnaam, i,
      get("name")||get("title"),
      get("brand"),
      get("price"),
      get("originalPrice")||get("oldPrice")||get("listPrice"),
      get("imageUrl")||get("image"),
      get("productUrl")||get("url")||get("deepLink"),
      get("category")||get("categoryName")
    );
  }).filter(Boolean);
}

const zlib = require('zlib');
const { promisify } = require('util');
const gunzip = promisify(zlib.gunzip);

async function decompress(res, feedUrl) {
  const contentType = res.headers.get('content-type') || '';
  const encoding = res.headers.get('content-encoding') || '';
  const isGzip = contentType.includes('gzip') || contentType.includes('octet-stream') ||
                 encoding.includes('gzip') || (feedUrl || '').includes('/compression/gzip');
  if (isGzip) {
    const buf = Buffer.from(await res.arrayBuffer());
    try {
      return (await gunzip(buf)).toString('utf-8');
    } catch(e) {
      console.error('Gunzip mislukt, probeer raw tekst:', e.message);
      return buf.toString('utf-8');
    }
  }
  return res.text();
}

async function fetchFeed({ winkel, naam, url, type, minKorting = 35 }, debugInfo) {
  if (!url) return [];
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HondenvoerDeal/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (debugInfo) debugInfo.status = res.status;
    if (!res.ok) return [];
    const text = await decompress(res, url);
    if (debugInfo) {
      debugInfo.bytes = text.length;
      debugInfo.eersteRegel = text.split('\n')[0].substring(0, 120);
    }
    if (type === "daisycon")         return parseDaisyconXML(text, winkel, naam);
    if (type === "tradetracker")     return parseTradeTrackerXML(text, winkel, naam);
    if (type === "tradetracker-csv") return parseTradeTrackerCSV(text, winkel, naam, debugInfo, minKorting);
    return parseAwinCSV(text, winkel, naam, debugInfo, minKorting);
  } catch(err) {
    console.error(`Feed fout ${naam}:`, err.message);
    if (debugInfo) debugInfo.fout = err.message;
    return [];
  }
}

const DEMO = [
  { id:"d1", winkel:"zooplus",   winkelnaam:"Zooplus",   naam:"Royal Canin Adult Medium Breed 15kg",                    merk:"royal-canin",   merkNaam:"Royal Canin",     textuur:"droogvoer", fase:"adult",  graanvrij:false, biologisch:false, prijs:"12.99", prijsOud:"29.99", korting:57, besparing:"17.00", afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d2", winkel:"brekz",     winkelnaam:"Brekz",     naam:"Hill's Science Adult Large Breed Kip 18kg",              merk:"hills",         merkNaam:"Hill's Science",  textuur:"droogvoer", fase:"adult",  graanvrij:false, biologisch:false, prijs:"18.50", prijsOud:"36.99", korting:50, besparing:"18.49", afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d3", winkel:"medpets",   winkelnaam:"Medpets",   naam:"Purina Pro Plan Adult Sensitive Zalm Graanvrij 12kg",    merk:"purina",        merkNaam:"Purina Pro Plan", textuur:"droogvoer", fase:"adult",  graanvrij:true,  biologisch:false, prijs:"22.95", prijsOud:"40.99", korting:44, besparing:"18.04", afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d4", winkel:"zooplus",   winkelnaam:"Zooplus",   naam:"Royal Canin Puppy Medium Breed 10kg",                    merk:"royal-canin",   merkNaam:"Royal Canin",     textuur:"droogvoer", fase:"puppy",  graanvrij:false, biologisch:false, prijs:"16.99", prijsOud:"30.99", korting:45, besparing:"14.00", afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d5", winkel:"petsplace", winkelnaam:"Petsplace", naam:"Eukanuba Senior Medium Breed Kip 12kg",                  merk:"eukanuba",      merkNaam:"Eukanuba",        textuur:"droogvoer", fase:"senior", graanvrij:false, biologisch:false, prijs:"15.75", prijsOud:"26.25", korting:40, besparing:"10.50", afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d6", winkel:"bol",       winkelnaam:"Bol.com",   naam:"Pedigree Adult Natvoer Rund 24-pack 400g",               merk:"pedigree",      merkNaam:"Pedigree",        textuur:"natvoer",   fase:"adult",  graanvrij:false, biologisch:false, prijs:"9.99",  prijsOud:"15.99", korting:38, besparing:"6.00",  afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d7", winkel:"bol",       winkelnaam:"Bol.com",   naam:"Frolic Complete Kip & Groenten 7.5kg",                   merk:"frolic",        merkNaam:"Frolic",          textuur:"droogvoer", fase:"adult",  graanvrij:false, biologisch:false, prijs:"8.99",  prijsOud:"14.99", korting:40, besparing:"6.00",  afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d8", winkel:"zooplus",   winkelnaam:"Zooplus",   naam:"Edgard & Cooper Adult Vrije Uitloop Kip Graanvrij 12kg", merk:"edgard-cooper", merkNaam:"Edgard & Cooper", textuur:"droogvoer", fase:"adult",  graanvrij:true,  biologisch:true,  prijs:"19.95", prijsOud:"31.99", korting:38, besparing:"12.04", afbeelding:"", url:"#", gratis_verzending:true },
  { id:"d9", winkel:"joybuy",    winkelnaam:"Joybuy",    naam:"Iams Adult Medium Breed Kip Biologisch 12kg",            merk:"iams",          merkNaam:"Iams",            textuur:"droogvoer", fase:"adult",  graanvrij:false, biologisch:true,  prijs:"11.49", prijsOud:"20.19", korting:43, besparing:"8.70",  afbeelding:"", url:"#", gratis_verzending:true },
];

exports.handler = async function(event) {
  const debug = event.queryStringParameters && event.queryStringParameters.debug === '1';
  try {
    const debugInfo = [];
    const results = await Promise.all(FEEDS.map(async (feed) => {
      const info = debug ? { winkel: feed.naam, url: feed.url ? '✓ ingesteld' : '✗ ontbreekt' } : null;
      const deals = await fetchFeed(feed, info);
      if (info) { info.deals = deals.length; debugInfo.push(info); }
      return deals;
    }));
    let deals = results.flat();
    const isDemo = deals.length === 0;
    if (isDemo) deals = DEMO;
    deals.sort((a,b) => b.korting - a.korting);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // s-maxage: Netlify CDN cached 1 uur; stale-while-revalidate: dient oude versie
        // terwijl CDN op de achtergrond vernieuwt, zodat bezoekers nooit wachten.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ deals, isDemo, bijgewerkt: new Date().toISOString(), ...(debug && { debug: debugInfo }) }),
    };
  } catch(err) {
    return { statusCode:500, body: JSON.stringify({ error: err.message }) };
  }
};
