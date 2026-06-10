export const DEFAULT_SITE_URL = "http://xiaohua.host";

type SiteEnv = {
  BLOG_SITE_URL?: string;
};

function readEnv(env?: SiteEnv) {
  return env ?? process.env;
}

export function getSiteUrl(env?: SiteEnv) {
  const value = readEnv(env).BLOG_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return new URL(DEFAULT_SITE_URL);
    }

    return new URL(url.origin);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteOrigin(env?: SiteEnv) {
  return getSiteUrl(env).origin;
}

export function getSiteHost(env?: SiteEnv) {
  return getSiteUrl(env).host;
}
