import { Link, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';

interface InfoSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

interface InfoContent {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  table?: { head: string[]; rows: string[][] };
}

const CONTENT: Record<string, InfoContent> = {
  faq: {
    eyebrow: 'Support',
    title: 'Frequently Asked Questions',
    intro: 'Everything you need to know about ordering from LuxeFashion. Still stuck? Email us at support@luxefashion.com — we reply within one business day.',
    sections: [
      {
        heading: 'How do I track my order?',
        paragraphs: [
          'Once your order ships, you will receive a confirmation email with a tracking link. You can also view the live status of any order from your Account page under Order History.',
        ],
      },
      {
        heading: 'Can I change or cancel my order?',
        paragraphs: [
          'Orders can be changed or cancelled within 2 hours of placement by contacting support. After that window, your order enters our fulfilment process and can no longer be modified — but you can always return it free of charge once it arrives.',
        ],
      },
      {
        heading: 'What payment methods do you accept?',
        paragraphs: [
          'We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and bank transfer for orders over $500.',
        ],
      },
      {
        heading: 'Do you ship internationally?',
        paragraphs: [
          'Yes — we ship to over 80 countries, free of charge, on every order. Delivery times and any applicable duties are shown at checkout and in our Shipping & Returns page.',
        ],
      },
      {
        heading: 'How do I find the right size?',
        paragraphs: [
          'Every product page lists the sizes available, and our Size Guide has full garment measurements. Between sizes? We recommend sizing up for outerwear and down for knitwear.',
        ],
      },
    ],
  },

  'shipping-returns': {
    eyebrow: 'Support',
    title: 'Shipping & Returns',
    intro: 'Free worldwide shipping on every order, and 30-day hassle-free returns — no questions asked.',
    sections: [
      {
        heading: 'Shipping',
        list: [
          'Standard shipping (5–8 business days) — free on all orders, worldwide',
          'Express shipping (2–3 business days) — free on orders over $250, otherwise $15',
          'Orders placed before 2pm ET ship the same business day',
          'Every order includes tracking, sent to your email as soon as it ships',
        ],
      },
      {
        heading: 'Returns',
        list: [
          '30 days from delivery to return any unworn item with tags attached',
          'Returns are free — a prepaid label is included in every parcel',
          'Refunds are issued to your original payment method within 5 business days of us receiving your return',
          'Exchanges ship out as soon as your return is scanned at the carrier',
        ],
      },
      {
        heading: 'Duties & customs',
        paragraphs: [
          'For deliveries outside the EU and US, local customs authorities may apply import duties. These are calculated and shown at checkout where possible; where they are not, they remain the responsibility of the recipient.',
        ],
      },
    ],
  },

  'size-guide': {
    eyebrow: 'Support',
    title: 'Size Guide',
    intro: 'All measurements are garment measurements in centimetres. Our cuts are true to size — take your usual size for the intended fit.',
    sections: [
      {
        heading: 'How to measure',
        list: [
          'Chest — measure around the fullest part of your chest, keeping the tape horizontal',
          'Waist — measure around your natural waistline, above the hips',
          'Hips — measure around the fullest part of your hips',
        ],
      },
    ],
    table: {
      head: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)'],
      rows: [
        ['XS', '84–88', '68–72', '88–92'],
        ['S', '88–94', '72–78', '92–97'],
        ['M', '94–100', '78–85', '97–102'],
        ['L', '100–107', '85–92', '102–108'],
        ['XL', '107–114', '92–100', '108–114'],
      ],
    },
  },

  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'Last updated: January 2025. This policy explains what data LuxeFashion collects, why, and the control you have over it.',
    sections: [
      {
        heading: 'What we collect',
        list: [
          'Account details — your name and email address when you register',
          'Order information — items purchased, shipping address, and order history',
          'Usage data — anonymised analytics about how the site is used, so we can improve it',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use your data to fulfil orders, provide customer support, and — only with your consent — send you our newsletter. We never sell your personal data to third parties.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can request a copy of your data, correct it, or delete your account at any time by emailing support@luxefashion.com. Newsletter emails can be stopped with one click via the unsubscribe link in every message.',
        ],
      },
    ],
  },

  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'Last updated: January 2025. By using LuxeFashion you agree to these terms.',
    sections: [
      {
        heading: 'Orders & pricing',
        paragraphs: [
          'All prices are shown in USD and include applicable taxes where stated. We reserve the right to cancel orders placed at incorrect prices due to typographical errors, with a full refund issued immediately.',
        ],
      },
      {
        heading: 'Product availability',
        paragraphs: [
          'Stock levels shown on the site are updated in real time, but in rare cases an item may sell out before your order is confirmed. If that happens we will notify you within 24 hours and refund you in full.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: [
          'You agree not to misuse the site, attempt to access systems without authorisation, or use the site for any unlawful purpose. Accounts that violate these terms may be suspended.',
        ],
      },
    ],
  },

  cookies: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    intro: 'Last updated: January 2025. We keep cookies to the minimum needed to run the store.',
    sections: [
      {
        heading: 'Essential cookies',
        paragraphs: [
          'These keep you signed in and remember your cart between visits. The site cannot function without them, and they are never used for advertising.',
        ],
      },
      {
        heading: 'Analytics cookies',
        paragraphs: [
          'We use privacy-friendly, anonymised analytics to understand which pages are useful. No cross-site tracking, no advertising profiles, no data sold.',
        ],
      },
      {
        heading: 'Managing cookies',
        paragraphs: [
          'You can clear or block cookies at any time in your browser settings. Blocking essential cookies will sign you out and empty your saved cart on each visit.',
        ],
      },
    ],
  },
};

function InfoPage() {
  const { slug } = useParams();
  const content = slug ? CONTENT[slug] : undefined;

  if (!content) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-8 py-40 text-center">
          <h1 className="text-4xl md:text-5xl text-ink mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Page not found
          </h1>
          <p className="text-muted mb-10 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        title={content.title}
        description={content.intro.slice(0, 155)}
        path={`/info/${slug}`}
      />
      <div className="max-w-3xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-3" style={{ fontFamily: 'var(--font-body)' }}>
            {content.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl text-ink mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {content.title}
          </h1>
          <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            {content.intro}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {content.sections.map((section) => (
            <section key={section.heading} className="card p-8">
              <h2 className="text-2xl text-ink mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                {section.heading}
              </h2>
              {section.paragraphs?.map((p) => (
                <p key={p.slice(0, 40)} className="text-sm text-muted leading-relaxed mb-3 last:mb-0"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="space-y-2">
                  {section.list.map((item) => (
                    <li key={item.slice(0, 40)} className="text-sm text-muted leading-relaxed flex gap-3"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="text-ink flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Optional measurement table (Size Guide) */}
        {content.table && (
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr className="border-b border-border bg-surface">
                  {content.table.head.map((h) => (
                    <th key={h} className="text-left text-xs uppercase tracking-widest text-ink font-medium px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.table.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-border last:border-0">
                    {row.map((cell, i) => (
                      <td key={cell} className={`px-6 py-4 ${i === 0 ? 'text-ink font-medium' : 'text-muted'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-14 text-center">
          <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </Layout>
  );
}

export default InfoPage;
