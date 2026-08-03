// Multi-locale i18n support matching backend (en, ta, ml, te, mr, hi).

export type Locale = 'en' | 'ta' | 'ml' | 'te' | 'mr' | 'hi';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    app_title: "Fleet Management",
    super_admin_dashboard: "Super Admin Platform Dashboard",
    owner_dashboard: "Fleet Owner Analytics",
    total_revenue: "Total Fleet Revenue",
    completed_jobs: "Completed Jobs",
    active_vehicles: "Active Vehicles",
    active_drivers: "Active Drivers",
    utilization_rate: "Vehicle Utilization Rate",
    average_rating: "Average Fleet Rating",
    mrr: "Monthly Recurring Revenue (MRR)",
    total_owners: "Registered Owners",
    active_subscriptions: "Active Subscriptions",
    export_csv: "Export Bookings CSV",
    switch_tenant: "Switch Tenant Schema",
    login: "Log In",
    logout: "Log Out",
    status_success: "Success",
    status_error: "Error"
  },
  hi: {
    app_title: "फ़्लीट मैनेजमेंट (Fleet Management)",
    super_admin_dashboard: "सुपर व्यवस्थापक प्लेटफ़ॉर्म डैशबोर्ड",
    owner_dashboard: "बेड़ा मालिक विश्लेषण",
    total_revenue: "कुल बेड़ा राजस्व",
    completed_jobs: "पूरे किए गए कार्य",
    active_vehicles: "सक्रिय वाहन",
    active_drivers: "सक्रिय चालक",
    utilization_rate: "वाहन उपयोग दर",
    average_rating: "औसत रेटिंग",
    mrr: "मासिक आवर्ती राजस्व (MRR)",
    total_owners: "पंजीकृत मालिक",
    active_subscriptions: "सक्रिय सदस्यताएँ",
    export_csv: "सीएसवी निर्यात करें",
    switch_tenant: "टेनेंट बदलें",
    login: "लॉग इन करें",
    logout: "लॉग आउट",
    status_success: "सफलता",
    status_error: "त्रुटि"
  },
  ta: {
    app_title: "ஃப்ளீட் மேனேஜ்மென்ட் (Fleet Management)",
    super_admin_dashboard: "சூப்பர் நிர்வாகி தள டாஷ்போர்டு",
    owner_dashboard: "வாகன உரிமையாளர் பகுப்பாய்வு",
    total_revenue: "மொத்த வருவாய்",
    completed_jobs: "நிறைவடைந்த பணிகள்",
    active_vehicles: "செயலில் உள்ள வாகனங்கள்",
    active_drivers: "செயலில் உள்ள ஓட்டுநர்கள்",
    utilization_rate: "வாகன பயன்பாட்டு விகிதம்",
    average_rating: "சராசரி மதிப்பீடு",
    mrr: "மாதாந்திர வருவாய் (MRR)",
    total_owners: "பதிவுசெய்த உரிமையாளர்கள்",
    active_subscriptions: "செயலில் உள்ள சந்தாக்கள்",
    export_csv: "CSV ஏற்றுமதி",
    switch_tenant: "டெனண்ட் மாற்றவும்",
    login: "உள்நுழை",
    logout: "வெளியேறு",
    status_success: "வெற்றி",
    status_error: "பிழை"
  },
  ml: {
    app_title: "ഫ്ലീറ്റ് മാനേജ്‌മെന്റ് (Fleet Management)",
    super_admin_dashboard: "സൂപ്പർ അഡ്മിൻ ഡാഷ്‌ബോർഡ്",
    owner_dashboard: "ഫ്ലീറ്റ് ഉടമ വിശകലനം",
    total_revenue: "ആകെ വരുമാനം",
    completed_jobs: "പൂർത്തിയായ ജോലികൾ",
    active_vehicles: "സജീവ വാഹനങ്ങൾ",
    active_drivers: "സജീവ ഡ്രൈവർമാർ",
    utilization_rate: "വാഹന ഉപയോഗ നിരക്ക്",
    average_rating: "ശരാശരി റേറ്റിംഗ്",
    mrr: "പ്രതിമാസ വരുമാനം (MRR)",
    total_owners: "രജിസ്റ്റർ ചെയ്ത ഉടമകൾ",
    active_subscriptions: "സജീവ സബ്‌സ്‌ക്രിപ്‌ഷനുകൾ",
    export_csv: "CSV എക്‌സ്‌പോർട്ട്",
    switch_tenant: "ടെനന്റ് മാറ്റുക",
    login: "ലോഗിൻ",
    logout: "ലോഗ് ഔട്ട്",
    status_success: "വിജയം",
    status_error: "പിശക്"
  },
  te: {
    app_title: "ఫ్లీట్ మేనేజ్‌మెంట్ (Fleet Management)",
    super_admin_dashboard: "సూపర్ అడ్మిన్ డాష్‌బోర్డ్",
    owner_dashboard: "వాహన యజమాని విశ్లేషణ",
    total_revenue: "మొత్తం రాబడి",
    completed_jobs: "పూర్తయిన పనులు",
    active_vehicles: "యాక్టివ్ వాహనాలు",
    active_drivers: "యాక్టివ్ డ్రైవర్లు",
    utilization_rate: "వాహన వినియోగ రేటు",
    average_rating: "సగటు రేటింగ్",
    mrr: "నెలవారీ పునరావృత రాబడి (MRR)",
    total_owners: "నమోదిత యజమానులు",
    active_subscriptions: "యాక్టివ్ సబ్‌స్క్రిప్షన్‌లు",
    export_csv: "CSV ఎగుమతి",
    switch_tenant: "టెనెంట్ మార్చండి",
    login: "లాగిన్",
    logout: "లాగ్ అవుట్",
    status_success: "విజయం",
    status_error: "లోపం"
  },
  mr: {
    app_title: "फ्लिट मॅनेजमेंट (Fleet Management)",
    super_admin_dashboard: "सुपर ॲडमिन प्लॅटफॉर्म डॅशबोर्ड",
    owner_dashboard: "ताफा मालक विश्लेषण",
    total_revenue: "एकूण महसूल",
    completed_jobs: "पूर्ण झालेली कामे",
    active_vehicles: "सक्रिय वाहने",
    active_drivers: "सक्रिय चालक",
    utilization_rate: "वाहन वापर दर",
    average_rating: "सरासरी रेटिंग",
    mrr: "मासिक आवर्ती महसूल (MRR)",
    total_owners: "नोंदणीकृत मालक",
    active_subscriptions: "सक्रिय सदस्यत्वे",
    export_csv: "CSV निर्यात करा",
    switch_tenant: "टेनंट बदला",
    login: "लॉग इन करा",
    logout: "लॉग आउट",
    status_success: "यश",
    status_error: "त्रुटी"
  }
};

let currentLocale: Locale = 'en';

export const setLocale = (loc: Locale) => {
  currentLocale = loc;
};

export const getLocale = (): Locale => currentLocale;

export const t = (key: string): string => {
  return translations[currentLocale]?.[key] || translations['en']?.[key] || key;
};
