// The retired `currently` list, now the typed line in the homepage header.
// Imported by both the server render and the client script so the first
// phrase in the markup can never drift from the one the typewriter resumes.
//
// "looking for entry-level roles" is deliberately absent: the metadata row
// right below already says "open to work".
//
// A run of periods is typed slowly and held on, so "..." reads as a beat
// rather than as three fast keystrokes. See the typewriter in index.astro.
export const PHRASES = [
  "building a cybersecurity home lab",
  "going down the rabbit hole",
  "studying for security+ and ccna",
  "tinkering with electronics",
  "watching F1 with my girlfriend",
  "burning the midnight oil",
  "learning how to play hockey... ice is hard.",
];
