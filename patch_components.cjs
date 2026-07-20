const fs = require('fs');

// Patch PublicLayout.jsx
let layoutContent = fs.readFileSync('src/components/PublicLayout.jsx', 'utf8');
layoutContent = layoutContent.replace(/\{ name: 'Home', path: '\/' \}/g, "{ name: t('home'), path: '/' }");
layoutContent = layoutContent.replace(/\{ name: 'National Data', path: '\/analytics' \}/g, "{ name: t('national_data'), path: '/analytics' }");
layoutContent = layoutContent.replace(/>Command Login</g, ">{t('command_login')}<");
layoutContent = layoutContent.replace(/>Emergency SOS</g, ">{t('emergency_sos')}<");
layoutContent = layoutContent.replace(/>Switch to Hindi</g, ">{t('switch_hindi')}<");
layoutContent = layoutContent.replace(/>Switch to English</g, ">{t('switch_english')}<");
layoutContent = layoutContent.replace(/System Status: All Systems Operational/g, "{t('system_status')}");
layoutContent = layoutContent.replace(/Built for India\./g, "{t('built_for_india')}");

fs.writeFileSync('src/components/PublicLayout.jsx', layoutContent);
console.log('PublicLayout.jsx updated');

// Patch HeroHomepage.jsx
let heroContent = fs.readFileSync('src/components/HeroHomepage.jsx', 'utf8');

// Add useLanguage import if not exists
if (!heroContent.includes('useLanguage')) {
    heroContent = heroContent.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useLanguage } from '../LanguageContext';");
    heroContent = heroContent.replace("const HeroHomepage = () => {", "const HeroHomepage = () => {\n  const { t } = useLanguage();");
}

heroContent = heroContent.replace(/>Official Public Portal</g, ">{t('hero_badge')}<");
heroContent = heroContent.replace(/India's AI-Powered/g, "{t('hero_title1')}");
heroContent = heroContent.replace(/Health Intelligence/g, "{t('hero_title2')}");
heroContent = heroContent.replace(/Bridging the gap between data and action\. ArogyaNet AI unifies national datasets to provide real-time insights, predictive resource allocation, and citizen-first transparency\./g, "{t('hero_desc')}");
heroContent = heroContent.replace(/>Explore National Data</g, ">{t('explore_data')}<");

heroContent = heroContent.replace(/>Why ArogyaNet AI\?</g, ">{t('why_title')}<");
heroContent = heroContent.replace(/For decades, healthcare data has been siloed across thousands of districts\. ArogyaNet AI acts as a central nervous system, bringing total visibility to infrastructure, workforce, and critical resources\./g, "{t('why_desc')}");

heroContent = heroContent.replace(/"Unified Datasets"/g, "t('unified_data')");
heroContent = heroContent.replace(/"Aggregating Open Government Data \(OGD\) into a single, high-performance PostgreSQL intelligence layer\."/g, "t('unified_data_desc')");
heroContent = heroContent.replace(/"Predictive Analytics"/g, "t('pred_analytics')");
heroContent = heroContent.replace(/"Forecasting medication shortages and infrastructure bottlenecks using advanced AI models\."/g, "t('pred_analytics_desc')");
heroContent = heroContent.replace(/"Citizen Transparency"/g, "t('cit_transparency')");
heroContent = heroContent.replace(/"Empowering everyday citizens to locate nearby facilities, blood banks, and specialized doctors\."/g, "t('cit_transparency_desc')");

heroContent = heroContent.replace(/>Dual-Targeted Intelligence</g, ">{t('dual_intel')}<");
heroContent = heroContent.replace(/>For Citizens</g, ">{t('for_citizens')}<");
heroContent = heroContent.replace(/"Locate the nearest operational PHCs and CHCs"/g, "t('cit_point1')");
heroContent = heroContent.replace(/"Check real-time availability of licensed blood banks"/g, "t('cit_point2')");
heroContent = heroContent.replace(/"View specialized doctor availability in your state"/g, "t('cit_point3')");
heroContent = heroContent.replace(/"Access disease advisories and emergency SOS"/g, "t('cit_point4')");
heroContent = heroContent.replace(/View Public Dashboard/g, "{t('view_dashboard')}");

heroContent = heroContent.replace(/>For Government</g, ">{t('for_govt')}<");
heroContent = heroContent.replace(/"Analyze state-wise historical growth trends"/g, "t('gov_point1')");
heroContent = heroContent.replace(/"Monitor real-time inventory and logistics"/g, "t('gov_point2')");
heroContent = heroContent.replace(/"Track disease outbreaks via the Surveillance Module"/g, "t('gov_point3')");
heroContent = heroContent.replace(/"AI-driven staff attendance and footprint predictions"/g, "t('gov_point4')");
heroContent = heroContent.replace(/Access Command Center/g, "{t('access_command')}");

heroContent = heroContent.replace(/>National Expansion Roadmap</g, ">{t('future_roadmap')}<");
heroContent = heroContent.replace(/We are actively integrating massive central datasets to expand our intelligence capabilities\./g, "{t('future_roadmap_desc')}");
heroContent = heroContent.replace(/>Coming Phase 2</g, ">{t('coming_phase2')}<");
heroContent = heroContent.replace(/"AQI & Heatwave Alerts"/g, "t('aqi_heatwave')");
heroContent = heroContent.replace(/"Maternal & Child Health"/g, "t('maternal_child')");
heroContent = heroContent.replace(/"Vaccination Intelligence"/g, "t('vaccination_intel')");
heroContent = heroContent.replace(/"Census & Population"/g, "t('census_pop')");

fs.writeFileSync('src/components/HeroHomepage.jsx', heroContent);
console.log('HeroHomepage.jsx updated');
