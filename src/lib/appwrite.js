import { Client, Databases, Account, ID, Permission, Query, Role, OAuthProvider } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);
export { ID, Permission, Query, Role, OAuthProvider };
export default client;
