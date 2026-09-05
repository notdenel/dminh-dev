// The retired `currently` list, now the typed line in the homepage header.
// Imported by both the server render and the client script so the first
// phrase in the markup can never drift from the one the typewriter resumes.
//
// "looking for entry-level roles" is deliberately absent: the metadata row
// right below already says "open to work".
export type Phrase = {
  text: string;
  // A word inside `text` that becomes an accent-coloured link once it is
  // fully typed. Trailing periods are what buy a reader time to click it:
  // any run of two or more is typed slowly and held on. See index.astro.
  link?: { word: string; href: string };
};

// PHRASES[0] is rendered by the server, before any script runs, so it must
// be a phrase without a link.
export const PHRASES: Phrase[] = [
  { text: "building a cybersecurity home lab" },
  {
    text: "making my computer consciouss...",
    link: { word: "consciouss", href: "https://www.conscioussai.com/" },
  },
  { text: "going down the rabbit hole" },
  { text: "studying for security+ and ccna" },
  { text: "tinkering with electronics" },
  { text: "watching F1 with my girlfriend" },
  { text: "burning the midnight oil" },
  { text: "learning how to play hockey... ice is hard." },
];
