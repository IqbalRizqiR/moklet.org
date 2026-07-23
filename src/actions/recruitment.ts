
export type { SuccessLink } from "./recruitment/step";

export {
  getOrCreateNextPeriodOrganisasi,
  createCampaign,
  toggleCampaign,
  updateCampaign,
} from "./recruitment/campaign";

export {
  addStep,
  editStep,
  updateStepOutcome,
  deleteStep,
} from "./recruitment/step";

export {
  registerApplicant,
  submitStepForm,
  passApplicantStep,
  finalizeApplicant,
} from "./recruitment/applicant";
