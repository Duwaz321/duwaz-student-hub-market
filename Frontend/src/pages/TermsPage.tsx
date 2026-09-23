import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Introduction',
    body: (
      <>
        <p>DUWAZ is a digital student marketplace that connects buyers, sellers, and delivery providers for the purpose of buying, selling, and arranging the delivery of goods and services within a campus and student-community environment.</p>
        <p>These Terms & Conditions regulate access to and use of the DUWAZ platform, website, mobile experience, and related services. They set out the rights and responsibilities of DUWAZ, buyers, sellers, and other users in a manner consistent with the framework of South African law, including the Consumer Protection Act 68 of 2008, the Electronic Communications and Transactions Act 25 of 2002, and the Protection of Personal Information Act 4 of 2013 (POPIA).</p>
      </>
    ),
  },
  {
    heading: '2. Acceptance of Terms',
    body: (
      <>
        <p>By registering an account, browsing listings, placing an order, listing an item, or otherwise using the platform, you agree to these Terms & Conditions and any additional policy or operating rule published by DUWAZ from time to time.</p>
        <p>If you do not agree to these terms, you must not access or use the marketplace.</p>
      </>
    ),
  },
  {
    heading: '3. Role of DUWAZ',
    body: (
      <>
        <p>DUWAZ provides a digital marketplace service that facilitates product discovery, listing management, communication, order placement, and coordination of fulfilment or delivery where applicable.</p>
        <p>DUWAZ does not necessarily own, supply, or control every product listed for sale. The seller remains responsible for the accuracy, legitimacy, and quality of the goods or services it offers, and for complying with all applicable laws.</p>
      </>
    ),
  },
  {
    heading: '4. Account Registration and Security',
    body: (
      <>
        <p>Users must provide accurate, complete, and current information when creating an account.</p>
        <p>Each user is responsible for protecting the confidentiality of their account credentials and for all activity carried out through their account. DUWAZ may suspend, restrict, or terminate access where there is evidence of fraud, misuse, unlawful conduct, or material breach of these Terms & Conditions.</p>
      </>
    ),
  },
  {
    heading: '5. Buyer Responsibilities',
    body: (
      <>
        <p>Buyers must provide accurate delivery or collection details, pay valid amounts, and review listing information carefully before confirming any purchase.</p>
        <p>Buyers must not misuse the platform, create false listings or orders, impersonate another user, or engage in abusive, fraudulent, or deceptive conduct.</p>
      </>
    ),
  },
  {
    heading: '6. Seller Responsibilities',
    body: (
      <>
        <p>Sellers are responsible for the accuracy of product listings, product descriptions, pricing, stock availability, images, and fulfilment commitments.</p>
        <p>Sellers must ensure that the goods or services offered are lawful, safe, accurately described, and fit for the purpose represented. Sellers are responsible for fulfilling orders and communicating clearly with buyers in good faith.</p>
      </>
    ),
  },
  {
    heading: '7. Product Listings and Marketplace Integrity',
    body: (
      <>
        <p>All listings must be truthful and compliant with applicable law and platform policy. Sellers must not mislead buyers in relation to product condition, quality, origin, availability, pricing, features, or delivery arrangements.</p>
        <p>DUWAZ may remove, restrict, or investigate listings that are misleading, unlawful, unsafe, inaccurate, or otherwise inconsistent with these terms.</p>
      </>
    ),
  },
  {
    heading: '8. Pricing and Payment',
    body: (
      <>
        <p>Sellers are responsible for setting lawful and accurate prices for their products or services.</p>
        <p>DUWAZ may provide payment infrastructure and transaction support through third-party service providers, such as Yoco, for the efficient processing of orders. DUWAZ does not guarantee a transaction outcome and is not responsible for failures caused by payment-provider systems, bank processing, network interruption, or fraud risk outside its direct control.</p>
      </>
    ),
  },
  {
    heading: '9. Orders and Fulfilment',
    body: (
      <>
        <p>Orders are subject to product availability, seller confirmation, and the operational rules of the marketplace. DUWAZ may cancel, hold, or reject an order where there is a pricing error, payment issue, suspected fraud, or policy conflict.</p>
        <p>Buyer and seller responsibilities continue after an order is placed, including communication, status updates, collection arrangements, delivery coordination, and completion of the transaction where applicable.</p>
      </>
    ),
  },
  {
    heading: '10. Collection and Delivery',
    body: (
      <>
        <p>For collection orders, the buyer and seller must agree on the collection arrangement, time, and location.</p>
        <p>For delivery orders, DUWAZ may coordinate scheduling or assign a delivery provider where available. Delivery services remain subject to provider availability, route conditions, timing constraints, and the operational policies applicable to that order.</p>
      </>
    ),
  },
  {
    heading: '11. Refunds and Returns',
    body: (
      <>
        <p>Refunds and returns are governed by the separate <Link to="/refunds" className="font-medium text-[#7b4a2d] underline underline-offset-2">Refunds & Returns Policy</Link> and the legal framework applicable to the transaction, including the Consumer Protection Act where relevant.</p>
        <p>DUWAZ may assist in dispute handling, but final refund decisions depend on the facts of the order, the seller’s cooperation, the applicable payment and fulfilment arrangements, and any business process approved by DUWAZ.</p>
      </>
    ),
  },
  {
    heading: '12. Prohibited Goods, Services and Conduct',
    body: (
      <>
        <p>Users must not list, buy, sell, or facilitate the sale of goods or services that are unlawful, unsafe, fraudulent, counterfeit, restricted, or otherwise prohibited by applicable law or platform policy.</p>
        <p>Users must not manipulate the marketplace, generate fake reviews or listings, evade payment or fulfilment processes, or conduct abusive behaviour towards other participants.</p>
      </>
    ),
  },
  {
    heading: '13. Fraud and Abuse Prevention',
    body: (
      <>
        <p>DUWAZ may investigate suspicious or abusive activity, including chargebacks, false orders, fake accounts, misleading messages, or misuse of reviews and ratings.</p>
        <p>Where fraud, abuse, or policy violations are suspected, DUWAZ may restrict access, suspend listings, suspend accounts, or take other action reasonably necessary to protect the marketplace and its users.</p>
      </>
    ),
  },
  {
    heading: '14. Account Suspension and Termination',
    body: (
      <>
        <p>DUWAZ may suspend or terminate access where a user materially breaches these terms, fails to meet account requirements, or engages in unlawful, abusive, or harmful conduct.</p>
        <p>Users remain responsible for any unresolved orders, payments, or obligations arising before suspension or termination.</p>
      </>
    ),
  },
  {
    heading: '15. Intellectual Property and Content',
    body: (
      <>
        <p>DUWAZ content, branding, software, user interface, and related materials remain the property of DUWAZ or its licensors, except where identifiable rights belong to a third party.</p>
        <p>Users must not copy, reproduce, or misuse DUWAZ branding, platform content, images, or proprietary information except as expressly permitted in writing.</p>
      </>
    ),
  },
  {
    heading: '16. User-Generated Content',
    body: (
      <>
        <p>Users may upload product images, shop details, product descriptions, review content, and message communications. By doing so, users confirm that they have the lawful right to share that content and that it does not infringe third-party rights.</p>
        <p>DUWAZ may review or remove content that is unlawful, misleading, abusive, or otherwise inconsistent with platform standards or applicable law.</p>
      </>
    ),
  },
  {
    heading: '17. Marketplace Disclaimer',
    body: (
      <>
        <p>DUWAZ acts as a marketplace facilitator. While DUWAZ may provide support tools, moderation, and operational infrastructure, it does not guarantee the quality, condition, legality, availability, or performance of any product or service listed by an independent seller.</p>
        <p>Users are expected to exercise their own judgment when interacting with other users, and to make decisions based on the information available on the platform.</p>
      </>
    ),
  },
  {
    heading: '18. Liability and Risk Allocation',
    body: (
      <>
        <p>To the maximum extent permitted by law, DUWAZ shall not be liable for indirect, incidental, consequential, or special damages arising out of the use of the platform, except to the extent that such liability may arise under applicable law.</p>
        <p>DUWAZ’s liability, if any, will be limited to the extent permitted by law and to the extent caused by DUWAZ’s own negligence or misconduct.</p>
      </>
    ),
  },
  {
    heading: '19. Third-Party Services',
    body: (
      <>
        <p>DUWAZ may use third-party service providers to support the marketplace, including payment processors, email services, cloud hosting, digital mapping, delivery coordination, and other operational tools.</p>
        <p>DUWAZ is not responsible for the implementation, availability, or policies of these third parties, although it may use them to support the platform and user experience.</p>
      </>
    ),
  },
  {
    heading: '20. Privacy and Data Protection',
    body: (
      <>
        <p>Use of the platform is governed by the <Link to="/privacy" className="font-medium text-[#7b4a2d] underline underline-offset-2">Privacy Policy</Link>. DUWAZ processes personal information only for the purposes disclosed in that policy and for the lawful operation of the marketplace.</p>
      </>
    ),
  },
  {
    heading: '21. Amendments',
    body: (
      <>
        <p>DUWAZ may amend these Terms & Conditions from time to time in response to operational changes, legal developments, or marketplace requirements. Continued use of the platform after any amendment is published constitutes acceptance of the updated terms.</p>
      </>
    ),
  },
  {
    heading: '22. Governing Law and Disputes',
    body: (
      <>
        <p>These Terms & Conditions are governed by the laws of the Republic of South Africa, without regard to conflict of law rules. Users agree that any disputes arising from or in connection with the platform will be subject to the jurisdiction of the South African courts having authority over the matter.</p>
      </>
    ),
  },
  {
    heading: '23. Contact Information',
    body: (
      <>
        <p>For questions, notices, or support requests, users may contact the DUWAZ support team through the contact details displayed on the platform or the designated support email address.</p>
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
        <p>These terms govern how users access and use DUWAZ, a student marketplace that connects buyers, sellers, and delivery providers in a trusted digital commerce environment.</p>
      </>
    }
    sections={sections}
  />
);

export default TermsPage;
