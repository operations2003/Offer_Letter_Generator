// =============================================================================
// MASTER RECRUITMENT SERVICES AGREEMENT (MRSA / MSA) CATALOG & DATA MODEL
// =============================================================================
// Faithful reproduction of the 21-page Master Recruitment Services Agreement
// between Client (e.g. Bozzo Cabs) and Tasknera (Recruitment Services Provider).
// =============================================================================

export interface MrsaPartyInfo {
  legalName: string;
  tradeName: string;
  legalForm: string;
  signatoryName: string;
  signatoryDesignation: string;
  registeredAddress: string;
  cinNumber: string;
  udyamNumber: string;
  gstin: string;
  email: string;
  phone: string;
}

export interface MrsaSummaryRow {
  id: string;
  label: string;
  content: string;
}

export interface MrsaRecitalItem {
  id: string;
  number: number;
  content: string;
}

export interface MrsaSubclause {
  id: string;
  clauseId: string; // e.g. "1.1", "3.1(a)"
  text: string;
}

export interface MrsaClauseItem {
  id: string;
  clauseNumber: string; // e.g. "1.1", "2.1"
  title: string;
  paragraphs: string[];
  subclauses?: MrsaSubclause[];
}

export interface MrsaSectionItem {
  id: string;
  number: number;
  title: string;
  clauses: MrsaClauseItem[];
}

export interface MrsaCommercialRow {
  id: string;
  term: string;
  masterTerms: string;
}

export interface MrsaSecurityItem {
  id: string;
  code: string; // e.g. "B.1", "B.2"
  title: string;
  content: string;
}

export interface MrsaWitnessInfo {
  name: string;
  address: string;
  signatureDate: string;
}

export interface MrsaAgreementData {
  documentTitle: string;
  documentSubtitle: string;
  agreementNumber: string;
  effectiveDate: string;
  client: MrsaPartyInfo;
  serviceProvider: MrsaPartyInfo;
  executiveSummary: MrsaSummaryRow[];
  recitals: MrsaRecitalItem[];
  sections: MrsaSectionItem[];
  scheduleA: MrsaCommercialRow[];
  scheduleBIntro: string;
  scheduleB: MrsaSecurityItem[];
  clientSignatoryPlace: string;
  clientSignatoryDate: string;
  taskneraSignatoryPlace: string;
  taskneraSignatoryDate: string;
  witness1: MrsaWitnessInfo;
  witness2: MrsaWitnessInfo;
}

export const INITIAL_MRSA_DATA: MrsaAgreementData = {
  documentTitle: 'MASTER RECRUITMENT SERVICES AGREEMENT',
  documentSubtitle: 'Recruitment, Talent Acquisition & Candidate Sourcing Services',
  agreementNumber: 'TASK/MRSA/2026/001',
  effectiveDate: 'October 10, 2026',
  client: {
    legalName: 'BOZZO CABS PRIVATE LIMITED',
    tradeName: 'Bozzo Cabs',
    legalForm: 'Private Limited Company',
    signatoryName: 'Authorised Signatory',
    signatoryDesignation: 'Director / Authorised Signatory',
    registeredAddress: 'Plot No. 42, Hitech City Phase II, Madhapur, Hyderabad, Telangana – 500081, India',
    cinNumber: 'U63090TG2023PTC178942',
    udyamNumber: 'UDYAM-TS-02-0045812',
    gstin: '36AAGCB9812A1Z4',
    email: 'partnerships@bozzocabs.com',
    phone: '+91 9849012345',
  },
  serviceProvider: {
    legalName: 'TASKNERA',
    tradeName: 'Tasknera (trade name)',
    legalForm: 'Sole Proprietorship',
    signatoryName: 'Ms. Sheetal Bedi',
    signatoryDesignation: 'Proprietor / CEO',
    registeredAddress: 'D-57 F1, Dilshad Colony, Dilshad Garden, Delhi – 110095, India',
    cinNumber: 'Not applicable (sole proprietorship)',
    udyamNumber: 'UDYAM-DL-07-0024711',
    gstin: '07GAAPB5906A1ZD',
    email: 'sheetalbedi@tasknera.com',
    phone: '+91 9312506515',
  },
  executiveSummary: [
    {
      id: 'sum_1',
      label: 'Client',
      content: 'Bozzo Cabs, the client / hiring company, which directly employs or engages the selected Candidates.',
    },
    {
      id: 'sum_2',
      label: 'Service Provider',
      content: 'Tasknera, an independent recruitment services provider and vendor to Bozzo Cabs.',
    },
    {
      id: 'sum_3',
      label: 'Relationship',
      content:
        'Independent vendor and client relationship for recruitment services only. It is not a partnership, joint venture, agency, franchise, staffing or manpower arrangement, or employment relationship.',
    },
    {
      id: 'sum_4',
      label: 'Services',
      content:
        'Candidate sourcing, screening, shortlisting, interview coordination, offer-stage coordination and joining follow-up.',
    },
    {
      id: 'sum_5',
      label: 'Term',
      content:
        'Three (3) years from the Effective Date, unless terminated earlier; accrued rights and fee protection survive as provided in this Agreement.',
    },
  ],
  recitals: [
    {
      id: 'rec_1',
      number: 1,
      content:
        'Bozzo Cabs is engaged in business and, from time to time, requires to hire employees, consultants or other personnel directly.',
    },
    {
      id: 'rec_2',
      number: 2,
      content:
        'Tasknera is an independent recruitment services provider offering candidate sourcing, talent acquisition, screening, coordination and related recruitment support services.',
    },
    {
      id: 'rec_3',
      number: 3,
      content:
        'Bozzo Cabs wishes to engage Tasknera as a non-exclusive recruitment services provider on the terms of this Agreement, and Tasknera agrees to provide such services on an assignment-by-assignment basis. Bozzo Cabs will directly employ or engage any Candidate it selects.',
    },
    {
      id: 'rec_4',
      number: 4,
      content:
        'The Parties intend this Agreement to provide a consistent legal and commercial framework for future recruitment assignments, with the commercial terms for each assignment quoted and agreed in a written Commercial Confirmation, by email or on paper, under the master commercial terms in Schedule A.',
    },
  ],
  sections: [
    {
      id: 'sec_1',
      number: 1,
      title: 'Definitions and Interpretation',
      clauses: [
        {
          id: 'c_1_1',
          clauseNumber: '1.1',
          title: 'Candidate',
          paragraphs: [
            '“Candidate” means any individual who is sourced, identified, screened, shortlisted, referred or introduced by Tasknera to Bozzo Cabs in connection with an Assignment, or whose profile or identifying information is first provided to Bozzo Cabs by Tasknera, whether through email, ATS, recruitment platform, WhatsApp, telephone, video call or any other agreed channel.',
          ],
        },
        {
          id: 'c_1_2',
          clauseNumber: '1.2',
          title: 'Assignment',
          paragraphs: [
            '“Assignment” means a specific vacancy, position or recruitment mandate communicated by Bozzo Cabs to Tasknera and accepted by Tasknera in accordance with Clause 3.4 and recorded in a Commercial Confirmation.',
          ],
        },
        {
          id: 'c_1_3',
          clauseNumber: '1.3',
          title: 'Placement',
          paragraphs: [
            '“Placement” means the joining or commencement of employment or engagement of a Candidate with Bozzo Cabs or a Covered Entity, whether as an employee, consultant, contractor, freelancer or otherwise, and whether directly or indirectly (including through a third-party payroll, staffing or contracting arrangement initiated, authorised or arranged by Bozzo Cabs or a Covered Entity, where such engagement arises from Tasknera’s introduction of the Candidate).',
          ],
        },
        {
          id: 'c_1_4',
          clauseNumber: '1.4',
          title: 'Placement Fee',
          paragraphs: [
            '“Placement Fee” means the professional recruitment fee payable by Bozzo Cabs to Tasknera for a Placement, determined in accordance with Clause 7.1 and the applicable Commercial Confirmation.',
          ],
        },
        {
          id: 'c_1_5',
          clauseNumber: '1.5',
          title: 'Protection Period',
          paragraphs: [
            '“Protection Period” means twelve (12) months from the date of Tasknera’s first written submission of a Candidate to Bozzo Cabs, unless a longer period is expressly stated in the applicable Commercial Confirmation.',
          ],
        },
        {
          id: 'c_1_6',
          clauseNumber: '1.6',
          title: 'Business Day',
          paragraphs: [
            '“Business Day” means a day other than a Saturday, Sunday or public holiday on which commercial banks are generally open for business in Delhi, India.',
          ],
        },
        {
          id: 'c_1_7',
          clauseNumber: '1.7',
          title: 'Confidential Information',
          paragraphs: [
            '“Confidential Information” means all non-public business, commercial, financial, technical, operational, client, candidate, pricing, recruitment process, database, documentation and other proprietary information disclosed by or on behalf of one Party to the other in connection with this Agreement, whether in written, electronic, oral or other form.',
          ],
        },
        {
          id: 'c_1_8',
          clauseNumber: '1.8',
          title: 'Applicable Law',
          paragraphs: [
            '“Applicable Law” means all laws, rules, regulations, notifications, orders and binding governmental requirements applicable to a Party or the relevant activity, as amended from time to time.',
          ],
        },
        {
          id: 'c_1_9',
          clauseNumber: '1.9',
          title: 'Annual CTC',
          paragraphs: ['“Annual CTC” has the meaning given in Clause 7.4.'],
        },
        {
          id: 'c_1_10',
          clauseNumber: '1.10',
          title: 'Commercial Confirmation',
          paragraphs: [
            '“Commercial Confirmation” means the written record of the commercial terms for an Assignment, including the Placement Fee and any term that varies the Master Commercial Terms in Schedule A, agreed between the Parties by email or on paper in accordance with Clause 3.3.',
          ],
        },
        {
          id: 'c_1_11',
          clauseNumber: '1.11',
          title: 'Covered Entity',
          paragraphs: [
            '“Covered Entity” means a group company, subsidiary, holding company or affiliate of Bozzo Cabs that is (a) expressly covered by the relevant Commercial Confirmation, or (b) not so covered but engages a Candidate in circumstances reasonably connected to Tasknera’s introduction of that Candidate, as further provided in Clause 5.3.',
          ],
        },
        {
          id: 'c_1_12',
          clauseNumber: '1.12',
          title: 'Fee Trigger Event',
          paragraphs: [
            '“Fee Trigger Event” means the Candidate’s joining or commencement of employment or engagement, or such other event as is stated in the applicable Commercial Confirmation.',
          ],
        },
        {
          id: 'c_1_13',
          clauseNumber: '1.13',
          title: 'Candidate Personal Data',
          paragraphs: [
            '“Candidate Personal Data” means personal data relating to a Candidate that is collected, shared or otherwise processed in connection with the Services, including resumes, contact details, employment history and compensation information.',
          ],
        },
        {
          id: 'c_1_14',
          clauseNumber: '1.14',
          title: 'Replacement Period',
          paragraphs: [
            '“Replacement Period” means sixty (60) calendar days from the Candidate’s date of joining, unless a different period is expressly stated in the applicable Commercial Confirmation.',
          ],
        },
        {
          id: 'c_1_15',
          clauseNumber: '1.15',
          title: 'Services',
          paragraphs: ['“Services” has the meaning given in Clause 3.1.'],
        },
        {
          id: 'c_1_16',
          clauseNumber: '1.16',
          title: 'Interpretation',
          paragraphs: [
            'In this Agreement: (a) headings are for convenience only and do not affect interpretation; (b) “including” means “including without limitation”; (c) references to Clauses and Schedules are to the clauses of and schedules to this Agreement, and the Schedules form part of this Agreement; (d) references to writing include email and other electronic communications in accordance with Clauses 22 and 24; and (e) references to any law include that law as amended, re-enacted or replaced from time to time.',
          ],
        },
      ],
    },
    {
      id: 'sec_2',
      number: 2,
      title: 'Appointment and Nature of Relationship',
      clauses: [
        {
          id: 'c_2_1',
          clauseNumber: '2.1',
          title: 'Appointment',
          paragraphs: [
            'Bozzo Cabs appoints Tasknera as an independent recruitment services provider for Assignments accepted under this Agreement, and Tasknera accepts such appointment. Unless expressly stated otherwise in writing, the appointment is non-exclusive: Bozzo Cabs may engage other recruitment providers (subject to Clauses 4, 5 and 6) and Tasknera may serve other clients (subject to Clause 11).',
          ],
        },
        {
          id: 'c_2_2',
          clauseNumber: '2.2',
          title: 'Independent vendor and client',
          paragraphs: [
            'Tasknera is an independent recruitment services provider and vendor to Bozzo Cabs, and Bozzo Cabs is the client and hiring company. The Parties are independent contracting parties. Nothing in this Agreement or any Commercial Confirmation, and no course of dealing between the Parties, creates a partnership, joint venture, agency, franchise, fiduciary relationship or employer-employee relationship between Tasknera and Bozzo Cabs, and neither Party shall hold itself out as such.',
          ],
        },
        {
          id: 'c_2_3',
          clauseNumber: '2.3',
          title: 'No authority to bind',
          paragraphs: [
            'Tasknera has no authority to bind Bozzo Cabs, to make representations or commitments on Bozzo Cabs’s behalf, to sign contracts, issue offer letters or fix employment terms for Bozzo Cabs, or to incur liabilities in Bozzo Cabs’s name. Bozzo Cabs likewise has no authority to bind Tasknera. Tasknera communicates with Candidates solely as a recruitment services provider, on the basis of information supplied by Bozzo Cabs.',
          ],
        },
        {
          id: 'c_2_4',
          clauseNumber: '2.4',
          title: 'No employment by Tasknera',
          paragraphs: [
            'Tasknera is not the employer of any Candidate hired or engaged by Bozzo Cabs or a Covered Entity, and does not employ, place on its payroll, supervise, direct or control any Candidate for Bozzo Cabs. After a Candidate joins, Bozzo Cabs (and the relevant Covered Entity) shall be solely responsible for the employment or engagement, including salary and payroll, benefits, statutory employment obligations, workplace conditions, supervision, performance management and termination.',
          ],
        },
        {
          id: 'c_2_5',
          clauseNumber: '2.5',
          title: 'No manpower supply',
          paragraphs: [
            'This Agreement is for recruitment services only. Tasknera does not supply manpower, contract staff, temporary workers or outsourced personnel, and does not act as payroll provider or employer of record, under this Agreement. Any such arrangement would require a separate written agreement.',
          ],
        },
        {
          id: 'c_2_6',
          clauseNumber: '2.6',
          title: 'Tasknera personnel',
          paragraphs: [
            'Tasknera’s own employees, consultants and personnel remain solely its responsibility, and nothing in this Agreement creates an employment relationship between them and Bozzo Cabs. Tasknera controls the manner and means by which it performs the Services, subject to the requirements of this Agreement.',
          ],
        },
      ],
    },
    {
      id: 'sec_3',
      number: 3,
      title: 'Scope of Recruitment Services',
      clauses: [
        {
          id: 'c_3_1',
          clauseNumber: '3.1',
          title: 'Services',
          paragraphs: [
            'For each accepted Assignment, Tasknera shall provide such of the following recruitment services as are applicable to that Assignment (the “Services”):',
          ],
          subclauses: [
            { id: 'sc_3_1_a', clauseId: '(a)', text: 'candidate sourcing;' },
            { id: 'sc_3_1_b', clauseId: '(b)', text: 'candidate identification;' },
            { id: 'sc_3_1_c', clauseId: '(c)', text: 'resume and profile screening;' },
            { id: 'sc_3_1_d', clauseId: '(d)', text: 'preliminary qualification of Candidates;' },
            { id: 'sc_3_1_e', clauseId: '(e)', text: 'shortlisting;' },
            { id: 'sc_3_1_f', clauseId: '(f)', text: 'submission of Candidates to Bozzo Cabs;' },
            { id: 'sc_3_1_g', clauseId: '(g)', text: 'interview scheduling;' },
            { id: 'sc_3_1_h', clauseId: '(h)', text: 'interview coordination;' },
            { id: 'sc_3_1_i', clauseId: '(i)', text: 'interview follow-up;' },
            { id: 'sc_3_1_j', clauseId: '(j)', text: 'offer-stage coordination;' },
            { id: 'sc_3_1_k', clauseId: '(k)', text: 'joining follow-up; and' },
            { id: 'sc_3_1_l', clauseId: '(l)', text: 'reasonable recruitment support in connection with the foregoing.' },
          ],
        },
        {
          id: 'c_3_2',
          clauseNumber: '3.2',
          title: 'Assignment information',
          paragraphs: [
            'Bozzo Cabs shall provide complete and accurate job descriptions, skills, experience, location, work mode, employment type, compensation range, notice requirements, interview process, timelines and other material requirements for each Assignment, and shall communicate any changes promptly.',
          ],
        },
        {
          id: 'c_3_3',
          clauseNumber: '3.3',
          title: 'Commercial Confirmation before sourcing',
          paragraphs: [
            'Tasknera is not required to commence sourcing for any vacancy or submit Candidates until a Commercial Confirmation for that vacancy has been agreed by both Parties in writing. Each Commercial Confirmation shall record the requisition number, date, position, number of vacancies, location, work mode, employment type, compensation or equity details, job requirements, applicable Placement Fee, Fee Trigger Event, payment terms, Replacement Period, Protection Period and any special conditions, in each case to the extent not already stated in Schedule A. Agreement may be given by a signed document or by email (or another mutually agreed electronic communication) from an authorised representative of each Party. The Placement Fee for each Assignment is determined in accordance with Clause 7.1.',
          ],
        },
        {
          id: 'c_3_4',
          clauseNumber: '3.4',
          title: 'Assignment acceptance',
          paragraphs: [
            'Tasknera may accept or decline an Assignment based on role fit, availability of resources, commercial feasibility or other reasonable business considerations. An Assignment is accepted when Tasknera confirms it in writing, including by accepting the Commercial Confirmation.',
          ],
        },
        {
          id: 'c_3_5',
          clauseNumber: '3.5',
          title: 'Professional efforts; no guarantee',
          paragraphs: [
            'Tasknera shall use commercially reasonable professional efforts to source suitable Candidates. Tasknera does not guarantee Candidate availability, selection, acceptance of an offer, joining, retention or performance, or that any Assignment will be filled within any timeline. Any hiring turnaround time recorded in a Commercial Confirmation is a target and not a guarantee, unless the Commercial Confirmation expressly states otherwise.',
          ],
        },
        {
          id: 'c_3_6',
          clauseNumber: '3.6',
          title: 'Direct dealings with Candidates',
          paragraphs: [
            'Bozzo Cabs may communicate directly with Candidates for interviews, assessments, offers and employment decisions. Such direct communication shall not affect Tasknera’s fee entitlement where the Candidate was introduced by Tasknera.',
          ],
        },
        {
          id: 'c_3_7',
          clauseNumber: '3.7',
          title: 'Future projects and quotations',
          paragraphs: [
            'This Agreement is a master agreement and does not fix the terms of any individual project. Each future project, vacancy or Assignment shall be quoted by Tasknera and agreed between the Parties in writing, by email or on paper, before sourcing commences. Each such Commercial Confirmation is made under and forms part of this Agreement, and any matter it does not expressly vary remains governed by this Agreement and Schedule A. No separate master agreement is required for any future Assignment.',
          ],
        },
      ],
    },
    {
      id: 'sec_4',
      number: 4,
      title: 'Candidate Submission and Attribution',
      clauses: [
        {
          id: 'c_4_1',
          clauseNumber: '4.1',
          title: 'Submission',
          paragraphs: [
            'A Candidate shall be treated as introduced by Tasknera from the date and time Tasknera first provides the Candidate’s profile or identifying information to Bozzo Cabs for the relevant Assignment through any channel permitted under Clause 22.2.',
          ],
        },
        {
          id: 'c_4_2',
          clauseNumber: '4.2',
          title: 'Recording',
          paragraphs: [
            'Submissions shall, where reasonably practicable, be time-stamped and recorded through email, ATS, shared tracker or another agreed system, and such records may be relied upon as evidence of the date and time of submission, subject to Applicable Law.',
          ],
        },
        {
          id: 'c_4_3',
          clauseNumber: '4.3',
          title: 'Prior candidate / duplicate submission',
          paragraphs: [
            'If Bozzo Cabs claims that a Candidate was already known to Bozzo Cabs, already under active consideration, or previously submitted by another source before Tasknera’s submission, Bozzo Cabs shall, within five (5) Business Days of receiving Tasknera’s submission of that Candidate, notify Tasknera in writing and provide reasonable documentary evidence, pre-dating Tasknera’s submission, of the earlier submission, consideration or relationship, such as:',
          ],
          subclauses: [
            { id: 'sc_4_3_a', clauseId: '(a)', text: 'the previous resume submission;' },
            { id: 'sc_4_3_b', clauseId: '(b)', text: 'an ATS record;' },
            { id: 'sc_4_3_c', clauseId: '(c)', text: 'an application record;' },
            { id: 'sc_4_3_d', clauseId: '(d)', text: 'an interview record;' },
            { id: 'sc_4_3_e', clauseId: '(e)', text: 'email communication; or' },
            { id: 'sc_4_3_f', clauseId: '(f)', text: 'any other verifiable recruitment record.' },
          ],
        },
        {
          id: 'c_4_4',
          clauseNumber: '4.4',
          title: 'Presumption of introduction',
          paragraphs: [
            'If Bozzo Cabs does not give notice together with reasonable documentary evidence within the period stated in Clause 4.3, the Candidate shall be presumed, for commercial attribution purposes, to have been introduced by Tasknera. That presumption may be displaced only by documentary evidence of fraud or manifest error.',
          ],
        },
        {
          id: 'c_4_5',
          clauseNumber: '4.5',
          title: 'Multiple submissions',
          paragraphs: [
            'Where the same Candidate is submitted by more than one recruitment source for the same Assignment, attribution shall be determined by the earliest verifiable written submission for that Assignment, subject to Clauses 4.3, 4.4 and 5.4.',
          ],
        },
      ],
    },
    {
      id: 'sec_5',
      number: 5,
      title: 'Candidate Fee Protection',
      clauses: [
        {
          id: 'c_5_1',
          clauseNumber: '5.1',
          title: 'Fee entitlement',
          paragraphs: [
            'If a Candidate introduced by Tasknera is hired or engaged by Bozzo Cabs or a Covered Entity for the relevant Assignment or for a substantially similar role, and the offer is made or the Placement occurs within the Protection Period, the Placement Fee applicable to that Candidate shall be payable to Tasknera regardless of the route through which the Candidate is eventually hired or engaged, including where Bozzo Cabs or a Covered Entity:',
          ],
          subclauses: [
            { id: 'sc_5_1_a', clauseId: '(a)', text: 'contacts the Candidate directly;' },
            { id: 'sc_5_1_b', clauseId: '(b)', text: 'hires the Candidate directly;' },
            { id: 'sc_5_1_c', clauseId: '(c)', text: 'hires the Candidate through another department, business unit or location;' },
            { id: 'sc_5_1_d', clauseId: '(d)', text: 'hires the Candidate through another recruitment vendor or agency;' },
            { id: 'sc_5_1_e', clauseId: '(e)', text: 'hires the Candidate through an internal employee referral;' },
            {
              id: 'sc_5_1_f',
              clauseId: '(f)',
              text:
                'engages the Candidate through a third-party payroll, staffing or contracting arrangement initiated, authorised or arranged by Bozzo Cabs or a Covered Entity, where such engagement arises from Tasknera’s introduction of the Candidate; or',
            },
            { id: 'sc_5_1_g', clauseId: '(g)', text: 'changes the hiring route, channel or terms of engagement after Tasknera’s introduction.' },
          ],
        },
        {
          id: 'c_5_2',
          clauseNumber: '5.2',
          title: 'Different role',
          paragraphs: [
            'The fee protection in this Clause 5 also applies if the Candidate is engaged during the Protection Period for a different role, where the engagement is reasonably connected to Tasknera’s introduction. In that case the Placement Fee shall be calculated on the Annual CTC for the role actually taken up, at the percentage or fixed fee agreed for the Assignment under which the Candidate was introduced.',
          ],
        },
        {
          id: 'c_5_3',
          clauseNumber: '5.3',
          title: 'Group and affiliate entities',
          paragraphs: [
            'The fee protection extends to a hire or engagement by a group company, subsidiary, holding company or affiliate of Bozzo Cabs only where (a) that entity is expressly covered by the relevant Commercial Confirmation, or (b) the hire or engagement is reasonably connected to Tasknera’s introduction, for example where Bozzo Cabs shared the Candidate’s profile with, or referred the Candidate to, that entity. In either case Bozzo Cabs shall remain liable for the Placement Fee unless that entity has agreed in writing with Tasknera to pay it.',
          ],
        },
        {
          id: 'c_5_4',
          clauseNumber: '5.4',
          title: 'Independent prior relationship exception',
          paragraphs: [
            'No Placement Fee shall be payable solely due to a Tasknera submission where Bozzo Cabs proves, by evidence of the kind described in Clause 4.3 supplied within the period stated in that Clause, that before Tasknera’s submission the Candidate had an active and genuine recruitment relationship with Bozzo Cabs, or had already been formally shortlisted or interviewed by Bozzo Cabs for the relevant or another vacancy.',
          ],
        },
        {
          id: 'c_5_5',
          clauseNumber: '5.5',
          title: 'No candidate ownership',
          paragraphs: [
            'Tasknera does not own any Candidate and does not restrict any Candidate’s freedom to seek or accept employment. The protection in this Clause 5 is solely a commercial fee-attribution and protection mechanism between the Parties.',
          ],
        },
        {
          id: 'c_5_6',
          clauseNumber: '5.6',
          title: 'Survival',
          paragraphs: [
            'Candidate fee protection shall survive expiry or termination of this Agreement for all Candidates introduced before such expiry or termination, for the remainder of the applicable Protection Period.',
          ],
        },
      ],
    },
    {
      id: 'sec_6',
      number: 6,
      title: 'Non-Circumvention and Commercial Protection',
      clauses: [
        {
          id: 'c_6_1',
          clauseNumber: '6.1',
          title: 'No fee avoidance',
          paragraphs: [
            'Bozzo Cabs shall not, and shall procure that each Covered Entity shall not, knowingly structure, route or alter a Candidate’s engagement (including by changing the hiring entity, channel, role title, contract type or engagement route) primarily for the purpose of avoiding or reducing a Placement Fee properly payable to Tasknera.',
          ],
        },
        {
          id: 'c_6_2',
          clauseNumber: '6.2',
          title: 'No misuse of Candidate information',
          paragraphs: [
            'Bozzo Cabs shall not provide Candidate profiles or Candidate contact information supplied by Tasknera to another recruitment agency or other third party for the purpose of bypassing Tasknera’s fee entitlement.',
          ],
        },
        {
          id: 'c_6_3',
          clauseNumber: '6.3',
          title: 'No inducement',
          paragraphs: [
            'Bozzo Cabs shall not knowingly induce or request a Candidate introduced by Tasknera to withdraw from Tasknera’s process in order to be engaged through another channel.',
          ],
        },
        {
          id: 'c_6_4',
          clauseNumber: '6.4',
          title: 'Legitimate independent hiring',
          paragraphs: [
            'Nothing in this Clause 6 prevents Bozzo Cabs from hiring a person through a genuinely independent channel where Bozzo Cabs establishes an independent prior recruitment relationship in accordance with Clauses 4.3 and 5.4.',
          ],
        },
        {
          id: 'c_6_5',
          clauseNumber: '6.5',
          title: 'Consequence of breach',
          paragraphs: [
            'If a Placement occurs in contravention of this Clause 6, the Placement Fee shall be payable as if the Placement had been made through Tasknera, together with interest under Clause 7.11 if not paid when due, without prejudice to Tasknera’s other remedies under Applicable Law, subject to Clause 16.',
          ],
        },
      ],
    },
    {
      id: 'sec_7',
      number: 7,
      title: 'Fees, Taxes, Invoicing and Payment',
      clauses: [
        {
          id: 'c_7_1',
          clauseNumber: '7.1',
          title: 'Placement Fee',
          paragraphs: [
            'The Placement Fee shall be the fee expressly recorded in the applicable Commercial Confirmation. For the equity-only Founding Growth & Business Strategy Manager position, the default fee is INR 18,000 per successful joining, exclusive of applicable taxes. Fees for salary/CTC-based roles, including any percentage of Annual CTC, flat fee, volume rate or other pricing model, must be separately quoted and agreed in writing, by email or on paper, for each Assignment before sourcing begins. No default percentage or other fee applies to salary/CTC-based roles under this Agreement. Where the Commercial Confirmation is silent on a matter for which this Agreement states a default, the default applies.',
          ],
        },
        {
          id: 'c_7_2',
          clauseNumber: '7.2',
          title: 'Placement Fee earned',
          paragraphs: [
            'Tasknera earns the Placement Fee when a Candidate introduced by Tasknera joins or commences employment or engagement with Bozzo Cabs or a Covered Entity, or on such other Fee Trigger Event as is stated in the Commercial Confirmation. The Placement Fee is not conditional on the Candidate’s subsequent retention or performance; Bozzo Cabs’s remedy for an early voluntary exit is the replacement service in Clause 8.',
          ],
        },
        {
          id: 'c_7_3',
          clauseNumber: '7.3',
          title: 'Fee payable irrespective of hiring channel',
          paragraphs: [
            'The Placement Fee remains payable in each of the circumstances described in Clause 5.1 and shall not be avoided, reduced or delayed by any change in the hiring channel, route, entity, department, role or engagement structure after Tasknera’s introduction, subject only to Clauses 4.3 and 5.4.',
          ],
        },
        {
          id: 'c_7_4',
          clauseNumber: '7.4',
          title: 'Fee basis',
          paragraphs: [
            'Unless the Commercial Confirmation expressly provides a different basis, any percentage-based Placement Fee shall be calculated on the annual guaranteed gross compensation agreed with the Candidate and stated in the offer or appointment letter (“Annual CTC”), being the fixed pay components payable over twelve (12) months, including basic salary, house rent allowance, special and other fixed allowances, and any guaranteed minimum variable amount. Unless the Commercial Confirmation expressly provides otherwise, Annual CTC excludes:',
          ],
          subclauses: [
            { id: 'sc_7_4_a', clauseId: '(a)', text: 'employer statutory contributions;' },
            { id: 'sc_7_4_b', clauseId: '(b)', text: 'gratuity;' },
            { id: 'sc_7_4_c', clauseId: '(c)', text: 'non-guaranteed variable pay;' },
            { id: 'sc_7_4_d', clauseId: '(d)', text: 'discretionary bonus; and' },
            { id: 'sc_7_4_e', clauseId: '(e)', text: 'other components that are not guaranteed.' },
          ],
        },
        {
          id: 'c_7_5',
          clauseNumber: '7.5',
          title: 'Joining and compensation confirmation',
          paragraphs: [
            'Bozzo Cabs shall confirm the Candidate’s actual date of joining to Tasknera no later than the joining date and, for salary/CTC-based roles, provide the compensation details needed to calculate the agreed Placement Fee. On request, Bozzo Cabs shall provide the relevant offer or appointment letter with unrelated personal details redacted. If Bozzo Cabs does not provide the particulars on time, Tasknera may use the written Commercial Confirmation and other reliable recruitment records available to it, subject to reasonable adjustment once the actual particulars are confirmed.',
          ],
        },
        {
          id: 'c_7_6',
          clauseNumber: '7.6',
          title: 'GST',
          paragraphs: [
            'All fees are stated exclusive of taxes. GST and any other legally chargeable indirect taxes shall be payable by Bozzo Cabs in addition to the Placement Fee wherever applicable under Applicable Law, against a valid tax invoice.',
          ],
        },
        {
          id: 'c_7_7',
          clauseNumber: '7.7',
          title: 'TDS',
          paragraphs: [
            'Bozzo Cabs may deduct tax at source only where required by Applicable Law, at the rate prescribed, and shall deposit it with the appropriate authority within the statutory time. Bozzo Cabs shall provide the appropriate TDS certificate or documentation to Tasknera within the statutory timeline. If Bozzo Cabs fails to deposit the tax deducted or to provide the certificate within that timeline, Bozzo Cabs shall, on written request, reimburse Tasknera for any tax credit lost as a result of that failure.',
          ],
        },
        {
          id: 'c_7_8',
          clauseNumber: '7.8',
          title: 'Invoice',
          paragraphs: [
            'Tasknera shall generate and send the Placement Fee invoice on the Candidate’s joining date. Bozzo Cabs shall promptly confirm the joining and provide any information reasonably required to prepare the invoice. If the joining or required particulars are not confirmed to Tasknera on the joining date, Tasknera may issue the invoice promptly after receiving confirmation, without affecting its fee entitlement. For salary/CTC-based roles, invoices shall use only the fee basis expressly agreed in writing in the applicable Commercial Confirmation. Each invoice shall identify the Candidate, Assignment, Placement Fee, applicable taxes and payment details and may be delivered by email.',
          ],
        },
        {
          id: 'c_7_9',
          clauseNumber: '7.9',
          title: 'Payment period',
          paragraphs: [
            'Bozzo Cabs shall pay each valid invoice, other than any amount disputed in accordance with Clause 7.10, within forty-five (45) calendar days of receipt. Payment shall be made in Indian Rupees by electronic bank transfer to the account stated in the invoice, free of bank charges to Tasknera.',
          ],
        },
        {
          id: 'c_7_10',
          clauseNumber: '7.10',
          title: 'Disputed invoices',
          paragraphs: [
            'Any invoice dispute must be raised in writing within five (5) Business Days of receipt of the invoice, clearly stating the disputed amount and the specific grounds. The undisputed amount shall remain payable within the period stated in Clause 7.9. A question whether a Candidate was introduced by Tasknera is governed by Clauses 4.3 and 4.4 and is not a valid invoice dispute unless it was raised within the period stated in Clause 4.3.',
          ],
        },
        {
          id: 'c_7_11',
          clauseNumber: '7.11',
          title: 'Late payment',
          paragraphs: [
            'Any undisputed amount that remains unpaid after its due date shall carry interest at eighteen percent (18%) per annum, calculated on a daily basis from the due date until actual payment, or the maximum rate permitted by Applicable Law, whichever is lower. Nothing in this Clause limits any right of Tasknera under Applicable Law in respect of delayed payments, including, where applicable, under the Micro, Small and Medium Enterprises Development Act, 2006.',
          ],
        },
        {
          id: 'c_7_12',
          clauseNumber: '7.12',
          title: 'No set-off',
          paragraphs: [
            'Bozzo Cabs shall not withhold or set off undisputed fees against unrelated claims or internal adjustments, unless expressly agreed in writing by Tasknera or required by Applicable Law.',
          ],
        },
      ],
    },
    {
      id: 'sec_8',
      number: 8,
      title: 'Replacement of Placed Candidates',
      clauses: [
        {
          id: 'c_8_1',
          clauseNumber: '8.1',
          title: 'Replacement commitment',
          paragraphs: [
            'Unless the applicable Commercial Confirmation states otherwise, if a Candidate introduced by Tasknera and placed with Bozzo Cabs voluntarily resigns or withdraws within the Replacement Period of sixty (60) calendar days after joining, Tasknera shall provide one suitable replacement Candidate at no additional Placement Fee, provided that:',
          ],
          subclauses: [
            { id: 'sc_8_1_a', clauseId: '(a)', text: 'the Placement Fee invoice for the original Placement has been paid by its due date and no undisputed overdue amounts remain outstanding;' },
            { id: 'sc_8_1_b', clauseId: '(b)', text: 'Bozzo Cabs notifies Tasknera in writing within seven (7) calendar days of the resignation or withdrawal;' },
            { id: 'sc_8_1_c', clauseId: '(c)', text: 'the vacancy remains open;' },
            { id: 'sc_8_1_d', clauseId: '(d)', text: 'the role, location, compensation and material employment conditions remain substantially the same as those on which the original Candidate was placed; and' },
            { id: 'sc_8_1_e', clauseId: '(e)', text: 'the separation is not attributable to Bozzo Cabs or to a circumstance listed in Clause 8.3.' },
          ],
        },
        {
          id: 'c_8_2',
          clauseNumber: '8.2',
          title: 'Service remedy; no automatic refund',
          paragraphs: [
            'Replacement is a service remedy only. It is not an automatic refund, credit, rebate or reduction of the Placement Fee, and does not entitle Bozzo Cabs to withhold or delay payment of any invoice. Unless expressly agreed in the applicable Commercial Confirmation, no refund obligation arises in respect of fees paid or payable.',
          ],
        },
        {
          id: 'c_8_3',
          clauseNumber: '8.3',
          title: 'Exclusions',
          paragraphs: [
            'The replacement commitment shall not apply where the Candidate leaves due to termination by Bozzo Cabs, redundancy, restructuring, layoff, project cancellation, closure, reduction in or change of compensation, material change in role or location, adverse working conditions, delayed joining formalities attributable to Bozzo Cabs, non-payment or material breach by Bozzo Cabs, or other circumstances materially attributable to Bozzo Cabs.',
          ],
        },
        {
          id: 'c_8_4',
          clauseNumber: '8.4',
          title: 'Replacement process',
          paragraphs: [
            'Tasknera shall use reasonable efforts to propose a replacement Candidate within a reasonable time. Only one replacement is available for each Placement, and a replacement Candidate is not itself eligible for further replacement unless the Commercial Confirmation expressly provides. Where the Placement Fee is percentage-based and the replacement Candidate’s Annual CTC exceeds that of the original Candidate, the Placement Fee on the excess shall be payable on the same basis.',
          ],
        },
        {
          id: 'c_8_5',
          clauseNumber: '8.5',
          title: 'Withdrawal before joining',
          paragraphs: [
            'If a Candidate withdraws, declines an offer or fails to join before the Fee Trigger Event for reasons outside Tasknera’s reasonable control, no Placement Fee is payable for that Candidate (without prejudice to Clause 5.1 if the Candidate is later hired during the Protection Period), Tasknera shall not be liable for consequential loss, and Tasknera shall use reasonable efforts to suggest alternatives where commercially feasible.',
          ],
        },
      ],
    },
    {
      id: 'sec_9',
      number: 9,
      title: 'Responsibilities of Bozzo Cabs',
      clauses: [
        {
          id: 'c_9_1',
          clauseNumber: '9.1',
          title: 'Accurate information',
          paragraphs: [
            'Bozzo Cabs shall ensure that job descriptions, compensation, work conditions, employment terms and hiring process information supplied to Tasknera are accurate and lawful.',
          ],
        },
        {
          id: 'c_9_2',
          clauseNumber: '9.2',
          title: 'Timely feedback',
          paragraphs: [
            'Bozzo Cabs shall use reasonable efforts to provide feedback on Candidate profiles and interviews within agreed timelines so that Candidate engagement is not unnecessarily delayed, and shall nominate a hiring manager or point of contact for each Assignment.',
          ],
        },
        {
          id: 'c_9_3',
          clauseNumber: '9.3',
          title: 'Offer and employment responsibility',
          paragraphs: [
            'Bozzo Cabs shall be solely responsible for offer letters, employment or consultancy agreements, compensation, payroll, benefits, statutory employment obligations, workplace conditions and compliance, supervision, performance management, background verification decisions, work authorisation, post-joining management and termination.',
          ],
        },
        {
          id: 'c_9_4',
          clauseNumber: '9.4',
          title: 'No discriminatory requirements',
          paragraphs: [
            'Bozzo Cabs shall not require Tasknera to source Candidates using discriminatory or otherwise unlawful criteria, except where a lawful occupational requirement applies.',
          ],
        },
      ],
    },
    {
      id: 'sec_10',
      number: 10,
      title: 'Responsibilities of Tasknera',
      clauses: [
        {
          id: 'c_10_1',
          clauseNumber: '10.1',
          title: 'Professional conduct',
          paragraphs: [
            'Tasknera shall perform the Services with reasonable skill, care and professional diligence consistent with customary recruitment industry practices.',
          ],
        },
        {
          id: 'c_10_2',
          clauseNumber: '10.2',
          title: 'Screening',
          paragraphs: [
            'Tasknera may perform preliminary screening based on information reasonably available to it and the requirements communicated by Bozzo Cabs. Unless separately contracted in writing, Tasknera does not conduct background verification and does not warrant the accuracy of Candidate-provided information.',
          ],
        },
        {
          id: 'c_10_3',
          clauseNumber: '10.3',
          title: 'Misrepresentation',
          paragraphs: [
            'Tasknera shall be responsible for material and proven falsification knowingly introduced into a Candidate profile by Tasknera personnel, but shall not be responsible for false information independently provided by the Candidate or information not reasonably detectable through ordinary screening.',
          ],
        },
      ],
    },
    {
      id: 'sec_11',
      number: 11,
      title: 'Confidentiality',
      clauses: [
        {
          id: 'c_11_1',
          clauseNumber: '11.1',
          title: 'Confidentiality duty',
          paragraphs: [
            'Each Party shall keep the other Party’s Confidential Information confidential and shall use it only for performing or receiving the Services under this Agreement. Confidential Information includes client information, Candidate information, pricing, recruitment processes, databases, documents and commercial information.',
          ],
        },
        {
          id: 'c_11_2',
          clauseNumber: '11.2',
          title: 'Permitted disclosure',
          paragraphs: [
            'Confidential Information may be disclosed to employees, consultants, professional advisers and service providers who need to know it for the purposes of this Agreement and are bound by confidentiality obligations, or where disclosure is required by Applicable Law or a competent authority (in which case, where lawful, the disclosing Party shall give the other Party prior notice).',
          ],
        },
        {
          id: 'c_11_3',
          clauseNumber: '11.3',
          title: 'Exclusions',
          paragraphs: [
            'Confidentialリティ obligations do not apply to information that is publicly available without breach of this Agreement, was lawfully known to the recipient before disclosure, is independently developed without use of the information, or is lawfully received from a third party without a duty of confidence.',
          ],
        },
        {
          id: 'c_11_4',
          clauseNumber: '11.4',
          title: 'Terms and Candidate profiles',
          paragraphs: [
            'The terms of this Agreement and each Commercial Confirmation, including pricing, are Confidential Information of both Parties. Candidate profiles supplied by Tasknera are Confidential Information of Tasknera as against third parties, subject to Bozzo Cabs’s right of use under Clause 13.3.',
          ],
        },
        {
          id: 'c_11_5',
          clauseNumber: '11.5',
          title: 'Return / deletion',
          paragraphs: [
            'On written request or termination, each Party shall return or securely delete the other Party’s Confidential Information, subject to legally required retention, routine archival systems, Clause 12 in respect of Candidate Personal Data, and records required to establish or defend contractual rights, including fee entitlement.',
          ],
        },
        {
          id: 'c_11_6',
          clauseNumber: '11.6',
          title: 'Survival',
          paragraphs: [
            'This Clause 11 shall survive for three (3) years after termination or expiry of this Agreement, while trade secrets shall remain protected for so long as they retain their confidential character under Applicable Law.',
          ],
        },
      ],
    },
    {
      id: 'sec_12',
      number: 12,
      title: 'Data Protection and Candidate Privacy',
      clauses: [
        {
          id: 'c_12_1',
          clauseNumber: '12.1',
          title: 'Compliance',
          paragraphs: [
            'Each Party shall comply with Applicable Law relating to privacy and the protection of personal data, including the Digital Personal Data Protection Act, 2023 and applicable rules, notifications and directions, to the extent applicable to its processing activities. Each Party is responsible for its own compliance in respect of the Candidate Personal Data it processes.',
          ],
        },
        {
          id: 'c_12_2',
          clauseNumber: '12.2',
          title: 'Legitimate purpose',
          paragraphs: [
            'Each Party shall handle Candidate Personal Data only for legitimate recruitment, selection, onboarding and related employment or engagement purposes and in accordance with Applicable Law, and shall not sell it or use it for any unrelated commercial purpose.',
          ],
        },
        {
          id: 'c_12_3',
          clauseNumber: '12.3',
          title: 'Notice, consent and lawful basis',
          paragraphs: [
            'Where required by Applicable Law, Tasknera shall obtain appropriate notice and consent from Candidates, or have another lawful basis, before sharing Candidate Personal Data with Bozzo Cabs. Where required by Applicable Law, Bozzo Cabs shall provide Candidates with its own notice and shall process Candidate Personal Data only for the purposes stated in Clause 12.2.',
          ],
        },
        {
          id: 'c_12_4',
          clauseNumber: '12.4',
          title: 'Security safeguards and access controls',
          paragraphs: [
            'Each Party shall maintain reasonable security safeguards and access controls, appropriate to the nature of the Candidate Personal Data and the size and nature of its business, to protect against unauthorised access, disclosure, alteration, loss or misuse, and shall limit access to personnel who need it for the recruitment purpose, as further described in Schedule B.',
          ],
        },
        {
          id: 'c_12_5',
          clauseNumber: '12.5',
          title: 'Restricted use and sharing',
          paragraphs: [
            'Neither Party shall share Candidate Personal Data with an unrelated third party except as required for the recruitment purpose, with appropriate safeguards, or as required by law. Bozzo Cabs shall not share Candidate Personal Data supplied by Tasknera with other recruitment agencies, consistent with Clause 6.2.',
          ],
        },
        {
          id: 'c_12_6',
          clauseNumber: '12.6',
          title: 'Retention and deletion',
          paragraphs: [
            'Candidate Personal Data shall be retained only for as long as reasonably necessary for the recruitment purpose and applicable legal or contractual requirements (including establishing fee entitlement), and shall thereafter be deleted or anonymised where reasonably practicable.',
          ],
        },
        {
          id: 'c_12_7',
          clauseNumber: '12.7',
          title: 'Data incidents',
          paragraphs: [
            'A Party becoming aware of a material personal-data breach affecting Candidate Personal Data shared under this Agreement shall notify the other Party without undue delay and, where reasonably practicable, within forty-eight (48) hours, and shall reasonably cooperate in mitigation and in any legally required notifications.',
          ],
        },
        {
          id: 'c_12_8',
          clauseNumber: '12.8',
          title: 'Cooperation',
          paragraphs: [
            'Where legally required, the Parties shall reasonably cooperate in responding to Candidate requests and regulator communications concerning Candidate Personal Data, subject to each Party’s role and obligations under Applicable Law.',
          ],
        },
        {
          id: 'c_12_9',
          clauseNumber: '12.9',
          title: 'Cross-border transfers',
          paragraphs: [
            'Any cross-border transfer of, or access to, Candidate Personal Data shall be made only as permitted by Applicable Law and on the relevant consent, contractual or legal basis.',
          ],
        },
      ],
    },
    {
      id: 'sec_13',
      number: 13,
      title: 'Intellectual Property',
      clauses: [
        {
          id: 'c_13_1',
          clauseNumber: '13.1',
          title: 'Background IP',
          paragraphs: [
            'Each Party retains all rights, title and interest in its pre-existing and independently developed intellectual property, including software, databases, templates, processes, methodologies, documents and trademarks.',
          ],
        },
        {
          id: 'c_13_2',
          clauseNumber: '13.2',
          title: 'Tasknera materials',
          paragraphs: [
            'Tasknera retains ownership of its pre-existing and independently developed recruitment methods, sourcing processes, templates, screening frameworks, ATS configurations, databases, proprietary tools, workflows and business processes. No ownership or licence of any of them is transferred to Bozzo Cabs merely because information is shared or Services are performed in connection with an Assignment.',
          ],
        },
        {
          id: 'c_13_3',
          clauseNumber: '13.3',
          title: 'Use of submitted profiles',
          paragraphs: [
            'Bozzo Cabs may use Candidate profiles and related information supplied by Tasknera only for recruitment and employment decisions relating to the relevant Candidate, subject to Clauses 6, 11 and 12.',
          ],
        },
        {
          id: 'c_13_4',
          clauseNumber: '13.4',
          title: 'Bozzo Cabs materials',
          paragraphs: [
            'Bozzo Cabs retains ownership of the job descriptions and other materials it supplies, and grants Tasknera a limited right to use them for the purpose of performing the Services.',
          ],
        },
        {
          id: 'c_13_5',
          clauseNumber: '13.5',
          title: 'No unauthorised exploitation',
          paragraphs: [
            'Neither Party shall reproduce, sell, distribute or commercially exploit the other Party’s proprietary materials except as expressly permitted under this Agreement or in writing.',
          ],
        },
      ],
    },
    {
      id: 'sec_14',
      number: 14,
      title: 'Representations, Warranties and Disclaimers',
      clauses: [
        {
          id: 'c_14_1',
          clauseNumber: '14.1',
          title: 'Authority',
          paragraphs: ['Each Party represents that it has the authority to enter into and perform this Agreement.'],
        },
        {
          id: 'c_14_2',
          clauseNumber: '14.2',
          title: 'Legal compliance',
          paragraphs: [
            'Each Party represents that entering into and performing this Agreement will not knowingly violate a material obligation binding upon it.',
          ],
        },
        {
          id: 'c_14_3',
          clauseNumber: '14.3',
          title: 'No guarantee of hiring outcome',
          paragraphs: [
            'Except for the express service commitments in this Agreement, Tasknera makes no warranty that an Assignment will be filled, that a Candidate will be selected, or that any Candidate will join, remain with Bozzo Cabs or perform to a particular standard.',
          ],
        },
        {
          id: 'c_14_4',
          clauseNumber: '14.4',
          title: 'No employment decision liability',
          paragraphs: [
            'Final hiring, rejection, compensation, role assignment, background verification and employment decisions remain solely with Bozzo Cabs. To the extent permitted by Applicable Law, warranties and conditions not expressly stated in this Agreement are excluded.',
          ],
        },
      ],
    },
    {
      id: 'sec_15',
      number: 15,
      title: 'Indemnity',
      clauses: [
        {
          id: 'c_15_1',
          clauseNumber: '15.1',
          title: 'Mutual indemnity',
          paragraphs: [
            'Each Party shall indemnify the other against direct losses, damages, liabilities and reasonable third-party costs finally awarded or incurred, to the extent arising directly from that Party’s own fraud, wilful misconduct, material breach of this Agreement or violation of Applicable Law attributable to it.',
          ],
        },
        {
          id: 'c_15_2',
          clauseNumber: '15.2',
          title: 'Client-specific matters',
          paragraphs: [
            'Without limiting Clause 15.1, Bozzo Cabs shall indemnify and hold Tasknera harmless from third-party claims arising from Bozzo Cabs’s (or a Covered Entity’s) employment or engagement of a Candidate, workplace conditions, compensation, payroll, statutory employment obligations, unlawful hiring criteria, or acts or omissions after the Candidate joins, except to the extent the claim arises from a matter for which Tasknera is responsible under Clause 15.1.',
          ],
        },
        {
          id: 'c_15_3',
          clauseNumber: '15.3',
          title: 'Procedure',
          paragraphs: [
            'The indemnified Party shall promptly notify the indemnifying Party of a material claim, provide reasonable cooperation, and allow the indemnifying Party reasonable control of the defence and settlement, provided that no settlement imposing liability, admission or continuing obligation on the indemnified Party may be made without its written consent, not to be unreasonably withheld.',
          ],
        },
      ],
    },
    {
      id: 'sec_16',
      number: 16,
      title: 'Limitation of Liability',
      clauses: [
        {
          id: 'c_16_1',
          clauseNumber: '16.1',
          title: 'Exclusion of consequential loss',
          paragraphs: [
            'To the maximum extent permitted by Applicable Law, neither Party shall be liable for indirect, incidental, special, exemplary, punitive or consequential loss, loss of business opportunity, loss of goodwill or loss of anticipated profits arising out of this Agreement.',
          ],
        },
        {
          id: 'c_16_2',
          clauseNumber: '16.2',
          title: 'Liability cap',
          paragraphs: [
            'Except for payment obligations, fraud, wilful misconduct, breach of confidentiality, unauthorised use of personal data, intellectual property infringement, or liabilities that cannot lawfully be limited, the aggregate liability of either Party arising out of this Agreement shall not exceed the total Placement Fees paid or payable by Bozzo Cabs to Tasknera during the twelve (12) months preceding the event giving rise to the claim (or, if that event occurs within the first twelve (12) months after the Effective Date, since the Effective Date).',
          ],
        },
        {
          id: 'c_16_3',
          clauseNumber: '16.3',
          title: 'Legal limits',
          paragraphs: [
            'Nothing in this Clause limits liability to the extent such limitation is prohibited by Applicable Law.',
          ],
        },
      ],
    },
    {
      id: 'sec_17',
      number: 17,
      title: 'Compliance, Ethics and Anti-Bribery',
      clauses: [
        {
          id: 'c_17_1',
          clauseNumber: '17.1',
          title: 'Lawful conduct',
          paragraphs: [
            'Each Party shall comply with Applicable Law and maintain reasonable policies and controls to prevent fraud, bribery, corruption, conflicts of interest and unlawful discrimination in connection with the Services.',
          ],
        },
        {
          id: 'c_17_2',
          clauseNumber: '17.2',
          title: 'Candidate charges',
          paragraphs: [
            'Tasknera shall not knowingly require Candidates to make unlawful payments as a condition of being introduced to Bozzo Cabs.',
          ],
        },
        {
          id: 'c_17_3',
          clauseNumber: '17.3',
          title: 'Improper influence',
          paragraphs: [
            'Neither Party shall offer or accept an improper payment or benefit intended to influence recruitment, selection, commercial or contractual decisions.',
          ],
        },
      ],
    },
    {
      id: 'sec_18',
      number: 18,
      title: 'Term, Suspension and Termination',
      clauses: [
        {
          id: 'c_18_1',
          clauseNumber: '18.1',
          title: 'Term',
          paragraphs: [
            'This Agreement shall commence on the Effective Date and remain in force for three (3) years, unless terminated earlier in accordance with this Clause 18. It may be renewed by written agreement of the Parties.',
          ],
        },
        {
          id: 'c_18_2',
          clauseNumber: '18.2',
          title: 'Termination for convenience',
          paragraphs: [
            'Either Party may terminate this Agreement without cause by giving thirty (30) days’ prior written notice to the other.',
          ],
        },
        {
          id: 'c_18_3',
          clauseNumber: '18.3',
          title: 'Termination for breach',
          paragraphs: [
            'Either Party may terminate this Agreement by written notice if the other Party commits a material breach that is not cured within fifteen (15) days after written notice, or immediately where the breach is incapable of cure. Non-payment of undisputed fees that remains unpaid fifteen (15) days after written notice is a material breach for this purpose.',
          ],
        },
        {
          id: 'c_18_4',
          clauseNumber: '18.4',
          title: 'Immediate termination',
          paragraphs: [
            'Either Party may terminate this Agreement immediately by written notice if the other Party becomes insolvent, ceases business, engages in fraud or unlawful conduct materially affecting this Agreement, or if continuation would violate Applicable Law.',
          ],
        },
        {
          id: 'c_18_5',
          clauseNumber: '18.5',
          title: 'Suspension by Tasknera',
          paragraphs: [
            'If undisputed invoices remain overdue for more than fifteen (15) days after the due date, Tasknera may suspend new Candidate submissions until the overdue amounts are cleared, without waiving any existing fee entitlement.',
          ],
        },
        {
          id: 'c_18_6',
          clauseNumber: '18.6',
          title: 'Effect of termination or expiry; survival',
          paragraphs: [
            'Termination or expiry of this Agreement shall not affect accrued rights or obligations, and shall not eliminate or reduce: (a) unpaid fees; (b) Candidate fee protection under Clause 5 and fees for Candidates introduced before termination or expiry; (c) confidentiality obligations; (d) data protection obligations; (e) intellectual property rights; (f) indemnities; (g) limitations of liability; or (h) dispute-resolution provisions. Clauses 1, 4, 5, 6, 7 (as to fees accrued or accruing), 8 (as to Placements made before termination or expiry), 11, 12, 13, 15, 16, 20, 21, 22 and 25, and this Clause 18.6, shall survive termination or expiry.',
          ],
        },
        {
          id: 'c_18_7',
          clauseNumber: '18.7',
          title: 'Open Assignments',
          paragraphs: [
            'Unless otherwise agreed in writing, termination or expiry relieves Tasknera of any obligation to commence or continue work on any Assignment after the effective date of termination or expiry, but does not extinguish fees arising from Candidates introduced before that date, including Placements that occur after that date within the applicable Protection Period.',
          ],
        },
      ],
    },
    {
      id: 'sec_19',
      number: 19,
      title: 'Force Majeure',
      clauses: [
        {
          id: 'c_19_1',
          clauseNumber: '19.1',
          title: 'Force majeure',
          paragraphs: [
            'Neither Party shall be liable for delay or failure caused by events beyond its reasonable control, including natural disasters, war, civil disturbance, government restrictions, epidemic or pandemic events, widespread infrastructure failures, telecommunications outages or other comparable events, provided the affected Party gives reasonable notice and takes commercially reasonable steps to mitigate the effect. This Clause does not excuse any obligation to pay money that has become due.',
          ],
        },
      ],
    },
    {
      id: 'sec_20',
      number: 20,
      title: 'Dispute Resolution',
      clauses: [
        {
          id: 'c_20_1',
          clauseNumber: '20.1',
          title: 'Good-faith resolution',
          paragraphs: [
            'The Parties shall first attempt in good faith to resolve any dispute through discussions between authorised representatives within fifteen (15) days after written notice of the dispute.',
          ],
        },
        {
          id: 'c_20_2',
          clauseNumber: '20.2',
          title: 'Arbitration',
          paragraphs: [
            'If the dispute is not resolved within that period, it shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, as amended from time to time.',
          ],
        },
        {
          id: 'c_20_3',
          clauseNumber: '20.3',
          title: 'Tribunal',
          paragraphs: [
            'The arbitration shall be conducted by a sole arbitrator mutually appointed by the Parties. If the Parties cannot agree on the arbitrator within a reasonable period, the appointment may be made in accordance with Applicable Law.',
          ],
        },
        {
          id: 'c_20_4',
          clauseNumber: '20.4',
          title: 'Seat, venue and language',
          paragraphs: [
            'The seat and venue of arbitration shall be New Delhi, India, and the proceedings shall be conducted in English.',
          ],
        },
        {
          id: 'c_20_5',
          clauseNumber: '20.5',
          title: 'Interim relief',
          paragraphs: [
            'Nothing in this Clause prevents either Party from seeking interim or protective relief from a court of competent jurisdiction where permitted by law.',
          ],
        },
        {
          id: 'c_20_6',
          clauseNumber: '20.6',
          title: 'Finality',
          paragraphs: [
            'The arbitral award shall be final and binding on the Parties, subject to rights available under Applicable Law.',
          ],
        },
        {
          id: 'c_20_7',
          clauseNumber: '20.7',
          title: 'Continued performance',
          paragraphs: [
            'Pending resolution of a dispute, each Party shall continue to perform its undisputed obligations under this Agreement.',
          ],
        },
      ],
    },
    {
      id: 'sec_21',
      number: 21,
      title: 'Governing Law and Jurisdiction',
      clauses: [
        {
          id: 'c_21_1',
          clauseNumber: '21.1',
          title: 'Governing law',
          paragraphs: ['This Agreement shall be governed by and interpreted in accordance with the laws of India.'],
        },
        {
          id: 'c_21_2',
          clauseNumber: '21.2',
          title: 'Courts',
          paragraphs: [
            'Subject to Clause 20, the courts at New Delhi, India shall have exclusive jurisdiction over matters arising out of this Agreement that may be brought before a court, including applications for interim measures, enforcement or other matters not capable of arbitration.',
          ],
        },
      ],
    },
    {
      id: 'sec_22',
      number: 22,
      title: 'Notices and Communications',
      clauses: [
        {
          id: 'c_22_1',
          clauseNumber: '22.1',
          title: 'Formal notices',
          paragraphs: [
            'Formal notices under this Agreement (including notices of breach, termination or dispute) shall be in writing and delivered by hand, recognised courier, registered post or email to the addresses specified in the Party Details. A notice is deemed received on delivery if by hand, on the third Business Day after dispatch if by courier or registered post, and on the next Business Day after sending if by email, in each case unless a delivery failure is notified. Formal notices shall not be given by WhatsApp or other messaging channels alone.',
          ],
        },
        {
          id: 'c_22_2',
          clauseNumber: '22.2',
          title: 'Operational communications',
          paragraphs: [
            'Job requisitions, Commercial Confirmations, Candidate submissions, interview coordination, approvals, fee confirmations and other routine operational communications may be exchanged by email, ATS, WhatsApp or other mutually accepted electronic channels, and shall be treated as business records of the relevant transaction.',
          ],
        },
        {
          id: 'c_22_3',
          clauseNumber: '22.3',
          title: 'Notice details',
          paragraphs: [
            'Each Party shall promptly notify the other in writing of any change to its notice address or designated email address.',
          ],
        },
      ],
    },
    {
      id: 'sec_23',
      number: 23,
      title: 'Assignment and Subcontracting',
      clauses: [
        {
          id: 'c_23_1',
          clauseNumber: '23.1',
          title: 'Assignment',
          paragraphs: [
            'Neither Party may assign or transfer this Agreement or its material obligations without the other Party’s prior written consent (not to be unreasonably withheld), except to a successor in connection with a merger, reorganisation or sale of substantially all of the relevant business, provided the successor assumes the obligations in writing. Tasknera may, on written notice, transfer this Agreement to a company, LLP or other entity that succeeds to its recruitment business and is controlled by Ms. Sheetal Bedi, provided that entity assumes Tasknera’s obligations in writing.',
          ],
        },
        {
          id: 'c_23_2',
          clauseNumber: '23.2',
          title: 'Subcontracting',
          paragraphs: [
            'Tasknera may use its employees, consultants and approved recruitment resources (being resources approved by Tasknera and bound by appropriate confidentiality and data-protection obligations) to perform parts of the Services, and shall remain responsible for their acts and omissions to the extent required by law and this Agreement.',
          ],
        },
      ],
    },
    {
      id: 'sec_24',
      number: 24,
      title: 'Electronic Execution and Records',
      clauses: [
        {
          id: 'c_24_1',
          clauseNumber: '24.1',
          title: 'Electronic execution',
          paragraphs: [
            'The Parties may execute this Agreement and any Commercial Confirmation physically or electronically, including by a valid electronic or digital signature, to the extent permitted by Applicable Law.',
          ],
        },
        {
          id: 'c_24_2',
          clauseNumber: '24.2',
          title: 'Electronic records as evidence',
          paragraphs: [
            'Electronic records, including the communications described in Clause 22.2, Candidate submissions, approvals, acknowledgements, invoices, and printouts, exports or screenshots of them, may be relied upon by either Party as evidence of the relevant transaction, subject to Applicable Law (including the Information Technology Act, 2000 and the Bharatiya Sakshya Adhiniyam, 2023).',
          ],
        },
      ],
    },
    {
      id: 'sec_25',
      number: 25,
      title: 'General',
      clauses: [
        {
          id: 'c_25_1',
          clauseNumber: '25.1',
          title: 'Entire agreement',
          paragraphs: [
            'This Agreement, together with its Schedules, each Commercial Confirmation and any written amendment, constitutes the entire agreement between the Parties concerning the recruitment services covered by it and supersedes prior discussions and agreements on the same subject matter.',
          ],
        },
        {
          id: 'c_25_2',
          clauseNumber: '25.2',
          title: 'Order of precedence',
          paragraphs: [
            'In case of conflict: (a) a signed written amendment prevails over all other documents; (b) the Clauses of this Agreement prevail over Schedule A and any Commercial Confirmation, except that a Commercial Confirmation prevails for its Assignment on any matter that this Agreement expressly permits it to specify or vary; (c) a Commercial Confirmation may otherwise vary a Clause of this Agreement for its Assignment only if it expressly identifies that Clause and is accepted in writing by an authorised representative of each Party; and (d) Schedule A and Commercial Confirmations prevail over routine operational communications.',
          ],
        },
        {
          id: 'c_25_3',
          clauseNumber: '25.3',
          title: 'Amendments',
          paragraphs: [
            'Any amendment to this Agreement must be in writing and accepted by authorised representatives of both Parties.',
          ],
        },
        {
          id: 'c_25_4',
          clauseNumber: '25.4',
          title: 'Waiver',
          paragraphs: ['Failure or delay in exercising a right shall not operate as a waiver of that right.'],
        },
        {
          id: 'c_25_5',
          clauseNumber: '25.5',
          title: 'Severability',
          paragraphs: [
            'If any provision is held invalid or unenforceable, it shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in effect.',
          ],
        },
        {
          id: 'c_25_6',
          clauseNumber: '25.6',
          title: 'Counterparts',
          paragraphs: [
            'This Agreement may be executed in counterparts, each of which shall be deemed an original and all of which together shall constitute one instrument.',
          ],
        },
        {
          id: 'c_25_7',
          clauseNumber: '25.7',
          title: 'No third-party beneficiaries',
          paragraphs: [
            'Except as expressly stated, this Agreement creates no rights in any person other than the Parties and their permitted successors and assigns.',
          ],
        },
        {
          id: 'c_25_8',
          clauseNumber: '25.8',
          title: 'Stamp duty and costs',
          paragraphs: [
            'Any stamp duty payable on this Agreement shall be borne equally by the Parties. Each Party shall otherwise bear its own costs of negotiating and executing this Agreement.',
          ],
        },
      ],
    },
  ],
  scheduleA: [
    {
      id: 'sch_a_1',
      term: 'Placement Fee',
      masterTerms:
        'Equity-only Founding Growth & Business Strategy Manager: INR 18,000 flat fee per successful joining, exclusive of applicable taxes. Salary/CTC-based roles and any other role: fee to be quoted by Tasknera and agreed in writing, by email or on paper, for each Assignment before sourcing (Clauses 3.3 and 7.1). No default percentage fee applies.',
    },
    {
      id: 'sch_a_2',
      term: 'Fee Basis',
      masterTerms:
        'Flat fee for the specified equity-only role; salary/CTC basis only as agreed in writing (Clause 7.4).',
    },
    {
      id: 'sch_a_3',
      term: 'Fee Trigger Event',
      masterTerms:
        'Candidate’s joining / commencement; invoice issued on joining date (Clause 7.8).',
    },
    {
      id: 'sch_a_4',
      term: 'Payment Terms',
      masterTerms: '45 calendar days from receipt of valid invoice (Clause 7.9).',
    },
    {
      id: 'sch_a_5',
      term: 'Replacement Period',
      masterTerms: '60 calendar days from joining (Clauses 1.14 and 8).',
    },
    {
      id: 'sch_a_6',
      term: 'Candidate Protection Period',
      masterTerms: '12 months from first written submission (Clause 1.5).',
    },
    {
      id: 'sch_a_7',
      term: 'GST',
      masterTerms: 'Payable in addition, where applicable (Clause 7.6).',
    },
    {
      id: 'sch_a_8',
      term: 'TDS',
      masterTerms:
        'Only where required by law; certificate to be provided by Bozzo Cabs (Clause 7.7).',
    },
    {
      id: 'sch_a_9',
      term: 'Hiring Entity / Covered Entities',
      masterTerms:
        'Bozzo Cabs only, unless a Commercial Confirmation states otherwise (Clause 5.3).',
    },
    {
      id: 'sch_a_10',
      term: 'Exclusivity',
      masterTerms: 'Non-exclusive (Clause 2.1), unless otherwise agreed in writing.',
    },
    {
      id: 'sch_a_11',
      term: 'Future projects / quotations',
      masterTerms:
        'Quoted by Tasknera for each Assignment and agreed by email or on paper before sourcing (Clause 3.7).',
    },
    {
      id: 'sch_a_12',
      term: 'Special Conditions',
      masterTerms: 'None, unless stated in a Commercial Confirmation.',
    },
  ],
  scheduleBIntro:
    'The following controls apply to Candidate Personal Data exchanged for recruitment purposes, to the extent applicable to the Parties and the relevant processing activity, and are intended to be proportionate to the size and nature of each Party’s business.',
  scheduleB: [
    {
      id: 'sch_b_1',
      code: 'B.1',
      title: 'Purpose',
      content:
        'Candidate Personal Data may be handled only for candidate sourcing, screening, selection, interview, offer, onboarding and related recruitment administration, in accordance with Applicable Law.',
    },
    {
      id: 'sch_b_2',
      code: 'B.2',
      title: 'Notice and consent',
      content:
        'Where required by Applicable Law, Tasknera shall obtain appropriate Candidate notice and consent, or have another lawful basis, before sharing Candidate Personal Data with Bozzo Cabs; Bozzo Cabs shall give any notice required of it (Clause 12.3).',
    },
    {
      id: 'sch_b_3',
      code: 'B.3',
      title: 'Access',
      content:
        'Access shall be restricted to personnel who need the information for the recruitment process.',
    },
    {
      id: 'sch_b_4',
      code: 'B.4',
      title: 'Security',
      content:
        'Each Party shall use reasonable security safeguards appropriate to the nature and sensitivity of the data, including access control (such as passwords or login credentials) and secure storage and transfer practices.',
    },
    {
      id: 'sch_b_5',
      code: 'B.5',
      title: 'Restricted use and sharing',
      content:
        'Candidate Personal Data shall not be sold or used for unrelated purposes, and shall not be shared with an unrelated third party (including another recruitment agency) except as required for the recruitment purpose, with appropriate safeguards, or as required by law.',
    },
    {
      id: 'sch_b_6',
      code: 'B.6',
      title: 'Retention and deletion',
      content:
        'Candidate Personal Data shall be retained only as long as reasonably necessary for the recruitment purpose and applicable legal or contractual requirements (including establishing fee entitlement), and thereafter deleted or anonymised where reasonably practicable.',
    },
    {
      id: 'sch_b_7',
      code: 'B.7',
      title: 'Incident reporting',
      content:
        'Material data-security incidents affecting shared Candidate Personal Data shall be notified without undue delay and, where reasonably practicable, within 48 hours after awareness.',
    },
    {
      id: 'sch_b_8',
      code: 'B.8',
      title: 'Cooperation',
      content:
        'The Parties shall reasonably cooperate on Candidate requests, regulator communications and incident response where required by law or reasonably necessary to meet contractual obligations.',
    },
    {
      id: 'sch_b_9',
      code: 'B.9',
      title: 'Law changes',
      content:
        'The Parties shall update their practices as required to comply with applicable data-protection laws, rules, notifications or binding governmental directions as they come into force.',
    },
  ],
  clientSignatoryPlace: 'Hyderabad, Telangana',
  clientSignatoryDate: 'October 10, 2026',
  taskneraSignatoryPlace: 'Delhi, India',
  taskneraSignatoryDate: 'October 10, 2026',
  witness1: {
    name: 'Rohan Sharma',
    address: 'Madhapur, Hyderabad, Telangana',
    signatureDate: 'October 10, 2026',
  },
  witness2: {
    name: 'Pooja Verma',
    address: 'Dilshad Colony, Delhi – 110095',
    signatureDate: 'October 10, 2026',
  },
};

export const getDeepCloneMrsaData = (data: MrsaAgreementData = INITIAL_MRSA_DATA): MrsaAgreementData => {
  return JSON.parse(JSON.stringify(data));
};
