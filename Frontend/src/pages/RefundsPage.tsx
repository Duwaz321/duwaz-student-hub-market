import LegalPage from './LegalPage';

const sections = [
  {
    heading: '1. Overview',
    body: (
      <>
        <p>This Refunds & Returns Policy sets out the general framework for how refund, return, and dispute requests may be handled on the DUWAZ marketplace.</p>
        <p>Final outcomes depend on the specific order type, the seller’s fulfilment arrangements, the payment method used, the evidence available, and the legal framework applicable to the transaction, including the Consumer Protection Act 68 of 2008 where relevant.</p>
      </>
    ),
  },
  {
    heading: '2. Grounds for a Refund Request',
    body: (
      <>
        <p>Buyers may request a refund where a product is damaged, incorrect, missing, unavailable, materially different from the listing description, or otherwise not delivered in accordance with the agreed terms.</p>
        <p>DUWAZ may require the buyer to provide evidence, such as photographs, written notes, or order records, before reviewing the request.</p>
      </>
    ),
  },
  {
    heading: '3. Damaged, Defective or Incorrect Goods',
    body: (
      <>
        <p>If a product arrives damaged, defective, or materially inconsistent with the listing, the buyer should report the issue promptly and provide reasonable evidence of the problem.</p>
        <p>DUWAZ may assess the matter and determine whether a refund, partial refund, replacement, or other resolution is appropriate based on the facts and the seller’s response.</p>
      </>
    ),
  },
  {
    heading: '4. Missing Items and Unfulfilled Orders',
    body: (
      <>
        <p>If an order is not delivered, is incomplete, or cannot be fulfilled as represented, the buyer should notify DUWAZ without delay and provide relevant information about the missing product or order issue.</p>
        <p>DUWAZ may review the order status, seller communication, payment status, and delivery records before deciding whether a refund is appropriate.</p>
      </>
    ),
  },
  {
    heading: '5. Product Availability and Cancellation',
    body: (
      <>
        <p>If a product becomes unavailable after an order is placed or the seller cannot fulfil the order, the buyer may be entitled to a refund or alternative resolution depending on the circumstances and the stage of the order.</p>
        <p>Cancellation requests may be accepted or rejected based on order status, seller activity, and the commercial arrangements in place.</p>
      </>
    ),
  },
  {
    heading: '6. Seller Responsibilities',
    body: (
      <>
        <p>Sellers are responsible for providing accurate listings, fulfilling orders in good faith, and responding promptly to buyer disputes or refund requests.</p>
        <p>Where a seller is at fault, the seller may be required to cooperate with a refund, replacement, return, or other corrective action under the applicable marketplace process.</p>
      </>
    ),
  },
  {
    heading: '7. Buyer Responsibilities',
    body: (
      <>
        <p>Buyers are expected to inspect goods promptly upon receipt, report issues without unnecessary delay, and provide reasonable evidence when requesting a refund or return.</p>
        <p>Buyers must not misuse the refund process, submit false claims, or act in bad faith.</p>
      </>
    ),
  },
  {
    heading: '8. Collection and Delivery Orders',
    body: (
      <>
        <p>For collection orders, disputes may relate to failure to make the product available, mismatch between the listing and product, or failure to honour the agreed collection arrangement.</p>
        <p>For delivery orders, disputes may relate to damage, delay, missing items, or incorrect delivery. Buyers should report issues as soon as reasonably possible so that DUWAZ can assess the matter.</p>
      </>
    ),
  },
  {
    heading: '9. Payment and Refund Timing',
    body: (
      <>
        <p>Refunds may be issued to the original payment method or through another arrangement approved by the marketplace and the relevant payment provider.</p>
        <p>Refund timing may depend on the payment provider, the payment method used, and the processing method in place at the time of the order.</p>
      </>
    ),
  },
  {
    heading: '10. Review and Dispute Resolution',
    body: (
      <>
        <p>Where a buyer and seller dispute the facts of an order, DUWAZ may review the order record, communication history, delivery records, and evidence supplied by both sides before making a reasonable determination.</p>
        <p>DUWAZ may decline a claim where the issue is unsupported by evidence or where the buyer has not followed the required marketplace process.</p>
      </>
    ),
  },
  {
    heading: '11. Consumer Protection Considerations',
    body: (
      <>
        <p>DUWAZ intends to operate in a manner consistent with the Consumer Protection Act 68 of 2008 and other applicable South African law where relevant to consumer rights and marketplace conduct.</p>
        <p>This policy does not replace or supersede any rights, protections, or remedies that apply to a buyer or seller under applicable law, and the final legal position will depend on the specific facts and the governing law.</p>
      </>
    ),
  },
  {
    heading: '12. Contact for Order Issues',
    body: (
      <>
        <p>To request a refund, report a damaged or incorrect order, or ask for assistance with a fulfilment issue, users should contact the DUWAZ support team through the platform or the designated support email address.</p>
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
        <p>This policy sets out the standard approach DUWAZ may use for handling refund, return, and order-dispute requests in a fair and transparent manner.</p>
      </>
    }
    sections={sections}
  />
);

export default RefundsPage;
