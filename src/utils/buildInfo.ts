import { execSync } from "node:child_process";

const REPO = "https://github.com/notdenel/dminh-dev";

// Vercel builds from a tarball with no .git directory, so the env var is the
// only source there; the git call is for local builds. Either can be absent
// (a shallow CI checkout, a source download), and the footer just drops the
// hash rather than showing a broken link.
const resolveCommit = () => {
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA;

  if (fromVercel) {
    return fromVercel.slice(0, 7);
  }

  try {
    return execSync("git rev-parse --short=7 HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
};

const commit = resolveCommit();

export const buildCommit = commit;
export const buildCommitUrl = commit ? `${REPO}/commit/${commit}` : undefined;
