import { Branch } from '../scenes/order-scenes/discipline.scenes';

export enum ExpertiseArea {
  Education = 'Education',
  CultureAndArt = 'CultureAndArt',
  Humanities = 'Humanities',
  Theology = 'Theology',
  SocialSciences = 'SocialSciences',
  Journalism = 'Journalism',
  Management = 'Management',
  Law = 'Law',
  Biology = 'Biology',
  NaturalSciences = 'NaturalSciences',
  FormalSciences = 'FormalSciences',
  IT = 'IT',
  MechanicalEngineering = 'MechanicalEngineering',
  ElectricalEngineering = 'ElectricalEngineering',
  AutomationAndInstrumentation = 'AutomationAndInstrumentation',
  ChemicalAndBioengineering = 'ChemicalAndBioengineering',
  ElectronicsAndTelecommunications = 'ElectronicsAndTelecommunications',
  ProductionAndTechnology = 'ProductionAndTechnology',
  ArchitectureAndConstruction = 'ArchitectureAndConstruction',
  AgriculturalSciences = 'AgriculturalSciences',
  VeterinaryMedicine = 'VeterinaryMedicine',
  Healthcare = 'Healthcare',
  SocialWork = 'SocialWork',
  ServiceSector = 'ServiceSector',
  MilitarySciences = 'MilitarySciences',
  CivilSecurity = 'CivilSecurity',
  Transport = 'Transport',
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
