const { URL } = require("url");
const AppError = require("./Error");

const VALID_EBAY_HOSTS = [
  "www.ebay.com",
  "ebay.com",
  "www.ebay.co.uk",
  "ebay.co.uk",
  "www.ebay.de",
  "ebay.de",
  "www.ebay.com.au",
];
const VALID_EBAY_PATHS = [/^\/itm\//, /^\/p\//];

const validateUrl = (rawUrl) => {
  let parsed;

  // check if it's a valid URL at all
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("Invalid URL format", 400);
  }

  // must be https
  if (parsed.protocol !== "https:") {
    throw new AppError("URL must use HTTPS", 400);
  }

  // must be a known ebay domain
  if (!VALID_EBAY_HOSTS.includes(parsed.hostname)) {
    throw new AppError("Not a valid eBay domain", 400);
  }

  // must be a product path (/itm/ or /p/)
  const isProductPath = VALID_EBAY_PATHS.some((pattern) =>
    pattern.test(parsed.pathname),
  );
  if (!isProductPath) {
    throw new AppError(
      "URL is not a product page (must contain /itm/ or /p/)",
      400,
    );
  }
};

const extractEbayIds = (rawUrl) => {
  const parsed = new URL(rawUrl);
  const params = parsed.searchParams;
  const pathParts = parsed.pathname.split("/").filter(Boolean);

  let iid = params.get("iid");
  if (!iid) {
    iid = [...pathParts].reverse().find((p) => /^\d+$/.test(p)) ?? null;
  }

  if (!iid) throw new AppError("Could not find item ID in URL", 400);

  const var_ = params.get("var");
  return { iid, var_ };
};

module.exports = { validateUrl, extractEbayIds };
