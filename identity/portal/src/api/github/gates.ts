import type { GateOutcome } from '../types';

export const AUTHORIZED_HUMAN_LOGINS = new Set(['tupynambalucas', 'tupynambalucas-dev']);

export const AUTHORIZED_BOT_LOGINS = new Set([
  'tupynambalucas-automation[bot]',
  'tupynambalucas-ci-bot[bot]',
  'dependabot[bot]',
]);

const CONVENTIONAL_COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: .{1,100}$/;

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

const BOT_ALLOWED_FILE_PATTERNS: RegExp[] = [
  /(^|\/)CHANGELOG\.md$/,
  /(^|\/)package\.json$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)pnpm-workspace\.yaml$/,
  /(^|\/)\.release-please-manifest\.json$/,
  /(^|\/)release-please-config\.json$/,
  /(^|\/)go\.mod$/,
  /(^|\/)go\.sum$/,
  /(^|\/)Cargo\.toml$/,
  /(^|\/)Cargo\.lock$/,
  /(^|\/)pyproject\.toml$/,
  /^\.github\/workflows\/[^/]+\.ya?ml$/,
];

export function hasEmoji(text: string): boolean {
  return EMOJI_REGEX.test(text);
}

export function isBotAuthor(login: string): boolean {
  return login.endsWith('[bot]') || AUTHORIZED_BOT_LOGINS.has(login);
}

export function evaluateRbacGate(authorLogin: string): GateOutcome {
  if (AUTHORIZED_HUMAN_LOGINS.has(authorLogin) || AUTHORIZED_BOT_LOGINS.has(authorLogin)) {
    return { passed: true, reason: `Authorized author: ${authorLogin}` };
  }
  return {
    passed: false,
    reason: `Author '${authorLogin}' is not in the automated approval allowlist (human review required).`,
  };
}

export function evaluateSemanticGate(
  title: string,
  body: string,
  commitHeadlines: string[]
): GateOutcome {
  if (title.length > 100 || !CONVENTIONAL_COMMIT_REGEX.test(title)) {
    return {
      passed: false,
      reason: `PR title does not conform to Conventional Commits v1.0.0 (<= 100 chars): '${title}'`,
    };
  }
  if (hasEmoji(title) || hasEmoji(body)) {
    return {
      passed: false,
      reason: 'Zero-Emoji Invariant violated in PR title or description.',
    };
  }
  for (const headline of commitHeadlines) {
    if (hasEmoji(headline)) {
      return {
        passed: false,
        reason: `Zero-Emoji Invariant violated in commit headline: '${headline}'`,
      };
    }
  }
  return { passed: true, reason: 'Conventional Commits and Zero-Emoji invariants satisfied.' };
}

export function evaluateBotFileConfinement(authorLogin: string, changedFiles: string[]): GateOutcome {
  if (!isBotAuthor(authorLogin)) {
    return { passed: true, reason: 'Human author: bot file confinement not applicable.' };
  }
  if (changedFiles.length === 0) {
    return { passed: false, reason: 'Bot PR contains zero changed files.' };
  }
  const disallowed = changedFiles.filter(
    (filePath) => !BOT_ALLOWED_FILE_PATTERNS.some((pattern) => pattern.test(filePath))
  );
  if (disallowed.length > 0) {
    return {
      passed: false,
      reason: `Bot modified disallowed path(s): ${disallowed.join(', ')}`,
    };
  }
  return {
    passed: true,
    reason: `All ${changedFiles.length} bot-modified file(s) match strict release/dependency allowlist.`,
  };
}
