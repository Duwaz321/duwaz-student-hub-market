import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Introduction',
    body: (
      <>
        <p>This Privacy Policy explains how DUWAZ collects, uses, stores, shares, and protects personal information in connection with the marketplace, account creation, order flow, seller onboarding, delivery coordination, and customer support.</p>
        <p>DUWAZ operates as a digital marketplace in South Africa and has drafted this policy with reference to the Protection of Personal Information Act 4 of 2013 (POPIA), the Consumer Protection Act 68 of 2008, and other applicable rules. This policy is a draft document and does not constitute formal legal advice or formal legal compliance certification.</p>
      </>
    ),
  },
  {
    heading: '2. Information We Collect',
    body: (
      <>
        <p>DUWAZ may process information that users provide directly when they register, create a shop, place an order, communicate with another user, or request support.</p>
        <p>Information may include names, email addresses and phone numbers, profile details, student information, addresses, delivery details, product and order data, account activity, dispute records, and communications.</p>
      </>
    ),
  },
  {
    heading: '3. Account and Identity Information',
    body: (
      <>
        <p>When a user registers, DUWAZ may process the information necessary to create and maintain an account, including full name, email address, password or authentication credentials, student number, and any address or location information supplied by the user.</p>
        <p>Credentials should be treated as confidential and should not be shared. Payment or authentication information is handled by secure systems and should not be exposed publicly.</p>
      </>
    ),
  },
  {
    heading: '4. Seller Information',
    body: (
      <>
        <p>Seller accounts may include shop details, business or seller identity information, contact details, product inventory, pricing information, and images used for seller verification and marketplace operation.</p>
        <p>Seller data may be used to manage orders, communicate with buyers, support delivery coordination, and verify account integrity.</p>
      </>
    ),
  },
  {
    heading: '5. Buyer Information',
    body: (
      <>
        <p>Buyer information may include account information, order preferences, address or collection details, product selections, and communication records associated with purchases or support requests.</p>
      </>
    ),
  },
  {
    heading: '6. Order and Transaction Information',
    body: (
      <>
        <p>DUWAZ may process order information such as product selections, quantities, totals, payment references, order status, delivery or collection details, and messages between participants.</p>
        <p>Order information is used to fulfil the transaction, manage communication, support tracking, resolve disputes, and maintain records as required for business operations.</p>
      </>
    ),
  },
  {
    heading: '7. Payment Information',
    body: (
      <>
        <p>DUWAZ may receive and process transaction details necessary to facilitate checkout and maintain an order record, including order totals, buyer and seller information, and payment references.</p>
        <p>DUWAZ does not typically store full card numbers in its application database. Payment card information is generally handled by a third-party payment provider, such as Yoco, and DUWAZ may receive only the limited payment metadata needed to complete the transaction and support reconciliation.</p>
      </>
    ),
  },
  {
    heading: '8. Technical and Device Information',
    body: (
      <>
        <p>DUWAZ may process technical information such as IP addresses, browser type, device information, session activity, error reports, and usage patterns where necessary for platform security, monitoring, and support.</p>
        <p>Cookies or local storage may be used for maintaining sign-in sessions, delivering a more efficient user experience, and supporting platform functionality where enabled by the user’s browser settings.</p>
      </>
    ),
  },
  {
    heading: '9. Lawful Basis and Purpose of Processing',
    body: (
      <>
        <p>DUWAZ uses personal information to create and maintain accounts, verify identities, enable marketplace functionality, process orders, communicate with buyers and sellers, support delivery and collection arrangements, prevent abuse, and manage customer service matters.</p>
        <p>DUWAZ may also use limited information for operational reporting, troubleshooting, fraud prevention, account protection, and compliance with the law.</p>
      </>
    ),
  },
  {
    heading: '10. Security Measures',
    body: (
      <>
        <p>DUWAZ uses reasonable administrative, technical, and organisational safeguards intended to reduce the risk of unauthorised access, disclosure, or misuse of personal information.</p>
        <p>No system can be fully guaranteed secure, and users should protect their credentials and promptly report any suspected compromise or unauthorised use of their account.</p>
      </>
    ),
  },
  {
    heading: '11. Sharing of Personal Information',
    body: (
      <>
        <p>DUWAZ may share personal information with the relevant buyer, seller, delivery provider, support team, or authorised operator where necessary to complete an order, provide support, or manage a dispute.</p>
        <p>DUWAZ may also disclose personal information where required by law, for lawful regulatory requests, or to protect the safety, integrity, and lawful operation of the marketplace.</p>
      </>
    ),
  },
  {
    heading: '12. Third-Party Service Providers',
    body: (
      <>
        <p>DUWAZ may use third-party service providers to operate the platform and related functions, including hosting, email delivery, payment processing, cloud storage, map or geolocation tools, and monitoring services.</p>
        <p>These providers may process personal data on DUWAZ’s behalf under contractual terms and technical safeguards. DUWAZ does not disclose private secrets such as database credentials or API keys through this privacy policy.</p>
      </>
    ),
  },
  {
    heading: '13. Supabase, Resend, Yoco, Vercel and Render',
    body: (
      <>
        <p>Depending on the deployed configuration, Supabase may be used for application data, authentication infrastructure, or storage. Resend may be used to send account verification or support-related emails. Yoco may be used for payment processing. Vercel and Render may provide hosting and runtime infrastructure.</p>
        <p>These services may process limited personal data or operational information to support the delivery and reliability of the service. Access to such data is controlled through technical and contractual safeguards.</p>
      </>
    ),
  },
  {
    heading: '14. Data Retention',
    body: (
      <>
        <p>DUWAZ will retain personal information only for as long as necessary to fulfil the purpose for which it was collected, to comply with applicable legal obligations, to resolve disputes, or to support legitimate business operations.</p>
        <p>Where a user requests account closure, deletion, or data correction, DUWAZ may need to retain some information for legal, security, operational, or transactional reasons, subject to applicable law.</p>
      </>
    ),
  },
  {
    heading: '15. Your Rights in South African Context',
    body: (
      <>
        <p>Under the applicable legal framework, including POPIA, users may have rights to access personal information held by DUWAZ, request correction of inaccurate information, request limitation of processing where justified, and raise objections in certain circumstances.</p>
        <p>Users may also request deletion or closure of their account where lawful and operationally feasible, subject to any legal obligations that require records to be retained.</p>
      </>
    ),
  },
  {
    heading: '16. Access, Correction and Deletion Requests',
    body: (
      <>
        <p>Users can often update account information through their profile settings or account dashboard where available. Where direct updates are not available, users may contact DUWAZ support to request access, correction, deletion, or clarification of their personal data.</p>
        <p>DUWAZ may need to verify the requestor’s identity before acting on a data request, particularly where personal information is sensitive or security-related.</p>
      </>
    ),
  },
  {
    heading: '17. Marketing Communications',
    body: (
      <>
        <p>DUWAZ may send service updates, transactional notifications, security information, or account-related messages. Where marketing communications are used, they should be subject to a clear opt-in or opt-out process where required by law.</p>
      </>
    ),
  },
  {
    heading: '18. Cookies and Similar Technologies',
    body: (
      <>
        <p>DUWAZ may use cookies or local browser storage to maintain sign-in sessions, improve usability, support technical functionality, and facilitate essential marketplace operations.</p>
        <p>Users may manage browser settings to disable certain cookies, though this may affect the functionality of some features such as authentication and session continuity.</p>
      </>
    ),
  },
  {
    heading: '19. Data Breaches and Incident Response',
    body: (
      <>
        <p>If a material data breach is identified, DUWAZ may take steps to contain the incident, investigate the scope of the issue, notify affected individuals where required, and cooperate with relevant authorities where necessary.</p>
      </>
    ),
  },
  {
    heading: '20. Children and Vulnerable Persons',
    body: (
      <>
        <p>DUWAZ is intended for use by students and adults who are legally able to open and operate an account in the jurisdiction in which they are using the marketplace.</p>
        <p>Users must not provide personal information for children or other individuals without lawful authority and valid consent.</p>
      </>
    ),
  },
  {
    heading: '21. Changes to This Privacy Policy',
    body: (
      <>
        <p>DUWAZ may update this Privacy Policy from time to time as the platform, operational model, or legal obligations evolve. Continued use of the service after a revision is published constitutes acceptance of the updated policy.</p>
      </>
    ),
  },
  {
    heading: '22. Contact and Complaints',
    body: (
      <>
        <p>For questions, requests, or complaints related to this Privacy Policy or the handling of personal information, users may contact the DUWAZ support team through the contact details published on the platform or the designated support email address.</p>
        <p>DUWAZ will review concerns in line with its internal procedures and applicable legal requirements.</p>
      </>
    ),
  },
];

const PrivacyPage = () => (
  <LegalPage
    title="Privacy Policy"
    intro={
      <>
        <p>This Privacy Policy explains how DUWAZ processes personal information in connection with the marketplace, including account registration, product discovery, transactions, seller activity, delivery coordination, and support services.</p>
      </>
    }
    sections={sections}
  />
);

export default PrivacyPage;
