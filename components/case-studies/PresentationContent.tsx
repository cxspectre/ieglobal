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
    <div className="bg-white">
      {sections.map((section, index) => {
        // H2 - Section Header (Clean, Minimal, Red Label)
        if (section.type === 'h2') {
          const sectionTitle = section.content.toLowerCase();
          const isFirstSection = index === 0;
          
          return (
            <section key={index} className={`py-20 ${isFirstSection ? 'bg-white' : 'bg-off-white'}`}>
              <div className="container-wide max-w-4xl">
                <div className="mb-8">
                  <h2 
                    className="text-xs font-bold text-signal-red uppercase tracking-wider mb-3"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                  <div className="w-12 h-0.5 bg-signal-red"></div>
                </div>
              </div>
            </section>
          );
        }

        // H3 - Step/Phase Header (Clean Typography)
        if (section.type === 'h3') {
          return (
            <section key={index} className="py-12 bg-white">
              <div className="container-wide max-w-4xl">
                <h3 
                  className="text-2xl font-bold text-navy-900 mb-6"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          );
        }

        // P - Paragraph (Clean, Readable)
        if (section.type === 'p') {
          const prevSection = index > 0 ? sections[index - 1] : null;
          const isContext = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('context');
          const isOutcome = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('outcome');
          const isTechStack = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('tech');

          if (isContext || isOutcome) {
            return (
              <section key={index} className="py-6 bg-white">
                <div className="container-wide max-w-4xl">
                  <p 
                    className="text-lg text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          if (isTechStack) {
            return (
              <section key={index} className="py-8 bg-off-white">
                <div className="container-wide max-w-4xl">
                  <p 
                    className="text-base text-slate-700 text-center"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          return (
            <section key={index} className="py-4 bg-white">
              <div className="container-wide max-w-4xl">
                <p 
                  className="text-base text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          );
        }

        // UL - Bullet List (Clean, Simple)
        if (section.type === 'ul') {
          const prevSection = index > 0 ? sections[index - 1] : null;
          const isWhatWeDid = prevSection?.type === 'h3';
          const isExpectedOutcome = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('expected outcome');
          const isChallenge = prevSection?.type === 'h2' && 
            prevSection?.content.toLowerCase().includes('challenge');

          if (isWhatWeDid) {
            // Simple list for What We Did
            return (
              <section key={index} className="py-6 bg-white">
                <div className="container-wide max-w-4xl">
                  <ul 
                    className="space-y-3 clean-list"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          if (isExpectedOutcome) {
            // Simple list for Expected Outcome
            return (
              <section key={index} className="py-6 bg-white">
                <div className="container-wide max-w-4xl">
                  <ul 
                    className="space-y-3 clean-list"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          if (isChallenge) {
            // Simple list for Challenge
            return (
              <section key={index} className="py-6 bg-white">
                <div className="container-wide max-w-4xl">
                  <ul 
                    className="space-y-3 clean-list"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </section>
            );
          }

          // Default list styling
          return (
            <section key={index} className="py-6 bg-white">
              <div className="container-wide max-w-4xl">
                <ul 
                  className="space-y-3 clean-list"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          );
        }

        // Other - Render as-is
        return (
          <section key={index} className="py-4 bg-white">
            <div className="container-wide max-w-4xl">
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </section>
        );
      })}

      {/* Clean, minimal list styles */}
      <style jsx global>{`
        .clean-list {
          list-style: none;
          padding: 0;
        }
        .clean-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 0;
          font-size: 16px;
          line-height: 1.7;
          color: #334155;
        }
        .clean-list li::before {
          content: '•';
          color: #ef4444;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 4px;
          font-size: 18px;
        }
        .clean-list li strong {
          color: #0f172a;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

