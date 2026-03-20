import type { Account, Databases } from 'appwrite';
import { ID, Permission, Query, Role } from 'appwrite';

declare const client: unknown;

export const databases: Databases;
export const account: Account;
export { ID, Permission, Query, Role };
export default client;
