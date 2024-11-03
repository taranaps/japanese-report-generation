import { checkAuth, logout } from './auth.js';
import { db } from "./firebaseConfig.mjs";
import { collection, getDocs, getFirestore, doc, getDoc, where, query } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Check authentication status
checkAuth();

// Attach logout function to the logout button
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout').addEventListener('click', logout);
});

//--------------------------SCROLL TEMPLATES----------------------//

const imageScroll = document.getElementById('image-scroll');
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');

// Variables to control scrolling
let scrollPosition = 0;
const scrollStep = 150; // Adjust this value to control how much the images move on each click

// Update maximum scroll based on the image container size
function updateMaxScroll() {
    const maxScroll = imageScroll.scrollHeight - imageScroll.parentElement.offsetHeight;
    return maxScroll > 0 ? maxScroll : 0;
}

// Scroll up by clicking the arrow
arrowUp.addEventListener('click', () => {
    if (scrollPosition > 0) {
        scrollPosition -= scrollStep;
        if (scrollPosition < 0) scrollPosition = 0;  // Prevent over-scrolling
        imageScroll.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
    updateArrowVisibility();
});

// Scroll down by clicking the arrow
arrowDown.addEventListener('click', () => {
    const maxScroll = updateMaxScroll();
    if (scrollPosition < maxScroll) {
        scrollPosition += scrollStep;
        if (scrollPosition > maxScroll) scrollPosition = maxScroll;  // Prevent over-scrolling
        imageScroll.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
    updateArrowVisibility();
});

// Handle manual scrolling with mouse or trackpad
imageScroll.addEventListener('scroll', () => {
    scrollPosition = imageScroll.scrollTop;
    updateArrowVisibility();
});

// Update arrow visibility based on scroll position
function updateArrowVisibility() {
    const maxScroll = updateMaxScroll();
    arrowUp.style.visibility = scrollPosition > 0 ? 'visible' : 'hidden';
    arrowDown.style.visibility = scrollPosition < maxScroll ? 'visible' : 'hidden';
}

// Initialize arrow visibility
updateArrowVisibility();

//--------------------TEMPLATE SELECTION-------------------------//
let selectedTemplate = "";

document.addEventListener('DOMContentLoaded', async () => {

    const images = document.querySelectorAll('.image-container img');
    const templates = document.querySelectorAll('.workspace > div');
    // let selectTemplate;

    function hideAllTemplates() {
        templates.forEach(template => {
            template.style.display = 'none';
        });
    }

    const batchSelect = document.getElementById('batchSelect');

    async function getFilteredDocuments(batchName) {
        try {
            const collectionName = await getLatestCollection();
            if (!collectionName) {
                console.error("No collection name found");
                return null;
            }

            const colRef = collection(db, collectionName);
            const q = query(colRef, where("batchName", "==", batchName));
            const snapshot = await getDocs(q);

            const filteredData = snapshot.docs.map(doc => doc.data());
            return filteredData;
        } catch (error) {
            console.error("Error fetching filtered documents:", error);
            return null;
        }
    }

    async function populateBatchOptions() {
        try {
            const collectionName = await getLatestCollection();
            const colRef = collection(db, collectionName);
            const snapshot = await getDocs(colRef);

            const batchNames = [...new Set(snapshot.docs.map(doc => doc.data().batchName))];

            batchSelect.innerHTML = '<option value="">Select Batch</option> <option value="whole-batch">Whole Batch</option>';
            batchNames.forEach(batch => {
                const option = document.createElement('option');
                option.value = batch;
                option.textContent = batch;
                batchSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading batch options:", error);
        }
    }

    batchSelect.addEventListener('change', async (e) => {
        const selectedBatch = e.target.value;
        if (selectedBatch) {
            const filteredData = await getFilteredDocuments(selectedBatch);
            console.log("Filtered Data:", filteredData);
        }
    });

    await populateBatchOptions();

    function getTraineeDetails(data, id) {
        const createTable = document.getElementById(id)
        createTable.innerHTML = "";
        const table = document.createElement("table")
        const headerRow = document.createElement('tr');
        const headers = ['SI No.', 'Trainee Name', 'DU', 'Avg. Attendance'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.appendChild(document.createTextNode(headerText));
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            const siNoCell = document.createElement('td');
            siNoCell.appendChild(document.createTextNode(index + 1));
            row.appendChild(siNoCell);

            const traineeCell = document.createElement('td');
            traineeCell.appendChild(document.createTextNode(item.traineeName));
            row.appendChild(traineeCell);

            const duCell = document.createElement('td');
            duCell.appendChild(document.createTextNode(item.du));
            row.appendChild(duCell);

            const attendanceCell = document.createElement('td');
            attendanceCell.appendChild(document.createTextNode(item.avgAttendance));
            row.appendChild(attendanceCell);

            table.appendChild(row);
        });

        return table

    }

    function generateChart(data, id) {
        const canvas = document.getElementById(id);
        if (!canvas) {
            console.error(`Canvas with id "${id}" not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const chartData = {
            labels: data.map(item => item.traineeName),
            datasets: [{
                label: 'Avg. Attendance',
                data: data.map(item => item.avgAttendance),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async function getAttendanceData(data, id) {
        try {
            generateChart(data, id);
        } catch (error) {
            console.error("Error fetching data from Firebase:", error);
        }
    }

    async function getLatestCollection() {
        try {
            const metaDocRef = doc(db, 'meta', 'collections');
            const metaDocSnapshot = await getDoc(metaDocRef);

            if (metaDocSnapshot.exists()) {
                const metaData = metaDocSnapshot.data();
                const collectionNames = metaData.names;

                if (collectionNames && collectionNames.length > 0) {

                    const latestCollectionName = collectionNames[collectionNames.length - 1];
                    return latestCollectionName;
                } else {
                    console.log("No collections found in meta.");
                    return null;
                }
            } else {
                console.log("Meta document does not exist.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching the latest collection name:", error);
            return null;
        }
    }

    async function createEvaluationTable(data, id) {
        const tablePosition = document.getElementById(id);
        tablePosition.innerHTML = "";
        const table = document.createElement("table");
        const headerRow = table.insertRow();
        ["Trainee Name", "DU"].forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        const uniqueEvaluations = new Set();
        data.forEach(item => {
            item.evaluations.forEach(evaluation => {
                if (evaluation.evaluationName !== "N/A") {
                    uniqueEvaluations.add(evaluation.evaluationName);
                }
            });
        });
        const evaluationHeaders = Array.from(uniqueEvaluations);
        evaluationHeaders.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        data.forEach(item => {
            const row = table.insertRow();
            row.insertCell().textContent = item.traineeName;
            row.insertCell().textContent = item.du;
            const evaluationMap = {};
            item.evaluations.forEach(evaluation => {
                if (evaluation.evaluationName !== "N/A") {
                    evaluationMap[evaluation.evaluationName] = evaluation.evaluationScore;
                }
            });
            evaluationHeaders.forEach(header => {
                const cell = row.insertCell();
                cell.textContent = evaluationMap[header] || "";
            });
        });

        return table;
    }

    function formatCollectionName(collectionName) {
        const [month, year] = collectionName.split('-'); // Split by hyphen

        // Capitalize the first letter of the month and concatenate with the year
        return month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
    }

    async function getBatchTraineeCounts() {
        try {
            const collectionName = await getLatestCollection(); // Get the latest collection name
            const colRef = collection(db, collectionName);
            const snapshot = await getDocs(colRef);

            // Create a map to count trainees per batch
            const batchCounts = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const batchName = data.batchName;

                // Check if batchName exists before counting
                if (batchName) {
                    batchCounts[batchName] = (batchCounts[batchName] || 0) + 1;
                } else {
                    console.warn("Document missing batchName field:", doc.id);
                }
            });

            return batchCounts;
        } catch (error) {
            console.error("Error fetching trainee counts:", error);
            return null;
        }
    }

    async function generateTraineePieChart(id, chartType = 'pie', backgroundColor = [], borderColor = []) {
        const batchCounts = await getBatchTraineeCounts();
        if (!batchCounts) {
            console.error("No batch data available for the chart.");
            return;
        }

        const batchNames = Object.keys(batchCounts);
        const traineeCounts = Object.values(batchCounts);

        const ctx = document.getElementById(id).getContext('2d');
        new Chart(ctx, {
            type: chartType,
            data: {
                labels: batchNames,
                datasets: [{
                    label: 'Number of Trainees per Batch',
                    data: traineeCounts,
                    backgroundColor: backgroundColor.length ? backgroundColor : [
                        '#8061c3', '#c6b5eb', '#6823fc', '#4109b9', '#2d175c', '#7f719e'
                    ],
                    borderColor: borderColor.length ? borderColor : [
                        'rgba(128, 97, 195, 1)', 'rgba(146, 113, 209, 1)', 'rgba(164, 130, 223, 1)',
                        'rgba(182, 146, 237, 1)', 'rgba(200, 163, 251, 1)', 'rgba(218, 180, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw;
                                return `${label}: ${value} trainees`;
                            }
                        }
                    }
                }
            }
        });
    }

    async function getBatchDetailsFromLatestCollection() {
        try {
            // Fetch the latest collection name
            const latestCollectionName = await getLatestCollection();
            if (!latestCollectionName) {
                console.error("No latest collection name found.");
                return;
            }

            // Reference the latest collection
            const traineesCollection = collection(db, latestCollectionName);
            const snapshot = await getDocs(traineesCollection);

            // Initialize an object to store batch details
            const batchDetails = {};

            // Process each trainee document
            snapshot.forEach(doc => {
                const trainee = doc.data();
                const batchName = trainee.batchName;

                // If this batch is not yet in batchDetails, initialize it
                if (!batchDetails[batchName]) {
                    batchDetails[batchName] = {
                        numberOfTrainees: 0,
                        batchDurationTillDate: trainee.batchDurationTillDate || 'N/A',
                        certificationLevel: trainee.certificationLevel || 'N/A',
                        numberOfSessionsTillDate: trainee.numberOfSessionsTillDate || 'N/A',
                        batchDurationMonth: trainee.batchDurationMonth || 'N/A',
                        numberOfSessionsMonth: trainee.numberOfSessionsMonth || 'N/A',
                        trainerName: trainee.trainerName || 'N/A' // Set trainer name only once
                    };
                }

                // Increment the trainee count for the batch
                batchDetails[batchName].numberOfTrainees += 1;
            });

            // Log or return the batch details
            console.log(batchDetails);
            return batchDetails;

        } catch (error) {
            console.error("Error fetching batch details from latest collection:", error);
            alert("Failed to load batch details from the latest collection.");
        }
    }

    function renderTotalSessionProgressBars(batchDetails, sessionTillDateId, batchDurationId, sessionDurationId, selectedBatch) {
        const batchSessionContainer = document.getElementById(sessionTillDateId); // Assume there's a container for the progress bars
        const batchDurationContainer = document.getElementById(batchDurationId);
        const sessionDurationContainer = document.getElementById(sessionDurationId);
        // Clear existing content
        batchSessionContainer.innerHTML = '';
        batchDurationContainer.innerHTML = '';
        sessionDurationContainer.innerHTML = '';

        // Create progress bars for each batch

        for (const [batchName, details] of Object.entries(batchDetails)) {
            const { numberOfSessionsTillDate, batchDurationTillDate, numberOfSessionsMonth, batchDurationMonth } = details;
            const progressBarHTML = `
            <div class="progress">
                <div class="progress-bar" id="progress-bar-no-of-sessions"><h3 >${batchName} - ${numberOfSessionsTillDate} Sessions</h3></div>
            </div>`;
            batchSessionContainer.innerHTML += progressBarHTML;


            const batchDurationTilldateHTML = `<div class="progress">
            <div class="progress-bar" id="progress-bar-duration-till"><h3 >${batchName} - ${batchDurationTillDate} </h3></div>
            </div>`;
            batchDurationContainer.innerHTML += batchDurationTilldateHTML;

            if (batchName === selectedBatch) {
                const sessionDurationHTML = `
        <div class="progress">
            <div class="progress-bar id="progress-bar-duration-month"><h3>Total Duration: ${batchDurationMonth} </h3></div>
        </div>
        <div class="progress">
        <div class="progress-bar" id="progress-bar-session-month"><h3 >Total Sessions: ${numberOfSessionsMonth} </h3></div>
        </div>
        `
                sessionDurationContainer.innerHTML += sessionDurationHTML;
            }


        }
    }

    async function loadAndDisplayBatchDetails(sessionTillDateId, batchDurationId, sessionDurationId, selectedBatch) {
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (batchDetails) {
            renderTotalSessionProgressBars(batchDetails, sessionTillDateId, batchDurationId, sessionDurationId, selectedBatch);
        }
    }

    function renderCertificationLevelChart(batchData, chartElementId, backgroundColor, borderColor) {
        if (!Array.isArray(batchData) || batchData.length === 0) {
            console.error("Invalid or empty batch data provided to renderCertificationLevelChart.");
            return;
        }

        // Mapping certification levels to numerical values
        const certificationLevelsMap = {
            "N1": 5,
            "N2": 4,
            "N3": 3,
            "N4": 2,
            "N5": 1
        };

        const batchNames = batchData.map(batch => batch.batchName);
        const certificationLevels = batchData.map(batch => certificationLevelsMap[batch.certificationLevel]);

        // Destroy any existing chart instance
        if (window.certificationChart) {
            window.certificationChart.destroy();
        }

        // Get the context of the canvas element
        const ctx = document.getElementById(chartElementId).getContext('2d');
        window.certificationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: batchNames,
                datasets: [{
                    label: 'Certification Level',
                    data: certificationLevels,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'x', // Set to x for horizontal bars
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function (value) {
                                // Map numbers back to certification labels on the y-axis
                                const reverseMap = { 0: "0", 1: "N5", 2: "N4", 3: "N3", 4: "N2", 5: "N1" };
                                return reverseMap[value];
                            },
                            color: '#333'
                        },
                        title: {
                            display: true,
                            text: 'Certification Level',
                            color: '#333',
                            font: { size: 8, weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Batch Name',
                            color: '#333',
                            font: { size: 8, weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: { size: 8, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    async function getBatchObject() {
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (!batchDetails) {
            console.error("No batch details found.");
            return;
        }
        const batchDataArray = Object.entries(batchDetails).map(([batchName, details]) => ({
            batchName,
            certificationLevel: details.certificationLevel,
            batchDurationTillDate: details.batchDurationTillDate,
            certificationLevel: details.certificationLevel,
            numberOfSessionsTillDate: details.numberOfSessionsTillDate,
            batchDurationMonth: details.batchDurationMonth,
            numberOfSessionsMonth: details.numberOfSessionsMonth,
            trainerName: details.trainerName

        }));
        console.log("batch details: ", batchDataArray);
        return batchDataArray;


    }

    async function initCertificationChart(chartElementId, backgroundColor, borderColor) {
        // Fetch batch details
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (!batchDetails) {
            console.error("No batch details found.");
            return;
        }

        // Log the batch details to inspect the structure
        console.log("Batch Details:", batchDetails);

        // Convert batchDetails object to array format expected by renderCertificationLevelChart
        const batchDataArray = Object.entries(batchDetails).map(([batchName, details]) => ({
            batchName,
            certificationLevel: details.certificationLevel, // Ensure you have this field
        }));

        // Check if the batch data array is empty
        if (batchDataArray.length === 0) {
            console.error("No batch data available to render chart.");
            return;
        }

        // Render the chart
        renderCertificationLevelChart(batchDataArray, chartElementId, backgroundColor, borderColor);
    }

    async function initTrainerDetails(chartElementId) {
        // Fetch batch details
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (!batchDetails) {
            console.error("No batch details found.");
            return;
        }

        // Log the batch details to inspect the structure
        console.log("Batch Details:", batchDetails);

        // Convert batchDetails object to array format expected by renderCertificationLevelChart
        const batchDataArray = Object.entries(batchDetails).map(([batchName, details]) => ({
            batchName,
            trainerName: details.trainerName, // Ensure you have this field
        }));

        // Check if the batch data array is empty
        if (batchDataArray.length === 0) {
            console.error("No batch data available to render chart.");
            return;
        }

        // Render the chart
        displayTrainers(batchDataArray, chartElementId);
    }

    function displayTrainers(batchDetails, id) {
        const trainerContainer = document.getElementById(id); // Assume you have a container in your HTML

        // Clear the container first
        trainerContainer.innerHTML = '';


        const trainerNames = batchDetails[0].trainerName;

        if (Array.isArray(trainerNames)) {
            trainerNames.forEach(trainer => {
                const trainerLine = document.createElement('h3');
                trainerLine.textContent = `${trainer}`;
                trainerContainer.appendChild(trainerLine);
            });
        } else {
            // In case trainerName is not an array, handle accordingly
            const trainerLine = document.createElement('h3');
            trainerLine.textContent = `Trainer for ${batch}: ${trainerNames}`;
            trainerContainer.appendChild(trainerLine);
        }

    }

    async function getNofBatches() {
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (!batchDetails) {
            console.error("No batch details found.");
            return;
        }
        const numberOfBatches = Object.keys(batchDetails).length;
        return numberOfBatches;

    }

    async function populateBatchDataTemplate2() {
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (!batchDetails) {
            console.error("No batch details found.");
            return;
        }

        const mainContainer = document.getElementById('batchwise-data-template2');
        mainContainer.innerHTML = ''; // Clear any previous content

        const numberOfBatches = Object.keys(batchDetails).length;
        const batchCountDisplay = document.getElementById('number');
        batchCountDisplay.textContent = numberOfBatches;

        for (const [batchName, details] of Object.entries(batchDetails)) {
            const filteredData = await getFilteredDocuments(batchName);

            const batchContainer = document.createElement('div');
            batchContainer.classList.add('batchwise-data-template2');

            const batchDurationMonth = details.batchDurationMonth;
            const numberOfSessionsMonth = details.numberOfSessionsMonth;

            if (batchDurationMonth === undefined || numberOfSessionsMonth === undefined) {
                console.error(`No batch data available for ${batchName}.`);
                continue; // Skip this iteration
            }

            batchContainer.innerHTML = `
            <div class="batch-info">
                <h2>${batchName}</h2>
            </div>
            <div class="details-template2">
                <div class="trainee-list-template2">
                    <h3>Trainee Details</h3>
                    <div id="trainee-details-${batchName}"></div>
                </div>
                <div class="details-right-template2">
                    <div class="batch-duration-template2">
                        
                        <div id="durationChart-${batchName}">
                            <h1>Total Sessions: ${numberOfSessionsMonth} </h1>
                            <h1>Total Duration: ${batchDurationMonth} </h1>                                                    
                        </div>
                    </div>
                    <div class="attendance-template2">
                        <h3>Attendance</h3>
                        <canvas id="attendanceChart-${batchName}" ></canvas>
                    </div>
                </div>
            </div>
            <div class="trainee-evaluation-template2">
            <h3>Evaluation Details</h3>
                <div id="evaluation-table-${batchName}"></div>
            </div>
        `;

            mainContainer.appendChild(batchContainer);

            const evaluationTable1 = document.getElementById(`evaluation-table-${batchName}`);
            const table1 = await createEvaluationTable(filteredData, `evaluation-table-${batchName}`);
            evaluationTable1.appendChild(table1);

            await getAttendanceData(filteredData, `attendanceChart-${batchName}`);

            const traineeDetailsTemplate2 = document.getElementById(`trainee-details-${batchName}`);
            const traineeTable2 = await getTraineeDetails(filteredData, `trainee-details-${batchName}`) // Call your attendance data function
            traineeDetailsTemplate2.appendChild(traineeTable2);

        }
    }

    async function populateBatchDataTemplate1() {
        const batchDetails = await getBatchDetailsFromLatestCollection();
        if (!batchDetails) {
            console.error("No batch details found.");
            return;
        }

        const rightContainer = document.getElementById('right-template1');
        rightContainer.innerHTML = ''; // Clear any previous content

        rightContainer.innerHTML = `<div class="duration-sessions-template1">
                      <div class="duration-sessions-heading-template1" id="duration-sessions-heading-template1">
                        <p>Batch Duration</p>
                      </div>
                      <div class="duration-sessions-body-template1">
                        <canvas id="duration-graph-template1"></canvas>
                      </div>
                      <div class="sessions-monthly-heading-template1" id="sessions-monthly-heading-template1">
                        <p>No Of Sessions</p>
                      </div>
                      <div class="sessions-monthly-body-template1">
                        <canvas id="session-graph-template1"></canvas>
                      </div>
                    </div>                   
                    <div class="attendance-template1">
                      <div class="attendance-heading-template1" id="attendance-heading-template1">
                        <p>Average Attendance</p>
                      </div>
                      <div class="attendance-body-template1">
                        <canvas id="attendance-body-template1"></canvas>
                      </div>
                    </div>`;
        
        // await getMonthlyBatchDurationChart();
        // await getMonthlySessionChart();
        // await getAttendanceData();

        const bottomContainer = document.getElementById('batch-evaluation-template1');
        bottomContainer.innerHTML = ''; // Clear any previous content
        bottomContainer.innerHTML = `
            <div class="evaluation-heading-template1" id="evaluation-heading-template1">
                <p>Trainee Details</p>
            </div>
            <div class="evaluation-body-template1">
                        <div id="trainee-details-template1"></div>
            </div>
            <div class="batch-evaluation-heading-template1" id="batch-evaluation-heading-template1">
                <p>Evaluation Details</p>
            </div>
            <div class="batch-evaluation-body-template1">
                <div id="evaluation-table-template1"></div>
            </div>
            `
        // const traineeDetailsTemplate1 = document.getElementById(`trainee-details-template1`);
        // const traineeTable1 = await getTraineeDetailsAllBatches() // Call your attendance data function
        // traineeDetailsTemplate1.appendChild(traineeTable1);

        // const evaluationTable2 = document.getElementById(`evaluation-table-template1`);
        // const table1 = await createEvaluationTableAllBatches();
        // evaluationTable2.appendChild(table1);
    }

    // let selectedTemplate = "";

    images.forEach(image => {
        image.addEventListener('click', async function () {
            hideAllTemplates();
            const templateKey = this.getAttribute('data-template');
            selectTemplate = templateKey;

            selectedTemplate = document.getElementById(templateKey);
            if (selectedTemplate) {
                const selectedBatch = batchSelect.value;
                if (selectedBatch) {
                    const currentDate = await getLatestCollection();
                    const filteredData = await getFilteredDocuments(selectedBatch);
                    switch (templateKey) {
                        case "template1":
                            if (selectedBatch === 'whole-batch') {
                                const populatedDataTemplate2 = document.getElementById('batchwise-data-template2');
                                populatedDataTemplate2.innerHTML = '';
                                populateBatchDataTemplate1();
                            }
                            else {
                                const template1Header = document.getElementById("header-template1-h3");
                                template1Header.textContent = formatCollectionName(currentDate); // Display selected batch instead()
                                // console.log("filtered data:",filteredData)
                                await getAttendanceData(filteredData, "attendance-body-template1");
                                const traineeDetailsTemplate1 = document.getElementById("trainee-details-template1");

                                const traineeTable1 = await getTraineeDetails(filteredData, "trainee-details-template1") // Call your attendance data function
                                traineeDetailsTemplate1.appendChild(traineeTable1);

                                const evaluationTable1 = document.getElementById('evaluation-table-template1');
                                const table1 = await createEvaluationTable(filteredData, 'evaluation-table-template1');
                                evaluationTable1.appendChild(table1);

                                const numberOfTrainees = document.getElementById("trainee-piechart-template1");

                                const backgroundColor = [
                                    '#8061c3',
                                    '#c6b5eb',
                                    '#6823fc',
                                    '#4109b9',
                                    '#2d175c',
                                    '#7f719e '
                                ];
                                const borderColor = [
                                    'rgba(128, 97, 195, 1)',
                                    'rgba(146, 113, 209, 1)',
                                    'rgba(164, 130, 223, 1)',
                                    'rgba(182, 146, 237, 1)',
                                    'rgba(200, 163, 251, 1)',
                                    'rgba(218, 180, 255, 1)'
                                ];
                                numberOfTrainees.textContent = generateTraineePieChart('trainee-piechart-template1', 'pie', backgroundColor, borderColor);

                                const backgroundColor2 = '#8061c3';
                                const borderColor2 = '#8061c3';
                                initCertificationChart("certificationBarChart", backgroundColor2, borderColor2)

                                initTrainerDetails('trainer-name-template1');

                                loadAndDisplayBatchDetails('progressBarsContainer-templae1', 'whole-duration-data-templae1', 'duration-sessions-data-template1', selectedBatch);
                            }
                            break;
                        case "template2":
                            if (selectedBatch === 'whole-batch') {
                                const populatedDataTemplate2 = document.getElementById('batchwise-data-template2');
                                populatedDataTemplate2.innerHTML = '';
                                populateBatchDataTemplate2();
                            }
                            else {
                                const evaluationTable1 = document.getElementById('evaluation-table-template2');
                                const table1 = await createEvaluationTable(filteredData, 'evaluation-table-template2');
                                evaluationTable1.appendChild(table1);

                                const template2Header = document.getElementById("batch-name-template2");
                                template2Header.textContent = selectedBatch; // Display selected batch instead
                                await getAttendanceData(filteredData, "attendanceChart");
                                const traineeDetailsTemplate2 = document.getElementById("trainee-details-template2");
                                const traineeTable2 = await getTraineeDetails(filteredData, "trainee-details-template2") // Call your attendance data function
                                traineeDetailsTemplate2.appendChild(traineeTable2);
                                const numberOfTrainees = document.getElementById("learnersChart");
                                const backgroundColor = [
                                    '#C3FFC0',
                                    '#8cf087',
                                    '#6bda65',
                                    '#31af2b',
                                    '#30eb26',
                                    '#0d6609 '
                                ];
                                const borderColor = [
                                    '#C3FFC0',
                                    '#8cf087',
                                    '#6bda65',
                                    '#31af2b',
                                    '#30eb26',
                                    '#0d6609 '
                                ];
                                numberOfTrainees.textContent = generateTraineePieChart('learnersChart', 'pie', backgroundColor, borderColor);

                                const batchCountDisplay = document.getElementById('number');
                                batchCountDisplay.textContent = await getNofBatches();
                                const diaplayBatch = document.getElementById('batch-number');
                                diaplayBatch.textContent = generateTraineePieChart('batch-number', 'doughnut', backgroundColor, borderColor)
                                const backgroundColor2 = '#69f170';
                                const borderColor2 = '#69f170';
                                initCertificationChart("levelChart", backgroundColor2, borderColor2);
                                loadAndDisplayBatchDetails('sessionsChart', 'batchDurationChart', 'durationChart', selectedBatch)
                                initTrainerDetails('trainer-name-template2');
                                // const nofSessions = document.getElementById("batch-sessions-template2");
                                // const batchData = await getBatchObject();
                                // const numberOfSessionsMonth = batchData.numberOfSessionsMonth
                                // console.log(numberOfSessionsMonth);

                                // nofSessions.textContent = numberOfSessionsMonth
                                // const batchDuration = document.getElementById("batch-duration-template2");
                                // const batchDurationMonth = batchData.batchDurationMonth;
                                // console.log(batchDurationMonth);

                                // batchDuration.textContent = batchDurationMonth;

                            }
                            break;
                        case "template3":
                            const template3Header = document.getElementById("subtitle");
                            template3Header.textContent = selectedBatch; // Display selected batch instead
                            await getAttendanceData(filteredData, "t3graph");

                            // traineeTable = await getTraineeDetails(filteredData,"trainee-details-template3") // Call your attendance data function
                            // traineeDetailsTemplate1.appendChild(traineeTable);
                            break;
                        case "template4":
                            // const template4Header = document.getElementById("t4date");
                            // template4Header.textContent = selectedBatch; // Display selected batch instead
                            // await getAttendanceData(filteredData,"attendanceChart"); 

                            // traineeTable = await getTraineeDetails(filteredData,"trainee-details-template2") // Call your attendance data function
                            // traineeDetailsTemplate1.appendChild(traineeTable);
                            break;
                    }
                }


                selectedTemplate.style.display = 'block'; // Show the selected template
            }
        });
    });


})




///-Change color//

// const selectheme =document.getElementById("theme-color-black");
// selectheme.addEventListener("click",changecolor);
// function testfunction(){
//     alert("hai hisham");
// }


const themeColors = {
    "theme-color-dark-blue": { bg: "#3e68b9", accent: "#6e9af0" },
    "theme-color-violet": { bg: "#8061c3", accent: "#bda7ec" },
    "theme-color-red": { bg: "#dc143c", accent: "#e66a83" },
    "theme-color-blue": { bg: "#64a2f5", accent: "#93bdf5" },
    "theme-color-green": { bg: "#43bf73", accent: "#6bed9d" },
    "theme-color-orange": { bg: "#f09951", accent: "#f7b57e" }
};

// Add event listeners to each theme color
document.querySelectorAll('.sidebar-theme div').forEach(div => {
    div.addEventListener('click', () => {
        applyTheme(div.id);
    });
});
const commonElements = [
    "header-template1",
    "learners-template1",
    "trainer-template1",
    "session-template1",
    "level-heading",
    "duration-heading-template1",
    "duration-sessions-heading-template1",
    "attendance-heading-template1",
    "evaluation-heading-template1",
    "batch-evaluation-heading-template1",
    "container-template2"
];
function applyTheme(themeId) {
    const color = themeColors[themeId] || { bg: "#C3FFC0", accent: "green" };
    console.log("Selected Theme:", themeId);

    // Set the background color for firstColorDiv (ensure `selectedTemplate` is defined)
    // let firstColorDiv = selectedTemplate; // Ensure `selectedTemplate` refers to the correct element
    // firstColorDiv.children[0].children[0].style.backgroundColor = color.bg;
    // firstColorDiv.children[0].children[1].children[0].style.backgroundColor = color.accent;

    // Apply common background color to other elements
    document.getElementById("left-template1").style.backgroundColor = color.accent;
    commonElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.backgroundColor = color.bg;
        }
    });

    // Apply colors to tables and progress bars
    const tables = [
        "#trainee-details-template1",
        "#evaluation-table-template1",
        "#trainee-details-template2",
        "#batchwise-data-template2",

        
        
    ];

    tables.forEach(tableId => {
        const thElements = document.querySelectorAll(`${tableId} th`);
        thElements.forEach(e => e.style.backgroundColor = color.bg);
        
        const tdElements = document.querySelectorAll(`${tableId} td`);
        tdElements.forEach(e => e.style.backgroundColor = color.accent);
    });

    var th4 = document.querySelectorAll("#whole-duration-data-templae1 .progress-bar");
                    th4.forEach((e)=>{
                        e.style.backgroundColor=color.bg;
                    })
    var th1 = document.querySelectorAll("#progressBarsContainer-templae1 .progress-bar");
                    th1.forEach((e)=>{
                        e.style.backgroundColor=color.bg;
                    })
                
                    var th2 = document.querySelectorAll("#duration-sessions-data-template1 .progress-bar");
                    th2.forEach((e)=>{
                        e.style.backgroundColor=color.bg;
                    })
                    var th2 = document.querySelectorAll("#sessionsChart .progress-bar");
                    th2.forEach((e)=>{
                        e.style.backgroundColor=color.bg;
                    })
                    var th2 = document.querySelectorAll("#batchDurationChart .progress-bar");
                    th2.forEach((e)=>{
                        e.style.backgroundColor=color.bg;
                    })
                    var th2 = document.querySelectorAll("#durationChart .progress-bar");
                    th2.forEach((e)=>{
                        e.style.backgroundColor=color.bg;
                    })

     // Change text color for trainer names
    const trainerNames = document.querySelectorAll("#trainer-name-template1 h3");
    trainerNames.forEach(e => e.style.color = color.bg);
    const trainerNames2 = document.querySelectorAll("#trainer-name-template2 h3");
    trainerNames2.forEach(e => e.style.color = color.bg);
}

    // Apply colors to progress bars
    // const progressBarSelectors = [
    //     "#progressBarsContainer-template1 .progress-bar",
    //     "#duration-sessions-data-template1 .progress-bar",
    //     "#whole-duration-data-template1 .progress-bar"
    // ];

    // progressBarSelectors.forEach(selector => {
    //     const bars = document.querySelectorAll(selector);
    //     bars.forEach(e => e.style.backgroundColor = color.bg);
    // });

   

