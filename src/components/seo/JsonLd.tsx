interface OrganizationJsonLdProps {
  locale: string;
}

export function OrganizationJsonLd({ locale }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ASARA Lyon',
    alternateName: 'Association des Syriens d\'Auvergne Rhône-Alpes',
    url: 'https://asara-lyon.fr',
    logo: 'https://asara-lyon.fr/images/logo.png',
    description: locale === 'ar' 
      ? 'جمعية السوريين في أوفيرن رون ألب - ليون، فرنسا'
      : 'Association des Syriens d\'Auvergne Rhône-Alpes - Lyon, France',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lyon',
      addressRegion: 'Auvergne-Rhône-Alpes',
      addressCountry: 'FR',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Auvergne-Rhône-Alpes',
    },
    sameAs: [
      'https://www.facebook.com/asaralyon',
      'https://www.instagram.com/asaralyon',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ProfessionalJsonLdProps {
  professional: {
    companyName?: string;
    profession: string;
    description?: string;
    city?: string;
    professionalPhone?: string;
    professionalEmail?: string;
    website?: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export function ProfessionalJsonLd({ professional }: ProfessionalJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: professional.companyName || (professional.user.firstName + ' ' + professional.user.lastName),
    description: professional.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: professional.city,
      addressCountry: 'FR',
    },
    telephone: professional.professionalPhone,
    email: professional.professionalEmail,
    url: professional.website,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface EventJsonLdProps {
  event: {
    title: string;
    description?: string;
    eventDate?: Date;
    location?: string;
  };
}

export function EventJsonLd({ event }: EventJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.eventDate?.toISOString(),
    location: {
      '@type': 'Place',
      name: event.location || 'Lyon',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lyon',
        addressCountry: 'FR',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'ASARA Lyon',
      url: 'https://asara-lyon.fr',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
