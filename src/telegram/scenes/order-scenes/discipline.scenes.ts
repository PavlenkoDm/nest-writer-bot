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
import { Emoji } from 'src/telegram/emoji/emoji';
import { CommonOrderClass, Forbidden } from './common-order.abstract';

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
  productionAndTechnologies = 'Виробництво та технології',
  architectureAndConstruction = 'Архітектура та будівництво',
  agriculturalSciencesAndFood = 'Аграрні науки та продовольство',
  veterinary = 'Ветеринарна медицина',
  healthCare = 'Охорона здоров’я',
  socialWork = 'Соціальна робота',
  serviceSector = 'Сфера обслуговування',
  military = 'Воєнні науки, національна безпека, безпека державного кордону',
  civilSecurity = 'Цивільна безпека',
  transport = 'Транспорт',
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

enum ProductionAndTechnologies {
  foodTechnologies = 'Харчові технології',
  lightIndustryTechnologies = 'Технології легкої промисловості',
  environmentalProtectionTechnologies = 'Технології захисту навколишнього середовища',
  mining = 'Гірництво',
  oilGasEngineeringTechnologies = 'Нафтогазова інженерія та технології',
  publishingAndPrinting = 'Видавництво та поліграфія',
}

enum ArchitectureAndConstruction {
  architectureAndUrbanPlanning = 'Архітектура та містобудування',
  constructionAndCivilEngineering = 'Будівництво та цивільна інженерія',
  geodesyAndLandManagement = 'Геодезія та землеустрій',
}

enum AgriculturalSciencesAndFood {
  agronomy = 'Агрономія',
  plantsProtectionAndQuarantine = 'Захист і карантин рослин',
  gardeningAndViticulture = 'Садівництво та виноградарство',
  animalHusbandryProductsProduction = 'Технологія виробництва і переробки продукції тваринництва',
  forestry = 'Лісове господарство',
  horticulture = 'Садово-паркове господарство',
  bioresourcesAndAquaculture = 'Водні біоресурси та аквакультура',
  agriculturalEngineering = 'Агроінженерія',
}

enum Veterinary {
  veterinaryMedicine = 'Ветеринарна медицина',
  veterinaryHygieneSanitationAndExpertise = 'Ветеринарна гігієна, санітарія і експертиза',
}

enum HealthCare {
  dentistry = 'Стоматологія',
  medicine = 'Медицина',
  nursing = 'Медсестринство',
  medicalTechnologiesDiagnosisAndTreatment = 'Технології медичної діагностики та лікування',
  medicalAndPsychologicalRehabilitation = 'Медична та психологічна реабілітація',
  pharmacy = 'Фармація',
  physicalRehabilitation = 'Фізична реабілітація',
}

enum SocialWork {
  socialWk = 'Соціальна робота',
  socialWelfare = 'Соціальне забезпечення',
}

enum ServiceSector {
  hotelRestaurantBusiness = 'Готельно-ресторанна справа',
  tourism = 'Туризм',
}

enum Military {
  stateSecurity = 'Державна безпека',
  stateBorderSecurity = 'Безпека державного кордону',
  militaryAdministration = 'Військове управління (за видами збройних сил)',
  troopSupply = 'Забезпечення військ (сил)',
  militaryEquipment = 'Озброєння та військова техніка',
}

enum CivilSecurity {
  fireSecurity = 'Пожежна безпека',
  lawEnforcementActivity = 'Правоохоронна діяльність',
  civilSecur = 'Цивільна безпека',
}

enum Transport {
  riverAndSeaTransport = 'Річковий та морський транспорт',
  aviaTransport = 'Авіаційний транспорт',
  reilwayTransport = 'Залізничний транспорт',
  autoTransport = 'Автомобільний транспорт',
  transportTechnologies = 'Транспортні технології (за видами)',
}

@Injectable()
@Scene('DISCIPLINE_SCENE')
export class DisciplineScene extends CommonOrderClass {
  constructor() {
    super('DISCIPLINE_SCENE');
  }
  private disciplineStartMessageId: number;
  private disciplineChoiceMessageId: number;
  protected commandForbiddenMessageId: number;

  private async disciplineStartMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const startMessage = await ctx.replyWithHTML(
      `<b>${Emoji.question} Виберіть галузь знань:</b>`,
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
        [
          Markup.button.callback(
            Branch.productionAndTechnologies,
            'production_and_technologies',
          ),
        ],
        [
          Markup.button.callback(
            Branch.architectureAndConstruction,
            'architecture_and_construction',
          ),
        ],
        [
          Markup.button.callback(
            Branch.agriculturalSciencesAndFood,
            'agricultural_sciences_and_food',
          ),
        ],
        [Markup.button.callback(Branch.veterinary, 'veterinary')],
        [Markup.button.callback(Branch.healthCare, 'health_care')],
        [Markup.button.callback(Branch.socialWork, 'social_work')],
        [Markup.button.callback(Branch.serviceSector, 'service_sector')],
        [Markup.button.callback(Branch.military, 'military')],
        [Markup.button.callback(Branch.civilSecurity, 'civil_security')],
        [Markup.button.callback(Branch.transport, 'transport')],
      ]),
    );

    this.disciplineStartMessageId = startMessage.message_id;

    return startMessage;
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
    await ctx.answerCbQuery();
    await this.disciplineChoiceMarkup(ctx);
    return;
  }

  private async disciplineChoiceMarkup(
    ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.disciplineChoiceMessageId) {
      await ctx.deleteMessage(this.disciplineChoiceMessageId);
      this.disciplineChoiceMessageId = 0;
    }

    const choiceMessage = await ctx.replyWithHTML(
      `<b>${Emoji.answer} Вибрана галузь знань:</b>
      \n"<i>${ctx.session.__scenes.state.discipline.branch}</i>"
      \n\n<b>${Emoji.answer} Вибрана спеціальність:</b>
      \n"<i>${ctx.session.__scenes.state.discipline.specialization}</i>"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${Emoji.forward} Далі`,
            'go-forward_to_theme',
          ),
        ],
        [
          Markup.button.callback(
            `${Emoji.change} Змінити галузь та спеціалізацію`,
            'change_discipline',
          ),
        ],
      ]),
    );

    this.disciplineChoiceMessageId = choiceMessage.message_id;

    return choiceMessage;
  }

  @SceneEnter()
  async onEnterDisciplineScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    if (this.disciplineStartMessageId) {
      await ctx.deleteMessage(this.disciplineStartMessageId);
      this.disciplineStartMessageId = 0;
    }
    if (!ctx.session.__scenes.state.discipline) {
      ctx.session.__scenes.state.discipline = {
        branch: '',
        specialization: '',
      };
    }
    await this.disciplineStartMarkup(ctx);
    return;
  }

  // ======= EDUCATION =======================================================

  @Action('education')
  async addEducation(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                CultureAndArt.choreography,
                'choreography',
              ),
            ],
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(Law.law, 'local_law')],
            [Markup.button.callback(Law.internationalLaw, 'internationalLaw')],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
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
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
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

  // ======= PRODUCTION_AND_TECHNOLOGIES ============================================

  @Action('production_and_technologies')
  async addProductionAndTechnologies(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                ProductionAndTechnologies.foodTechnologies,
                'food_technologies',
              ),
            ],
            [
              Markup.button.callback(
                ProductionAndTechnologies.lightIndustryTechnologies,
                'light_industry_technologies',
              ),
            ],
            [
              Markup.button.callback(
                ProductionAndTechnologies.environmentalProtectionTechnologies,
                'environmental_protection_technologies',
              ),
            ],
            [
              Markup.button.callback(
                ProductionAndTechnologies.mining,
                'mining',
              ),
            ],
            [
              Markup.button.callback(
                ProductionAndTechnologies.oilGasEngineeringTechnologies,
                'oil_gas_engineering_technologies',
              ),
            ],
            [
              Markup.button.callback(
                ProductionAndTechnologies.publishingAndPrinting,
                'publishing_and_printing',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('food_technologies')
  async onFoodTechnologies(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.productionAndTechnologies,
      ProductionAndTechnologies.foodTechnologies,
      ctx,
    );
  }

  @Action('light_industry_technologies')
  async onLightIndustryTechnologies(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.productionAndTechnologies,
      ProductionAndTechnologies.lightIndustryTechnologies,
      ctx,
    );
  }

  @Action('environmental_protection_technologies')
  async onEnvironmentalProtectionTechnologies(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.productionAndTechnologies,
      ProductionAndTechnologies.environmentalProtectionTechnologies,
      ctx,
    );
  }

  @Action('mining')
  async onMining(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.productionAndTechnologies,
      ProductionAndTechnologies.mining,
      ctx,
    );
  }

  @Action('oil_gas_engineering_technologies')
  async onOilGasEngineeringTechnologies(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.productionAndTechnologies,
      ProductionAndTechnologies.oilGasEngineeringTechnologies,
      ctx,
    );
  }

  @Action('publishing_and_printing')
  async onPublishingAndPrinting(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.productionAndTechnologies,
      ProductionAndTechnologies.publishingAndPrinting,
      ctx,
    );
  }

  // ======= ARCHITECTURE_AND_CONSTRUCTION ============================================

  @Action('architecture_and_construction')
  async addArchitectureAndConstruction(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                ArchitectureAndConstruction.architectureAndUrbanPlanning,
                'architecture_and_urban_planning',
              ),
            ],
            [
              Markup.button.callback(
                ArchitectureAndConstruction.constructionAndCivilEngineering,
                'construction_and_civil_engineering',
              ),
            ],
            [
              Markup.button.callback(
                ArchitectureAndConstruction.geodesyAndLandManagement,
                'geodesy_and_land_management',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('architecture_and_urban_planning')
  async onArchitectureAndUrbanPlanning(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.architectureAndConstruction,
      ArchitectureAndConstruction.architectureAndUrbanPlanning,
      ctx,
    );
  }

  @Action('construction_and_civil_engineering')
  async onConstructionAndCivilEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.architectureAndConstruction,
      ArchitectureAndConstruction.constructionAndCivilEngineering,
      ctx,
    );
  }

  @Action('geodesy_and_land_management')
  async onGeodesyAndLandManagement(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.architectureAndConstruction,
      ArchitectureAndConstruction.geodesyAndLandManagement,
      ctx,
    );
  }

  // ======= AGRICULTURAL_SCIENCES_AND_FOOD ============================================

  @Action('agricultural_sciences_and_food')
  async addAgriculturalSciencesAndFood(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.agronomy,
                'agronomy',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.plantsProtectionAndQuarantine,
                'plants_protection_and_quarantine',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.gardeningAndViticulture,
                'gardening_and_viticulture',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.animalHusbandryProductsProduction,
                'animal_husbandry_products_production',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.forestry,
                'forestry',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.horticulture,
                'horticulture',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.bioresourcesAndAquaculture,
                'bioresources_and_aquaculture',
              ),
            ],
            [
              Markup.button.callback(
                AgriculturalSciencesAndFood.agriculturalEngineering,
                'agricultural_engineering',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('agronomy')
  async onAgronomy(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.agronomy,
      ctx,
    );
  }

  @Action('plants_protection_and_quarantine')
  async onPlantsProtectionAndQuarantine(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.plantsProtectionAndQuarantine,
      ctx,
    );
  }

  @Action('gardening_and_viticulture')
  async onGardeningAndViticulture(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.gardeningAndViticulture,
      ctx,
    );
  }

  @Action('animal_husbandry_products_production')
  async onAnimalHusbandryProductsProduction(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.animalHusbandryProductsProduction,
      ctx,
    );
  }

  @Action('forestry')
  async onForestry(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.forestry,
      ctx,
    );
  }

  @Action('horticulture')
  async onHorticulture(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.horticulture,
      ctx,
    );
  }

  @Action('bioresources_and_aquaculture')
  async onBioresourcesAndAquaculture(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.bioresourcesAndAquaculture,
      ctx,
    );
  }

  @Action('agricultural_engineering')
  async onAgriculturalEngineering(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.agriculturalSciencesAndFood,
      AgriculturalSciencesAndFood.agriculturalEngineering,
      ctx,
    );
  }

  // ======= VETERINARY ============================================

  @Action('veterinary')
  async addVeterinary(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                Veterinary.veterinaryMedicine,
                'veterinary_medicine',
              ),
            ],
            [
              Markup.button.callback(
                Veterinary.veterinaryHygieneSanitationAndExpertise,
                'veterinary_hygiene_sanitation_and_expertise',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('veterinary_medicine')
  async onVeterinaryMedicine(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.veterinary,
      Veterinary.veterinaryMedicine,
      ctx,
    );
  }

  @Action('veterinary_hygiene_sanitation_and_expertise')
  async onVeterinaryHygieneSanitationAndExpertise(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.veterinary,
      Veterinary.veterinaryHygieneSanitationAndExpertise,
      ctx,
    );
  }

  // ======= HEALTH_CARE ============================================

  @Action('health_care')
  async addHealthCare(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(HealthCare.dentistry, 'dentistry')],
            [Markup.button.callback(HealthCare.medicine, 'medicine')],
            [Markup.button.callback(HealthCare.nursing, 'nursing')],
            [
              Markup.button.callback(
                HealthCare.medicalTechnologiesDiagnosisAndTreatment,
                'medical_technologies_diagnosis_and_treatment',
              ),
            ],
            [
              Markup.button.callback(
                HealthCare.medicalAndPsychologicalRehabilitation,
                'medical_and_psychological_rehabilitation',
              ),
            ],
            [Markup.button.callback(HealthCare.pharmacy, 'pharmacy')],
            [
              Markup.button.callback(
                HealthCare.physicalRehabilitation,
                'physical_rehabilitation',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('dentistry')
  async onDentistry(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.healthCare, HealthCare.dentistry, ctx);
  }

  @Action('medicine')
  async onMedicine(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.healthCare, HealthCare.medicine, ctx);
  }

  @Action('nursing')
  async onNursing(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.healthCare, HealthCare.nursing, ctx);
  }

  @Action('medical_technologies_diagnosis_and_treatment')
  async onMedicalTechnologiesDiagnosisAndTreatment(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.healthCare,
      HealthCare.medicalTechnologiesDiagnosisAndTreatment,
      ctx,
    );
  }

  @Action('medical_and_psychological_rehabilitation')
  async onMedicalAndPsychologicalRehabilitation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.healthCare,
      HealthCare.medicalAndPsychologicalRehabilitation,
      ctx,
    );
  }

  @Action('pharmacy')
  async onPharmacy(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.healthCare, HealthCare.pharmacy, ctx);
  }

  @Action('physical_rehabilitation')
  async onPhysicalRehabilitation(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.healthCare,
      HealthCare.physicalRehabilitation,
      ctx,
    );
  }

  // ======= SOCIAL_WORK ============================================

  @Action('social_work')
  async addSocialWork(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(SocialWork.socialWk, 'social_wk')],
            [
              Markup.button.callback(
                SocialWork.socialWelfare,
                'social_welfare',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('social_wk')
  async onSocialWk(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.socialWork, SocialWork.socialWk, ctx);
  }

  @Action('social_welfare')
  async onSocialWelfare(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.socialWork,
      SocialWork.socialWelfare,
      ctx,
    );
  }

  // ======= SERVICE_SECTOR ============================================

  @Action('service_sector')
  async addServiceSector(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                ServiceSector.hotelRestaurantBusiness,
                'hotel_restaurant_business',
              ),
            ],
            [Markup.button.callback(ServiceSector.tourism, 'tourism')],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('hotel_restaurant_business')
  async onHotelRestaurantBusiness(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.serviceSector,
      ServiceSector.hotelRestaurantBusiness,
      ctx,
    );
  }

  @Action('tourism')
  async onTourism(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.serviceSector,
      ServiceSector.tourism,
      ctx,
    );
  }

  // ======= MILITARY ============================================

  @Action('military')
  async addMilitary(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(Military.stateSecurity, 'state_security')],
            [
              Markup.button.callback(
                Military.stateBorderSecurity,
                'state_border_security',
              ),
            ],
            [
              Markup.button.callback(
                Military.militaryAdministration,
                'military_administration',
              ),
            ],
            [Markup.button.callback(Military.troopSupply, 'troop_supply')],
            [
              Markup.button.callback(
                Military.militaryEquipment,
                'military_equipment',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('state_security')
  async onStateSecurity(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.military, Military.stateSecurity, ctx);
  }

  @Action('state_border_security')
  async onStateBorderSecurity(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.military,
      Military.stateBorderSecurity,
      ctx,
    );
  }

  @Action('military_administration')
  async onMilitaryAdministration(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.military,
      Military.militaryAdministration,
      ctx,
    );
  }

  @Action('troop_supply')
  async onTroopSupply(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.military, Military.troopSupply, ctx);
  }

  @Action('military_equipment')
  async onMilitaryEquipment(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.military,
      Military.militaryEquipment,
      ctx,
    );
  }

  // ======= CIVIL_SECURITY ============================================

  @Action('civil_security')
  async addCivilSecurity(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                CivilSecurity.fireSecurity,
                'fire_security',
              ),
            ],
            [
              Markup.button.callback(
                CivilSecurity.lawEnforcementActivity,
                'law_enforcement_activity',
              ),
            ],
            [Markup.button.callback(CivilSecurity.civilSecur, 'civil_secur')],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('fire_security')
  async onFireSecurity(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.civilSecurity,
      CivilSecurity.fireSecurity,
      ctx,
    );
  }

  @Action('law_enforcement_activity')
  async onLawEnforcementActivity(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.civilSecurity,
      CivilSecurity.lawEnforcementActivity,
      ctx,
    );
  }

  @Action('civil_secur')
  async onCivilSecur(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.civilSecurity,
      CivilSecurity.civilSecur,
      ctx,
    );
  }

  // ======= TRANSPORT ============================================

  @Action('transport')
  async addTransport(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть спеціальність:</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback(
                Transport.riverAndSeaTransport,
                'river_and_sea_transport',
              ),
            ],
            [Markup.button.callback(Transport.aviaTransport, 'avia_transport')],
            [
              Markup.button.callback(
                Transport.reilwayTransport,
                'reilway_transport',
              ),
            ],
            [Markup.button.callback(Transport.autoTransport, 'auto_transport')],
            [
              Markup.button.callback(
                Transport.transportTechnologies,
                'transport_technologies',
              ),
            ],
            [
              Markup.button.callback(
                `${Emoji.back} Повернутися`,
                'back_to_branch',
              ),
            ],
          ],
        },
      },
    );
  }

  // =======

  @Action('river_and_sea_transport')
  async onRiverAndSeaTransport(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.transport,
      Transport.riverAndSeaTransport,
      ctx,
    );
  }

  @Action('avia_transport')
  async onAviaTransport(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.transport, Transport.aviaTransport, ctx);
  }

  @Action('reilway_transport')
  async onReilwayTransport(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(
      Branch.transport,
      Transport.reilwayTransport,
      ctx,
    );
  }

  @Action('auto_transport')
  async onAutoTransport(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await this.chooseDiscipline(Branch.transport, Transport.autoTransport, ctx);
  }

  @Action('transport_technologies')
  async onTransportTechnologies(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    await this.chooseDiscipline(
      Branch.transport,
      Transport.transportTechnologies,
      ctx,
    );
  }

  // =========================================================================

  @Action('back_to_branch')
  async backToBranch(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `<b>${Emoji.question} Виберіть галузь знань:</b>`,
      {
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
            [
              Markup.button.callback(
                Branch.naturalSciences,
                'natural_sciences',
              ),
            ],
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
            [
              Markup.button.callback(
                Branch.productionAndTechnologies,
                'production_and_technologies',
              ),
            ],
            [
              Markup.button.callback(
                Branch.architectureAndConstruction,
                'architecture_and_construction',
              ),
            ],
            [
              Markup.button.callback(
                Branch.agriculturalSciencesAndFood,
                'agricultural_sciences_and_food',
              ),
            ],
            [Markup.button.callback(Branch.veterinary, 'veterinary')],
            [Markup.button.callback(Branch.healthCare, 'health_care')],
            [Markup.button.callback(Branch.socialWork, 'social_work')],
            [Markup.button.callback(Branch.serviceSector, 'service_sector')],
            [Markup.button.callback(Branch.military, 'military')],
            [Markup.button.callback(Branch.civilSecurity, 'civil_security')],
            [Markup.button.callback(Branch.transport, 'transport')],
          ],
        },
      },
    );
  }

  @Action('go-forward_to_theme')
  async goForward(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'DISCIPLINE_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('THEME_SCENE', ctx.session.__scenes.state);

    if (this.disciplineStartMessageId) {
      await ctx.deleteMessage(this.disciplineStartMessageId);
      this.disciplineStartMessageId = 0;
    }
    if (this.disciplineChoiceMessageId) {
      await ctx.deleteMessage(this.disciplineChoiceMessageId);
      this.disciplineChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @Action('change_discipline')
  async changeDiscipline(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    if (ctx.scene.current.id !== 'DISCIPLINE_SCENE') {
      return;
    }

    await ctx.answerCbQuery();
    await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);

    if (this.disciplineChoiceMessageId) {
      await ctx.deleteMessage(this.disciplineChoiceMessageId);
      this.disciplineChoiceMessageId = 0;
    }
    if (this.commandForbiddenMessageId) {
      await ctx.deleteMessage(this.commandForbiddenMessageId);
      this.commandForbiddenMessageId = 0;
    }
    return;
  }

  @On('text')
  async onTextInDisciplineScene(
    @Ctx() ctx: Scenes.SceneContext<IOrderSceneState>,
  ) {
    const gate = await this.onSceneGateWithoutEnterScene(
      ctx,
      'DISCIPLINE_SCENE',
      Forbidden.enterCommands,
    );
    if (gate) {
      const { branch, specialization } = ctx.session.__scenes.state.discipline;
      if (!branch && !specialization) {
        await ctx.scene.enter('DISCIPLINE_SCENE', ctx.session.__scenes.state);
        return;
      } else {
        await this.disciplineChoiceMarkup(ctx);
        return;
      }
    }
  }

  @SceneLeave()
  onSceneLeave(@Ctx() ctx: Scenes.SceneContext<IOrderSceneState>) {
    ctx.from.id;
  }
}
