import { TypeOfWork } from '../scenes/order-scenes/type.scenes';

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

export function onFillTypeOfWork(string: WorkType) {
  let workType: string;
  switch (string) {
    case WorkType.Diplomas:
      workType = TypeOfWork.college_diploma;
      break;
    case WorkType.TeamPapers:
      workType = TypeOfWork.coursework;
      break;
    case WorkType.BachelorTheses:
      workType = TypeOfWork.bachelor;
      break;
    case WorkType.MasterTheses:
      workType = TypeOfWork.master;
      break;
    case WorkType.TestPapers:
      workType = TypeOfWork.test_papers;
      break;
    case WorkType.Abstracts:
      workType = TypeOfWork.science_articles;
      break;
    case WorkType.PracticalWorks:
      workType = TypeOfWork.laboratory_works;
      break;
    case WorkType.Presentations:
      workType = TypeOfWork.presentations;
      break;
    case WorkType.CaseStudyReports:
      workType = TypeOfWork.practice_report;
      break;
    default:
      workType = 'не визначено';
      break;
  }

  return workType;
}
