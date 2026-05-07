/**
 * DYNAMIC QUESTION GENERATION
 * 
 * Logic:
 * - Finder writes a free description
 * - We read what they mentioned
 * - We ask the OWNER open questions on those topics
 * - Owner proves they know by answering correctly
 * - We NEVER ask "where exactly" about something the finder didn't specify
 */

function generateVerificationQuestions({ name, category, description, location }) {
  const desc = description.trim();
  const descLow = desc.toLowerCase();
  const questions = [];
  const usedTopics = new Set();

  // ── Extract what the finder mentioned ──────────────────────────

  const COLOURS = ['red','blue','green','black','white','yellow','pink',
    'purple','orange','brown','grey','gray','silver','gold','maroon','navy',
    'cyan','beige','cream','violet','teal','dark','light','bright','neon',
    'transparent','clear','multicolour','multicolor','colorful','colourful'];
  const foundColours = COLOURS.filter(c => descLow.includes(c));

  const BRANDS = ['apple','samsung','dell','hp','lenovo','asus','acer','sony',
    'nike','adidas','puma','reebok','wildcraft','skybags','american tourister',
    'jbl','boat','realme','oneplus','xiaomi','motorola','oppo','vivo','redmi',
    'poco','titan','fastrack','fossil','casio','canon','nikon','cambridge',
    'oxford','classmate','natraj','parker','pilot','reynolds','cello','zara',
    'levis','wrangler','pepe','woodland','bata','liberty','red tape'];
  const foundBrands = BRANDS.filter(b => descLow.includes(b));

  const DAMAGE_WORDS = ['scratch','scratched','crack','cracked','broken','torn',
    'dent','dented','worn','faded','damaged','chip','chipped','hole','stain',
    'stained','burn','burnt','scuff','scuffed','peeling','bent','rusted'];
  const foundDamage = DAMAGE_WORDS.filter(d => descLow.includes(d));

  const STICKER_WORDS = ['sticker','stickers','cartoon','character','anime',
    'printed','print','design','drawing','doodle','painted','logo','symbol',
    'image','photo','picture','pattern'];
  const foundStickers = STICKER_WORDS.filter(s => descLow.includes(s));

  // Extract actual sticker names — any capitalized words near sticker words
  const stickerNames = [];
  const stickerNameMatch = desc.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:sticker|print|cartoon|character|design|logo)/g);
  if (stickerNameMatch) stickerNames.push(...stickerNameMatch);

  const ACCESSORY_WORDS = ['case','cover','pouch','sleeve','strap','chain',
    'tag','badge','keychain','charm','handle','wallet case','back cover',
    'carry case','bag','cover','protector'];
  const foundAccessories = ACCESSORY_WORDS.filter(a => descLow.includes(a));

  const CONTENT_WORDS = ['book','books','laptop','charger','cable','bottle',
    'wallet','purse','phone','mobile','keys','pen','pencil','notebook','file',
    'folder','documents','papers','clothes','shirt','uniform','card','money',
    'cash','earphones','headphones','watch','glasses','spectacles','medicines',
    'tablet','ipad','powerbank','mouse','keyboard','calculator'];
  const foundContents = CONTENT_WORDS.filter(c => descLow.includes(c));

  const MATERIAL_WORDS = ['leather','plastic','metal','fabric','cotton','silk',
    'wool','denim','rubber','glass','wood','steel','aluminum','nylon',
    'polyester','canvas','jute','velvet','suede','vinyl'];
  const foundMaterials = MATERIAL_WORDS.filter(m => descLow.includes(m));

  const SIZE_WORDS = ['small','medium','large','xl','xxl','mini','big','tiny',
    'compact','thin','thick','slim','wide','heavy','light'];
  const foundSizes = SIZE_WORDS.filter(s => descLow.includes(s));

  const numbers = desc.match(/\b\d+\b/g) || [];

  // ── Build 5 questions from what finder actually mentioned ──────

  // Q1 — Colour (if finder mentioned colour)
  if (foundColours.length > 0 && !usedTopics.has('colour')) {
    usedTopics.add('colour');
    if (foundBrands.length > 0) {
      questions.push(
        `What is the colour of your ${name} and what brand is it?`
      );
      usedTopics.add('brand');
    } else {
      questions.push(
        `What is the colour of your ${name}? Describe all colours on it.`
      );
    }
  }

  // Q1 fallback — Brand (if finder mentioned brand but no colour)
  if (questions.length === 0 && foundBrands.length > 0 && !usedTopics.has('brand')) {
    usedTopics.add('brand');
    questions.push(
      `What is the brand of your ${name}? Is there a model name or number on it?`
    );
  }

  // Q1 fallback — general appearance
  if (questions.length === 0) {
    questions.push(
      `Describe what your ${name} looks like — colour, size, overall appearance.`
    );
    usedTopics.add('colour');
  }

  // Q2 — Stickers / design (if finder mentioned them)
  if (foundStickers.length > 0 && !usedTopics.has('sticker')) {
    usedTopics.add('sticker');
    if (stickerNames.length > 0) {
      // Finder mentioned a specific character/name — ask owner to identify it
      questions.push(
        `Is there any sticker, print or design on your ${name}? If yes, describe it.`
      );
    } else {
      questions.push(
        `Does your ${name} have any stickers, prints or designs on it? Describe them.`
      );
    }
  }

  // Q2 fallback — Damage (if finder mentioned damage)
  if (questions.length < 2 && foundDamage.length > 0 && !usedTopics.has('damage')) {
    usedTopics.add('damage');
    questions.push(
      `Does your ${name} have any damage, scratches, cracks or marks on it? Describe them.`
    );
  }

  // Q2 fallback — Material
  if (questions.length < 2 && foundMaterials.length > 0 && !usedTopics.has('material')) {
    usedTopics.add('material');
    questions.push(
      `What is your ${name} made of? Describe the material and texture.`
    );
  }

  // Q2 fallback — general marks
  if (questions.length < 2) {
    usedTopics.add('damage');
    questions.push(
      `Does your ${name} have any scratches, damage, stickers or unique marks? Describe anything that makes it different from others.`
    );
  }

  // Q3 — Accessories / case / cover (if finder mentioned them)
  if (foundAccessories.length > 0 && !usedTopics.has('accessory')) {
    usedTopics.add('accessory');
    const acc = foundAccessories[0];
    questions.push(
      `Does your ${name} have a ${acc} or any cover with it? Describe it.`
    );
  }

  // Q3 fallback — Contents (for bags, boxes, wallets)
  if (questions.length < 3 && foundContents.length > 0 && !usedTopics.has('contents')) {
    usedTopics.add('contents');
    questions.push(
      `What items were in or with the ${name} when you lost it? List everything you remember.`
    );
  }

  // Q3 fallback — Size
  if (questions.length < 3 && foundSizes.length > 0 && !usedTopics.has('size')) {
    usedTopics.add('size');
    questions.push(
      `How big or small is your ${name}? Describe its size and shape.`
    );
  }

  // Q3 final fallback
  if (questions.length < 3) {
    usedTopics.add('size');
    questions.push(
      `How big is the ${name} and what shape is it? Does it have anything attached to it?`
    );
  }

  // Q4 — Category specific question
  if (!usedTopics.has('category')) {
    usedTopics.add('category');

    if (category === 'Electronics') {
      if (foundContents.length > 0 || descLow.includes('inside') || descLow.includes('contain')) {
        questions.push(
          `What data, files or apps are on your ${name}? What is the lock screen or password type on it?`
        );
      } else {
        questions.push(
          `What is on the screen of your ${name}? What type of lock screen does it have — pattern, PIN or fingerprint?`
        );
      }

    } else if (category === 'Bags') {
      if (foundContents.length > 0) {
        questions.push(
          `You mentioned some items were inside. List ALL the items in your ${name} — be as specific as possible.`
        );
      } else {
        questions.push(
          `What was inside your ${name} when you lost it? Name every item you remember.`
        );
      }

    } else if (category === 'ID/Cards') {
      questions.push(
        `What is the full name and ID number on the card? What institution issued it and when?`
      );

    } else if (category === 'Keys') {
      if (numbers.length > 0) {
        questions.push(
          `How many keys are on your keychain and what does each one open?`
        );
      } else {
        questions.push(
          `What does each key on your keychain open? Describe the keychain itself.`
        );
      }

    } else if (category === 'Books') {
      questions.push(
        `Is your name written inside the ${name}? What subject or topic is it about and what page were you last on?`
      );

    } else if (category === 'Jewellery') {
      if (foundMaterials.length > 0) {
        questions.push(
          `What is the ${name} made of and what does the design look like? Is there any special meaning or occasion behind it?`
        );
      } else {
        questions.push(
          `Describe the design of your ${name} — what is it made of and does it have any stones, engravings or special features?`
        );
      }

    } else if (category === 'Clothing') {
      questions.push(
        `What size is your ${name} and what were you wearing it with on the day you lost it?`
      );

    } else if (category === 'Sports') {
      questions.push(
        `What condition is your ${name} in? Is there anything written on it or any markings that identify it as yours?`
      );

    } else {
      // Other — pick an interesting detail from description
      if (descriptivePhrases(desc).length > 0) {
        const phrase = descriptivePhrases(desc)[0];
        questions.push(
          `You described your item as "${phrase}". Can you add more detail about what makes it unique?`
        );
      } else {
        questions.push(
          `What makes your ${name} different from any other similar item? Describe any personal touches or unique features.`
        );
      }
    }
  }

  // Q5 — Always about location and time
  // Use the actual location the finder mentioned
  questions.push(
    `Where exactly were you on campus just before you lost the ${name}? ` +
    `What were you doing and what time was it approximately?`
  );

  // Make sure we always return exactly 5
  while (questions.length < 5) {
    questions.push(
      `Is there anything else about the ${name} that only you as the owner would know? Describe it.`
    );
  }

  return questions.slice(0, 5);
}

// ── Helper — extract descriptive phrases from text ──────────────
function descriptivePhrases(desc) {
  return desc
    .split(/[.,;]/)
    .map(s => s.trim())
    .filter(s => s.split(' ').length >= 3 && s.length > 10);
}

// ── Evaluate answers fairly ─────────────────────────────────────
function evaluateClaimAnswers({ item, answers }) {
  let totalScore = 0;
  const flags = [];
  const goodPoints = [];

  // All meaningful words from the item details
  const stopWords = new Set(['the','and','for','are','was','with','this','that',
    'from','have','has','been','its','item','found','lost','near','also','very',
    'some','any','all','one','two','can','not','but','more','they','them',
    'their','there','here','when','what','where','which','who','how','been',
    'were','had','did','just','into','onto','upon','about','after','before']);

  const itemText = [item.name, item.description, item.location, item.category]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '');

  const itemKeyWords = itemText
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const itemWordSet = new Set(itemKeyWords);

  answers.forEach((a, i) => {
    const raw = a.answer.trim();
    const ans = raw.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const ansWords = ans.split(/\s+/).filter(w => w.length > 0);
    const wordCount = ansWords.length;
    let qScore = 0;

    // Empty
    if (wordCount < 2) {
      flags.push(`Q${i + 1}: No answer.`);
      return;
    }

    // Direct word matches with item description
    const directMatches = ansWords.filter(w => w.length > 2 && itemWordSet.has(w)).length;

    // Semantic colour match
    const colourScore = semanticColourMatch(ans, item.description.toLowerCase());

    // Semantic size match
    const sizeScore = semanticSizeMatch(ans, item.description.toLowerCase());

    // Base score from matches
    if (directMatches >= 5) { qScore = 22; goodPoints.push(`Q${i + 1}: Excellent match.`); }
    else if (directMatches >= 3) { qScore = 18; goodPoints.push(`Q${i + 1}: Good match.`); }
    else if (directMatches >= 1) { qScore = 13; }
    else if (colourScore > 0 || sizeScore > 0) { qScore = 10; goodPoints.push(`Q${i + 1}: Related details match.`); }
    else if (wordCount >= 10) { qScore = 7; }
    else { qScore = 3; }

    // Semantic bonuses
    qScore += colourScore * 3;
    qScore += sizeScore * 2;

    // Numbers bonus
    if (/\d/.test(ans)) qScore += 3;

    // Detail bonus
    if (wordCount >= 25) qScore += 5;
    else if (wordCount >= 15) qScore += 3;
    else if (wordCount >= 8) qScore += 1;

    // Vague penalty
    const vagueTerms = ["don't know","not sure","maybe","i think","idk",
      "can't remember","cant remember","forgot","i guess","probably",
      "not certain","unsure","approximately","something like"];
    const vagueFound = vagueTerms.filter(t => ans.includes(t));
    if (vagueFound.length > 0) {
      qScore -= vagueFound.length * 3;
      flags.push(`Q${i + 1}: Uncertain language.`);
    }

    // Too short penalty
    if (wordCount < 4) {
      qScore -= 5;
      flags.push(`Q${i + 1}: Too brief.`);
    }

    totalScore += Math.max(0, qScore);
  });

  // Normalise
  const maxPossible = answers.length * 30;
  let score = Math.round((totalScore / maxPossible) * 100);

  // Benefit of doubt — real owners often use different words
  score = Math.min(100, score + 10);
  score = Math.max(0, score);

  const passed = score >= 55;
  const flagged = flags.length >= 3;

  let reasoning = '';
  if (score >= 80) {
    reasoning = `Strong match. The claimant's answers closely match the item details provided by the finder. High confidence this is the true owner.`;
  } else if (score >= 65) {
    reasoning = `Good match. The claimant demonstrated good knowledge of the item. Minor differences but overall convincing. Admin review recommended before handover.`;
  } else if (score >= 55) {
    reasoning = `Moderate match. Some answers aligned with the item description. The claimant may be the owner — admin should verify in person.`;
  } else if (score >= 35) {
    reasoning = `Weak match. Answers were too vague or did not match item details well. Further verification needed.`;
  } else {
    reasoning = `Poor match. Answers did not demonstrate knowledge of the item. Unlikely to be the true owner without additional proof.`;
  }

  if (goodPoints.length > 0) {
    reasoning += ` Positives: ${goodPoints.slice(0, 2).join(', ')}.`;
  }
  if (flags.length > 0) {
    reasoning += ` Issues: ${flags.slice(0, 2).join(', ')}.`;
  }

  return { score, passed, reasoning, flagged };
}

// ── Semantic helpers ─────────────────────────────────────────────

function semanticColourMatch(answerText, descText) {
  let score = 0;
  const colourGroups = [
    ['black','dark','charcoal','ebony'],
    ['white','light','cream','ivory','pale'],
    ['blue','navy','cobalt','azure','indigo','teal'],
    ['red','maroon','crimson','scarlet','pink','rose'],
    ['green','olive','lime','emerald','mint'],
    ['grey','gray','silver','ash'],
    ['brown','tan','beige','caramel','chocolate','khaki'],
    ['yellow','gold','amber','mustard'],
    ['orange','peach','coral'],
    ['purple','violet','lavender','mauve'],
  ];
  colourGroups.forEach(group => {
    const inDesc = group.some(c => descText.includes(c));
    const inAns = group.some(c => answerText.includes(c));
    if (inDesc && inAns) score++;
  });
  return score;
}

function semanticSizeMatch(answerText, descText) {
  let score = 0;
  const sizeGroups = [
    ['small','tiny','mini','compact','little','petite'],
    ['large','big','huge','xl','bulky','spacious'],
    ['medium','mid','regular','standard','average'],
    ['thin','slim','narrow','flat'],
    ['thick','wide','broad','chunky'],
  ];
  sizeGroups.forEach(group => {
    const inDesc = group.some(s => descText.includes(s));
    const inAns = group.some(s => answerText.includes(s));
    if (inDesc && inAns) score++;
  });
  return score;
}

module.exports = { generateVerificationQuestions, evaluateClaimAnswers };