import React, { useState } from 'react';
import { ReminderSettings } from '../types';
import {
  subscribeToPush,
  unsubscribeFromPush,
  updatePushPreferences,
  getNotificationPermission,
  isPushSupported
} from '../services/pushService';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Bell,
  BellOff,
  Sun,
  Moon,
  AlertTriangle,
  Clock,
  Globe,
  Share,
  Check,
  AlertCircle
} from 'lucide-react';

interface RemindersSettingsProps {
  reminders: ReminderSettings;
  dayEndHour: number;
  lang: 'en' | 'ar';
  userId?: string | null;
  onUpdateReminders: (updated: ReminderSettings) => void;
  onShowMessage: (msg: string) => void;
}

export const RemindersSettings: React.FC<RemindersSettingsProps> = ({
  reminders,
  dayEndHour,
  lang,
  userId,
  onUpdateReminders,
  onShowMessage
}) => {
  const { isInstalled, isIOS } = usePWAInstall();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );
  const [isSubscribing, setIsSubscribing] = useState(false);

  const isRtl = lang === 'ar';

  // Calculate 2-hour warning time based on user's custom dayEnd hour
  const warningHour = (dayEndHour - 2 + 24) % 24;
  const ampm = warningHour < 12 ? (isRtl ? 'ص' : 'AM') : isRtl ? 'م' : 'PM';
  const warningTimeFormatted = `${warningHour % 12 || 12}:00 ${ampm}`;

  const handleToggleMorning = (enabled: boolean) => {
    const updated = { ...reminders, morningEnabled: enabled };
    onUpdateReminders(updated);
    if (permission === 'granted') {
      updatePushPreferences(updated, lang, dayEndHour, userId);
    }
  };

  const handleChangeMorningTime = (time: string) => {
    const updated = { ...reminders, morningTime: time };
    onUpdateReminders(updated);
    if (permission === 'granted') {
      updatePushPreferences(updated, lang, dayEndHour, userId);
    }
  };

  const handleToggleEvening = (enabled: boolean) => {
    const updated = { ...reminders, eveningEnabled: enabled };
    onUpdateReminders(updated);
    if (permission === 'granted') {
      updatePushPreferences(updated, lang, dayEndHour, userId);
    }
  };

  const handleChangeEveningTime = (time: string) => {
    const updated = { ...reminders, eveningTime: time };
    onUpdateReminders(updated);
    if (permission === 'granted') {
      updatePushPreferences(updated, lang, dayEndHour, userId);
    }
  };

  const handleToggleWarning = (enabled: boolean) => {
    const updated = { ...reminders, warningEnabled: enabled };
    onUpdateReminders(updated);
    if (permission === 'granted') {
      updatePushPreferences(updated, lang, dayEndHour, userId);
    }
  };

  const handleEnableNotifications = async () => {
    setIsSubscribing(true);
    const result = await subscribeToPush(reminders, lang, dayEndHour, userId);
    setIsSubscribing(false);
    setPermission(getNotificationPermission());

    if (result.success) {
      onShowMessage(
        isRtl
          ? 'تم تفعيل التنبيهات بنجاح!'
          : 'Push notifications enabled successfully!'
      );
    } else {
      onShowMessage(result.error || 'Failed to enable notifications');
    }
  };

  const handleDisableNotifications = async () => {
    setIsSubscribing(true);
    await unsubscribeFromPush();
    setIsSubscribing(false);
    setPermission(getNotificationPermission());
    onShowMessage(
      isRtl ? 'تم إلغاء تفعيل التنبيهات.' : 'Push notifications disabled.'
    );
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* iOS Special Check: iOS 16.4+ requires PWA to be installed on Home Screen */}
      {isIOS && !isInstalled && (
        <div className="bg-[#241a10] border border-amber-600/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              {isRtl ? 'تنبيه لمستخدمي iPhone / iPad' : 'iPhone / iPad Notification Requirement'}
            </span>
            <p className="text-amber-300">
              {isRtl
                ? 'أضف التطبيق إلى الشاشة الرئيسية لتلقي التنبيهات.'
                : 'Add to Home Screen to get notifications.'}
            </p>
          </div>
        </div>
      )}

      {/* Permission Button / Status Banner */}
      <div className="bg-[#181818] border border-[#262626] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              permission === 'granted'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/40'
                : 'bg-[#221010] text-[#ff5c5c] border border-[#e11d1d]/40'
            }`}
          >
            {permission === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              {permission === 'granted'
                ? isRtl
                  ? 'التنبيهات مفعلة على هذا الجهاز'
                  : 'Notifications are Active'
                : isRtl
                ? 'التنبيهات غير مفعلة'
                : 'Notifications are Disabled'}
            </div>
            <div className="text-[11px] text-neutral-400">
              {permission === 'granted'
                ? isRtl
                  ? 'ستصلك التذكيرات في الأوقات المحددة أدناه'
                  : 'You will receive reminders at the times set below'
                : isRtl
                ? 'اضغط الزر لتفعيل التنبيهات'
                : 'Tap to grant permission and subscribe'}
            </div>
          </div>
        </div>

        {permission === 'granted' ? (
          <button
            onClick={handleDisableNotifications}
            disabled={isSubscribing}
            className="text-xs font-semibold text-neutral-400 hover:text-rose-400 px-3 py-1.5 border border-[#333] rounded-lg flutter-tap"
          >
            {isRtl ? 'تعطيل' : 'Disable'}
          </button>
        ) : (
          <button
            onClick={handleEnableNotifications}
            disabled={isSubscribing}
            className="px-3.5 py-2 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 flutter-tap shadow-md shadow-[#e11d1d]/30 shrink-0"
          >
            <Bell size={13} />
            <span>{isRtl ? 'تفعيل التنبيهات' : 'Enable Notifications'}</span>
          </button>
        )}
      </div>

      {/* 1. Morning Reminder */}
      <div className="bg-[#171717] border border-[#262626] rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={16} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {isRtl ? 'تذكير الصباح (اقتباس ملهم)' : 'Morning Reminder (Stoic Quote)'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminders.morningEnabled}
              onChange={(e) => handleToggleMorning(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2c2c2c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e11d1d]" />
          </label>
        </div>

        {reminders.morningEnabled && (
          <div className="flex items-center justify-between pt-1 border-t border-[#222222]">
            <span className="text-xs text-neutral-400">
              {isRtl ? 'وقت الإشعار الصباحي' : 'Morning notification time'}
            </span>
            <input
              type="time"
              value={reminders.morningTime}
              onChange={(e) => handleChangeMorningTime(e.target.value)}
              className="bg-[#121212] border border-[#2a2a2a] text-white text-xs font-mono font-bold px-2 py-1.5 rounded-lg outline-none"
            />
          </div>
        )}
      </div>

      {/* 2. Evening Reminder */}
      <div className="bg-[#171717] border border-[#262626] rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-[#ff5c5c]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {isRtl ? 'تذكير المساء (فحص المهام)' : 'Evening Reminder (Mission Check)'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminders.eveningEnabled}
              onChange={(e) => handleToggleEvening(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2c2c2c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e11d1d]" />
          </label>
        </div>

        {reminders.eveningEnabled && (
          <div className="flex items-center justify-between pt-1 border-t border-[#222222]">
            <span className="text-xs text-neutral-400">
              {isRtl ? 'وقت الإشعار المسائي' : 'Evening notification time'}
            </span>
            <input
              type="time"
              value={reminders.eveningTime}
              onChange={(e) => handleChangeEveningTime(e.target.value)}
              className="bg-[#121212] border border-[#2a2a2a] text-white text-xs font-mono font-bold px-2 py-1.5 rounded-lg outline-none"
            />
          </div>
        )}
      </div>

      {/* 3. Evening Warning (2 hours before day ends) */}
      <div className="bg-[#171717] border border-[#262626] rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                {isRtl
                  ? 'تحذير قبل ساعتين من نهاية اليوم'
                  : 'Warning: 2 Hours Before Day Ends'}
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                {isRtl ? `توقيت التحذير: ${warningTimeFormatted}` : `Warning triggers at: ${warningTimeFormatted}`}
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminders.warningEnabled}
              onChange={(e) => handleToggleWarning(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2c2c2c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e11d1d]" />
          </label>
        </div>
        <p className="text-[11px] text-neutral-400 leading-normal">
          {isRtl
            ? `يراعي موعد بداية يومك المخصص (${dayEndHour % 12 || 12}:00). يحذرك إذا لم تكتمل كل المهام لمنع كسر التسلسل.`
            : `Calculated from your custom day-start time (${dayEndHour % 12 || 12}:00). Warns you if missions are incomplete to defend your streak.`}
        </p>
      </div>

      {/* User Timezone Information */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono px-1">
        <Globe size={13} />
        <span>
          {isRtl ? 'المنطقة الزمنية المكتشفة:' : 'Detected Timezone:'}{' '}
          <span className="text-neutral-300 font-bold">{reminders.timezone}</span>
        </span>
      </div>
    </div>
  );
};
