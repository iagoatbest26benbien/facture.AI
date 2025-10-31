export const legalMentions = {
  autoEntrepreneur: {
    tva: "TVA non applicable, art. 293 B du CGI",
    immatriculation:
      "Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM)",
    capital: null as string | null,
  },
  sasu: {
    tva: "TVA : FR XX XXXXXXXXX",
    immatriculation: "RCS Paris XXX XXX XXX",
    capital: "Capital social : XXX €",
  },
  penalites:
    "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.",
  escompte: "Pas d'escompte pour paiement anticipé",
} as const;

export const COLORS = {
  primary: "blue-600",
  secondary: "slate-100",
  accent: "green-500",
  error: "red-500",
  background: "white",
} as const;

export const PRICING = {
  free: { price: 0, invoicesPerMonth: 3 },
  pro: { price: 19, invoicesPerMonth: Infinity },
} as const;
