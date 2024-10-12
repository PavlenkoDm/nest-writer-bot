import { Scenes } from 'telegraf';

interface IJoin {
  userTelegramId?: string;
  isJoinScenario?: boolean;
  fullName?: string;
  speciality?: string;
  documentPhotoId?: string;
  documentFileId?: string;
  workType?: string[];
  techSkills?: string;
  timePeriod?: string[];
  email?: string;
  phoneNumber?: string;
  personalInfo?: boolean;
}

export interface IJoinSceneState extends Scenes.SceneSessionData {
  state: IJoin;
}
