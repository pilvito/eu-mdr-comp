import React from 'react';
import { ClipboardList, Microscope, FileText, Building2, Globe, Award, Activity } from 'lucide-react';
import ChecklistStep from '../components/ChecklistStep';

export function Step3() {
  return (
    <ChecklistStep 
      stepNumber={3}
      title="Build a Quality Management System (QMS)"
      description="Implement a QMS (e.g. ISO 13485) and establish Software Development Planning (IEC 62304) to ensure a controlled environment for your SaMD."
      icon={ClipboardList}
      prevStep="/step-2"
      nextStep="/step-4"
      tasks={[
        { id: '1', title: 'Design Controls', description: 'Establish procedures for controlling the design of your medical device.' },
        { id: '2', title: 'Risk Management', description: 'Implement ISO 14971 compliant risk management processes.' },
        { id: '3', title: 'Software Dev Planning', description: 'Define responsibilities, tools, and methodologies for software development (IEC 62304 Section 5.1).' },
        { id: '4', title: 'Traceability System', description: 'Setup top-down and bottom-up traceability from requirements to tests (Design Control).' },
        { id: '5', title: 'Supplier Control', description: 'Qualify and evaluate your critical suppliers, including software libraries or SOUPs.' },
        { id: '6', title: 'Document & Configuration Control', description: 'Set up strict versioning, issue tracking, and approval workflows.' }
      ]}
    />
  );
}

export function Step4() {
  return (
    <ChecklistStep 
      stepNumber={4}
      title="Generate Clinical & Safety Evidence"
      description="You must prove your product is safe and effective. Clinical evidence is one of the biggest bottlenecks for startups."
      icon={Microscope}
      prevStep="/step-3"
      nextStep="/step-5"
      tasks={[
        { id: '1', title: 'Clinical Evaluation Plan (CEP)', description: 'Draft a plan on how you will demonstrate safety and performance.' },
        { id: '2', title: 'Literature Review', description: 'Conduct a systematic literature review on equivalent devices.' },
        { id: '3', title: 'Determine Trial Need', description: 'Decide if dedicated clinical trials (investigations) are necessary.' },
        { id: '4', title: 'Risk Management File', description: 'Compile hazard analysis and risk-benefit justification.' },
        { id: '5', title: 'Clinical Evaluation Report (CER)', description: 'Synthesize all data into your final CER.' }
      ]}
    />
  );
}

export function Step5() {
  return (
    <ChecklistStep 
      stepNumber={5}
      title="Prepare Technical Documentation"
      description="This is your core submission package (Tech File), merging system documentation and IEC 62304 software deliverables."
      icon={FileText}
      prevStep="/step-4"
      nextStep="/step-6"
      tasks={[
        { id: '1', title: 'Device Description & Intended Use', description: 'Draft clear specifications, variants, and accessories.' },
        { id: '2', title: 'GSPR Checklist', description: 'Complete General Safety & Performance Requirements checking (Annex I).' },
        { id: '3', title: 'SW Requirements & Architecture', description: 'Document SW Requirements Analysis (5.2) and Architectural Design (5.3).' },
        { id: '4', title: 'SW Unit & Integration Testing', description: 'Implement units (5.5) and perform Integration Testing (5.6).' },
        { id: '5', title: 'SW System Testing & Release', description: 'Validate system meets requirements (5.7) and perform safe release (5.8).' },
        { id: '6', title: 'Labeling & Instructions for Use', description: 'Design MDR-compliant labels and manuals, including software release notes.' }
      ]}
    />
  );
}

export function Step6() {
  return (
    <ChecklistStep 
      stepNumber={6}
      title="Work with a Notified Body"
      description="Required for most devices (Class IIa, IIb, III). They will audit your QMS and technical file."
      icon={Building2}
      prevStep="/step-5"
      nextStep="/step-7"
      tasks={[
        { id: '1', title: 'Select a Notified Body', description: 'Find an NB designated for your specific device code.' },
        { id: '2', title: 'Submit Application', description: 'Send your formal application to the selected NB.' },
        { id: '3', title: 'Stage 1 Audit (QMS Readiness)', description: 'Pass the initial documentation review of your QMS.' },
        { id: '4', title: 'Stage 2 Audit (QMS & Tech File)', description: 'Undergo full on-site (or remote) assessments.' },
        { id: '5', title: 'Address Non-Conformities', description: 'Resolve any findings issued by the auditors.' }
      ]}
    />
  );
}

export function Step7() {
  return (
    <ChecklistStep 
      stepNumber={7}
      title="EU-specific Requirements"
      description="If you're a startup especially outside the EU, these entities are legally mandatory."
      icon={Globe}
      prevStep="/step-6"
      nextStep="/step-8"
      tasks={[
        { id: '1', title: 'Appoint an EU Rep (EC REP)', description: 'Sign an agreement with a representative based in the EU (if outside EU).' },
        { id: '2', title: 'Assign a PRRC', description: 'Appoint a Person Responsible for Regulatory Compliance.' },
        { id: '3', title: 'Obtain a Single Registration Number (SRN)', description: 'Register as a manufacturer in EUDAMED.' },
        { id: '4', title: 'Register Importers/Distributors', description: 'Ensure your economic operators are compliant.' }
      ]}
    />
  );
}

export function Step8() {
  return (
    <ChecklistStep 
      stepNumber={8}
      title="CE mark & Go to Market"
      description="Final steps to launch your product legally in Europe."
      icon={Award}
      prevStep="/step-7"
      nextStep="/step-9"
      tasks={[
        { id: '1', title: 'Receive MDR Certificate', description: 'Obtain your certificate from the Notified Body.' },
        { id: '2', title: 'Sign Declaration of Conformity (DoC)', description: 'Legally declare that you comply with MDR.' },
        { id: '3', title: 'Affix CE Mark', description: 'Apply the CE mark (and NB number) to your product and labeling.' },
        { id: '4', title: 'Register Device in EUDAMED', description: 'Assign Basic UDI-DI and register the device.' },
        { id: '5', title: 'Start Selling', description: 'Launch commercially in the European Union.' }
      ]}
    />
  );
}

export function Step9() {
  return (
    <ChecklistStep 
      stepNumber={9}
      title="Post-Market Surveillance"
      description="MDR is not one-and-done. Continuous monitoring and updates are critical."
      icon={Activity}
      prevStep="/step-8"
      nextStep="/"
      tasks={[
        { id: '1', title: 'Implement PMS Activities', description: 'Regularly collect data on your device in the market.' },
        { id: '2', title: 'Vigilance Reporting', description: 'Setup procedures for reporting serious incidents and FSCA within strict deadlines.' },
        { id: '3', title: 'Post-Market Clinical Follow-up (PMCF)', description: 'Conduct proactive clinical data collection.' },
        { id: '4', title: 'Periodic Safety Update Report (PSUR)', description: 'Draft and submit PSURs for Class IIa/IIb/III devices.' },
        { id: '5', title: 'Annual Surveillance Audits', description: 'Prepare for yearly check-ins from your Notified Body.' }
      ]}
    />
  );
}
