import React from 'react';
import { ListChecks } from 'lucide-react';
import ChecklistStep from '../components/ChecklistStep';
import StepPrerequisiteWarning from '../components/StepPrerequisiteWarning';

export default function SaMDPlanning() {
  return (
    <>
      <StepPrerequisiteWarning stepId="samd" />
      <ChecklistStep
      stepNumber={"IEC 62304"}
      stepId="samd"
      title="Software Development Planning"
      description="Breakdown of development planning per IEC 62304. This step-by-step process builds essential traceability for your Software as a Medical Device (SaMD)."
      icon={ListChecks}
      prevStep="/"
      nextStep="/step-5"
      tasks={[
        { id: '1', title: '1. Responsibilities', description: 'Define who is responsible for what. Map out specific roles: Cybersecurity Expert, DevOps Engineer, Software Engineer, RA/QA, UX/UI, CTO.' },
        { id: '2', title: '2. Project & Doc Planning', description: 'Determine timeline and milestones according to the calculated software safety class (A, B, or C). Outline deliverable scopes.' },
        { id: '3', title: '3. SW Dev Process', description: 'Select your core methodology (Agile, Waterfall, V-Cycle, Scrum, or Hybrid). Incorporate Risk, Problem Resolution, Config Mgmt, and Maintenance.' },
        { id: '4', title: '4. Standards, Methods, Tools', description: 'Document what infrastructure will support the SaMD development (e.g., Jira, GitHub, Azure DevOps, AWS, Confluence).' },
        { id: '5', title: '5. Traceability', description: 'Ensure top-down and bottom-up traceability showing that requirements map to tests, and unit tests map backward across iterations.' },
        { id: '6', title: '6. SW Integration & Testing', description: 'Verify that all planned architectural blocks and SOUPs (Software of Unknown Provenance) are correctly integrated and tested together.' },
        { id: '7', title: '7. SW Verification', description: 'Determine verifiable tasks per release. Set strict milestones and defined acceptance criteria for each software deliverable.' },
        { id: '8', title: '8. Identification & Avoidance of Defects', description: 'Adopt a loop for bug tracking: Identification -> Analysis -> Risk-based approach -> Resolution. Link this with your complaint handling.' },
        { id: '9', title: '9. SW Risk Management', description: 'Perform global Risk Assessment per software item. Define and trace risk control measures closely mapped to ISO 14971.' },
        { id: '10', title: '10. SW Configuration Management', description: 'Define how constituent parts are version controlled. Track changes impacting environment, platforms, and toolchains.' },
        { id: '11', title: '11. SW Maintenance Plan', description: 'Create a systemic issue handling feedback loop. Define how post-release bugs are tracked, root causes are investigated, and hotfixes deployed.' }
      ]}
    />
    </>
  );
}
