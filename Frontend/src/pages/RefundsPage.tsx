import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Overview',
    body: (
      <>
        <p>This Refunds & Returns Policy sets out the general framework for how refund and return requests may be handled on the DUWAZ marketplace.</p>
        <p>Actual refunds may depend on the specific order type, seller arrangement, payment method, and the facts of each dispute.</p>
      </>
    ),
  },
  {
    heading: '2. When a Buyer Can Request a Refund',
    body: (
      <>
        <p>Buyers may request a refund where the product is damaged, incorrect, missing, not available, or materially different from the listing description.</p>
        <p>DUWAZ may require a buyer to provide evidence, such as photos or a description of the issue, before reviewing a request.</p>
      </>
    ),
  },
  {
    heading: '3. Damaged Products',
    body: (
      <>
        <p>If a product arrives damaged, is defective, or is materially inconsistent with the listing, the buyer should notify DUWAZ and the seller promptly.</p>
        <p>Refund decisions are assessed based on the order facts, supporting evidence, and the seller’s response.</p>
      </>
    ),
  },
  {
    heading: '4. Incorrect Products',
    body: (
      <>
        <p>Where a buyer receives the wrong item, a different variant, or a product that does not match the listing, the buyer may request a review.</p>
        <p>DUWAZ may approve a refund, partial refund, replacement, or other resolution depending on the circumstances.</p>
      </>
    ),
  },
  {
    heading: '5. Missing Products',
    body: (
      <>
        <p>If a product is not delivered or is missing from the order, the buyer should notify DUWAZ as soon as the issue is identified.</p>
        <p>DUWAZ may review the order record, delivery status, and seller records before determining whether a refund is appropriate.</p>
      </>
    ),
  },
  {
    heading: '6. Product Not Available',
    body: (
      <>
        <p>If a product is no longer available after an order is placed, the buyer may be entitled to a refund or alternative arrangement depending on the circumstances and the seller’s fulfilment status.</p>
      </>
    ),
  },
  {
    heading: '7. Order Cancellation',
    body: (
      <>
        <p>Order cancellations may be possible before fulfilment, subject to the status of the order, seller activity, and any order-specific rules.</p>
        <p>Where a cancellation is accepted, the refund process may depend on the payment method and the stage of the order.</p>
      </>
    ),
  },
  {
    heading: '8. Seller Responsibilities',
    body: (
      <>
        <p>Sellers are responsible for providing accurate listings, fulfilling orders in good faith, and responding promptly to buyer refund or dispute issues.</p>
        <p>Where a seller is at fault, the seller may be required to cooperate with a refund, return, or corrective action under the applicable marketplace process.</p>
      </>
    ),
  },
  {
    heading: '9. Buyer Responsibilities',
    body: (
      <>
        <p>Buyers are expected to inspect products upon receipt, report issues promptly, and provide reasonable evidence of the problem.</p>
        <p>Buyers must not misuse the refund process or make false claims.</p>
      </>
    ),
  },
  {
    heading: '10. Collection Orders',
    body: (
      <>
        <p>For collection orders, disputes may involve the seller failing to make the item available, mismatched product details, or collection arrangements not being honoured.</p>
        <p>DUWAZ may assist with communication and review, but refund outcomes depend on the actual facts and any agreed commercial process.</p>
      </>
    ),
  },
  {
    heading: '11. Delivery Orders',
    body: (
      <>
        <p>For delivery orders, disputes may relate to damage, delay, missing items, or incorrect delivery. Buyers should report issues as soon as possible.</p>
        <p>DUWAZ may require evidence and may coordinate with the seller and delivery provider when reviewing the matter.</p>
      </>
    ),
  },
  {
    heading: '12. Payment Refunds',
    body: (
      <>
        <p>Refunds may be issued to the original payment method or through another arrangement approved by the marketplace and relevant payment provider.</p>
        <p>Refund timing may depend on the payment provider, the payment method used, and the business process in place at the time of the order.</p>
      </>
    ),
  },
  {
    heading: '13. Refund Processing',
    body: (
      <>
        <p>DUWAZ does not guarantee immediate or automatic refunds. Refunds may be manually reviewed and processed after investigation and approval.</p>
        <p>DUWAZ may use reasonable procedures to confirm the validity of the request before a refund is approved.</p>
      </>
    ),
  },
  {
    heading: '14. Disputes',
    body: (
      <>
        <p>Where a buyer and seller dispute the facts of an order, DUWAZ may review the order record, communication history, and supporting evidence to determine a fair outcome.</p>
        <p>DUWAZ may decline a claim where the issue is not supported by evidence or where the buyer has not followed the required process.</p>
      </>
    ),
  },
  {
    heading: '15. Contacting Support',
    body: (
      <>
        <p>To request a refund, report a damaged item, or ask for help with an order issue, contact the DUWAZ support team through the platform or the designated support email address.</p>
        <p>Use placeholders as needed: [CONTACT EMAIL], [SUPPORT EMAIL].</p>
      </>
    ),
  },
];

const RefundsPage = () => (
  <LegalPage
    title="Refunds & Returns"
    intro={
      <>
        <p>This policy explains the standard approach to refund and return requests on the DUWAZ marketplace.</p>
      </>
    }
    sections={sections}
  />
);

export default RefundsPage;
