import { readFileSync } from 'node:fs';

// Текст и стабильные ID берутся из раскадровки исправленного авторского рассказа.
const chapter = JSON.parse(readFileSync(new URL('../production/chapter01/storyboard.json', import.meta.url), 'utf8'));
const partDates = ['19–21 ноября 1990 года', '21 ноября 1990 года', '22–25 ноября 1990 года'];

export const stories = [{
  id: 'first-days-1990',
  collection: 'Армейские воспоминания',
  title: chapter.title,
  shortDescription: 'Минск — Симферополь — Севастополь. 19–25 ноября 1990 года.',
  genre: 'Личные воспоминания',
  duration: `${Math.ceil(chapter.slides.reduce((sum, slide) => sum + slide.wordCount, 0) / 180)} минут чтения`,
  cover: null,
  start: chapter.slides[0].id,
  chapters: [{
    number: 1, name: chapter.title, subtitle: chapter.period, poster: null,
    parts: chapter.parts.map(part => ({
      number: part.number, title: part.title, subtitle: partDates[part.number - 1],
      start: chapter.slides.find(slide => slide.part === part.number).id,
      sceneCount: part.slides.length, published: true
    }))
  }],
  scenes: chapter.slides.map((slide, index) => ({
    id: slide.id, chapter: 1, part: slide.part,
    type: chapter.slides[index + 1]?.part === slide.part ? 'narration' : 'part_end',
    label: slide.title, text: slide.text, artwork: null,
    next: chapter.slides[index + 1]?.id ?? null
  }))
}];

export function getStory(id) { return stories.find(s => s.id === id) || null; }
export function getScene(story, id) { return story.scenes.find(scene => scene.id === id) || null; }
