import Fuse from 'fuse.js';

interface CategoryDefinition {
  name: string;
  validItems: string[];
}

export class CategoryService {
  private categories: CategoryDefinition[] = [
    {
      name: 'Countries',
      validItems: [
        'united states', 'canada', 'mexico', 'brazil', 'argentina', 'france',
        'germany', 'italy', 'spain', 'portugal', 'united kingdom', 'ireland',
        'japan', 'china', 'india', 'australia', 'egypt', 'south africa',
        'russia', 'poland', 'sweden', 'norway', 'denmark', 'netherlands',
        'belgium', 'switzerland', 'austria', 'greece', 'turkey', 'south korea',
        'thailand', 'vietnam', 'indonesia', 'philippines', 'malaysia', 'singapore',
        'new zealand', 'chile', 'peru', 'colombia', 'venezuela', 'cuba',
        'morocco', 'kenya', 'nigeria', 'ghana', 'ethiopia', 'tanzania'
      ]
    },
    {
      name: 'Animals',
      validItems: [
        'dog', 'cat', 'elephant', 'lion', 'tiger', 'bear', 'wolf', 'fox',
        'rabbit', 'deer', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken',
        'duck', 'eagle', 'owl', 'snake', 'crocodile', 'dolphin', 'whale',
        'shark', 'octopus', 'penguin', 'kangaroo', 'koala', 'panda', 'giraffe',
        'zebra', 'hippo', 'rhino', 'gorilla', 'chimpanzee', 'monkey', 'parrot',
        'flamingo', 'peacock', 'turtle', 'frog', 'butterfly', 'bee', 'ant',
        'spider', 'crab', 'lobster', 'salmon', 'tuna', 'seal', 'otter'
      ]
    },
    {
      name: 'Movies',
      validItems: [
        'titanic', 'avatar', 'star wars', 'the godfather', 'jurassic park',
        'the matrix', 'inception', 'forrest gump', 'the dark knight', 'frozen',
        'toy story', 'finding nemo', 'the lion king', 'shrek', 'jaws',
        'rocky', 'gladiator', 'braveheart', 'terminator', 'alien', 'aliens',
        'back to the future', 'e.t.', 'indiana jones', 'lord of the rings',
        'harry potter', 'spider-man', 'batman', 'superman', 'iron man',
        'avengers', 'guardians of the galaxy', 'black panther', 'wonder woman',
        'the wizard of oz', 'gone with the wind', 'casablanca', 'psycho',
        'goodfellas', 'scarface', 'pulp fiction', 'fight club', 'the shining'
      ]
    },
    {
      name: 'Foods',
      validItems: [
        'pizza', 'pasta', 'burger', 'sushi', 'tacos', 'curry', 'salad',
        'soup', 'steak', 'chicken', 'rice', 'bread', 'cheese', 'eggs',
        'bacon', 'pancakes', 'ice cream', 'chocolate', 'apple', 'banana',
        'orange', 'strawberry', 'watermelon', 'grapes', 'mango', 'pineapple',
        'sandwich', 'hot dog', 'french fries', 'nachos', 'lasagna', 'risotto',
        'ramen', 'pho', 'pad thai', 'fried rice', 'dumplings', 'spring rolls',
        'burrito', 'quesadilla', 'falafel', 'hummus', 'kebab', 'gyro'
      ]
    },
    {
      name: 'Sports',
      validItems: [
        'soccer', 'football', 'basketball', 'baseball', 'tennis', 'golf',
        'hockey', 'swimming', 'boxing', 'wrestling', 'volleyball', 'rugby',
        'cricket', 'skiing', 'snowboarding', 'surfing', 'skateboarding',
        'cycling', 'running', 'gymnastics', 'figure skating', 'diving',
        'badminton', 'table tennis', 'bowling', 'archery', 'fencing',
        'martial arts', 'karate', 'judo', 'taekwondo', 'mma', 'rowing',
        'sailing', 'rock climbing', 'triathlon', 'marathon', 'polo'
      ]
    },
    {
      name: 'Fruits',
      validItems: [
        'apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon',
        'mango', 'pineapple', 'peach', 'pear', 'cherry', 'blueberry',
        'raspberry', 'blackberry', 'kiwi', 'papaya', 'coconut', 'lemon',
        'lime', 'grapefruit', 'pomegranate', 'fig', 'date', 'plum',
        'apricot', 'nectarine', 'cantaloupe', 'honeydew', 'passion fruit',
        'dragon fruit', 'lychee', 'guava', 'persimmon', 'tangerine'
      ]
    },
    {
      name: 'Colors',
      validItems: [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
        'brown', 'black', 'white', 'gray', 'grey', 'gold', 'silver',
        'bronze', 'turquoise', 'teal', 'navy', 'maroon', 'burgundy',
        'coral', 'salmon', 'peach', 'lavender', 'violet', 'indigo',
        'cyan', 'magenta', 'beige', 'tan', 'cream', 'ivory', 'olive',
        'lime', 'mint', 'aqua', 'crimson', 'scarlet', 'rose'
      ]
    },
    {
      name: 'Musical Instruments',
      validItems: [
        'guitar', 'piano', 'drums', 'violin', 'trumpet', 'flute', 'saxophone',
        'clarinet', 'cello', 'bass', 'harp', 'trombone', 'oboe', 'harmonica',
        'accordion', 'banjo', 'ukulele', 'mandolin', 'xylophone', 'marimba',
        'timpani', 'bongo', 'tambourine', 'keyboard', 'synthesizer', 'organ',
        'bagpipes', 'tuba', 'french horn', 'bassoon', 'piccolo', 'viola'
      ]
    }
  ];

  getRandomCategory(): string {
    const index = Math.floor(Math.random() * this.categories.length);
    return this.categories[index].name;
  }

  validateItem(
    categoryName: string,
    item: string,
    usedItems: string[]
  ): boolean {
    const category = this.categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (!category) return false;

    const normalizedItem = item.toLowerCase().trim();

    // Check if empty or too short
    if (normalizedItem.length < 2) {
      return false;
    }

    // Normalize used items for comparison
    const usedNormalized = usedItems.map((u) => u.toLowerCase().trim());

    // Check for exact duplicate first
    if (usedNormalized.includes(normalizedItem)) {
      return false;
    }

    // Fuzzy match against valid items
    const categoryFuse = new Fuse(category.validItems, {
      threshold: 0.3,
      distance: 100,
      includeScore: true
    });

    const results = categoryFuse.search(normalizedItem);
    if (results.length === 0) {
      return false;
    }

    // Get the best match
    const bestMatch = results[0].item;

    // Check if the best match hasn't been used (fuzzy check)
    const usedFuse = new Fuse(usedNormalized, {
      threshold: 0.3,
      distance: 100
    });

    const usedCheck = usedFuse.search(bestMatch);
    if (usedCheck.length > 0) {
      return false; // This item (or very similar) was already used
    }

    return true;
  }

  getAllCategories(): string[] {
    return this.categories.map((c) => c.name);
  }
}
