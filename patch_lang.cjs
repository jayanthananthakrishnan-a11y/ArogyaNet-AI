const fs = require('fs');

let content = fs.readFileSync('src/LanguageContext.jsx', 'utf8');

const enAdditions = `
    // Public Portal New Strings
    home: "Home",
    national_data: "National Data",
    command_login: "Command Login",
    emergency_sos: "Emergency SOS",
    switch_hindi: "Switch to Hindi",
    switch_english: "Switch to English",
    system_status: "System Status: All Systems Operational",
    built_for_india: "Built for India.",
    
    hero_badge: "Official Public Portal",
    hero_title1: "India's AI-Powered",
    hero_title2: "Health Intelligence",
    hero_desc: "Bridging the gap between data and action. ArogyaNet AI unifies national datasets to provide real-time insights, predictive resource allocation, and citizen-first transparency.",
    explore_data: "Explore National Data",
    
    why_title: "Why ArogyaNet AI?",
    why_desc: "For decades, healthcare data has been siloed across thousands of districts. ArogyaNet AI acts as a central nervous system, bringing total visibility to infrastructure, workforce, and critical resources.",
    unified_data: "Unified Datasets",
    unified_data_desc: "Aggregating Open Government Data (OGD) into a single, high-performance PostgreSQL intelligence layer.",
    pred_analytics: "Predictive Analytics",
    pred_analytics_desc: "Forecasting medication shortages and infrastructure bottlenecks using advanced AI models.",
    cit_transparency: "Citizen Transparency",
    cit_transparency_desc: "Empowering everyday citizens to locate nearby facilities, blood banks, and specialized doctors.",
    
    dual_intel: "Dual-Targeted Intelligence",
    for_citizens: "For Citizens",
    cit_point1: "Locate the nearest operational PHCs and CHCs",
    cit_point2: "Check real-time availability of licensed blood banks",
    cit_point3: "View specialized doctor availability in your state",
    cit_point4: "Access disease advisories and emergency SOS",
    view_dashboard: "View Public Dashboard",
    
    for_govt: "For Government",
    gov_point1: "Analyze state-wise historical growth trends",
    gov_point2: "Monitor real-time inventory and logistics",
    gov_point3: "Track disease outbreaks via the Surveillance Module",
    gov_point4: "AI-driven staff attendance and footprint predictions",
    access_command: "Access Command Center",
    
    future_roadmap: "National Expansion Roadmap",
    future_roadmap_desc: "We are actively integrating massive central datasets to expand our intelligence capabilities.",
    coming_phase2: "Coming Phase 2",
    aqi_heatwave: "AQI & Heatwave Alerts",
    maternal_child: "Maternal & Child Health",
    vaccination_intel: "Vaccination Intelligence",
    census_pop: "Census & Population",
`;

const hiAdditions = `
    // Public Portal New Strings
    home: "होम",
    national_data: "राष्ट्रीय डेटा",
    command_login: "कमांड लॉगिन",
    emergency_sos: "आपातकालीन SOS",
    switch_hindi: "हिंदी में बदलें",
    switch_english: "अंग्रेजी में बदलें",
    system_status: "सिस्टम स्थिति: सभी सिस्टम चालू हैं",
    built_for_india: "भारत के लिए निर्मित।",
    
    hero_badge: "आधिकारिक सार्वजनिक पोर्टल",
    hero_title1: "भारत का एआई-संचालित",
    hero_title2: "स्वास्थ्य खुफिया",
    hero_desc: "डेटा और कार्रवाई के बीच की खाई को पाटना। आरोग्यनेट एआई रीयल-टाइम अंतर्दृष्टि, भविष्य कहनेवाला संसाधन आवंटन और नागरिक-प्रथम पारदर्शिता प्रदान करने के लिए राष्ट्रीय डेटासेट को एकीकृत करता है।",
    explore_data: "राष्ट्रीय डेटा देखें",
    
    why_title: "आरोग्यनेट एआई क्यों?",
    why_desc: "दशकों से, स्वास्थ्य डेटा हजारों जिलों में बिखरा हुआ है। आरोग्यनेट एआई एक केंद्रीय तंत्रिका तंत्र के रूप में कार्य करता है, जो बुनियादी ढांचे, कार्यबल और महत्वपूर्ण संसाधनों को पूर्ण दृश्यता प्रदान करता है।",
    unified_data: "एकीकृत डेटासेट",
    unified_data_desc: "ओपन गवर्नमेंट डेटा (ओजीडी) को एकल, उच्च-प्रदर्शन पोस्टग्रेएसक्यूएल इंटेलिजेंस लेयर में एकत्रित करना।",
    pred_analytics: "भविष्य कहनेवाला विश्लेषिकी",
    pred_analytics_desc: "उन्नत एआई मॉडल का उपयोग करके दवा की कमी और बुनियादी ढांचे की बाधाओं का पूर्वानुमान लगाना।",
    cit_transparency: "नागरिक पारदर्शिता",
    cit_transparency_desc: "आम नागरिकों को आस-पास की सुविधाओं, ब्लड बैंक और विशेषज्ञ डॉक्टरों का पता लगाने के लिए सशक्त बनाना।",
    
    dual_intel: "दोहरी-लक्षित खुफिया",
    for_citizens: "नागरिकों के लिए",
    cit_point1: "निकटतम चालू पीएचसी और सीएचसी का पता लगाएं",
    cit_point2: "लाइसेंस प्राप्त ब्लड बैंकों की रीयल-टाइम उपलब्धता की जांच करें",
    cit_point3: "अपने राज्य में विशेषज्ञ डॉक्टर की उपलब्धता देखें",
    cit_point4: "रोग सलाह और आपातकालीन एसओएस तक पहुंचें",
    view_dashboard: "सार्वजनिक डैशबोर्ड देखें",
    
    for_govt: "सरकार के लिए",
    gov_point1: "राज्य-वार ऐतिहासिक विकास प्रवृत्तियों का विश्लेषण करें",
    gov_point2: "रीयल-टाइम इन्वेंट्री और लॉजिस्टिक्स की निगरानी करें",
    gov_point3: "निगरानी मॉड्यूल के माध्यम से बीमारी के प्रकोप को ट्रैक करें",
    gov_point4: "एआई-संचालित कर्मचारियों की उपस्थिति और फुटप्रिंट की भविष्यवाणी",
    access_command: "कमांड सेंटर तक पहुंचें",
    
    future_roadmap: "राष्ट्रीय विस्तार रोडमैप",
    future_roadmap_desc: "हम अपनी खुफिया क्षमताओं का विस्तार करने के लिए बड़े पैमाने पर केंद्रीय डेटासेट को सक्रिय रूप से एकीकृत कर रहे हैं।",
    coming_phase2: "चरण 2 आ रहा है",
    aqi_heatwave: "एक्यूआई और हीटवेव अलर्ट",
    maternal_child: "मातृ एवं शिशु स्वास्थ्य",
    vaccination_intel: "टीकाकरण खुफिया",
    census_pop: "जनगणना और जनसंख्या",
`;

content = content.replace('awaiting_selection: "Awaiting selection. Click any state on the map."', 'awaiting_selection: "Awaiting selection. Click any state on the map.",' + enAdditions);
content = content.replace('awaiting_selection: "चयन की प्रतीक्षा है। मानचित्र पर किसी भी राज्य पर क्लिक करें।"', 'awaiting_selection: "चयन की प्रतीक्षा है। मानचित्र पर किसी भी राज्य पर क्लिक करें।",' + hiAdditions);

fs.writeFileSync('src/LanguageContext.jsx', content);
console.log('LanguageContext.jsx updated');
