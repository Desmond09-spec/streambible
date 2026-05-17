const apiKey = "fbc63a43-6c84-4861-b8d4-53106199480a";

async function test() {
  try {
    const verseRes = await fetch(
      `https://4.dbt.io/api/bibles/filesets/ENGKJVO2ET/verses?book_id=JHN&chapter=3&verse_start=16&verse_end=16&key=${apiKey}&v=4`,
    );
    const verseData = await verseRes.json();
    console.log("Verse JSON:", JSON.stringify(verseData));
  } catch (err) {
    console.error(err);
  }
}

test();
