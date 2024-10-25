// // Import required libraries and CSS
import '../styles/home-page.css';
import { db } from '../index.html';  // Import Firestore instance
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// import * as XLSX from 'xlsx';
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm"; 

// DOM Elements
const openUploadModal = document.getElementById('openUploadModal');
const uploadModal = document.getElementById('uploadModal');
const fileInput = document.getElementById('excelFile');
const uploadButton = document.getElementById('uploadButton');
const closeUploadModal = document.getElementById('closeUploadModal');

// Show the upload modal
openUploadModal.addEventListener('click', () => {
    document.body.classList.add('modal-active');
    uploadModal.style.display = 'block';
});

// Close modal event
closeUploadModal.addEventListener('click', () => {
    document.body.classList.remove('modal-active'); // Remove modal-active class
    uploadModal.style.display = 'none'; // Hide the modal
});

// Handle file upload and process the Excel data
uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];

    if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv'))) {
        alert('Please upload a valid Excel or CSV file!');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB!');
        return;
    }

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const trainees = processTraineeData(jsonData);

        if (trainees.length > 0) {
            const collectionName = getCollectionName(trainees[0].month);
            await uploadDataToFirestore(collectionName, trainees);

            // Store the data in localStorage using the collection name as the key
            localStorage.setItem(collectionName, JSON.stringify(trainees));

            // Redirect to the table page
            window.location.href = 'table.html';
        } else {
            alert('No valid trainee data found!');
        }
    } catch (err) {
        console.error('Error processing file:', err);
        alert('Error uploading data.');
    }
});

// Extract Month-Year collection name
function getCollectionName(month) {
    const year = new Date().getFullYear();
    return `${month.toLowerCase()}-${year}`;
}

// Process Excel data into structured objects
function processTraineeData(data) {
    const trainees = [];
    let currentBatch = "", certLevel = "", month = "";

    data.forEach((row) => {
        if (row["Batch Name"]) currentBatch = row["Batch Name"];
        if (row["Certification Level"]) certLevel = row["Certification Level"];
        if (row["Month"]) month = row["Month"];
        if (!row["Trainee Name"]) return; // Skip if no trainee name

        const trainee = {
            traineeName: row["Trainee Name"],
            batchName: currentBatch,
            certificationLevel: certLevel,
            month: month,
            du: row["DU"] || "",
            avgAttendance: row["Avg Attendance Percentage"] || 0,
            evaluations: extractEvaluations(row) // Extract evaluations from the row
        };

        trainees.push(trainee);
    });

    return trainees;
}

// Extract evaluations for each trainee
function extractEvaluations(row) {
    const evaluations = [];

    for (let i = 1; i <= 9; i++) {
        const evalNo = `E${i}`;
        const evaluation = row[evalNo];

        if (evaluation) {
            evaluations.push({
                evaluationNo: evalNo,
                evaluationDate: row[`Date ${evalNo}`] || "N/A",
                evaluationName: row[`Name ${evalNo}`] || "N/A",
                evaluationScore: evaluation
            });
        }
    }

    return evaluations;
}

// Upload structured data to Firestore
async function uploadDataToFirestore(collectionName, trainees) {
    const colRef = collection(db, collectionName);

    for (const trainee of trainees) {
        try {
            await addDoc(colRef, trainee);
            console.log(`Uploaded ${trainee.traineeName} to Firestore.`);
        } catch (err) {
            console.error(`Error uploading ${trainee.traineeName}:`, err);
        }
    }
}
