/**
 * The daily quote: one per IST day, from this local list, so it never fails or slows the page.
 * Only real, well-documented quotes, credited to the person who said or wrote them. Where wording
 * depends on a translation, `source` names it. Popular misattributions are deliberately left out
 * (the "excellence is a habit" line is Will Durant's summary of Aristotle, and is credited to him).
 *
 * The three themes are interleaved so consecutive days rotate theme, and day N shows item
 * N mod length, so nothing repeats until the whole list has been shown.
 * Safe to import from client components.
 */
import { daysBetween } from "./dates";

export const THEMES = ["philosophy", "discipline", "character"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  philosophy: "Philosophy",
  discipline: "Discipline",
  character: "Character & confidence",
};

export interface Quote {
  text: string;
  author: string;
  source?: string;
  theme: Theme;
}

type Entry = [text: string, author: string, source?: string];

const PHILOSOPHY: Entry[] = [
  ["The impediment to action advances action. What stands in the way becomes the way.", "Marcus Aurelius", "Meditations 5.20, tr. Gregory Hays"],
  ["Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.", "Marcus Aurelius", "Meditations 5.16, tr. George Long"],
  ["Look within. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.", "Marcus Aurelius", "Meditations 7.59, tr. George Long"],
  ["Confine thyself to the present.", "Marcus Aurelius", "Meditations 7.29, tr. George Long"],
  ["Loss is nothing else than change.", "Marcus Aurelius", "Meditations 9.35, tr. George Long"],
  ["Very little indeed is necessary for living a happy life.", "Marcus Aurelius", "Meditations 7.67, tr. George Long"],
  ["The universe is transformation: life is opinion.", "Marcus Aurelius", "Meditations 4.3, tr. George Long"],
  ["The best way of avenging thyself is not to become like the wrong-doer.", "Marcus Aurelius", "Meditations 6.6, tr. George Long"],
  ["We suffer more often in imagination than in reality.", "Seneca", "Letters to Lucilius 13, tr. Richard M. Gummere"],
  ["It is not that we have a short time to live, but that we waste a lot of it.", "Seneca", "On the Shortness of Life 1"],
  ["If a man does not know to which port he is sailing, no wind is favourable.", "Seneca", "Letters to Lucilius 71"],
  ["As long as you live, keep learning how to live.", "Seneca", "Letters to Lucilius 76"],
  ["No man was ever wise by chance.", "Seneca", "Letters to Lucilius 76"],
  ["Begin at once to live, and count each separate day as a separate life.", "Seneca", "Letters to Lucilius 101, tr. Richard M. Gummere"],
  ["Until we have begun to go without them, we fail to realise how unnecessary many things are.", "Seneca", "Letters to Lucilius 123"],
  ["Men are disturbed not by things, but by the principles and notions which they form concerning things.", "Epictetus", "Enchiridion 5, tr. Thomas W. Higginson"],
  ["Some things are in our control and others not.", "Epictetus", "Enchiridion 1, tr. Thomas W. Higginson"],
  ["Only the educated are free.", "Epictetus", "Discourses 2.1"],
  ["It is impossible for a man to begin to learn that which he thinks that he knows.", "Epictetus", "Discourses 2.17"],
  ["When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it; this is knowledge.", "Confucius", "Analects 2.17, tr. James Legge"],
  ["Learning without thought is labour lost; thought without learning is perilous.", "Confucius", "Analects 2.15, tr. James Legge"],
  ["What you do not want done to yourself, do not do to others.", "Confucius", "Analects 15.23, tr. James Legge"],
  ["The superior man is satisfied and composed; the mean man is always full of distress.", "Confucius", "Analects 7.36, tr. James Legge"],
  ["The superior man thinks of virtue; the small man thinks of comfort.", "Confucius", "Analects 4.11, tr. James Legge"],
  ["He who knows other men is discerning; he who knows himself is intelligent.", "Lao Tzu", "Tao Te Ching 33, tr. James Legge"],
  ["He who is satisfied with his lot is rich.", "Lao Tzu", "Tao Te Ching 33, tr. James Legge"],
  ["Those who know do not speak; those who speak do not know.", "Lao Tzu", "Tao Te Ching 56"],
  ["He who knows that enough is enough will always have enough.", "Lao Tzu", "Tao Te Ching 46"],
  ["Mind precedes all mental states. Mind is their chief; they are all mind-wrought.", "The Dhammapada", "Verse 1, tr. Acharya Buddharakkhita"],
  ["Better is one's own duty, though imperfectly done, than the duty of another well performed.", "The Bhagavad Gita", "3.35"],
  ["You cannot step into the same river twice.", "Heraclitus", "as reported by Plato, Cratylus 402a"],
  ["The unexamined life is not worth living.", "Socrates", "Plato, Apology 38a"],
  ["All the unhappiness of men arises from one single fact, that they cannot stay quietly in their own chamber.", "Blaise Pascal", "Pensées 139, tr. W. F. Trotter"],
  ["Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances, to choose one's own way.", "Viktor E. Frankl", "Man's Search for Meaning"],
  ["We are what our thoughts have made us; so take care about what you think.", "Swami Vivekananda"],
  ["They alone live who live for others.", "Swami Vivekananda"],
  ["The important thing is not to stop questioning.", "Albert Einstein", "LIFE magazine, 1955"],
  ["Imagination is more important than knowledge.", "Albert Einstein", "The Saturday Evening Post, 1929"],
  ["The first principle is that you must not fool yourself — and you are the easiest person to fool.", "Richard Feynman", "Cargo Cult Science, 1974"],
  ["What I cannot create, I do not understand.", "Richard Feynman", "on his blackboard, 1988"],
  ["Our life is frittered away by detail. Simplify, simplify.", "Henry David Thoreau", "Walden"],
  ["Tell me, what is it you plan to do with your one wild and precious life?", "Mary Oliver", "The Summer Day"],
  ["Life is short, and art long.", "Hippocrates", "Aphorisms 1.1"],
  ["If you shed tears when you miss the sun, you also miss the stars.", "Rabindranath Tagore", "Stray Birds"],
  ["Faith is the bird that feels the light and sings when the dawn is still dark.", "Rabindranath Tagore", "Fireflies"],
  ["Lives of great men all remind us we can make our lives sublime.", "Henry Wadsworth Longfellow", "A Psalm of Life"],
  ["If I have seen further it is by standing on the shoulders of Giants.", "Isaac Newton", "letter to Robert Hooke, 1675"],
  ["Blessed is he who has found his work; let him ask no other blessedness.", "Thomas Carlyle", "Past and Present"],
  ["We have two ears and one mouth, so that we may listen more and talk less.", "Zeno of Citium", "Diogenes Laërtius, Lives 7.23"],
  ["The best is the enemy of the good.", "Voltaire", "La Bégueule, 1772"],
];

const DISCIPLINE: Entry[] = [
  ["At dawn, when you have trouble getting out of bed, tell yourself: “I have to go to work — as a human being.”", "Marcus Aurelius", "Meditations 5.1, tr. Gregory Hays"],
  ["Do every act of thy life as if it were the last.", "Marcus Aurelius", "Meditations 2.5, tr. George Long"],
  ["While we are postponing, life speeds by.", "Seneca", "Letters to Lucilius 1"],
  ["Hold every hour in your grasp.", "Seneca", "Letters to Lucilius 1, tr. Richard M. Gummere"],
  ["Nothing, Lucilius, is ours, except time.", "Seneca", "Letters to Lucilius 1, tr. Richard M. Gummere"],
  ["First say to yourself what you would be; and then do what you have to do.", "Epictetus", "Discourses 3.23"],
  ["No great thing is created suddenly, any more than a bunch of grapes or a fig.", "Epictetus", "Discourses 1.15"],
  ["I am not concerned that I have no place; I am concerned how I may fit myself for one.", "Confucius", "Analects 4.14, tr. James Legge"],
  ["At fifteen, I had my mind bent on learning.", "Confucius", "Analects 2.4, tr. James Legge"],
  ["A journey of a thousand miles begins with a single step.", "Lao Tzu", "Tao Te Ching 64"],
  ["The tree which fills the arms grew from the tiniest sprout.", "Lao Tzu", "Tao Te Ching 64, tr. James Legge"],
  ["Anticipate the difficult while it is easy; do great things while they are small.", "Lao Tzu", "Tao Te Ching 63"],
  ["Drop by drop is the water pot filled. Likewise, the wise man, gathering it little by little, fills himself with good.", "The Dhammapada", "Verse 122, tr. Acharya Buddharakkhita"],
  ["You have a right to your actions, but never to the fruits of your actions.", "The Bhagavad Gita", "2.47"],
  ["The beginning is the most important part of the work.", "Plato", "Republic 377a"],
  ["We become just by doing just acts, temperate by doing temperate acts, brave by doing brave acts.", "Aristotle", "Nicomachean Ethics 2.1"],
  ["The beginning seems to be more than half of the whole.", "Aristotle", "Nicomachean Ethics 1.7"],
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Will Durant", "The Story of Philosophy, summarising Aristotle"],
  ["What you would do tomorrow, do today; what you would do today, do now.", "Kabir"],
  ["Arise, awake, and stop not till the goal is reached.", "Swami Vivekananda"],
  ["Take up one idea. Make that one idea your life — think of it, dream of it, live on that idea.", "Swami Vivekananda", "Raja Yoga"],
  ["The world is the great gymnasium where we come to make ourselves strong.", "Swami Vivekananda"],
  ["Genius is one per cent inspiration and ninety-nine per cent perspiration.", "Thomas Edison"],
  ["Inspiration is for amateurs — the rest of us just show up and get to work.", "Chuck Close"],
  ["You do not rise to the level of your goals. You fall to the level of your systems.", "James Clear", "Atomic Habits"],
  ["Every action you take is a vote for the type of person you wish to become.", "James Clear", "Atomic Habits"],
  ["Habits are the compound interest of self-improvement.", "James Clear", "Atomic Habits"],
  ["Time is the scarcest resource, and unless it is managed, nothing else can be managed.", "Peter F. Drucker", "The Effective Executive"],
  ["Efficiency is doing things right; effectiveness is doing the right things.", "Peter F. Drucker"],
  ["People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas that there are.", "Steve Jobs", "Apple Worldwide Developers Conference, 1997"],
  ["Real artists ship.", "Steve Jobs", "1983"],
  ["The only way to do great work is to love what you do.", "Steve Jobs", "Stanford commencement address, 2005"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds", "Linux kernel mailing list, 2000"],
  ["Plans are worthless, but planning is everything.", "Dwight D. Eisenhower", "1957"],
  ["What is important is seldom urgent and what is urgent is seldom important.", "Dwight D. Eisenhower", "1954"],
  ["Patience and diligence, like faith, remove mountains.", "William Penn", "Some Fruits of Solitude"],
  ["Concentration is the secret of strength.", "Ralph Waldo Emerson", "The Conduct of Life"],
  ["The reward of a thing well done, is to have done it.", "Ralph Waldo Emerson", "New England Reformers"],
  ["Do the thing, and you shall have the power.", "Ralph Waldo Emerson", "Compensation"],
  ["Nothing great was ever achieved without enthusiasm.", "Ralph Waldo Emerson", "Circles"],
  ["Knowing is not enough; we must apply. Willing is not enough; we must do.", "Johann Wolfgang von Goethe", "Wilhelm Meister's Journeyman Years"],
  ["How we spend our days is, of course, how we spend our lives.", "Annie Dillard", "The Writing Life"],
  ["Seize the day, trusting as little as possible in tomorrow.", "Horace", "Odes 1.11"],
  ["He who has begun has half done. Dare to be wise; begin!", "Horace", "Epistles 1.2"],
  ["Dripping water hollows out a stone.", "Ovid", "Epistulae ex Ponto"],
  ["Practice is the best of all instructors.", "Publilius Syrus", "Sententiae"],
  ["Slow but steady wins the race.", "Aesop", "The Tortoise and the Hare"],
  ["Great works are performed not by strength but by perseverance.", "Samuel Johnson", "Rasselas"],
  ["Our main business is not to see what lies dimly at a distance, but to do what lies clearly at hand.", "Thomas Carlyle", "Signs of the Times, 1829"],
  ["It is not enough to be busy; so are the ants. The question is: what are we busy about?", "Henry David Thoreau", "letter to H. G. O. Blake, 1857"],
  ["Well done is better than well said.", "Benjamin Franklin", "Poor Richard's Almanack, 1737"],
  ["Lost time is never found again.", "Benjamin Franklin", "Poor Richard's Almanack, 1748"],
  ["Little strokes fell great oaks.", "Benjamin Franklin", "Poor Richard's Almanack, 1750"],
  ["Diligence is the mother of good luck.", "Benjamin Franklin", "Poor Richard's Almanack, 1736"],
  ["Dost thou love life? Then do not squander time, for that's the stuff life is made of.", "Benjamin Franklin", "Poor Richard's Almanack, 1746"],
  ["Early to bed and early to rise, makes a man healthy, wealthy, and wise.", "Benjamin Franklin", "Poor Richard's Almanack, 1735"],
  ["Never give in, never give in, never, never, never, never — in nothing, great or small, large or petty — never give in except to convictions of honour and good sense.", "Winston Churchill", "Harrow School, 1941"],
  ["If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.", "Martin Luther King Jr.", "1967"],
  ["Great things are not done by impulse, but by a series of small things brought together.", "Vincent van Gogh", "letter to Theo van Gogh, 1882"],
  ["The best way out is always through.", "Robert Frost", "A Servant to Servants"],
];

const CHARACTER: Entry[] = [
  ["No longer talk at all about the kind of man that a good man ought to be, but be such.", "Marcus Aurelius", "Meditations 10.16, tr. George Long"],
  ["If it is not right, do not do it: if it is not true, do not say it.", "Marcus Aurelius", "Meditations 12.17, tr. George Long"],
  ["Never value anything as profitable to thyself which shall compel thee to break thy promise, to lose thy self-respect.", "Marcus Aurelius", "Meditations 3.7, tr. George Long"],
  ["Whatever any one does or says, I must be good.", "Marcus Aurelius", "Meditations 7.15, tr. George Long"],
  ["Associate with those who will make a better man of you.", "Seneca", "Letters to Lucilius 7, tr. Richard M. Gummere"],
  ["Wherever there is a human being, there is an opportunity for a kindness.", "Seneca", "On the Happy Life 24"],
  ["Most powerful is he who has himself in his own power.", "Seneca", "Letters to Lucilius 90"],
  ["Fire tests gold, suffering tests brave men.", "Seneca", "On Providence 5"],
  ["No man is free who is not master of himself.", "Epictetus", "Fragments"],
  ["If you wish to improve, be content to appear foolish and stupid with regard to external things.", "Epictetus", "Enchiridion 13, tr. Thomas W. Higginson"],
  ["Never call yourself a philosopher, nor talk a great deal among the unlearned about theorems, but act conformably to them.", "Epictetus", "Enchiridion 46, tr. Thomas W. Higginson"],
  ["It is difficulties that show what men are.", "Epictetus", "Discourses 1.24"],
  ["The superior man is modest in his speech, but exceeds in his actions.", "Confucius", "Analects 14.29, tr. James Legge"],
  ["When we see men of worth, we should think of equalling them; when we see men of a contrary character, we should turn inwards and examine ourselves.", "Confucius", "Analects 4.17, tr. James Legge"],
  ["To see what is right and not to do it is want of courage.", "Confucius", "Analects 2.24, tr. James Legge"],
  ["To have faults and not to reform them, this, indeed, should be pronounced having faults.", "Confucius", "Analects 15.29, tr. James Legge"],
  ["Fine words and an insinuating appearance are seldom associated with true virtue.", "Confucius", "Analects 1.3, tr. James Legge"],
  ["The commander of the forces of a large State may be carried off, but the will of even a common man cannot be taken from him.", "Confucius", "Analects 9.25, tr. James Legge"],
  ["He who overcomes others is strong; he who overcomes himself is mighty.", "Lao Tzu", "Tao Te Ching 33, tr. James Legge"],
  ["Though one may conquer a thousand times a thousand men in battle, yet he indeed is the noblest victor who conquers himself.", "The Dhammapada", "Verse 103, tr. Acharya Buddharakkhita"],
  ["Let a man lift himself by himself; let him not degrade himself; for he himself is his friend, and he himself is his enemy.", "The Bhagavad Gita", "6.5"],
  ["Character is destiny.", "Heraclitus", "Fragment 119"],
  ["If we have our own why in life, we shall get along with almost any how.", "Friedrich Nietzsche", "Twilight of the Idols, tr. Walter Kaufmann"],
  ["What does not destroy me, makes me stronger.", "Friedrich Nietzsche", "Twilight of the Idols, tr. Walter Kaufmann"],
  ["You cannot believe in God until you believe in yourself.", "Swami Vivekananda"],
  ["All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.", "Swami Vivekananda"],
  ["Strength is life, weakness is death.", "Swami Vivekananda"],
  ["Each work has to pass through these stages — ridicule, opposition, and then acceptance.", "Swami Vivekananda"],
  ["Stand up, be bold, be strong. Take the whole responsibility on your own shoulders, and know that you are the creator of your own destiny.", "Swami Vivekananda"],
  ["This above all: to thine own self be true.", "William Shakespeare", "Hamlet"],
  ["Our doubts are traitors, and make us lose the good we oft might win, by fearing to attempt.", "William Shakespeare", "Measure for Measure"],
  ["Some are born great, some achieve greatness, and some have greatness thrust upon 'em.", "William Shakespeare", "Twelfth Night"],
  ["The fault, dear Brutus, is not in our stars, but in ourselves, that we are underlings.", "William Shakespeare", "Julius Caesar"],
  ["We know what we are, but know not what we may be.", "William Shakespeare", "Hamlet"],
  ["Trust thyself: every heart vibrates to that iron string.", "Ralph Waldo Emerson", "Self-Reliance"],
  ["Self-trust is the first secret of success.", "Ralph Waldo Emerson", "Success"],
  ["Don't say things. What you are stands over you the while, and thunders so that I cannot hear what you say to the contrary.", "Ralph Waldo Emerson", "Letters and Social Aims"],
  ["The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood.", "Theodore Roosevelt", "Citizenship in a Republic, 1910"],
  ["Do what you can, with what you have, where you are.", "Theodore Roosevelt", "An Autobiography, quoting Squire Bill Widener"],
  ["I learned that courage was not the absence of fear, but the triumph over it.", "Nelson Mandela", "Long Walk to Freedom"],
  ["After climbing a great hill, one only finds that there are many more hills to climb.", "Nelson Mandela", "Long Walk to Freedom"],
  ["Courage is the most important of all the virtues because without courage, you can't practice any other virtue consistently.", "Maya Angelou"],
  ["You must do the thing you think you cannot do.", "Eleanor Roosevelt", "You Learn by Living"],
  ["Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves.", "Marie Curie", "quoted by Eve Curie, Madame Curie"],
  ["I'm not afraid of storms, for I'm learning how to sail my ship.", "Louisa May Alcott", "Little Women"],
  ["Character — the willingness to accept responsibility for one's own life — is the source from which self-respect springs.", "Joan Didion", "On Self-Respect"],
  ["Let me not pray to be sheltered from dangers but to be fearless in facing them.", "Rabindranath Tagore", "Fruit-Gathering"],
  ["Strength does not come from physical capacity. It comes from an indomitable will.", "Mahatma Gandhi", "Young India, 1920"],
  ["Educate, agitate, organise.", "B. R. Ambedkar"],
  ["If one advances confidently in the direction of his dreams, and endeavors to live the life which he has imagined, he will meet with a success unexpected in common hours.", "Henry David Thoreau", "Walden"],
  ["The time is always right to do what is right.", "Martin Luther King Jr.", "Oberlin College, 1964"],
  ["If you hear a voice within you say “you cannot paint,” then by all means paint, and that voice will be silenced.", "Vincent van Gogh", "letter to Theo van Gogh, 1883"],
  ["I can accept failure, everyone fails at something. But I can't accept not trying.", "Michael Jordan", "I Can't Accept Not Trying, 1994"],
  ["I've failed over and over and over again in my life. And that is why I succeed.", "Michael Jordan", "Nike advertisement, 1997"],
  ["They can because they think they can.", "Virgil", "Aeneid 5.231"],
  ["Your time is limited, so don't waste it living someone else's life.", "Steve Jobs", "Stanford commencement address, 2005"],
];

function toQuotes(entries: Entry[], theme: Theme): Quote[] {
  return entries.map(([text, author, source]) => ({ text, author, theme, ...(source ? { source } : {}) }));
}

/** Round-robin across themes, so consecutive days rotate theme until a theme runs out. */
function interleave(lists: Quote[][]) {
  const sequence: Quote[] = [];
  for (let index = 0; sequence.length < lists.reduce((total, list) => total + list.length, 0); index += 1) {
    for (const list of lists) if (index < list.length) sequence.push(list[index]);
  }
  return sequence;
}

export const QUOTES: readonly Quote[] = interleave([
  toQuotes(PHILOSOPHY, "philosophy"),
  toQuotes(DISCIPLINE, "discipline"),
  toQuotes(CHARACTER, "character"),
]);

/** Position in the list for an IST date (YYYY-MM-DD), `offset` days along. */
export function quoteIndex(date: string, offset = 0) {
  const day = daysBetween("1970-01-01", date) + offset;
  return ((day % QUOTES.length) + QUOTES.length) % QUOTES.length;
}

export function quoteFor(date: string, offset = 0) {
  return QUOTES[quoteIndex(date, offset)];
}
