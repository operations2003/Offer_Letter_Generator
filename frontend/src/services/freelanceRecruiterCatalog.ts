export interface RecruiterPartyDetails {
  legalName: string;
  tradeName: string;
  legalStatus: string;
  signatoryName: string;
  signatoryTitle: string;
  address: string;
  email: string;
  gstin: string;
  udyam: string;
  phone?: string;
  pan?: string;
  place?: string;
}

export interface RecruiterAgreementSection {
  id: string;
  number: number;
  title: string;
  clauses: {
    id: string;
    number: string;
    title: string;
    content: string;
  }[];
}

export interface RecruiterCommercialRow {
  particulars: string;
  terms: string;
}

export interface RecruiterWitness {
  name: string;
  address: string;
  signatureDate?: string;
}

export interface FreelanceRecruiterAgreementData {
  title: string;
  subtitle: string;
  effectiveDate: string;
  company: RecruiterPartyDetails;
  freelancer: RecruiterPartyDetails;
  sections: RecruiterAgreementSection[];
  witness1: RecruiterWitness;
  witness2: RecruiterWitness;
  commercialTerms: RecruiterCommercialRow[];
  annexureAItems: {
    number: number;
    title: string;
    content: string;
  }[];
}

export const INITIAL_FREELANCE_RECRUITER_DATA: FreelanceRecruiterAgreementData = {
  title: 'FREELANCE RECRUITER SERVICES AGREEMENT',
  subtitle: 'Independent Contractor Engagement',
  effectiveDate: '21 October 2026',
  company: {
    legalName: 'TASKNERA',
    tradeName: 'Tasknera',
    legalStatus: 'Sole proprietorship',
    signatoryName: 'Ms. Sheetal Bedi',
    signatoryTitle: 'Chief Executive Officer',
    address: 'D-57, Dilshad Colony, Delhi – 110095, India',
    email: 'careers@tasknera.com',
    gstin: '07GAAPB5906A1ZD',
    udyam: 'UDYAM-DL-07-0024711',
    place: 'Delhi, India',
  },
  freelancer: {
    legalName: 'Freelancer full legal name',
    tradeName: 'Full legal name / trade name',
    legalStatus: 'Individual / Proprietorship / Firm / Company',
    signatoryName: 'Full legal name',
    signatoryTitle: 'Independent Recruiter',
    address: 'Complete correspondence address',
    email: 'Email address',
    gstin: 'Not registered',
    udyam: 'Not registered',
    phone: '8238308758',
    pan: 'DUUPM7403L',
    place: 'City',
  },
  witness1: {
    name: 'Saloni Bhavin Mehta',
    address: 'B-704, Soham Pride, Pal Surat',
  },
  witness2: {
    name: 'Full name',
    address: 'Address',
  },
  commercialTerms: [
    {
      particulars: 'Effective from',
      terms: '21 October 2026',
    },
    {
      particulars: 'Fixed payout',
      terms:
        'No default payout applies unless expressly entered and agreed in writing. The fixed INR payout for each Assignment must be confirmed by both Parties before sourcing begins. The Assignment Confirmation shall identify the relevant role or JD, the payout per Successful Joining, the payment trigger and any applicable replacement or adjustment terms. If no payout has been agreed, the Freelancer is not required to commence that Assignment and the Company shall not treat sourcing as authorised.',
    },
    {
      particulars: 'Payout timeline',
      terms:
        'Within 14 calendar days after each corresponding Client payment is received in cleared funds. Instalment receipts are paid proportionately within 14 calendar days of each receipt, unless the Parties agree another method in writing. Client payment may take approximately 60 to 90 days from joining, or longer if delayed or disputed.',
    },
    {
      particulars: 'Candidate attribution period',
      terms: '12 months from the date determined under Clause 11.1.',
    },
    {
      particulars: 'Replacement / fee adjustment',
      terms:
        'Where the applicable Client agreement requires a replacement, the Freelancer shall provide reasonable replacement sourcing support for the same Assignment without an additional payout for that replacement, provided this obligation was disclosed in the Assignment Confirmation before sourcing began. Any reduction or recovery of an existing payout shall be permitted only where expressly agreed in writing for that Assignment, supported by a reasonable calculation, proportionate to the actual refund or credit attributable to the placement, and permitted by Applicable Law. No unrelated amount may be deducted.',
    },
  ],
  annexureAItems: [
    {
      number: 1,
      title: 'Candidate authenticity',
      content:
        'Submit only accurate, genuine profiles; do not forge documents, impersonate any person, invent experience or knowingly omit material facts requested for the role.',
    },
    {
      number: 2,
      title: 'Consent and fairness',
      content:
        'Use lawful sourcing methods, describe the role and material terms accurately, and respect Candidate privacy and choice.',
    },
    {
      number: 3,
      title: 'Data minimisation',
      content:
        'Access only the Candidate and Client information needed for the Assignment; do not download, copy or retain data without an approved business need.',
    },
    {
      number: 4,
      title: 'Approved systems',
      content:
        'Use only authorised email, ATS, CRM, trackers and communication channels. Keep credentials secure and do not share them.',
    },
    {
      number: 5,
      title: 'AI and external tools',
      content:
        'Do not provide Confidential Information or Candidate data to public AI tools, unapproved extensions or third-party platforms without written approval.',
    },
    {
      number: 6,
      title: 'Confidentiality',
      content:
        'Do not disclose Client names, Candidate records, fees, internal processes or other non-public commercial details except for the approved recruitment purpose.',
    },
    {
      number: 7,
      title: 'Conflict disclosure',
      content:
        'Promptly disclose any known duplicate submission, material conflict, financial interest or relationship likely to affect the Assignment.',
    },
    {
      number: 8,
      title: 'Professional behaviour',
      content:
        'Treat Candidates, Clients and colleagues with respect. Harassment, unlawful discrimination, bribery, threats, data theft and deliberate misrepresentation are prohibited.',
    },
    {
      number: 9,
      title: 'Return and deletion',
      content:
        'At the end of an Assignment or on request, return or securely delete information as required by Clause 9.5 and confirm completion if asked.',
    },
  ],
  sections: [
    {
      id: 'sec_1',
      number: 1,
      title: 'DEFINITIONS AND INTERPRETATION',
      clauses: [
        {
          id: 'c_1_1',
          number: '1.1',
          title: 'Applicable Law',
          content:
            '“Applicable Law” means all laws, rules, regulations and binding governmental requirements applicable to a Party or to the relevant activity, as amended from time to time.',
        },
        {
          id: 'c_1_2',
          number: '1.2',
          title: 'Assignment',
          content:
            '“Assignment” means a recruitment mandate, job description or requisition that the Company shares with the Freelancer in writing, whether by email, through the Company’s ATS or through another approved channel, and which the Freelancer accepts.',
        },
        {
          id: 'c_1_3',
          number: '1.3',
          title: 'Assignment Confirmation',
          content:
            '“Assignment Confirmation” means the written record, by email, through the Company’s ATS or through another approved channel, of the terms agreed for an Assignment under Clause 5.1, identifying the relevant role or JD, the fixed payout per Successful Joining, the payment trigger and any applicable replacement or adjustment terms.',
        },
        {
          id: 'c_1_4',
          number: '1.4',
          title: 'Business Day',
          content:
            '“Business Day” means a day other than a Saturday, Sunday or public holiday in New Delhi.',
        },
        {
          id: 'c_1_5',
          number: '1.5',
          title: 'Candidate',
          content:
            '“Candidate” means an individual identified, sourced, screened, referred or submitted by the Freelancer in connection with an Assignment.',
        },
        {
          id: 'c_1_6',
          number: '1.6',
          title: 'Client',
          content:
            '“Client” means a customer, prospective customer or hiring employer authorised by the Company for a particular Assignment.',
        },
        {
          id: 'c_1_7',
          number: '1.7',
          title: 'Commercial Terms',
          content:
            '“Commercial Terms” means the terms set out in Schedule 1 and any payout recorded in an Assignment Confirmation, as amended in accordance with Clause 17.3.',
        },
        {
          id: 'c_1_8',
          number: '1.8',
          title: 'Confidential Information',
          content: '“Confidential Information” has the meaning given in Clause 8.1.',
        },
        {
          id: 'c_1_9',
          number: '1.9',
          title: 'Services',
          content: '“Services” means the recruitment services described in Clause 3.',
        },
        {
          id: 'c_1_10',
          number: '1.10',
          title: 'Successful Joining',
          content:
            '“Successful Joining” means a Candidate introduced by the Freelancer for an approved Assignment who actually commences employment or engagement with the designated Client or employer, as evidenced by a joining confirmation, written Client confirmation, approved ATS record or other reasonable contemporaneous record.',
        },
        {
          id: 'c_1_11',
          number: '1.11',
          title: 'Work Product',
          content:
            '“Work Product” means deliverables created specifically for the Company under an Assignment, excluding the Freelancer’s pre-existing materials, independently developed tools and general know-how.',
        },
        {
          id: 'c_1_12',
          number: '1.12',
          title: 'Interpretation and Headings',
          content:
            'Headings are for convenience only. References to Clauses, Schedule 1 and Annexure A are to those of this Agreement, and Schedule 1 and Annexure A form part of it.',
        },
      ],
    },
    {
      id: 'sec_2',
      number: 2,
      title: 'ENGAGEMENT AND INDEPENDENT CONTRACTOR STATUS',
      clauses: [
        {
          id: 'c_2_1',
          number: '2.1',
          title: 'Engagement',
          content:
            'This is a master agreement that governs all Assignments the Company offers to the Freelancer from time to time, and no separate agreement is required for each Assignment. The Company may offer Assignments and the Freelancer may accept or decline them. Work on an Assignment begins once the Company has shared it in writing, the payout has been recorded under Clause 5.1, and the Freelancer has accepted it.',
        },
        {
          id: 'c_2_2',
          number: '2.2',
          title: 'Independent contractor',
          content:
            'The Freelancer is an independent contractor. Subject to agreed deliverables, deadlines, security requirements and Client requirements, the Freelancer controls the manner and sequence of performing the Services and is not bound to a fixed work schedule unless the Parties agree otherwise in writing for a particular Assignment.',
        },
        {
          id: 'c_2_3',
          number: '2.3',
          title: 'No employment or authority',
          content:
            'This Agreement does not create an employment, partnership, joint venture or agency relationship. The Freelancer shall not sign contracts, promise fees, make binding representations or incur liabilities on behalf of the Company or any Client without prior written authority.',
        },
        {
          id: 'c_2_4',
          number: '2.4',
          title: 'Taxes',
          content:
            'The Freelancer is responsible for their own taxes, registrations and filings, subject to any deduction, withholding or reporting that the Company is required by law to make. The Company shall provide the applicable withholding certificates within the statutory timeline.',
        },
        {
          id: 'c_2_5',
          number: '2.5',
          title: 'Non-exclusivity',
          content:
            'The engagement is non-exclusive. The Freelancer may provide services to others, provided they do not misuse Confidential Information, create an undisclosed material conflict affecting an Assignment, or breach Clause 11.',
        },
        {
          id: 'c_2_6',
          number: '2.6',
          title: 'Expenses',
          content:
            'The Freelancer bears their own operating expenses. An expense is reimbursable only if the Company approved it in writing before it was incurred and the Freelancer provides reasonable supporting evidence.',
        },
      ],
    },
    {
      id: 'sec_3',
      number: 3,
      title: 'SCOPE OF SERVICES',
      clauses: [
        {
          id: 'c_3_1',
          number: '3.1',
          title: 'Services',
          content:
            'For each accepted Assignment, and to the extent stated in the Assignment or the Company’s written instructions, the Freelancer may be required to: (a) identify and source suitable Candidates through approved channels and platforms; (b) review resumes and conduct preliminary screening against the stated requirements; (c) confirm Candidate interest and availability, and submit accurate profiles through approved channels; (d) coordinate interviews, collect feedback, support offer-stage communication and follow up on joining; (e) maintain accurate Candidate status records in the Company’s approved ATS, CRM or tracker; and (f) carry out market mapping, talent-pipeline development or other recruitment tasks expressly agreed for the Assignment.',
        },
        {
          id: 'c_3_2',
          number: '3.2',
          title: 'Assignment limits',
          content:
            'The Freelancer shall work only on mandates assigned or approved by the Company and shall not represent that a role, salary, Client or offer is confirmed unless the Company or the hiring employer has confirmed it.',
        },
        {
          id: 'c_3_3',
          number: '3.3',
          title: 'No guarantee',
          content:
            'The Freelancer does not guarantee that any Candidate will be selected, accept an offer, join or remain in employment. The Company does not guarantee any minimum volume of Assignments or placements.',
        },
      ],
    },
    {
      id: 'sec_4',
      number: 4,
      title: 'OBLIGATIONS OF THE PARTIES',
      clauses: [
        {
          id: 'c_4_1',
          number: '4.1',
          title: 'Candidate integrity',
          content:
            'The Freelancer shall provide genuine and accurate information; shall not fabricate or materially alter any resume; shall check for obvious duplication; shall record Candidate consent where required; and shall promptly disclose any known issue that may affect a hiring decision.',
        },
        {
          id: 'c_4_2',
          number: '4.2',
          title: 'Professional conduct',
          content:
            'The Freelancer shall communicate respectfully with Candidates, Clients and Company personnel, shall not misrepresent the role, employer, compensation, location or hiring status, and shall follow lawful and non-discriminatory recruitment practices.',
        },
        {
          id: 'c_4_3',
          number: '4.3',
          title: 'Records and updates',
          content:
            'The Freelancer shall maintain accurate records and provide reasonable progress updates at the intervals stated for the Assignment. Any volume or turnaround target is a delivery target for that Assignment and not a fixed working schedule.',
        },
        {
          id: 'c_4_4',
          number: '4.4',
          title: 'Approved channels',
          content:
            'Candidate profiles and Client-facing communications shall be sent only through channels authorised by the Company. The Freelancer shall not discuss or vary the Company’s Client fees, business terms or contractual commitments without prior written authority.',
        },
        {
          id: 'c_4_5',
          number: '4.5',
          title: 'Company inputs',
          content:
            'The Company shall share each Assignment and its requirements in writing, record the agreed payout in the Assignment Confirmation, inform the Freelancer of material changes it receives from the Client, and pay amounts due under Clauses 5 and 6 on the terms of this Agreement.',
        },
        {
          id: 'c_4_6',
          number: '4.6',
          title: 'No charges to Candidates',
          content:
            'The Freelancer shall not charge or accept any fee, commission, gift or benefit from a Candidate in connection with sourcing, submission, interviews or placement.',
        },
      ],
    },
    {
      id: 'sec_5',
      number: 5,
      title: 'FIXED COMPENSATION',
      clauses: [
        {
          id: 'c_5_1',
          number: '5.1',
          title: 'Fixed Assignment-specific payout',
          content:
            'For each Assignment, the Company and the Freelancer shall agree in writing on a fixed payout amount in Indian Rupees for each Successful Joining. Unless expressly agreed otherwise in writing, the payout shall not be calculated as a percentage of the Candidate’s salary or annual CTC. The agreed amount shall be recorded in the Assignment Confirmation before sourcing begins. Any change shall require written acceptance by both Parties.',
        },
        {
          id: 'c_5_2',
          number: '5.2',
          title: 'No default payout',
          content:
            'No default payout applies unless expressly entered and agreed in writing. If no payout has been agreed for an Assignment, the Freelancer is not required to commence that Assignment and the Company shall not treat sourcing as authorised.',
        },
        {
          id: 'c_5_3',
          number: '5.3',
          title: 'Changes to rates',
          content:
            'The Commercial Terms, including any agreed payout, may be changed only in writing under Clause 17.3. A change applies only to Assignments shared after the change takes effect. Assignments already accepted continue on the Commercial Terms in force when they were accepted.',
        },
        {
          id: 'c_5_4',
          number: '5.4',
          title: 'Eligibility',
          content:
            'The payout becomes payable only when (a) the Candidate achieves a Successful Joining; (b) the joining is reasonably verified; (c) the Company has received the corresponding Client fee in cleared funds, or valid evidence of tax lawfully deducted at source on its behalf; and (d) the Freelancer has materially complied with the Assignment requirements and this Agreement. Where the Client pays in instalments, the corresponding portion of the payout becomes payable under Clause 6.',
        },
        {
          id: 'c_5_5',
          number: '5.5',
          title: 'No assured income',
          content:
            'No salary, retainer, minimum earnings or minimum number of Assignments or placements is promised unless separately agreed in writing.',
        },
        {
          id: 'c_5_6',
          number: '5.6',
          title: 'Invalid submissions and refunds',
          content:
            'No fee is payable for a Candidate who does not join. Where reasonable records show that a placement resulted from the Freelancer’s fraud, fabricated profile, knowing material misrepresentation, deliberate duplicate submission or material unauthorised disclosure, the Company may dispute the related fee and recover its direct loss, after written notice, a reasonable opportunity to respond, and subject to Applicable Law. Where the Company is required to refund or credit a Client fee, or to provide a replacement, an existing payout may be reduced or recovered only where expressly agreed in writing for that Assignment. Any reduction or recovery must be supported by a reasonable calculation, be proportionate to the actual refund or credit attributable to the placement, and be permitted by Applicable Law. A replacement request by itself does not entitle the Company to recover a payout already earned.',
        },
        {
          id: 'c_5_7',
          number: '5.7',
          title: 'No unrelated set-off',
          content:
            'The Company shall not deduct any unrelated amount from a payout. The Freelancer shall cooperate in good faith to resolve any fee dispute.',
        },
        {
          id: 'c_5_8',
          number: '5.8',
          title: 'Acknowledgement of payment condition',
          content:
            'The Freelancer acknowledges that payout is conditional on the Company receiving the corresponding Client fee, as set out in Clause 6. The Freelancer understands that Client payment may take approximately 60 to 90 days or longer, and that delayed or non-payment may delay or prevent the corresponding payout, subject to the safeguards and obligations expressly stated in this Agreement.',
        },
      ],
    },
    {
      id: 'sec_6',
      number: 6,
      title: 'PAYMENT AND TAX DOCUMENTATION',
      clauses: [
        {
          id: 'c_6_1',
          number: '6.1',
          title: 'Payment condition',
          content:
            'The Freelancer’s payout is conditional on a Successful Joining and on the Company receiving the corresponding Client fee in cleared funds, or valid evidence of tax lawfully deducted at source. Unless the Parties agree otherwise in writing, the Company is not required to pay in advance of receiving the Client’s payment.',
        },
        {
          id: 'c_6_2',
          number: '6.2',
          title: 'Payment timeline',
          content:
            'The Company shall pay the agreed payout within fourteen (14) calendar days after receiving the corresponding Client payment in cleared funds, subject to receipt of the Freelancer’s payment details and tax documentation. Where the Client pays in instalments, the Company shall pay a proportionate part of the payout within fourteen (14) calendar days after each receipt, calculated as the agreed payout multiplied by the net Client payment received, divided by the total net fee due for that placement, unless the Parties agree another method in writing. The total paid shall not exceed the agreed payout. GST and other indirect taxes charged to the Client are excluded from this calculation, and tax deducted at source and supported by valid documentation is treated as received.',
        },
        {
          id: 'c_6_3',
          number: '6.3',
          title: 'Client payment cycle',
          content:
            'The Client may pay the Company approximately sixty (60) to ninety (90) calendar days after the Candidate joins or the Client invoice is raised. This is an estimate and not a maximum; payment may take longer if the Client delays, disputes or withholds it. The Company shall invoice the Client promptly in accordance with the Client contract, use commercially reasonable efforts to recover overdue amounts, and on request, or approximately every thirty (30) calendar days while a material amount is overdue, give the Freelancer a reasonable status update, subject to confidentiality. The Company shall not deliberately delay invoicing, abandon reasonable collection efforts, waive a fee without a bona fide commercial reason, or structure a settlement primarily to avoid the payout. If the Client does not pay despite reasonable collection efforts, and the non-payment was not materially caused by the Company’s own conduct of that kind, the unpaid portion of the payout is not due unless the Parties agree otherwise in writing. Where non-payment is materially caused by such conduct, the Company may not rely on Clause 6.1 to avoid paying the amount that would reasonably have been recovered, subject to evidence and Applicable Law.',
        },
        {
          id: 'c_6_4',
          number: '6.4',
          title: 'Verification and method',
          content:
            'The Company may request reasonable records to verify joining, Candidate attribution or tax requirements. The Freelancer shall issue a valid invoice or payment request where required by law or by the Company’s documented accounting process. Payment shall be made by electronic transfer to the bank account the Freelancer designates through the Company’s secure onboarding process, and the Freelancer shall promptly notify any change. The Company is not responsible for delay caused by incorrect details or missing documents, provided it notifies the Freelancer of the issue.',
        },
        {
          id: 'c_6_5',
          number: '6.5',
          title: 'TDS and GST',
          content:
            'The Company may deduct tax at source where required by law and shall issue the applicable certificate within the statutory timeline. GST or any other indirect tax is payable only where legally applicable and supported by valid registration and tax documentation.',
        },
        {
          id: 'c_6_6',
          number: '6.6',
          title: 'Payment disputes',
          content:
            'A Party disputing a payment shall give written notice stating the amount, Assignment reference and reasons, and the Parties shall seek to resolve the dispute promptly. Any undisputed amount for which Clauses 6.1 and 6.2 are satisfied remains payable on schedule.',
        },
      ],
    },
    {
      id: 'sec_7',
      number: 7,
      title: 'PERFORMANCE REVIEW AND CHANGES',
      clauses: [
        {
          id: 'c_7_1',
          number: '7.1',
          title: 'Assignment standards',
          content:
            'Deliverables, Candidate quality criteria, deadlines, reporting intervals and any volume targets are those recorded in the relevant Assignment or later agreed in writing. A general historical target is not binding unless accepted for a particular Assignment.',
        },
        {
          id: 'c_7_2',
          number: '7.2',
          title: 'Review and corrective action',
          content:
            'The Company may give reasonable feedback where Candidate quality, accuracy, response times or process compliance fall short of agreed requirements, and may pause or reassign future work. Except in cases of fraud, serious security risk or other material misconduct, the Freelancer shall have a reasonable opportunity to remedy a curable concern.',
        },
        {
          id: 'c_7_3',
          number: '7.3',
          title: 'Changes',
          content:
            'Material changes to Assignment scope, fee trigger, timelines or replacement conditions require written agreement, and changes to payout are governed by Clause 5.3. The Company may close or pause an Assignment; closure does not affect the Freelancer’s eligibility for a Successful Joining arising from an accepted Assignment, subject to Clause 6 and any agreed adjustment.',
        },
      ],
    },
    {
      id: 'sec_8',
      number: 8,
      title: 'CONFIDENTIALITY',
      clauses: [
        {
          id: 'c_8_1',
          number: '8.1',
          title: 'Confidential Information',
          content:
            '“Confidential Information” means all non-public information of the Company or its Clients disclosed to or accessed by the Freelancer, including Candidate and Client details, resumes, interview notes, databases, ATS and CRM records, fees, pricing, job requirements, operating procedures, business plans, training materials, credentials, commercial correspondence, and any other information that is marked confidential or would reasonably be understood to be confidential.',
        },
        {
          id: 'c_8_2',
          number: '8.2',
          title: 'Use and protection',
          content:
            'The Freelancer shall use Confidential Information only to perform an approved Assignment; protect it with at least the same care as the Freelancer uses for their own confidential information, and no less than reasonable care; limit access to persons who need it for the Assignment; and not disclose it to any third party without the Company’s written approval, except as required by law.',
        },
        {
          id: 'c_8_3',
          number: '8.3',
          title: 'Exclusions',
          content:
            'Confidential Information does not include information that the Freelancer can show (a) was public otherwise than through breach; (b) was lawfully known to the Freelancer without restriction before disclosure; (c) was independently developed without use of the Company’s information; or (d) was lawfully received from a third party without a duty of confidence.',
        },
        {
          id: 'c_8_4',
          number: '8.4',
          title: 'Compelled disclosure',
          content:
            'If disclosure is required by law or by a competent authority, the Freelancer may disclose only what is legally required and, where lawful and practicable, shall first give the Company notice so that it may seek protective treatment.',
        },
        {
          id: 'c_8_5',
          number: '8.5',
          title: 'Duration',
          content:
            'These obligations continue throughout this Agreement and for five (5) years after it ends. Trade secrets remain protected for as long as they qualify as trade secrets under Applicable Law, and personal data remains subject to applicable data-protection obligations.',
        },
      ],
    },
    {
      id: 'sec_9',
      number: 9,
      title: 'CANDIDATE DATA, PRIVACY AND INFORMATION SECURITY',
      clauses: [
        {
          id: 'c_9_1',
          number: '9.1',
          title: 'Purpose limitation',
          content:
            'Candidate personal data may be collected, accessed, used or shared only for an authorised recruitment purpose and in accordance with Applicable Law, including the Digital Personal Data Protection Act, 2023 and the rules made under it, to the extent in force.',
        },
        {
          id: 'c_9_2',
          number: '9.2',
          title: 'Lawful sourcing',
          content:
            'The Freelancer shall use authorised sourcing methods and take reasonable steps to ensure that Candidate data is lawfully obtained and shared for the relevant recruitment purpose, and shall not falsely claim to have obtained consent or any other required permission.',
        },
        {
          id: 'c_9_3',
          number: '9.3',
          title: 'Security',
          content:
            'The Freelancer shall use the systems approved by the Company, protect login credentials, enable available security controls, avoid unnecessary local downloads, and not send Candidate or Client data to unauthorised email accounts, storage services, public AI tools or other external platforms without the Company’s prior written approval.',
        },
        {
          id: 'c_9_4',
          number: '9.4',
          title: 'Incident notification',
          content:
            'The Freelancer shall notify the Company without undue delay, and where practicable within twenty-four (24) hours of becoming aware, of any suspected unauthorised access, loss, disclosure, misuse or compromise involving Company, Client or Candidate information, and shall assist reasonably with containment and remediation.',
        },
        {
          id: 'c_9_5',
          number: '9.5',
          title: 'Return and deletion',
          content:
            'On request or on termination, the Freelancer shall return or securely delete all Company and Client information within five (5) Business Days, except for copies required by law or held in routine secure backups that are not readily accessible. Any retained copy remains subject to this Agreement and shall not be used for any other purpose.',
        },
      ],
    },
    {
      id: 'sec_10',
      number: 10,
      title: 'INTELLECTUAL PROPERTY',
      clauses: [
        {
          id: 'c_10_1',
          number: '10.1',
          title: 'Background Materials',
          content:
            'The Freelancer retains ownership of tools, templates, methods, know how and other intellectual property owned before, or developed independently of, an Assignment (“Background Materials”). The Company retains ownership of its brand, systems, databases, processes, templates and materials.',
        },
        {
          id: 'c_10_2',
          number: '10.2',
          title: 'Work Product',
          content:
            'To the extent permitted by law, and in consideration of the payout for the relevant Assignment, the Freelancer assigns to the Company, with effect on payment of that fee, all transferable rights in the Work Product created for that Assignment, including the right to reproduce, adapt, modify, distribute and use it in the Company’s business, worldwide and for the full term of protection. The Parties shall identify any deliverable that requires a separate formal assignment and shall sign it where legally necessary.',
        },
        {
          id: 'c_10_3',
          number: '10.3',
          title: 'Embedded materials',
          content:
            'If Background Materials are incorporated into Work Product, the Freelancer grants the Company a worldwide, non-exclusive, royalty-free licence to use, reproduce, adapt and distribute them only as necessary to use and exploit that Work Product in the Company’s business and Client deliverables.',
        },
        {
          id: 'c_10_4',
          number: '10.4',
          title: 'Third-party materials',
          content:
            'The Freelancer shall not knowingly include in any Work Product material that infringes third-party rights or carries undisclosed licence restrictions, and shall disclose any third-party or open-source material included where relevant.',
        },
        {
          id: 'c_10_5',
          number: '10.5',
          title: 'Further assurance',
          content:
            'At the Company’s reasonable request, the Freelancer shall sign such documents as are reasonably necessary to give effect to this Clause 10, provided they impose no obligations inconsistent with this Agreement.',
        },
      ],
    },
    {
      id: 'sec_11',
      number: 11,
      title: 'CANDIDATE ATTRIBUTION AND NON-CIRCUMVENTION',
      clauses: [
        {
          id: 'c_11_1',
          number: '11.1',
          title: 'Attribution period',
          content:
            'A Candidate introduced by the Freelancer for an Assignment is attributed to the Freelancer for the period stated in Schedule 1, which is twelve (12) months unless Schedule 1 states a longer period. The period starts on the later of (a) the Freelancer’s first verifiable submission to the Company for that Assignment and (b) the Company’s first verifiable submission of the Candidate to the Client. If a Client contract gives the Company a longer candidate-protection period, that period applies to an Assignment only if the Company notifies the Freelancer of its duration and start event in writing before the Freelancer accepts that Assignment; the Company need not disclose the Client contract itself. Attribution is subject to Clause 11.2 and continues after termination for the remainder of the applicable period.',
        },
        {
          id: 'c_11_2',
          number: '11.2',
          title: 'Duplicate or prior submission',
          content:
            'If the Company or the Client reasonably believes that a Candidate was already submitted or under active consideration before the Freelancer’s submission, the Company shall, where practicable, notify the Freelancer within five (5) Business Days of identifying the issue, and the Parties shall review the dated records in good faith. Attribution shall follow the earliest verifiable submission or any other written rule accepted for the Assignment. A Candidate’s name alone, without supporting records, is not conclusive evidence of a prior submission.',
        },
        {
          id: 'c_11_3',
          number: '11.3',
          title: 'No fee circumvention',
          content:
            'While this Agreement is in force, the Freelancer shall not use the Company’s Confidential Information or an Assignment-specific introduction to divert an active Company mandate, conceal a placement, or arrange a direct transaction intended primarily to avoid a fee properly payable to the Company.',
        },
        {
          id: 'c_11_4',
          number: '11.4',
          title: 'No general restraint',
          content:
            'Nothing in this Agreement prevents the Freelancer from practising recruitment generally, working for other businesses or serving clients independently, provided the Freelancer does not misuse Confidential Information, infringe intellectual property, misappropriate Candidate data or breach Clause 11.3. This Clause protects legitimate confidential and commercial interests and is not a non-compete.',
        },
        {
          id: 'c_11_5',
          number: '11.5',
          title: 'Records',
          content:
            'Records created or maintained in the Company’s systems using Company or Client information remain subject to the Company’s confidentiality and data-protection rights. The Freelancer may retain their general skills, experience and non-confidential know-how but shall not extract or use Candidate data or Client records for unrelated commercial gain.',
        },
      ],
    },
    {
      id: 'sec_12',
      number: 12,
      title: 'CONFLICTS OF INTEREST AND EXTERNAL COMMUNICATION',
      clauses: [
        {
          id: 'c_12_1',
          number: '12.1',
          title: 'Conflict disclosure',
          content:
            'The Freelancer shall promptly disclose any known material conflict that could affect an Assignment, including a competing submission of the same Candidate, a personal financial interest in a hiring decision, or a relationship that may reasonably affect objective screening.',
        },
        {
          id: 'c_12_2',
          number: '12.2',
          title: 'External communication',
          content:
            'The Freelancer may accurately describe the engagement as freelance recruitment work for the Company, but shall not publish Confidential Information, internal metrics, Candidate information or pricing without written authorisation. Client-facing communication shall use the channels and authority approved for the Assignment.',
        },
        {
          id: 'c_12_3',
          number: '12.3',
          title: 'Honest dealing',
          content:
            'The Parties shall communicate honestly and professionally. Nothing in this Agreement prohibits a good-faith complaint, a truthful statement required by law, cooperation with a lawful investigation, or the assertion of legal rights. Neither Party shall knowingly make materially false statements about the other or about a Client.',
        },
      ],
    },
    {
      id: 'sec_13',
      number: 13,
      title: 'COMPLIANCE AND PROFESSIONAL CONDUCT',
      clauses: [
        {
          id: 'c_13_1',
          number: '13.1',
          title: 'Legal compliance',
          content:
            'Each Party shall comply with the laws applicable to its own activities under this Agreement. The Freelancer shall follow the security, privacy, anti-bribery and recruitment integrity rules that the Company provides in writing for an Assignment.',
        },
        {
          id: 'c_13_2',
          number: '13.2',
          title: 'Prohibited conduct',
          content:
            'The Freelancer shall not fabricate Candidate details, forge documents, impersonate a Candidate or Client representative, solicit unlawful payments from Candidates, discriminate unlawfully, harass any person, or submit a Candidate profile without the required authorisation.',
        },
        {
          id: 'c_13_3',
          number: '13.3',
          title: 'AI and third-party tools',
          content:
            'The Freelancer shall not upload Confidential Information or Candidate data to a public AI tool or unauthorised external system without the Company’s prior written approval. Approved tools may be used only for the permitted purpose and in accordance with Clause 9.',
        },
      ],
    },
    {
      id: 'sec_14',
      number: 14,
      title: 'REPRESENTATIONS, INDEMNITY AND LIABILITY',
      clauses: [
        {
          id: 'c_14_1',
          number: '14.1',
          title: 'Authority and accuracy',
          content:
            'Each Party represents that it has authority to enter into this Agreement. The Freelancer shall not knowingly give materially false information about a Candidate or state that an action has been completed when it has not.',
        },
        {
          id: 'c_14_2',
          number: '14.2',
          title: 'Freelancer indemnity',
          content:
            'To the extent permitted by law, the Freelancer shall indemnify the Company against direct losses and reasonable third-party costs, finally awarded by a competent tribunal or included in a settlement approved in writing by the Freelancer, to the extent directly caused by the Freelancer’s fraud, wilful misconduct, knowing material misrepresentation, material breach of confidentiality or data-protection obligations, deliberate misuse of Candidate or Client data, or infringement of third-party intellectual property.',
        },
        {
          id: 'c_14_3',
          number: '14.3',
          title: 'Company indemnity',
          content:
            'To the extent permitted by law, the Company shall indemnify the Freelancer against direct losses and reasonable third-party costs, finally awarded by a competent tribunal or included in a settlement approved in writing by the Company, to the extent directly caused by the Company’s fraud, wilful misconduct or material breach of its express confidentiality or data-protection obligations. Nothing in this Agreement limits the Company’s obligation to pay a payout that has become due under Clauses 5 and 6.',
        },
        {
          id: 'c_14_4',
          number: '14.4',
          title: 'Procedure',
          content:
            'A Party seeking indemnity shall give prompt written notice, cooperate reasonably, and allow the other Party a reasonable opportunity to participate in the defence. No settlement may impose any admission, payment or continuing obligation on the other Party without that Party’s written consent.',
        },
        {
          id: 'c_14_5',
          number: '14.5',
          title: 'Limitation of liability',
          content:
            'To the extent permitted by law, neither Party is liable to the other for indirect or consequential loss, loss of anticipated profit or loss of opportunity. Subject to the exceptions below, each Party’s aggregate liability for direct loss under this Agreement shall not exceed the greater of (a) the total payouts paid or payable under this Agreement in the twelve (12) months before the event giving rise to the claim, and (b) the total payouts payable for the Assignments giving rise to the claim. This cap does not apply to fraud or wilful misconduct, deliberate or grossly negligent misuse or disclosure of Confidential Information or personal data, infringement or misappropriation of intellectual property, payouts that have become due, or any liability that cannot lawfully be limited.',
        },
      ],
    },
    {
      id: 'sec_15',
      number: 15,
      title: 'TERM, TERMINATION AND HANDOVER',
      clauses: [
        {
          id: 'c_15_1',
          number: '15.1',
          title: 'Term',
          content:
            'This Agreement begins on the Effective Date and continues for twelve (12) months unless terminated earlier. It may be renewed by written agreement.',
        },
        {
          id: 'c_15_2',
          number: '15.2',
          title: 'Termination for convenience',
          content:
            'Either Party may terminate this Agreement on seven (7) calendar days’ written notice. Either Party may also end an individual Assignment in writing, which does not terminate the Agreement as a whole.',
        },
        {
          id: 'c_15_3',
          number: '15.3',
          title: 'Termination for breach',
          content:
            'A Party may terminate this Agreement for a material breach by the other that is not cured within seven (7) calendar days of written notice, where the breach is capable of cure. The Company may suspend access or terminate immediately where reasonably necessary to respond to fraud, fabricated submissions, a material data or security incident, unlawful conduct or serious misuse of systems, giving notice where lawful and practicable.',
        },
        {
          id: 'c_15_4',
          number: '15.4',
          title: 'Payout after termination',
          content:
            'Termination does not affect the Freelancer’s eligibility for a Candidate introduced under an accepted Assignment before termination who achieves a Successful Joining within the applicable attribution period. Any such payout remains subject to Clauses 5 and 6 and the Commercial Terms. No fee is payable for unearned or speculative future placements.',
        },
        {
          id: 'c_15_5',
          number: '15.5',
          title: 'Exit obligations',
          content:
            'On termination or on request, the Freelancer shall stop using Company and Client systems, return property and credentials, provide a reasonable handover of open Candidate status, and return or delete Confidential Information in accordance with Clause 9.5.',
        },
        {
          id: 'c_15_6',
          number: '15.6',
          title: 'Survival',
          content:
            'Clauses 5, 6, 8, 9, 10, 11, 14, 15.4, 15.5, 16 and 17, and any other provision which by its nature is intended to survive, continue after termination or expiry.',
        },
      ],
    },
    {
      id: 'sec_16',
      number: 16,
      title: 'GOVERNING LAW AND DISPUTE RESOLUTION',
      clauses: [
        {
          id: 'c_16_1',
          number: '16.1',
          title: 'Good-faith resolution',
          content:
            'The Parties shall first try to resolve any dispute through discussions between authorised representatives within fifteen (15) calendar days of written notice of the dispute.',
        },
        {
          id: 'c_16_2',
          number: '16.2',
          title: 'Arbitration',
          content:
            'An unresolved dispute shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, as amended. The tribunal shall consist of a sole arbitrator appointed by mutual agreement or, failing agreement, in accordance with Applicable Law.',
        },
        {
          id: 'c_16_3',
          number: '16.3',
          title: 'Seat and language',
          content:
            'The seat of arbitration shall be New Delhi, India, and the proceedings shall be conducted in English. Either Party may seek interim or protective relief from a competent court where permitted by law.',
        },
        {
          id: 'c_16_4',
          number: '16.4',
          title: 'Governing law',
          content:
            'This Agreement is governed by the laws of India. Subject to Clause 16.2, the courts at New Delhi have jurisdiction over any court proceedings that may lawfully be brought.',
        },
      ],
    },
    {
      id: 'sec_17',
      number: 17,
      title: 'GENERAL PROVISIONS',
      clauses: [
        {
          id: 'c_17_1',
          number: '17.1',
          title: 'Entire agreement',
          content:
            'This Agreement, including Schedule 1 and Annexure A, is the entire agreement between the Parties on its subject matter and supersedes all prior discussions on it.',
        },
        {
          id: 'c_17_2',
          number: '17.2',
          title: 'Order of precedence',
          content:
            'If there is any inconsistency between the Clauses and Schedule 1 or Annexure A, the Clauses prevail, except that Schedule 1 prevails on the attribution period and the replacement and adjustment terms it states.',
        },
        {
          id: 'c_17_3',
          number: '17.3',
          title: 'Amendments',
          content:
            'An amendment to this Agreement, including the Commercial Terms, must be in writing and signed, or accepted by email, by authorised representatives of both Parties. Routine operational messages do not amend this Agreement unless they clearly identify the change and the Clause or Schedule affected.',
        },
        {
          id: 'c_17_4',
          number: '17.4',
          title: 'Assignment and subcontracting',
          content:
            'The Freelancer shall not assign this Agreement or subcontract an Assignment without the Company’s prior written consent. The Company may transfer this Agreement to a lawful successor of its relevant business on written notice.',
        },
        {
          id: 'c_17_5',
          number: '17.5',
          title: 'Notices and execution',
          content:
            'Formal notices may be sent by email to the addresses stated in this Agreement, or to any updated address notified in writing. This Agreement may be signed electronically or in counterparts where legally valid.',
        },
        {
          id: 'c_17_6',
          number: '17.6',
          title: 'Severability and waiver',
          content:
            'If any provision is held unenforceable, it shall be limited to the minimum extent necessary and the remainder of this Agreement continues in effect. Delay in exercising a right is not a waiver of it.',
        },
        {
          id: 'c_17_7',
          number: '17.7',
          title: 'Third-party rights',
          content:
            'Except as expressly stated or required by law, this Agreement confers rights only on the Parties and their permitted successors.',
        },
        {
          id: 'c_17_8',
          number: '17.8',
          title: 'Force majeure',
          content:
            'Neither Party is liable for delay caused by events beyond its reasonable control, provided it gives notice where practicable and takes reasonable steps to mitigate the effect. This does not excuse payment obligations that have already accrued.',
        },
      ],
    },
  ],
};

export function getDeepCloneFreelanceRecruiterData(): FreelanceRecruiterAgreementData {
  return JSON.parse(JSON.stringify(INITIAL_FREELANCE_RECRUITER_DATA));
}
