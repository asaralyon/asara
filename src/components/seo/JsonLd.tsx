interface OrganizationJsonLdProps {
  locale: string;
}

export function OrganizationJsonLd({ locale }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ASARA',
    alternateName: 'Annuaire des Syriens de France',
    url: 'https://asara-france.fr',
    logo: 'https://asara-france.fr/images/logo.png',
    description: locale === 'ar' 
      ? 'دليل السوريين في فرنسا - فرنسا'
      : 'Association des Syriens d\'France - France',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lyon',
      addressRegion: 'France',
      addressCountry: 'FR',
    },
    areaServed: {
      '@type': 'Place',
      name: 'France',
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
      name: 'ASARA',
      url: 'https://asara-france.fr',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
