import { Client, Databases } from 'node-appwrite';
import appwriteConfig from '../config/appwriteConfig';

const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.apiKey);

const databases = new Databases(client);

export const createClientDatabaseAndCollections = async (clientId, dbName) => {
    try {
        // Créer la base de données
        const database = await databases.createDatabase(dbName, `${dbName} Database`);

        // ID de la nouvelle base de données
        const databaseId = database.$id;

        // Créer la collection Boutiques
        await databases.createCollection(databaseId, 'Boutiques', 'Boutiques Collection', [
            {
                type: 'string',
                key: 'Nom',
                size: 256,
                required: true,
            },
        ]);

        // Créer la collection Tissus
        await databases.createCollection(databaseId, 'Tissus', 'Tissus Collection', [
            {
                type: 'string',
                key: 'Nom',
                size: 256,
                required: true,
            },
            {
                type: 'enum',
                key: 'Unite',
                elements: ['m', 'y'],
                required: true,
            },
        ]);

        console.log(`Database and collections created successfully for client: ${clientId}`);
    } catch (error) {
        console.error('Error creating database and collections:', error);
    }
};
