// Биографический рассказ: исходные факты переданы автором воспоминаний.
// Тексты новых частей намеренно не подменены вымыслом.
export const stories = [
  {
    id: 'three-years-to-home',
    collection: 'АРМЕЙСКИЕ ИСТОРИИ',
    title: 'Три года до дома',
    shortDescription: '1990 год. Из Минска — в Севастополь. Начало трёх лет службы на атомной подводной лодке.',
    genre: 'Реальные воспоминания',
    duration: '5–7 минут',
    cover: '/assets/cover.webp',
    start: 'c1p1-01',
    chapters: [
      {
        number: 1,
        name: 'Начало службы',
        subtitle: 'Призыв. Дорога. Севастополь.',
        poster: '/assets/enlist.webp',
        parts: [
          { number: 1, title: 'Дорога в Севастополь', subtitle: '19–21 ноября 1990 года', start: 'c1p1-01', sceneCount: 9, published: true },
          { number: 2, title: 'Продолжение', subtitle: 'Ожидает воспоминаний', published: false },
          { number: 3, title: 'Продолжение', subtitle: 'Ожидает воспоминаний', published: false }
        ]
      },
      { number: 2, name: 'Следующая глава', subtitle: 'Сюжет ещё не записан', poster: '/assets/submarine.webp', parts: [] }
    ],
    scenes: [
      {
        id: 'c1p1-01', chapter: 1, part: 1, background: 'station', type: 'narration',
        label: '19 НОЯБРЯ · РАННЕЕ УТРО',
        text: '19 ноября 1990 года, ранним утром, нас увезли в областной военкомат. С этого утра и началась моя дорога на флот.',
        next: 'c1p1-02'
      },
      {
        id: 'c1p1-02', chapter: 1, part: 1, background: 'paper', type: 'narration',
        label: 'ОБЛАСТНОЙ ВОЕНКОМАТ',
        text: 'Там я узнал: меня забирают в Военно-морской флот. Служить придётся целых три года. Услышал это — и на душе сразу стало тяжело. Накатила тоска.',
        next: 'c1p1-03'
      },
      {
        id: 'c1p1-03', chapter: 1, part: 1, background: 'train', type: 'narration',
        label: '19 НОЯБРЯ · ВЕЧЕР',
        text: 'Вечером нас посадили на поезд. Из Минска — в Симферополь, а оттуда дальше, в Севастополь. Дорога к месту службы только начиналась.',
        next: 'c1p1-04'
      },
      {
        id: 'c1p1-04', chapter: 1, part: 1, background: 'train', type: 'choice',
        label: 'В ДОРОГЕ',
        text: 'Поезд увозил нас всё дальше на юг. В памяти остались и сам маршрут, и настроение ребят, которым предстояло служить три года. Что рассмотреть ближе?' ,
        choices: [
          { id: 'route', text: 'Посмотреть путь', hint: 'Минск → Симферополь → Севастополь', effects: { route: 1 }, next: 'c1p1-05a', summary: 'Ты рассмотрел маршрут.' },
          { id: 'mood', text: 'Узнать, как ехали призывники', hint: 'Атмосфера в поезде', effects: { mood: 1 }, next: 'c1p1-05b', summary: 'Ты обратил внимание на настроение в поезде.' }
        ]
      },
      {
        id: 'c1p1-05a', chapter: 1, part: 1, background: 'route', type: 'archive',
        label: 'МАРШРУТ · ПО ВОСПОМИНАНИЯМ',
        text: 'Минск. Потом Симферополь. И, наконец, Севастополь. Таков был маршрут, с которого начиналась служба.',
        note: 'Год призыва уточнён позднее: 1990. Пункты маршрута — из исходных воспоминаний.',
        next: 'c1p1-06'
      },
      {
        id: 'c1p1-05b', chapter: 1, part: 1, background: 'train', type: 'archive',
        label: 'АТМОСФЕРА · В ПОЕЗДЕ',
        text: 'Три года службы — для многих это известие было тяжёлым. В вагоне находились те, кто пытался утопить свою тоску в спиртном.',
        note: 'Это деталь из воспоминаний, а не описание поступков рассказчика.',
        next: 'c1p1-06'
      },
      {
        id: 'c1p1-06', chapter: 1, part: 1, background: 'train', type: 'narration',
        label: 'ПОЕЗД · НА ЮГ',
        text: 'В поезде многие переживали из-за трёх лет службы. Кто-то пытался заглушить это горе спиртным. Так мы и ехали на юг — навстречу неизвестной ещё жизни.',
        next: 'c1p1-07'
      },
      {
        id: 'c1p1-07', chapter: 1, part: 1, background: 'sea', type: 'narration',
        label: '21 НОЯБРЯ · НОЧЬ',
        text: '21 ноября, уже ночью, мы прибыли в Севастополь. Нас отправили на распределительный пункт. Дорога закончилась. Служба только начиналась.',
        next: 'c1p1-08'
      },
      {
        id: 'c1p1-08', chapter: 1, part: 1, background: 'barracks', type: 'narration',
        label: 'РАСПРЕДЕЛИТЕЛЬНЫЙ ПУНКТ',
        text: 'В казарме были ребята, приехавшие из разных уголков Советского Союза. Нас уложили вместе с ними — всех, кто только что прибыл.',
        next: 'c1p1-09'
      },
      {
        id: 'c1p1-09', chapter: 1, part: 1, background: 'barracks', type: 'narration',
        label: 'ПЕРВАЯ НОЧЬ В КАЗАРМЕ',
        text: 'Спали прямо в одежде. Мне достался второй ярус. Эту первую ночь в Севастополе я запомнил именно такой.',
        next: 'c1p1-end'
      },
      {
        id: 'c1p1-end', chapter: 1, part: 1, background: 'barracks', type: 'part_end',
        label: 'ГЛАВА 01 · ЧАСТЬ 01',
        text: 'Севастополь. Казарма. Второй ярус кровати и одежда, которую даже не снимали. Так закончилась первая часть этой истории. Остальные события — впереди.',
        next: null
      }
    ]
  }
];

export function getStory(id) { return stories.find(s => s.id === id) || null; }
export function getScene(story, id) { return story.scenes.find(scene => scene.id === id) || null; }
