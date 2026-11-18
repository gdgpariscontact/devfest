// Auto-généré par scripts/generate-openfeedback-import.js — ne pas éditer à la main.
window.OPENFEEDBACK_DAY_URL = "https://openfeedback.io/sBSRvQdfgZv87UJ1Zr8p/2026-11-27";
window.OPENFEEDBACK_SESSION_IDS = {
  "09:20\u0001Keynote GDG": "df26-000",
  "09:35\u0001Silence... Ça tourne ! : De l'éco-volontariat à la promotion de mon side project en Australie !": "df26-001",
  "09:55\u0001AI Hype vs. Ground Reality: Where Does the Time (and Money) Actually Go?": "df26-002",
  "10:35\u0001Astro GitOps - Press ⓧ to start": "df26-003",
  "10:35\u0001Du frigo à l’assiette : ce que mijote vraiment votre bundler JavaScript": "df26-004",
  "10:35\u00013 Mois Au Lieu De 8: Comment L'IA Structurée amplifie le développement": "df26-005",
  "10:35\u0001Build the DevFest Concierge: Live, with Google CX Agent Studio": "df26-006",
  "10:35\u0001Tactical DDD : Redonnons du sens au code par la pratique": "df26-007",
  "11:30\u0001Qui a marqué le plus de buts ? construire un agent IA qui interroge des données en langage naturel": "df26-008",
  "11:30\u0001Chaque token compte : de l'assistant IA à la pipeline": "df26-009",
  "11:30\u0001A l'abordage du score Lighthouse !": "df26-010",
  "12:25\u0001Sécurisez vos prototypes avec OAuth2-Proxy, Anubis": "df26-011",
  "12:25\u0001Coupable ! Le procès d'un container malveillant dans Kubernetes": "df26-012",
  "12:25\u0001Gemma 4 & Serverless GPU ou comment déployer facilement son LLM": "df26-013",
  "12:25\u0001MLOps - Understand and mitigate machine learning models decay in production": "df26-014",
  "12:25\u0001Dette cognitive et dette d’intention : le coût caché du code généré par IA": "df26-015",
  "13:45\u0001`gcloud run compose up` - ce que la doc ne dit pas (encore)": "df26-016",
  "13:45\u0001Industrialiser l'IA en équipe : des skills qui encodent vos conventions": "df26-017",
  "13:45\u0001Hello JDK 25, bye les Streams chiants!": "df26-018",
  "13:45\u0001Maîtrisez vos déploiements avec OpenFeature et les Feature Flags": "df26-019",
  "13:45\u0001Build Multi Agent Systems with A2A": "df26-020",
  "14:40\u0001On a orchestré des IA pour automatiser ce que personne ne voulait faire": "df26-021",
  "14:40\u0001HATEOAS et SPA, a LOVE(OAS) story": "df26-022",
  "14:40\u0001L'aventure agentique de Carrefour : du déploiement en 2025 à la sécurité et l'observabilité": "df26-023",
  "15:45\u0001ML Kit reloaded: hands-on with on-device GenAI APIs": "df26-024",
  "15:45\u0001Ne dessinez plus vos architectures : codez-les": "df26-025",
  "15:45\u0001Testez vos tests avant qu’ils ne vous trahissent : le mutation testing !": "df26-026",
  "15:45\u0001SQL Showdown: A Competitive Query-Writing Workshop": "df26-027",
  "15:45\u0001Antigravity : De l'idée à l'app, de l'assistance à l'orchestration": "df26-028",
  "16:40\u0001RAGots et Hallucinations : votre chatbot passe devant le juge": "df26-029",
  "16:40\u0001Tech Radar as Code : comment aligner ses choix technologiques et les rendre visibles": "df26-030",
  "16:40\u0001Kube-green: éviter le gaspillage inutile de ressources dans Kubernetes": "df26-031"
};

window.getOpenFeedbackUrl = function getOpenFeedbackUrl(session) {
  if (!session || !window.OPENFEEDBACK_SESSION_IDS) return null;
  const key = session.timeStart + '\u0001' + session.title;
  const sessionId = window.OPENFEEDBACK_SESSION_IDS[key];
  if (!sessionId) return null;
  return window.OPENFEEDBACK_DAY_URL + '/' + sessionId;
};
