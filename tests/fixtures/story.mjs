// Технический сюжет для проверки движка; не публикуется в приложении.
export const story = {
  id: 'engine-fixture', collection: 'Test', title: 'Test', start: 'part1-start',
  chapters: [{ number: 1, name: 'Test', parts: [
    { number: 1, title: 'Part 1', start: 'part1-start', sceneCount: 3, published: true },
    { number: 2, title: 'Part 2', start: 'part2-start', sceneCount: 1, published: true },
    { number: 3, title: 'Part 3', start: 'part3-start', sceneCount: 1, published: true }
  ] }],
  scenes: [
    { id: 'part1-start', chapter: 1, part: 1, type: 'narration', next: 'part1-choice' },
    { id: 'part1-choice', chapter: 1, part: 1, type: 'choice', choices: [
      { id: 'route', effects: { route: 1 }, next: 'part1-route', summary: 'Route' },
      { id: 'mood', effects: { mood: 1 }, next: 'part1-mood', summary: 'Mood' }
    ] },
    { id: 'part1-route', chapter: 1, part: 1, type: 'narration', next: 'part1-end' },
    { id: 'part1-mood', chapter: 1, part: 1, type: 'narration', next: 'part1-end' },
    { id: 'part1-end', chapter: 1, part: 1, type: 'part_end', next: 'part2-start' },
    { id: 'part2-start', chapter: 1, part: 2, type: 'narration', next: 'part2-end' },
    { id: 'part2-end', chapter: 1, part: 2, type: 'part_end', next: 'part3-start' },
    { id: 'part3-start', chapter: 1, part: 3, type: 'narration', next: 'part3-end' },
    { id: 'part3-end', chapter: 1, part: 3, type: 'part_end', next: null }
  ]
};
