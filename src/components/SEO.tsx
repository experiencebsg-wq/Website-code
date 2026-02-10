import { useEffect } from 'react';

const SITE_URL = 'https://www.experiencebsg.com';
const SITE_NAME = 'BSG Beelicious Signatures Global';
const DEFAULT_DESCRIPTION =
  'Premium luxury fragrances and home scents. Shop perfumes, colognes, scented candles, diffusers and more. Nigeria & worldwide.';

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SEO({ title, description, path = '', image, noIndex }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = path ? `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}` : SITE_URL;
  const img = image?.startsWith('http') ? image : image ? `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}` : `${SITE_URL}/favicon.png`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('description', desc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', url, true);
    setMeta('og:image', img, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);
    if (noIndex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }
  }, [fullTitle, desc, url, img, noIndex]);

  return null;
}
