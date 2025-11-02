export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
  tld?: string[];
  cca2: string;
  ccn3?: string;
  cca3: string;
  cioc?: string;
  independent?: boolean;
  status?: string;
  unMember?: boolean;
  currencies?: {
    [key: string]: {
      name: string;
      symbol?: string;
    };
  };
  idd?: {
    root?: string;
    suffixes?: string[];
  };
  capital?: string[];
  altSpellings?: string[];
  region?: string;
  subregion?: string;
  languages?: {
    [key: string]: string;
  };
  translations?: {
    [key: string]: {
      official: string;
      common: string;
    };
  };
  latlng?: [number, number]; // Latitude e longitude
  landlocked?: boolean;
  borders?: string[]; // Códigos dos países vizinhos
  area?: number;
  demonyms?: {
    [key: string]: {
      f: string;
      m: string;
    };
  };
  flag?: string; // Emoji da bandeira
  maps?: {
    googleMaps: string;
    openStreetMaps: string;
  };
  population?: number;
  gini?: {
    [key: string]: number;
  };
  fifa?: string;
  car?: {
    signs?: string[];
    side?: string;
  };
  timezones?: string[];
  continents?: string[];
  flags?: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
  startOfWeek?: string;
  capitalInfo?: {
    latlng?: [number, number];
  };
  postalCode?: {
    format: string;
    regex: string;
  };
  // Campos econômicos que serão preenchidos por APIs complementares
  gdp?: {
    total?: number;
    perCapita?: number;
    growthRate?: number;
  };
  economics?: {
    inflationRate?: number;
    unemploymentRate?: number;
    giniIndex?: number;
  };
  demographics?: {
    lifeExpectancy?: number;
    literacyRate?: number;
    urbanization?: number;
  };
}