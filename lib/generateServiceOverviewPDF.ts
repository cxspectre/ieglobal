import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const navyBlue = [11, 25, 48];
const signalRed = [230, 57, 70];
const lightGray = [245, 245, 245];
const darkGray = [100, 100, 100];
const footerY = 275; // Reserve space for footer

const logoDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAHhlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABgAAAAAQAAAGAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAZCgAwAEAAAAAQAAAZAAAAAAx+O3PAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAWRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD53d3cuaW5rc2NhcGUub3JnPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgqyyWIhAAAiy0lEQVR4Ae3dT6h8S34Q8O6+9715vwQ0YUZNnIgDEpAE3GTALAJusgpKEDdZhOBGA/5Fg6uEkL27oIsJAUHIKhqEQEAICGIEF5OFrgwmLpLMkKCGGcd57/fndltV55zqOn/63r7953Sdez/Ne7er6tSf7/lUn6ruvv3ru1q5ESBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACB+QT+P+HYJvHcaeqVAAAAAElFTkSuQmCC';

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

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (currentY + requiredSpace > footerY) {
      doc.addPage();
      currentY = marginTop;
      return true;
    }
    return false;
  };

  // Header with colored background
  const headerHeight = 35;
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Logo
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('IE', marginLeft, currentY + 8);
  doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
  doc.text('Global', marginLeft + 15, currentY + 8);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Service Overview', marginLeft, currentY + 18);
  
  // Decorative line
  doc.setDrawColor(signalRed[0], signalRed[1], signalRed[2]);
  doc.setLineWidth(2);
  doc.line(marginLeft, currentY + 22, pageWidth - marginRight, currentY + 22);
  
  currentY = headerHeight + 15;

  // Introduction box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  const introText = 'From strategy to scale. Seven capabilities that work together to build digital systems that are fast, reliable, and built to last.';
  const introLines = doc.splitTextToSize(introText, contentWidth - 10);
  const introBoxHeight = introLines.length * 5 + 8;
  
  checkPageBreak(introBoxHeight + 10);
  doc.roundedRect(marginLeft, currentY, contentWidth, introBoxHeight, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(introLines, marginLeft + 5, currentY + 5);
  currentY += introBoxHeight + 15;

  // Services Overview - Visual Grid
  checkPageBreak(50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('Our Services at a Glance', marginLeft, currentY);
  currentY += 10;

  // Create visual service boxes
  const boxWidth = (contentWidth - 10) / 3;
  const boxHeight = 28;
  let boxX = marginLeft;
  let boxY = currentY;
  let serviceCount = 0;
  let maxBoxY = boxY;

  services.forEach(category => {
    category.services.forEach(service => {
      if (serviceCount > 0 && serviceCount % 3 === 0) {
        boxX = marginLeft;
        boxY += boxHeight + 5;
        maxBoxY = Math.max(maxBoxY, boxY);
      }
      
      // Service box with colored border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(boxX, boxY, boxWidth - 2, boxHeight, 2, 2, 'FD');
      
      // Colored accent bar
      doc.setFillColor(signalRed[0], signalRed[1], signalRed[2]);
      doc.rect(boxX, boxY, boxWidth - 2, 3, 'F');
      
      // Service title
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      const titleLines = doc.splitTextToSize(service.title, boxWidth - 6);
      doc.text(titleLines, boxX + 3, boxY + 8);
      
      // Tagline
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      const taglineLines = doc.splitTextToSize(service.tagline, boxWidth - 6);
      doc.text(taglineLines, boxX + 3, boxY + 16);
      
      boxX += boxWidth;
      serviceCount++;
    });
  });

  currentY = maxBoxY + boxHeight + 15;
  checkPageBreak(20);

  // Decorative separator
  doc.setFillColor(signalRed[0], signalRed[1], signalRed[2]);
  doc.rect(marginLeft, currentY, contentWidth, 1, 'F');
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(marginLeft, currentY + 1, contentWidth, 0.5, 'F');
  currentY += 10;

  // Detailed Services Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('Detailed Service Information', marginLeft, currentY);
  currentY += 12;

  // Services by Category
  services.forEach((category, catIndex) => {
    checkPageBreak(30);

    // Category Header with colored background
    const categoryHeaderHeight = 8;
    doc.setFillColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.roundedRect(marginLeft, currentY, contentWidth, categoryHeaderHeight, 2, 2, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category.toUpperCase(), marginLeft + 5, currentY + 6);
    
    // Decorative accent line
    doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, currentY + categoryHeaderHeight, pageWidth - marginRight, currentY + categoryHeaderHeight);
    
    currentY += categoryHeaderHeight + 10;

    category.services.forEach((service, svcIndex) => {
      // Estimate space needed for service card
      const estimatedSpace = 80; // Rough estimate
      checkPageBreak(estimatedSpace);

      // Service card start position
      const serviceStartY = currentY;
      
      // Left accent bar (will be drawn after we know the height)
      const accentBarX = marginLeft;
      const accentBarY = currentY;
      
      // Service Title with background
      doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      const titleBarHeight = 7;
      doc.roundedRect(marginLeft + 6, currentY, contentWidth - 6, titleBarHeight, 1, 1, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(service.title, marginLeft + 8, currentY + 5);
      currentY += titleBarHeight + 5;

      // Tagline
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(signalRed[0], signalRed[1], signalRed[2]);
      doc.text(service.tagline, marginLeft + 6, currentY);
      currentY += 6;

      // Description box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      const descLines = doc.splitTextToSize(service.description, contentWidth - 12);
      const descBoxHeight = descLines.length * 4.5 + 4;
      doc.roundedRect(marginLeft + 6, currentY, contentWidth - 6, descBoxHeight, 2, 2, 'F');
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(descLines, marginLeft + 8, currentY + 3);
      currentY += descBoxHeight + 5;

      // Features section with visual separator
      doc.setDrawColor(signalRed[0], signalRed[1], signalRed[2]);
      doc.setLineWidth(0.5);
      doc.line(marginLeft + 6, currentY, pageWidth - marginRight, currentY);
      currentY += 5;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.text('What\'s Included:', marginLeft + 6, currentY);
      currentY += 6;

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      service.features.forEach((feature) => {
        checkPageBreak(5);
        // Checkbox-style bullet with color
        doc.setFillColor(signalRed[0], signalRed[1], signalRed[2]);
        doc.circle(marginLeft + 8, currentY - 1.5, 1.5, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(feature, marginLeft + 12, currentY);
        currentY += 4.5;
      });
      currentY += 4;

      // Pricing Table
      checkPageBreak(25);
      const pricingData = service.pricing.map(p => [p.tier, p.duration, p.price]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Package', 'Duration', 'Price']],
        body: pricingData,
        theme: 'grid',
        headStyles: {
          fillColor: navyBlue as any,
          textColor: [255, 255, 255] as any,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [0, 0, 0],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250] as any,
        },
        columnStyles: {
          0: { cellWidth: 65, fontStyle: 'bold' },
          1: { cellWidth: 45 },
          2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: signalRed as any },
        },
        margin: { left: marginLeft + 6, right: marginRight },
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.3,
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
      
      // Draw left accent bar now that we know the height
      const cardHeight = currentY - accentBarY;
      doc.setFillColor(signalRed[0], signalRed[1], signalRed[2]);
      doc.rect(accentBarX, accentBarY, 3, cardHeight, 'F');
      
      // Service card border
      doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(marginLeft, serviceStartY, contentWidth, cardHeight, 3, 3, 'D');
      
      currentY += 10;
    });

    // Add spacing between categories
    if (catIndex < services.length - 1) {
      currentY += 8;
    }
  });

  // Enhanced Footer on each page
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerStartY = footerY;
    
    // Footer background with accent
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(0, footerStartY, pageWidth, 17, 'F');
    
    // Red accent line
    doc.setFillColor(signalRed[0], signalRed[1], signalRed[2]);
    doc.rect(0, footerStartY, pageWidth, 2, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('IE GLOBAL | ODER 20 Box 66193, 2491DC Den Haag, Netherlands', marginLeft, footerStartY + 6);
    doc.text('KvK: 97185515 | BTW: NL005254766B14', marginLeft, footerStartY + 11);
    doc.text('Contact: Cassian Drefke | +31 6 27 20 71 08 | cdrefke@ie-global.net', marginLeft, footerStartY + 16);
    
    // Page number
    doc.setFontSize(7);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginRight, footerStartY + 16, { align: 'right' });
  };

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc.output('blob');
}
