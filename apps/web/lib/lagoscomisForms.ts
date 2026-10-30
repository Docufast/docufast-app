// Which LagosCoMiS form each affidavit order type is filed on (#184, #185).
// Sheriff supplies the mapping (due Mon 26 Oct 2026, beta types first). Until a type is
// mapped, the filing sheet says so and staff ask Sheriff before filing.
// needsVideo: true when the affidavit type needs an identification video (Sheriff's list).

export interface CourtFormMapping {
  form: string | null;
  needsVideo: boolean | null; // null = not confirmed yet
}

export const LAGOSCOMIS_FORMS: Record<string, CourtFormMapping> = {
  // Fill from Sheriff's mapping, e.g.:
  // loss_general: { form: "<form name exactly as shown on LagosCoMiS>", needsVideo: false },
};

export function courtFormFor(orderType: string): CourtFormMapping {
  return LAGOSCOMIS_FORMS[orderType] || { form: null, needsVideo: null };
}
