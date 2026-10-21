export interface SubdivisionOption {
  id: string;
  name: string;
  districts: string[];
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  phonePrefix: string;
  phonePlaceholder: string;
  subdivisionLabel: string; // e.g. "State", "Region", "Province", "Emirate"
  districtLabel: string;    // e.g. "County / Metro Area", "District / Municipal Assembly", "Borough / District"
  postalLabel: string;      // e.g. "ZIP Code", "GhanaPost GPS Address", "Postal Code", "Postcode"
  postalPlaceholder: string;
  logisticsHub: string;
  subdivisions: SubdivisionOption[];
}

export const COUNTRIES: CountryOption[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phonePrefix: '+1',
    phonePlaceholder: '(555) 234-5678',
    subdivisionLabel: 'State',
    districtLabel: 'County / Metro District',
    postalLabel: 'ZIP Code',
    postalPlaceholder: 'e.g. 89101 or 78701',
    logisticsHub: 'Direct Continental US Flatbed Freight',
    subdivisions: [
      {
        id: 'NV',
        name: 'Nevada',
        districts: ['Clark County (Las Vegas / Henderson)', 'Washoe County (Reno / Sparks)', 'Carson City', 'Douglas County (Lake Tahoe)', 'Nye County', 'Elko County', 'Other NV County'],
      },
      {
        id: 'CA',
        name: 'California',
        districts: ['Los Angeles County', 'Orange County', 'San Diego County', 'Santa Clara County (Silicon Valley)', 'San Francisco & Bay Area', 'Riverside County', 'San Bernardino County', 'Sacramento County', 'Fresno County', 'Other CA County'],
      },
      {
        id: 'TX',
        name: 'Texas',
        districts: ['Travis County (Austin Metro)', 'Harris County (Houston Metro)', 'Dallas County', 'Tarrant County (Fort Worth)', 'Bexar County (San Antonio)', 'Collin County (Plano/Frisco)', 'Denton County', 'Williamson County', 'Other TX County'],
      },
      {
        id: 'FL',
        name: 'Florida',
        districts: ['Miami-Dade County', 'Broward County (Ft. Lauderdale)', 'Palm Beach County', 'Orange County (Orlando)', 'Hillsborough County (Tampa)', 'Duval County (Jacksonville)', 'Pinellas County (St. Pete)', 'Lee County (Fort Myers)', 'Other FL County'],
      },
      {
        id: 'AZ',
        name: 'Arizona',
        districts: ['Maricopa County (Phoenix / Scottsdale)', 'Pima County (Tucson)', 'Coconino County (Flagstaff / Sedona)', 'Pinal County', 'Yavapai County (Prescott)', 'Other AZ County'],
      },
      {
        id: 'WA',
        name: 'Washington',
        districts: ['King County (Seattle / Bellevue)', 'Pierce County (Tacoma)', 'Snohomish County (Everett)', 'Spokane County', 'Clark County (Vancouver)', 'Thurston County (Olympia)', 'Other WA County'],
      },
      {
        id: 'CO',
        name: 'Colorado',
        districts: ['Denver County', 'Boulder County', 'El Paso County (Colorado Springs)', 'Arapahoe County', 'Jefferson County', 'Larimer County (Fort Collins)', 'Eagle County (Vail / Aspen area)', 'Other CO County'],
      },
      {
        id: 'NY',
        name: 'New York',
        districts: ['New York City (5 Boroughs)', 'Westchester County', 'Nassau County (Long Island)', 'Suffolk County (Hamptons)', 'Erie County (Buffalo)', 'Monroe County (Rochester)', 'Albany County', 'Other NY County'],
      },
      {
        id: 'GA',
        name: 'Georgia',
        districts: ['Fulton County (Atlanta)', 'Gwinnett County', 'Cobb County', 'DeKalb County', 'Chatham County (Savannah)', 'Cherokee County', 'Other GA County'],
      },
      {
        id: 'NC',
        name: 'North Carolina',
        districts: ['Wake County (Raleigh)', 'Mecklenburg County (Charlotte)', 'Durham County', 'Buncombe County (Asheville)', 'Guilford County (Greensboro)', 'Other NC County'],
      },
      {
        id: 'UT',
        name: 'Utah',
        districts: ['Salt Lake County', 'Utah County (Provo)', 'Davis County', 'Washington County (St. George)', 'Summit County (Park City)', 'Other UT County'],
      },
      {
        id: 'HI',
        name: 'Hawaii',
        districts: ['Honolulu County (Oahu)', 'Maui County', 'Hawaii County (Big Island)', 'Kauai County'],
      },
      {
        id: 'OR',
        name: 'Oregon',
        districts: ['Multnomah County (Portland)', 'Washington County (Beaverton)', 'Clackamas County', 'Lane County (Eugene)', 'Deschutes County (Bend)', 'Other OR County'],
      },
      {
        id: 'TN',
        name: 'Tennessee',
        districts: ['Davidson County (Nashville)', 'Shelby County (Memphis)', 'Knox County (Knoxville)', 'Hamilton County (Chattanooga)', 'Williamson County (Franklin)', 'Other TN County'],
      },
      {
        id: 'IL',
        name: 'Illinois',
        districts: ['Cook County (Chicago)', 'DuPage County', 'Lake County', 'Will County', 'Kane County', 'Other IL County'],
      },
      {
        id: 'PA',
        name: 'Pennsylvania',
        districts: ['Philadelphia County', 'Allegheny County (Pittsburgh)', 'Montgomery County', 'Bucks County', 'Chester County', 'Other PA County'],
      },
    ],
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    phonePrefix: '+233',
    phonePlaceholder: '024 123 4567',
    subdivisionLabel: 'Region',
    districtLabel: 'District / Municipal Assembly',
    postalLabel: 'GhanaPost GPS Digital Address',
    postalPlaceholder: 'e.g. GA-183-9024 or AK-039-2011',
    logisticsHub: 'Tema Harbour Direct Port & Intermodal Transport',
    subdivisions: [
      {
        id: 'GAR',
        name: 'Greater Accra Region',
        districts: [
          'Ayawaso West Municipal (East Legon / Dzorwulu / Airport Residential)',
          'Accra Metropolitan Assembly (Osu / Ridge / Jamestown)',
          'La Dade-Kotopon Municipal (Cantonments / Labone)',
          'Tema Metropolitan (Community 1-25 / Heavy Industrial Area)',
          'Ga East Municipal (Dome / Kwabenya / Abokobi)',
          'Adentan Municipal (Frafraha / Ashiyie / Amrahia)',
          'Ga South Municipal (Weija / Gbawe)',
          'Ga West Municipal (Amasaman / Pokuase)',
          'Ledzokuku Municipal (Teshie)',
          'Krowor Municipal (Nungua)',
          'Kpone-Katamanso Municipal (Oyibi / Appolonia)',
          'Shai-Osudoku District (Dodowa / Doryumu)',
          'Other Greater Accra District',
        ],
      },
      {
        id: 'AR',
        name: 'Ashanti Region',
        districts: [
          'Kumasi Metropolitan Assembly (Nhyiaeso / Bantama / Subin)',
          'Asokore Mampong Municipal (Asabi / Parkoso)',
          'Oforikrom Municipal (KNUST / Bomso / Anwomaso)',
          'Kwadaso Municipal',
          'Ejisu Municipal (Fumesua / Krapa)',
          'Obuasi Municipal',
          'Atwima Nwabiagya Municipal',
          'Bekwai Municipal',
          'Mampong Municipal',
          'Other Ashanti District',
        ],
      },
      {
        id: 'WR',
        name: 'Western Region',
        districts: [
          'Sekondi-Takoradi Metropolitan (Airport Ridge / Beach Road)',
          'Tarkwa-Nsuaem Municipal',
          'Effia-Kwesimintsim Municipal',
          'Ahanta West Municipal (Dixcove / Busua Eco-Beach)',
          'Ellembelle District',
          'Nzema East Municipal (Axim)',
          'Other Western District',
        ],
      },
      {
        id: 'CR',
        name: 'Central Region',
        districts: [
          'Cape Coast Metropolitan',
          'Awutu Senya East Municipal (Kasoa)',
          'Komenda-Edina-Eguafo-Abirem Municipal (Elmina)',
          'Mfantseman Municipal (Saltpond)',
          'Effutu Municipal (Winneba)',
          'Gomoa East District',
          'Other Central District',
        ],
      },
      {
        id: 'ER',
        name: 'Eastern Region',
        districts: [
          'New Juaben South Municipal (Koforidua)',
          'Akuapem South Municipal (Nsawam / Aburi Mountain)',
          'Akuapem North Municipal (Akropong / Mampong)',
          'Birim Central Municipal (Oda)',
          'Kwahu South Municipal (Mpraeso / Obomeng Plateau)',
          'Asuogyaman District (Akosombo / Lake Volta)',
          'Other Eastern District',
        ],
      },
      {
        id: 'VR',
        name: 'Volta Region',
        districts: [
          'Ho Municipal',
          'Kpando Municipal',
          'Ketu South Municipal (Aflao)',
          'South Dayi District (Peki)',
          'South Tongu District (Sogakope)',
          'Ho West District',
          'Other Volta District',
        ],
      },
      {
        id: 'NR',
        name: 'Northern Region',
        districts: [
          'Tamale Metropolitan',
          'Sagnarigu Municipal',
          'Yendi Municipal',
          'Other Northern District',
        ],
      },
      {
        id: 'BR',
        name: 'Bono Region',
        districts: [
          'Sunyani Municipal',
          'Berekum East Municipal',
          'Dormaa Central Municipal',
          'Other Bono District',
        ],
      },
      {
        id: 'WNR',
        name: 'Western North Region',
        districts: [
          'Sefwi Wiawso Municipal',
          'Bibiani-Anhwiaso-Bekwai Municipal',
          'Other Western North District',
        ],
      },
      {
        id: 'UER',
        name: 'Upper East Region',
        districts: ['Bolgatanga Municipal', 'Kassena Nankana Municipal (Navrongo)', 'Other Upper East District'],
      },
      {
        id: 'UWR',
        name: 'Upper West Region',
        districts: ['Wa Municipal', 'Jirapa Municipal', 'Other Upper West District'],
      },
      {
        id: 'ORR',
        name: 'Oti Region',
        districts: ['Dambai / Krachi East', 'Nkwanta South Municipal', 'Other Oti District'],
      },
      {
        id: 'BER',
        name: 'Bono East Region',
        districts: ['Techiman Municipal', 'Kintampo Municipal', 'Other Bono East District'],
      },
      {
        id: 'AHR',
        name: 'Ahafo Region',
        districts: ['Goaso / Asunafo North Municipal', 'Tano North Municipal', 'Other Ahafo District'],
      },
      {
        id: 'NER',
        name: 'North East Region',
        districts: ['Nalerigu / East Mamprusi Municipal', 'West Mamprusi Municipal', 'Other North East District'],
      },
      {
        id: 'SR',
        name: 'Savannah Region',
        districts: ['Damongo / West Gonja Municipal', 'Bole District', 'Other Savannah District'],
      },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    phonePrefix: '+1',
    phonePlaceholder: '(416) 555-0199',
    subdivisionLabel: 'Province / Territory',
    districtLabel: 'Regional Municipality / District',
    postalLabel: 'Postal Code',
    postalPlaceholder: 'e.g. M5V 2T6 or V6B 1A1',
    logisticsHub: 'Trans-Canada Heavy Corridor Freight',
    subdivisions: [
      {
        id: 'ON',
        name: 'Ontario',
        districts: ['City of Toronto', 'Peel Region (Mississauga / Brampton)', 'York Region (Markham / Vaughan)', 'Halton Region (Oakville / Burlington)', 'Ottawa Region', 'Waterloo Region (Kitchener / Cambridge)', 'Simcoe County (Barrie)', 'Niagara Region', 'Other ON District'],
      },
      {
        id: 'BC',
        name: 'British Columbia',
        districts: ['Metro Vancouver (Vancouver / Burnaby / Richmond / Surrey)', 'Capital Regional District (Victoria / Saanich)', 'Central Okanagan (Kelowna)', 'Fraser Valley (Abbotsford / Chilliwack)', 'Squamish-Lillooet (Whistler)', 'Nanaimo Regional District', 'Other BC District'],
      },
      {
        id: 'AB',
        name: 'Alberta',
        districts: ['Calgary Metropolitan Region', 'Edmonton Metropolitan Region', 'Rocky View County', 'Strathcona County', 'Bow Valley (Canmore / Banff)', 'Red Deer County', 'Other AB District'],
      },
      {
        id: 'QC',
        name: 'Quebec',
        districts: ['Agglomeration of Montreal', 'Capitale-Nationale (Quebec City)', 'Laval', 'Longueuil / South Shore', 'Gatineau / Outaouais', 'Laurentides', 'Other QC District'],
      },
      {
        id: 'NS',
        name: 'Nova Scotia',
        districts: ['Halifax Regional Municipality', 'Cape Breton', 'Kings County (Annapolis Valley)', 'Other NS District'],
      },
      {
        id: 'MB',
        name: 'Manitoba',
        districts: ['Winnipeg Metropolitan Region', 'Brandon / Westman', 'Other MB District'],
      },
      {
        id: 'SK',
        name: 'Saskatchewan',
        districts: ['Saskatoon Region', 'Regina Region', 'Other SK District'],
      },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phonePrefix: '+44',
    phonePlaceholder: '07911 123456',
    subdivisionLabel: 'Country / Region',
    districtLabel: 'County / Borough / Council',
    postalLabel: 'Postcode',
    postalPlaceholder: 'e.g. SW1A 1AA or M1 1AE',
    logisticsHub: 'UK Nationwide Heavy Transport & Hiab Crane Delivery',
    subdivisions: [
      {
        id: 'GL',
        name: 'Greater London',
        districts: ['City of Westminster & Central London', 'Kensington, Chelsea & Hammersmith', 'Camden & Islington', 'Tower Hamlets & Hackney (East)', 'Wandsworth, Richmond & Kingston (South West)', 'Greenwich & Lewisham', 'Barnet & Enfield', 'Other London Borough'],
      },
      {
        id: 'SE',
        name: 'South East England',
        districts: ['Surrey (Guildford / Woking)', 'Oxfordshire (Oxford / Cotswolds)', 'Berkshire (Reading / Windsor)', 'Kent (Sevenoaks / Tunbridge Wells)', 'Hampshire (Winchester / Southampton)', 'Buckinghamshire (Milton Keynes)', 'East & West Sussex', 'Other South East Area'],
      },
      {
        id: 'NW',
        name: 'North West England',
        districts: ['Greater Manchester', 'Merseyside (Liverpool)', 'Cheshire (Chester / Warrington)', 'Lancashire', 'Cumbria (Lake District)'],
      },
      {
        id: 'WM',
        name: 'West Midlands',
        districts: ['Birmingham & Solihull', 'Warwickshire (Stratford / Warwick / Leamington)', 'Worcestershire', 'Coventry & Black Country', 'Shropshire'],
      },
      {
        id: 'SW',
        name: 'South West England',
        districts: ['Bristol & Bath', 'Gloucestershire (Cheltenham / Cotswolds)', 'Somerset', 'Dorset (Bournemouth / Poole)', 'Devon (Exeter / Torbay)', 'Cornwall'],
      },
      {
        id: 'SCOT',
        name: 'Scotland',
        districts: ['City of Edinburgh & Lothians', 'Glasgow City & Clyde Valley', 'Aberdeen City & Shire', 'Dundee & Angus', 'Highland & Islands'],
      },
      {
        id: 'WALES',
        name: 'Wales',
        districts: ['Cardiff & Vale of Glamorgan', 'Swansea Bay & Gower', 'Newport & Gwent', 'North Wales (Conwy / Gwynedd)'],
      },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    phonePrefix: '+61',
    phonePlaceholder: '0412 345 678',
    subdivisionLabel: 'State / Territory',
    districtLabel: 'Local Government Area / Region',
    postalLabel: 'Postcode',
    postalPlaceholder: 'e.g. 2000 or 3000',
    logisticsHub: 'Port Botany & National Heavy Freight Road Train',
    subdivisions: [
      {
        id: 'NSW',
        name: 'New South Wales',
        districts: ['City of Sydney & Inner West', 'Eastern Suburbs', 'Northern Beaches', 'Western Sydney & Parramatta', 'Hills District & Hawkesbury', 'Newcastle & Hunter Region', 'Wollongong & Illawarra', 'Byron Shire & Northern Rivers', 'Other NSW Region'],
      },
      {
        id: 'VIC',
        name: 'Victoria',
        districts: ['City of Melbourne & Yarra', 'Port Phillip & Bayside', 'Stonnington & Boroondara', 'Geelong & Surf Coast Shire', 'Mornington Peninsula', 'Yarra Ranges', 'Bendigo & Ballarat', 'Other VIC Region'],
      },
      {
        id: 'QLD',
        name: 'Queensland',
        districts: ['Brisbane City Council', 'Gold Coast City', 'Sunshine Coast Regional Council', 'Moreton Bay Region', 'Noosa Shire', 'Cairns & Tropical North', 'Whitsundays', 'Other QLD Region'],
      },
      {
        id: 'WA_AU',
        name: 'Western Australia',
        districts: ['City of Perth & Fremantle', 'Stirling & Joondalup', 'Swan & Perth Hills', 'South West (Margaret River / Busselton)', 'Mandurah & Peel', 'Other WA Region'],
      },
      {
        id: 'SA',
        name: 'South Australia',
        districts: ['City of Adelaide & Metro', 'Adelaide Hills', 'Barossa Valley', 'Fleurieu Peninsula', 'Other SA Region'],
      },
    ],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    phonePrefix: '+234',
    phonePlaceholder: '0803 123 4567',
    subdivisionLabel: 'State',
    districtLabel: 'Local Government Area (LGA) / District',
    postalLabel: 'Postal / Area Code',
    postalPlaceholder: 'e.g. 101233 or 900001',
    logisticsHub: 'Lekki Deep Sea Port & Nationwide Heavy Logistics',
    subdivisions: [
      {
        id: 'LA',
        name: 'Lagos State',
        districts: [
          'Eti-Osa (Ikoyi / Victoria Island / Lekki Phase 1 / Chevron)',
          'Ibeju-Lekki (Free Trade Zone / Dangote Refinery / Epe Axis)',
          'Ikeja (GRA / Alausa / Maryland)',
          'Lagos Island (Marina / Onikan)',
          'Surulere / Yaba Tech Corridor',
          'Alimosho',
          'Kosofe (Magodo / Ogudu GRA)',
          'Other Lagos LGA',
        ],
      },
      {
        id: 'FCT',
        name: 'Federal Capital Territory (Abuja)',
        districts: [
          'Abuja Municipal (Maitama / Asokoro / Guzape / Wuse II)',
          'Gwarinpa Estate & Life Camp',
          'Jabi & Utako Districts',
          'Bwari Area Council',
          'Kuje Area Council',
          'Other FCT District',
        ],
      },
      {
        id: 'RI',
        name: 'Rivers State',
        districts: ['Port Harcourt City (Old GRA / New GRA)', 'Obio-Akpor', 'Eleme', 'Other Rivers LGA'],
      },
      {
        id: 'OY',
        name: 'Oyo State',
        districts: ['Ibadan North (Bodija / Agodi GRA)', 'Ibadan South-West (Ring Road)', 'Oluyole', 'Other Oyo LGA'],
      },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    phonePrefix: '+971',
    phonePlaceholder: '050 123 4567',
    subdivisionLabel: 'Emirate',
    districtLabel: 'Master Community / District',
    postalLabel: 'Makani Number / PO Box',
    postalPlaceholder: 'e.g. 12345 67890 or PO Box 1234',
    logisticsHub: 'Jebel Ali Port & Pan-Emirates Low-Bed Transport',
    subdivisions: [
      {
        id: 'DXB',
        name: 'Dubai',
        districts: [
          'Downtown Dubai & Business Bay',
          'Palm Jumeirah & Dubai Marina',
          'Dubai Hills Estate',
          'Emirates Hills / The Meadows / The Lakes',
          'Jumeirah Golf Estates & Arabian Ranches',
          'Jumeirah Village Circle (JVC) / JVT',
          'Al Barari & Dubailand',
          'Other Dubai District',
        ],
      },
      {
        id: 'AUH',
        name: 'Abu Dhabi',
        districts: [
          'Yas Island & Saadiyat Island',
          'Al Reem Island & Al Maryah Island',
          'Khalifa City & Al Raha Beach',
          'Corniche & Downtown Abu Dhabi',
          'Al Ain City',
          'Other Abu Dhabi District',
        ],
      },
      {
        id: 'SHJ',
        name: 'Sharjah',
        districts: ['Al Majaz & Al Qasba', 'Al Zahia Master Community', 'Aljada Community', 'Other Sharjah District'],
      },
      {
        id: 'RAK',
        name: 'Ras Al Khaimah',
        districts: ['Al Marjan Island', 'Mina Al Arab', 'Al Hamra Village', 'Other RAK District'],
      },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    phonePrefix: '+49',
    phonePlaceholder: '0151 12345678',
    subdivisionLabel: 'Federal State (Bundesland)',
    districtLabel: 'District / County (Kreis / Stadt)',
    postalLabel: 'Postleitzahl (PLZ)',
    postalPlaceholder: 'e.g. 10115 or 80331',
    logisticsHub: 'EU Certified Heavy Transport & Euro-Crane Staging',
    subdivisions: [
      {
        id: 'BY',
        name: 'Bavaria (Bayern)',
        districts: ['München (Munich Stadt & Landkreis)', 'Nürnberg', 'Augsburg', 'Starnberg (Fünfseenland)', 'Garmisch-Partenkirchen', 'Other Bavarian Kreis'],
      },
      {
        id: 'BE',
        name: 'Berlin',
        districts: ['Mitte', 'Charlottenburg-Wilmersdorf', 'Pankow / Prenzlauer Berg', 'Friedrichshain-Kreuzberg', 'Steglitz-Zehlendorf (Wannsee)', 'Other Berlin Bezirk'],
      },
      {
        id: 'NW_DE',
        name: 'North Rhine-Westphalia (NRW)',
        districts: ['Köln (Cologne)', 'Düsseldorf', 'Dortmund & Ruhrgebiet', 'Bonn & Rhein-Sieg-Kreis', 'Münster', 'Aachen', 'Other NRW Kreis'],
      },
      {
        id: 'BW',
        name: 'Baden-Württemberg',
        districts: ['Stuttgart & Region', 'Karlsruhe', 'Heidelberg & Rhein-Neckar', 'Freiburg & Schwarzwald', 'Bodenseekreis (Lake Constance)', 'Other BW Kreis'],
      },
      {
        id: 'HE',
        name: 'Hesse (Hessen)',
        districts: ['Frankfurt am Main', 'Wiesbaden', 'Main-Taunus-Kreis', 'Darmstadt', 'Other Hessen Kreis'],
      },
    ],
  },
  {
    code: 'OTHER',
    name: 'International / Other Country',
    flag: '🌐',
    phonePrefix: '+',
    phonePlaceholder: '+1 000 000 0000',
    subdivisionLabel: 'State / Province / Region',
    districtLabel: 'City / District / Municipality',
    postalLabel: 'Postal / ZIP Code',
    postalPlaceholder: 'Enter postal / routing code',
    logisticsHub: 'International Ocean Freight & Specialized Overland Staging',
    subdivisions: [
      {
        id: 'GLOBAL_METRO',
        name: 'Capital / Primary Metropolitan Region',
        districts: ['Central Metro District', 'North Suburbs', 'East Logistics Corridor', 'South Coastal District', 'West Valley / Highland', 'Custom District / Area'],
      },
      {
        id: 'GLOBAL_PROVINCE',
        name: 'Provincial / Regional Area',
        districts: ['Regional Hub City', 'Secondary Municipal District', 'Rural / Agricultural Zone', 'Coastal / Island Area', 'Custom Area'],
      },
    ],
  },
];

export function getCountryByCode(code: string): CountryOption {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function getSubdivisions(countryCode: string): SubdivisionOption[] {
  const country = getCountryByCode(countryCode);
  return country.subdivisions || [];
}

export function getDistricts(countryCode: string, subdivisionId: string): string[] {
  const subdivisions = getSubdivisions(countryCode);
  const sub = subdivisions.find((s) => s.id === subdivisionId || s.name === subdivisionId);
  return sub?.districts || [];
}
