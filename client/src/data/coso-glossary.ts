export interface GlossaryTerm {
  term: string;
  definition: string;
  category: "general" | "component" | "legal" | "technical";
  relatedTerms?: string[];
}

export const controlCoreGlossary: GlossaryTerm[] = [
  // General Terms
  {
    term: "Nebusis® ControlCore Framework",
    definition: "Universal internal control framework supporting both COSO and INTOSAI standards. System of five fundamental components for internal control in institutional environments.",
    category: "general",
    relatedTerms: ["COSO", "INTOSAI", "Internal Control"]
  },
  {
    term: "Internal Control System",
    definition: "Comprehensive set of policies, procedures and controls implemented by an entity to ensure achievement of objectives.",
    category: "general",
    relatedTerms: ["Nebusis® ControlCore", "Internal Control"]
  },
  {
    term: "Internal Control",
    definition: "Integral process applied by top management, direction and personnel of each entity, providing reasonable assurance for achieving institutional objectives.",
    category: "general",
    relatedTerms: ["ICS", "Nebusis® ControlCore"]
  },
  {
    term: "MAE",
    definition: "Máxima Autoridad Ejecutiva. La persona responsable de la dirección y administración de la entidad pública.",
    category: "general"
  },
  {
    term: "SAI",
    definition: "Supreme Audit Institution. Governing body of the internal control system responsible for oversight and compliance.",
    category: "legal",
    relatedTerms: ["INTOSAI 10-07"]
  },

  // Component Terms
  {
    term: "Ambiente de Control",
    definition: "Componente que establece el tono de la organización, influenciando la conciencia de control del personal. Es el fundamento de todos los demás componentes del control interno.",
    category: "component",
    relatedTerms: ["Integridad", "Valores Éticos", "Estructura Organizacional"]
  },
  {
    term: "Evaluación de Riesgos",
    definition: "Proceso de identificación y análisis de los riesgos relevantes para el logro de los objetivos, formando una base para determinar cómo deben administrarse los riesgos.",
    category: "component",
    relatedTerms: ["Identificación de Riesgos", "Análisis de Riesgos", "Respuesta al Riesgo"]
  },
  {
    term: "Actividades de Control",
    definition: "Políticas y procedimientos que ayudan a asegurar que se lleven a cabo las instrucciones de la dirección para mitigar los riesgos.",
    category: "component",
    relatedTerms: ["Políticas", "Procedimientos", "Controles"]
  },
  {
    term: "Información y Comunicación",
    definition: "Sistema que permite identificar, capturar y comunicar información pertinente en una forma y tiempo que facilite a las personas cumplir con sus responsabilidades.",
    category: "component",
    relatedTerms: ["Sistemas de Información", "Comunicación Interna", "Comunicación Externa"]
  },
  {
    term: "Monitoreo y Evaluación",
    definition: "Proceso que evalúa la calidad del control interno a través del tiempo y permite al sistema reaccionar dinámicamente, cambiando según las circunstancias lo ameriten.",
    category: "component",
    relatedTerms: ["Supervisión", "Evaluación Continua", "Autoevaluación"]
  },

  // Legal Terms
  {
    term: "COSO Framework",
    definition: "Committee of Sponsoring Organizations framework. International standard for internal control providing comprehensive guidance for enterprise risk management.",
    category: "legal",
    relatedTerms: ["Nebusis® ControlCore", "INTOSAI", "Internal Control"]
  },
  {
    term: "INTOSAI Standards",
    definition: "International Organization of Supreme Audit Institutions standards that provide guidance for public sector auditing and internal control implementation.",
    category: "legal", 
    relatedTerms: ["COSO Framework", "Internal Control", "Public Sector Governance"]
  },

  // Technical Terms
  {
    term: "Controles Generales",
    definition: "Controles que se aplican a todos o gran parte de los sistemas de información y ayudan a asegurar su funcionamiento continuo y apropiado.",
    category: "technical",
    relatedTerms: ["Controles de Aplicación", "Sistemas de Información"]
  },
  {
    term: "Controles de Aplicación",
    definition: "Controles específicos de una aplicación o sistema particular, diseñados para asegurar la integridad, exactitud y autorización de transacciones específicas.",
    category: "technical",
    relatedTerms: ["Controles Generales", "Sistemas de Información"]
  },
  {
    term: "ERP Systems",
    definition: "Enterprise Resource Planning systems. Integrated information systems that manage institutional financial, operational, and administrative processes.",
    category: "technical",
    relatedTerms: ["Information Systems", "Financial Information", "Management Systems"]
  },

  // Specific Procedures
  {
    term: "Integridad y Valores Éticos",
    definition: "Elemento fundamental del ambiente de control que establece normas de conducta y comportamiento ético en la organización.",
    category: "component",
    relatedTerms: ["Ambiente de Control", "Código de Ética"]
  },
  {
    term: "Estructura Organizacional",
    definition: "Marco dentro del cual se planean, ejecutan, controlan y supervisan las actividades para el logro de los objetivos institucionales.",
    category: "component",
    relatedTerms: ["Ambiente de Control", "Líneas de Autoridad"]
  },
  {
    term: "Identificación de Eventos",
    definition: "Proceso de reconocer eventos internos y externos que pueden afectar el logro de los objetivos de la entidad.",
    category: "component",
    relatedTerms: ["Evaluación de Riesgos", "Gestión de Riesgos"]
  },
  {
    term: "Supervisión Continua",
    definition: "Proceso de reconocer eventos internos y externos que pueden afectar el logro de los objetivos de la entidad.",
    category: "component",
    relatedTerms: ["Monitoreo y Evaluación", "Supervisión"]
  }
];

export function searchGlossary(query: string): GlossaryTerm[] {
  const normalizedQuery = query.toLowerCase().trim();
  return nobaciGlossary.filter(term => 
    term.term.toLowerCase().includes(normalizedQuery) ||
    term.definition.toLowerCase().includes(normalizedQuery) ||
    term.relatedTerms?.some(related => related.toLowerCase().includes(normalizedQuery))
  );
}

export function getTermByName(termName: string): GlossaryTerm | undefined {
  return nobaciGlossary.find(term => 
    term.term.toLowerCase() === termName.toLowerCase()
  );
}

export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return nobaciGlossary.filter(term => term.category === category);
}