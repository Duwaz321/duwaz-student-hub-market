import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Becoming a Seller',
    body: (
      <>
        <p>Any user may apply to become a seller on DUWAZ by creating a seller account, creating a shop or listing profile, and complying with platform onboarding requirements.</p>
      </>
    ),
  },
  {
    heading: '2. Seller Account Requirements',
    body: (
      <>
        <p>Sellers must provide accurate information, maintain the confidentiality of their account, and use the platform for lawful commercial activity.</p>
        <p>DUWAZ may require additional verification or information from a seller as part of onboarding, account maintenance, or dispute resolution.</p>
      </>
    ),
  },
  {
    heading: '3. Product Listings',
    body: (
      <>
        <p>Sellers must ensure that each listing is accurate, complete, and compliant with platform rules. Product listings must not be misleading, fraudulent, counterfeit, or otherwise unlawful.</p>
      </>
    ),
  },
  {
    heading: '4. Accurate Product Information',
    body: (
      <>
        <p>Sellers must provide truthful information about the product, its condition, price, quantity, delivery arrangements, and expected fulfilment terms.</p>
        <p>Failure to provide accurate information may lead to listing removal, account restrictions, or dispute resolution outcomes.</p>
      </>
    ),
  },
  {
    heading: '5. Product Images',
    body: (
      <>
        <p>Sellers must use product images that accurately represent the item being sold. Images must not infringe third-party rights or mislead buyers.</p>
      </>
    ),
  },
  {
    heading: '6. Pricing',
    body: (
      <>
        <p>Sellers are responsible for setting lawful and accurate prices. Price manipulation, bait pricing, or misleading discounts may be considered abusive conduct.</p>
      </>
    ),
  },
  {
    heading: '7. Stock Availability',
    body: (
      <>
        <p>Sellers must keep their stock and availability status up to date. Listings should not be used to take payment for items that are unavailable or cannot be fulfilled.</p>
      </>
    ),
  },
  {
    heading: '8. Orders',
    body: (
      <>
        <p>Once an order is received, sellers must review it promptly and fulfil or communicate the next steps in a timely and professional manner.</p>
        <p>Where a seller cannot fulfil an order, the seller must inform DUWAZ and the buyer as early as possible and cooperate with a reasonable resolution.</p>
      </>
    ),
  },
  {
    heading: '9. Order Fulfilment',
    body: (
      <>
        <p>Sellers are responsible for meeting the fulfilment expectations described in their listings and any agreed order-specific arrangements.</p>
        <p>Timing, availability, and collection or delivery coordination must be handled in good faith.</p>
      </>
    ),
  },
  {
    heading: '10. Buyer Communication',
    body: (
      <>
        <p>Sellers must communicate professionally and promptly with buyers regarding order updates, stock issues, delivery arrangements, and refund or returns concerns.</p>
      </>
    ),
  },
  {
    heading: '11. Prohibited Products',
    body: (
      <>
        <p>Prohibited products include illegal, unsafe, counterfeit, restricted, or otherwise policy-banned items and services.</p>
        <p>Sellers must not list products that are dangerous, unlawful, or incompatible with the marketplace or applicable local laws.</p>
      </>
    ),
  },
  {
    heading: '12. Fraud',
    body: (
      <>
        <p>Fraudulent behaviour includes fake orders, fake reviews, misleading product information, deceptive pricing, and misrepresentation of identity or status.</p>
        <p>DUWAZ may suspend or terminate a seller account if fraud or abuse is suspected.</p>
      </>
    ),
  },
  {
    heading: '13. Counterfeit Products',
    body: (
      <>
        <p>Sellers must not list counterfeit or infringing goods. Listing or selling counterfeit products may result in removal of the listing, suspension of the account, and legal reporting if required.</p>
      </>
    ),
  },
  {
    heading: '14. Intellectual Property',
    body: (
      <>
        <p>Sellers must ensure they have the rights to use any images, branding, descriptions, or content included in their listings and shop profile.</p>
        <p>Third-party intellectual property must not be used without permission or lawful authority.</p>
      </>
    ),
  },
  {
    heading: '15. Refunds and Returns',
    body: (
      <>
        <p>Sellers must cooperate with refund and return requests in good faith where the issue is valid and supported by evidence.</p>
        <p>DUWAZ may require sellers to respond to support requests promptly so that buyer disputes can be resolved fairly.</p>
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
    heading: '17. Account Suspension',
    body: (
      <>
        <p>DUWAZ may suspend or restrict a seller account where the seller breaches these terms, fails to provide lawful information, or otherwise creates risk for buyers or the marketplace.</p>
        <p>Suspension does not remove any obligations that already arose under an active listing or order.</p>
      </>
    ),
  },
  {
    heading: '18. Seller Data',
    body: (
      <>
        <p>Seller data is processed for the purposes of account management, transaction processing, service support, and marketplace operations.</p>
        <p>Sellers are responsible for keeping their business details, contact details, and product data accurate and up to date.</p>
      </>
    ),
  },
  {
    heading: '19. Disputes',
    body: (
      <>
        <p>DUWAZ may help resolve disputes between buyers and sellers, but the final commercial outcome depends on the facts of each case and any agreed business rules.</p>
      </>
    ),
  },
  {
    heading: '20. Changes to Seller Terms',
    body: (
      <>
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
        <p>These Seller Terms set out the responsibilities of people selling products or services through the DUWAZ marketplace.</p>
      </>
    }
    sections={sections}
  />
);

export default SellerTermsPage;
