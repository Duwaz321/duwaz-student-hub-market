import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Becoming a Seller',
    body: (
      <>
        <p>Any user may apply to become a seller on DUWAZ by registering for a seller account, creating a shop or listing profile, and meeting the onboarding requirements established by the platform.</p>
      </>
    ),
  },
  {
    heading: '2. Seller Account Requirements',
    body: (
      <>
        <p>Sellers must provide accurate and current information, maintain the confidentiality of their account, and use the platform for lawful commercial activity.</p>
        <p>DUWAZ may request additional verification or information as part of onboarding, account maintenance, dispute handling, or compliance review.</p>
      </>
    ),
  },
  {
    heading: '3. Product Listings and Marketplace Integrity',
    body: (
      <>
        <p>Sellers must ensure each listing is accurate, complete, and compliant with the platform rules. Listings must not be misleading, deceptive, counterfeit, unlawful, or otherwise inconsistent with applicable law.</p>
      </>
    ),
  },
  {
    heading: '4. Accurate Product Information',
    body: (
      <>
        <p>Sellers must provide truthful information about the product, its condition, price, quantity, delivery arrangements, and expected fulfilment terms.</p>
        <p>Failure to provide accurate information may result in a listing removal, account restriction, or dispute resolution outcomes.</p>
      </>
    ),
  },
  {
    heading: '5. Product Images and Brand Content',
    body: (
      <>
        <p>Sellers must use product images and other content that accurately represent the item being sold. Images and branding must not infringe third-party rights or mislead buyers.</p>
      </>
    ),
  },
  {
    heading: '6. Pricing and Commercial Conduct',
    body: (
      <>
        <p>Sellers are responsible for setting lawful and accurate prices. Manipulative pricing, deceptive discounting, bait-and-switch conduct, or misleading commercial activity may be treated as abusive conduct.</p>
      </>
    ),
  },
  {
    heading: '7. Stock Availability and Fulfilment Readiness',
    body: (
      <>
        <p>Sellers must keep their stock and availability status up to date. Listings should not be used to take payment for items that cannot be delivered or fulfilled as represented.</p>
      </>
    ),
  },
  {
    heading: '8. Orders and Response Times',
    body: (
      <>
        <p>Once an order is received, sellers must review it promptly and either fulfil it or communicate the next steps in a timely and professional manner.</p>
        <p>Where a seller cannot fulfil an order, the seller must inform DUWAZ and the buyer as early as possible and cooperate with a reasonable resolution.</p>
      </>
    ),
  },
  {
    heading: '9. Order Fulfilment',
    body: (
      <>
        <p>Sellers are responsible for meeting the fulfilment expectations described in their listings and any order-specific arrangements agreed with the buyer.</p>
        <p>Timing, delivery coordination, and collection arrangements must be handled in good faith and with reasonable communication.</p>
      </>
    ),
  },
  {
    heading: '10. Buyer Communication',
    body: (
      <>
        <p>Sellers must communicate professionally and promptly with buyers regarding order updates, stock issues, delivery arrangements, and refund or return concerns.</p>
      </>
    ),
  },
  {
    heading: '11. Prohibited Goods and Services',
    body: (
      <>
        <p>Prohibited goods or services include those that are illegal, unsafe, counterfeit, restricted, or otherwise banned by applicable law or platform policy.</p>
        <p>Sellers must not list products or services that are dangerous, unlawful, or inconsistent with the lawful operation of the marketplace.</p>
      </>
    ),
  },
  {
    heading: '12. Fraud, Abuse and Account Integrity',
    body: (
      <>
        <p>Fraudulent behaviour includes fake orders, fake reviews, misleading product information, deceptive pricing, and misrepresentation of identity, stock, or status.</p>
        <p>DUWAZ may suspend or terminate a seller account if fraud, abuse, or policy breaches are suspected or confirmed.</p>
      </>
    ),
  },
  {
    heading: '13. Counterfeit or Infringing Goods',
    body: (
      <>
        <p>Sellers must not list counterfeit or infringing goods. Listing or selling counterfeit products may lead to immediate removal of the listing, suspension of the seller account, and reporting to the relevant authorities or rights holders where required.</p>
      </>
    ),
  },
  {
    heading: '14. Intellectual Property and Rights Clearance',
    body: (
      <>
        <p>Sellers must ensure that they have the right to use any images, branding, descriptions, or other content included in their listings or shop profile.</p>
        <p>Third-party intellectual property must not be used without permission or lawful authority.</p>
      </>
    ),
  },
  {
    heading: '15. Refunds and Returns',
    body: (
      <>
        <p>Sellers must cooperate with valid refund and return requests in good faith where the issue is supported by evidence and falls within the applicable process.</p>
        <p>DUWAZ may require sellers to respond promptly to support requests so that buyer disputes can be resolved fairly and efficiently.</p>
      </>
    ),
  },
  {
    heading: '16. Seller Conduct',
    body: (
      <>
        <p>Sellers must act honestly, professionally, and respectfully in all dealings with buyers, DUWAZ staff, delivery partners, and other marketplace participants.</p>
        <p>Abusive, misleading, threatening, or deceptive behaviour is not permitted.</p>
      </>
    ),
  },
  {
    heading: '17. Account Suspension and Restrictions',
    body: (
      <>
        <p>DUWAZ may suspend or restrict a seller account where the seller breaches these terms, fails to provide lawful information, or otherwise creates risk for buyers or the marketplace.</p>
        <p>Suspension does not remove obligations already arising under active orders or existing commercial arrangements.</p>
      </>
    ),
  },
  {
    heading: '18. Seller Data and Records',
    body: (
      <>
        <p>Seller data is processed for account management, transaction processing, support, and marketplace operations.</p>
        <p>Sellers are responsible for keeping their business details, contact details, and product data accurate and up to date.</p>
      </>
    ),
  },
  {
    heading: '19. Consumer Protection and Legal Compliance',
    body: (
      <>
        <p>Sellers must comply with all applicable South African laws, including the Consumer Protection Act 68 of 2008 where a seller’s conduct affects consumer rights, product quality, pricing, or disclosure obligations.</p>
        <p>DUWAZ may act to remove or restrict listings where a seller is not meeting lawful standards or marketplace requirements.</p>
      </>
    ),
  },
  {
    heading: '20. Disputes and Changes to Terms',
    body: (
      <>
        <p>DUWAZ may assist with disputes between buyers and sellers, but the final outcome depends on the facts of each case and the commercial rules in place at the time.</p>
        <p>DUWAZ may revise these Seller Terms from time to time. Continued selling on the platform after changes are published constitutes acceptance of the updated terms.</p>
      </>
    ),
  },
  {
    heading: '21. Contact Information',
    body: (
      <>
        <p>For seller onboarding, support, disputes, or account questions, contact the DUWAZ support team using the platform contact details or the designated support email address.</p>
        <p>Use placeholders as needed: [DUWAZ LEGAL ENTITY NAME], [CONTACT EMAIL], [SUPPORT EMAIL].</p>
      </>
    ),
  },
];

const SellerTermsPage = () => (
  <LegalPage
    title="Seller Terms"
    intro={
      <>
        <p>These Seller Terms set out the responsibilities of persons selling products or services through the DUWAZ marketplace, with reference to South African consumer, data, and commercial law principles.</p>
      </>
    }
    sections={sections}
  />
);

export default SellerTermsPage;
