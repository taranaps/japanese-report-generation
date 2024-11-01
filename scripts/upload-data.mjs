import { db } from "./firebaseConfig.mjs";
import { collection, addDoc, doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import * as XLSX from '../node_modules/xlsx/xlsx.mjs';

// DOM Elements
const openUploadModal = document.getElementById('openUploadModal');
const uploadModal = document.getElementById('uploadModal');
const fileInput = document.getElementById('excelFile');
const uploadButton = document.getElementById('uploadButton');
const closeUploadModal = document.getElementById('closeUploadModal');

const messageModal = document.getElementById('messageModal');
const messageContent = document.getElementById('messageContent');
const closeMessageModal = document.getElementById('closeMessageModal');
const tableButton = document.getElementById('tableButton');
const reportButton = document.getElementById('reportButton');
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

// Redirect to table.html
tableButton.addEventListener('click', () => {
    window.location.href = 'table.html';
});

// Redirect to report-content.html
reportButton.addEventListener('click', () => {
    window.location.href = 'report-content.html';
});

// Close message modal
closeMessageModal.addEventListener('click', () => {
    messageModal.style.display = 'none';
});

// Handle file upload and process the Excel data
uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];

    if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv'))) {
        showMessageModal('Please upload a valid Excel or CSV file!', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showMessageModal('File size exceeds 10MB!', 'error');
        return;
    }

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const validationResult = validateData(jsonData);
        if (validationResult.isValid) {
            const trainees = processTraineeData(sheet, jsonData);
            const collectionName = getCollectionName(trainees[0].month);
            await uploadDataToFirestore(collectionName, trainees);
            await updateMetaCollection(collectionName);
            showMessageModal('File was successfully uploaded!', 'success');
        } else {
            showMessageModal(validationResult.errorMessage, 'error');
        }
    } catch (err) {
        console.error('Error processing file:', err);
        showMessageModal('Error uploading data. Please try again.', 'error');
    }
});

// Function to show the success/error modal
function showMessageModal(message, type) {
    messageContent.textContent = message;
    messageContent.className = type; // Apply either "success" or "error" style
    messageModal.style.display = 'block';
}

// Extract Month-Year collection name
function getCollectionName(month) {
    const year = new Date().getFullYear();
    return `${month.toLowerCase()}-${year}`;
}

// Validate the uploaded data against the specified rules
function validateData(data) {
    const expectedHeaders = [
        'Trainer Name', 'Batch Name', 'Number of Sessions Till Date', 'Number of Sessions (Month)',
        'Batch Duration Till Date', 'Batch Duration (Month)', 'Certification Level', 'Month',
        'Trainee Name', 'DU', 'Avg Attendance Percentage', 'Evaluation'
    ];

    // Check headers
    const headers = Object.keys(data[0]);
    for (const header of expectedHeaders) {
        if (!headers.includes(header)) {
            return { isValid: false, errorMessage: `Missing header: ${header}` };
        }
    }

    // Ensure the sub-headers under 'Evaluation' exist
    // const evaluationSubHeaders = ['Evaluation No', 'Date', 'Evaluation Name'];
    // const evaluationHeadersPresent = evaluationSubHeaders.every(subHeader => headers.includes(subHeader));
    // if (!evaluationHeadersPresent) {
    //     return { isValid: false, errorMessage: `Missing evaluation sub-headers. Please check the 'Evaluation' section.` };
    // }

    // Validation rules
    for (let row of data) {
        if (row['Batch Name'] && !/^Batch \d+$/.test(row['Batch Name'])) {
            return { isValid: false, errorMessage: `Invalid Batch Name format for '${row['Batch Name']}'. Expected format: 'Batch [num]'` };
        }

        if (row['Certification Level'] && !/^(N[1-5])$/.test(row['Certification Level'])) {
            return { isValid: false, errorMessage: `Invalid Certification Level: '${row['Certification Level']}'. Expected values: N1, N2, N3, N4, N5` };
        }

        if (row['Month'] && !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(row['Month'])) {
            return { isValid: false, errorMessage: `Invalid Month: '${row['Month']}'. Expected a month name.` };
        }

        if (row['DU'] && !/^DU \d+$/.test(row['DU'])) {
            return { isValid: false, errorMessage: `Invalid DU format: '${row['DU']}'. Expected format: 'DU [num]' where num is from 1 to 6` };
        }

        if (row['Avg Attendance Percentage'] && (row['Avg Attendance Percentage'] < 1 || row['Avg Attendance Percentage'] > 100)) {
            return { isValid: false, errorMessage: `Avg Attendance Percentage must be between 1 and 100.` };
        }

        // // Evaluation section validation
        // if (row['Evaluation']) {
        //     const evaluationNumber = row['Evaluation No'];
        //     const evaluationDate = row['Date'];
        //     const evaluationName = row['Evaluation Name'];

        //     if (evaluationNumber && !/^E \d+$/.test(evaluationNumber)) {
        //         return { isValid: false, errorMessage: `Invalid Evaluation No: '${evaluationNumber}'. Expected format: 'E [num]'` };
        //     }

        //     if (evaluationDate && !isValidDate(evaluationDate, row['Month'])) {
        //         return { isValid: false, errorMessage: `Invalid Date: '${evaluationDate}'. Expected format: 'DD/MM/YYYY' with the month matching '${row['Month']}'` };
        //     }

        //     // Check for required values in the evaluation columns
        //     if ((evaluationName && !evaluationDate) || (evaluationDate && !evaluationName)) {
        //         return { isValid: false, errorMessage: `If Evaluation Name is provided, Date must also be provided and vice versa.` };
        //     }
        // }

        // Check if Trainee Name has corresponding values in all columns
        // if (row['Trainee Name'] && Object.values(row).some(value => value === "")) {
        //     return { isValid: false, errorMessage: `All fields for trainee '${row['Trainee Name']}' must have values.` };
        // }
    }

    return { isValid: true };
}

// Check if the date is valid and matches the month
function isValidDate(dateString, expectedMonth) {
    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) return false;

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
    const year = parseInt(dateParts[2]);

    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day && isSameMonth(date, expectedMonth);
}

// Check if the date month matches the expected month
function isSameMonth(date, expectedMonth) {
    const monthNames = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    return monthNames[date.getMonth()] === expectedMonth;
}

// Convert Excel dates to JavaScript Date objects
function convertExcelDate(excelDate) {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return new Date(date.y, date.m - 1, date.d); // JavaScript months are 0-indexed
}

// Process Excel data into structured objects
function processTraineeData(sheet, data) {
    const trainees = [];
    let currentBatch = "", certLevel = "", month = "", trainerNames = [],
        nOfSessionsTillDate = "", nOfSessionsMonth = "", batchDurTillDate = "", batchDurMonth = "";

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
        if (row["Trainer Name"]) {
            // Handle merged cells for trainer names
            trainerNames = row["Trainer Name"].split(",").map(name => name.trim());
        }
        if (row["Number of Sessions Till Date"]) nOfSessionsTillDate = row["Number of Sessions Till Date"];
        if (row["Number of Sessions (Month)"]) nOfSessionsMonth = row["Number of Sessions (Month)"];
        if (row["Batch Duration Till Date"]) batchDurTillDate = row["Batch Duration Till Date"];
        if (row["Batch Duration (Month)"]) batchDurMonth = row["Batch Duration (Month)"];
        if (!row["Trainee Name"]) return; // Skip if no trainee name

        const trainee = {
            traineeName: row["Trainee Name"],
            batchName: currentBatch,
            certificationLevel: certLevel,
            month: month,
            du: row["DU"] || "",
            avgAttendance: row["Avg Attendance Percentage"] || 0,
            trainerName: trainerNames, // Store trainer names as an array
            numberOfSessionsTillDate: parseInt(nOfSessionsTillDate) || 0,
            numberOfSessionsMonth: parseInt(nOfSessionsMonth) || 0,
            batchDurationTillDate: parseFloat(batchDurTillDate) || 0,
            batchDurationMonth: parseFloat(batchDurMonth) || 0,
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

    // Check if collection with same data already exists
    const existingDocsSnapshot = await getDocs(colRef);
    const existingDocs = existingDocsSnapshot.docs.map(doc => doc.data());

    // Convert trainees and existingDocs to JSON strings for comparison
    const newData = JSON.stringify(trainees);
    const existingData = JSON.stringify(existingDocs);

    if (existingDocs.length > 0) {
        if (newData === existingData) {
            console.log("No changes detected, skipping upload.");
            return;
        } else {
            // Delete existing docs before replacing with new ones
            for (const docSnapshot of existingDocsSnapshot.docs) {
                await deleteDoc(docSnapshot.ref);
            }
            console.log("Replaced existing documents in the collection.");
        }
    }

    for (const trainee of trainees) {
        try {
            // Rename document to `batch-name-trainee-name`
            const docName = `${trainee.batchName.replace(/\s+/g, "-").toLowerCase()}-${trainee.traineeName.replace(/\s+/g, "-").toLowerCase()}`;
            const docRef = doc(colRef, docName);
            await setDoc(docRef, trainee);
            console.log(`Uploaded ${trainee.traineeName} to Firestore.`);
        } catch (err) {
            console.error(`Error uploading ${trainee.traineeName}:`, err);
        }
    }
}

// Function to update meta collection
async function updateMetaCollection(collectionName) {
    const metaDocRef = doc(db, 'meta', 'collections');
    const metaDoc = await getDoc(metaDocRef);

    if (metaDoc.exists()) {
        // If the meta document exists, update the collection names
        await updateDoc(metaDocRef, {
            names: arrayUnion(collectionName) // Use arrayUnion to avoid duplicates
        });
    } else {
        // If the meta document doesn't exist, create it with the collection name
        await setDoc(metaDocRef, {
            names: [collectionName]
        });
    }
}

// Remove a collection and update meta document
async function deleteCollectionAndMeta(collectionName) {
    const colRef = collection(db, collectionName);
    const existingDocsSnapshot = await getDocs(colRef);

    for (const docSnapshot of existingDocsSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
    }

    // Update 'meta' collection to remove collection name
    const metaDocRef = doc(db, 'meta', 'collections');
    await updateDoc(metaDocRef, {
        names: arrayRemove(collectionName)
    });
    console.log(`Deleted collection: ${collectionName} and removed from meta.`);
}