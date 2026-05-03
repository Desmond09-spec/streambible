// Simulate the exact Edge Function parsing pipeline
const raw = ` <!DOCTYPE html><html lang="en-US">\r\n                <head>\r\n                <title>NLT API</title>\r\n                \r\n                <link rel="stylesheet" href="https://api.nlt.to/content/nlt-api-css?vers=1.04"/>\r\n                \r\n                \r\n                </head>\r\n                <body>\r\n            <div id="bibletext" class=" NLT NLT BibleText section"><section><h2 class="bk_ch_vs_header">Genesis 3:3, NLT</h2><verse_export orig="gene_3_3" bk="gene" ch="3" vn="3"><span class="vn">3</span>"It\u2019s only the fruit from the tree in the middle of the garden that we are not allowed to eat. God said, \u2018You must not eat it or even touch it; if you do, you will die.\u2019"<p>\n</verse_export></section></div></body></html>`;

let verseText = raw;

// Step 1: Remove structural elements and their contents
verseText = verseText.replace(/<head>[\s\S]*?<\/head>/gi, '');
verseText = verseText.replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, '');

// Step 2: Remove verse numbers and footnote markers
verseText = verseText.replace(/<span class="vn">[\s\S]*?<\/span>/gi, '');
verseText = verseText.replace(/<span class="v(?:erse_number)?">[\s\S]*?<\/span>/gi, '');
verseText = verseText.replace(/<a class="a-tn">[\s\S]*?<\/a>/gi, '');
verseText = verseText.replace(/<span class="tn">[\s\S]*?<\/span>/gi, '');
verseText = verseText.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '');

console.log("AFTER TARGET REMOVALS:");
console.log(verseText);

// Step 3: Strip remaining HTML tags
let cleanText = verseText.replace(/<[^>]*>?/gm, '').trim();

// Step 4: Remove multiple spaces
cleanText = cleanText.replace(/\s{2,}/g, ' ');

console.log("\nFINAL CLEAN TEXT:");
console.log(cleanText);
