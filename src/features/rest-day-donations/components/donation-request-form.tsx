import Feather from '@expo/vector-icons/Feather';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type {
  PickedDonationProof,
  RestDayDonationMember,
} from '../types/rest-day-donation.model';
import {
  getFilteredMembers,
  getProofNameFromUri,
  getTeamOptions,
  inferProofMimeType,
  normalizedTeamName,
} from '../utils/rest-day-donation-utils';

const MAX_PROOF_BYTES = 10 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

interface Props {
  members: RestDayDonationMember[];
  userMemberId: string;
  isSubmitting: boolean;
  resetToken: number;
  onSubmit: (input: {
    receiverMemberId: string;
    daysTransferred: number;
    notes?: string;
    proofFile: PickedDonationProof;
  }) => void;
}

function SelectableChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border px-3 py-2"
      style={{
        backgroundColor: selected ? mflColors.brand : mflColors.white,
        borderColor: selected ? mflColors.brand : mflColors.border,
      }}
    >
      <AppText
        className="text-xs font-semibold"
        style={{ color: selected ? mflColors.white : mflColors.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function MemberOption({
  member,
  selected,
  onPress,
}: {
  member: RestDayDonationMember;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl border p-3"
      style={{
        backgroundColor: selected ? mflColors.brandLight : mflColors.white,
        borderColor: selected ? mflColors.brand : mflColors.border,
      }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: selected ? mflColors.brand : mflColors.surface }}
      >
        <AppText
          className="text-xs font-bold"
          style={{ color: selected ? mflColors.white : mflColors.textSub }}
        >
          {member.username.slice(0, 2).toUpperCase()}
        </AppText>
      </View>
      <View className="flex-1">
        <AppText className="text-sm font-semibold text-foreground">
          {member.username}
        </AppText>
        <AppText className="text-xs text-muted">
          {normalizedTeamName(member.teamName)}
        </AppText>
      </View>
      {selected ? <Feather name="check-circle" size={18} color={mflColors.brand} /> : null}
    </Pressable>
  );
}

export function DonationRequestForm({
  members,
  userMemberId,
  isSubmitting,
  resetToken,
  onSubmit,
}: Props) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [receiverMemberId, setReceiverMemberId] = useState('');
  const [daysText, setDaysText] = useState('1');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<PickedDonationProof | null>(null);

  useEffect(() => {
    setSelectedTeam('');
    setReceiverMemberId('');
    setDaysText('1');
    setNotes('');
    setProofFile(null);
  }, [resetToken]);

  const teamOptions = useMemo(() => getTeamOptions(members), [members]);
  const filteredMembers = useMemo(
    () =>
      getFilteredMembers(members, selectedTeam).filter(
        (member) => member.leagueMemberId !== userMemberId,
      ),
    [members, selectedTeam, userMemberId],
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to upload proof.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileName =
      asset.fileName ?? getProofNameFromUri(asset.uri, 'donation-proof');
    const inferredType = inferProofMimeType(fileName);
    const fileType =
      asset.type && asset.type.startsWith('image/')
        ? asset.type
        : inferredType;

    setProofFile({
      uri: asset.uri,
      name: fileName,
      type: ALLOWED_PROOF_TYPES.includes(fileType) ? fileType : 'image/jpeg',
    });
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (asset.size && asset.size > MAX_PROOF_BYTES) {
        Alert.alert('File Too Large', 'Proof files must be under 10MB.');
        return;
      }

      const fileType = asset.mimeType || inferProofMimeType(asset.name);
      if (!ALLOWED_PROOF_TYPES.includes(fileType)) {
        Alert.alert('Unsupported File', 'Upload a JPG, PNG, GIF, WebP, or PDF.');
        return;
      }

      setProofFile({
        uri: asset.uri,
        name: asset.name,
        type: fileType,
      });
    } catch {
      Alert.alert('File Picker Error', 'Unable to select a proof file.');
    }
  };

  const handleSubmit = () => {
    const daysTransferred = Number.parseInt(daysText, 10);

    if (!receiverMemberId || Number.isNaN(daysTransferred) || daysTransferred < 1) {
      Alert.alert(
        'Check Donation',
        'Please select a receiver and enter days to transfer.',
      );
      return;
    }

    if (!proofFile) {
      Alert.alert('Proof Required', 'Please upload proof for this donation.');
      return;
    }

    onSubmit({
      receiverMemberId,
      daysTransferred,
      notes: notes.trim() || undefined,
      proofFile,
    });
  };

  return (
    <Card className="p-4">
      <View className="gap-4">
        <View className="gap-1">
          <AppText className="text-base font-semibold text-foreground">
            Make a rest day donation
          </AppText>
          <AppText className="text-xs text-muted">
            Donate to any league member. Requires captain approval first, then governor/host approval.
          </AppText>
        </View>

        <View className="gap-2">
          <SectionLabel label="Team" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 pr-4">
              <SelectableChip
                label="All teams"
                selected={selectedTeam === 'all'}
                onPress={() => {
                  setSelectedTeam('all');
                  setReceiverMemberId('');
                }}
              />
              {teamOptions.map((team) => (
                <SelectableChip
                  key={team}
                  label={team}
                  selected={selectedTeam === team}
                  onPress={() => {
                    setSelectedTeam(team);
                    setReceiverMemberId('');
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="gap-2">
          <SectionLabel label="Receiver" />
          {!selectedTeam ? (
            <AppText className="text-sm text-muted">Select a team first.</AppText>
          ) : filteredMembers.length === 0 ? (
            <AppText className="text-sm text-muted">
              No eligible members in this team.
            </AppText>
          ) : (
            <View className="gap-2">
              {filteredMembers.map((member) => (
                <MemberOption
                  key={member.leagueMemberId}
                  member={member}
                  selected={receiverMemberId === member.leagueMemberId}
                  onPress={() => setReceiverMemberId(member.leagueMemberId)}
                />
              ))}
            </View>
          )}
        </View>

        <View className="gap-2">
          <SectionLabel label="Days to Transfer" />
          <TextInput
            value={daysText}
            onChangeText={setDaysText}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={mflColors.textMuted}
            style={{
              backgroundColor: mflColors.white,
              borderColor: mflColors.border,
              borderRadius: 12,
              borderWidth: 1,
              color: mflColors.text,
              fontSize: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          />
        </View>

        <View className="gap-2">
          <SectionLabel label="Notes (optional)" />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Reason for donation..."
            placeholderTextColor={mflColors.textMuted}
            style={{
              backgroundColor: mflColors.white,
              borderColor: mflColors.border,
              borderRadius: 12,
              borderWidth: 1,
              color: mflColors.text,
              fontSize: 14,
              minHeight: 72,
              paddingHorizontal: 14,
              paddingVertical: 12,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <View className="gap-2">
          <SectionLabel label="Proof Image or PDF" />
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="sm"
              onPress={pickImage}
              isDisabled={isSubmitting}
              className="flex-1"
            >
              <Button.Label>Image</Button.Label>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={pickPdf}
              isDisabled={isSubmitting}
              className="flex-1"
            >
              <Button.Label>PDF</Button.Label>
            </Button>
          </View>
          <AppText className="text-xs text-muted">
            Upload an image or PDF as proof for the donation request.
          </AppText>
          {proofFile ? (
            <View
              className="flex-row items-center gap-2 rounded-lg p-3"
              style={{ backgroundColor: mflColors.brandLight }}
            >
              <Feather name="paperclip" size={16} color={mflColors.brand} />
              <AppText
                className="flex-1 text-xs font-medium"
                numberOfLines={1}
                style={{ color: mflColors.brand }}
              >
                {proofFile.name}
              </AppText>
              <Pressable onPress={() => setProofFile(null)} hitSlop={8}>
                <Feather name="x" size={16} color={mflColors.brand} />
              </Pressable>
            </View>
          ) : null}
        </View>

        <Button
          variant="primary"
          size="md"
          onPress={handleSubmit}
          isDisabled={isSubmitting}
          style={{ backgroundColor: mflColors.brand }}
        >
          {isSubmitting ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Submit Request</Button.Label>
          )}
        </Button>
      </View>
    </Card>
  );
}
