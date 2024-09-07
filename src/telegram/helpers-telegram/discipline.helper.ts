import { Branch } from '../scenes/order-scenes/discipline.scenes';

export enum ExpertiseArea {
  Education = 'ed',
  CultureAndArt = 'ca',
  Humanities = 'hu',
  Theology = 'tl',
  SocialSciences = 'ss',
  Journalism = 'jo',
  Management = 'ma',
  Law = 'lw',
  Biology = 'bl',
  NaturalSciences = 'ns',
  FormalSciences = 'fs',
  IT = 'it',
  MechanicalEngineering = 'me',
  ElectricalEngineering = 'ee',
  AutomationAndInstrumentation = 'ai',
  ChemicalAndBioengineering = 'cb',
  ElectronicsAndTelecommunications = 'et',
  ProductionAndTechnology = 'pt',
  ArchitectureAndConstruction = 'ac',
  AgriculturalSciences = 'as',
  VeterinaryMedicine = 'vm',
  Healthcare = 'hc',
  SocialWork = 'sw',
  ServiceSector = 'sv',
  MilitarySciences = 'ml',
  CivilSecurity = 'cv',
  Transport = 'tt',
}

export function onFillDisciplineBranch(str: ExpertiseArea) {
  let disciplineBranch: string;

  switch (str) {
    case ExpertiseArea.Education:
      disciplineBranch = Branch.education;
      break;
    case ExpertiseArea.CultureAndArt:
      disciplineBranch = Branch.сultureAndArt;
      break;
    case ExpertiseArea.Humanities:
      disciplineBranch = Branch.humanities;
      break;
    case ExpertiseArea.Theology:
      disciplineBranch = Branch.theology;
      break;
    case ExpertiseArea.SocialSciences:
      disciplineBranch = Branch.socialAndBehavioralSciences;
      break;
    case ExpertiseArea.Journalism:
      disciplineBranch = Branch.journalism;
      break;
    case ExpertiseArea.Management:
      disciplineBranch = Branch.managementAndAdministration;
      break;
    case ExpertiseArea.Law:
      disciplineBranch = Branch.law;
      break;
    case ExpertiseArea.Biology:
      disciplineBranch = Branch.biology;
      break;
    case ExpertiseArea.NaturalSciences:
      disciplineBranch = Branch.naturalSciences;
      break;
    case ExpertiseArea.FormalSciences:
      disciplineBranch = Branch.mathematicsAndStatistics;
      break;
    case ExpertiseArea.IT:
      disciplineBranch = Branch.informationTechnology;
      break;
    case ExpertiseArea.MechanicalEngineering:
      disciplineBranch = Branch.mechanicalEngineering;
      break;
    case ExpertiseArea.ElectricalEngineering:
      disciplineBranch = Branch.electricalEngineering;
      break;
    case ExpertiseArea.AutomationAndInstrumentation:
      disciplineBranch = Branch.automationAndInstrumentation;
      break;
    case ExpertiseArea.ChemicalAndBioengineering:
      disciplineBranch = Branch.chemicalAndBioengineering;
      break;
    case ExpertiseArea.ElectronicsAndTelecommunications:
      disciplineBranch = Branch.electronicsAndTelecommunications;
      break;
    case ExpertiseArea.ProductionAndTechnology:
      disciplineBranch = Branch.productionAndTechnologies;
      break;
    case ExpertiseArea.ArchitectureAndConstruction:
      disciplineBranch = Branch.architectureAndConstruction;
      break;
    case ExpertiseArea.AgriculturalSciences:
      disciplineBranch = Branch.agriculturalSciencesAndFood;
      break;
    case ExpertiseArea.VeterinaryMedicine:
      disciplineBranch = Branch.veterinary;
      break;
    case ExpertiseArea.Healthcare:
      disciplineBranch = Branch.healthCare;
      break;
    case ExpertiseArea.SocialWork:
      disciplineBranch = Branch.socialWork;
      break;
    case ExpertiseArea.ServiceSector:
      disciplineBranch = Branch.serviceSector;
      break;
    case ExpertiseArea.MilitarySciences:
      disciplineBranch = Branch.military;
      break;
    case ExpertiseArea.CivilSecurity:
      disciplineBranch = Branch.civilSecurity;
      break;
    case ExpertiseArea.Transport:
      disciplineBranch = Branch.transport;
      break;
    default:
      disciplineBranch = 'не визначено';
      break;
  }

  return disciplineBranch;
}
