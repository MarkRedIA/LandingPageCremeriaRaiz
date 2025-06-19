export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cremería Raíz",
    "description": "Cremería artesanal mexicana dedicada a la producción y venta de quesos, yogures y productos lácteos frescos y naturales.",
    "url": "https://cremeria-raiz.com",
    "logo": "/images/queso.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+52-55-0000-0000",
      "contactType": "Atención al Cliente",
      "availableLanguage": ["Spanish"]
    },
    "sameAs": [
      "https://facebook.com/cremeria.raiz",
      "https://instagram.com/cremeria.raiz"
    ],
    "service": [
      {
        "@type": "Service",
        "name": "Quesos Artesanales",
        "description": "Quesos frescos y maduros elaborados con métodos tradicionales."
      },
      {
        "@type": "Service",
        "name": "Yogur Natural",
        "description": "Yogur artesanal hecho con leche fresca."
      },
      {
        "@type": "Service",
        "name": "Crema Fresca",
        "description": "Crema de leche natural, ideal para la cocina mexicana."
      }
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cremería Raíz",
    "url": "https://cremeria-raiz.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cremeria-raiz.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  );
} 