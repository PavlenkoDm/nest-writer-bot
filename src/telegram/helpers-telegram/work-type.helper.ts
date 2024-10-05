import { TypeOfWork } from '../scenes/common-enums.scenes/work-type.enum';

export enum WorkType {
  Diplomas = 'Diplomas',
  TeamPapers = 'TeamPapers',
  BachelorTheses = 'BachelorTheses',
  MasterTheses = 'MasterTheses',
  TestPapers = 'TestPapers',
  Abstracts = 'Abstracts',
  PracticalWorks = 'PracticalWorks',
  Presentations = 'Presentations',
  CaseStudyReports = 'CaseStudyReports',
}

export enum WorkTypeAbbreviations {
  Diplomas = 'di',
  TeamPapers = 'tm',
  BachelorTheses = 'bt',
  MasterTheses = 'mt',
  TestPapers = 'ts',
  Abstracts = 'ab',
  PracticalWorks = 'pw',
  Presentations = 'pr',
  CaseStudyReports = 'cs',
}

export function onFillTypeOfWork(str: WorkType | WorkTypeAbbreviations) {
  let workType: string;
  switch (str) {
    case WorkType.Diplomas:
    case WorkTypeAbbreviations.Diplomas:
      workType = TypeOfWork.college_diploma;
      break;
    case WorkType.TeamPapers:
    case WorkTypeAbbreviations.TeamPapers:
      workType = TypeOfWork.coursework;
      break;
    case WorkType.BachelorTheses:
    case WorkTypeAbbreviations.BachelorTheses:
      workType = TypeOfWork.bachelor;
      break;
    case WorkType.MasterTheses:
    case WorkTypeAbbreviations.MasterTheses:
      workType = TypeOfWork.master;
      break;
    case WorkType.TestPapers:
    case WorkTypeAbbreviations.TestPapers:
      workType = TypeOfWork.test_papers;
      break;
    case WorkType.Abstracts:
    case WorkTypeAbbreviations.Abstracts:
      workType = TypeOfWork.science_articles;
      break;
    case WorkType.PracticalWorks:
    case WorkTypeAbbreviations.PracticalWorks:
      workType = TypeOfWork.laboratory_works;
      break;
    case WorkType.Presentations:
    case WorkTypeAbbreviations.Presentations:
      workType = TypeOfWork.presentations;
      break;
    case WorkType.CaseStudyReports:
    case WorkTypeAbbreviations.CaseStudyReports:
      workType = TypeOfWork.practice_report;
      break;
    default:
      workType = 'не визначено';
      break;
  }

  return workType;
}
