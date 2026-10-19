// Edit this file to change your name, links and the short text on the site.
const base = import.meta.env.BASE_URL

export const profile = {
  name: 'Mohammed Taher Abdullah',
  firstLine: 'MOHAMMED TAHER',
  secondLine: 'ABDULLAH',
  hook: 'Every system has a story. I find it.',
  roles: ['Business Analyst', 'Systems Analyst', 'Operations'],
  location: 'Adelaide, South Australia',
  email: 'moh.taher.mail@gmail.com',
  phone: '+61 416 753 180',
  phoneHref: 'tel:+61416753180',
  linkedin: 'https://www.linkedin.com/in/m-taher-abdullah',
  github: 'https://github.com/mo-taher',
  resume: `${base}Mohammed_Taher_Abdullah_Resume.pdf`,
}

export const about = {
  lead:
    'I work where business problems meet technology. Most of my job is working out how things really happen, where they break, and what a system needs to do to fix them.',
  body: [
    'I started in FinTech, running a Dynamics 365 support queue and testing 62 white-label products before they reached customers. Then I moved into operations at an EdTech company, where I built Agile delivery from nothing and kept an eye on how our marketing turned into sales.',
    'In 2026 I worked as an IT and business systems analyst for Fridge It Logistics SA, mapping booking, transport and telematics workflows and testing the platform that came out of it. I am finishing a Master of IT (Enterprise Management) at Adelaide University.',
  ],
  facts: [
    { label: 'Based in', value: 'Adelaide, SA' },
    { label: 'Languages', value: 'English, Bangla, Hindi, Urdu' },
    { label: 'Studying', value: 'Master of IT, Adelaide University' },
    { label: 'Drawn to', value: 'Digital transformation, data, and systems people actually use' },
  ],
}
