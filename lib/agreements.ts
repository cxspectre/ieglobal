/**
 * IE Global agreement templates.
 * Placeholders: {{client_name}}, {{company_name}}, {{client_address}}, {{client_email}}, {{client_contact}},
 * {{client_phone}}, {{client_kvk}}, {{client_vat}}, {{work_types}}, {{country}}, {{effective_date}}, etc.
 */

export const IE_GLOBAL = {
  name: 'IE Global',
  address: 'Oder 20 Box 66193, 2491DC Den Haag, Netherlands',
  kvk: '97185515',
  btw: 'NL737599054B02',
  contact: 'Cassian Drefke',
  phone: '+31 6 27 20 71 08',
  email: 'cdrefke@ie-global.net',
  iban: 'NL50 BUNQ 2152 5367 38',
  bic: 'BUNQNL2A',
};

export const WORK_TYPES = [
  'Strategy & Direction',
  'Websites & Platforms',
  'Mobile Apps',
  'Data, AI & Automation',
  'Cloud & Security',
  'Customer Experience',
  'Growth & Marketing',
  'Ongoing Support & Optimization',
];

export const COUNTRIES = [
  'Netherlands',
  'Germany',
  'Belgium',
  'United Kingdom',
  'France',
  'Spain',
  'Italy',
  'United States',
  'Other (EU)',
  'Other (Non-EU)',
];

export type AgreementFormData = {
  client_name: string;
  company_name: string;
  client_address: string;
  client_email: string;
  client_contact: string;
  client_phone?: string;
  client_kvk?: string;
  client_vat?: string;
  work_types: string[];
  country: string;
  effective_date: string;
  term_months?: string;
  governing_law?: string;
  project_description?: string;
  scope_summary?: string;
  support_hours?: string;
  response_time_hours?: string;
};

export function fillTemplate(text: string, data: AgreementFormData): string {
  const workTypesStr = data.work_types?.length ? data.work_types.join(', ') : 'Digital systems and engineering services';
  return text
    .replace(/\{\{client_name\}\}/g, data.client_name || '_________________________')
    .replace(/\{\{company_name\}\}/g, data.company_name || '_________________________')
    .replace(/\{\{client_address\}\}/g, data.client_address || '_________________________')
    .replace(/\{\{client_email\}\}/g, data.client_email || '_________________________')
    .replace(/\{\{client_contact\}\}/g, data.client_contact || '_________________________')
    .replace(/\{\{client_phone\}\}/g, data.client_phone || '—')
    .replace(/\{\{client_kvk\}\}/g, data.client_kvk || '—')
    .replace(/\{\{client_vat\}\}/g, data.client_vat || '—')
    .replace(/\{\{work_types\}\}/g, workTypesStr)
    .replace(/\{\{country\}\}/g, data.country || 'Netherlands')
    .replace(/\{\{effective_date\}\}/g, data.effective_date || new Date().toISOString().slice(0, 10))
    .replace(/\{\{term_months\}\}/g, data.term_months || '12')
    .replace(/\{\{governing_law\}\}/g, data.governing_law || data.country || 'Netherlands')
    .replace(/\{\{project_description\}\}/g, data.project_description || 'Digital systems and engineering services as agreed in statements of work.')
    .replace(/\{\{scope_summary\}\}/g, data.scope_summary || 'As specified in individual statements of work.')
    .replace(/\{\{support_hours\}\}/g, data.support_hours || '40')
    .replace(/\{\{response_time_hours\}\}/g, data.response_time_hours || '24');
}

// NDA
export const NDA_TEXT = {
  title: 'Non-Disclosure Agreement (NDA)',
  parties: `1. IE Global (Service Provider)\n   ${IE_GLOBAL.address}\n   KvK: ${IE_GLOBAL.kvk} | BTW: ${IE_GLOBAL.btw}\n   Contact: ${IE_GLOBAL.contact} | ${IE_GLOBAL.email}\n\n2. {{company_name}} (Client)\n   Contact: {{client_contact}} | Tel: {{client_phone}}\n   Address: {{client_address}}\n   Email: {{client_email}}\n   KvK: {{client_kvk}} | BTW: {{client_vat}}`,
  purpose: 'The parties wish to explore a business opportunity involving {{work_types}} and will need to disclose certain confidential information to each other for the purpose of evaluating and potentially pursuing this opportunity.',
  sections: [
    { title: '1. Definition of Confidential Information', content: 'Confidential Information includes all information disclosed by either party, whether in writing, orally, or by any other means, including but not limited to: technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information.' },
    { title: '2. Non-Disclosure Obligations', content: 'Each party agrees to hold and maintain the Confidential Information in strictest confidence and not to disclose such Confidential Information to third parties without the prior written consent of the disclosing party.' },
    { title: '3. Use of Confidential Information', content: 'The Confidential Information shall be used solely for the purpose described above and shall not be used for any other purpose or in any other manner.' },
    { title: '4. Term', content: 'This Agreement shall remain in effect for a period of three (3) years from the effective date of {{effective_date}}.' },
    { title: '5. Governing Law', content: 'This Agreement shall be governed by the laws of {{country}}.' },
  ],
};

// MSA
export const MSA_TEXT = {
  title: 'Master Service Agreement (MSA)',
  preamble: `This Master Service Agreement ("Agreement") is entered into as of {{effective_date}} between IE Global ("Service Provider") and {{company_name}} ("Client").\n\nIE Global: ${IE_GLOBAL.address} | KvK: ${IE_GLOBAL.kvk} | BTW: ${IE_GLOBAL.btw}\nClient: {{client_address}} | KvK: {{client_kvk}} | BTW: {{client_vat}} | Contact: {{client_contact}} | Tel: {{client_phone}} | {{client_email}}`,
  sections: [
    { title: '1. Scope of Services', content: 'Service Provider shall provide {{work_types}} as specified in individual Statements of Work ("SOW") executed under this Agreement. Each SOW shall be incorporated by reference and shall form part of this Agreement.' },
    { title: '2. Term', content: 'This Agreement shall commence on {{effective_date}} and continue for {{term_months}} months unless terminated earlier in accordance with Section 8. It may be renewed by mutual written agreement.' },
    { title: '3. Fees and Payment', content: 'Client shall pay Service Provider in accordance with the terms specified in each SOW. Unless otherwise agreed, invoices are due within 15 business days of issue. Late payments may incur interest at the statutory rate.' },
    { title: '4. Confidentiality', content: 'Each party agrees to maintain the confidentiality of the other party\'s Confidential Information and to use such information only for the purposes of this Agreement.' },
    { title: '5. Intellectual Property', content: 'Pre-existing intellectual property of either party remains the property of that party. Deliverables created specifically for Client under a SOW shall be assigned to Client upon full payment, unless otherwise agreed in writing.' },
    { title: '6. Limitation of Liability', content: 'Except for gross negligence or wilful misconduct, Service Provider\'s liability shall not exceed the fees paid by Client under the relevant SOW in the twelve months preceding the claim.' },
    { title: '7. Governing Law', content: 'This Agreement shall be governed by the laws of {{country}}.' },
    { title: '8. Termination', content: 'Either party may terminate this Agreement with 30 days written notice. Sections 4, 5, 6 and 7 shall survive termination.' },
  ],
};

// SOW
export const SOW_TEXT = {
  title: 'Statement of Work (SOW)',
  preamble: `This Statement of Work ("SOW") is entered into under the Master Service Agreement between IE Global and {{company_name}}.\n\nEffective Date: {{effective_date}}\nClient: {{client_contact}} | Tel: {{client_phone}} | {{client_email}} | KvK: {{client_kvk}} | BTW: {{client_vat}}`,
  sections: [
    { title: '1. Project Description', content: '{{project_description}}' },
    { title: '2. Scope of Work', content: '{{scope_summary}}\n\nServices covered: {{work_types}}' },
    { title: '3. Deliverables', content: 'Deliverables shall be as specified in project milestones and communicated during the engagement. Client shall provide timely feedback and access to required assets.' },
    { title: '4. Timeline', content: 'Project timeline shall be agreed upon kickoff and communicated via the project portal. Milestones and dependencies will be tracked and reported regularly.' },
    { title: '5. Fees', content: 'Fees and payment terms are as specified in the accompanying proposal or invoice. This SOW is subject to the terms of the Master Service Agreement.' },
  ],
};

// SLA
export const SLA_TEXT = {
  title: 'Service Level Agreement (SLA)',
  preamble: `This Service Level Agreement ("SLA") is entered into as of {{effective_date}} between IE Global and {{company_name}}.\n\nClient: {{company_name}} | {{client_address}} | KvK: {{client_kvk}} | BTW: {{client_vat}}\nServices: {{work_types}}\nJurisdiction: {{country}}`,
  sections: [
    { title: '1. Service Levels', content: 'Service Provider shall use commercially reasonable efforts to maintain the following service levels:\n\n• Availability: Target uptime of 99% for hosted systems, excluding planned maintenance.\n• Response Time: Initial response to support requests within {{response_time_hours}} business hours.\n• Resolution: Critical issues addressed within 24 business hours where possible.' },
    { title: '2. Support Hours', content: 'Support is provided during business hours (CET) unless otherwise agreed. Included support: up to {{support_hours}} hours per month as specified in the engagement.' },
    { title: '3. Escalation', content: 'Unresolved issues may be escalated to the project lead. Contact: {{governing_law}} or via the project portal.' },
    { title: '4. Exclusions', content: 'SLA does not apply to issues caused by Client modifications, third-party services, force majeure, or Client-side infrastructure.' },
    { title: '5. Review', content: 'This SLA shall be reviewed annually or upon material change to the scope of services.' },
  ],
};

// Ongoing Support Agreement
export const OSA_TEXT = {
  title: 'Ongoing Support Agreement',
  preamble: `This Ongoing Support Agreement ("Agreement") is entered into as of {{effective_date}} between IE Global and {{company_name}}.\n\nClient: {{client_contact}} | Tel: {{client_phone}} | {{client_email}} | KvK: {{client_kvk}} | BTW: {{client_vat}}\nServices: {{work_types}}\nJurisdiction: {{country}}`,
  sections: [
    { title: '1. Scope of Support', content: 'Service Provider shall provide ongoing support, maintenance, updates, and improvements for the digital systems delivered to Client. This includes: bug fixes, security updates, performance optimisation, and minor enhancements as agreed.' },
    { title: '2. Support Allocation', content: 'Client is allocated {{support_hours}} hours of support per month. Unused hours do not roll over unless otherwise agreed in writing.' },
    { title: '3. Response Times', content: 'Service Provider shall acknowledge support requests within {{response_time_hours}} business hours and use commercially reasonable efforts to resolve issues in accordance with severity.' },
    { title: '4. Term and Renewal', content: 'This Agreement commences on {{effective_date}} and continues for {{term_months}} months. It renews automatically for successive periods unless either party gives 30 days written notice of non-renewal.' },
    { title: '5. Fees', content: 'Monthly fees are as specified in the accompanying invoice. Fees are due in advance and payable within 15 days of invoice date.' },
    { title: '6. Out of Scope', content: 'Major new features, redesigns, or work beyond the agreed scope shall be quoted separately and executed under a supplementary SOW.' },
  ],
};

// UI/UX Design Partnership Agreement (Partners)
export type PartnershipFormData = {
  partner_name: string;
  partner_entity_type: string;
  partner_address: string;
  partner_email: string;
  partner_contact: string;
  effective_date: string;
  communication_tools: string;
  revision_rounds: string;
  revision_rate: string;
  acceptance_days: string;
  fee_model: string;
  hourly_rate?: string;
  day_rate?: string;
  billing_frequency?: string;
  fixed_fee?: string;
  retainer_amount?: string;
  retainer_hours?: string;
  excess_rate?: string;
  revenue_share_pct?: string;
  revenue_share_days?: string;
  invoice_days: string;
  late_interest: string;
  confidentiality_years: string;
  non_solicit_months: string;
  liability_months: string;
  notice_days: string;
  cure_days: string;
  governing_law: string;
  notice_email: string;
};

export function fillPartnershipTemplate(text: string, data: PartnershipFormData): string {
  const feeText = data.fee_model === 'A' && data.hourly_rate
    ? `Model A — Hourly/Day Rate: €${data.hourly_rate}/hour or €${data.day_rate || '—'}/day, billed ${data.billing_frequency || 'monthly'}.`
    : data.fee_model === 'B' && data.fixed_fee
    ? `Model B — Fixed Fee Per Deliverable: €${data.fixed_fee} per milestone.`
    : data.fee_model === 'C' && data.retainer_amount
    ? `Model C — Retainer: €${data.retainer_amount}/month for up to ${data.retainer_hours || '—'} hours, excess at €${data.excess_rate || '—'}/hour.`
    : data.fee_model === 'D' && data.revenue_share_pct
    ? `Model D — Revenue Share: Partner receives ${data.revenue_share_pct}% of net project revenue, payable within ${data.revenue_share_days || '30'} days after IE Global receives client payment.`
    : 'Fees as specified in individual SOWs.';

  return text
    .replace(/\{\{partner_name\}\}/g, data.partner_name || '_________________________')
    .replace(/\{\{partner_entity_type\}\}/g, data.partner_entity_type || '_________________________')
    .replace(/\{\{partner_address\}\}/g, data.partner_address || '_________________________')
    .replace(/\{\{partner_email\}\}/g, data.partner_email || '_________________________')
    .replace(/\{\{partner_contact\}\}/g, data.partner_contact || '_________________________')
    .replace(/\{\{effective_date\}\}/g, data.effective_date || new Date().toISOString().slice(0, 10))
    .replace(/\{\{communication_tools\}\}/g, data.communication_tools || 'Figma, Notion, Slack, Email')
    .replace(/\{\{revision_rounds\}\}/g, data.revision_rounds || '2')
    .replace(/\{\{revision_rate\}\}/g, data.revision_rate || 'as agreed')
    .replace(/\{\{acceptance_days\}\}/g, data.acceptance_days || '5')
    .replace(/\{\{fee_text\}\}/g, feeText)
    .replace(/\{\{invoice_days\}\}/g, data.invoice_days || '14')
    .replace(/\{\{late_interest\}\}/g, data.late_interest || 'statutory interest')
    .replace(/\{\{confidentiality_years\}\}/g, data.confidentiality_years || '3')
    .replace(/\{\{non_solicit_months\}\}/g, data.non_solicit_months || '12')
    .replace(/\{\{liability_months\}\}/g, data.liability_months || '12')
    .replace(/\{\{notice_days\}\}/g, data.notice_days || '30')
    .replace(/\{\{cure_days\}\}/g, data.cure_days || '10')
    .replace(/\{\{governing_law\}\}/g, data.governing_law || 'Netherlands')
    .replace(/\{\{notice_email\}\}/g, data.notice_email || IE_GLOBAL.email);
}

export const PARTNERSHIP_TEXT = {
  title: 'UI/UX Design Partnership Agreement (No Development)',
  preamble: `This UI/UX Design Partnership Agreement ("Agreement") is entered into as of {{effective_date}} ("Effective Date") by and between:

1. IE Global, with its principal place of business at ${IE_GLOBAL.address} ("IE Global"), and
2. {{partner_name}}, {{partner_entity_type}}, with its principal place of business at {{partner_address}} ("Partner").

IE Global and Partner may be referred to individually as a "Party" and together as the "Parties".`,
  sections: [
    { title: '1) Purpose', content: 'The purpose of this Agreement is to define how the Parties collaborate on UI/UX design, product planning, workshops, and brainstorming for client and internal projects, excluding any software development or coding obligations by Partner. IE Global\'s delivery approach emphasizes premium, minimal, intentional design and clear execution standards.' },
    { title: '2) Relationship Type (Independent Contractors)', content: '2.1 The Parties are independent contractors. Nothing creates an employment, agency, franchise, or joint venture relationship.\n2.2 Neither Party may bind the other to agreements without written authorization.\n\n2.3 Independence (Wet DBA / Schijnzelfstandigheid): The Parties expressly confirm the following independence indicators: (a) Partner controls the manner, methods, and hours of performing work; (b) Partner uses own tools, equipment, and workspace; (c) Partner is free to work for other clients and is not economically dependent on IE Global; (d) IE Global has no managerial or disciplinary authority over Partner; (e) No paid leave, pension, or employment benefits apply; (f) Partner bears own business risk and may delegate or subcontract where appropriate. These factors support a bona fide independent contractor relationship under Dutch law.' },
    { title: '3) Scope of Collaboration (Design Only)', content: '3.1 Partner may provide: Discovery support (requirements clarification, user flows, information architecture); Workshops (stakeholder sessions, ideation, prioritization); UX deliverables (wireframes, user journeys, prototypes); UI deliverables (visual design systems, component libraries, screens); Design handoff materials (annotations, specs, interaction notes); Feedback loops and iteration cycles.\n\n3.2 Explicit Exclusions (No Development): Partner will not be responsible for: Writing production code (frontend/backend), configuring hosting, databases, CI/CD; Implementing tracking, analytics, tagging, or technical SEO; Security hardening, performance engineering, or infrastructure decisions; Ongoing maintenance of software systems. Partner can advise conceptually, but IE Global remains responsible for implementation.' },
    { title: '4) Engagement Structure (Statements of Work)', content: '4.1 Work is commissioned through individual Statements of Work ("SOW"), each incorporated by reference.\n4.2 Each SOW should define at minimum: Project name + client (if applicable); Deliverables and file formats (e.g., Figma); Timeline and milestones; Revision/iteration limits; Fees and payment schedule; Acceptance criteria. If an SOW conflicts with this Agreement, the SOW controls only for that project.' },
    { title: '5) Communication & Workflow', content: `5.1 Primary tools: {{communication_tools}}.\n5.2 Partner agrees to: Provide realistic timelines and flag risks early; Attend key meetings as agreed in the SOW; Maintain orderly files and naming conventions for handoff.\n5.3 IE Global will: Provide clear requirements, brand inputs, and decision-makers; Consolidate feedback to avoid "death-by-committee" loops.` },
    { title: '6) Quality, Iterations, and Acceptance', content: '6.1 Deliverables must match the SOW\'s acceptance criteria.\n6.2 Unless otherwise stated, each deliverable includes {{revision_rounds}} rounds of revisions. Additional revisions are billed at {{revision_rate}}.\n6.3 Acceptance occurs when IE Global confirms in writing (email/message) that deliverables are approved. If Partner has sent a clear handoff notice and IE Global does not provide a substantive rejection within {{acceptance_days}} business days, the deliverables are deemed accepted; provided that Partner has given IE Global reasonable opportunity to review and that silence is not used unreasonably.' },
    { title: '7) Fees & Payment', content: '7.1 {{fee_text}}\n\n7.2 Invoices are payable within {{invoice_days}} days.\n7.3 Late payment interest: For B2B commercial transactions (handelstransacties), statutory interest applies at 10.15% p.a. (as per 1 July 2025). For non-trade transactions, statutory interest applies at 4% p.a. (as per 1 January 2026). Reasonable collection costs may be charged to the defaulting party.' },
    { title: '8) Intellectual Property (Who Owns What)', content: '8.1 Work Product includes all UI/UX outputs created under an SOW (designs, mockups, flows, prototypes, design systems, docs).\n8.2 Upon full payment, Partner assigns to IE Global, to the extent permitted by Dutch law, all worldwide, perpetual, exclusive rights in the Work Product, including but not limited to: reproduction, publication, adaptation, modification, translation, distribution, communication to the public, and the right to sublicense or transfer to clients, in all media (existing and future).\n8.3 Pre-existing materials, templates, tools, and general know-how remain Partner\'s property and are licensed to IE Global only as needed for the relevant SOW; they are not assigned. Third-party assets (fonts, UI kits, illustrations) used by Partner must be disclosed and properly licensed for client/IE Global use.\n8.4 Portfolio Rights: Partner may showcase final, public-facing work in a portfolio only after (a) the client launches publicly or (b) IE Global gives written permission. No confidential metrics, credentials, or private screens.' },
    { title: '9) Confidentiality', content: '9.1 Each Party must keep confidential any non-public info learned during collaboration (client info, business strategy, pricing, designs, credentials, roadmaps).\n9.2 Confidentiality survives termination for {{confidentiality_years}} years (or longer for trade secrets).' },
    { title: '10) Data Protection (GDPR)', content: '10.1 If Partner processes personal data on IE Global\'s or a client\'s behalf (e.g., user research, interview notes, analytics), a Data Processing Agreement (DPA) under GDPR Art. 28 is required.\n10.2 Exhibit A (DPA) is attached and forms part of this Agreement. It covers: processing instructions, security measures, sub-processors, deletion/return of data upon termination, and breach notification within 72 hours where feasible.' },
    { title: '11) Non-Solicitation (Anti-Poaching Clause)', content: '11.1 During the Agreement and for {{non_solicit_months}} months after, Partner will not knowingly solicit IE Global\'s clients for competing services related to the same engagement without IE Global\'s written consent.\n11.2 During the Agreement and for {{non_solicit_months}} months after, Partner will not solicit IE Global team members/contractors for hire.' },
    { title: '12) Non-Exclusivity', content: 'This Agreement is non-exclusive unless an SOW explicitly states exclusivity for a defined period and compensation reflects that.' },
    { title: '13) Warranties & Third-Party Assets', content: '13.1 Partner warrants the Work Product is original or properly licensed and does not knowingly infringe third-party rights.\n13.2 If Partner uses third-party assets (fonts, illustrations, UI kits), Partner must disclose licensing terms and ensure the client/IE Global has a valid right to use them.' },
    { title: '14) Limitation of Liability', content: '14.1 Neither Party is liable for indirect damages (lost profits, consequential damages) to the maximum extent permitted by law.\n14.2 Each Party\'s total liability under this Agreement is capped at the fees paid under the relevant SOW in the {{liability_months}} months preceding the claim, except for fraud, wilful misconduct, or breach of confidentiality/IP where caps may not apply.' },
    { title: '15) Term & Termination', content: `15.1 Term begins on the Effective Date and continues until terminated.\n15.2 Either Party may terminate with {{notice_days}} days written notice.\n15.3 Either Party may terminate immediately for material breach if not cured within {{cure_days}} business days after notice.\n15.4 On termination: Partner delivers all in-progress files for paid work; IE Global pays for completed work and approved milestones per SOW.` },
    { title: '16) Dispute Resolution & Governing Law', content: '16.1 Parties will attempt good-faith resolution within 14 days.\n16.2 If unresolved, disputes go to court in Den Haag, Netherlands.\n16.3 Governing law: {{governing_law}}.' },
    { title: '17) Miscellaneous', content: 'Entire Agreement + SOWs are the full understanding. Changes must be in writing. If one clause is invalid, the rest remains effective. Notices sent to: {{notice_email}}.' },
    { title: 'Exhibit A: Data Processing Agreement (Summary)', content: 'Where Partner processes personal data on IE Global\'s or a client\'s behalf:\n\nA.1 Instructions: Partner processes data only on documented instructions from IE Global (or the client, as applicable).\nA.2 Security: Partner implements appropriate technical and organisational measures (access control, encryption where appropriate, secure handling).\nA.3 Sub-processors: Partner may use sub-processors (e.g. cloud storage, design tools) provided they are bound by equivalent obligations. IE Global shall be informed of new sub-processors and may object on reasonable grounds.\nA.4 Deletion/Return: Upon termination or on request, Partner shall delete or return all personal data and certify compliance, unless retention is required by law.\nA.5 Breach Notification: Partner shall notify IE Global of any personal data breach without undue delay and in any event within 72 hours of becoming aware of it, providing sufficient information to allow IE Global to meet its notification obligations under GDPR Art. 33.' },
  ],
  signaturePartner: 'Partner',
};

// DPA
export const DPA_TEXT = {
  title: 'Data Processing Agreement (DPA)',
  preamble: `This Data Processing Agreement ("DPA") is entered into as of {{effective_date}} between IE Global ("Processor") and {{company_name}} ("Controller").\n\nController: {{company_name}} | {{client_address}} | KvK: {{client_kvk}} | BTW: {{client_vat}} | {{client_email}}\nProcessor: ${IE_GLOBAL.address} | ${IE_GLOBAL.email}\nJurisdiction: {{country}}`,
  sections: [
    { title: '1. Definitions', content: 'Personal Data, Processing, Controller, Processor, Data Subject, and Sub-processor have the meanings given in the GDPR/Applicable Data Protection Law.' },
    { title: '2. Scope', content: 'Processor processes Personal Data on behalf of Controller in connection with the provision of {{work_types}}. This DPA applies to all Processing of Personal Data under the service agreement.' },
    { title: '3. Processor Obligations', content: 'Processor shall: (a) process Personal Data only on documented instructions from Controller; (b) ensure confidentiality of persons authorised to process; (c) implement appropriate technical and organisational measures; (d) assist Controller with Data Subject requests and regulatory compliance; (e) delete or return Personal Data upon termination unless required to retain by law.' },
    { title: '4. Sub-processors', content: 'Processor may engage sub-processors (e.g. hosting providers) provided they are bound by equivalent obligations. Controller shall be informed of any new sub-processors and may object on reasonable grounds.' },
    { title: '5. Audits', content: 'Processor shall make available information necessary to demonstrate compliance and allow for audits, subject to reasonable notice and confidentiality.' },
    { title: '6. Governing Law', content: 'This DPA is governed by the laws of {{country}}. For EU/EEA Controllers, the Standard Contractual Clauses may apply as agreed in the service agreement.' },
  ],
};
