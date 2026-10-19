// The case files shown in the film reel.
// image: put a 16:9 picture in public/projects/ and write its file name here.
//        Leave it out and the site draws a matching title card for you.
// link:  leave it out if there is no public repo.
const base = import.meta.env.BASE_URL

export const projects = [
  {
    id: '01',
    title: 'AI-Powered Logistics Automation',
    status: 'Capstone, Adelaide University',
    tags: ['React.js', 'Node.js', 'MongoDB', 'OAuth 2.0'],
    summary:
      'An automated warehouse booking system for Fridge It Logistics, an Australian 3PL provider. It checks purchase orders, runs driver compliance checks and schedules deliveries, aiming to cut manual booking time by around 50%.',
    role: 'Project lead for a four-person team. Ran client workshops, the feasibility study and the business case.',
  },
  {
    id: '02',
    title: 'Real-Time Lane Detection',
    status: 'Python, Computer Vision',
    tags: ['Python', 'OpenCV', 'NumPy'],
    summary:
      'A lane detection pipeline built with Canny edge detection and Hough transforms. It isolates the road, finds lane lines and overlays the driving lane, and copes with changing light.',
    image: `${base}projects/lane-detection.jpg`,
    link: 'https://github.com/mo-taher/Lane-Detection-Using-Image-Processing',
  },
  {
    id: '03',
    title: 'Ecash Crypto Transactions',
    status: 'Blockchain, Web',
    tags: ['React', 'Solidity', 'Tailwind', 'MetaMask'],
    summary:
      'A smart contract app for sending and receiving ETH on Ethereum, with MetaMask as the wallet and a React and Tailwind front end.',
    link: 'https://github.com/mo-taher/Ecash_Crypto_Transaction_System',
  },
  {
    id: '04',
    title: 'Blockchain Certificate Sharing',
    status: 'Research, Healthcare',
    tags: ['Blockchain', 'Security', 'Access Control'],
    summary:
      'A blockchain design for tamper-proof certificate tracking and access control across healthcare providers, so records can be shared and audited safely.',
  },
  {
    id: '05',
    title: 'Online Mechanic Appointments',
    status: 'Full Stack, Databases',
    tags: ['PHP', 'MySQL', 'HTML/CSS'],
    summary:
      'A booking system for mechanic appointments with user login, booking management and an admin dashboard, built for a database systems course.',
    link: 'https://github.com/mo-taher/Online-Mechanic-Appointment-System',
  },
  {
    id: '06',
    title: 'Computer Network Design',
    status: 'Networking',
    tags: ['Cisco', 'Packet Tracer', 'VLANs'],
    summary:
      'A full network topology in Cisco Packet Tracer with routing, switching, subnetting and VLANs, designed and configured from scratch.',
    image: `${base}projects/network-design.jpg`,
    link: 'https://github.com/mo-taher/Computer-Network-Project',
  },
]
