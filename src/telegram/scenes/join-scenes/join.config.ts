import { Scenes } from 'telegraf';

interface IJoin {
  isJoinScenario?: boolean;
  fullName?: string;
  speciality?: string;
  documentFotoId?: string;
  documentFileId?: string;
  workType?: string[];
  techSkills?: string;
  timePeriod?: string[];
  email?: string;
}

export interface IJoinSceneState extends Scenes.SceneSessionData {
  state: IJoin;
}
