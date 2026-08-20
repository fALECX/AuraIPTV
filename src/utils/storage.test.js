import { beforeEach, describe, expect, it } from 'vitest';
import { addProfile, deleteProfile, getLastUsedProfile, getStoredProfiles, setLastUsedProfile } from './storage';

describe('last-used account storage', () => {
    beforeEach(() => localStorage.clear());

    it('resolves the last successfully used saved account', async () => {
        const first = { url: 'https://one.example', username: 'one', password: 'secret-1' };
        const second = { url: 'https://two.example', username: 'two', password: 'secret-2' };
        await addProfile(first);
        await addProfile(second);
        await setLastUsedProfile(second);

        expect(await getLastUsedProfile()).toMatchObject(second);
    });

    it('clears the auto-login pointer when that account is deleted', async () => {
        const profile = { url: 'https://one.example', username: 'one', password: 'secret' };
        await addProfile(profile);
        await setLastUsedProfile(profile);
        await deleteProfile(0);

        expect(await getStoredProfiles()).toEqual([]);
        expect(await getLastUsedProfile()).toBeNull();
    });
});
