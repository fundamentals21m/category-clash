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
    },
    {
      name: 'TV Shows',
      validItems: [
        'friends', 'the office', 'breaking bad', 'game of thrones', 'stranger things',
        'the simpsons', 'seinfeld', 'the sopranos', 'lost', 'the walking dead',
        'how i met your mother', 'big bang theory', 'greys anatomy', 'house',
        'dexter', 'mad men', 'the wire', 'arrested development', 'parks and recreation',
        'brooklyn nine nine', 'the crown', 'black mirror', 'narcos', 'ozark',
        'better call saul', 'succession', 'the mandalorian', 'wednesday', 'squid game',
        'money heist', 'peaky blinders', 'sherlock', 'downton abbey', 'the witcher'
      ]
    },
    {
      name: 'Video Games',
      validItems: [
        'minecraft', 'fortnite', 'grand theft auto', 'call of duty', 'mario',
        'zelda', 'pokemon', 'tetris', 'pac-man', 'sonic', 'halo', 'god of war',
        'the last of us', 'red dead redemption', 'skyrim', 'dark souls', 'elden ring',
        'overwatch', 'league of legends', 'world of warcraft', 'counter-strike',
        'animal crossing', 'final fantasy', 'resident evil', 'metal gear solid',
        'assassins creed', 'bioshock', 'portal', 'half-life', 'doom', 'fallout',
        'mass effect', 'uncharted', 'horizon zero dawn', 'ghost of tsushima'
      ]
    },
    {
      name: 'Brands',
      validItems: [
        'apple', 'google', 'amazon', 'microsoft', 'nike', 'adidas', 'coca-cola',
        'pepsi', 'mcdonalds', 'starbucks', 'disney', 'netflix', 'tesla', 'samsung',
        'sony', 'toyota', 'honda', 'ford', 'bmw', 'mercedes', 'gucci', 'louis vuitton',
        'chanel', 'rolex', 'ikea', 'walmart', 'target', 'costco', 'spotify', 'uber',
        'airbnb', 'facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'linkedin',
        'paypal', 'visa', 'mastercard', 'lego', 'nintendo', 'playstation', 'xbox'
      ]
    },
    {
      name: 'Celebrities',
      validItems: [
        'taylor swift', 'beyonce', 'drake', 'kanye west', 'rihanna', 'ed sheeran',
        'ariana grande', 'justin bieber', 'lady gaga', 'bruno mars', 'adele',
        'tom hanks', 'leonardo dicaprio', 'brad pitt', 'angelina jolie', 'jennifer aniston',
        'dwayne johnson', 'will smith', 'tom cruise', 'johnny depp', 'robert downey jr',
        'scarlett johansson', 'jennifer lawrence', 'emma watson', 'margot robbie',
        'chris hemsworth', 'chris evans', 'ryan reynolds', 'keanu reeves', 'morgan freeman',
        'oprah winfrey', 'ellen degeneres', 'kim kardashian', 'elon musk', 'jeff bezos'
      ]
    },
    {
      name: 'Cities',
      validItems: [
        'new york', 'los angeles', 'chicago', 'houston', 'miami', 'san francisco',
        'seattle', 'boston', 'las vegas', 'denver', 'london', 'paris', 'tokyo',
        'berlin', 'rome', 'madrid', 'barcelona', 'amsterdam', 'sydney', 'melbourne',
        'toronto', 'vancouver', 'dubai', 'singapore', 'hong kong', 'beijing',
        'shanghai', 'seoul', 'bangkok', 'mumbai', 'cairo', 'cape town', 'moscow',
        'rio de janeiro', 'buenos aires', 'mexico city', 'lima', 'bogota'
      ]
    },
    {
      name: 'Occupations',
      validItems: [
        'doctor', 'nurse', 'teacher', 'lawyer', 'engineer', 'scientist', 'programmer',
        'chef', 'pilot', 'firefighter', 'police officer', 'dentist', 'pharmacist',
        'architect', 'accountant', 'journalist', 'photographer', 'artist', 'musician',
        'actor', 'director', 'writer', 'plumber', 'electrician', 'mechanic', 'carpenter',
        'farmer', 'veterinarian', 'psychologist', 'therapist', 'surgeon', 'paramedic',
        'librarian', 'banker', 'waiter', 'barista', 'bartender', 'athlete', 'coach'
      ]
    },
    {
      name: 'Vehicles',
      validItems: [
        'car', 'truck', 'motorcycle', 'bicycle', 'bus', 'train', 'airplane', 'helicopter',
        'boat', 'ship', 'yacht', 'submarine', 'rocket', 'spaceship', 'ambulance',
        'fire truck', 'police car', 'taxi', 'limousine', 'van', 'suv', 'jeep',
        'scooter', 'skateboard', 'segway', 'tractor', 'bulldozer', 'crane', 'forklift',
        'jet ski', 'kayak', 'canoe', 'sailboat', 'ferry', 'cruise ship', 'hot air balloon'
      ]
    },
    {
      name: 'Drinks',
      validItems: [
        'water', 'coffee', 'tea', 'juice', 'soda', 'milk', 'beer', 'wine', 'whiskey',
        'vodka', 'rum', 'tequila', 'gin', 'champagne', 'cocktail', 'smoothie',
        'milkshake', 'lemonade', 'iced tea', 'hot chocolate', 'espresso', 'latte',
        'cappuccino', 'mocha', 'energy drink', 'sports drink', 'coconut water',
        'apple juice', 'orange juice', 'grape juice', 'tomato juice', 'kombucha',
        'protein shake', 'bubble tea', 'margarita', 'mojito', 'sangria', 'cider'
      ]
    },
    {
      name: 'Desserts',
      validItems: [
        'cake', 'pie', 'cookie', 'brownie', 'cupcake', 'donut', 'muffin', 'cheesecake',
        'ice cream', 'gelato', 'sorbet', 'pudding', 'mousse', 'tiramisu', 'creme brulee',
        'eclair', 'macaron', 'croissant', 'waffle', 'crepe', 'churro', 'flan',
        'panna cotta', 'baklava', 'cannoli', 'tart', 'truffle', 'sundae', 'parfait',
        'cobbler', 'strudel', 'biscotti', 'meringue', 'souffle', 'profiterole'
      ]
    },
    {
      name: 'Body Parts',
      validItems: [
        'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'tongue', 'teeth', 'lip',
        'chin', 'cheek', 'forehead', 'eyebrow', 'eyelash', 'neck', 'shoulder',
        'arm', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'nail', 'chest',
        'stomach', 'back', 'hip', 'leg', 'thigh', 'knee', 'ankle', 'foot', 'toe',
        'heel', 'brain', 'heart', 'lung', 'liver', 'kidney', 'bone', 'muscle', 'skin'
      ]
    },
    {
      name: 'School Subjects',
      validItems: [
        'math', 'english', 'science', 'history', 'geography', 'biology', 'chemistry',
        'physics', 'algebra', 'geometry', 'calculus', 'literature', 'writing',
        'reading', 'art', 'music', 'drama', 'theater', 'dance', 'physical education',
        'health', 'computer science', 'programming', 'economics', 'psychology',
        'sociology', 'philosophy', 'foreign language', 'spanish', 'french', 'german',
        'chinese', 'japanese', 'latin', 'astronomy', 'environmental science'
      ]
    },
    {
      name: 'Superheroes',
      validItems: [
        'superman', 'batman', 'spider-man', 'wonder woman', 'iron man', 'captain america',
        'thor', 'hulk', 'black widow', 'hawkeye', 'aquaman', 'the flash', 'green lantern',
        'black panther', 'doctor strange', 'ant-man', 'scarlet witch', 'vision',
        'wolverine', 'deadpool', 'cyclops', 'jean grey', 'storm', 'magneto',
        'professor x', 'daredevil', 'punisher', 'green arrow', 'supergirl', 'batgirl',
        'robin', 'nightwing', 'shazam', 'captain marvel', 'gambit', 'rogue'
      ]
    },
    {
      name: 'Cartoon Characters',
      validItems: [
        'mickey mouse', 'bugs bunny', 'spongebob', 'homer simpson', 'peter griffin',
        'scooby doo', 'tom and jerry', 'tweety', 'road runner', 'wile e coyote',
        'daffy duck', 'porky pig', 'elmer fudd', 'popeye', 'woody woodpecker',
        'pink panther', 'fred flintstone', 'george jetson', 'johnny bravo',
        'dexter', 'powerpuff girls', 'courage the cowardly dog', 'ed edd n eddy',
        'fairly oddparents', 'jimmy neutron', 'danny phantom', 'avatar aang',
        'finn and jake', 'gumball', 'steven universe', 'rick and morty', 'archer'
      ]
    },
    {
      name: 'Flowers',
      validItems: [
        'rose', 'tulip', 'daisy', 'sunflower', 'lily', 'orchid', 'carnation',
        'daffodil', 'iris', 'peony', 'chrysanthemum', 'hydrangea', 'lavender',
        'jasmine', 'magnolia', 'hibiscus', 'marigold', 'poppy', 'violet', 'pansy',
        'dahlia', 'gardenia', 'camellia', 'azalea', 'begonia', 'geranium', 'petunia',
        'snapdragon', 'zinnia', 'aster', 'bluebell', 'buttercup', 'dandelion'
      ]
    },
    {
      name: 'Dog Breeds',
      validItems: [
        'labrador', 'golden retriever', 'german shepherd', 'bulldog', 'poodle',
        'beagle', 'rottweiler', 'husky', 'boxer', 'dachshund', 'corgi', 'dalmatian',
        'chihuahua', 'shih tzu', 'pug', 'yorkie', 'great dane', 'doberman',
        'australian shepherd', 'border collie', 'cocker spaniel', 'pitbull',
        'maltese', 'boston terrier', 'french bulldog', 'english bulldog',
        'saint bernard', 'bernese mountain dog', 'akita', 'shiba inu', 'chow chow',
        'pomeranian', 'samoyed', 'mastiff', 'greyhound', 'whippet', 'basset hound'
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

  getValidItemsForCategory(categoryName: string): string[] | null {
    const category = this.categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category ? category.validItems : null;
  }
}
