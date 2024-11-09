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

        console.log("jsonData ka trainees:", jsonData); // View initial parsed data

         // Preliminary validation for merged cell fields
        //  const rawValidationResult = validateRawData(jsonData);
        //  if (!rawValidationResult.isValid) {
        //      showMessageModal(rawValidationResult.errorMessage, 'error');
        //      return;
        //  }
 

        // Process data into structured format
        const trainees = processTraineeData(sheet, jsonData);

        console.log("processtrainee eventlistner ka trainees:", trainees);

        const validationResult = validateData(trainees);

        console.log("validationResult ka trainees:", validationResult); // Check if data validation passed or failed

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

// Validate raw data before processing trainee data
// function validateRawData(rawData) {
//     const requiredFields = [
//         "Batch Name", "Trainer Name", "Number of Sessions Till Date",
//         "Number of Sessions (Month)", "Batch Duration Till Date",
//         "Batch Duration (Month)", "Month", "Certification Level"
//     ];

//     for (const row of rawData) {
//         for (const field of requiredFields) {
//             if (!row[field]) {
//                 return { isValid: false, errorMessage: `Field '${field}' cannot be empty.` };
//             }
//         }
//     }
//     return { isValid: true };
// }

// Validate the uploaded data against the specified rules
function validateData(trainees) {
    // Check if all trainee objects contain the required fields
    const requiredHeaders = [
        'traineeName', 'batchName', 'numberOfSessionsTillDate', 'numberOfSessionsMonth',
        'batchDurationTillDate', 'batchDurationMonth', 'certificationLevel', 'month',
        'du', 'avgAttendance', 'evaluations'
    ];

    const validScores = ['A', 'B', 'C', 'D', 'F', 'Absent', 'N/A'];
    const validEvaluationNumbers = /^E\d+$/;
    const validBatchNamePattern = /^Batch \d+$/;

    // 1. Check if all headers are present
    const keys = Object.keys(trainees[0] || {});
    for (const header of requiredHeaders) {
        if (!keys.includes(header)) {
            return { isValid: false, errorMessage: `Missing header: ${header}` };
        }
    }

    for (const trainee of trainees) {

        // Validate that batchName is not empty and follows "Batch X" format
        if (!trainee.batchName || !validBatchNamePattern.test(trainee.batchName)) {
            return { isValid: false, errorMessage: `Batch Name is required and must follow the format 'Batch X' where X is a number. Invalid Batch Name: '${trainee.batchName}' for trainee: ${trainee.traineeName}.` };
        }

        // Check for empty fields (other than evaluations)
        if (trainee.traineeName) {
            for (const field of requiredHeaders) {
                if (!trainee[field] && field !== 'evaluations') {
                    return { isValid: false, errorMessage: `Field ${field} cannot be empty for trainee: ${trainee.traineeName}` };
                }
            }
        }

        // Evaluation-specific validation
        for (const evaluation of trainee.evaluations || []) {
            if (!validEvaluationNumbers.test(evaluation.evaluationNo)) {
                return { isValid: false, errorMessage: `Invalid Evaluation Number '${evaluation.evaluationNo}' for trainee: ${trainee.traineeName}. Expected format: E1, E2, ...` };
            }

            if (evaluation.evaluationName && (!evaluation.evaluationScore || !validScores.includes(evaluation.evaluationScore))) {
                return { isValid: false, errorMessage: `Invalid or missing score for Evaluation Name: '${evaluation.evaluationName}' of trainee: ${trainee.traineeName}. Expected scores: ${validScores.join(", ")}.` };
            }

            if (!evaluation.evaluationName && evaluation.evaluationScore) {
                return { isValid: false, errorMessage: `Evaluation Score provided without an Evaluation Name for trainee: ${trainee.traineeName}.` };
            }
        }

        // Additional validations (example: Certification Level format)
        if (!/^(N[1-5])$/.test(trainee.certificationLevel)) {
            return { isValid: false, errorMessage: `Invalid Certification Level: '${trainee.certificationLevel}'. Expected values: N1, N2, N3, N4, N5.` };
        }

        if (trainee.month && !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(trainee.month)) {
            return { isValid: false, errorMessage: `Invalid Month: '${trainee.month}'. Expected a valid month name.` };
        }

        if (!/^DU \d+$/.test(trainee.du)) {
            return { isValid: false, errorMessage: `Invalid DU format: '${trainee.du}'. Expected format: 'DU [num]' where num is from 1 to 6.` };
        }

        if (trainee.avgAttendance < 1 || trainee.avgAttendance > 100) {
            return { isValid: false, errorMessage: `Avg Attendance Percentage must be between 1 and 100.` };
        }

        // Ensure 'Batch duration (month)' < 'Batch Duration Till Date'
        if (trainee.batchDurationMonth >= trainee.batchDurationTillDate) {
            return { isValid: false, errorMessage: `Batch Duration (Month) should be less than Batch Duration Till Date for trainee: ${trainee.traineeName}.` };
        }

        // Ensure 'Number of Sessions (month)' < 'Number of Sessions Till Date'
        if (trainee.numberOfSessionsMonth >= trainee.numberOfSessionsTillDate) {
            return { isValid: false, errorMessage: `Number of Sessions (Month) should be less than Number of Sessions Till Date for trainee: ${trainee.traineeName}.` };
        }

        // Check for integers in 'Number of Sessions' fields
        if (!Number.isInteger(trainee.numberOfSessionsMonth) || !Number.isInteger(trainee.numberOfSessionsTillDate)) {
            return { isValid: false, errorMessage: `Number of Sessions fields should be integers for trainee: ${trainee.traineeName}.` };
        }

        // Ensure 'Number of Sessions' and 'Batch Duration' fields are non-zero
        if (trainee.numberOfSessionsMonth <= 0 || trainee.numberOfSessionsTillDate <= 0 || trainee.batchDurationMonth <= 0 || trainee.batchDurationTillDate <= 0) {
            return { isValid: false, errorMessage: `Number of Sessions and Batch Duration fields cannot be 0 or empty for trainee: ${trainee.traineeName}.` };
        }
    }

    // Check for consistent 'Month' value
    const monthValue = trainees[0]?.month;
    for (const trainee of trainees) {
        if (trainee.month !== monthValue) {
            return { isValid: false, errorMessage: `All trainees must have the same 'Month' value.` };
        }
    }

    return { isValid: true };
}

// Process Excel data into structured objects
function processTraineeData(sheet, data) {
    const trainees = [];
    let currentBatch = "", certLevel = "", month = "", trainerNames = [],
        nOfSessionsTillDate = "", nOfSessionsMonth = "", batchDurTillDate = "", batchDurMonth = "";

    let { evalNumbers, evalNames } = locateEvaluationRows(data);

    evalNumbers = Array.isArray(evalNumbers) ? evalNumbers : Object.values(evalNumbers || {});
    evalNames = Array.isArray(evalNames) ? evalNames : Object.values(evalNames || {});

    data.forEach((row) => {
        if (row["Batch Name"]) currentBatch = row["Batch Name"];
        if (row["Certification Level"]) certLevel = row["Certification Level"];
        if (row["Month"]) month = row["Month"];
        if (row["Trainer Name"]) {
            trainerNames = row["Trainer Name"].split(",").map(name => name.trim());
        }
        if (row["Number of Sessions Till Date"]) nOfSessionsTillDate = row["Number of Sessions Till Date"];
        if (row["Number of Sessions (Month)"]) nOfSessionsMonth = row["Number of Sessions (Month)"];
        if (row["Batch Duration Till Date"]) batchDurTillDate = row["Batch Duration Till Date"];
        if (row["Batch Duration (Month)"]) batchDurMonth = row["Batch Duration (Month)"];
        if (!row["Trainee Name"]) return; 

        const trainee = {
            traineeName: row["Trainee Name"] || "",
            batchName: currentBatch || "",
            certificationLevel: certLevel || "",
            month: month || "",
            du: row["DU"] || "",
            avgAttendance: row["Avg Attendance Percentage"] || 0,
            trainerName: trainerNames || "", 
            numberOfSessionsTillDate: parseInt(nOfSessionsTillDate) || 0,
            numberOfSessionsMonth: parseInt(nOfSessionsMonth) || 0,
            batchDurationTillDate: parseFloat(batchDurTillDate) || 0,
            batchDurationMonth: parseFloat(batchDurMonth) || 0,
            evaluations: extractEvaluations(row, evalNumbers, evalNames) 
        };

        trainees.push(trainee);
    });

    console.log("processTraineeData ka trainees:", trainees); 

    return trainees;
}

function locateEvaluationRows(data) {
    let evalNumbers, evalNames;

    data.forEach((row, index) => {
        const rowValues = Object.values(row)
            .map(val => val.toString().trim().toLowerCase()); 

        if (rowValues.some(val => val.includes("evaluation no"))) {
            evalNumbers = row;
        } 
        else if (rowValues.some(val => val.includes("evaluation name"))) {
            evalNames = row;
        }
    });

    if (!evalNumbers || !evalNames) {
        console.warn("Some evaluation rows could not be located. Check the sheet format.");
        return {
            evalNumbers: evalNumbers || {},
            evalNames: evalNames || {},
        };
    }

    return { evalNumbers, evalNames };
}


// Extract evaluations for each trainee
function extractEvaluations(row, evalNumbers, evalNames) {
    const evaluations = [];

    const evaluationKeys = Object.keys(row).filter(key => key.startsWith('__EMPTY'));

    const validEvalNumbers = evalNumbers
        .filter(num => typeof num === 'string' && num.trim() !== '' && !num.toLowerCase().includes("evaluation no"))
        .map(num => num.trim());

    const validEvalNames = evalNames
        .filter(num => typeof num === 'string' && num.trim() !== '' && !num.toLowerCase().includes("evaluation name"))
        .map(num => num.trim());

    evaluationKeys.forEach((key, index) => {
        const evalNo = validEvalNumbers[index] || `Evaluation ${index + 1}`;
        const score = row[key] !== undefined ? row[key].toString().trim() : "Empty";
        const evaluationName = validEvalNames[index];

        evaluations.push({
            evaluationNo: evalNo || "",
            evaluationName: evaluationName || "",
            evaluationScore: score || ""
        });
        console.log('---Evaluation:', {
            evaluationNo: evalNo,
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
            showMessageModal('Replaced existing documents in the collection.', 'success');
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