"use server";

export {
  getOrCreateNextPeriodOrganisasi,
  createCampaign,
  toggleCampaign,
  updateCampaign,
  deleteCampaign,
} from "./campaign";

export {
  addStep,
  editStep,
  updateStepOutcome,
  deleteStep,
} from "./step";

export {
  registerApplicant,
  submitStepForm,
  passApplicantStep,
  finalizeApplicant,
} from "./applicant";
