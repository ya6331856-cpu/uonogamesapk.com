import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { resolveUrl } from "@/lib/api";

const SITE_URL = "https://newyono.games";
const SITE_NAME = "YONO GAMES";
const DEFAULT_OG = `${SITE_URL}/logo-v2.png`;

function absUrl(u) {
  /*...*/
}

/**
 * Normalise any URL into the one canonical form Google should see:
 *   - always the non-www apex origin
 *   - query strings and hash fragments stripped (?utm_source=... must not
 *     create a second canonical for the same page)
 *   - no trailing slash, except on the root document
 *
 * Every canonical and og:url on the site flows through this function, so there
 * is a single place where URL shape is decided.
 */
export function canonicalize(input) {
  /*...*/
}

/**
 * Remove duplicate/conflicting meta/link tags NOT managed by react-helmet-async
 * (e.g. those injected by third-party scripts before mount). Called once per
 /*...*/
