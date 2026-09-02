export interface CareerLocation {
  city: string;
  countryCode: string;
  x: number;
  y: number;
}

export const careerLocations: readonly CareerLocation[] = [
  {
    city: "San Francisco",
    countryCode: "US",
    x: 15,
    y: 27,
  },
  {
    city: "New York City",
    countryCode: "US",
    x: 43,
    y: 29,
  },
  {
    city: "Warsaw",
    countryCode: "PL",
    x: 102,
    y: 20,
  },
];

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const REGIONAL_INDICATOR_A = 0x1f1e6;
const ASCII_A = 65;
const ISO_COUNTRY_CODES = new Set(
  (
    "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ " +
    "BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
    "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ " +
    "DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
    "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY " +
    "HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
    "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY " +
    "MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
    "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN " +
    "PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL " +
    "SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR " +
    "TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
  ).split(" "),
);

/** Normalizes an ISO 3166-1 alpha-2 country code or throws when it is invalid. */
export function normalizeCountryCode(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();

  if (!ISO_COUNTRY_CODES.has(normalized)) {
    throw new TypeError(
      "Country code must be a valid ISO 3166-1 alpha-2 code.",
    );
  }

  return normalized;
}

export function getCountryFlagEmoji(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);

  return String.fromCodePoint(
    ...Array.from(
      normalized,
      (letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - ASCII_A,
    ),
  );
}

export function getCountryName(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);

  return countryNames.of(normalized) ?? normalized;
}
