
// netlify/functions/deals.js
// Haalt productfeeds op van Awin per winkel, filtert op hondenvoer + korting >35%
// Voeg je eigen Awin feed-URLs toe zodra je goedkeuring hebt per adverteerder

const FEEDS = [
  {
    winkel: "zooplus",
    naam: "Zooplus",
    // Vervang onderstaande URL met jouw Awin feed URL voor Zooplus
    url: process.env.FEED_ZOOPLUS || "",
    type: "awin", // awin | tradetracker
  },
  {
    winkel: "brekz",
    naam: "Brekz",
    url: process.env.FEED_BREKZ || "",
    type: "awin",
  },
  {
    winkel: "medpets",
    naam: "Medpets",
    url: process.env.FEED_MEDPETS || "",
    type: "awin",
  },
  {
    winkel: "petsplace",
    naam: "Petsplace",
    url: process.env.FEED_PETSPLACE || "",
    type: "tradetracker",
  },
  {
    winkel: "bitiba",
    naam: "Bitiba",
    url: process.env.FEED_BITIBA || "",
    type: "awin",
  },
];

// Zoekwoorden voor hondenvoer categoriefilter
const HONDEN_KEYWORDS = [
  "hond", "dog", "canin", "puppy", "honden", "kibble",
  "brokjes", "hondenvoer", "adult dog", "dog food"
];

// Merken die we herkennen
const MERK_MAP = {
  "royal canin": "royal-canin",
  "hill's": "hills",
  "hills": "hills",
  "purina pro plan": "purina",
  "pro plan": "purina",
  "purina beneful": "purina-beneful",
  "beneful": "purina-beneful",
  "eukanuba": "eukanuba",
  "pedigree": "pedigree",
  "josera": "josera",
  "frolic": "frolic",
  "edgard": "edgard-cooper",
  "edgard & cooper": "edgard-cooper",
  "iams": "iams",
  "bonzo": "bonzo",
  "perfect fit": "perfect-fit",
};

// Soort detectie op basis van productnaam
const SOORT_MAP = [
  { soort: "puppy",    keywords: ["puppy", "junior", "pup"] },
  { soort: "natvoer",  keywords: ["natvoer", "wet", "blik", "pouch", "pack", "kuip"] },
  { soort: "snacks",   keywords: ["snack", "treat", "traktatie", "kauw", "dental", "bone"] },
  { soort: "graanvrij",keywords: ["graanvrij", "grain free", "grain-free"] },
  { soort: "droogvoer",keywords: ["droogvoer", "brok", "kibble", "dry", "zak"] },
];

function detectMerk(naam) {
  const lower = naam.toLowerCase();
  for (const [key, val] of Object.entries(MERK_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "overig";
}

function detectSoort(naam) {
  const lower = naam.toLowerCase();
  for (const { soort, keywords } of SOORT_MAP) {
    if (keywords.some(k => lower.includes(k))) return soort;
  }
  return "droogvoer"; // default
}

function isHondenvoer(naam, categorie = "") {
  const tekst = (naam + " " + categorie).toLowerCase();
  return HONDEN_KEYWORDS.some(k => tekst.includes(k));
}

function kortingPct(oud, nieuw) {
  if (!oud || !nieuw || oud <= nieuw) return 0;
  return Math.round(((oud - nieuw) / oud) * 100);
}

// Parse Awin CSV feed (standaard Awin formaat)
function parseAwinCSV(csv, winkel, winkelnaam) {
  const lines = csv.split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split("|").map(h => h.trim().toLowerCase());

  const idx = (name) => headers.indexOf(name);
  const col = (row, name) => {
    const i = idx(name);
    return i >= 0 ? (row[i] || "").trim() : "";
  };

  const deals = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split("|");
    if (row.length < 5) continue;

    const naam      = col(row, "product_name") || col(row, "name");
    const categorie = col(row, "category_name") || col(row, "merchant_category");
    const prijsStr  = col(row, "search_price") || col(row, "price");
    const rrpStr    = col(row, "rrp") || col(row, "was_price") || col(row, "list_price");
    const afbeelding= col(row, "image_url") || col(row, "aw_image_url");
    const url       = col(row, "aw_deep_link") || col(row, "merchant_deep_link");
    const merk      = col(row, "brand_name") || col(row, "brand");

    if (!naam || !url) continue;
    if (!isHondenvoer(naam, categorie)) continue;

    const prijs = parseFloat(prijsStr.replace(",", "."));
    const rrp   = parseFloat(rrpStr.replace(",", "."));
    if (isNaN(prijs)) continue;

    const pct = kortingPct(rrp, prijs);
    if (pct < 35) continue; // Alleen echte deals

    deals.push({
      id: `${winkel}-${i}`,
      winkel,
      winkelnaam,
      naam,
      merk: detectMerk(merk || naam),
      merkNaam: merk || "",
      soort: detectSoort(naam),
      prijs: prijs.toFixed(2),
      prijsOud: isNaN(rrp) ? null : rrp.toFixed(2),
      korting: pct,
      besparing: isNaN(rrp) ? null : (rrp - prijs).toFixed(2),
      afbeelding,
      url,
      gratis_verzending: true,
    });
  }

  return deals;
}

// Parse TradeTracker XML feed
function parseTradeTrackerXML(xml, winkel, winkelnaam) {
  const deals = [];
  const items = xml.match(/<product>([\s\S]*?)<\/product>/g) || [];

  for (let i = 0; i < items.length; i++) {
    const get = (tag) => {
      const m = items[i].match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return m ? (m[1] || m[2] || "").trim() : "";
    };

    const naam      = get("name") || get("title");
    const categorie = get("category");
    const prijsStr  = get("price");
    const rrpStr    = get("originalPrice") || get("listPrice");
    const afbeelding= get("imageUrl") || get("image");
    const url       = get("productUrl") || get("url");
    const merk      = get("brand");

    if (!naam || !url) continue;
    if (!isHondenvoer(naam, categorie)) continue;

    const prijs = parseFloat(prijsStr.replace(",", "."));
    const rrp   = parseFloat(rrpStr.replace(",", "."));
    if (isNaN(prijs)) continue;

    const pct = kortingPct(rrp, prijs);
    if (pct < 35) continue;

    deals.push({
      id: `${winkel}-${i}`,
      winkel,
      winkelnaam,
      naam,
      merk: detectMerk(merk || naam),
      merkNaam: merk || "",
      soort: detectSoort(naam),
      prijs: prijs.toFixed(2),
      prijsOud: isNaN(rrp) ? null : rrp.toFixed(2),
      korting: pct,
      besparing: isNaN(rrp) ? null : (rrp - prijs).toFixed(2),
      afbeelding,
      url,
      gratis_verzending: true,
    });
  }

  return deals;
}

// Haal één feed op en parse het
async function fetchFeed({ winkel, naam, url, type }) {
  if (!url) {
    console.log(`Feed URL ontbreekt voor ${naam} — sla over`);
    return [];
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HondenvoerDeal/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`Feed ${naam} gaf HTTP ${res.status}`);
      return [];
    }

    const text = await res.text();

    if (type === "tradetracker") {
      return parseTradeTrackerXML(text, winkel, naam);
    } else {
      return parseAwinCSV(text, winkel, naam);
    }
  } catch (err) {
    console.error(`Fout bij ophalen feed ${naam}:`, err.message);
    return [];
  }
}

// DEMO deals — worden getoond als een feed nog niet is ingesteld
const DEMO_DEALS = [
  { id:"demo-1", winkel:"zooplus", winkelnaam:"Zooplus", naam:"Royal Canin Adult Medium Breed", merk:"royal-canin", merkNaam:"Royal Canin", soort:"droogvoer", prijs:"12.99", prijsOud:"29.99", korting:57, besparing:"17.00", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-2", winkel:"brekz", winkelnaam:"Brekz", naam:"Hill's Science Adult Large Breed Kip", merk:"hills", merkNaam:"Hill's Science", soort:"droogvoer", prijs:"18.50", prijsOud:"36.99", korting:50, besparing:"18.49", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-3", winkel:"medpets", winkelnaam:"Medpets", naam:"Purina Pro Plan Adult Sensitive Zalm Graanvrij", merk:"purina", merkNaam:"Purina Pro Plan", soort:"graanvrij", prijs:"22.95", prijsOud:"40.99", korting:44, besparing:"18.04", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-4", winkel:"zooplus", winkelnaam:"Zooplus", naam:"Royal Canin Puppy Medium Breed", merk:"royal-canin", merkNaam:"Royal Canin", soort:"puppy", prijs:"16.99", prijsOud:"30.99", korting:45, besparing:"14.00", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-5", winkel:"petsplace", winkelnaam:"Petsplace", naam:"Eukanuba Adult Medium Breed Kip", merk:"eukanuba", merkNaam:"Eukanuba", soort:"droogvoer", prijs:"15.75", prijsOud:"26.25", korting:40, besparing:"10.50", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-6", winkel:"bol", winkelnaam:"Bol.com", naam:"Pedigree Adult Natvoer Rund 24-pack", merk:"pedigree", merkNaam:"Pedigree", soort:"natvoer", prijs:"9.99", prijsOud:"15.99", korting:38, besparing:"6.00", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-7", winkel:"bol", winkelnaam:"Bol.com", naam:"Frolic Complete met Kip & Groenten", merk:"frolic", merkNaam:"Frolic", soort:"droogvoer", prijs:"8.99", prijsOud:"14.99", korting:40, besparing:"6.00", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-8", winkel:"zooplus", winkelnaam:"Zooplus", naam:"Edgard & Cooper Adult Vrije Uitloop Kip", merk:"edgard-cooper", merkNaam:"Edgard & Cooper", soort:"graanvrij", prijs:"19.95", prijsOud:"31.99", korting:38, besparing:"12.04", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
  { id:"demo-9", winkel:"medpets", winkelnaam:"Medpets", naam:"Iams Adult Medium Breed Kip", merk:"iams", merkNaam:"Iams", soort:"droogvoer", prijs:"11.49", prijsOud:"20.19", korting:43, besparing:"8.70", afbeelding:"", url:"#", gratis_verzending:true, demo:true },
];

// HOOFDFUNCTIE
exports.handler = async function(event, context) {
  try {
    // Alle feeds parallel ophalen
    const results = await Promise.all(FEEDS.map(fetchFeed));
    let deals = results.flat();

    // Als geen enkele feed is ingesteld → demo mode
    const isDemo = deals.length === 0;
    if (isDemo) deals = DEMO_DEALS;

    // Sorteer op korting hoog→laag
    deals.sort((a, b) => b.korting - a.korting);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ deals, isDemo, bijgewerkt: new Date().toISOString() }),
    };

  } catch (err) {
    console.error("Function fout:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Kon deals niet ophalen", details: err.message }),
    };
  }
};
