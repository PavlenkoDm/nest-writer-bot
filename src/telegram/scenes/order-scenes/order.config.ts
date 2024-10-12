import { Scenes } from 'telegraf';

interface IBranchSpeciAlization {
  branch?: string;
  specialization?: string;
}

interface IOrder {
  userTelegramId?: string;
  isScenario?: boolean;
  fromCalculation?: boolean;
  disciplineFlag?: boolean;
  uniquenessFlag?: boolean;
  typeOfWork?: string;
  discipline?: IBranchSpeciAlization;
  theme?: string;
  uniqueness?: number;
  timeLimit?: string;
  fileId?: string;
  comment?: string;
  privacyPolicy?: boolean;
}

export interface IOrderSceneState extends Scenes.SceneSessionData {
  state: IOrder;
}
