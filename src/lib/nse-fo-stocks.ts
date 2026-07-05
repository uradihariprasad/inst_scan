// NSE F&O stocks - instrument keys for Upstox API
// Format: NSE_EQ|ISIN
export interface FnOStock {
  symbol: string;
  name: string;
  instrumentKey: string;
  sector: string;
  lotSize: number;
}

export const NSE_FO_STOCKS: FnOStock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", instrumentKey: "NSE_EQ|INE002A01018", sector: "Energy", lotSize: 250 },
  { symbol: "TCS", name: "Tata Consultancy Services", instrumentKey: "NSE_EQ|INE467B01029", sector: "IT", lotSize: 175 },
  { symbol: "HDFCBANK", name: "HDFC Bank", instrumentKey: "NSE_EQ|INE040A01034", sector: "Banking", lotSize: 550 },
  { symbol: "INFY", name: "Infosys", instrumentKey: "NSE_EQ|INE009A01021", sector: "IT", lotSize: 300 },
  { symbol: "ICICIBANK", name: "ICICI Bank", instrumentKey: "NSE_EQ|INE090A01021", sector: "Banking", lotSize: 700 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", instrumentKey: "NSE_EQ|INE030A01027", sector: "FMCG", lotSize: 300 },
  { symbol: "SBIN", name: "State Bank of India", instrumentKey: "NSE_EQ|INE062A01020", sector: "Banking", lotSize: 750 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", instrumentKey: "NSE_EQ|INE397D01024", sector: "Telecom", lotSize: 475 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", instrumentKey: "NSE_EQ|INE237A01028", sector: "Banking", lotSize: 400 },
  { symbol: "ITC", name: "ITC Limited", instrumentKey: "NSE_EQ|INE154A01025", sector: "FMCG", lotSize: 1600 },
  { symbol: "LT", name: "Larsen & Toubro", instrumentKey: "NSE_EQ|INE018A01030", sector: "Infrastructure", lotSize: 150 },
  { symbol: "AXISBANK", name: "Axis Bank", instrumentKey: "NSE_EQ|INE238A01034", sector: "Banking", lotSize: 625 },
  { symbol: "WIPRO", name: "Wipro", instrumentKey: "NSE_EQ|INE075A01022", sector: "IT", lotSize: 1500 },
  { symbol: "ADANIENT", name: "Adani Enterprises", instrumentKey: "NSE_EQ|INE423A01024", sector: "Conglomerate", lotSize: 250 },
  { symbol: "TATAMOTORS", name: "Tata Motors", instrumentKey: "NSE_EQ|INE155A01022", sector: "Auto", lotSize: 575 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", instrumentKey: "NSE_EQ|INE044A01036", sector: "Pharma", lotSize: 350 },
  { symbol: "MARUTI", name: "Maruti Suzuki", instrumentKey: "NSE_EQ|INE585B01010", sector: "Auto", lotSize: 50 },
  { symbol: "TITAN", name: "Titan Company", instrumentKey: "NSE_EQ|INE280A01028", sector: "Consumer", lotSize: 175 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", instrumentKey: "NSE_EQ|INE296A01024", sector: "NBFC", lotSize: 125 },
  { symbol: "ASIANPAINT", name: "Asian Paints", instrumentKey: "NSE_EQ|INE021A01026", sector: "Consumer", lotSize: 300 },
  { symbol: "HCLTECH", name: "HCL Technologies", instrumentKey: "NSE_EQ|INE860A01027", sector: "IT", lotSize: 350 },
  { symbol: "TATASTEEL", name: "Tata Steel", instrumentKey: "NSE_EQ|INE081A01020", sector: "Metals", lotSize: 1717 },
  { symbol: "NTPC", name: "NTPC Limited", instrumentKey: "NSE_EQ|INE733E01010", sector: "Power", lotSize: 1575 },
  { symbol: "POWERGRID", name: "Power Grid Corp", instrumentKey: "NSE_EQ|INE752E01010", sector: "Power", lotSize: 2700 },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", instrumentKey: "NSE_EQ|INE481G01011", sector: "Cement", lotSize: 50 },
  { symbol: "TECHM", name: "Tech Mahindra", instrumentKey: "NSE_EQ|INE669C01036", sector: "IT", lotSize: 400 },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", instrumentKey: "NSE_EQ|INE213A01029", sector: "Energy", lotSize: 1925 },
  { symbol: "JSWSTEEL", name: "JSW Steel", instrumentKey: "NSE_EQ|INE019A01038", sector: "Metals", lotSize: 450 },
  { symbol: "M_M", name: "Mahindra & Mahindra", instrumentKey: "NSE_EQ|INE101A01026", sector: "Auto", lotSize: 175 },
  { symbol: "COALINDIA", name: "Coal India", instrumentKey: "NSE_EQ|INE522F01014", sector: "Mining", lotSize: 1200 },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", instrumentKey: "NSE_EQ|INE918I01026", sector: "NBFC", lotSize: 500 },
  { symbol: "DRREDDY", name: "Dr. Reddy's Lab", instrumentKey: "NSE_EQ|INE089A01023", sector: "Pharma", lotSize: 125 },
  { symbol: "CIPLA", name: "Cipla", instrumentKey: "NSE_EQ|INE059A01026", sector: "Pharma", lotSize: 650 },
  { symbol: "EICHERMOT", name: "Eicher Motors", instrumentKey: "NSE_EQ|INE066A01021", sector: "Auto", lotSize: 175 },
  { symbol: "BPCL", name: "Bharat Petroleum", instrumentKey: "NSE_EQ|INE029A01011", sector: "Energy", lotSize: 1800 },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", instrumentKey: "NSE_EQ|INE361B01024", sector: "Pharma", lotSize: 100 },
  { symbol: "GRASIM", name: "Grasim Industries", instrumentKey: "NSE_EQ|INE047A01021", sector: "Cement", lotSize: 250 },
  { symbol: "BRITANNIA", name: "Britannia Industries", instrumentKey: "NSE_EQ|INE216A01030", sector: "FMCG", lotSize: 100 },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", instrumentKey: "NSE_EQ|INE158A01026", sector: "Auto", lotSize: 150 },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", instrumentKey: "NSE_EQ|INE095A01012", sector: "Banking", lotSize: 500 },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", instrumentKey: "NSE_EQ|INE437A01024", sector: "Healthcare", lotSize: 125 },
  { symbol: "HINDALCO", name: "Hindalco Industries", instrumentKey: "NSE_EQ|INE038A01020", sector: "Metals", lotSize: 775 },
  { symbol: "SBILIFE", name: "SBI Life Insurance", instrumentKey: "NSE_EQ|INE123W01016", sector: "Insurance", lotSize: 375 },
  { symbol: "TATACONSUM", name: "Tata Consumer Products", instrumentKey: "NSE_EQ|INE192A01025", sector: "FMCG", lotSize: 450 },
  { symbol: "PIDILITIND", name: "Pidilite Industries", instrumentKey: "NSE_EQ|INE318A01026", sector: "Chemicals", lotSize: 250 },
  { symbol: "DABUR", name: "Dabur India", instrumentKey: "NSE_EQ|INE016A01026", sector: "FMCG", lotSize: 1250 },
  { symbol: "GODREJCP", name: "Godrej Consumer Products", instrumentKey: "NSE_EQ|INE102D01028", sector: "FMCG", lotSize: 500 },
  { symbol: "BANKBARODA", name: "Bank of Baroda", instrumentKey: "NSE_EQ|INE028A01039", sector: "Banking", lotSize: 2925 },
  { symbol: "DLF", name: "DLF Limited", instrumentKey: "NSE_EQ|INE271C01023", sector: "Real Estate", lotSize: 825 },
  { symbol: "TRENT", name: "Trent Limited", instrumentKey: "NSE_EQ|INE849A01020", sector: "Retail", lotSize: 75 },
];

// Sector groupings
export const SECTORS = [
  "Banking", "IT", "Energy", "FMCG", "Auto", "Pharma",
  "Metals", "Infrastructure", "Power", "Cement", "NBFC",
  "Telecom", "Consumer", "Mining", "Insurance", "Chemicals",
  "Healthcare", "Real Estate", "Retail", "Conglomerate"
];

// Index instrument keys
export const INDICES = {
  NIFTY50: "NSE_INDEX|Nifty 50",
  BANKNIFTY: "NSE_INDEX|Nifty Bank",
  NIFTYIT: "NSE_INDEX|Nifty IT",
};
