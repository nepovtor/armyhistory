// Биографический рассказ: исходные факты переданы автором воспоминаний.
// Тексты новых частей намеренно не подменены вымыслом.
export const stories = [
  {
    id: 'three-years-to-home',
    collection: 'АРМЕЙСКИЕ ИСТОРИИ',
    title: 'Три года до дома',
    shortDescription: 'Дорога из Минска в Севастополь. Начало службы на флоте, о которой ещё ничего не известно.',
    genre: 'Реальные воспоминания',
    duration: '4–6 минут',
    cover: '/assets/cover.svg',
    start: 'c1p1-01',
    chapters: [
      {
        number: 1,
        name: 'Начало службы',
        subtitle: 'Призыв. Дорога. Севастополь.',
        poster: '/assets/cover.svg',
        parts: [
          { number: 1, title: 'Дорога в Севастополь', subtitle: '19–21 ноября', start: 'c1p1-01', sceneCount: 9, published: true },
          { number: 2, title: 'Продолжение', subtitle: 'Ожидает воспоминаний', published: false },
          { number: 3, title: 'Продолжение', subtitle: 'Ожидает воспоминаний', published: false }
        ]
      },
      { number: 2, name: 'Следующая глава', subtitle: 'Сюжет ещё не записан', poster: '/assets/sea.svg', parts: [] }
    ],
    scenes: [
      {
        id: 'c1p1-01', chapter: 1, part: 1, background: 'station', type: 'narration',
        label: '19 НОЯБРЯ · РАННЕЕ УТРО',
        text: '19 ноября ранним утром нас увезли в областной военкомат.',
        next: 'c1p1-02'
      },
      {
        id: 'c1p1-02', chapter: 1, part: 1, background: 'paper', type: 'narration',
        label: 'ОБЛАСТНОЙ ВОЕНКОМАТ',
        text: 'Когда узнал, что меня забирают в Военно-морской флот и служить придётся три года, тоска напала.',
        next: 'c1p1-03'
      },
      {
        id: 'c1p1-03', chapter: 1, part: 1, background: 'train', type: 'narration',
        label: '19 НОЯБРЯ · ВЕЧЕР',
        text: 'Вечером нас увезли поездом из Минска в Симферополь. Дальше путь лежал в Севастополь.',
        next: 'c1p1-04'
      },
      {
        id: 'c1p1-04', chapter: 1, part: 1, background: 'train', type: 'choice',
        label: 'В ДОРОГЕ',
        text: 'Длинная дорога на юг. На какой детали рассказа остановиться?',
        choices: [
          { id: 'route', text: 'Посмотреть путь', hint: 'Минск → Симферополь → Севастополь', effects: { route: 1 }, next: 'c1p1-05a', summary: 'Ты рассмотрел маршрут.' },
          { id: 'mood', text: 'Узнать, как ехали призывники', hint: 'Атмосфера в поезде', effects: { mood: 1 }, next: 'c1p1-05b', summary: 'Ты обратил внимание на настроение в поезде.' }
        ]
      },
      {
        id: 'c1p1-05a', chapter: 1, part: 1, background: 'route', type: 'archive',
        label: 'МАРШРУТ · ПО ВОСПОМИНАНИЯМ',
        text: 'Минск → Симферополь → Севастополь. Так начался путь к месту службы.',
        note: 'Год отправления в исходном рассказе пока не указан.',
        next: 'c1p1-06'
      },
      {
        id: 'c1p1-05b', chapter: 1, part: 1, background: 'train', type: 'archive',
        label: 'АТМОСФЕРА · В ПОЕЗДЕ',
        text: 'От горя, что служить надо целых три года, многие топили свои переживания в спиртном.',
        note: 'Это деталь из воспоминаний, а не описание поступков рассказчика.',
        next: 'c1p1-06'
      },
      {
        id: 'c1p1-06', chapter: 1, part: 1, background: 'train', type: 'narration',
        label: 'ПОЕЗД · НА ЮГ',
        text: 'В поезде от горя, что служить надо три года, многие пытались заглушить переживания спиртным.',
        next: 'c1p1-07'
      },
      {
        id: 'c1p1-07', chapter: 1, part: 1, background: 'sea', type: 'narration',
        label: '21 НОЯБРЯ · НОЧЬ',
        text: 'Ночью 21 ноября прибыли в Севастополь. Нас направили на распределительный пункт.',
        next: 'c1p1-08'
      },
      {
        id: 'c1p1-08', chapter: 1, part: 1, background: 'barracks', type: 'narration',
        label: 'РАСПРЕДЕЛИТЕЛЬНЫЙ ПУНКТ',
        text: 'В казарме уже были ребята, прибывшие из разных уголков СССР. Нас разместили вместе с ними.',
        next: 'c1p1-09'
      },
      {
        id: 'c1p1-09', chapter: 1, part: 1, background: 'barracks', type: 'narration',
        label: 'ПЕРВАЯ НОЧЬ В КАЗАРМЕ',
        text: 'Спали прямо в одежде. Мне достался второй ярус.',
        next: 'c1p1-end'
      },
      {
        id: 'c1p1-end', chapter: 1, part: 1, background: 'barracks', type: 'part_end',
        label: 'ГЛАВА 01 · ЧАСТЬ 01',
        text: 'Первая ночь в Севастополе. На этом записанные воспоминания пока обрываются.',
        next: null
      }
    ]
  }
];

export function getStory(id) { return stories.find(s => s.id === id) || null; }
export function getScene(story, id) { return story.scenes.find(scene => scene.id === id) || null; }
