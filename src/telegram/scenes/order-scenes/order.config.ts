import { Scenes } from 'telegraf';

interface IBranchSpeciAlization {
  branch?: string;
  specialization?: string;
}

interface IOrder {
  isScenario?: boolean;
  typeOfWork?: string;
  discipline?: IBranchSpeciAlization;
  theme?: string;
  uniqueness?: number;
  timeLimit?: string;
  fileId?: string;
  comment?: string;
}

export interface IOrderSceneState extends Scenes.SceneSessionData {
  state: IOrder;
}
