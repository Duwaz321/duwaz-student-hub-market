import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Introduction',
    body: (
      <>
        <p>This Privacy Policy explains how DUWAZ processes personal information in connection with the marketplace, account creation, order flows, seller profiles, delivery coordination, and support interactions.</p>
        <p>DUWAZ is a marketplace platform operating in South Africa. This policy is written with the Protection of Personal Information Act (POPIA) in mind, but it does not by itself create a legal compliance guarantee.</p>
      </>
    ),
  },
  {
    heading: '2. Information We Collect',
    body: (
      <>
        <p>DUWAZ may process information that users provide directly when they register, create a shop, place an order, communicate with sellers or buyers, or seek customer support.</p>
        <p>Information may include names, email addresses, phone numbers, profile details, student information, addresses, delivery information, product information, order details, and communications.</p>
      </>
    ),
  },
  {
    heading: '3. Account Information',
    body: (
      <>
        <p>When a user registers, DUWAZ may process the information necessary to create and manage an account, including full name, email address, password credentials, student number, and location/address details where provided.</p>
        <p>Authentication credentials are stored in a secure hashed form and should not be exposed or shared.</p>
      </>
    ),
  },
  {
    heading: '4. Seller Information',
    body: (
      <>
        <p>Seller accounts may include shop details, business or seller identity information, contact information, product inventory information, pricing, and images necessary to operate a seller profile.</p>
        <p>Seller data may be used to manage orders, contact the seller, support delivery coordination, and verify account integrity.</p>
      </>
    ),
  },
  {
    heading: '5. Buyer Information',
    body: (
      <>
        <p>Buyer information may include account information, order preferences, address or collection details, and communication records associated with purchases or support requests.</p>
      </>
    ),
  },
  {
    heading: '6. Order Information',
    body: (
      <>
        <p>DUWAZ may process order information such as product selections, quantities, totals, order status, delivery or collection details, and associated messages between participants.</p>
        <p>Order information is used to fulfill the transaction, support tracking, communicate updates, and manage disputes or support requests.</p>
      </>
    ),
  },
  {
    heading: '7. Payment Information',
    body: (
      <>
        <p>DUWAZ may receive and process transaction details necessary to facilitate a checkout and order record, including order totals, buyer information, seller information, and payment references.</p>
        <p>DUWAZ does not necessarily store full card numbers. Payment card information is handled by a third-party payment provider such as Yoco where applicable. DUWAZ uses payment provider services to process the transaction and may receive limited payment metadata needed to complete the order and support reconciliation.</p>
      </>
    ),
  },
  {
    heading: '8. Device and Technical Information',
    body: (
      <>
        <p>DUWAZ may process technical information such as IP addresses, browser type, device information, session activity, errors, and site usage patterns where necessary for security, support, and platform reliability.</p>
        <p>Cookies and similar technologies may be used for authentication, session management, analytics, and user experience improvements where enabled.</p>
      </>
    ),
  },
  {
    heading: '9. How We Use Personal Information',
    body: (
      <>
        <p>DUWAZ uses personal information to create and maintain accounts, verify identities, enable marketplace functionality, process orders, communicate with buyers and sellers, manage deliveries, prevent abuse, and support customer service.</p>
        <p>DUWAZ may also use limited information for operational reporting, troubleshooting, fraud prevention, and lawful compliance needs.</p>
      </>
    ),
  },
  {
    heading: '10. Authentication and Security',
    body: (
      <>
        <p>DUWAZ uses authentication measures, including password-based login and secure token-based sessions where implemented. Account credentials are not intentionally exposed in public-facing content.</p>
        <p>Security controls are used to reduce unauthorized access, but no system can be guaranteed perfectly secure. Users should protect their credentials and report any suspected compromise immediately.</p>
      </>
    ),
  },
  {
    heading: '11. Sharing of Information',
    body: (
      <>
        <p>DUWAZ may share personal information with the relevant buyer, seller, delivery provider, or support team where necessary to complete an order or resolve a dispute.</p>
        <p>DUWAZ may also disclose information where required by law, law enforcement requests, or to protect the safety and integrity of users and the marketplace.</p>
      </>
    ),
  },
  {
    heading: '12. Third-Party Service Providers',
    body: (
      <>
        <p>DUWAZ uses third-party services to provide functionality and support the marketplace, such as hosting, email delivery, payment processing, cloud storage, maps, and application monitoring.</p>
        <p>These services may process personal information on DUWAZ’s behalf under contractual and technical safeguards. DUWAZ does not disclose secrets such as database credentials or API keys as part of the public privacy policy.</p>
      </>
    ),
  },
  {
    heading: '13. Supabase',
    body: (
      <>
        <p>Supabase may be used for hosting or managing application data, authentication-related infrastructure, or storage depending on the deployed configuration.</p>
        <p>Any personal data processed via Supabase is managed in accordance with the platform configuration, access controls, and applicable policies.</p>
      </>
    ),
  },
  {
    heading: '14. Resend',
    body: (
      <>
        <p>Resend may be used to send account verification emails or messages relevant to authentication or user communication.</p>
        <p>DUWAZ may send email addresses and limited personal data to the messaging provider only where necessary to deliver those emails.</p>
      </>
    ),
  },
  {
    heading: '15. Yoco',
    body: (
      <>
        <p>Yoco may be used to process payment information for transactions. Payment card details are not typically stored directly in DUWAZ’s application database unless the business configuration explicitly allows it for a specific flow.</p>
        <p>DUWAZ uses Yoco as a payment processor and may receive transaction identifiers and payment status information needed to complete order processing.</p>
      </>
    ),
  },
  {
    heading: '16. Vercel',
    body: (
      <>
        <p>Vercel may host and serve the frontend application and related static assets. Vercel may process technical information such as request logs and deployment metadata in order to provide hosting and operational services.</p>
      </>
    ),
  },
  {
    heading: '17. Render',
    body: (
      <>
        <p>Render may host the backend application and infrastructure services. Render may process runtime and operational data needed to keep the application available and monitored.</p>
      </>
    ),
  },
  {
    heading: '18. Data Storage',
    body: (
      <>
        <p>DUWAZ stores personal information in the application database and related systems as required to provide the marketplace service.</p>
        <p>Storage practices should follow least-privilege access controls, encryption in transit, and the platform’s security configuration.</p>
      </>
    ),
  },
  {
    heading: '19. Data Retention',
    body: (
      <>
        <p>DUWAZ will retain personal information only for as long as needed to fulfill the purpose for which it was collected, to comply with legal or regulatory obligations, or to resolve disputes.</p>
        <p>Users may request deletion or account closure in accordance with the process described below, subject to any legal or operational requirements that require retaining certain records.</p>
      </>
    ),
  },
  {
    heading: '20. User Rights',
    body: (
      <>
        <p>Depending on the relevant circumstances and applicable law, users may have rights to access, correct, limit, or query personal information processed by DUWAZ.</p>
        <p>Users may also have a right to object to certain processing or to request deletion where lawful and appropriate.</p>
      </>
    ),
  },
  {
    heading: '21. Accessing or Correcting Personal Information',
    body: (
      <>
        <p>Users can update account information through their profile settings where available. Where direct changes are not available, users may contact DUWAZ support to request access or correction of their information.</p>
      </>
    ),
  },
  {
    heading: '22. Deleting an Account',
    body: (
      <>
        <p>Users may request account deletion or closure where the platform permits this. Request timing and data retention may depend on legal obligations, active order obligations, or fraud/security requirements.</p>
      </>
    ),
  },
  {
    heading: '23. Marketing Communications',
    body: (
      <>
        <p>DUWAZ may contact users about service updates, transactional matters, security notices, or account-related information. If marketing communications are sent, they should be subject to a clear opt-in or opt-out process where required by law.</p>
      </>
    ),
  },
  {
    heading: '24. Cookies and Similar Technologies',
    body: (
      <>
        <p>DUWAZ may use cookies or local storage to maintain sign-in sessions, improve user experience, and support technical functionality.</p>
        <p>Users may be able to manage browser settings to disable cookies, though this may impact the function of some dashboard or marketplace features.</p>
      </>
    ),
  },
  {
    heading: '25. Security',
    body: (
      <>
        <p>DUWAZ uses reasonable administrative, technical, and organisational safeguards to reduce the risk of unauthorised access, disclosure, or loss of personal information.</p>
        <p>However, no platform can guarantee absolute security, and users should take care to keep credentials secure and report any suspected account compromise promptly.</p>
      </>
    ),
  },
  {
    heading: '26. Data Breaches',
    body: (
      <>
        <p>If a data breach is identified that materially affects personal information, DUWAZ may take steps to investigate, contain the incident, notify affected users where required, and cooperate with relevant authorities.</p>
      </>
    ),
  },
  {
    heading: '27. Children’s Information',
    body: (
      <>
        <p>DUWAZ is intended for use by students and adults who are legally able to open and operate an account in the jurisdiction in which they are using the marketplace.</p>
        <p>Users must not provide personal information for children or other persons without lawful authority or consent.</p>
      </>
    ),
  },
  {
    heading: '28. Changes to This Privacy Policy',
    body: (
      <>
        <p>DUWAZ may update this Privacy Policy from time to time as the platform or legal requirements change. Continued use of the service after an update is published indicates acceptance of the revised policy.</p>
      </>
    ),
  },
  {
    heading: '29. Contact Information',
    body: (
      <>
        <p>To ask questions about this Privacy Policy or request access to or correction of personal information, contact the DUWAZ support team through the contact details displayed on the platform or the designated support email address.</p>
      </>
    ),
  },
  {
    heading: '30. Privacy Complaints',
    body: (
      <>
        <p>If you believe that DUWAZ has mishandled personal information, please contact the support team. DUWAZ will review the matter and respond in line with its operational procedures and applicable legal requirements.</p>
      </>
    ),
  },
];

const PrivacyPage = () => (
  <LegalPage
    title="Privacy Policy"
    intro={
      <>
        <p>This Privacy Policy explains how DUWAZ collects, uses, stores, shares, and protects personal information in connection with the marketplace.</p>
      </>
    }
    sections={sections}
  />
);

export default PrivacyPage;
