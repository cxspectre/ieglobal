'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressStepper from '@/components/ui/ProgressStepper';

// Service categories matching IE Global's service catalog
const serviceCategories = [
  'Strategy & Direction',
  'Websites & Platforms',
  'Mobile Apps',
  'Data, AI & Automation',
  'Cloud & Security',
  'Customer Experience',
  'Growth & Marketing',
  'Ongoing Support & Optimization',
];

const projectTypes = [
  'New Build',
  'Redesign/Rebuild',
  'Enhancement',
  'Integration',
  'Optimization',
  'Support & Maintenance',
];

const timelineOptions = [
  '1-2 weeks',
  '3-4 weeks',
  '1-2 months',
  '3-6 months',
  '6+ months',
  'Ongoing',
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-slate-100 text-slate-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const documentTypes = [
  { id: 'discovery', label: 'Discovery Questionnaire', required: true },
  { id: 'access', label: 'Access Credentials (domain, hosting, etc.)', required: true },
  { id: 'brand', label: 'Brand Files (logos, style guide, etc.)', required: false },
  { id: 'technical', label: 'Technical Documentation', required: false },
  { id: 'nda', label: 'Non-Disclosure Agreement (NDA)', required: false },
  { id: 'other', label: 'Other Supporting Documents', required: false },
];

type Employee = {
  id: string;
  full_name: string;
  email: string;
};

const steps = [
  { number: 1, title: 'Basic Info', description: 'Client details' },
  { number: 2, title: 'Project Definition', description: 'Scope & timeline' },
  { number: 3, title: 'Documents', description: 'Required files' },
  { number: 4, title: 'Kickoff Prep', description: 'Team & tasks' },
  { number: 5, title: 'Assets', description: 'Auto-generate' },
  { number: 6, title: 'Complete', description: 'Review & finish' },
];

export default function OnboardClientPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Client Info
    company_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    industry: '',
    internal_notes: '',
    
    // Address & Legal
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: 'Netherlands',
    vat_number: '',
    kvk_number: '',
    
    // Step 2: Project Definition
    service_categories: [] as string[],
    project_type: '',
    project_name: '',
    estimated_scope: '',
    estimated_timeline: '',
    priority_level: 'medium',
    
    // Step 3: Required Documents
    required_documents: [] as string[],
    send_upload_link: false,
    
    // Step 4: Kickoff Preparation
    project_lead_id: '',
    technical_lead_id: '',
    schedule_kickoff: false,
    kickoff_date: '',
    create_folder: true,
    generate_msa: false,
    generate_proposal: false,
    add_to_roadmap: true,
    
    // Step 5: Automated Assets
    create_folder_structure: true,
    create_roadmap_template: true,
    create_notion_page: false,
    create_slack_channel: false,
    send_welcome_email: true,
    create_portal_account: true,
    create_first_project: true,
  });

  // Load employees for team assignment
  useEffect(() => {
    const loadEmployees = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['admin', 'employee'])
        .order('full_name');
      
      if (data) setEmployees(data);
    };
    
    loadEmployees();
  }, []);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData({ ...formData, ...updates });
  };

  const nextStep = () => {
    setError('');
    
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.company_name || !formData.contact_person || !formData.contact_email) {
        setError('Please fill in all required fields (marked with *)');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (formData.service_categories.length === 0 || !formData.project_type) {
        setError('Please select at least one service category and a project type');
        return;
      }
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Step 1: Create client record
      const { data: newClient, error: clientError } = await (supabase as any)
        .from('clients')
        .insert({
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          website: formData.website || null,
          industry: formData.industry || null,
          onboarding_notes: formData.internal_notes || null,
          address_street: formData.address_street || null,
          address_city: formData.address_city || null,
          address_postal_code: formData.address_postal_code || null,
          address_country: formData.address_country || 'Netherlands',
          vat_number: formData.vat_number || null,
          kvk_number: formData.kvk_number || null,
          assigned_employee_id: session.user.id,
          status: 'active',
          onboarding_status: 'completed',
          onboarding_step: 6,
          priority_level: formData.priority_level,
          expected_timeline: formData.estimated_timeline,
          service_category: formData.service_categories[0] || null,
          estimated_scope: formData.estimated_scope || null,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Step 2: Create onboarding data record
      const { error: onboardingError } = await (supabase as any)
        .from('client_onboarding_data')
        .insert({
          client_id: newClient.id,
          service_categories: formData.service_categories,
          project_scope: formData.estimated_scope,
          estimated_timeline: formData.estimated_timeline,
          internal_priority: formData.priority_level,
          
          documents_requested: formData.required_documents,
          upload_link_sent: formData.send_upload_link,
          upload_link_sent_at: formData.send_upload_link ? new Date().toISOString() : null,
          
          project_lead_id: formData.project_lead_id || null,
          technical_lead_id: formData.technical_lead_id || null,
          kickoff_meeting_scheduled: formData.schedule_kickoff,
          kickoff_meeting_date: formData.kickoff_date || null,
          project_folder_created: formData.create_folder,
          msa_generated: formData.generate_msa,
          proposal_generated: formData.generate_proposal,
          added_to_roadmap: formData.add_to_roadmap,
          
          folder_structure_created: formData.create_folder_structure,
          roadmap_template_created: formData.create_roadmap_template,
          notion_page_created: formData.create_notion_page,
          slack_channel_created: formData.create_slack_channel,
          welcome_email_sent: formData.send_welcome_email,
          welcome_email_sent_at: formData.send_welcome_email ? new Date().toISOString() : null,
          
          onboarding_completed_at: new Date().toISOString(),
          created_by: session.user.id,
        });

      if (onboardingError) throw onboardingError;

      // Step 3: Create first project if requested
      if (formData.create_first_project && formData.project_name.trim()) {
        const { error: projectError } = await (supabase as any)
          .from('projects')
          .insert({
            client_id: newClient.id,
            name: formData.project_name.trim(),
            description: formData.estimated_scope || null,
            project_type: formData.project_type || null,
            status: 'discovery',
            progress_percentage: 0,
          });
        if (projectError) {
          console.error('Failed to create project:', projectError);
        } else {
          await (supabase as any).from('activities').insert({
            client_id: newClient.id,
            user_id: session.user.id,
            action_type: 'project_created',
            description: `Project "${formData.project_name}" created during onboarding`,
          });
        }
      }

      // Step 4: Create portal account if requested
      if (formData.create_portal_account) {
        try {
          const res = await fetch('/api/create-client-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: newClient.id,
              email: formData.contact_email,
              fullName: formData.contact_person,
            }),
          });
          if (!res.ok) {
            const json = await res.json();
            if (!json.error?.includes('already exists')) {
              console.error('Failed to create portal account:', json.error);
            }
          }
        } catch (accErr) {
          console.error('Failed to create portal account:', accErr);
        }
      }

      // Step 5: Log activity
      await (supabase as any).from('activities').insert({
        client_id: newClient.id,
        user_id: session.user.id,
        action_type: 'client_onboarded',
        description: `Client "${newClient.company_name}" successfully onboarded through guided workflow`,
        metadata: {
          service_categories: formData.service_categories,
          priority: formData.priority_level,
          timeline: formData.estimated_timeline,
        },
      });

      // Step 6: Send onboarding emails
      if (formData.send_welcome_email || formData.send_upload_link) {
        try {
          const projectLeadName = formData.project_lead_id 
            ? employees.find(emp => emp.id === formData.project_lead_id)?.full_name 
            : undefined;

          await fetch('/api/onboard-client-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientName: formData.company_name,
              contactPerson: formData.contact_person,
              contactEmail: formData.contact_email,
              clientId: newClient.id,
              serviceCategories: formData.service_categories,
              projectLead: projectLeadName,
              sendWelcomeEmail: formData.send_welcome_email,
              sendUploadLink: formData.send_upload_link,
              requiredDocuments: formData.required_documents,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send onboarding emails:', emailError);
          // Don't fail the entire onboarding if email fails
        }
      }

      setCreatedClientId(newClient.id);
      
      // Move to confirmation step
      setCurrentStep(6);
      setLoading(false);
      
    } catch (err: any) {
      console.error('Error onboarding client:', err);
      setError(err.message || 'Failed to onboard client');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/clients"
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Back to clients"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Onboard new client
                  <span className="text-white/50 font-normal ml-2">
                    Step {currentStep < 6 ? `${currentStep}/5` : '✓'}
                  </span>
                </h1>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-900"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Basic Client Info */}
            {currentStep === 1 && (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">Basic Client Information</h2>
                  <p className="text-slate-700">Enter the essential details about your new client</p>
                </div>

                <div className="space-y-6">
                  {/* Company Name */}
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-semibold text-navy-900 mb-2">
                      Company Name <span className="text-signal-red">*</span>
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      required
                      value={formData.company_name}
                      onChange={(e) => updateFormData({ company_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                      placeholder="e.g., Acme Corporation"
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-semibold text-navy-900 mb-2">
                      Contact Person <span className="text-signal-red">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      required
                      value={formData.contact_person}
                      onChange={(e) => updateFormData({ contact_person: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                      placeholder="e.g., John Smith"
                    />
                  </div>

                  {/* Contact Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact_email" className="block text-sm font-semibold text-navy-900 mb-2">
                        Contact Email <span className="text-signal-red">*</span>
                      </label>
                      <input
                        type="email"
                        id="contact_email"
                        required
                        value={formData.contact_email}
                        onChange={(e) => updateFormData({ contact_email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                        placeholder="john@acme.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact_phone" className="block text-sm font-semibold text-navy-900 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => updateFormData({ contact_phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                        placeholder="+31 6 12345678"
                      />
                    </div>
                  </div>

                  {/* Website & Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-semibold text-navy-900 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        value={formData.website}
                        onChange={(e) => updateFormData({ website: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                        placeholder="https://www.acme.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-semibold text-navy-900 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => updateFormData({ industry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                        placeholder="e.g., Technology, Healthcare"
                      />
                    </div>
                  </div>

                  {/* Address & Business */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-navy-900 mb-3">Address & business details</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address_street" className="block text-sm font-medium text-navy-900 mb-1">Street</label>
                        <input
                          type="text"
                          id="address_street"
                          value={formData.address_street}
                          onChange={(e) => updateFormData({ address_street: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                          placeholder="Street address"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="address_postal_code" className="block text-sm font-medium text-navy-900 mb-1">Postal code</label>
                          <input
                            type="text"
                            id="address_postal_code"
                            value={formData.address_postal_code}
                            onChange={(e) => updateFormData({ address_postal_code: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                            placeholder="1234 AB"
                          />
                        </div>
                        <div>
                          <label htmlFor="address_city" className="block text-sm font-medium text-navy-900 mb-1">City</label>
                          <input
                            type="text"
                            id="address_city"
                            value={formData.address_city}
                            onChange={(e) => updateFormData({ address_city: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                            placeholder="Amsterdam"
                          />
                        </div>
                        <div>
                          <label htmlFor="address_country" className="block text-sm font-medium text-navy-900 mb-1">Country</label>
                          <input
                            type="text"
                            id="address_country"
                            value={formData.address_country}
                            onChange={(e) => updateFormData({ address_country: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="vat_number" className="block text-sm font-medium text-navy-900 mb-1">VAT number</label>
                          <input
                            type="text"
                            id="vat_number"
                            value={formData.vat_number}
                            onChange={(e) => updateFormData({ vat_number: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none font-mono"
                            placeholder="NL123456789B01"
                          />
                        </div>
                        <div>
                          <label htmlFor="kvk_number" className="block text-sm font-medium text-navy-900 mb-1">KVK number</label>
                          <input
                            type="text"
                            id="kvk_number"
                            value={formData.kvk_number}
                            onChange={(e) => updateFormData({ kvk_number: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none font-mono"
                            placeholder="12345678"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label htmlFor="internal_notes" className="block text-sm font-semibold text-navy-900 mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      id="internal_notes"
                      rows={3}
                      value={formData.internal_notes}
                      onChange={(e) => updateFormData({ internal_notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Add any important notes about this client for internal use..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Project Definition */}
            {currentStep === 2 && (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">Project Definition</h2>
                  <p className="text-slate-700">Define the scope, timeline, and priorities for this engagement</p>
                </div>

                <div className="space-y-6">
                  {/* Service Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-3">
                      Service Categories <span className="text-signal-red">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serviceCategories.map((category) => (
                        <label
                          key={category}
                          className={`
                            flex items-center gap-3 p-4 border-2 cursor-pointer transition-all duration-200
                            ${formData.service_categories.includes(category)
                              ? 'border-signal-red bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.service_categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData({
                                  service_categories: [...formData.service_categories, category],
                                });
                              } else {
                                updateFormData({
                                  service_categories: formData.service_categories.filter(c => c !== category),
                                });
                              }
                            }}
                            className="w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                          />
                          <span className="text-sm font-medium text-navy-900">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label htmlFor="project_type" className="block text-sm font-semibold text-navy-900 mb-2">
                      Project Type <span className="text-signal-red">*</span>
                    </label>
                    <select
                      id="project_type"
                      value={formData.project_type}
                      onChange={(e) => updateFormData({ project_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                    >
                      <option value="">Select project type...</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project Name (for first project) */}
                  <div>
                    <label htmlFor="project_name" className="block text-sm font-semibold text-navy-900 mb-2">
                      First project name
                    </label>
                    <input
                      type="text"
                      id="project_name"
                      value={formData.project_name}
                      onChange={(e) => updateFormData({ project_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                      placeholder="e.g., Website Redesign, Platform MVP"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to skip creating a project now</p>
                  </div>

                  {/* Expected Scope */}
                  <div>
                    <label htmlFor="estimated_scope" className="block text-sm font-semibold text-navy-900 mb-2">
                      Expected Scope
                    </label>
                    <textarea
                      id="estimated_scope"
                      rows={3}
                      value={formData.estimated_scope}
                      onChange={(e) => updateFormData({ estimated_scope: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Brief description of project scope and deliverables..."
                    />
                  </div>

                  {/* Timeline & Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="estimated_timeline" className="block text-sm font-semibold text-navy-900 mb-2">
                        Estimated Timeline
                      </label>
                      <select
                        id="estimated_timeline"
                        value={formData.estimated_timeline}
                        onChange={(e) => updateFormData({ estimated_timeline: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                      >
                        <option value="">Select timeline...</option>
                        {timelineOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">
                        Internal Priority Level
                      </label>
                      <div className="flex gap-2">
                        {priorityLevels.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => updateFormData({ priority_level: level.value })}
                            className={`
                              flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200
                              ${formData.priority_level === level.value
                                ? level.color + ' ring-2 ring-offset-2 ring-signal-red'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }
                            `}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Required Documents */}
            {currentStep === 3 && (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">Required Documents</h2>
                  <p className="text-slate-700">Select documents to request from the client</p>
                </div>

                <div className="space-y-6">
                  {/* Document Checklist */}
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-3">
                      Document Requirements
                    </label>
                    <div className="space-y-2">
                      {documentTypes.map((doc) => (
                        <label
                          key={doc.id}
                          className={`
                            flex items-center gap-3 p-4 border-2 cursor-pointer transition-all duration-200
                            ${formData.required_documents.includes(doc.id)
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.required_documents.includes(doc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData({
                                  required_documents: [...formData.required_documents, doc.id],
                                });
                              } else {
                                updateFormData({
                                  required_documents: formData.required_documents.filter(d => d !== doc.id),
                                });
                              }
                            }}
                            className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-navy-900">{doc.label}</span>
                            {doc.required && (
                              <span className="ml-2 text-xs text-signal-red font-semibold">(Required)</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Send Upload Link */}
                  <div className="bg-blue-50 p-6 border-l-4 border-signal-red">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.send_upload_link}
                        onChange={(e) => updateFormData({ send_upload_link: e.target.checked })}
                        className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                      />
                      <div>
                        <div className="font-semibold text-navy-900 mb-1">
                          Send Client Upload Request Link
                        </div>
                        <div className="text-sm text-slate-700">
                          Automatically send an email to the client with a secure link to upload the requested documents
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Kickoff Preparation */}
            {currentStep === 4 && (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">Kickoff Preparation</h2>
                  <p className="text-slate-700">Assign team members and prepare for project launch</p>
                </div>

                <div className="space-y-6">
                  {/* Team Assignment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="project_lead" className="block text-sm font-semibold text-navy-900 mb-2">
                        Assign Project Lead
                      </label>
                      <select
                        id="project_lead"
                        value={formData.project_lead_id}
                        onChange={(e) => updateFormData({ project_lead_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                      >
                        <option value="">Select project lead...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name} ({emp.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="technical_lead" className="block text-sm font-semibold text-navy-900 mb-2">
                        Assign Technical Lead
                      </label>
                      <select
                        id="technical_lead"
                        value={formData.technical_lead_id}
                        onChange={(e) => updateFormData({ technical_lead_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                      >
                        <option value="">Select technical lead...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name} ({emp.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Kickoff Meeting */}
                  <div className="bg-blue-50 p-6 border-l-4 border-signal-red">
                    <label className="flex items-start gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={formData.schedule_kickoff}
                        onChange={(e) => updateFormData({ schedule_kickoff: e.target.checked })}
                        className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-navy-900 mb-1">
                          Schedule Kickoff Meeting
                        </div>
                        <div className="text-sm text-slate-700 mb-3">
                          Set a date for the initial kickoff meeting with the client
                        </div>
                        
                        {formData.schedule_kickoff && (
                          <input
                            type="datetime-local"
                            value={formData.kickoff_date}
                            onChange={(e) => updateFormData({ kickoff_date: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
                          />
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Internal Checklist */}
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-3">
                      Internal Preparation Checklist
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.create_folder}
                          onChange={(e) => updateFormData({ create_folder: e.target.checked })}
                          className="w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                        />
                        <span className="text-sm font-medium text-navy-900">Prepare project folder</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.generate_msa}
                          onChange={(e) => updateFormData({ generate_msa: e.target.checked })}
                          className="w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                        />
                        <span className="text-sm font-medium text-navy-900">Generate MSA (Master Service Agreement)</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.generate_proposal}
                          onChange={(e) => updateFormData({ generate_proposal: e.target.checked })}
                          className="w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                        />
                        <span className="text-sm font-medium text-navy-900">Generate project proposal</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.add_to_roadmap}
                          onChange={(e) => updateFormData({ add_to_roadmap: e.target.checked })}
                          className="w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                        />
                        <span className="text-sm font-medium text-navy-900">Add to internal roadmap</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Automated Assets */}
            {currentStep === 5 && (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">Automated Assets</h2>
                  <p className="text-slate-700">Configure which assets to automatically generate for this client</p>
                </div>

                <div className="space-y-4">
                  {/* Folder Structure */}
                  <label className="flex items-start gap-4 p-6 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white">
                    <input
                      type="checkbox"
                      checked={formData.create_folder_structure}
                      onChange={(e) => updateFormData({ create_folder_structure: e.target.checked })}
                      className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Client Folder Structure
                      </div>
                      <div className="text-sm text-slate-700">
                        Creates organized folder structure for project files, deliverables, and documentation
                      </div>
                    </div>
                  </label>

                  {/* Roadmap Template */}
                  <label className="flex items-start gap-4 p-6 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white">
                    <input
                      type="checkbox"
                      checked={formData.create_roadmap_template}
                      onChange={(e) => updateFormData({ create_roadmap_template: e.target.checked })}
                      className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Project Roadmap Template
                      </div>
                      <div className="text-sm text-slate-700">
                        Generates initial project roadmap following IE Global's phases: Understand → Architect → Build → Launch → Improve
                      </div>
                    </div>
                  </label>

                  {/* Notion Page */}
                  <label className="flex items-start gap-4 p-6 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white">
                    <input
                      type="checkbox"
                      checked={formData.create_notion_page}
                      onChange={(e) => updateFormData({ create_notion_page: e.target.checked })}
                      className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Notion Project Page
                      </div>
                      <div className="text-sm text-slate-700">
                        Creates dedicated Notion workspace page for project documentation and collaboration (optional)
                      </div>
                    </div>
                  </label>

                  {/* Slack Channel */}
                  <label className="flex items-start gap-4 p-6 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white">
                    <input
                      type="checkbox"
                      checked={formData.create_slack_channel}
                      onChange={(e) => updateFormData({ create_slack_channel: e.target.checked })}
                      className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Slack Channel
                      </div>
                      <div className="text-sm text-slate-700">
                        Creates a dedicated Slack channel for internal team communication about this client (optional)
                      </div>
                    </div>
                  </label>

                  {/* Create Portal Account */}
                  <label className="flex items-start gap-4 p-6 border-2 border-green-200 bg-green-50 hover:border-green-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={formData.create_portal_account}
                      onChange={(e) => updateFormData({ create_portal_account: e.target.checked })}
                      className="mt-1 w-5 h-5 text-green-600 border-gray-300 focus:ring-green-600"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Create Portal Account
                      </div>
                      <div className="text-sm text-slate-700">
                        Create a login for the client so they can access projects, invoices, and files in the portal
                      </div>
                    </div>
                  </label>

                  {/* Create First Project */}
                  <label className="flex items-start gap-4 p-6 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white">
                    <input
                      type="checkbox"
                      checked={formData.create_first_project}
                      onChange={(e) => updateFormData({ create_first_project: e.target.checked })}
                      className="mt-1 w-5 h-5 text-signal-red border-gray-300 focus:ring-signal-red"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Create First Project
                      </div>
                      <div className="text-sm text-slate-700">
                        Create an initial project from the name you entered in Step 2
                      </div>
                    </div>
                  </label>

                  {/* Welcome Email */}
                  <label className="flex items-start gap-4 p-6 border-2 border-green-200 bg-green-50 hover:border-green-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={formData.send_welcome_email}
                      onChange={(e) => updateFormData({ send_welcome_email: e.target.checked })}
                      className="mt-1 w-5 h-5 text-green-600 border-gray-300 focus:ring-green-600"
                    />
                    <div>
                      <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Welcome Email
                      </div>
                      <div className="text-sm text-slate-700">
                        Automatically sends a professional welcome email to the client with portal access and next steps
                      </div>
                    </div>
                  </label>
                </div>

                {/* Ready to Complete */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-signal-red">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-navy-900 mb-1">Ready to complete onboarding</div>
                      <div className="text-sm text-slate-700">
                        Click "Complete Onboarding" to create the client record and automatically execute all selected tasks
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {currentStep === 6 && createdClientId && (
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-12 shadow-sm border border-emerald-200/80">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Success Icon */}
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h2 className="text-4xl font-bold text-navy-900 mb-4">
                    Client Onboarding Completed! 🎉
                  </h2>
                  <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
                    <strong>{formData.company_name}</strong> has been successfully onboarded.
                    All selected tasks have been queued and will be processed automatically.
                  </p>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
                    <div className="bg-white p-6 shadow-lg text-left">
                      <div className="text-sm font-semibold text-slate-700 mb-2">Status</div>
                      <div className="text-2xl font-bold text-green-600">Onboarding</div>
                    </div>

                    <div className="bg-white p-6 shadow-lg text-left">
                      <div className="text-sm font-semibold text-slate-700 mb-2">Services</div>
                      <div className="text-lg font-bold text-navy-900">
                        {formData.service_categories.length} selected
                      </div>
                    </div>

                    <div className="bg-white p-6 shadow-lg text-left">
                      <div className="text-sm font-semibold text-slate-700 mb-2">Priority</div>
                      <div className="text-lg font-bold text-navy-900 capitalize">
                        {formData.priority_level}
                      </div>
                    </div>
                  </div>

                  {/* Next Actions */}
                  <div className="bg-white p-8 shadow-lg text-left max-w-3xl mx-auto mb-8">
                    <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      What happens next?
                    </h3>
                    <ul className="space-y-3">
                      {formData.create_portal_account && (
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">Portal account created for <strong>{formData.contact_email}</strong></span>
                        </li>
                      )}
                      {formData.create_first_project && formData.project_name.trim() && (
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">First project <strong>{formData.project_name}</strong> created</span>
                        </li>
                      )}
                      {formData.send_welcome_email && (
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">Welcome email sent to <strong>{formData.contact_email}</strong></span>
                        </li>
                      )}
                      {formData.project_lead_id && (
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">Project lead assigned and notified</span>
                        </li>
                      )}
                      {formData.create_folder_structure && (
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">Project folder structure created</span>
                        </li>
                      )}
                      {formData.schedule_kickoff && (
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">Kickoff meeting scheduled</span>
                        </li>
                      )}
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-slate-700">View full client details and start managing the project</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <Link
                      href={`/dashboard/clients/${createdClientId}`}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white text-lg font-semibold hover:bg-signal-red/90 transition-all duration-200 shadow-lg"
                    >
                      <span>View Client Details</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    
                    <Link
                      href="/dashboard/clients"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-navy-900 text-navy-900 text-lg font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200"
                    >
                      <span>Back to Clients</span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-navy-900 font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Previous</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 shadow-lg"
              >
                <span>Continue</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Complete Onboarding</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

