// The two comic stories (/istoria/apartament, /istoria/parcel) — Planning.md §3.
// The client is the protagonist, the agent is the guide. Text is live HTML over the artwork, never
// baked into the images. Artwork: src/assets/istoria/<story>/<panel number>.(jpg|png|webp) — a
// missing picture shows the scene description instead (storyboard mode).
// Prompts for generating the artwork: sonar-files/ai-renders/ISTORII-PROMPTS.md
// TODO: текстовете да се прегледат от клиента

export interface Bubble {
  who: 'agent' | 'client' | 'buyer';
  text: string;
  x: number;   // position over the picture, % (bubble's top-left corner)
  y: number;
}

export interface Panel {
  scene: string;          // what the picture shows — alt text + storyboard placeholder
  caption?: string;       // narrator box
  bubbles?: Bubble[];
  cta?: boolean;          // final "call us" panel
}

export interface Story {
  slug: 'apartament' | 'parcel';
  kicker: string;
  title: string;
  panels: Panel[];
}

const CTA: Panel = {
  scene: 'Агентът на Sonar на вратата на офиса, усмихнат, кани читателя да влезе.',
  caption: 'Ако и вие искате така —',
  cta: true,
};

export const stories: Story[] = [
  {
    slug: 'apartament',
    kicker: 'Историята · Апартамент и къща',
    title: 'Как стигате до ключа',
    panels: [
      {
        scene: 'Двойка клиенти и агентът на Sonar на маса — документи и лаптоп с обяви. Клиентите изглеждат притеснени.',
        caption: 'Всичко започва с един разговор.',
        bubbles: [
          { who: 'client', text: 'Искаме повече светлина и място за децата… но не знаем откъде да започнем.', x: 6, y: 58 },
          { who: 'agent', text: 'Затова сме тук. Нека видим какво е важно за вас.', x: 60, y: 14 },
        ],
      },
      {
        scene: 'Агентът (в костюм) и клиентите (в ежедневни дрехи) обикалят светъл апартамент на оглед.',
        caption: 'Обикаляме имотите заедно.',
        bubbles: [
          { who: 'client', text: 'Тази гледка…!', x: 8, y: 60 },
          { who: 'agent', text: 'А най-хубавото тепърва идва — вижте спалнята.', x: 58, y: 16 },
        ],
      },
      {
        scene: 'Агентът подрежда документите за покупката; клиентите се усмихват облекчено.',
        caption: 'Документите са наша грижа.',
        bubbles: [
          { who: 'agent', text: 'Всичко е проверено — нотариус, банка, скица.', x: 58, y: 14 },
          { who: 'client', text: 'Значи наистина няма за какво да се тревожим?', x: 6, y: 60 },
        ],
      },
      {
        scene: 'Клиентите получават ключа пред входната врата на новия си дом — радост.',
        caption: 'И ето го ключът.',
        bubbles: [{ who: 'client', text: 'Нашият дом!', x: 10, y: 62 }],
      },
      CTA,
    ],
  },
  {
    slug: 'parcel',
    kicker: 'Историята · Парцел',
    title: 'От идеята до готовата сграда',
    panels: [
      {
        scene: 'Клиентката-инвеститор и агентът на маса с карти и чертежи на лаптопа.',
        caption: 'Имате идея. Ние — опита.',
        bubbles: [
          { who: 'client', text: 'Мечтая за собствена сграда. Откъде изобщо се започва?', x: 6, y: 58 },
          { who: 'agent', text: 'С правилния терен. Ще ви покажа три.', x: 60, y: 14 },
        ],
      },
      {
        scene: 'Агентът и клиентката до кола, гледат зелен парцел — камерата е зад тях.',
        caption: 'Намираме терена.',
        bubbles: [{ who: 'agent', text: 'Тук има всичко за вашата идея — път, ток, вода и гледка към Витоша.', x: 52, y: 12 }],
      },
      {
        scene: 'Агентът паркира пред общината с папка документи под мишница.',
        caption: 'Разрешенията оставете на нас.',
        bubbles: [{ who: 'agent', text: 'Скица, виза, разрешение за строеж — днес приключваме.', x: 52, y: 14 }],
      },
      {
        scene: 'Агентът и клиентката обикалят строителната площадка с каски.',
        caption: 'Строим заедно с вас.',
        bubbles: [{ who: 'client', text: 'Не вярвах, че ще стане толкова бързо!', x: 6, y: 60 }],
      },
      {
        scene: 'Празнуване пред готовата сграда — клиентката, агентът, строителите.',
        caption: 'Акт 16. Готово.',
        bubbles: [{ who: 'client', text: 'Наздраве за новата сграда!', x: 8, y: 60 }],
      },
      {
        scene: 'Агентите на Sonar показват апартаментите в новата сграда на купувачи.',
        caption: 'А после продаваме апартаментите вместо вас.',
        bubbles: [{ who: 'buyer', text: 'Взимаме го!', x: 62, y: 58 }],
      },
      CTA,
    ],
  },
];
