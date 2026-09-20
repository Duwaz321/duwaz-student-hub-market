import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Introduction',
    body: (
      <>
        <p>DUWAZ is a student marketplace that enables buyers, sellers, and delivery providers to connect for the purpose of buying, selling, and delivering goods and services within a campus or student-community environment.</p>
        <p>These Terms & Conditions govern access to and use of the DUWAZ platform, mobile experience, and related services. They explain the responsibilities of DUWAZ, buyers, sellers, and third-party service providers where relevant.</p>
      </>
    ),
  },
  {
    heading: '2. Acceptance of Terms',
    body: (
      <>
        <p>By creating an account, browsing, listing products, placing orders, or otherwise using DUWAZ, you agree to these Terms & Conditions and any additional policy or procedure published by DUWAZ from time to time.</p>
        <p>If you do not agree to these terms, you must not use the platform.</p>
      </>
    ),
  },
  {
    heading: '3. About DUWAZ',
    body: (
      <>
        <p>DUWAZ provides a digital marketplace and related features, including product discovery, listings, communications, order placement, and delivery coordination.</p>
        <p>DUWAZ does not itself manufacture, own, or control every product listed for sale. Individual sellers remain responsible for the accuracy and lawfulness of their own listings and product offering.</p>
      </>
    ),
  },
  {
    heading: '4. User Accounts',
    body: (
      <>
        <p>Users must provide accurate, current, and complete information when registering an account.</p>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account.</p>
        <p>DUWAZ may suspend, restrict, or terminate access where there is suspected fraud, abuse, misuse, or a breach of these terms.</p>
      </>
    ),
  },
  {
    heading: '5. Buyer Responsibilities',
    body: (
      <>
        <p>Buyers must provide accurate delivery or collection instructions, pay valid amounts, and review product details before placing an order.</p>
        <p>Buyers must not misuse the marketplace, impersonate other people, or place fraudulent or abusive orders.</p>
      </>
    ),
  },
  {
    heading: '6. Seller Responsibilities',
    body: (
      <>
        <p>Sellers are responsible for the accuracy of product listings, pricing, stock availability, product descriptions, and images.</p>
        <p>Sellers must ensure that goods offered for sale are lawful, safe, and accurately described. Sellers are responsible for fulfilling and communicating order arrangements as agreed with the buyer.</p>
      </>
    ),
  },
  {
    heading: '7. Product Listings',
    body: (
      <>
        <p>All listings must be accurate and lawful. Sellers must not mislead buyers about product condition, origin, quality, pricing, or availability.</p>
        <p>DUWAZ may remove or restrict listings that violate these terms, are misleading, unsafe, or otherwise inappropriate.</p>
      </>
    ),
  },
  {
    heading: '8. Product Pricing',
    body: (
      <>
        <p>Sellers are responsible for setting fair, accurate, and lawful prices for their products.</p>
        <p>DUWAZ may provide pricing support or marketplace tools, but DUWAZ is not responsible for guaranteeing that any price is accepted by a buyer or that a seller will complete a transaction.</p>
      </>
    ),
  },
  {
    heading: '9. Orders',
    body: (
      <>
        <p>Orders are accepted subject to product availability, seller confirmation, and marketplace rules. DUWAZ may reject or cancel orders where there is an error, fraud risk, or policy violation.</p>
        <p>Buyer and seller responsibilities continue after placement, including order status updates, communication, and fulfilment where applicable.</p>
      </>
    ),
  },
  {
    heading: '10. Payments',
    body: (
      <>
        <p>DUWAZ may provide a payment flow using third-party providers such as Yoco to facilitate transaction collection and payment processing.</p>
        <p>Payment processing arrangements are subject to the third-party provider terms and the commercial setup used by DUWAZ at the time. DUWAZ does not assume responsibility for any payment provider outage, failed transaction, or external processing error beyond what is explicitly agreed.</p>
      </>
    ),
  },
  {
    heading: '11. Collection / Delivery',
    body: (
      <>
        <p>For collection orders, the buyer and seller must agree on collection arrangements and the designated location.</p>
        <p>For delivery orders, DUWAZ may coordinate delivery scheduling or driver assignment. Delivery services are subject to the operational rules for the specific order and may depend on availability of the delivery provider, route conditions, and timing.</p>
      </>
    ),
  },
  {
    heading: '12. Refunds and Returns',
    body: (
      <>
        <p>Refunds and returns are governed by the separate <Link to="/refunds" className="font-medium text-[#7b4a2d] underline underline-offset-2">Refunds & Returns Policy</Link>. Additional commercial rules may apply depending on the order type and seller arrangement.</p>
        <p>DUWAZ may assist in dispute handling, but final refund decisions and claims depend on the order facts, seller cooperation, and agreed marketplace rules.</p>
      </>
    ),
  },
  {
    heading: '13. Prohibited Products and Activities',
    body: (
      <>
        <p>Users must not list or transact in items or services that are illegal, unsafe, fraudulent, restricted, or otherwise prohibited by applicable law or platform policy.</p>
        <p>Users must not manipulate the marketplace, create fake listings, misuse reviews, or evade payment or delivery processes.</p>
      </>
    ),
  },
  {
    heading: '14. Fraud and Abuse',
    body: (
      <>
        <p>DUWAZ may investigate suspicious activity, including chargebacks, false order activity, fake account creation, or abuse of reviews or communications.</p>
        <p>Where fraud or abuse is suspected, DUWAZ may restrict account access, suspend listings, or take other action reasonably necessary to protect the platform and other users.</p>
      </>
    ),
  },
  {
    heading: '15. Account Suspension or Termination',
    body: (
      <>
        <p>DUWAZ may suspend or terminate access where a user breaches these Terms & Conditions, fails to meet account requirements, or engages in abusive or unlawful conduct.</p>
        <p>Users remain responsible for any unresolved orders or obligations arising before suspension or termination.</p>
      </>
    ),
  },
  {
    heading: '16. Intellectual Property',
    body: (
      <>
        <p>DUWAZ content, branding, software, and interface design remain the property of DUWAZ or its licensors, except where rights belong to third parties.</p>
        <p>Users must not copy, reproduce, or misuse DUWAZ branding, platform content, or listing images except where expressly permitted.</p>
      </>
    ),
  },
  {
    heading: '17. User-Generated Content',
    body: (
      <>
        <p>Users may upload product images, shop content, reviews, ratings, or messages. By doing so, users confirm that they have the right to share that content and that it does not violate third-party rights.</p>
        <p>DUWAZ may review or remove content that is unlawful, misleading, abusive, or inconsistent with platform standards.</p>
      </>
    ),
  },
  {
    heading: '18. Marketplace Disclaimer',
    body: (
      <>
        <p>DUWAZ acts as a marketplace facilitator. While DUWAZ may provide support tools and moderation, it does not guarantee the quality, condition, legality, or availability of products or services listed by independent sellers.</p>
        <p>Users rely on their own judgment when transacting with other users.</p>
      </>
    ),
  },
  {
    heading: '19. Limitation of Liability',
    body: (
      <>
        <p>To the maximum extent permitted by applicable law, DUWAZ shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the platform, except where liability is expressly required by law.</p>
        <p>DUWAZ’s aggregate liability, if any, is limited to the extent permitted by law and to the extent caused by DUWAZ’s own negligence or misconduct.</p>
      </>
    ),
  },
  {
    heading: '20. Third-Party Services',
    body: (
      <>
        <p>DUWAZ may integrate third-party services, including payment processors, delivery coordination tools, email systems, cloud hosting, and maps or geolocation services.</p>
        <p>DUWAZ is not responsible for the operations, policies, or failures of those third-party providers, although it may use them to support the marketplace experience.</p>
      </>
    ),
  },
  {
    heading: '21. Privacy',
    body: (
      <>
        <p>Use of DUWAZ is subject to the <Link to="/privacy" className="font-medium text-[#7b4a2d] underline underline-offset-2">Privacy Policy</Link>. Personal information is collected and processed only for the purposes disclosed in that policy and for the operation of the marketplace.</p>
      </>
    ),
  },
  {
    heading: '22. Changes to These Terms',
    body: (
      <>
        <p>DUWAZ may update these Terms & Conditions from time to time. Continued use of the platform after updates are published constitutes acceptance of the revised terms.</p>
      </>
    ),
  },
  {
    heading: '23. Governing Law',
    body: (
      <>
        <p>These Terms & Conditions are governed by the laws of the Republic of South Africa, without regard to conflict of law rules.</p>
      </>
    ),
  },
  {
    heading: '24. Contact Information',
    body: (
      <>
        <p>For questions, requests, or notices, please contact the DUWAZ support team using the business contact details displayed on the platform or the designated support email address.</p>
        <p>Use placeholders as required: [DUWAZ LEGAL ENTITY NAME], [BUSINESS ADDRESS], [CONTACT EMAIL], [SUPPORT EMAIL].</p>
      </>
    ),
  },
];

const TermsPage = () => (
  <LegalPage
    title="Terms & Conditions"
    intro={
      <>
        <p>These terms govern how users access and use DUWAZ, a marketplace connecting buyers, sellers, and delivery providers.</p>
      </>
    }
    sections={sections}
  />
);

export default TermsPage;
