import { useTranslation } from 'react-i18next';
import type { Country } from '../types/country';

// Mapeamento manual de traduções corretas em português (por código de país)
const customTranslationsPT: Record<string, { common: string; official: string }> = {
  AX: { common: 'Ilhas Åland', official: 'Ilhas Åland' },
  AL: { common: 'Albânia', official: 'República da Albânia' },
  DZ: { common: 'Argélia', official: 'República Democrática Popular da Argélia' },
  AD: { common: 'Andorra', official: 'Principado de Andorra' },
  AO: { common: 'Angola', official: 'República de Angola' },
  AG: { common: 'Antígua e Barbuda', official: 'Antígua e Barbuda' },
  AR: { common: 'Argentina', official: 'República Argentina' },
  AM: { common: 'Armênia', official: 'República da Armênia' },
  AU: { common: 'Austrália', official: 'Comunidade da Austrália' },
  AT: { common: 'Áustria', official: 'República da Áustria' },
  AZ: { common: 'Azerbaijão', official: 'República do Azerbaijão' },
  BS: { common: 'Bahamas', official: 'Comunidade das Bahamas' },
  BH: { common: 'Bahrein', official: 'Reino do Bahrein' },
  BD: { common: 'Bangladesh', official: 'República Popular de Bangladesh' },
  BB: { common: 'Barbados', official: 'Barbados' },
  BY: { common: 'Bielorrússia', official: 'República da Bielorrússia' },
  BE: { common: 'Bélgica', official: 'Reino da Bélgica' },
  BZ: { common: 'Belize', official: 'Belize' },
  BJ: { common: 'Benin', official: 'República do Benin' },
  BT: { common: 'Butão', official: 'Reino do Butão' },
  BO: { common: 'Bolívia', official: 'Estado Plurinacional da Bolívia' },
  BA: { common: 'Bósnia e Herzegovina', official: 'Bósnia e Herzegovina' },
  BW: { common: 'Botsuana', official: 'República de Botsuana' },
  BR: { common: 'Brasil', official: 'República Federativa do Brasil' },
  BN: { common: 'Brunei', official: 'Nação do Brunei' },
  BG: { common: 'Bulgária', official: 'República da Bulgária' },
  BF: { common: 'Burkina Faso', official: 'Burkina Faso' },
  BI: { common: 'Burundi', official: 'República do Burundi' },
  CV: { common: 'Cabo Verde', official: 'República de Cabo Verde' },
  KH: { common: 'Camboja', official: 'Reino do Camboja' },
  CM: { common: 'Camarões', official: 'República dos Camarões' },
  CA: { common: 'Canadá', official: 'Canadá' },
  CF: { common: 'República Centro-Africana', official: 'República Centro-Africana' },
  TD: { common: 'Chade', official: 'República do Chade' },
  CL: { common: 'Chile', official: 'República do Chile' },
  CN: { common: 'China', official: 'República Popular da China' },
  CO: { common: 'Colômbia', official: 'República da Colômbia' },
  KM: { common: 'Comores', official: 'União das Comores' },
  CG: { common: 'Congo', official: 'República do Congo' },
  CD: { common: 'República Democrática do Congo', official: 'República Democrática do Congo' },
  CR: { common: 'Costa Rica', official: 'República da Costa Rica' },
  HR: { common: 'Croácia', official: 'República da Croácia' },
  CU: { common: 'Cuba', official: 'República de Cuba' },
  CY: { common: 'Chipre', official: 'República de Chipre' },
  CZ: { common: 'Tchéquia', official: 'República Tcheca' },
  DK: { common: 'Dinamarca', official: 'Reino da Dinamarca' },
  DJ: { common: 'Djibuti', official: 'República do Djibuti' },
  EG: { common: 'Egito', official: 'República Árabe do Egito' },
  SV: { common: 'El Salvador', official: 'República de El Salvador' },
  GQ: { common: 'Guiné Equatorial', official: 'República da Guiné Equatorial' },
  ER: { common: 'Eritreia', official: 'Estado da Eritreia' },
  EE: { common: 'Estônia', official: 'República da Estônia' },
  SZ: { common: 'Essuatíni', official: 'Reino de Essuatíni' },
  ET: { common: 'Etiópia', official: 'República Democrática Federal da Etiópia' },
  FJ: { common: 'Fiji', official: 'República de Fiji' },
  FI: { common: 'Finlândia', official: 'República da Finlândia' },
  FR: { common: 'França', official: 'República Francesa' },
  GA: { common: 'Gabão', official: 'República Gabonesa' },
  GM: { common: 'Gâmbia', official: 'República da Gâmbia' },
  GE: { common: 'Geórgia', official: 'Geórgia' },
  DE: { common: 'Alemanha', official: 'República Federal da Alemanha' },
  GH: { common: 'Gana', official: 'República de Gana' },
  GR: { common: 'Grécia', official: 'República Helênica' },
  GD: { common: 'Granada', official: 'Granada' },
  GT: { common: 'Guatemala', official: 'República da Guatemala' },
  GN: { common: 'Guiné', official: 'República da Guiné' },
  GW: { common: 'Guiné-Bissau', official: 'República da Guiné-Bissau' },
  GY: { common: 'Guiana', official: 'República Cooperativa da Guiana' },
  HT: { common: 'Haiti', official: 'República do Haiti' },
  HN: { common: 'Honduras', official: 'República de Honduras' },
  HU: { common: 'Hungria', official: 'Hungria' },
  IS: { common: 'Islândia', official: 'Islândia' },
  IN: { common: 'Índia', official: 'República da Índia' },
  ID: { common: 'Indonésia', official: 'República da Indonésia' },
  IR: { common: 'Irã', official: 'República Islâmica do Irã' },
  IQ: { common: 'Iraque', official: 'República do Iraque' },
  IE: { common: 'Irlanda', official: 'Irlanda' },
  IL: { common: 'Israel', official: 'Estado de Israel' },
  IT: { common: 'Itália', official: 'República Italiana' },
  JM: { common: 'Jamaica', official: 'Jamaica' },
  JP: { common: 'Japão', official: 'Japão' },
  JO: { common: 'Jordânia', official: 'Reino Hachemita da Jordânia' },
  KZ: { common: 'Cazaquistão', official: 'República do Cazaquistão' },
  KE: { common: 'Quênia', official: 'República do Quênia' },
  KI: { common: 'Quiribati', official: 'República Independente de Quiribati' },
  KP: { common: 'Coreia do Norte', official: 'República Popular Democrática da Coreia' },
  KR: { common: 'Coreia do Sul', official: 'República da Coreia' },
  KW: { common: 'Kuwait', official: 'Estado do Kuwait' },
  KG: { common: 'Quirguistão', official: 'República Quirguiz' },
  LA: { common: 'Laos', official: 'República Democrática Popular do Laos' },
  LV: { common: 'Letônia', official: 'República da Letônia' },
  LB: { common: 'Líbano', official: 'República Libanesa' },
  LS: { common: 'Lesoto', official: 'Reino do Lesoto' },
  LR: { common: 'Libéria', official: 'República da Libéria' },
  LY: { common: 'Líbia', official: 'Estado da Líbia' },
  LI: { common: 'Liechtenstein', official: 'Principado de Liechtenstein' },
  LT: { common: 'Lituânia', official: 'República da Lituânia' },
  LU: { common: 'Luxemburgo', official: 'Grão-Ducado de Luxemburgo' },
  MG: { common: 'Madagascar', official: 'República de Madagascar' },
  MW: { common: 'Malawi', official: 'República do Malawi' },
  MY: { common: 'Malásia', official: 'Malásia' },
  MV: { common: 'Maldivas', official: 'República das Maldivas' },
  ML: { common: 'Mali', official: 'República do Mali' },
  MT: { common: 'Malta', official: 'República de Malta' },
  MH: { common: 'Ilhas Marshall', official: 'República das Ilhas Marshall' },
  MR: { common: 'Mauritânia', official: 'República Islâmica da Mauritânia' },
  MU: { common: 'Maurício', official: 'República de Maurício' },
  MX: { common: 'México', official: 'Estados Unidos Mexicanos' },
  FM: { common: 'Micronésia', official: 'Estados Federados da Micronésia' },
  MD: { common: 'Moldávia', official: 'República da Moldávia' },
  MC: { common: 'Mônaco', official: 'Principado de Mônaco' },
  MN: { common: 'Mongólia', official: 'Mongólia' },
  ME: { common: 'Montenegro', official: 'Montenegro' },
  MA: { common: 'Marrocos', official: 'Reino de Marrocos' },
  MZ: { common: 'Moçambique', official: 'República de Moçambique' },
  MM: { common: 'Myanmar', official: 'República da União de Myanmar' },
  NA: { common: 'Namíbia', official: 'República da Namíbia' },
  NR: { common: 'Nauru', official: 'República de Nauru' },
  NP: { common: 'Nepal', official: 'República Democrática Federal do Nepal' },
  NL: { common: 'Países Baixos', official: 'Reino dos Países Baixos' },
  NZ: { common: 'Nova Zelândia', official: 'Nova Zelândia' },
  NI: { common: 'Nicarágua', official: 'República da Nicarágua' },
  NE: { common: 'Níger', official: 'República do Níger' },
  NG: { common: 'Nigéria', official: 'República Federal da Nigéria' },
  MK: { common: 'Macedônia do Norte', official: 'República da Macedônia do Norte' },
  NO: { common: 'Noruega', official: 'Reino da Noruega' },
  OM: { common: 'Omã', official: 'Sultanato de Omã' },
  PK: { common: 'Paquistão', official: 'República Islâmica do Paquistão' },
  PW: { common: 'Palau', official: 'República de Palau' },
  PS: { common: 'Palestina', official: 'Estado da Palestina' },
  PA: { common: 'Panamá', official: 'República do Panamá' },
  PG: { common: 'Papua-Nova Guiné', official: 'Estado Independente de Papua-Nova Guiné' },
  PY: { common: 'Paraguai', official: 'República do Paraguai' },
  PE: { common: 'Peru', official: 'República do Peru' },
  PH: { common: 'Filipinas', official: 'República das Filipinas' },
  PL: { common: 'Polônia', official: 'República da Polônia' },
  PT: { common: 'Portugal', official: 'República Portuguesa' },
  QA: { common: 'Qatar', official: 'Estado do Qatar' },
  RO: { common: 'Romênia', official: 'Romênia' },
  RU: { common: 'Rússia', official: 'Federação Russa' },
  RW: { common: 'Ruanda', official: 'República de Ruanda' },
  KN: { common: 'São Cristóvão e Névis', official: 'São Cristóvão e Névis' },
  LC: { common: 'Santa Lúcia', official: 'Santa Lúcia' },
  VC: { common: 'São Vicente e Granadinas', official: 'São Vicente e Granadinas' },
  WS: { common: 'Samoa', official: 'Estado Independente de Samoa' },
  SM: { common: 'San Marino', official: 'República de San Marino' },
  ST: { common: 'São Tomé e Príncipe', official: 'República Democrática de São Tomé e Príncipe' },
  SA: { common: 'Arábia Saudita', official: 'Reino da Arábia Saudita' },
  SN: { common: 'Senegal', official: 'República do Senegal' },
  RS: { common: 'Sérvia', official: 'República da Sérvia' },
  SC: { common: 'Seicheles', official: 'República de Seicheles' },
  SL: { common: 'Serra Leoa', official: 'República de Serra Leoa' },
  SG: { common: 'Singapura', official: 'República de Singapura' },
  SK: { common: 'Eslováquia', official: 'República Eslovaca' },
  SI: { common: 'Eslovênia', official: 'República da Eslovênia' },
  SB: { common: 'Ilhas Salomão', official: 'Ilhas Salomão' },
  SO: { common: 'Somália', official: 'República Federal da Somália' },
  ZA: { common: 'África do Sul', official: 'República da África do Sul' },
  SS: { common: 'Sudão do Sul', official: 'República do Sudão do Sul' },
  ES: { common: 'Espanha', official: 'Reino da Espanha' },
  LK: { common: 'Sri Lanka', official: 'República Democrática Socialista do Sri Lanka' },
  SD: { common: 'Sudão', official: 'República do Sudão' },
  SR: { common: 'Suriname', official: 'República do Suriname' },
  SE: { common: 'Suécia', official: 'Reino da Suécia' },
  CH: { common: 'Suíça', official: 'Confederação Suíça' },
  SY: { common: 'Síria', official: 'República Árabe Síria' },
  TW: { common: 'Taiwan', official: 'República da China (Taiwan)' },
  TJ: { common: 'Tajiquistão', official: 'República do Tajiquistão' },
  TZ: { common: 'Tanzânia', official: 'República Unida da Tanzânia' },
  TH: { common: 'Tailândia', official: 'Reino da Tailândia' },
  TL: { common: 'Timor-Leste', official: 'República Democrática de Timor-Leste' },
  TG: { common: 'Togo', official: 'República Togolesa' },
  TO: { common: 'Tonga', official: 'Reino de Tonga' },
  TT: { common: 'Trinidad e Tobago', official: 'República de Trinidad e Tobago' },
  TN: { common: 'Tunísia', official: 'República Tunisiana' },
  TR: { common: 'Turquia', official: 'República da Turquia' },
  TM: { common: 'Turcomenistão', official: 'Turcomenistão' },
  TV: { common: 'Tuvalu', official: 'Tuvalu' },
  UG: { common: 'Uganda', official: 'República de Uganda' },
  UA: { common: 'Ucrânia', official: 'Ucrânia' },
  AE: { common: 'Emirados Árabes Unidos', official: 'Emirados Árabes Unidos' },
  GB: { common: 'Reino Unido', official: 'Reino Unido da Grã-Bretanha e Irlanda do Norte' },
  US: { common: 'Estados Unidos', official: 'Estados Unidos da América' },
  UY: { common: 'Uruguai', official: 'República Oriental do Uruguai' },
  UZ: { common: 'Uzbequistão', official: 'República do Uzbequistão' },
  VU: { common: 'Vanuatu', official: 'República de Vanuatu' },
  VA: { common: 'Vaticano', official: 'Estado da Cidade do Vaticano' },
  VE: { common: 'Venezuela', official: 'República Bolivariana da Venezuela' },
  VN: { common: 'Vietnã', official: 'República Socialista do Vietnã' },
  YE: { common: 'Iêmen', official: 'República do Iêmen' },
  ZM: { common: 'Zâmbia', official: 'República da Zâmbia' },
  ZW: { common: 'Zimbábue', official: 'República do Zimbábue' },
};

// Mapeamento manual de traduções corretas em espanhol (por código de país)
const customTranslationsES: Record<string, { common: string; official: string }> = {
  AX: { common: 'Islas Åland', official: 'Islas Åland' },
  AL: { common: 'Albania', official: 'República de Albania' },
  DZ: { common: 'Argelia', official: 'República Democrática Popular de Argelia' },
  AD: { common: 'Andorra', official: 'Principado de Andorra' },
  AO: { common: 'Angola', official: 'República de Angola' },
  AG: { common: 'Antigua y Barbuda', official: 'Antigua y Barbuda' },
  AR: { common: 'Argentina', official: 'República Argentina' },
  AM: { common: 'Armenia', official: 'República de Armenia' },
  AU: { common: 'Australia', official: 'Mancomunidad de Australia' },
  AT: { common: 'Austria', official: 'República de Austria' },
  AZ: { common: 'Azerbaiyán', official: 'República de Azerbaiyán' },
  BS: { common: 'Bahamas', official: 'Mancomunidad de las Bahamas' },
  BH: { common: 'Baréin', official: 'Reino de Baréin' },
  BD: { common: 'Bangladés', official: 'República Popular de Bangladés' },
  BB: { common: 'Barbados', official: 'Barbados' },
  BY: { common: 'Bielorrusia', official: 'República de Bielorrusia' },
  BE: { common: 'Bélgica', official: 'Reino de Bélgica' },
  BZ: { common: 'Belice', official: 'Belice' },
  BJ: { common: 'Benín', official: 'República de Benín' },
  BT: { common: 'Bután', official: 'Reino de Bután' },
  BO: { common: 'Bolivia', official: 'Estado Plurinacional de Bolivia' },
  BA: { common: 'Bosnia y Herzegovina', official: 'Bosnia y Herzegovina' },
  BW: { common: 'Botsuana', official: 'República de Botsuana' },
  BR: { common: 'Brasil', official: 'República Federativa del Brasil' },
  BN: { common: 'Brunéi', official: 'Nación de Brunéi' },
  BG: { common: 'Bulgaria', official: 'República de Bulgaria' },
  BF: { common: 'Burkina Faso', official: 'Burkina Faso' },
  BI: { common: 'Burundi', official: 'República de Burundi' },
  CV: { common: 'Cabo Verde', official: 'República de Cabo Verde' },
  KH: { common: 'Camboya', official: 'Reino de Camboya' },
  CM: { common: 'Camerún', official: 'República de Camerún' },
  CA: { common: 'Canadá', official: 'Canadá' },
  CF: { common: 'República Centroafricana', official: 'República Centroafricana' },
  TD: { common: 'Chad', official: 'República del Chad' },
  CL: { common: 'Chile', official: 'República de Chile' },
  CN: { common: 'China', official: 'República Popular China' },
  CO: { common: 'Colombia', official: 'República de Colombia' },
  KM: { common: 'Comoras', official: 'Unión de las Comoras' },
  CG: { common: 'Congo', official: 'República del Congo' },
  CD: { common: 'República Democrática del Congo', official: 'República Democrática del Congo' },
  CR: { common: 'Costa Rica', official: 'República de Costa Rica' },
  HR: { common: 'Croacia', official: 'República de Croacia' },
  CU: { common: 'Cuba', official: 'República de Cuba' },
  CY: { common: 'Chipre', official: 'República de Chipre' },
  CZ: { common: 'Chequia', official: 'República Checa' },
  DK: { common: 'Dinamarca', official: 'Reino de Dinamarca' },
  DJ: { common: 'Yibuti', official: 'República de Yibuti' },
  DM: { common: 'Dominica', official: 'Mancomunidad de Dominica' },
  DO: { common: 'República Dominicana', official: 'República Dominicana' },
  EC: { common: 'Ecuador', official: 'República del Ecuador' },
  EG: { common: 'Egipto', official: 'República Árabe de Egipto' },
  SV: { common: 'El Salvador', official: 'República de El Salvador' },
  GQ: { common: 'Guinea Ecuatorial', official: 'República de Guinea Ecuatorial' },
  ER: { common: 'Eritrea', official: 'Estado de Eritrea' },
  EE: { common: 'Estonia', official: 'República de Estonia' },
  SZ: { common: 'Esuatini', official: 'Reino de Esuatini' },
  ET: { common: 'Etiopía', official: 'República Democrática Federal de Etiopía' },
  FJ: { common: 'Fiyi', official: 'República de Fiyi' },
  FI: { common: 'Finlandia', official: 'República de Finlandia' },
  FR: { common: 'Francia', official: 'República Francesa' },
  GA: { common: 'Gabón', official: 'República Gabonesa' },
  GM: { common: 'Gambia', official: 'República de Gambia' },
  GE: { common: 'Georgia', official: 'Georgia' },
  DE: { common: 'Alemania', official: 'República Federal de Alemania' },
  GH: { common: 'Ghana', official: 'República de Ghana' },
  GR: { common: 'Grecia', official: 'República Helénica' },
  GD: { common: 'Granada', official: 'Granada' },
  GT: { common: 'Guatemala', official: 'República de Guatemala' },
  GN: { common: 'Guinea', official: 'República de Guinea' },
  GW: { common: 'Guinea-Bisáu', official: 'República de Guinea-Bisáu' },
  GY: { common: 'Guyana', official: 'República Cooperativa de Guyana' },
  HT: { common: 'Haití', official: 'República de Haití' },
  HN: { common: 'Honduras', official: 'República de Honduras' },
  HU: { common: 'Hungría', official: 'Hungría' },
  IS: { common: 'Islandia', official: 'Islandia' },
  IN: { common: 'India', official: 'República de la India' },
  ID: { common: 'Indonesia', official: 'República de Indonesia' },
  IR: { common: 'Irán', official: 'República Islámica de Irán' },
  IQ: { common: 'Irak', official: 'República de Irak' },
  IE: { common: 'Irlanda', official: 'República de Irlanda' },
  IL: { common: 'Israel', official: 'Estado de Israel' },
  IT: { common: 'Italia', official: 'República Italiana' },
  CI: { common: 'Costa de Marfil', official: 'República de Costa de Marfil' },
  JM: { common: 'Jamaica', official: 'Jamaica' },
  JP: { common: 'Japón', official: 'Japón' },
  JO: { common: 'Jordania', official: 'Reino Hachemita de Jordania' },
  KZ: { common: 'Kazajistán', official: 'República de Kazajistán' },
  KE: { common: 'Kenia', official: 'República de Kenia' },
  KI: { common: 'Kiribati', official: 'República de Kiribati' },
  KP: { common: 'Corea del Norte', official: 'República Popular Democrática de Corea' },
  KR: { common: 'Corea del Sur', official: 'República de Corea' },
  KW: { common: 'Kuwait', official: 'Estado de Kuwait' },
  KG: { common: 'Kirguistán', official: 'República Kirguisa' },
  LA: { common: 'Laos', official: 'República Democrática Popular Lao' },
  LV: { common: 'Letonia', official: 'República de Letonia' },
  LB: { common: 'Líbano', official: 'República Libanesa' },
  LS: { common: 'Lesoto', official: 'Reino de Lesoto' },
  LR: { common: 'Liberia', official: 'República de Liberia' },
  LY: { common: 'Libia', official: 'Estado de Libia' },
  LI: { common: 'Liechtenstein', official: 'Principado de Liechtenstein' },
  LT: { common: 'Lituania', official: 'República de Lituania' },
  LU: { common: 'Luxemburgo', official: 'Gran Ducado de Luxemburgo' },
  MG: { common: 'Madagascar', official: 'República de Madagascar' },
  MW: { common: 'Malaui', official: 'República de Malaui' },
  MY: { common: 'Malasia', official: 'Malasia' },
  MV: { common: 'Maldivas', official: 'República de Maldivas' },
  ML: { common: 'Malí', official: 'República de Malí' },
  MT: { common: 'Malta', official: 'República de Malta' },
  MH: { common: 'Islas Marshall', official: 'República de las Islas Marshall' },
  MR: { common: 'Mauritania', official: 'República Islámica de Mauritania' },
  MU: { common: 'Mauricio', official: 'República de Mauricio' },
  MX: { common: 'México', official: 'Estados Unidos Mexicanos' },
  FM: { common: 'Micronesia', official: 'Estados Federados de Micronesia' },
  MD: { common: 'Moldavia', official: 'República de Moldavia' },
  MC: { common: 'Mónaco', official: 'Principado de Mónaco' },
  MN: { common: 'Mongolia', official: 'Mongolia' },
  ME: { common: 'Montenegro', official: 'Montenegro' },
  MA: { common: 'Marruecos', official: 'Reino de Marruecos' },
  MZ: { common: 'Mozambique', official: 'República de Mozambique' },
  MM: { common: 'Myanmar', official: 'República de la Unión de Myanmar' },
  NA: { common: 'Namibia', official: 'República de Namibia' },
  NR: { common: 'Nauru', official: 'República de Nauru' },
  NP: { common: 'Nepal', official: 'República Democrática Federal de Nepal' },
  NL: { common: 'Países Bajos', official: 'Reino de los Países Bajos' },
  NZ: { common: 'Nueva Zelanda', official: 'Nueva Zelanda' },
  NI: { common: 'Nicaragua', official: 'República de Nicaragua' },
  NE: { common: 'Níger', official: 'República de Níger' },
  NG: { common: 'Nigeria', official: 'República Federal de Nigeria' },
  MK: { common: 'Macedonia del Norte', official: 'República de Macedonia del Norte' },
  NO: { common: 'Noruega', official: 'Reino de Noruega' },
  OM: { common: 'Omán', official: 'Sultanato de Omán' },
  PK: { common: 'Pakistán', official: 'República Islámica de Pakistán' },
  PW: { common: 'Palaos', official: 'República de Palaos' },
  PA: { common: 'Panamá', official: 'República de Panamá' },
  PG: { common: 'Papúa Nueva Guinea', official: 'Estado Independiente de Papúa Nueva Guinea' },
  PY: { common: 'Paraguay', official: 'República del Paraguay' },
  PE: { common: 'Perú', official: 'República del Perú' },
  PH: { common: 'Filipinas', official: 'República de Filipinas' },
  PL: { common: 'Polonia', official: 'República de Polonia' },
  PT: { common: 'Portugal', official: 'República Portuguesa' },
  QA: { common: 'Catar', official: 'Estado de Catar' },
  RO: { common: 'Rumania', official: 'Rumania' },
  RU: { common: 'Rusia', official: 'Federación de Rusia' },
  RW: { common: 'Ruanda', official: 'República de Ruanda' },
  KN: { common: 'San Cristóbal y Nieves', official: 'Federación de San Cristóbal y Nieves' },
  LC: { common: 'Santa Lucía', official: 'Santa Lucía' },
  VC: { common: 'San Vicente y las Granadinas', official: 'San Vicente y las Granadinas' },
  WS: { common: 'Samoa', official: 'Estado Independiente de Samoa' },
  SM: { common: 'San Marino', official: 'República de San Marino' },
  ST: {
    common: 'Santo Tomé y Príncipe',
    official: 'República Democrática de Santo Tomé y Príncipe',
  },
  SA: { common: 'Arabia Saudita', official: 'Reino de Arabia Saudita' },
  SN: { common: 'Senegal', official: 'República de Senegal' },
  RS: { common: 'Serbia', official: 'República de Serbia' },
  SC: { common: 'Seychelles', official: 'República de Seychelles' },
  SL: { common: 'Sierra Leona', official: 'República de Sierra Leona' },
  SG: { common: 'Singapur', official: 'República de Singapur' },
  SK: { common: 'Eslovaquia', official: 'República Eslovaca' },
  SI: { common: 'Eslovenia', official: 'República de Eslovenia' },
  SB: { common: 'Islas Salomón', official: 'Islas Salomón' },
  SO: { common: 'Somalia', official: 'República Federal de Somalia' },
  ZA: { common: 'Sudáfrica', official: 'República de Sudáfrica' },
  SS: { common: 'Sudán del Sur', official: 'República de Sudán del Sur' },
  ES: { common: 'España', official: 'Reino de España' },
  LK: { common: 'Sri Lanka', official: 'República Democrática Socialista de Sri Lanka' },
  SD: { common: 'Sudán', official: 'República de Sudán' },
  SR: { common: 'Surinam', official: 'República de Surinam' },
  SE: { common: 'Suecia', official: 'Reino de Suecia' },
  CH: { common: 'Suiza', official: 'Confederación Suiza' },
  SY: { common: 'Siria', official: 'República Árabe Siria' },
  TW: { common: 'Taiwán', official: 'República de China (Taiwán)' },
  TJ: { common: 'Tayikistán', official: 'República de Tayikistán' },
  TZ: { common: 'Tanzania', official: 'República Unida de Tanzania' },
  TH: { common: 'Tailandia', official: 'Reino de Tailandia' },
  TL: { common: 'Timor-Leste', official: 'República Democrática de Timor-Leste' },
  TG: { common: 'Togo', official: 'República Togolesa' },
  TO: { common: 'Tonga', official: 'Reino de Tonga' },
  TT: { common: 'Trinidad y Tobago', official: 'República de Trinidad y Tobago' },
  TN: { common: 'Túnez', official: 'República Tunecina' },
  TR: { common: 'Turquía', official: 'República de Turquía' },
  TM: { common: 'Turkmenistán', official: 'Turkmenistán' },
  TV: { common: 'Tuvalu', official: 'Tuvalu' },
  UG: { common: 'Uganda', official: 'República de Uganda' },
  UA: { common: 'Ucrania', official: 'Ucrania' },
  AE: { common: 'Emiratos Árabes Unidos', official: 'Emiratos Árabes Unidos' },
  GB: { common: 'Reino Unido', official: 'Reino Unido de Gran Bretaña e Irlanda del Norte' },
  US: { common: 'Estados Unidos', official: 'Estados Unidos de América' },
  UY: { common: 'Uruguay', official: 'República Oriental del Uruguay' },
  UZ: { common: 'Uzbekistán', official: 'República de Uzbekistán' },
  VU: { common: 'Vanuatu', official: 'República de Vanuatu' },
  VA: { common: 'Ciudad del Vaticano', official: 'Estado de la Ciudad del Vaticano' },
  VE: { common: 'Venezuela', official: 'República Bolivariana de Venezuela' },
  VN: { common: 'Vietnam', official: 'República Socialista de Vietnam' },
  YE: { common: 'Yemen', official: 'República de Yemen' },
  ZM: { common: 'Zambia', official: 'República de Zambia' },
  ZW: { common: 'Zimbabue', official: 'República de Zimbabue' },
};

export const useTranslatedCountryNames = () => {
  const { i18n } = useTranslation();

  const getTranslatedName = (country: Country, type: 'common' | 'official' = 'common'): string => {
    if (!country) return '';

    const currentLang = i18n.language;

    // Mapeamento de códigos i18n para códigos da API REST Countries
    const langMap: Record<string, string> = {
      pt: 'por',
      'pt-BR': 'por',
      en: 'eng',
      'en-US': 'eng',
      es: 'spa',
      'es-ES': 'spa',
    };

    const translationCode = langMap[currentLang] || 'eng';

    // PRIORIDADE 1: Usar traduções customizadas para português
    if (translationCode === 'por' && customTranslationsPT[country.cca2]) {
      return customTranslationsPT[country.cca2][type];
    }

    // PRIORIDADE 1B: Usar traduções customizadas para espanhol
    if (translationCode === 'spa' && customTranslationsES[country.cca2]) {
      return customTranslationsES[country.cca2][type];
    }

    // PRIORIDADE 2: Tentar pegar a tradução da API
    if (country.translations && country.translations[translationCode]) {
      const translatedName = country.translations[translationCode][type];
      if (translatedName) return translatedName;
    }

    // PRIORIDADE 3: Fallback para o nome em inglês
    return country.name?.[type] || country.name?.common || '';
  };

  // Helper para buscar país por nome (em qualquer idioma)
  const findCountryByTranslatedName = (
    countries: Country[],
    searchName: string
  ): Country | null => {
    if (!countries || !searchName) return null;

    const normalizedSearch = searchName.toLowerCase().trim();
    const currentLang = i18n.language;
    const langMap: Record<string, string> = {
      pt: 'por',
      'pt-BR': 'por',
      en: 'eng',
      'en-US': 'eng',
      es: 'spa',
      'es-ES': 'spa',
    };
    const translationCode = langMap[currentLang] || 'eng';

    // Buscar em todas as possíveis traduções
    for (const country of countries) {
      // PRIORIDADE 1: Buscar em traduções customizadas PT
      if (translationCode === 'por' && customTranslationsPT[country.cca2]) {
        const customTranslation = customTranslationsPT[country.cca2];
        if (
          customTranslation.common.toLowerCase() === normalizedSearch ||
          customTranslation.official.toLowerCase() === normalizedSearch
        ) {
          return country;
        }
      }

      // PRIORIDADE 1B: Buscar em traduções customizadas ES
      if (translationCode === 'spa' && customTranslationsES[country.cca2]) {
        const customTranslation = customTranslationsES[country.cca2];
        if (
          customTranslation.common.toLowerCase() === normalizedSearch ||
          customTranslation.official.toLowerCase() === normalizedSearch
        ) {
          return country;
        }
      }

      // PRIORIDADE 2: Nome comum em inglês
      if (country.name?.common?.toLowerCase() === normalizedSearch) {
        return country;
      }

      // PRIORIDADE 3: Nome oficial em inglês
      if (country.name?.official?.toLowerCase() === normalizedSearch) {
        return country;
      }

      // PRIORIDADE 4: Traduções da API
      if (country.translations) {
        for (const translation of Object.values(country.translations)) {
          if (
            translation.common?.toLowerCase() === normalizedSearch ||
            translation.official?.toLowerCase() === normalizedSearch
          ) {
            return country;
          }
        }
      }

      // PRIORIDADE 5: Alt spellings
      if (country.altSpellings?.some(alt => alt.toLowerCase() === normalizedSearch)) {
        return country;
      }
    }

    return null;
  };

  return { getTranslatedName, findCountryByTranslatedName };
};
