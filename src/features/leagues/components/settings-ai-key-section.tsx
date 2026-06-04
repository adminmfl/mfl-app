import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { View, TextInput, Alert, Pressable } from 'react-native';
import { Button, Card, Chip, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { api } from '../../../core/api';
import { inputStyle } from './settings-form-fields';

interface Props {
  leagueId: string;
}

export function SettingsAIKeySection({ leagueId }: Props) {
  const [keyData, setKeyData] = useState<any>(null);
  const [savedKey, setSavedKey] = useState<any>(null);
  const [providerModels, setProviderModels] = useState<Record<string, string[]>>({});
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'platform' | 'custom'>('platform');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/ai-keys?owner_type=league&owner_id=${leagueId}`);
        const json = res.data;
        setProviderModels(json.providerModels || {});
        if (json.data) {
          setKeyData(json.data);
          setProvider(json.data.provider);
          setModel(json.data.model);
          setMode('custom');
        } else if (json.savedKey) {
          setSavedKey(json.savedKey);
          setProvider(json.savedKey.provider);
          setModel(json.savedKey.model);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [leagueId]);

  const handleSave = async () => {
    if (!provider || !model || !apiKey) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/api/ai-keys', {
        owner_type: 'league',
        owner_id: leagueId,
        provider,
        model,
        api_key: apiKey,
      });
      setKeyData(res.data.data);
      setSavedKey(null);
      setApiKey('');
      setMode('custom');
      Alert.alert('Success', 'League AI key saved');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert('Remove AI Key', 'This will permanently delete the league AI key.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await api.delete(`/api/ai-keys?owner_type=league&owner_id=${leagueId}`);
            setKeyData(null);
            setSavedKey(null);
            setMode('platform');
            setProvider('');
            setModel('');
          } catch {}
          setSaving(false);
        },
      },
    ]);
  };

  const handleDeactivate = async () => {
    setSaving(true);
    try {
      await api.patch('/api/ai-keys', {
        owner_type: 'league',
        owner_id: leagueId,
        action: 'deactivate',
      });
      setSavedKey(keyData);
      setKeyData(null);
      setMode('platform');
    } catch {}
    setSaving(false);
  };

  const handleReactivate = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/api/ai-keys', {
        owner_type: 'league',
        owner_id: leagueId,
        action: 'reactivate',
      });
      setKeyData(res.data.data);
      setSavedKey(null);
      setProvider(res.data.data.provider);
      setModel(res.data.data.model);
      setMode('custom');
    } catch {}
    setSaving(false);
  };

  const providers = Object.keys(providerModels);
  const models = provider ? providerModels[provider] || [] : [];

  // Cycle through providers
  const cycleProvider = () => {
    if (providers.length === 0) return;
    const idx = providers.indexOf(provider);
    const next = providers[(idx + 1) % providers.length]!;
    setProvider(next);
    setModel('');
  };

  // Cycle through models
  const cycleModel = () => {
    if (models.length === 0) return;
    const idx = models.indexOf(model);
    const next = models[(idx + 1) % models.length]!;
    setModel(next);
  };

  if (loading) return null;

  return (
    <View className="gap-3">
      <SectionLabel label="LEAGUE AI KEY" />
      <AppText className="text-xs text-muted -mt-2">
        Set a custom AI provider key for this league, or use the platform default.
      </AppText>
      <Card className="p-4 gap-3">
        {/* Mode toggle */}
        <View className="flex-row gap-2">
          <Button
            variant={mode === 'platform' ? 'primary' : 'secondary'}
            size="sm"
            isDisabled={saving}
            onPress={() => {
              if (keyData) handleDeactivate();
              else setMode('platform');
            }}
          >
            <Button.Label>Platform Default</Button.Label>
          </Button>
          <Button
            variant={mode === 'custom' ? 'primary' : 'secondary'}
            size="sm"
            isDisabled={saving}
            onPress={() => {
              if (savedKey && !keyData) handleReactivate();
              else setMode('custom');
            }}
          >
            <Button.Label>Custom Key</Button.Label>
          </Button>
        </View>

        {/* Platform mode with saved key info */}
        {mode === 'platform' && savedKey && (
          <View className="gap-2">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.inkLight }}>
                <Chip.Label style={{ color: mflColors.text }}>
                  Saved: {savedKey.provider} / {savedKey.model}
                </Chip.Label>
              </Chip>
            </View>
            <View className="flex-row gap-2">
              <Button variant="secondary" size="sm" onPress={handleReactivate} isDisabled={saving}>
                <Button.Label>Reactivate</Button.Label>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onPress={handleRemove}
                isDisabled={saving}
              >
                <Button.Label style={{ color: mflColors.danger }}>Delete Permanently</Button.Label>
              </Button>
            </View>
          </View>
        )}

        {/* Custom mode form */}
        {mode === 'custom' && (
          <View className="gap-3">
            {/* Provider selector */}
            <View className="gap-1">
              <AppText className="text-xs text-muted">Provider</AppText>
              <Pressable
                onPress={cycleProvider}
                style={[inputStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              >
                <AppText className="text-sm" style={{ color: provider ? mflColors.text : mflColors.textMuted }}>
                  {provider || 'Select provider'}
                </AppText>
                <Feather name="chevron-down" size={14} color={mflColors.brand} />
              </Pressable>
            </View>

            {/* Model selector */}
            <View className="gap-1">
              <AppText className="text-xs text-muted">Model</AppText>
              <Pressable
                onPress={cycleModel}
                disabled={!provider}
                style={[inputStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: provider ? 1 : 0.5 }]}
              >
                <AppText className="text-sm" style={{ color: model ? mflColors.text : mflColors.textMuted }}>
                  {model || 'Select model'}
                </AppText>
                <Feather name="chevron-down" size={14} color={mflColors.brand} />
              </Pressable>
            </View>

            {/* API Key input */}
            <View className="gap-1">
              <AppText className="text-xs text-muted">API Key</AppText>
              <View className="flex-row gap-2">
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder={keyData ? 'Key saved (enter new to replace)' : 'Enter API key'}
                  placeholderTextColor={mflColors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Button variant="primary" size="sm" onPress={handleSave} isDisabled={saving} style={{ alignSelf: 'center' }}>
                  {saving ? <Spinner size="sm" /> : <Button.Label>Save</Button.Label>}
                </Button>
              </View>
            </View>

            {/* Active key info + remove */}
            {keyData && (
              <View className="flex-row items-center justify-between">
                <AppText className="text-xs text-muted">
                  Active: {keyData.provider} / {keyData.model}
                </AppText>
                <Button variant="secondary" size="sm" onPress={handleRemove} isDisabled={saving}>
                  <Button.Label style={{ color: mflColors.danger }}>Remove</Button.Label>
                </Button>
              </View>
            )}
          </View>
        )}
      </Card>
    </View>
  );
}
