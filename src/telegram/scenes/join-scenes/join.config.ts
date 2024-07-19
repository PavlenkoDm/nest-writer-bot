import { Scenes } from 'telegraf';

// interface IBranchSpeciAlization {
//   branch?: string;
//   specialization?: string;
// }

interface IJoin {
  isJoinScenario?: boolean;
  fullName?: string;
  speciality?: string;
}

export interface IJoinSceneState extends Scenes.SceneSessionData {
  state: IJoin;
}
