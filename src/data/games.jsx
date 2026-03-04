import { Users, PenTool, Languages, Flame, Ghost, Activity, Flag } from 'lucide-react';

export const GAMES = [
  {
    id: 'imposter',
    title: 'Imposter',
    desc: 'Find the liar among us.',
    icon: Users,
    color: 'text-red-400',
    gradient: 'from-red-600/40 via-black to-blue-600/40',
    minPlayers: 3,
    howToPlay: "Pass the phone around. Everyone will receive the exact same Secret Word... except for the Imposter, who will receive a completely different Decoy Word (or no word at all). Everyone must give hints to prove they know the real word without saying it.",
    rules: "You cannot say the word directly.\nYou must give exactly ONE hint per round.\nIf the Imposter is caught, they get one final chance to guess the real Secret Word to steal the win."
  },
  {
    id: 'imposter_draw',
    title: 'Imposter Draw',
    desc: 'Fake artist drawing test.',
    icon: PenTool,
    color: 'text-pink-400',
    gradient: 'from-pink-500/20 to-rose-500/20',
    minPlayers: 3,
    howToPlay: "Pass the phone to see the secret prompt. Once everyone has seen it, take turns drawing one single continuous line on the shared canvas to prove you know what the prompt is. The Imposter has no idea what to draw and must fake it!",
    rules: "You can only draw one continuous line per turn.\nDo not make your drawing too obvious, or the Imposter will figure out the prompt.\nThe Imposter wins if they blend in and aren't voted out."
  },
  {
    id: 'hinglish',
    title: 'Hinglish',
    desc: 'Translate songs fast.',
    icon: Languages,
    color: 'text-yellow-400',
    gradient: 'from-yellow-400/20 to-orange-500/20',
    minPlayers: 2,
    howToPlay: "Players take turns being the active guesser. On your turn, a famous Hindi song lyric translated literally into English (or vice versa) will appear on screen. You must guess the original song correctly to earn a point. Once your turn ends, pass the phone to the next player.",
    rules: "Only the active player whose turn it is can guess.\nEach correct translation earns you 1 point.\nOnce everyone has completed their turns, the player with the most accumulated points wins the game!"
  },
  {
    id: 'hotbomb',
    title: 'Hot Bomb',
    desc: 'Pass the phone before boom.',
    icon: Flame,
    color: 'text-red-500',
    gradient: 'from-red-500/20 to-orange-600/20',
    minPlayers: 2,
    howToPlay: "A random category will appear on screen and a hidden timer will start ticking. You must quickly shout out a word fitting the category and pass the phone to the next person. Whoever is holding the phone when it explodes loses!",
    rules: "You cannot repeat a word that has already been said.\nYou must clearly say the word BEFORE passing the phone.\nNo hesitation, keep the pace fast!"
  },
  {
    id: 'taboo',
    title: 'Evil Explain',
    desc: 'Explain without forbidden words.',
    icon: Ghost,
    color: 'text-red-400',
    gradient: 'from-red-600/20 to-red-900/20',
    minPlayers: 4,
    howToPlay: "Divide into two teams. One player must get their team to guess the main word on the screen. However, you are strictly forbidden from saying any of the 'Evil Words' listed below it.",
    rules: "No using 'sounds like' or 'rhymes with'.\nNo using gestures or acting out the word.\nIf you say a forbidden word, your turn immediately ends."
  },
  {
    id: 'frequency',
    title: 'Frequency',
    desc: 'Match your wavelength.',
    icon: Activity,
    color: 'text-blue-400',
    gradient: 'from-blue-400/20 to-cyan-500/20',
    minPlayers: 2,
    howToPlay: "One player (the 'Knower') secretly views a hidden number between 1 and 10. The phone then displays a category prompt to everyone else (e.g., 'Name a footballer'). The Knower must give an answer that matches the quality of their secret number on a scale of 1 (Worst) to 10 (Best). The rest of the players must deduce what the secret number is based on that answer!",
    rules: "The Knower cannot use numbers in their answer.\nThe group discusses and guesses the number out loud offline.\nOnce the group agrees, click 'Guess' to reveal the true number!\nThe Knower then selects whoever guessed correctly in the app to award them a point.\nThe player with the most points at the end wins!"
  },
  {
    id: 'flags',
    title: 'Flag Roulette',
    desc: 'Guess the country flag.',
    icon: Flag,
    color: 'text-green-400',
    gradient: 'from-green-400/20 to-emerald-600/20',
    minPlayers: 1,
    howToPlay: "A random national flag will appear on the screen. You must guess which country it belongs to before the time runs out.",
    rules: "You get exactly one guess per flag.\nSpelling does not matter as long as the pronunciation is correct.\nPlay solo for a high score or against friends taking turns."
  }
];