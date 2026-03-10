import type { Miss } from '@/types/miss';

import jupiterImg from '../../assets/planets/jupiter.png';
import earthImg from '../../assets/planets/earth.png';
import neptuneImg from '../../assets/planets/neptune.png';
import moonImg from '../../assets/planets/moon.png';
import marsImg from '../../assets/planets/mars.png';
import uranusImg from '../../assets/planets/uranus.png';
import saturnImg from '../../assets/planets/saturn.png';
import venusImg from '../../assets/planets/venus.png';

import alinaPreview from '../../assets/miski_main/alina.JPG';
import nastyaPreview from '../../assets/miski_main/nastya.JPG';
import ksyushaPreview from '../../assets/miski_main/ksusha.JPG';
import emiliyaPreview from '../../assets/miski_main/emilia.jpg';
import angelinaPreview from '../../assets/miski_main/angelina.jpg';
import adelyaPreview from '../../assets/miski_main/adel.JPG';
import polinaPreview from '../../assets/miski_main/polina.JPG';
import sonyaPreview from '../../assets/miski_main/sonya.JPG';

import alinaHero from '../../assets/first_in_galary/alina.JPG';
import nastyaHero from '../../assets/first_in_galary/nastya.png';
import ksyushaHero from '../../assets/first_in_galary/ksusha.jpg';
import emiliyaHero from '../../assets/first_in_galary/emilia.png';
import angelinaHero from '../../assets/first_in_galary/angelina.png';
import adelyaHero from '../../assets/first_in_galary/adel.png';
import polinaHero from '../../assets/first_in_galary/polina.jpg';
import sonyaHero from '../../assets/first_in_galary/sonya.jpg';

const galleryModules = import.meta.glob(
  '../../assets/miski_photo/**/*.{jpg,JPG,jpeg,png}',
  { eager: true },
) as Record<string, { default: string }>;

function getGallery(folderName: string): string[] {
  return Object.entries(galleryModules)
    .filter(([path]) => {
      const parts = path.split('/');
      return parts[parts.length - 2] === folderName;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod]) => mod.default);
}

export const misses: Miss[] = [
  {
    id: 'alina',
    order: 1,
    firstName: 'Алина',
    lastName: 'Василевская',
    username: '@allliiiinnnaaa',
    className: '10 ГУМ',
    instagramUrl: 'https://www.instagram.com/allliiiinnnaaa',
    description: '',
    quote: 'Цитата появится скоро',
    previewImage: alinaPreview,
    heroImage: alinaHero,
    planetImage: jupiterImg,
    planetPosition: 'topLeft',
    isPublished: true,
    gallery: getGallery('Алина'),
    interview: [
      {
        question: 'Расскажи про планету, которая тебе досталась.',
        answer: 'Мне достался Юпитер. Это одна из самых ярких звезд на ночном небе и по совместительству самая большая планета солнечной системы. Юпитер символизирует мудрость, удачу, знания и справедливость.',
      },
      {
        question: 'Какие общие черты ты находишь со своей планетой?',
        answer: 'Говорят, что Юпитер выглядит как яркая и ровно сияющая звезда. И я пытаюсь сделать всё, чтобы, когда я была на сцене, я наполняла зрителя своей энергетикой, сияла так же сильно, как Юпитер. И я думаю, этим мы с ним похожи.',
      },
      {
        question: 'У многих планет есть спутники. Опиши своего идеального спутника.',
        answer: 'Мой идеальный спутник должен быть похож на моего папу: он должен быть мужественным, справедливым, любящим, заботливым и дружелюбным. Ну и, конечно, с хорошим чувством юмора.',
      },
      {
        question: 'Я слышал, что ты на отбор на «Мисс Лицей» ты принесла огромную тетрадку со своими записями. Расскажи, как проходил отбор и помогла ли тебе твоя тетрадка.',
        answer: 'Да, я действительно принесла с собой тетрадку, но не думай, что она была прям большой. На самом деле, это была моя опора, потому что у меня всё запланировано, и я всегда четко следую своему плану. Я действительно готовилась к отбору и невероятно хотела попасть на мероприятие, поэтому я боялась что-то забыть или упустить, но со своими записями я чувствовала себя уверенно и у меня отбор прошел хорошо. Как ты заметил, я люблю структурировать свои идеи, но не всё в моей жизни распланировано и записано. Иногда и я люблю спонтанные идеи, а лучше всего у меня получается совмещать структуру и спонтанность.',
      },
      {
        question: 'Расскажи про твое самое любимое мероприятие в лицее.',
        answer: 'Наверное, мое любимое мероприятие в лицее - это «Салют». Как только ты приходишь в лицей и видишь эту дружественную атмосферу, видишь всех этих людей, сидишь в кругу на дискотеке, когда включают «Рэжым у самалёце», ты сразу понимаешь, насколько здесь все сплоченные. Всё так ярко и красочно! Это сразу очень привлекает и подкупает 10-х, которые только поступили сюда.',
      },
    ],
    theme: {
      background: '#0D0B1A',
      glow: 'rgba(214, 162, 100, 0.18)',
      text: '#F5E6D3',
      accent: '#D6A264',
    },
  },
  {
    id: 'nastya',
    order: 2,
    firstName: 'Настя',
    lastName: 'Коновалова',
    username: '@anastya_kon',
    className: '10 ИФ',
    instagramUrl: 'https://www.instagram.com/anastya_kon',
    description: 'Интервью пока нет',
    quote: 'Цитата появится скоро',
    previewImage: nastyaPreview,
    heroImage: nastyaHero,
    planetImage: earthImg,
    planetPosition: 'topRight',
    isPublished: true,
    gallery: getGallery('Настя'),
    interview: [
      {
        question: 'Расскажи про планету, которая тебе досталась.',
        answer:
          'Моя планета - Земля. Это единственная планета, на которой есть жизнь. Мне очень нравится, что она контрастная: там есть и очень тихие места, например, ледники, и очень шумные, как моря в шторм. Я думаю, что Земля - это не просто почва под ногами, а место, где жизнь проявляется в миллионах разных форм.',
      },
      {
        question: 'Какие общие черты ты находишь со своей планетой?',
        answer:
          'Мне кажется, я такая же разносторонняя. Это проявляется в моих хобби - их очень много, и они все разные. И в моем настроении: оно часто меняется, я яркая и эмоциональная, но иногда бываю спокойной.',
      },
      {
        question: 'Перечисли парочку своих хобби. Чем занимаешься?',
        answer:
          'На самом деле я занималась многими вещами: вокал, гитара, какое-то время это был спорт, танцы, разное рукоделие.',
      },
      {
        question: 'У многих планет есть спутники. Опиши своего идеального спутника.',
        answer:
          'Мне нравится архетип Луны. Луна часто символизирует любовь и симпатию в мире. Она всегда рядом с Землей, но её не всегда видно. Это как тихое счастье: оно всегда есть, но не прямо яркое. А еще она светит, когда темно.',
      },
      {
        question: 'Что бы ты хотела успеть сделать в своей жизни? Есть мечты, которые хотелось бы воплотить?',
        answer:
          'Я бы хотела нести свои разные идеи в люди. Хотела бы учить людей, чтобы у них все лучше получалось. Моя мечта - научить человечество чему-то хорошему.',
      },
      {
        question: 'В каком спорте ты бы хотела стать успешной и почему?',
        answer:
          'Наверное, это была бы художественная гимнастика или фигурное катание. Для меня важно всегда развиваться в разных направлениях, а эти виды спорта сочетают в себе много разных аспектов: и подбор музыки важен, и подбор костюмов, и сама физическая подготовка.',
      },
    ],
    theme: {
      background: '#070E1C',
      glow: 'rgba(74, 155, 217, 0.18)',
      text: '#D6E8F5',
      accent: '#4A9BD9',
    },
  },
  {
    id: 'ksyusha',
    order: 3,
    firstName: 'Ксюша',
    lastName: 'Антонова',
    username: '@antonotonova',
    className: '10 ФИЛ',
    instagramUrl: 'https://www.instagram.com/antonotonova',
    description: '',
    quote: 'Цитата появится скоро',
    previewImage: ksyushaPreview,
    heroImage: ksyushaHero,
    planetImage: neptuneImg,
    planetPosition: 'topCenter',
    isPublished: false,
    gallery: getGallery('Ксюша'),
    interview: [
      {
        question: 'Расскажи про планету, которая тебе досталась?',
        answer: 'Мне досталась планета Нептун. Это самая далекая от солнца планета, которая, насколько я помню, продолжает отдаляться от солнца и выходит из солнечной системы. Но мне кажется я вообще не такая, по крайней мере, я на это надеюсь.',
      },
      {
        question: 'Может быть ты находишь общие черты со своей планетой?',
        answer: 'Как я уже сказала, Нептун выходит из солнечной системы и иногда у меня бывали моменты, когда я отдалялась от некоторых людей. Конечно, всем мил не будешь и были в моей жизни моменты, когда я была таким "нептуном". Это происходило уже после того как я перешла на белорусский язык и почти всегда из-за того, что я разговариваю по-белорусски. В таких случаях мама мне всегда говорила, что если ты не можешь изменить ситуацию - нужно изменить взгляд на нее.',
      },
      {
        question: 'У многих планет есть спутники, опиши твоего идеального спутника',
        answer: 'Ты знаешь, я отвечу на этот вопрос так: спутник способствует развитию планеты, поэтому мне кажется, что и в жизни спутник должен помогать планете, помогать раскрыть ей ее потенциал.',
      },
      {
        question: 'Когда я с тобой только познакомился, у меня вызвало огромное уважение то, что ты разговариваешь и переписываешься исключительно на белорусском языке. Расскажи как прокачать язык до такого же уровня',
        answer: 'Часто люди говорят про иностранный язык, что я достигну достойного уровня языка только когда я поеду в Америку или в Англию и буду там разговаривать на английском языке с носителями. И нет страны лучше для практики белорусского языка, чем Беларусь, поэтому я стараюсь максимально на нем разговаривать тут. Но на самом деле я полиглот и если ты собираешься учить новый язык - тебе нужно задать себе вопрос "а зачем мне учить новый язык?" И когда ты поймешь зачем тебе учить язык и поставишь себе четкую цель - учить новые языки станет проще.',
      },
      {
        question: 'Ты прошла уже огромный путь и до мисски осталось не так много времени. Ощущаешь ли ты, что час икс становится все ближе и что ты при этом чувствуешь',
        answer: 'Я вообще не ощущаю время в лицее. Оно пролетает невероятно быстро и ты просто не успеваешь за ним. Напоминают о приближении мисски только дедлайны, которые я каждый день проверяю, чтобы не забыть скинуть костюм или прислать коллаж. У меня уже появился планер для дедлайнов, но он все равно мне не помогает. А что касается "дня икс": я надеюсь, что будет уже тепло и что Мисс Лицей станет для меня одним из самых счастливых моментов Лицея.',
      },
    ],
    theme: {
      background: '#080A20',
      glow: 'rgba(75, 110, 215, 0.2)',
      text: '#C8D4F5',
      accent: '#5B7ED9',
    },
  },
  {
    id: 'emiliya',
    order: 4,
    firstName: 'Эмилия',
    lastName: 'Сидоренко',
    username: '@emilkswx',
    className: '10 ИСТ',
    instagramUrl: 'https://www.instagram.com/emilkswx',
    description: '',
    quote: 'Цитата появится скоро',
    previewImage: emiliyaPreview,
    heroImage: emiliyaHero,
    planetImage: moonImg,
    planetPosition: 'topLeft',
    isPublished: false,
    gallery: getGallery('Эмилия'),
    interview: [
      {
        question: 'Расскажи про планету, которая тебе досталась?',
        answer: 'Моя планета - это Меркурий. Это самая маленькая в солнечной системе, но, по совместительству, самая близкая планета к солнцу. Ее назвали в честь древнеримского бога торговли и поэтому она символизирует быстроту, ловкость, речь и письмо.',
      },
      {
        question: 'Какие общие черты ты находишь со своей планетой',
        answer: 'Во первых, я посмотрела, что моя планета является уравнительной планетой для моего знака зодиака девы, потому это уже какой-то знак. И вообще я нахожу сходства в том, что я тоже быстрая, ловкая, люблю общаться и быстро все решать',
      },
      {
        question: 'У многих планет есть спутники. Опиши своего идеального спутника',
        answer: 'Я хочу сказать так: спутники, которые есть у планет влияют на них своим гравитационным притяжением и тем самым влияют на скорость планеты, на ее курс. Поэтому, чтобы не сбиваться со своего курса, я предпочитаю спутников не иметь.',
      },
      {
        question: 'Есть ли у тебя дальнейшие амбиции на лицейскую сцену?',
        answer: 'Они были, есть и будут. Пока у меня все силы забирает мисска, потом посмотрим как все будет складываться. А желание выступать на сцене у меня появилось еще на салюте, так что я буду стараться пробовать себя во всем',
      },
      {
        question: 'В каком фильме и вместо какого актера/актриссы ты бы снялась?',
        answer: 'Наверное, мне бы хотелось сняться не в фильме, а в целой эпохе фильмов: в золотом веке Голливуда. Сейчас понятно как снимают фильмы, а раньше все снималось на пленку и хотелось бы сняться в чем-нибудь культовом. Если брать конкретный пример, то это "Унесенные ветром" за авторством Вивьена Ли. Мне нравится стилистика этого фильма, атмосфера середины 19 века и мне очень импонирует книга, которая была взята за основу.',
      },
    ],
    theme: {
      background: '#0E0E18',
      glow: 'rgba(192, 192, 220, 0.15)',
      text: '#E8E8F0',
      accent: '#B8B8D0',
    },
  },
  {
    id: 'angelina',
    order: 5,
    firstName: 'Ангелина',
    lastName: 'Самокиш',
    username: '@samokish_angelina',
    className: '10 ФИЛ',
    instagramUrl: 'https://www.instagram.com/samokish_angelina',
    description: 'Интервью пока нет',
    quote: 'Цитата появится скоро',
    previewImage: angelinaPreview,
    heroImage: angelinaHero,
    planetImage: marsImg,
    planetPosition: 'topRight',
    isPublished: false,
    gallery: getGallery('Ангелина'),
    theme: {
      background: '#150A0A',
      glow: 'rgba(205, 100, 90, 0.18)',
      text: '#F0D0CC',
      accent: '#CD645A',
    },
  },
  {
    id: 'adelya',
    order: 6,
    firstName: 'Адель',
    lastName: 'Шаповалова',
    username: '@zeerrhy',
    className: '10 БИО1',
    instagramUrl: 'https://www.instagram.com/zeerrhy',
    description: 'Интервью пока нет',
    quote: 'Цитата появится скоро',
    previewImage: adelyaPreview,
    heroImage: adelyaHero,
    planetImage: uranusImg,
    planetPosition: 'topCenter',
    isPublished: false,
    gallery: getGallery('Адель'),
    theme: {
      background: '#081515',
      glow: 'rgba(100, 200, 200, 0.15)',
      text: '#D0F0F0',
      accent: '#6EC8C8',
    },
  },
  {
    id: 'polina',
    order: 7,
    firstName: 'Полина',
    lastName: 'Искорцева',
    username: '@_domofonnnnn_',
    className: '10 ЭГ',
    instagramUrl: 'https://www.instagram.com/_domofonnnnn_',
    description: 'Интервью пока нет',
    quote: 'Цитата появится скоро',
    previewImage: polinaPreview,
    heroImage: polinaHero,
    planetImage: saturnImg,
    planetPosition: 'topLeft',
    isPublished: false,
    gallery: getGallery('Полина'),
    theme: {
      background: '#14100A',
      glow: 'rgba(212, 176, 106, 0.18)',
      text: '#F0E8D4',
      accent: '#D4B06A',
    },
  },
  {
    id: 'sonya',
    order: 8,
    firstName: 'Соня',
    lastName: 'Ляшевич',
    username: '@sonlywqx',
    className: '10 ЭГ',
    instagramUrl: 'https://www.instagram.com/sonlywqx',
    description: 'Интервью пока нет',
    quote: 'Цитата появится скоро',
    previewImage: sonyaPreview,
    heroImage: sonyaHero,
    planetImage: venusImg,
    planetPosition: 'topRight',
    isPublished: false,
    gallery: getGallery('Соня'),
    theme: {
      background: '#160D10',
      glow: 'rgba(220, 170, 130, 0.16)',
      text: '#F0E0D4',
      accent: '#DCA882',
    },
  },
];
