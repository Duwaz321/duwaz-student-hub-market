import { useEffect } from 'react';

const ShopPwaManifest = () => {
  useEffect(() => {
    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) return;

    const previousHref = manifestLink.getAttribute('href');
    manifestLink.setAttribute('href', '/shop.webmanifest');
    return () => {
      if (previousHref) manifestLink.setAttribute('href', previousHref);
    };
  }, []);

  return null;
};

export default ShopPwaManifest;
