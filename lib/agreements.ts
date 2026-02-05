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
