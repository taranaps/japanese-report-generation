import { db } from "./firebaseConfig.mjs";
import { collection, getDocs, getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const dataTable = document.getElementById('dataTable').querySelector('tbody');
    const collectionSelect = document.getElementById('collectionSelect');
    const ctx = document.getElementById('attendanceChart1').getContext('2d'); // First chart
    const ctx2 = document.getElementById('attendanceChart2').getContext('2d'); // Second chart for batch 2
    let attendanceChart1 = null; // First chart variable
    let attendanceChart2 = null; // Second chart variable

    try {
        // Load collections into dropdown
        const collections = await getCollectionNames();
        collections.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            collectionSelect.appendChild(option);
        });

        // Add event listener to load data on collection change
        collectionSelect.addEventListener('change', async (e) => {
            const selectedCollection = e.target.value;
            await loadCollectionData(selectedCollection);
            await loadAttendanceData(selectedCollection); // Load attendance data for the bar chart
            renderBatchDurationChart(selectedCollection);
            renderSessionCountChart(selectedCollection);

        });
    } catch (error) {
        console.error("Error loading collections:", error);
        alert("Failed to load collections!");
    }

    // Retrieve collection names from meta document
    async function getCollectionNames() {
        const metaDocRef = doc(db, 'meta', 'collections');
        const metaDoc = await getDoc(metaDocRef);
        return metaDoc.exists() ? metaDoc.data().names || [] : [];
    }

    // Load and display data for the selected collection
    async function loadCollectionData(collectionName) {
        dataTable.innerHTML = '';
        try {
            const colRef = collection(db, collectionName);
            const snapshot = await getDocs(colRef);
            const trainees = snapshot.docs.map(doc => doc.data());

            if (trainees.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="7">No data available</td>`;
                dataTable.appendChild(row);
                return;
            }

            // Render rows for each trainee
            trainees.forEach(trainee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${trainee.traineeName}</td>
                    <td>${trainee.batchName}</td>
                    <td>${trainee.certificationLevel}</td>
                    <td>${trainee.month}</td>
                    <td>${trainee.du}</td>
                    <td>${trainee.avgAttendance}</td>
                    <td>${(trainee.trainerName || []).join(', ') || 'N/A'}</td>
                    <td>${trainee.numberOfSessionsTillDate || 'N/A'}</td>
                    <td>${trainee.numberOfSessionsMonth || 'N/A'}</td>
                    <td>${trainee.batchDurationTillDate || 'N/A'}</td>
                    <td>${trainee.batchDurationMonth || 'N/A'}</td>
                    <td>${renderEvaluations(trainee.evaluations)}</td>
                `;
                dataTable.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data!");
        }
    }

    // Load and display attendance data for the selected collection
    async function loadAttendanceData(collectionName) {
        try {
            const colRef = collection(db, collectionName);
            const snapshot = await getDocs(colRef);
            const trainees = snapshot.docs.map(doc => doc.data());

            // Separate data by batch
            const batch1Trainees = trainees.filter(trainee => trainee.batchName === 'Batch 1');
            const batch2Trainees = trainees.filter(trainee => trainee.batchName === 'Batch 2');

            // Prepare data for batch 1
            const labels1 = batch1Trainees.map(trainee => trainee.traineeName);
            const attendanceData1 = batch1Trainees.map(trainee => trainee.avgAttendance || 0);

            // Prepare data for batch 2
            const labels2 = batch2Trainees.map(trainee => trainee.traineeName);
            const attendanceData2 = batch2Trainees.map(trainee => trainee.avgAttendance || 0);

            // Destroy existing charts if they exist
            if (attendanceChart1) {
                attendanceChart1.destroy();
            }
            if (attendanceChart2) {
                attendanceChart2.destroy();
            }

            // Create chart for Batch 1
            attendanceChart1 = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels1,
                    datasets: [{
                        label: 'Batch 1 Average Attendance (%)',
                        data: attendanceData1,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Average Attendance (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Trainee Names'
                            }
                        }
                    }
                }
            });

            // Create chart for Batch 2
            attendanceChart2 = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels2,
                    datasets: [{
                        label: 'Batch 2 Average Attendance (%)',
                        data: attendanceData2,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Average Attendance (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Trainee Names'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error loading attendance data:", error);
            alert("Failed to load attendance data!");
        }
    }
});

// Helper function to render evaluations in a readable format
async function renderEvaluations(evaluations = []) {
    return evaluations
    .filter(e => e.evaluationName && e.evaluationName.toUpperCase() !== 'N/A')
    .map(evl => `
        <div>
            <strong>${evl.evaluationName}:</strong> ${evl.evaluationScore} 
            <em>(${evl.evaluationDate})</em>
        </div>
    `).join('');
}

// Render batch duration chart
async function renderBatchDurationChart(collectionName) {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const trainees = snapshot.docs.map(doc => doc.data());

    const batchNames = Object.keys(batchData);
    const batchDurations = batchNames.map(batchName => batchData[batchName].batchDurationMonth);

    const ctx = document.getElementById('batch-duration-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: batchNames,
            datasets: [{
                label: 'Batch Duration (Months)',
                data: batchDurations,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true },
                x: { title: { display: true, text: 'Batch Name' } },
                y: { title: { display: true, text: 'Duration (Months)' } }
            }
        }
    });
}

// Render session count chart
async function renderSessionCountChart(collectionName) {

    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const trainees = snapshot.docs.map(doc => doc.data());

    const batchNames = Object.keys(batchData);
    const sessionCounts = batchNames.map(batchName => batchData[batchName].numberOfSessionsMonth);

    const ctx = document.getElementById('session-count-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: batchNames,
            datasets: [{
                label: 'Number of Sessions (Month)',
                data: sessionCounts,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true },
                x: { title: { display: true, text: 'Batch Name' } },
                y: { title: { display: true, text: 'Sessions' } }
            }
        }
    });
}


{/* <td>${data.batchDurationTillDate || 'N/A'}</td>
                    <td>${data.batchDurationMonth || 'N/A'}</td>
                    <td>
                        <ul>
                            ${trainee.evaluations
                                .filter(e => e.evaluationName && e.evaluationName.toUpperCase() !== 'N/A')
                                .map(e => `
                                <li>
                                    ${e.evaluationNo}: ${e.evaluationDate}, ${e.evaluationName}, ${e.evaluationScore}
                                </li>
                            `).join('')}
                        </ul>
                    </td> */}