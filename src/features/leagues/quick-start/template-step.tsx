import Feather from '@expo/vector-icons/Feather';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import {
  TEMPLATES,
  type LeagueTypeOption,
  type WizardData,
  type CloneableLeague,
} from './quick-start.types';
import { fetchCloneableLeagues, fetchCloneData } from './quick-start.service';

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
}

export function StepLeagueType({ data, onUpdate, onNext }: Props) {
  const [showClone, setShowClone] = useState(false);
  const [cloneLeagues, setCloneLeagues] = useState<CloneableLeague[]>([]);
  const [loadingClone, setLoadingClone] = useState(false);

  useEffect(() => {
    if (!showClone) return;
    setLoadingClone(true);
    fetchCloneableLeagues()
      .then(setCloneLeagues)
      .catch(() => {})
      .finally(() => setLoadingClone(false));
  }, [showClone]);

  const handleSelectTemplate = useCallback(
    (templateId: string) => {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      onUpdate({
        template: template.id,
        duration: template.duration,
        activities: [...template.activityList],
        restDays: template.restDays,
        cloneFromLeagueId: null,
      });
      onNext();
    },
    [onUpdate, onNext],
  );

  const handleClone = useCallback(
    async (leagueId: string) => {
      setLoadingClone(true);
      try {
        const cloneData = await fetchCloneData(leagueId);
        onUpdate(cloneData);
        onNext();
      } catch {
        // stay on step
      } finally {
        setLoadingClone(false);
      }
    },
    [onUpdate, onNext],
  );

  const typeOptions: { id: LeagueTypeOption; icon: keyof typeof Feather.glyphMap; label: string }[] = [
    { id: 'corporate', icon: 'briefcase', label: 'Corporate' },
    { id: 'residential', icon: 'home', label: 'Residential' },
    { id: 'custom', icon: 'star', label: 'Custom' },
  ];

  return (
    <View className="gap-5">
      {/* League type */}
      <View className="gap-2">
        <View>
          <AppText className="text-lg font-bold text-foreground">League Type</AppText>
          <AppText className="text-sm text-muted">
            Choose your league type. Defaults are pre-filled based on your selection.
          </AppText>
        </View>
        <View className="flex-row gap-2">
          {typeOptions.map((opt) => {
            const selected = data.leagueType === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => onUpdate({ leagueType: opt.id })}
                className="flex-1 items-center gap-1 py-3 rounded-xl"
                style={{
                  backgroundColor: selected ? mflColors.brand : mflColors.white,
                  borderWidth: 1,
                  borderColor: selected ? mflColors.brand : mflColors.border,
                }}
              >
                <Feather
                  name={opt.icon}
                  size={20}
                  color={selected ? mflColors.white : mflColors.textMuted}
                />
                <AppText
                  className="text-xs font-medium"
                  style={{ color: selected ? mflColors.white : mflColors.text }}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Templates */}
      <View className="gap-2">
        <View>
          <AppText className="text-lg font-bold text-foreground">Choose a Template</AppText>
          <AppText className="text-sm text-muted">
            Pick a pre-configured league format to get started quickly.
          </AppText>
        </View>

        {TEMPLATES.map((template) => (
          <Pressable
            key={template.id}
            onPress={() => handleSelectTemplate(template.id)}
            className="rounded-xl p-4"
            style={{
              backgroundColor: mflColors.white,
              borderWidth: 1,
              borderColor:
                data.template === template.id ? mflColors.brand : mflColors.border,
            }}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Feather name="award" size={18} color={mflColors.brand} />
              <AppText className="text-base font-bold text-foreground">
                {template.title}
              </AppText>
            </View>
            <AppText className="text-xs text-muted mb-3">{template.subtitle}</AppText>

            <View className="flex-row gap-2 mb-3">
              <StatBadge icon="calendar" value={template.duration} label="Days" />
              <StatBadge icon="activity" value={template.activities} label="Activities" />
              <StatBadge icon="target" value={template.challenges} label="Challenges" />
              <StatBadge icon="coffee" value={template.restDays} label="Rest/wk" />
            </View>

            <View className="flex-row flex-wrap gap-1.5">
              {template.activityList.map((activity) => (
                <View
                  key={activity}
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: mflColors.brandLight }}
                >
                  <AppText
                    className="text-[11px] font-medium"
                    style={{ color: mflColors.brand }}
                  >
                    {activity}
                  </AppText>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </View>

      {/* Clone option */}
      <Pressable
        onPress={() => setShowClone(!showClone)}
        className="flex-row items-center justify-center gap-2 py-3 rounded-xl"
        style={{
          borderWidth: 1,
          borderColor: mflColors.border,
          backgroundColor: mflColors.white,
        }}
      >
        <Feather name="copy" size={16} color={mflColors.textMuted} />
        <AppText className="text-sm font-medium text-foreground">
          Clone a Previous League
        </AppText>
      </Pressable>

      {showClone && (
        <View className="gap-2">
          {loadingClone && (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color={mflColors.brand} />
              <AppText className="text-xs text-muted mt-1">Loading your leagues...</AppText>
            </View>
          )}
          {!loadingClone && cloneLeagues.length === 0 && (
            <AppText className="text-sm text-muted text-center py-4">
              No previous leagues found to clone.
            </AppText>
          )}
          {!loadingClone &&
            cloneLeagues.map((league) => (
              <Pressable
                key={league.league_id}
                onPress={() => handleClone(league.league_id)}
                className="flex-row items-center justify-between p-3 rounded-xl"
                style={{
                  backgroundColor: mflColors.white,
                  borderWidth: 1,
                  borderColor: mflColors.border,
                }}
              >
                <View>
                  <AppText className="text-sm font-medium text-foreground">
                    {league.league_name}
                  </AppText>
                  <AppText className="text-xs text-muted">
                    {league.num_teams} teams · {league.rest_days} total rest days
                  </AppText>
                </View>
                <Feather name="copy" size={14} color={mflColors.textMuted} />
              </Pressable>
            ))}
        </View>
      )}
    </View>
  );
}

function StatBadge({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View
      className="flex-1 items-center p-2 rounded-lg"
      style={{ backgroundColor: mflColors.inkLight }}
    >
      <Feather name={icon} size={14} color={mflColors.brand} />
      <AppText className="text-base font-bold text-foreground mt-0.5">{value}</AppText>
      <AppText className="text-[10px] text-muted">{label}</AppText>
    </View>
  );
}
