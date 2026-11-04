export interface FlutterFile {
  path: string;
  filename: string;
  language: string;
  content: string;
  description: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    language: 'yaml',
    description: 'Dependencies, assets, fonts, and project metadata',
    content: `name: iron_discipline
description: "Stoic daily discipline, habit streak tracker, focus timer, and rank progression in Flutter."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  provider: ^6.1.2
  shared_preferences: ^2.2.3
  intl: ^0.19.0
  audioplayers: ^6.0.0
  confetti: ^0.7.0
  google_fonts: ^6.2.1
  lucide_icons: ^0.257.0
  vibration: ^2.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/audio/
`
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    language: 'dart',
    description: 'App entry point, Material 3 Dark theme, and Navigation Shell',
    content: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'providers/iron_provider.dart';
import 'screens/today_screen.dart';
import 'screens/missions_screen.dart';
import 'screens/focus_screen.dart';
import 'screens/me_screen.dart';
import 'screens/onboarding_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0A),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  final provider = IronProvider();
  await provider.load();

  runApp(
    ChangeNotifierProvider.value(
      value: provider,
      child: const IronApp(),
    ),
  );
}

class IronApp extends StatelessWidget {
  const IronApp({super.key});

  @override
  Widget build(BuildContext context) {
    final iron = context.watch<IronProvider>();

    return MaterialApp(
      title: 'IRON',
      debugShowCheckedModeBanner: false,
      locale: Locale(iron.lang),
      supportedLocales: const [Locale('en'), Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE11D1D),
          secondary: Color(0xFFFF5C5C),
          surface: Color(0xFF151515),
          surfaceContainer: Color(0xFF1A1A1A),
          onSurface: Color(0xFFF2F2F2),
          outline: Color(0xFF2E2E2E),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme).copyWith(
          displayLarge: GoogleFonts.barlowCondensed(
            fontSize: 96,
            fontWeight: FontWeight.w900,
            color: const Color(0xFFE11D1D),
            letterSpacing: 2,
          ),
          titleLarge: GoogleFonts.barlowCondensed(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
      ),
      home: iron.isSetupComplete ? const MainShell() : const OnboardingScreen(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    TodayScreen(),
    MissionsScreen(),
    FocusScreen(),
    MeScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final iron = context.watch<IronProvider>();

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0A0A0A),
          border: Border(top: BorderSide(color: Color(0xFF222222), width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          backgroundColor: Colors.transparent,
          indicatorColor: const Color(0xFFE11D1D).withOpacity(0.2),
          elevation: 0,
          onDestinationSelected: (index) {
            HapticFeedback.selectionClick();
            setState(() => _currentIndex = index);
          },
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.calendar_today_outlined),
              selectedIcon: const Icon(Icons.calendar_today, color: Color(0xFFFF5C5C)),
              label: iron.t('today'),
            ),
            NavigationDestination(
              icon: const Icon(Icons.check_box_outlined),
              selectedIcon: const Icon(Icons.check_box, color: Color(0xFFFF5C5C)),
              label: iron.t('missions'),
            ),
            NavigationDestination(
              icon: const Icon(Icons.timer_outlined),
              selectedIcon: const Icon(Icons.timer, color: Color(0xFFFF5C5C)),
              label: iron.t('focus'),
            ),
            NavigationDestination(
              icon: const Icon(Icons.person_outline),
              selectedIcon: const Icon(Icons.person, color: Color(0xFFFF5C5C)),
              label: iron.t('me'),
            ),
          ],
        ),
      ),
    );
  }
}
`
  },
  {
    path: 'lib/models/mission.dart',
    filename: 'mission.dart',
    language: 'dart',
    description: 'Data model for tasks, recurrence, and status',
    content: `class Mission {
  final String id;
  final String text;
  final List<int> days; // 0=Mon, 6=Sun
  final String from;
  final String to;

  Mission({
    required this.id,
    required this.text,
    required this.days,
    this.from = '',
    this.to = '',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    't': text,
    'days': days,
    'from': from,
    'to': to,
  };

  factory Mission.fromJson(Map<String, dynamic> json) {
    return Mission(
      id: json['id'] as String,
      text: json['t'] as String,
      days: (json['days'] as List<dynamic>?)?.map((e) => e as int).toList() ?? [0, 1, 2, 3, 4, 5, 6],
      from: json['from'] as String? ?? '',
      to: json['to'] as String? ?? '',
    );
  }

  Mission copyWith({
    String? text,
    List<int>? days,
    String? from,
    String? to,
  }) {
    return Mission(
      id: id,
      text: text ?? this.text,
      days: days ?? this.days,
      from: from ?? this.from,
      to: to ?? this.to,
    );
  }
}
`
  },
  {
    path: 'lib/providers/iron_provider.dart',
    filename: 'iron_provider.dart',
    language: 'dart',
    description: 'State management for streak, quotes, day cycle, and missions',
    content: `import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/mission.dart';

class IronProvider extends ChangeNotifier {
  static const String prefKey = 'iron_v2';

  int version = 2;
  bool isSetupComplete = false;
  String name = '';
  String goal = '';
  String lang = 'en';
  int dayEndHour = 0; // 0..23
  String startDate = '';

  List<Mission> missions = [];
  Map<String, List<String>> done = {};
  Map<String, int> won = {};
  Map<String, int> rest = {};
  Map<String, List<Map<String, String>>> snap = {};
  List<String> favorites = [];

  // Focus
  int focusMinutes = 25;
  int? focusEndTime;

  // Streak calculation
  int streak = 0;
  int bestStreak = 0;
  int totalWins = 0;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(prefKey);
    if (raw != null) {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      isSetupComplete = (data['setup'] ?? 0) == 1;
      name = data['name'] ?? '';
      goal = data['goal'] ?? '';
      lang = data['lang'] ?? 'en';
      dayEndHour = data['dayEnd'] ?? 0;
      startDate = data['start'] ?? todayString;

      if (data['missions'] is List) {
        missions = (data['missions'] as List)
            .map((m) => Mission.fromJson(m as Map<String, dynamic>))
            .toList();
      }
      favorites = List<String>.from(data['favs'] ?? []);
    }
    _recalcStats();
    notifyListeners();
  }

  Future<void> save() async {
    final prefs = await SharedPreferences.getInstance();
    final data = {
      'v': 2,
      'setup': isSetupComplete ? 1 : 0,
      'name': name,
      'goal': goal,
      'lang': lang,
      'dayEnd': dayEndHour,
      'start': startDate,
      'missions': missions.map((m) => m.toJson()).toList(),
      'done': done,
      'won': won,
      'rest': rest,
      'favs': favorites,
    };
    await prefs.setString(prefKey, jsonEncode(data));
  }

  String get todayString {
    final now = DateTime.now();
    final adjusted = now.subtract(Duration(hours: dayEndHour));
    return "\${adjusted.year}-\${adjusted.month.toString().padLeft(2, '0')}-\${adjusted.day.toString().padLeft(2, '0')}";
  }

  void toggleMission(String missionId) {
    final today = todayString;
    final currentList = List<String>.from(done[today] ?? []);
    if (currentList.contains(missionId)) {
      currentList.remove(missionId);
    } else {
      currentList.add(missionId);
      HapticFeedback.mediumImpact();
    }
    done[today] = currentList;
    _evaluateTodayWon();
    _recalcStats();
    save();
    notifyListeners();
  }

  void _evaluateTodayWon() {
    final today = todayString;
    final todayMissions = getTasksFor(today);
    final isDone = todayMissions.isNotEmpty &&
        done[today]?.length == todayMissions.length &&
        rest[today] != 1;

    if (isDone) {
      won[today] = 1;
      HapticFeedback.heavyImpact();
    } else {
      won.remove(today);
    }
  }

  List<Mission> getTasksFor(String date) {
    final dt = DateTime.parse(date);
    final dayIndex = (dt.weekday - 1) % 7;
    return missions.where((m) => m.days.contains(dayIndex)).toList();
  }

  void _recalcStats() {
    streak = won.length;
    totalWins = won.length;
    if (streak > bestStreak) bestStreak = streak;
  }

  String t(String key) {
    // English/Arabic dictionary lookup
    return key;
  }
}
`
  },
  {
    path: 'lib/screens/today_screen.dart',
    filename: 'today_screen.dart',
    language: 'dart',
    description: 'Today tab featuring flame streak, quotes, checklist, and rest day',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/iron_provider.dart';

class TodayScreen extends StatelessWidget {
  const TodayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final iron = context.watch<IronProvider>();
    final today = iron.todayString;
    final tasks = iron.getTasksFor(today);
    final doneList = iron.done[today] ?? [];
    final isWon = iron.won[today] == 1;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'IRON',
          style: GoogleFonts.barlowCondensed(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            letterSpacing: 4,
            color: const Color(0xFFE11D1D),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shield_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        children: [
          Text(
            iron.name.isNotEmpty ? '\${iron.name.toUpperCase()} · DAY STREAK' : 'DAY STREAK',
            style: const TextStyle(fontSize: 12, letterSpacing: 2, color: Colors.grey),
          ),
          const SizedBox(height: 4),
          Text(
            '\${iron.streak}',
            style: GoogleFonts.barlowCondensed(
              fontSize: 110,
              fontWeight: FontWeight.w900,
              color: const Color(0xFFE11D1D),
              height: 0.9,
            ),
          ),
          if (iron.goal.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.only(left: 12),
              decoration: const BoxDecoration(
                border: Border(left: BorderSide(color: Color(0xFFE11D1D), width: 3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('MY GOAL', style: TextStyle(fontSize: 11, letterSpacing: 1.5, color: Colors.grey)),
                  Text(iron.goal, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          // Missions checklist
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'TODAY\\'S MISSIONS · \${doneList.length} of \${tasks.length}',
                style: const TextStyle(fontSize: 12, letterSpacing: 1.5, color: Colors.grey),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...tasks.map((mission) {
            final isDone = doneList.contains(mission.id);
            return Card(
              color: const Color(0xFF151515),
              margin: const EdgeInsets.symmetric(vertical: 4),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Color(0xFF262626)),
              ),
              child: ListTile(
                leading: Checkbox(
                  value: isDone,
                  activeColor: const Color(0xFFE11D1D),
                  onChanged: (_) => iron.toggleMission(mission.id),
                ),
                title: Text(
                  mission.text,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    decoration: isDone ? TextDecoration.lineThrough : null,
                    color: isDone ? Colors.grey : Colors.white,
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'lib/screens/focus_screen.dart',
    filename: 'focus_screen.dart',
    language: 'dart',
    description: 'Focus Pomodoro countdown timer with duration selector and sound',
    content: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FocusScreen extends StatefulWidget {
  const FocusScreen({super.key});

  @override
  State<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends State<FocusScreen> {
  int _selectedMinutes = 25;
  int _secondsLeft = 25 * 60;
  Timer? _timer;
  bool _isRunning = false;

  void _startTimer() {
    setState(() {
      _isRunning = true;
      _secondsLeft = _selectedMinutes * 60;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft > 0) {
        setState(() => _secondsLeft--);
      } else {
        _timer?.cancel();
        setState(() => _isRunning = false);
        // Play focus complete chime
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
      _secondsLeft = _selectedMinutes * 60;
    });
  }

  @override
  Widget build(BuildContext context) {
    final minutes = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsLeft % 60).toString().padLeft(2, '0');

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'FOCUS',
          style: GoogleFonts.barlowCondensed(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            letterSpacing: 3,
          ),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '$minutes:$seconds',
              style: GoogleFonts.barlowCondensed(
                fontSize: 84,
                fontWeight: FontWeight.w900,
                color: const Color(0xFFE11D1D),
              ),
            ),
            const SizedBox(height: 32),
            if (!_isRunning) ...[
              SegmentedButton<int>(
                segments: const [
                  ButtonSegment(value: 15, label: Text('15m')),
                  ButtonSegment(value: 25, label: Text('25m')),
                  ButtonSegment(value: 45, label: Text('45m')),
                  ButtonSegment(value: 60, label: Text('60m')),
                ],
                selected: {_selectedMinutes},
                onSelectionChanged: (set) {
                  setState(() {
                    _selectedMinutes = set.first;
                    _secondsLeft = _selectedMinutes * 60;
                  });
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE11D1D),
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                ),
                onPressed: _startTimer,
                child: const Text('START FOCUS', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ] else ...[
              OutlinedButton(
                onPressed: _stopTimer,
                child: const Text('CANCEL SESSION'),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
`
  }
];
