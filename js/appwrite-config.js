
const { Client, Databases, ID, Query, Account } = Appwrite;

const client = new Client()
    .setEndpoint('https://appwrite.etihadalmdina.com/v1')
    .setProject('6a0f923e00138d15d172');

const databases = new Databases(client);

const APPWRITE_DB_ID = '6a0f928a001394baa22e';
const EXAMS_COLLECTION_ID = 'exams';
const RESULTS_COLLECTION_ID = 'result';

const account = new Account(client);
window.AppwriteAccount = account;
window.AppwriteDB = databases;
window.AppwriteID = ID;
window.AppwriteQuery = Query;
window.DB_CONFIG = {
    dbId: APPWRITE_DB_ID,
    examsCol: EXAMS_COLLECTION_ID,
    resultsCol: RESULTS_COLLECTION_ID
};
