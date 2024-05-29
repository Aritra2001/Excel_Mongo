const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

const allowedOrigins = [
    'https://excel-mongo.vercel.app'
];

app.use(cors({
    origin:function(origin,callback){
        if(allowedOrigins.indexOf(origin)!== -1 || !origin){
            callback(null,true);
        }
        else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials:true,
}))

app.use(express.json())

// Multer setup for handling file uploads
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;

    // Read the Excel file from the buffer
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const dataArray = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Assuming the first row contains the column headers
    const headerRow = dataArray[0];

    // Find the index of the "Names" column
    const namesColumnIndex = headerRow.indexOf('Name');

    // Prepare data for MongoDB insertion
    const dataToInsert = dataArray.slice(1).map(row => {
      const rowData = {};
      headerRow.forEach((header, index) => {
        if (index === namesColumnIndex && row[index]) {
          // Convert only the "Names" column to uppercase
          rowData[header] = row[index].toUpperCase();
        } else {
          rowData[header] = row[index];
        }
      });
      return rowData;
    });

    // Call the function to insert data into MongoDB
    await insertDataIntoMongoDB(dataToInsert);

    res.status(200).send('File uploaded and data inserted into MongoDB.');
  } catch (error) {
    console.error('Error processing file and inserting data:', error);
    res.status(500).send('Error processing file and inserting data.');
  }
});

async function insertDataIntoMongoDB(data) {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection('student_data'); // Replace with your actual collection name

    // Insert data into MongoDB
    const result = await collection.insertMany(data);
    var count  = 0
    const documentId = 1;
    await collection.insertOne({count: count + 1, _id: 1})

    console.log(`${result.insertedCount} documents inserted into MongoDB`);
  } finally {
    await client.close();
  }
}

app.post('/emptycollection', async( req, res) => {
  const client = new MongoClient(process.env.MONGO_URI)
  
  try {
    const database = client.db();
    const collection = database.collection('student_data');
    
    await collection.deleteMany({});
    client.close();
    res.status(200).json('Collection Emptied Successfully');

  } catch (error) {
    console.log(error);
    res.status(400).json(error.message)
  }
})

app.post('/addInstuctor', async (req, res) => {
  
  const client = new MongoClient(process.env.MONGO_URI);
  const { name, courseName } = req.body;

  try {
    const database = client.db();
    const collection = database.collection('student_data');

    const instuctor_name = await collection.findOne({ name });
    const cname = await collection.findOne({ courseName });

    if(instuctor_name) {
      throw Error('Instuctor already exits');
    }
    if(cname) {
      throw Error('Course name already exits');
    }
    
    await collection.insertOne({ name, courseName, _id: 'CS_Name' });
    res.status(200).json({message: 'Couse name and Instructor name added!'});
  }
  catch(error) {
    res.status(400).json({error:  error.message});
  }
  finally {
    await client.close();
  }
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
