import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('http://localhost:8081/v1') // Utilise le proxy local au lieu de l'URL directe
    .setProject('6839e3260032d4ce66ce');

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
