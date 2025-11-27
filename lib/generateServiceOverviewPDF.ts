import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const navyBlue = [11, 25, 48];
const signalRed = [230, 57, 70];
const lightGray = [245, 245, 245];
const darkGray = [100, 100, 100];

const services = [
  {
    category: 'Strategy & Planning',
    services: [
      {
        title: 'Strategy & Direction',
        tagline: 'Clarity first. Engineering second.',
        description: 'Technical assessments, product roadmaps, and strategic planning before any code is written.',
        features: [
          'Digital + technical audit',
          'Product & feature strategy',
          'Workflow & system mapping',
          'Architecture recommendation',
          'Risk & opportunity analysis',
          'Roadmap planning (30–90 days)'
        ],
        pricing: [
          { tier: 'Strategy Sprint', price: '€450', duration: '3–5 days' },
          { tier: 'Full Technical Audit', price: '€750', duration: 'Comprehensive' },
          { tier: 'Roadmap Package', price: '€1,200', duration: 'Strategy + Architecture' }
        ]
      }
    ]
  },
  {
    category: 'Build & Deploy',
    services: [
      {
        title: 'Websites & Platforms',
        tagline: 'Fast. Scalable. Designed to last.',
        description: 'High-performance websites and web applications built with Next.js.',
        features: [
          'UX/UI design',
          'Custom development (Next.js + React)',
          'CMS integration',
          'Platform development',
          'Performance optimization',
          'SEO foundation',
          'Quality assurance + testing'
        ],
        pricing: [
          { tier: 'Landing Page', price: 'from €450', duration: '1–2 sections' },
          { tier: 'Business Website', price: '€1,500–€3,200', duration: 'Multi-page' },
          { tier: 'Advanced Platform', price: '€3,500–€7,500', duration: 'Portal / SaaS' }
        ]
      },
      {
        title: 'Mobile Apps',
        tagline: 'One codebase. Every device. Zero compromises.',
        description: 'Cross-platform iOS and Android apps with React Native.',
        features: [
          'App design (UI/UX)',
          'Cross-platform development (React Native)',
          'Secure authentication',
          'API integration',
          'Push notifications',
          'Performance + stability testing',
          'App Store / Play Store deployment'
        ],
        pricing: [
          { tier: 'MVP Mobile App', price: '€3,000–€6,500', duration: 'Core features' },
          { tier: 'Full Product App', price: '€7,500–€15,000', duration: 'Complete solution' },
          { tier: 'Enterprise App', price: 'Custom', duration: 'Custom scope' }
        ]
      },
      {
        title: 'Cloud & Security',
        tagline: 'Fast, secure, and effortless to scale.',
        description: 'Scalable cloud architecture and security infrastructure.',
        features: [
          'Cloud setup (AWS, Azure, Vercel)',
          'CI/CD pipelines',
          'Monitoring & alerting',
          'Zero-downtime deployments',
          'Access control & permissions',
          'Security hardening',
          'Backup & disaster recovery'
        ],
        pricing: [
          { tier: 'Cloud Setup Package', price: '€350', duration: 'Infrastructure setup' },
          { tier: 'Security Audit', price: '€650', duration: 'Comprehensive review' },
          { tier: 'Scaling Sprint', price: '€300', duration: 'Optimization' }
        ]
      }
    ]
  },
  {
    category: 'Scale & Optimize',
    services: [
      {
        title: 'Data, AI & Automation',
        tagline: 'Turn data into decisions. Turn decisions into automation.',
        description: 'Integrations, AI workflows, and intelligent automation.',
        features: [
          'API integrations',
          'Workflow automation',
          'AI-powered features',
          'Dashboard development',
          'Data modeling',
          'Analytics setup (GA4, custom dashboards)'
        ],
        pricing: [
          { tier: 'Automation Setup', price: 'from €250', duration: 'Basic automation' },
          { tier: 'Full Integration Package', price: '€650–€1,500', duration: 'Complete integration' },
          { tier: 'AI Feature Development', price: '€1,000–€3,500', duration: 'AI capabilities' }
        ]
      },
      {
        title: 'Growth & Marketing',
        tagline: "Performance isn't just technical — it's visible.",
        description: 'SEO, performance optimization, and conversion tracking.',
        features: [
          'On-page SEO',
          'Performance optimization',
          'Conversion tracking',
          'Analytics setup',
          'UX improvements',
          'A/B testing',
          'Content support'
        ],
        pricing: [
          { tier: 'SEO + Performance', price: '€300', duration: 'Package' },
          { tier: 'Conversion & Analytics', price: '€350', duration: 'Setup' },
          { tier: 'Growth Sprint', price: '€250–€600', duration: 'Monthly' }
        ]
      },
      {
        title: 'Ongoing Support',
        tagline: "We don't just build — we evolve with you.",
        description: 'Long-term maintenance and continuous improvement.',
        features: [
          'Bug fixes',
          'Feature enhancements',
          'Performance reviews',
          'Monitoring',
          'Priority support',
          'Infrastructure updates'
        ],
        pricing: [
          { tier: 'Basic Support', price: '€120/mo', duration: 'Monthly' },
          { tier: 'Professional Support', price: '€250/mo', duration: 'Monthly' },
          { tier: 'Priority Support', price: '€500/mo', duration: 'Monthly' }
        ]
      }
    ]
  }
];

export async function generateServiceOverviewPDF(): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = 210;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = marginTop;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('IE Global', marginLeft, currentY);
  doc.setFontSize(18);
  doc.text('Service Overview', marginLeft, currentY + 10);
  
  currentY += 25;

  // Introduction
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const introText = 'From strategy to scale. Seven capabilities that work together to build digital systems that are fast, reliable, and built to last.';
  doc.text(doc.splitTextToSize(introText, contentWidth), marginLeft, currentY);
  currentY += 15;

  // Services by Category
  services.forEach((category, catIndex) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = marginTop;
    }

    // Category Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.text(category.category.toUpperCase(), marginLeft, currentY);
    currentY += 8;

    category.services.forEach((service, svcIndex) => {
      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        currentY = marginTop;
      }

      // Service Title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.text(service.title, marginLeft, currentY);
      currentY += 7;

      // Tagline
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(service.tagline, marginLeft, currentY);
      currentY += 6;

      // Description
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const descLines = doc.splitTextToSize(service.description, contentWidth);
      doc.text(descLines, marginLeft, currentY);
      currentY += descLines.length * 5 + 3;

      // Features
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.text('What\'s Included:', marginLeft, currentY);
      currentY += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      service.features.forEach(feature => {
        doc.text(`• ${feature}`, marginLeft + 3, currentY);
        currentY += 4.5;
      });
      currentY += 2;

      // Pricing Table
      const pricingData = service.pricing.map(p => [p.tier, p.duration, p.price]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Package', 'Duration', 'Price']],
        body: pricingData,
        theme: 'grid',
        headStyles: {
          fillColor: signalRed as any,
          textColor: [255, 255, 255] as any,
          fontSize: 8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40, halign: 'right' },
        },
        margin: { left: marginLeft, right: marginRight },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    // Add spacing between categories
    if (catIndex < services.length - 1) {
      currentY += 5;
    }
  });

  // Footer
  const footerY = 280;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(0, footerY, pageWidth, 17, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('IE GLOBAL | ODER 20 Box 66193, 2491DC Den Haag, Netherlands', marginLeft, footerY + 6);
  doc.text('KvK: 97185515 | BTW: NL737599054B02', marginLeft, footerY + 11);
  doc.text('Contact: Cassian Drefke | +31 6 27 20 71 08 | cdrefke@ie-global.net', marginLeft, footerY + 16);

  return doc.output('blob');
}

