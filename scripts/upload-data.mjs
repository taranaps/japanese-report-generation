import { db } from "./firebaseConfig.mjs";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import * as XLSX from '../node_modules/xlsx/xlsx.mjs';

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

        const trainees = processTraineeData(sheet, jsonData);

        if (trainees.length > 0) {
            const collectionName = getCollectionName(trainees[0].month);
            await uploadDataToFirestore(collectionName, trainees);

            // Store the data in localStorage using the collection name as the key
            localStorage.setItem(collectionName, JSON.stringify(trainees));

            // Redirect to the table page - trial
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

// Convert Excel dates to JavaScript Date objects
function convertExcelDate(excelDate) {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return new Date(date.y, date.m - 1, date.d); // JavaScript months are 0-indexed
}

// Process Excel data into structured objects
function processTraineeData(sheet, data) {
    const trainees = [];
    let currentBatch = "", certLevel = "", month = "";

    // Dynamically locate key rows for evaluations
    let { evalNumbers, evalDates, evalNames } = locateEvaluationRows(data);

    // Ensure evalNumbers, evalDates, evalNames are arrays
    evalNumbers = Array.isArray(evalNumbers) ? evalNumbers : Object.values(evalNumbers || {});
    evalDates = Array.isArray(evalDates) ? evalDates : Object.values(evalDates || {});
    evalNames = Array.isArray(evalNames) ? evalNames : Object.values(evalNames || {});

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
            evaluations: extractEvaluations(row, evalNumbers, evalDates, evalNames)  // Updated call
        };

        trainees.push(trainee);
    });

    return trainees;
}

function locateEvaluationRows(data) {
    let evalNumbers, evalDates, evalNames;

    data.forEach((row, index) => {
        const rowValues = Object.values(row)
            .map(val => val.toString().trim().toLowerCase()); // Trim and lowercase all values

        // Check for the presence of keywords in the row values
        if (rowValues.some(val => val.includes("evaluation no"))) {
            evalNumbers = row;
        } else if (rowValues.some(val => val.includes("date"))) {
            evalDates = row;
        } else if (rowValues.some(val => val.includes("evaluation name"))) {
            evalNames = row;
        }
    });

    // If any row is not found, log a warning and assign empty objects to prevent crashes
    if (!evalNumbers || !evalDates || !evalNames) {
        console.warn("Some evaluation rows could not be located. Check the sheet format.");
        return {
            evalNumbers: evalNumbers || {},
            evalDates: evalDates || {},
            evalNames: evalNames || {},
        };
    }

    return { evalNumbers, evalDates, evalNames };
}


// Extract evaluations for each trainee
function extractEvaluations(row, evalNumbers, evalDates, evalNames) {
    const evaluations = [];

    // Get evaluation keys dynamically
    const evaluationKeys = Object.keys(row).filter(key => key.startsWith('__EMPTY'));

    const validEvalNumbers = evalNumbers
        .filter(num => typeof num === 'string' && num.trim() !== '' && !num.toLowerCase().includes("evaluation no"))
        .map(num => num.trim());  

    const validEvalDates = evalDates
        .filter(num => typeof num === 'number' && !isNaN(num))
        .map(num => convertExcelDate(num));  

    const validEvalNames = evalNames
        .filter(num => typeof num === 'string' && num.trim() !== '' && !num.toLowerCase().includes("evaluation name"))
        .map(num => num.trim());  

    evaluationKeys.forEach((key, index) => {
        const evalNo = validEvalNumbers[index] || `Evaluation ${index + 1}`; 
        const score = row[key] !== undefined ? row[key].toString().trim() : "Absent";
        const evaluationDate = validEvalDates[index] ? validEvalDates[index].toLocaleDateString() : "N/A";
        const evaluationName = validEvalNames[index] || "N/A";

        evaluations.push({
            evaluationNo: evalNo,  
            evaluationDate: evaluationDate,
            evaluationName: evaluationName,
            evaluationScore: score
        });
        console.log('---Evaluation:', {
                        evaluationNo: evalNo,
                        evaluationDate: evaluationDate,
                        evaluationName: evalNames[index],
                        evaluationScore: score
                    });
    });

    return evaluations;
}

// Upload structured data to Firestore
async function uploadDataToFirestore(collectionName, trainees) {
    const colRef = collection(db, collectionName);

    for (const trainee of trainees) {
        try {
            console.log('Uploading Trainee Data:', trainee); // Debugging
            await addDoc(colRef, trainee);
            console.log(`Uploaded ${trainee.traineeName} to Firestore.`);
        } catch (err) {
            console.error(`Error uploading ${trainee.traineeName}:`, err);
        }
    }
}

