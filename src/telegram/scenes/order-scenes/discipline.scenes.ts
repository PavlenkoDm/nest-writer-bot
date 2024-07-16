import { Injectable } from '@nestjs/common';
import {
  Action,
  Ctx,
  On,
  Scene,
  SceneEnter,
  SceneLeave,
} from 'nestjs-telegraf';
import { Markup, Scenes } from 'telegraf';
import { IOrderSceneState } from './order.config';
import {
  Forbidden,
  onSceneGateFromCommand,
} from '../helpers-scenes/scene-gate.helper';

enum Branch {
  education = 'Освіта',
  сultureAndArt = 'Культура і мистецтво',
  humanities = 'Гуманітарні науки',
  theology = 'Богослов’я',
  socialAndBehavioralSciences = 'Соціальні та поведінкові науки',
  journalism = 'Журналістика',
  managementAndAdministration = 'Управління та адміністрування',
  law = 'Право',
  biology = 'Біологія',
  naturalSciences = 'Природничі науки',
  mathematicsAndStatistics = 'Математика та статистика',
  informationTechnology = 'Інформаційні технології',
  mechanicalEngineering = 'Механічна інженерія',
  electricalEngineering = 'Електрична інженерія',
  automationAndInstrumentation = 'Автоматизація та приладобудування',
  chemicalAndBioengineering = 'Хімічна та біоінженерія',
  electronicsAndTelecommunications = 'Електроніка та телекомунікації',
}
// =========== Specializations ====================================
enum EducationSpecialization {
  sciencesAboutEducation = 'Науки про освіту',
  preSchoolEducation = 'Дошкільна освіта',
  primaryEducation = 'Початкова освіта',
  secondaryEducation = 'Середня освіта (за предметними спеціалізаціями)',
  professionalEducation = 'Професійна освіта (за спеціалізаціями)',
  specialEducation = 'Спеціальна освіта',
  physicalCultureAndSports = 'Фізична культура і спорт',
}

enum CultureAndArt {
  audiovisualArtAndProduction = 'Аудіовізуальне мистецтво та виробництво',
  design = 'Дизайн',
  fineArtDecorativeRestoration = 'Образотворче мистецтво, декоративне мистецтво, реставрація',
  choreography = 'Хореографія',
  musicalArt = 'Музичне мистецтво',
  stageArt = 'Сценічне мистецтво',
  museumMonument = 'Музеєзнавство, пам’яткознавство',
  socioCulturalActivities = 'Менеджмент соціокультурної діяльності',
  libraryAndArchivalAffairs = 'Інформаційна, бібліотечна та архівна справа',
}

enum Humanities {
  religiousStudies = 'Релігієзнавство',
  historyAndArchaeology = 'Історія та археологія',
  philosophy = 'Філософія',
  culturology = 'Культурологія',
  philology = 'Філологія',
}

enum Theology {
  theology = 'Богослов’я',
}

enum SocialAndBehavioralSciences {
  economy = 'Економіка',
  politology = 'Політологія',
  psychology = 'Психологія',
  sociology = 'Соціологія',
  irpsAndRs = 'Міжнародні відносини, суспільні комунікації та регіональні студії',
  interEconomRel = 'Міжнародні економічні відносини',
}

enum Journalism {
  journalism = 'Журналістика',
}

enum ManagementAndAdministration {
  accountingAndTaxation = 'Облік і оподаткування',
  financeBankingAndInsurance = 'Фінанси, банківська справа та страхування',
  management = 'Менеджмент',
  publicManagementAndAdministration = 'Публічне управління та адміністрування',
  marketing = 'Маркетинг',
  entrepreneurshipTradeAndExchangeActivity = 'Підприємництво, торгівля та біржова діяльність',
}

enum Law {
  law = 'Право',
  internationalLaw = 'Міжнародне право',
}

enum Biology {
  biology = 'Біологія',
}

enum NaturalSciences {
  ecology = 'Екологія',
  chemistry = 'Хімія',
  earthSciences = 'Науки про Землю',
  physicsAndAstronomy = 'Фізика та астрономія',
  appliedPhysicsAndNanomaterials = 'Прикладна фізика та наноматеріали',
}

enum MathematicsAndStatistics {
  mathematic = 'Математика',
  statistics = 'Статистика',
  appliedMathematics = 'Прикладна математика',
}

enum InformationTechnology {
  softwareEngineering = 'Інженерія програмного забезпечення',
  computerScienceAndInformationTechnology = 'Комп’ютерні науки та інформаційні технології',
  computerEngineering = 'Комп’ютерна інженерія',
  systemAnalysis = 'Системний аналіз',
  cyberSecurity = 'Кібербезпека',
}

enum MechanicalEngineering {
  appliedMechanics = 'Прикладна механіка',
  materialsScience = 'Матеріалознавство',
  industrialEngineering = 'Галузеве машинобудування',
  aviationAndRocketSpaceTechnology = 'Авіаційна та ракетно-космічна техніка',
  shipbuilding = 'Суднобудування',
  metallurgy = 'Металургія',
}

enum ElectricalEngineering {
  electricPowerEngineeringAndElectromechanics = 'Електроенергетика, електротехніка та електромеханіка',
  energyEngineering = 'Енергетичне машинобудування',
  atomicEnergy = 'Атомна енергетика',
  thermalPower = 'Теплоенергетика',
  hydroPower = 'Гідроенергетика',
}

enum AutomationAndInstrumentation {
  automationAndComputerIntegratedTechnologies = 'Автоматизація та комп’ютерно-інтегровані технології',
  metrologyAndInformationMeasuringTechnology = 'Метрологія та інформаційно-вимірювальна техніка',
  microAndNanosystemTechnology = 'Мікро- та наносистемна техніка',
}

enum ChemicalAndBioengineering {
  chemicalTechnologiesAndEngineering = 'Хімічні технології та інженерія',
  biotechnologyAndBioengineering = 'Біотехнології та біоінженерія',
  biomedicalEngineering = 'Біомедична інженерія',
}

enum ElectronicsAndTelecommunications {
  electronics = 'Електроніка',
  telecommunicationsAndRadioEngineering = 'Телекомунікації та радіотехніка',
  avionics = 'Авіоніка',
}

@Injectable()
@Scene('DISCIPLINE_SCENE')
export class DisciplineScene extends Scenes.BaseScene<
  Scenes.SceneContext<IOrderSceneState>
> {
  constructor() {
    super('DISCIPLINE_SCENE');
  }

  private async chooseDiscipline(
    branch: string,
    specialization: string,
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (!ctx.session.__scenes.state.discipline) {
      ctx.session.__scenes.state.discipline = { branch, specialization };
    }
    ctx.session.__scenes.state.discipline.branch = branch;
    ctx.session.__scenes.state.discipline.specialization = specialization;
    await ctx.replyWithHTML(
      `<b>❕ Вибрана галузь знань:</b>\n"<i>${ctx.session.__scenes.state.discipline.branch}</i>"\n\n<b>❕ Вибрана спеціальність:</b>\n"<i>${ctx.session.__scenes.state.discipline.specialization}</i>"`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Далі', 'go-forward')],
        [
          Markup.button.callback(
            '🚫 Змінити галузь та спеціалізацію',
            'change_discipline',
          ),
        ],
      ]),
    );
  }

  @SceneEnter()
  async onEnterDisciplineScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.replyWithHTML(
      '<b>❔ Виберіть галузь знань:</b>',
      Markup.inlineKeyboard([
        [Markup.button.callback(Branch.education, 'education')],
        [Markup.button.callback(Branch.сultureAndArt, 'сulture_and_art')],
        [Markup.button.callback(Branch.humanities, 'humanities')],
        [Markup.button.callback(Branch.theology, 'theology')],
        [
          Markup.button.callback(
            Branch.socialAndBehavioralSciences,
            'social_and_behavioral_sciences',
          ),
        ],
        [Markup.button.callback(Branch.journalism, 'journalism')],
        [
          Markup.button.callback(
            Branch.managementAndAdministration,
            'management_and_administration',
          ),
        ],
        [Markup.button.callback(Branch.law, 'law')],
        [Markup.button.callback(Branch.biology, 'biology')],
        [Markup.button.callback(Branch.naturalSciences, 'natural_sciences')],
        [
          Markup.button.callback(
            Branch.mathematicsAndStatistics,
            'mathematics_and_statistics',
          ),
        ],
        [
          Markup.button.callback(
            Branch.informationTechnology,
            'information_technology',
          ),
        ],
        [
          Markup.button.callback(
            Branch.mechanicalEngineering,
            'mechanical_engineering',
          ),
        ],
        [
          Markup.button.callback(
            Branch.electricalEngineering,
            'electrical_engineering',
          ),
        ],
        [
          Markup.button.callback(
            Branch.automationAndInstrumentation,
            'automation_and_instrumentation',
          ),
        ],
        [
          Markup.button.callback(
            Branch.chemicalAndBioengineering,
            'chemical_and_bioengineering',
          ),
        ],
        [
          Markup.button.callback(
            Branch.electronicsAndTelecommunications,
            'electronics_and_telecommunications',
          ),
        ],
      ]),
    );
  }

  // ======= EDUCATION =======================================================

  @Action('education')
  async addEducation(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              EducationSpecialization.sciencesAboutEducation,
              'sciences_about_education',
            ),
          ],
          [
            Markup.button.callback(
              EducationSpecialization.preSchoolEducation,
              'pre_school_education',
            ),
          ],
          [
            Markup.button.callback(
              EducationSpecialization.primaryEducation,
              'primary_education',
            ),
          ],
          [
            Markup.button.callback(
              EducationSpecialization.secondaryEducation,
              'secondary_education',
            ),
          ],
          [
            Markup.button.callback(
              EducationSpecialization.professionalEducation,
              'professional_education',
            ),
          ],
          [
            Markup.button.callback(
              EducationSpecialization.specialEducation,
              'special_education',
            ),
          ],
          [
            Markup.button.callback(
              EducationSpecialization.physicalCultureAndSports,
              'physical_culture_and_sports',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('sciences_about_education')
  async onSciencesAboutEducation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.sciencesAboutEducation,
      ctx,
    );
  }

  @Action('pre_school_education')
  async onPreSchoolEducation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.preSchoolEducation,
      ctx,
    );
  }

  @Action('primary_education')
  async onPrimaryEducation(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.primaryEducation,
      ctx,
    );
  }

  @Action('secondary_education')
  async onSecondaryEducation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.secondaryEducation,
      ctx,
    );
  }

  @Action('professional_education')
  async onProfessionalEducation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.professionalEducation,
      ctx,
    );
  }

  @Action('special_education')
  async onSpecialEducation(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.specialEducation,
      ctx,
    );
  }

  @Action('physical_culture_and_sports')
  async onPhysicalCultureAndSports(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.education,
      EducationSpecialization.physicalCultureAndSports,
      ctx,
    );
  }

  // ======= CULTURE_AND_ART ====================================================

  @Action('сulture_and_art')
  async addCultureAndArt(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              CultureAndArt.audiovisualArtAndProduction,
              'audiovisual_art_and_production',
            ),
          ],
          [Markup.button.callback(CultureAndArt.design, 'design')],
          [
            Markup.button.callback(
              CultureAndArt.fineArtDecorativeRestoration,
              'fine_art_decorative_restoration',
            ),
          ],
          [Markup.button.callback(CultureAndArt.choreography, 'choreography')],
          [Markup.button.callback(CultureAndArt.musicalArt, 'musical_art')],
          [Markup.button.callback(CultureAndArt.stageArt, 'stage_art')],
          [
            Markup.button.callback(
              CultureAndArt.museumMonument,
              'museum_monument',
            ),
          ],
          [
            Markup.button.callback(
              CultureAndArt.socioCulturalActivities,
              'socio_cultural_activities',
            ),
          ],
          [
            Markup.button.callback(
              CultureAndArt.libraryAndArchivalAffairs,
              'library_and_archival_affairs',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('audiovisual_art_and_production')
  async onAudiovisualArtAndProduction(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.audiovisualArtAndProduction,
      ctx,
    );
  }

  @Action('design')
  async onDesign(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.design,
      ctx,
    );
  }

  @Action('fine_art_decorative_restoration')
  async onFineArtDecorativeRestoration(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.fineArtDecorativeRestoration,
      ctx,
    );
  }

  @Action('choreography')
  async onChoreography(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.choreography,
      ctx,
    );
  }

  @Action('musical_art')
  async onMusicalArt(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.musicalArt,
      ctx,
    );
  }

  @Action('stage_art')
  async onStageArt(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.stageArt,
      ctx,
    );
  }

  @Action('museum_monument')
  async onMuseumMonument(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.museumMonument,
      ctx,
    );
  }

  @Action('socio_cultural_activities')
  async onSocioCulturalActivities(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.socioCulturalActivities,
      ctx,
    );
  }

  @Action('library_and_archival_affairs')
  async onLibraryAndArchivalAffairs(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.сultureAndArt,
      CultureAndArt.libraryAndArchivalAffairs,
      ctx,
    );
  }

  // ======= HUMANITIES ====================================================

  @Action('humanities')
  async addHumanities(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              Humanities.religiousStudies,
              'religious_studies',
            ),
          ],
          [
            Markup.button.callback(
              Humanities.historyAndArchaeology,
              'history_and_archaeology',
            ),
          ],
          [Markup.button.callback(Humanities.philosophy, 'philosophy')],
          [Markup.button.callback(Humanities.culturology, 'culturology')],
          [Markup.button.callback(Humanities.philology, 'philology')],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('religious_studies')
  async onReligiousStudies(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.humanities,
      Humanities.religiousStudies,
      ctx,
    );
  }

  @Action('history_and_archaeology')
  async onHistoryAndArchaeology(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.humanities,
      Humanities.historyAndArchaeology,
      ctx,
    );
  }

  @Action('philosophy')
  async onPhilosophy(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.humanities, Humanities.philosophy, ctx);
  }

  @Action('culturology')
  async onCulturology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.humanities, Humanities.culturology, ctx);
  }

  @Action('philology')
  async onPhilology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.humanities, Humanities.philology, ctx);
  }

  // ======= THEOLOGY ======================================================

  // @Action('theology')
  // async addTheology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
  //   await ctx.answerCbQuery();
  //   await ctx.editMessageText('<b>❔ Виберіть спеціальність</b>', {
  //     parse_mode: 'HTML',
  //     reply_markup: {
  //       inline_keyboard: [
  //         [Markup.button.callback(Theology.theology, 'theology_speech')],
  //       ],
  //     },
  //   });
  // }

  // =======

  @Action('theology')
  async onTheology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.theology, Theology.theology, ctx);
  }

  // ======= SOCIAL_AND_BEHAVIORAL_ACIENCES ================================

  @Action('social_and_behavioral_sciences')
  async addSocialAndBehavioralSciences(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              SocialAndBehavioralSciences.economy,
              'economy',
            ),
          ],
          [
            Markup.button.callback(
              SocialAndBehavioralSciences.politology,
              'politology',
            ),
          ],
          [
            Markup.button.callback(
              SocialAndBehavioralSciences.psychology,
              'psychology',
            ),
          ],
          [
            Markup.button.callback(
              SocialAndBehavioralSciences.sociology,
              'sociology',
            ),
          ],
          [
            Markup.button.callback(
              SocialAndBehavioralSciences.irpsAndRs,
              'irpsAndRs',
            ),
          ],
          [
            Markup.button.callback(
              SocialAndBehavioralSciences.interEconomRel,
              'interEconomRel',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('economy')
  async onEconomy(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialAndBehavioralSciences,
      SocialAndBehavioralSciences.economy,
      ctx,
    );
  }

  @Action('politology')
  async onPolitology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialAndBehavioralSciences,
      SocialAndBehavioralSciences.politology,
      ctx,
    );
  }

  @Action('psychology')
  async onPsychology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialAndBehavioralSciences,
      SocialAndBehavioralSciences.psychology,
      ctx,
    );
  }

  @Action('sociology')
  async onSociology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialAndBehavioralSciences,
      SocialAndBehavioralSciences.sociology,
      ctx,
    );
  }

  @Action('irpsAndRs')
  async onIRPSAndRs(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialAndBehavioralSciences,
      SocialAndBehavioralSciences.irpsAndRs,
      ctx,
    );
  }

  @Action('interEconomRel')
  async onInterEconomRel(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialAndBehavioralSciences,
      SocialAndBehavioralSciences.interEconomRel,
      ctx,
    );
  }

  // ======= JOURNALISM ====================================================

  // ======

  @Action('journalism')
  async onJournalism(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.journalism, Journalism.journalism, ctx);
  }

  // ======= MANAGEMENT_AND_ADMINISTRATION =================================

  @Action('management_and_administration')
  async addManagementAndAdministration(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              ManagementAndAdministration.accountingAndTaxation,
              'accounting_and_taxation',
            ),
          ],
          [
            Markup.button.callback(
              ManagementAndAdministration.financeBankingAndInsurance,
              'finance_banking_and_insurance',
            ),
          ],
          [
            Markup.button.callback(
              ManagementAndAdministration.management,
              'management',
            ),
          ],
          [
            Markup.button.callback(
              ManagementAndAdministration.publicManagementAndAdministration,
              'public_management_and_administration',
            ),
          ],
          [
            Markup.button.callback(
              ManagementAndAdministration.marketing,
              'marketing',
            ),
          ],
          [
            Markup.button.callback(
              ManagementAndAdministration.entrepreneurshipTradeAndExchangeActivity,
              'entrepreneurship_trade_and_exchange_activity',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('accounting_and_taxation')
  async onAccountingAndTaxation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.managementAndAdministration,
      ManagementAndAdministration.accountingAndTaxation,
      ctx,
    );
  }

  @Action('finance_banking_and_insurance')
  async onFinanceBankingAndInsurance(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.managementAndAdministration,
      ManagementAndAdministration.financeBankingAndInsurance,
      ctx,
    );
  }

  @Action('management')
  async onManagement(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.managementAndAdministration,
      ManagementAndAdministration.management,
      ctx,
    );
  }

  @Action('public_management_and_administration')
  async onPublicManagementAndAdministration(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.managementAndAdministration,
      ManagementAndAdministration.publicManagementAndAdministration,
      ctx,
    );
  }

  @Action('marketing')
  async onMarketing(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.managementAndAdministration,
      ManagementAndAdministration.marketing,
      ctx,
    );
  }

  @Action('entrepreneurship_trade_and_exchange_activity')
  async onEntrepreneurshipTradeAndExchangeActivity(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.managementAndAdministration,
      ManagementAndAdministration.entrepreneurshipTradeAndExchangeActivity,
      ctx,
    );
  }

  // ======= LAW =============================================================

  @Action('law')
  async addLaw(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(Law.law, 'local_law')],
          [Markup.button.callback(Law.internationalLaw, 'internationalLaw')],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('local_law')
  async onLocalLaw(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.law, Law.law, ctx);
  }

  @Action('internationalLaw')
  async onInternationalLaw(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.law, Law.internationalLaw, ctx);
  }

  // ======= BIOLOGY ====================================================

  // ======

  @Action('biology')
  async onBiology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.biology, Biology.biology, ctx);
  }

  // ======= NATURAL_ACIENCES ============================================

  @Action('natural_sciences')
  async addNaturalSciences(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(NaturalSciences.ecology, 'ecology')],
          [Markup.button.callback(NaturalSciences.chemistry, 'chemistry')],
          [
            Markup.button.callback(
              NaturalSciences.earthSciences,
              'earth_sciences',
            ),
          ],
          [
            Markup.button.callback(
              NaturalSciences.physicsAndAstronomy,
              'physics_and_astronomy',
            ),
          ],
          [
            Markup.button.callback(
              NaturalSciences.appliedPhysicsAndNanomaterials,
              'applied_physics_and_nanomaterials',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('ecology')
  async onEcology(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.naturalSciences,
      NaturalSciences.ecology,
      ctx,
    );
  }

  @Action('chemistry')
  async onChemistry(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.naturalSciences,
      NaturalSciences.chemistry,
      ctx,
    );
  }

  @Action('earth_sciences')
  async onEarthSciences(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.naturalSciences,
      NaturalSciences.earthSciences,
      ctx,
    );
  }

  @Action('physics_and_astronomy')
  async onPhysicsAndAstronomy(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.naturalSciences,
      NaturalSciences.physicsAndAstronomy,
      ctx,
    );
  }

  @Action('applied_physics_and_nanomaterials')
  async onAppliedPhysicsAndNanomaterials(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.naturalSciences,
      NaturalSciences.appliedPhysicsAndNanomaterials,
      ctx,
    );
  }

  // ======= MATHEMATICS_AND_STATISTICS ============================================

  @Action('mathematics_and_statistics')
  async addMathematicsAndStatistics(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              MathematicsAndStatistics.mathematic,
              'mathematic',
            ),
          ],
          [
            Markup.button.callback(
              MathematicsAndStatistics.statistics,
              'statistics',
            ),
          ],
          [
            Markup.button.callback(
              MathematicsAndStatistics.appliedMathematics,
              'appliedMathematics',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('mathematic')
  async onMathematic(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.mathematicsAndStatistics,
      MathematicsAndStatistics.mathematic,
      ctx,
    );
  }

  @Action('statistics')
  async onStatistics(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.mathematicsAndStatistics,
      MathematicsAndStatistics.statistics,
      ctx,
    );
  }

  @Action('appliedMathematics')
  async onAppliedMathematics(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.mathematicsAndStatistics,
      MathematicsAndStatistics.appliedMathematics,
      ctx,
    );
  }

  // ======= INFORMATION_TECHNOLOGY ============================================

  @Action('information_technology')
  async addInformationTechnology(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              InformationTechnology.softwareEngineering,
              'software_engineering',
            ),
          ],
          [
            Markup.button.callback(
              InformationTechnology.computerScienceAndInformationTechnology,
              'computer_science_and_information_technology',
            ),
          ],
          [
            Markup.button.callback(
              InformationTechnology.computerEngineering,
              'computer_engineering',
            ),
          ],
          [
            Markup.button.callback(
              InformationTechnology.systemAnalysis,
              'system_analysis',
            ),
          ],
          [
            Markup.button.callback(
              InformationTechnology.cyberSecurity,
              'cyber_security',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('software_engineering')
  async onSoftwareEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.informationTechnology,
      InformationTechnology.softwareEngineering,
      ctx,
    );
  }

  @Action('computer_science_and_information_technology')
  async onComputerScienceAndInformationTechnology(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.informationTechnology,
      InformationTechnology.computerScienceAndInformationTechnology,
      ctx,
    );
  }

  @Action('computer_engineering')
  async onComputerEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.informationTechnology,
      InformationTechnology.computerEngineering,
      ctx,
    );
  }

  @Action('system_analysis')
  async onSystemAnalysis(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.informationTechnology,
      InformationTechnology.systemAnalysis,
      ctx,
    );
  }

  @Action('cyber_security')
  async onCyberSecurity(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.informationTechnology,
      InformationTechnology.cyberSecurity,
      ctx,
    );
  }

  // ======= MECHANICAL_ENGINEERING ============================================

  @Action('mechanical_engineering')
  async addMechanicalEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              MechanicalEngineering.appliedMechanics,
              'applied_mechanics',
            ),
          ],
          [
            Markup.button.callback(
              MechanicalEngineering.materialsScience,
              'materials_science',
            ),
          ],
          [
            Markup.button.callback(
              MechanicalEngineering.industrialEngineering,
              'industrial_engineering',
            ),
          ],
          [
            Markup.button.callback(
              MechanicalEngineering.aviationAndRocketSpaceTechnology,
              'aviation_and_rocket_space_technology',
            ),
          ],
          [
            Markup.button.callback(
              MechanicalEngineering.shipbuilding,
              'shipbuilding',
            ),
          ],
          [
            Markup.button.callback(
              MechanicalEngineering.metallurgy,
              'metallurgy',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('applied_mechanics')
  async onAppliedMechanics(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.mechanicalEngineering,
      MechanicalEngineering.appliedMechanics,
      ctx,
    );
  }

  @Action('materials_science')
  async onMaterialsScience(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.mechanicalEngineering,
      MechanicalEngineering.materialsScience,
      ctx,
    );
  }

  @Action('industrial_engineering')
  async onIndustrialEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.mechanicalEngineering,
      MechanicalEngineering.industrialEngineering,
      ctx,
    );
  }

  @Action('aviation_and_rocket_space_technology')
  async onAviationAndRocketSpaceTechnology(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.mechanicalEngineering,
      MechanicalEngineering.aviationAndRocketSpaceTechnology,
      ctx,
    );
  }

  @Action('shipbuilding')
  async onShipbuilding(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.mechanicalEngineering,
      MechanicalEngineering.shipbuilding,
      ctx,
    );
  }

  @Action('metallurgy')
  async onMetallurgy(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.mechanicalEngineering,
      MechanicalEngineering.metallurgy,
      ctx,
    );
  }

  // ======= ELECTRICAL_ENGINEERING ============================================

  @Action('electrical_engineering')
  async addElectricalEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              ElectricalEngineering.electricPowerEngineeringAndElectromechanics,
              'electric_power_engineering_and_electromechanics',
            ),
          ],
          [
            Markup.button.callback(
              ElectricalEngineering.energyEngineering,
              'energy_engineering',
            ),
          ],
          [
            Markup.button.callback(
              ElectricalEngineering.atomicEnergy,
              'atomic_energy',
            ),
          ],
          [
            Markup.button.callback(
              ElectricalEngineering.thermalPower,
              'thermal_power',
            ),
          ],
          [
            Markup.button.callback(
              ElectricalEngineering.hydroPower,
              'hydro_power',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('electric_power_engineering_and_electromechanics')
  async onElectricPowerEngineeringAndElectromechanics(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.electricalEngineering,
      ElectricalEngineering.electricPowerEngineeringAndElectromechanics,
      ctx,
    );
  }

  @Action('energy_engineering')
  async onEnergyEngineering(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.electricalEngineering,
      ElectricalEngineering.energyEngineering,
      ctx,
    );
  }

  @Action('atomic_energy')
  async onAtomicEnergy(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.electricalEngineering,
      ElectricalEngineering.atomicEnergy,
      ctx,
    );
  }

  @Action('thermal_power')
  async onThermalPower(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.electricalEngineering,
      ElectricalEngineering.thermalPower,
      ctx,
    );
  }

  @Action('hydro_power')
  async onHydroPower(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.electricalEngineering,
      ElectricalEngineering.hydroPower,
      ctx,
    );
  }

  // ======= AUTOMATION_AND_INSTRUMENTATION ============================================

  @Action('automation_and_instrumentation')
  async addAutomationAndInstrumentation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              AutomationAndInstrumentation.automationAndComputerIntegratedTechnologies,
              'automation_and_computer_integrated_technologies',
            ),
          ],
          [
            Markup.button.callback(
              AutomationAndInstrumentation.metrologyAndInformationMeasuringTechnology,
              'metrology_and_information_measuring_technology',
            ),
          ],
          [
            Markup.button.callback(
              AutomationAndInstrumentation.microAndNanosystemTechnology,
              'micro_and_nanosystem_technology',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('automation_and_computer_integrated_technologies')
  async onAutomationAndComputerIntegratedTechnologies(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.automationAndInstrumentation,
      AutomationAndInstrumentation.automationAndComputerIntegratedTechnologies,
      ctx,
    );
  }

  @Action('metrology_and_information_measuring_technology')
  async onMetrologyAndInformationMeasuringTechnology(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.automationAndInstrumentation,
      AutomationAndInstrumentation.metrologyAndInformationMeasuringTechnology,
      ctx,
    );
  }

  @Action('micro_and_nanosystem_technology')
  async onMicroAndNanosystemTechnology(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.automationAndInstrumentation,
      AutomationAndInstrumentation.microAndNanosystemTechnology,
      ctx,
    );
  }

  // ======= CHEMICAL_AND_BIOENGINEERING ============================================

  @Action('chemical_and_bioengineering')
  async addChemicalAndBioengineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              ChemicalAndBioengineering.chemicalTechnologiesAndEngineering,
              'chemical_technologies_and_engineering',
            ),
          ],
          [
            Markup.button.callback(
              ChemicalAndBioengineering.biotechnologyAndBioengineering,
              'biotechnology_and_bioengineering',
            ),
          ],
          [
            Markup.button.callback(
              ChemicalAndBioengineering.biomedicalEngineering,
              'biomedical_engineering',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('chemical_technologies_and_engineering')
  async onChemicalTechnologiesAndEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.chemicalAndBioengineering,
      ChemicalAndBioengineering.chemicalTechnologiesAndEngineering,
      ctx,
    );
  }

  @Action('biotechnology_and_bioengineering')
  async onBiotechnologyAndBioengineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.chemicalAndBioengineering,
      ChemicalAndBioengineering.biotechnologyAndBioengineering,
      ctx,
    );
  }

  @Action('biomedical_engineering')
  async onBiomedicalEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.chemicalAndBioengineering,
      ChemicalAndBioengineering.biomedicalEngineering,
      ctx,
    );
  }

  // ======= ELECTRONICS_AND_TELECOMMUNICATIONS ============================================

  @Action('electronics_and_telecommunications')
  async addElectronicsAndTelecommunications(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть спеціальність:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback(
              ElectronicsAndTelecommunications.electronics,
              'electronics',
            ),
          ],
          [
            Markup.button.callback(
              ElectronicsAndTelecommunications.telecommunicationsAndRadioEngineering,
              'telecommunications_and_radio_engineering',
            ),
          ],
          [
            Markup.button.callback(
              ElectronicsAndTelecommunications.avionics,
              'avionics',
            ),
          ],
          [Markup.button.callback('Повернутися', 'back_to_branch')],
        ],
      },
    });
  }

  // =======

  @Action('electronics')
  async onElectronics(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.electronicsAndTelecommunications,
      ElectronicsAndTelecommunications.electronics,
      ctx,
    );
  }

  @Action('telecommunications_and_radio_engineering')
  async onTelecommunicationsAndRadioEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.electronicsAndTelecommunications,
      ElectronicsAndTelecommunications.telecommunicationsAndRadioEngineering,
      ctx,
    );
  }

  @Action('avionics')
  async onAvionics(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.electronicsAndTelecommunications,
      ElectronicsAndTelecommunications.avionics,
      ctx,
    );
  }

  // =========================================================================

  @Action('back_to_branch')
  async backToBranch(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('<b>❔ Виберіть галузь знань:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(Branch.education, 'education')],
          [Markup.button.callback(Branch.сultureAndArt, 'сulture_and_art')],
          [Markup.button.callback(Branch.humanities, 'humanities')],
          [Markup.button.callback(Branch.theology, 'theology')],
          [
            Markup.button.callback(
              Branch.socialAndBehavioralSciences,
              'social_and_behavioral_sciences',
            ),
          ],
          [Markup.button.callback(Branch.journalism, 'journalism')],
          [
            Markup.button.callback(
              Branch.managementAndAdministration,
              'management_and_administration',
            ),
          ],
          [Markup.button.callback(Branch.law, 'law')],
          [Markup.button.callback(Branch.biology, 'biology')],
          [Markup.button.callback(Branch.naturalSciences, 'natural_sciences')],
          [
            Markup.button.callback(
              Branch.mathematicsAndStatistics,
              'mathematics_and_statistics',
            ),
          ],
          [
            Markup.button.callback(
              Branch.informationTechnology,
              'information_technology',
            ),
          ],
          [
            Markup.button.callback(
              Branch.mechanicalEngineering,
              'mechanical_engineering',
            ),
          ],
          [
            Markup.button.callback(
              Branch.electricalEngineering,
              'electrical_engineering',
            ),
          ],
          [
            Markup.button.callback(
              Branch.automationAndInstrumentation,
              'automation_and_instrumentation',
            ),
          ],
          [
            Markup.button.callback(
              Branch.chemicalAndBioengineering,
              'chemical_and_bioengineering',
            ),
          ],
          [
            Markup.button.callback(
              Branch.electronicsAndTelecommunications,
              'electronics_and_telecommunications',
            ),
          ],
        ],
      },
    });
  }

  @Action('go-forward')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);
  }

  @Action('change_discipline')
  async changeDiscipline(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);
  }

  @On('text')
  async onTextInDisciplineScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await onSceneGateFromCommand(
      ctx,
      'DISCIPLINE_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      return;
    }
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
