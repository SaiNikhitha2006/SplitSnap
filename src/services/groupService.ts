import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_GROUP_MEMBERS = [
  'Sai',
  'Rahul',
  'Priya',
  'Arjun',
  'Sneha',
];

const STORAGE_KEY = '@splitsnap_group_members';

/**
 * Get all group members.
 *
 * If no group has been saved yet,
 * return the default demo members.
 */
export async function getGroupMembers(): Promise<
  string[]
> {
  try {
    const data =
      await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [...DEFAULT_GROUP_MEMBERS];
    }

    const members: unknown = JSON.parse(data);

    if (!Array.isArray(members)) {
      return [...DEFAULT_GROUP_MEMBERS];
    }

    return members.filter(
      (member): member is string =>
        typeof member === 'string' &&
        member.trim().length > 0,
    );
  } catch (error) {
    console.error(
      'Failed to load group members:',
      error,
    );

    return [...DEFAULT_GROUP_MEMBERS];
  }
}

/**
 * Save the complete group member list.
 */
export async function saveGroupMembers(
  members: string[],
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(members),
    );

    return true;
  } catch (error) {
    console.error(
      'Failed to save group members:',
      error,
    );

    return false;
  }
}

/**
 * Add a new member.
 *
 * Returns false if the member already exists.
 */
export async function addGroupMember(
  name: string,
): Promise<boolean> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return false;
  }

  try {
    const members =
      await getGroupMembers();

    const alreadyExists = members.some(
      (member) =>
        member.toLowerCase() ===
        trimmedName.toLowerCase(),
    );

    if (alreadyExists) {
      return false;
    }

    members.push(trimmedName);

    return await saveGroupMembers(members);
  } catch (error) {
    console.error(
      'Failed to add group member:',
      error,
    );

    return false;
  }
}

/**
 * Remove a group member.
 *
 * Existing expenses are not deleted.
 */
export async function removeGroupMember(
  name: string,
): Promise<boolean> {
  try {
    const members =
      await getGroupMembers();

    const updatedMembers =
      members.filter(
        (member) => member !== name,
      );

    if (
      updatedMembers.length ===
      members.length
    ) {
      return false;
    }

    return await saveGroupMembers(
      updatedMembers,
    );
  } catch (error) {
    console.error(
      'Failed to remove group member:',
      error,
    );

    return false;
  }
}