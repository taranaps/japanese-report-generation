import { db } from './firebaseConfig.mjs';
import { collection, getDocs, getDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Fetch latest collection
async function fetchLatestCollection() {
    const metaDocRef = doc(db, 'meta', 'collections');
    const metaDocSnapshot = await getDoc(metaDocRef);

    if (metaDocSnapshot.exists()) {
        const metaData = metaDocSnapshot.data();
        const collectionNames = metaData.names;

        if (collectionNames && collectionNames.length > 0) {
            // Get the last added collection name
            const latestCollectionName = collectionNames[collectionNames.length - 1];
            console.log("Latest collection name:", latestCollectionName);
            return latestCollectionName;
        } else {
            console.log("No collections found in meta.");
            return null;
        }
    } else {
        console.log("Meta document does not exist.");
        return null;
    }
}

// Render report details
async function renderReport() {
    const latestCollectionName = await fetchLatestCollection();

    if (!latestCollectionName) {
        console.error("Latest collection name is empty. Report cannot be rendered.");
        return;  // Stop further execution if latestCollectionName is empty
    }

    const collectionRef = collection(db, latestCollectionName);
    const snapshot = await getDocs(collectionRef);

    const trainerNames = new Set();
    const batchData = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        trainerNames.add(data.trainerName);
        if (!batchData[data.batchName]) {
            batchData[data.batchName] = {
                trainees: [],
                sessionsTillDate: data.numberOfSessionsTillDate,
                sessionsMonth: data.numberOfSessionsMonth,
                durationTillDate: data.batchDurationTillDate,
                durationMonth: data.batchDurationMonth,
                totalAttendance: 0,  // To accumulate attendance for average calculation
            };
        }
        batchData[data.batchName].trainees.push({
            name: data.traineeName,
            du: data.du,
            certificationLevel: data.certificationLevel,
            avgAttendance: data.avgAttendance,
            evaluations: data.evaluations,
        });
        batchData[data.batchName].totalAttendance += data.avgAttendance;
    });

    displayTrainerNames([...trainerNames]);
    displayBatches(batchData);
    renderBatchAttendanceChart(batchData);

}

function displayTrainerNames(trainerNames) {
    const trainerBox = document.getElementById('trainer-box');
    trainerBox.innerHTML = trainerNames.join(", ");
}

function displayBatches(batchData) {
    const batchesSection = document.getElementById('batches-section');
    Object.entries(batchData).forEach(([batchName, details]) => {
        const batchContainer = document.createElement('div');
        batchContainer.classList.add('batch-container');
        batchContainer.innerHTML = `
            <h3>${batchName}</h3>
            <div class="info-box">Number of Trainees: ${details.trainees.length}</div>
            <table class="trainee-table">
                <thead>
                    <tr>
                        <th>Trainee Name</th>
                        <th>DU</th>
                        <th>Certification Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.trainees.map(trainee => `
                        <tr>
                            <td>${trainee.name}</td>
                            <td>${trainee.du}</td>
                            <td>${trainee.certificationLevel}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="info-box">Sessions (Till Date): ${details.sessionsTillDate}</div>
            <div class="info-box">Sessions (Month): ${details.sessionsMonth}</div>
            <div class="info-box">Duration (Till Date): ${details.durationTillDate} hours</div>
            <div class="info-box">Duration (Month): ${details.durationMonth} hours</div>
            <canvas id="attendance-chart-${batchName}" class="chart"></canvas>
            <table class="evaluation-table">
                <thead>
                    <tr>
                        <th>Trainee Name</th>
                        <th>Evaluation Name</th>
                        <th>Date</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.trainees.flatMap(trainee => 
                        trainee.evaluations.map(evaluation => `
                            <tr>
                                <td>${trainee.name}</td>
                                <td>${evaluation.evaluationName}</td>
                                <td>${evaluation.date}</td>
                                <td>${evaluation.score}</td>
                            </tr>
                        `)
                    ).join('')}
                </tbody>
            </table>
        `;
        batchesSection.appendChild(batchContainer);
        renderAttendanceChart(`attendance-chart-${batchName}`, details.trainees);
    });
}

function renderAttendanceChart(chartId, trainees) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trainees.map(t => t.name),
            datasets: [{
                label: 'Average Attendance (%)',
                data: trainees.map(t => t.avgAttendance),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

// Render batch attendance chart for all batches
function renderBatchAttendanceChart(batchData) {
    const batchNames = Object.keys(batchData);
    const avgAttendances = batchNames.map(batchName => {
        const details = batchData[batchName];
        return details.totalAttendance / details.trainees.length;
    });

    const ctx = document.getElementById('batch-attendance-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: batchNames,
            datasets: [{
                label: 'Average Attendance by Batch (%)',
                data: avgAttendances,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", renderReport);
