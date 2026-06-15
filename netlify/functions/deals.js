const FEEDS = [
  { winkel:"zooplus",   naam:"Zooplus",   url: process.env.FEED_ZOOPLUS   || "", type:"awin" },
  { winkel:"brekz",     naam:"Brekz",     url: process.env.FEED_BREKZ     || "", type:"awin" },
  { winkel:"medpets",   naam:"Medpets",   url: process.env.FEED_MEDPETS   || "", type:"awin" },
  { winkel:"petsplace", naam:"Petsplace", url: process.env.FEED_PETSPLACE || "", type:"daisycon" },
  { winkel:"bitiba",    naam:"Bitiba",    url: process.env.FEED_BITIBA    || "", type:"awin" },
  { winkel:"bol",       naam:"Bol.com",   url: process.env.FEED_BOL       || "", type:"awin" },
  { winkel:"joybuy",    naam:"Joybuy",    url: process.env.FEED_JOYBUY    || "", type:"awin" },
];

const HONDEN_KEYWORDS = ["hond","dog","canin","puppy","honden","kibble","brokjes","hondenvoer","adult dog","dog food","chien"];

const MERK_MAP = {
  "royal canin":"royal-canin","royalcanin":"royal-canin",
  "hill's":"hills","hills":"hills","hills science":"hills",
  "purina pro plan":"purina","pro plan":"purina",
  "purina beneful":"purina-beneful","beneful":"purina-beneful",
  "eukanuba":"eukanuba","pedigree":"pedigree","josera":"josera",
  "frolic":"frolic",
  "edgard":"edgard-cooper","edgard & cooper":"edgard-cooper","edgard cooper":"edgard-cooper",
  "iams":"iams","bonzo":"bonzo",
  "perfect fit":"perfect-fit","perfectfit":"perfect-fit",
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
  const tekst = (naam + " " + categorie).toLowerCase();
  return HONDEN_KEYWORDS.some(k => tekst.includes(k));
}

function kortingPct(oud, nieuw) {
  if (!oud || !nieuw || oud <= nieuw) return 0;
  return Math.round(((oud - nieuw) / oud) * 100);
}

function bouwDeal(winkel, winkelnaam, i, naam, merkVeld, prijsStr, rrpStr, afbeelding, url, categorie) {
  if (!naam || !url) return null;
  const prijs = parseFloat((prijsStr||"").replace(",","."));
  const rrp   = parseFloat((rrpStr||"").replace(",","."));
  if (isNaN(prijs)) return null;
  if (!isHondenvoer(naam, categorie)) return null;
  const pct = kortingPct(rrp, prijs);
  if (pct < 35) return null;
  const merk = detectMerk(naam, merkVeld);
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

function parseAwinCSV(csv, winkel, winkelnaam) {
  const lines = csv.split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split("|").map(h => h.trim().toLowerCase());
  const col = (row, name) => { const i = headers.indexOf(name); return i >= 0 ? (row[i]||"").trim() : ""; };
  return lines.slice(1).map((line, i) => {
    const row = line.split("|");
    return bouwDeal(winkel, winkelnaam, i,
      col(row,"product_name")||col(row,"name"),
      col(row,"brand_name")||col(row,"brand"),
      col(row,"search_price")||col(row,"price"),
      col(row,"rrp")||col(row,"was_price")||col(row,"display_price")||col(row,"store_price"),
      col(row,"merchant_image_url")||col(row,"image_url")||col(row,"aw_image_url"),
      col(row,"aw_deep_link")||col(row,"merchant_deep_link"),
      col(row,"category_name")||col(row,"merchant_category")
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

async function decompress(res) {
  const contentType = res.headers.get('content-type') || '';
  const url = res.url || '';
  const isGzip = contentType.includes('gzip') || url.endsWith('.gz');
  if (isGzip) {
    const buf = Buffer.from(await res.arrayBuffer());
    return (await gunzip(buf)).toString('utf-8');
  }
  return res.text();
}

async function fetchFeed({ winkel, naam, url, type }) {
  if (!url) return [];
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HondenvoerDeal/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const text = await decompress(res);
    if (type === "daisycon")     return parseDaisyconXML(text, winkel, naam);
    if (type === "tradetracker") return parseTradeTrackerXML(text, winkel, naam);
    return parseAwinCSV(text, winkel, naam);
  } catch(err) {
    console.error(`Feed fout ${naam}:`, err.message);
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
      const deals = await fetchFeed(feed);
      if (debug) debugInfo.push({ winkel: feed.naam, url: feed.url ? '✓ ingesteld' : '✗ ontbreekt', deals: deals.length });
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
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ deals, isDemo, bijgewerkt: new Date().toISOString(), ...(debug && { debug: debugInfo }) }),
    };
  } catch(err) {
    return { statusCode:500, body: JSON.stringify({ error: err.message }) };
  }
};
