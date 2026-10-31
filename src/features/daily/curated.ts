/**
 * Curated quotes and jokes: the fallback when an API is down, slow, or returns something too long.
 * Quotes are well-documented and attributed to the person who said or wrote them; anything with a
 * disputed origin was left out. Jokes are about code, not people.
 * Order matters: one item per day, in order, so nothing repeats until the list cycles.
 */
import type { CuratedJoke, CuratedQuote } from "./types";

export const curatedQuotes: readonly CuratedQuote[] = [
  { text: "Make something people want.", author: "Paul Graham" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Excellence is a continuous process and not an accident.", author: "A. P. J. Abdul Kalam" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Learn to sell. Learn to build. If you can do both, you will be unstoppable.", author: "Naval Ravikant" },
  { text: "A ship in port is safe, but that's not what ships are built for.", author: "Grace Hopper" },
  { text: "Adding manpower to a late software project makes it later.", author: "Fred Brooks" },
  { text: "I don't believe in taking right decisions. I take decisions and then make them right.", author: "Ratan Tata" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Do things that don't scale.", author: "Paul Graham" },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  {
    text: "If you are not embarrassed by the first version of your product, you've launched too late.",
    author: "Reid Hoffman",
  },
  { text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", author: "A. P. J. Abdul Kalam" },
  { text: "Premature optimization is the root of all evil.", author: "Donald Knuth" },
  {
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
  },
  { text: "Play long-term games with long-term people.", author: "Naval Ravikant" },
  {
    text: "A complex system that works is invariably found to have evolved from a simple system that worked.",
    author: "John Gall",
  },
  { text: "Live in the future, then build what's missing.", author: "Paul Graham" },
  { text: "It's easier to ask forgiveness than it is to get permission.", author: "Grace Hopper" },
  {
    text: "Bad programmers worry about the code. Good programmers worry about data structures and their relationships.",
    author: "Linus Torvalds",
  },
  {
    text: "You can't connect the dots looking forward; you can only connect them looking backwards.",
    author: "Steve Jobs",
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  { text: "What I cannot create, I do not understand.", author: "Richard Feynman" },
  { text: "Seek wealth, not money or status.", author: "Naval Ravikant" },
  {
    text: "Program testing can be used to show the presence of bugs, but never to show their absence!",
    author: "Edsger W. Dijkstra",
  },
  { text: "We are stubborn on vision. We are flexible on details.", author: "Jeff Bezos" },
  { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  {
    text: "There are only two hard things in Computer Science: cache invalidation and naming things.",
    author: "Phil Karlton",
  },
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
  { text: "Plan to throw one away; you will, anyhow.", author: "Fred Brooks" },
  {
    text: "It's hard to do a really good job on anything you don't think about in the shower.",
    author: "Paul Graham",
  },
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { text: "When in doubt, use brute force.", author: "Ken Thompson" },
  {
    text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
    author: "Richard Feynman",
  },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  {
    text: "Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident.",
    author: "Rob Pike",
  },
  { text: "Real artists ship.", author: "Steve Jobs" },
  {
    text: "There is nothing so useless as doing efficiently that which should not be done at all.",
    author: "Peter Drucker",
  },
  {
    text: "There are only two kinds of languages: the ones people complain about and the ones nobody uses.",
    author: "Bjarne Stroustrup",
  },
  { text: "Code and media are permissionless leverage.", author: "Naval Ravikant" },
  {
    text: "If you don't work on important problems, it's not likely that you'll do important work.",
    author: "Richard Hamming",
  },
  {
    text: "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
    author: "Brian Kernighan",
  },
  { text: "Only the paranoid survive.", author: "Andy Grove" },
  {
    text: "A language that doesn't affect the way you think about programming is not worth knowing.",
    author: "Alan Perlis",
  },
  { text: "Our industry does not respect tradition — it only respects innovation.", author: "Satya Nadella" },
  { text: "Beware of bugs in the above code; I have only proved it correct, not tried it.", author: "Donald Knuth" },
  {
    text: "It's better to make a few people really happy than to make a lot of people semi-happy.",
    author: "Paul Buchheit",
  },
  { text: "Don't live with broken windows.", author: "Andy Hunt & Dave Thomas" },
  {
    text: "The way to get startup ideas is not to try to think of startup ideas.",
    author: "Paul Graham",
  },
  { text: "Duplication is far cheaper than the wrong abstraction.", author: "Sandi Metz" },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
  },
  { text: "Simplicity does not precede complexity, but follows it.", author: "Alan Perlis" },
  {
    text: "It always takes longer than you expect, even when you take into account Hofstadter's Law.",
    author: "Douglas Hofstadter",
  },
  { text: "If I have seen further it is by standing on the shoulders of Giants.", author: "Isaac Newton" },
  {
    text: "We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris.",
    author: "Larry Wall",
  },
  { text: "Controlling complexity is the essence of computer programming.", author: "Brian Kernighan" },
  {
    text: "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable.",
    author: "Leslie Lamport",
  },
  { text: "It's harder to read code than to write it.", author: "Joel Spolsky" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  {
    text: "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies.",
    author: "Tony Hoare",
  },
];

export const curatedJokes: readonly CuratedJoke[] = [
  { kind: "twopart", setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs." },
  { kind: "twopart", setup: "A SQL query walks into a bar, goes up to two tables and asks…", punchline: "“Can I join you?”" },
  { kind: "single", text: "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors." },
  { kind: "twopart", setup: "How many programmers does it take to change a light bulb?", punchline: "None. That's a hardware problem." },
  { kind: "twopart", setup: "Why do programmers mix up Halloween and Christmas?", punchline: "Because Oct 31 == Dec 25." },
  { kind: "single", text: "Two CSS properties walk into a bar. A barstool in a completely different bar falls over." },
  { kind: "twopart", setup: "How do you comfort a JavaScript bug?", punchline: "You console it." },
  { kind: "twopart", setup: "Why are Assembly programmers always soaking wet?", punchline: "They work below C level." },
  { kind: "twopart", setup: "What's the object-oriented way to become wealthy?", punchline: "Inheritance." },
  { kind: "single", text: "99 little bugs in the code, 99 little bugs. Take one down, patch it around… 127 little bugs in the code." },
  { kind: "twopart", setup: "What did the router say to the doctor?", punchline: "“It hurts when IP.”" },
  { kind: "twopart", setup: "Why did the binary search tree feel so confident?", punchline: "It always knew what was left and what was right." },
  { kind: "single", text: "To understand recursion, you must first understand recursion." },
  { kind: "twopart", setup: "Why did the programmer get stuck in the shower?", punchline: "The bottle said: lather, rinse, repeat." },
  { kind: "twopart", setup: "What's the best time to deploy to production on a Friday?", punchline: "Whenever you're ready to spend the weekend with it." },
  { kind: "single", text: "git commit -m \"fix\" · git commit -m \"actually fix\" · git commit -m \"please\"" },
  { kind: "twopart", setup: "Why did the developer bring a ladder to work?", punchline: "They heard the project was moving to the cloud." },
  { kind: "twopart", setup: "Why don't hash maps ever get lost?", punchline: "They always know where their keys are." },
  { kind: "twopart", setup: "How do functions end a friendship?", punchline: "They stop calling each other." },
  { kind: "single", text: "There's no place like 127.0.0.1." },
  { kind: "twopart", setup: "Why was the API so relaxed?", punchline: "It got plenty of REST." },
  { kind: "twopart", setup: "What did the HTML tag say to the stylesheet?", punchline: "“You've got class.”" },
  {
    kind: "single",
    text: "A programmer puts two glasses on the nightstand before sleeping: a full one in case they get thirsty, and an empty one in case they don't.",
  },
  { kind: "twopart", setup: "Why did the integer drown?", punchline: "It couldn't float." },
  { kind: "twopart", setup: "Why was the algorithm such a dependable friend?", punchline: "Its loyalty was O(1). Constant." },
  { kind: "twopart", setup: "How long will this feature take?", punchline: "Two weeks. It's always two weeks." },
  { kind: "single", text: "Debugging is like being the detective in a crime movie where you're also the murderer." },
  { kind: "twopart", setup: "Why did the front-end developer love flexbox?", punchline: "Because centering a div used to be a career." },
  { kind: "twopart", setup: "What's a computer's favourite snack?", punchline: "Microchips." },
  { kind: "twopart", setup: "I asked the dynamic programming student how their day was.", punchline: "“Same as last time. I memoized it.”" },
  { kind: "single", text: "My code doesn't work and I don't know why. My code works and I don't know why." },
  { kind: "twopart", setup: "Why don't Git branches ever stay angry?", punchline: "They know how to resolve conflicts." },
  { kind: "twopart", setup: "Why was the computer cold?", punchline: "It left its Windows open." },
  { kind: "twopart", setup: "What do you call eight hobbits?", punchline: "A hobbyte." },
  { kind: "twopart", setup: "Why do DBAs make great friends?", punchline: "They always keep a backup." },
  { kind: "single", text: "“It works on my machine.” “Then we'll ship your machine.” And that's how containers were born." },
  { kind: "twopart", setup: "Why did the developer go broke?", punchline: "They used up all their cache." },
  {
    kind: "single",
    text: "A QA engineer walks into a bar. Orders 1 coffee. Orders 0 coffees. Orders 99999999 coffees. Orders -1 coffees. Orders a lizard.",
  },
  { kind: "twopart", setup: "Why don't programmers like nature?", punchline: "Too many bugs, and no documentation." },
  { kind: "twopart", setup: "Why was the code review so quick?", punchline: "Everyone wrote “LGTM” and went to lunch." },
  { kind: "twopart", setup: "What do you call code with no comments?", punchline: "A mystery novel for future you." },
  { kind: "twopart", setup: "Why did the array go to therapy?", punchline: "It had trouble letting go of its past indexes." },
  { kind: "single", text: "Production is just staging with real consequences." },
  { kind: "twopart", setup: "What's a pirate's favourite programming language?", punchline: "You'd think R, but it's the C." },
  { kind: "twopart", setup: "Why did the off-by-one error cross the road?", punchline: "To get to the other sid." },
  { kind: "twopart", setup: "Why don't Booleans ever argue?", punchline: "There's no middle ground." },
  { kind: "single", text: "!false — it's funny because it's true." },
  { kind: "twopart", setup: "Why did the developer start a garden?", punchline: "They wanted a tree that didn't need balancing." },
  { kind: "twopart", setup: "What's a programmer's favourite place to hang out?", punchline: "The Foo Bar." },
  { kind: "twopart", setup: "Why did the stack and the queue stop talking?", punchline: "One kept bringing up the last thing said; the other only ever remembered the first." },
  { kind: "single", text: "A programmer is a machine that turns coffee into code — and the code into more coffee." },
  { kind: "twopart", setup: "Why did the commit message just say “misc fixes”?", punchline: "Because “I don't remember” felt too honest." },
  { kind: "twopart", setup: "Why did the developer refuse to deploy on Friday?", punchline: "They'd already met the weekend on-call version of themselves." },
  { kind: "twopart", setup: "Why are linked lists bad at parties?", punchline: "They only ever talk to the next one." },
  { kind: "twopart", setup: "What did the 404 page say at the reunion?", punchline: "“I don't know where everyone went.”" },
  { kind: "single", text: "I'd tell you a UDP joke, but you might not get it." },
  { kind: "twopart", setup: "Why did the recursive function finally stop?", punchline: "It hit rock bottom. That's what base cases are for." },
  { kind: "twopart", setup: "Why did the CSS developer go to therapy?", punchline: "Too many !important issues." },
  { kind: "twopart", setup: "What's a graph's favourite way to make friends?", punchline: "Adding edges." },
  { kind: "twopart", setup: "Why was the variable so calm?", punchline: "It knew it was constant." },
];

/**
 * JokeAPI jokes reviewed and approved for this site (by id). Safe mode still lets through
 * pickup lines, relationship and drinking jokes, jabs at groups of people, and typos, so only
 * these are shown; any other id (including ones JokeAPI adds later) falls back to the curated pick.
 * Reviewed 2026-10-31 against the full safe Programming pool (71 jokes).
 */
export const approvedJokeApiIds: ReadonlySet<number> = new Set([
  0, 1, 2, 3, 4, 5, 7, 10, 11, 12, 13, 14, 16, 20, 21, 23, 24, 25, 26, 29, 31, 32, 34, 36, 37, 39,
  40, 42, 44, 46, 47, 48, 49, 50, 56, 122, 179, 210, 213, 220, 231, 263, 291, 300, 318,
]);
