import { RankInfo } from '../types';

export const QUOTES_NORMAL: [string, string][] = [
  ["Waste no more time arguing what a good man should be. Be one.", "Marcus Aurelius"],
  ["If it is not right, do not do it. If it is not true, do not say it.", "Marcus Aurelius"],
  ["What stands in the way becomes the way.", "Marcus Aurelius"],
  ["At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work, as a human being.", "Marcus Aurelius"],
  ["You could leave life right now. Let that determine what you do and say and think.", "Marcus Aurelius"],
  ["The soul becomes dyed with the color of its thoughts.", "Marcus Aurelius"],
  ["First say to yourself what you would be; then do what you have to do.", "Epictetus"],
  ["No man is free who is not master of himself.", "Epictetus"],
  ["We suffer more often in imagination than in reality.", "Seneca"],
  ["It is not that we have a short time to live, but that we waste much of it.", "Seneca"],
  ["Begin at once to live, and count each separate day as a separate life.", "Seneca"],
  ["Difficulties strengthen the mind, as labor does the body.", "Seneca"],
  ["He suffers more than necessary, who suffers before it is necessary.", "Seneca"],
  ["Nobody is coming to save you. Get up.", "IRON"],
  ["You control your mind. You do not control events. Find your strength there.", "IRON"],
  ["You are not tired. You are undisciplined.", "IRON"],
  ["Do the hard thing first. Your day will thank you.", "IRON"],
  ["Motivation is a visitor. Discipline lives in your house.", "IRON"],
  ["Nobody cares how you feel. Do the work.", "IRON"],
  ["A man is what he does every day, not what he says once.", "IRON"],
  ["Your future self is watching what you do right now.", "IRON"],
  ["Comfort is a slow death. Choose the small pain today.", "IRON"],
  ["Be the man your family can lean on.", "IRON"],
  ["One day or day one. You choose.", "IRON"],
  ["Stop negotiating with yourself. Move.", "IRON"],
  ["The man you want to be is built in the hours nobody sees.", "IRON"],
  ["Fall seven times. Stand up eight. Keep the streak alive.", "IRON"],
  ["Hard days build strong men. Easy days build nothing.", "IRON"],
  ["Your habits decide who you are. Not your goals.", "IRON"],
  ["Be quiet. Work hard. Let the results talk.", "IRON"],
  ["Never miss twice. One bad day is a story. Two is a habit.", "IRON"],
  ["Small steps, every day. That is the whole secret.", "IRON"],
  ["You do not need more time. You need to start.", "IRON"],
  ["Do it tired. Do it bored. Do it anyway.", "IRON"],
  ["Discipline is a promise to yourself. Keep it.", "IRON"],
  ["No excuses. Only the next rep.", "IRON"],
  ["Win the morning. Win the day.", "IRON"],
  ["Your phone can wait. Your goals cannot.", "IRON"],
  ["Be proud of the boring work. It builds you.", "IRON"],
  ["Kill the snooze button. Win the first fight.", "IRON"],
  ["Today’s pain is tomorrow’s strength.", "IRON"],
  ["Do not wish for it. Work for it.", "IRON"],
  ["Show up. Even on the bad days. Especially on the bad days.", "IRON"],
  ["Strong men are made in quiet rooms.", "IRON"],
  ["Think less. Start more.", "IRON"],
  ["The streak is a chain. Do not break it.", "IRON"],
  ["Fear is loud. Action is louder.", "IRON"],
  ["Make the plan. Then follow the plan.", "IRON"],
  ["Do what you said you would do.", "IRON"],
  ["Be hard on your habits. Be kind to your people.", "IRON"],
  ["Everyone starts at zero. Keep going.", "IRON"],
  ["Your only rival is who you were yesterday.", "IRON"],
  ["Sweat now. Smile later.", "IRON"],
  ["Make today count. Then do it again.", "IRON"],
  ["Quit nothing. Pause if you must. Then return.", "IRON"],
  ["Respect your time like you respect your money.", "IRON"],
  ["One focused hour beats five lazy ones.", "IRON"],
  ["Build the habit. The habit will build you.", "IRON"],
  ["Pain is temporary. Regret is not.", "IRON"],
  ["Choose the work, even when it is heavy.", "IRON"],
  ["A calm mind, a hard body, a clear plan.", "IRON"],
  ["Do not wait to feel ready.", "IRON"],
  ["Small wins stack. Stack them every day.", "IRON"],
  ["Be early. Be ready. Be steady.", "IRON"]
];

export const QUOTES_SOFT: [string, string][] = [
  ["Make the best use of what is in your power, and take the rest as it happens.", "Epictetus"],
  ["A bad day is not a bad life. Do one small thing.", "IRON"],
  ["Do the smallest task. That is enough to stay in the game.", "IRON"],
  ["You do not have to do it all. Just do the next thing.", "IRON"],
  ["Rest is not weakness. Come back stronger.", "IRON"],
  ["Breathe. Drink water. Pick one task.", "IRON"],
  ["Slow is still moving.", "IRON"],
  ["Be kind to yourself. Then keep your word.", "IRON"],
  ["Tonight, finish one thing. Tomorrow is a new start.", "IRON"],
  ["You are allowed to be tired. You are not allowed to quit.", "IRON"],
  ["Hard days count the most. You are still here.", "IRON"],
  ["Five minutes is a win. Start the timer.", "IRON"],
  ["Today is heavy. Carry it a little, put it down, begin again.", "IRON"],
  ["You showed up to read this. Now show up for one task.", "IRON"]
];

export const RANKS: RankInfo[] = [
  { nameEn: "Recruit", nameAr: "مجند", threshold: 0, roman: "I" },
  { nameEn: "Soldier", nameAr: "جندي", threshold: 3, roman: "II" },
  { nameEn: "Fighter", nameAr: "مقاتل", threshold: 7, roman: "III" },
  { nameEn: "Warrior", nameAr: "محارب", threshold: 14, roman: "IV" },
  { nameEn: "Commander", nameAr: "قائد", threshold: 30, roman: "V" },
  { nameEn: "Titan", nameAr: "تيتان", threshold: 60, roman: "VI" },
  { nameEn: "Legend", nameAr: "أسطورة", threshold: 100, roman: "VII" }
];

export const DEFAULT_MISSIONS = [
  "Wake up early",
  "Train your body",
  "Learn for 1.5 hours",
  "Read 10 pages",
  "No phone in the first hour"
];

export const MISSION_LIBRARY: [string, [string, string][]][] = [
  [
    "Body",
    [
      ["Train for 45 minutes", "Example: push-ups, squats, a run or the gym. Pick one. Go."],
      ["50 push-ups", "Example: 5 sets of 10. Rest 1 minute between sets."],
      ["Walk 8,000 steps", "Example: walk to university, or walk 40 minutes after dinner."],
      ["Cold shower", "Example: end your shower with 30 seconds of cold water."],
      ["Sleep before 11 pm", "Example: phone off at 10:30. Alarm on."],
      ["Drink 2 liters of water", "Example: 4 bottles of 500 ml. One before lunch."]
    ]
  ],
  [
    "Mind",
    [
      ["Read 10 pages", "Example: a book about money, habits or history. Not social media."],
      ["Learn for 1.5 hours", "Example: one programming or skill lesson, then write code."],
      ["No phone in the first hour", "Example: leave phone in another room. Wash, drink water, move."],
      ["No social media for 3 hours", "Example: put apps in a folder and set an app timer."],
      ["Do one focus session", "Example: open Focus, set 25 minutes, one task only, phone away."],
      ["Plan tomorrow tonight", "Example: write your 3 hardest tasks on paper."]
    ]
  ],
  [
    "Skills",
    [
      ["Practice my skill for 1 hour", "Example: code, design or write. Make something. Do not only watch."],
      ["Finish one lesson", "Example: one video or chapter from your course. Take notes."],
      ["Build one small thing", "Example: a clean button, to-do list, or quote widget."],
      ["Share one thing online", "Example: post one insight you learned on LinkedIn/X."],
      ["Learn 5 new words", "Example: 5 vocabulary words with meaning and sentences."]
    ]
  ],
  [
    "Discipline",
    [
      ["Wake up at 5:30", "Example: alarm across room. Feet on floor immediately."],
      ["Make my bed", "Example: first thing. 2 minutes. First win of the day."],
      ["Do the hardest task first", "Example: the task you dread most. Execute before noon."],
      ["Say no to one distraction", "Example: skip one mindless video, game or idle chat."],
      ["Clean my room", "Example: desk clear, floor clear, clothes folded. 10 minutes."],
      ["No junk food", "Example: no soda, chips, or artificial sweets today."]
    ]
  ],
  [
    "Family",
    [
      ["Call my family", "Example: 5 minutes. Check on parents or siblings. Listen."],
      ["Help at home", "Example: wash dishes, take out trash without being asked."],
      ["Listen without arguing", "Example: let others finish speaking calmly."],
      ["Keep one promise", "Example: deliver what you promised on time."]
    ]
  ]
];

export const EXAMPLES_MAP: Record<string, string> = {
  "Wake up early": "Example: out of bed at first alarm. No snooze.",
  "Train your body": "Example: 20 minutes of push-ups, squats or running."
};
MISSION_LIBRARY.forEach((cat) => {
  cat[1].forEach(([title, ex]) => {
    EXAMPLES_MAP[title] = ex;
  });
});

export const MISSION_PACKS: [string, string[]][] = [
  ["Starter", DEFAULT_MISSIONS],
  [
    "Warrior",
    [
      "Wake up at 5:30",
      "Train for 45 minutes",
      "Cold shower",
      "Learn for 1.5 hours",
      "Read 10 pages",
      "No social media for 3 hours",
      "Plan tomorrow tonight"
    ]
  ],
  [
    "Student",
    [
      "Wake up at 5:30",
      "Learn for 1.5 hours",
      "Finish one lesson",
      "Read 10 pages",
      "Walk 8,000 steps",
      "Sleep before 11 pm"
    ]
  ]
];

export const DAYS_NAMES: [string, string][] = [
  ["Mon", "اثن"],
  ["Tue", "ثلا"],
  ["Wed", "أرب"],
  ["Thu", "خمي"],
  ["Fri", "جمع"],
  ["Sat", "سبت"],
  ["Sun", "أحد"]
];

export const TRANSLATIONS: Record<string, [string, string]> = {
  today: ["Today", "اليوم"],
  missions: ["Missions", "المهام"],
  focus: ["Focus", "تركيز"],
  me: ["Me", "أنا"],
  flutterCode: ["Flutter Code", "كود فلاتر"],
  streak: ["Day streak", "أيام متتالية"],
  mygoal: ["My goal", "هدفي"],
  qod: ["Quote of the day", "اقتباس اليوم"],
  qhard: ["Hard day quote", "اقتباس ليوم صعب"],
  newq: ["New quote", "اقتباس جديد"],
  hard: ["Hard day", "يوم صعب"],
  hardoff: ["Back to normal", "عودة للعادي"],
  fav: ["Favorite", "مفضلة"],
  unfav: ["Remove favorite", "إزالة من المفضلة"],
  tmis: ["Today’s mission", "مهام اليوم"],
  ofw: ["of", "من"],
  addtask: ["Add a task", "أضف مهمة"],
  next: ["DONE. NEXT.", "تم. التالي."],
  wonmsg: ["DAY COMPLETE", "ربحت اليوم"],
  wonsub: ["All missions done. Rest well.", "خلصت كل المهام. ارتاح."],
  tleft: ["Time left today", "الوقت المتبقي اليوم"],
  tdone: ["Done for today · next day starts in", "انتهيت اليوم · اليوم التالي بعد"],
  hrs: ["HRS", "ساعة"],
  min: ["MIN", "دقيقة"],
  sec: ["SEC", "ثانية"],
  notasks: ["No missions for today. Add one in Missions.", "لا مهام اليوم. أضف مهمة من تبويب المهام."],
  lock: ["Today is locked. Changes start tomorrow.", "اليوم مقفل. التغييرات تبدأ غدًا."],
  shr: ["Shield ready. One missed day is forgiven this week.", "الدرع جاهز. يوم فائت واحد يُغفر هذا الأسبوع."],
  shu: ["Shield used this week. A new one comes on Monday.", "استُخدم الدرع هذا الأسبوع. يعود يوم الاثنين."],
  shw: ["Yesterday the Shield saved you. Miss today and the streak breaks.", "أمس أنقذك الدرع. إن فاتك اليوم ينكسر التسلسل."],
  restbtn: ["Take a rest day", "خذ يوم راحة"],
  restt: ["REST DAY", "يوم راحة"],
  restx: ["Sleep. Eat. Come back tomorrow. Your streak is safe.", "نم. كل. عد غدًا. تسلسلك آمن."],
  restc: ["Cancel rest day", "إلغاء يوم الراحة"],
  restu: ["Rest day already used this week.", "استخدمت يوم الراحة هذا الأسبوع."],
  bkwarn: ["No backup for 7 days. Save one now.", "لا نسخة احتياطية منذ 7 أيام. احفظ نسخة الآن."],
  bkgo: ["Back up now", "احفظ الآن"],
  dtl: ["Details", "التفاصيل"],
  del: ["Delete task", "احذف المهمة"],
  msub: ["Edit your tasks and days.", "عدّل مهامك وأيامها."],
  every: ["Every day", "كل يوم"],
  tmrw: ["Starts tomorrow", "تبدأ غدًا"],
  daysl: ["Days", "الأيام"],
  packs: ["Mission packs", "حزم المهام"],
  pick: ["Pick your missions", "اختر مهامك"],
  tapg: ["Tap a category to see its missions.", "اضغط تصنيفًا لترى مهامه."],
  nmis: ["missions", "مهمة"],
  added: ["added", "مضافة"],
  ownph: ["Type your task", "اكتب مهمتك"],
  mnone: ["No missions yet. Add your first one.", "لا مهام بعد. أضف أول مهمة."],
  own: ["Write my own", "اكتب مهمتي"],
  ownd: ["Type any task you want", "اكتب أي مهمة تريدها"],
  lst: ["Choose from the list", "اختر من القائمة"],
  lstd: ["Body, Mind, Skills and more", "الجسم، العقل، المهارات والمزيد"],
  pksd: ["Replace all tasks with a full pack", "استبدل كل المهام بحزمة كاملة"],
  close: ["Close", "إغلاق"],
  sure: ["Are you sure?", "هل أنت متأكد؟"],
  yes: ["YES", "نعم"],
  no: ["NO", "لا"],
  yrank: ["Your rank", "رتبتك"],
  daysto: ["{n} days to {r}", "{n} يوم للوصول إلى {r}"],
  toprk: ["Top rank. Stay hungry.", "أعلى رتبة. ابقَ جائعًا."],
  best: ["Best", "الأفضل"],
  dwon: ["Days won", "أيام الفوز"],
  wrev: ["Weekly review", "مراجعة الأسبوع"],
  wwon: ["Days won this week", "أيام الفوز هذا الأسبوع"],
  wbest: ["Best task", "أفضل مهمة"],
  wskip: ["Most skipped task", "أكثر مهمة تركتها"],
  heat: ["Last 28 days", "آخر 28 يومًا"],
  lwon: ["Won", "فوز"],
  lshield: ["Shielded", "درع"],
  lrest: ["Rest", "راحة"],
  badges: ["Badges", "الأوسمة"],
  b1: ["First win", "أول فوز"],
  b2: ["3 days", "3 أيام"],
  b3: ["7 days", "7 أيام"],
  b4: ["14 days", "14 يومًا"],
  b5: ["30 days", "30 يومًا"],
  b6: ["60 days", "60 يومًا"],
  favs: ["Favorites", "المفضلة"],
  nofav: ["No favorites yet. Tap the heart on a quote.", "لا مفضلة بعد. اضغط القلب على اقتباس."],
  backup: ["Backup", "النسخ الاحتياطي"],
  exp: ["Export backup", "تصدير نسخة"],
  imp: ["Import backup", "استيراد نسخة"],
  lastbk: ["Last backup", "آخر نسخة"],
  never: ["Never", "أبدًا"],
  pers1: ["Storage is protected on this device.", "التخزين محمي على هذا الجهاز."],
  pers2: ["The browser may clear your data. Export a backup often.", "قد يمسح المتصفح بياناتك. صدّر نسخة بانتظام."],
  settings: ["Settings", "الإعدادات"],
  name: ["My name", "اسمي"],
  save: ["Save", "حفظ"],
  daystart: ["My day starts at", "يبدأ يومي عند"],
  daystarth: ["Your 24 hours count from this time. Late nights will not break your streak.", "تُحسب الـ 24 ساعة من هذا الوقت. السهر لا يكسر تسلسلك."],
  lang: ["Language", "اللغة"],
  langh: ["Missions and quotes stay in English.", "المهام والاقتباسات تبقى بالإنجليزية."],
  reset: ["Reset all data", "احذف كل البيانات"],
  resetq: ["Delete everything and start from zero?", "حذف كل شيء والبدء من الصفر؟"],
  fsub: ["One task. No phone. Start the timer.", "مهمة واحدة. بدون هاتف. ابدأ المؤقت."],
  fidle: ["Ready", "جاهز"],
  frun: ["Focusing. Stay on it.", "تركيز. ابقَ على المهمة."],
  fstart: ["START FOCUS", "ابدأ التركيز"],
  fstop: ["Give up session", "إلغاء الجلسة"],
  fstopq: ["Cancel this focus session?", "إلغاء جلسة التركيز؟"],
  fdur: ["Duration", "المدة"],
  min2: ["min", "د"],
  fmtoday: ["Min today", "دقائق اليوم"],
  fsess: ["Sessions", "جلسات"],
  fweek: ["Min this week", "دقائق الأسبوع"],
  ftip: ["Keep phone away. When timer ends, take a 5 minute break.", "ابعد الهاتف. عند انتهاء المؤقت خذ استراحة 5 دقائق."],
  fdone: ["Session complete", "اكتملت الجلسة"],
  tadd2: ["Task added for tomorrow", "أُضيفت المهمة لليوم التالي"],
  askus: ["Ask us", "اسألنا"],
  askd: ["Got a question or an idea? Message us on WhatsApp.", "عندك سؤال أو فكرة؟ كلمنا على واتساب."],
  powered: ["Powered by", "بدعم من"],
  local: ["Your data is saved on this device only.", "بياناتك محفوظة على هذا الجهاز فقط."],
  impq: ["Replace all your data with this backup?", "استبدال كل بياناتك بهذه النسخة؟"],
  badfile: ["This file is not an IRON backup.", "هذا الملف ليس نسخة IRON."],
  imported: ["Backup restored", "تمت استعادة النسخة"],
  exported: ["Backup saved", "تم حفظ النسخة"],
  saved: ["Saved", "تم الحفظ"],
  tdn: ["Task done", "تمت المهمة"],
  tun: ["Task unchecked", "أُلغي التحديد"],
  tdel: ["Task deleted", "حُذفت المهمة"],
  tadd: ["Task added", "أُضيفت المهمة"],
  tpack: ["Pack applied", "طُبقت الحزمة"],
  trest: ["Rest day set", "تم تحديد يوم راحة"],
  trestc: ["Rest day cancelled", "أُلغي يوم الراحة"],
  undo: ["UNDO", "تراجع"],
  su1: ["What is your name?", "ما اسمك؟"],
  su2: ["What is your main goal?", "ما هدفك الرئيسي؟"],
  su3: ["Pick 3 to 5 missions", "اختر من 3 إلى 5 مهام"],
  picked: ["{n} of 5 picked", "تم اختيار {n} من 5"],
  goalph: ["One line. Example: Become a web developer.", "سطر واحد. مثال: أصبح مطور ويب."],
  nameph: ["Your name", "اسمك"],
  cont: ["Continue", "متابعة"],
  back: ["Back", "رجوع"],
  start: ["START", "ابدأ"],
  su4: ["When does your day start?", "متى يبدأ يومك؟"],
  su4h: ["Your day lasts 24 hours from this time. Staying up late will not break your streak.", "يومك يدوم 24 ساعة من هذا الوقت. السهر لا يكسر تسلسلك."],
  dnow: ["Start from now", "ابدأ من الآن"],
  dpick: ["Or pick the hour", "أو اختر الساعة"]
};
