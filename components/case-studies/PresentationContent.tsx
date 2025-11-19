'use client';

import { useEffect, useState } from 'react';

type PresentationContentProps = {
  content: string;
};

export default function PresentationContent({ content }: PresentationContentProps) {
  const [sections, setSections] = useState<Array<{
    type: 'h2' | 'h3' | 'p' | 'ul' | 'other';
    content: string;
    number?: number;
  }>>([]);

  useEffect(() => {
    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const body = doc.body;

    const parsedSections: Array<{
      type: 'h2' | 'h3' | 'p' | 'ul' | 'other';
      content: string;
      number?: number;
    }> = [];

    let stepCounter = 0;

    // Iterate through direct children of body
    Array.from(body.children).forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      const innerHTML = element.innerHTML.trim();
      const textContent = element.textContent?.trim() || '';

      // Skip empty elements
      if (!textContent && !innerHTML) return;

      if (tagName === 'h2') {
        parsedSections.push({
          type: 'h2',
          content: innerHTML,
        });
      } else if (tagName === 'h3') {
        stepCounter++;
        parsedSections.push({
          type: 'h3',
          content: innerHTML,
          number: stepCounter,
        });
      } else if (tagName === 'p') {
        parsedSections.push({
          type: 'p',
          content: innerHTML,
        });
      } else if (tagName === 'ul') {
        parsedSections.push({
          type: 'ul',
          content: innerHTML,
        });
      } else if (!['br', 'hr', 'style', 'script'].includes(tagName)) {
        parsedSections.push({
          type: 'other',
          content: element.outerHTML,
        });
      }
    });

    setSections(parsedSections);
  }, [content]);

  return (
    <div className="bg-white presentation-content">
      {sections.map((section, index) => {
        // H2 - Section Header (Full Width, Red, Centered)
        if (section.type === 'h2') {
          return (
            <section key={index} className="py-24 bg-white">
              <div className="container-wide max-w-6xl">
                <h2 
                  className="text-xs font-bold text-signal-red uppercase tracking-[0.2em] mb-8 text-center"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          );
        }

        // H3 - Step/Phase Header (Large Number + Title)
        if (section.type === 'h3') {
          return (
            <section key={index} className="py-20 bg-off-white">
              <div className="container-wide max-w-6xl">
                <div className="grid grid-cols-12 gap-12 items-start">
                  <div className="col-span-2">
                    <div className="text-8xl font-bold text-signal-red/20 leading-none">
                      {String(section.number).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="col-span-10">
                    <h3 
                      className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // P - Paragraph (Context, Challenge, Outcome)
        if (section.type === 'p') {
          const isContext = index > 0 && sections[index - 1]?.type === 'h2' && 
            sections[index - 1]?.content.toLowerCase().includes('context');
          const isOutcome = index > 0 && sections[index - 1]?.type === 'h2' && 
            sections[index - 1]?.content.toLowerCase().includes('outcome');
          const isTechStack = index > 0 && sections[index - 1]?.type === 'h2' && 
            sections[index - 1]?.content.toLowerCase().includes('tech');

          if (isContext || isOutcome) {
            return (
              <section key={index} className="py-16 bg-white">
                <div className="container-wide max-w-4xl">
                  <p 
                    className="text-xl md:text-2xl text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          if (isTechStack) {
            return (
              <section key={index} className="py-16 bg-off-white">
                <div className="container-wide max-w-4xl">
                  <p 
                    className="text-lg text-slate-700 text-center font-medium"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          return (
            <section key={index} className="py-8 bg-white">
              <div className="container-wide max-w-4xl">
                <p 
                  className="text-base text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          );
        }

        // UL - Bullet List (What We Did items, Expected Outcome, Challenge)
        if (section.type === 'ul') {
          const prevSection = index > 0 ? sections[index - 1] : null;
          const isWhatWeDid = prevSection?.type === 'h3';
          const isExpectedOutcome = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('expected outcome');
          const isChallenge = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('challenge');

          if (isWhatWeDid) {
            // Grid layout for What We Did items
            return (
              <section key={index} className="py-12 bg-off-white">
                <div className="container-wide max-w-6xl">
                  <ul 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 presentation-list"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          if (isExpectedOutcome) {
            // Card grid for Expected Outcome
            return (
              <section key={index} className="py-16 bg-white">
                <div className="container-wide max-w-6xl">
                  <ul 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 presentation-list"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          if (isChallenge) {
            // Challenge list - full width with emphasis
            return (
              <section key={index} className="py-12 bg-white">
                <div className="container-wide max-w-4xl">
                  <ul 
                    className="space-y-4 presentation-list"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          // Default list styling
          return (
            <section key={index} className="py-12 bg-white">
              <div className="container-wide max-w-4xl">
                <ul 
                  className="space-y-4 presentation-list"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          );
        }

        // Other - Render as-is
        return (
          <section key={index} className="py-8 bg-white">
            <div className="container-wide max-w-4xl">
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </section>
        );
      })}

      {/* Add custom styles for lists */}
      <style jsx global>{`
        .presentation-content .presentation-list {
          list-style: none;
          padding: 0;
        }
        .presentation-content .presentation-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px;
          background: white;
          border-left: 4px solid #ef4444;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          font-size: 16px;
          line-height: 1.7;
          color: #334155;
          transition: all 0.2s ease;
        }
        .presentation-content .presentation-list li:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateX(4px);
        }
        .presentation-content .presentation-list li::before {
          content: '→';
          color: #ef4444;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 18px;
        }
        .presentation-content .presentation-list li strong {
          color: #0f172a;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

