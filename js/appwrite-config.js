
const { Client, Databases, ID, Query, Account, Storage } = Appwrite;

const client = new Client()
    .setEndpoint('https://appwrite.etihadalmdina.com/v1')
    .setProject('6a0f923e00138d15d172');

const databases = new Databases(client);
const storage = new Storage(client);

const APPWRITE_DB_ID = '6a0f928a001394baa22e';
const EXAMS_COLLECTION_ID = 'exams';
const RESULTS_COLLECTION_ID = 'result';
const SUMMARIES_COLLECTION_ID = 'summaries';
const ADS_COLLECTION_ID = 'ads';
const SUMMARIES_BUCKET_ID = '6a106b7a00140b147774';
const ADS_BUCKET_ID = '6a106b7a00140b147774';

const account = new Account(client);
window.AppwriteAccount = account;
window.AppwriteDB = databases;
window.AppwriteStorage = storage;
window.AppwriteID = ID;
window.AppwriteQuery = Query;
window.DB_CONFIG = {
    dbId: APPWRITE_DB_ID,
    examsCol: EXAMS_COLLECTION_ID,
    resultsCol: RESULTS_COLLECTION_ID,
    summariesCol: SUMMARIES_COLLECTION_ID,
    adsCol: ADS_COLLECTION_ID,
    summariesBucket: SUMMARIES_BUCKET_ID,
    adsBucket: ADS_BUCKET_ID
};
