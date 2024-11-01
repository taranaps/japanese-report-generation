import { checkAuth, logout } from './auth.js';
import { db } from "./firebaseConfig.mjs";
import { collection, getDocs, getFirestore, doc, getDoc, where ,query} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async () => {

    const images = document.querySelectorAll('.image-container img');
    const templates = document.querySelectorAll('.workspace > div');
    let selectTemplate;


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
        
            batchSelect.innerHTML = '<option value="">Select Batch</option>';
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
       

    function getTraineeDetails(data,id){
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

    async function getAttendanceData(data,id) {
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

    function createEvaluationTable(data, id) {
        const tablePosition = document.getElementById(id);
        tablePosition.innerHTML="";
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
        return month.charAt(0).toUpperCase() + month.slice(1) +" "+ year;
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
    
    
async function generateTraineePieChart(id) {
    const batchCounts = await getBatchTraineeCounts();
    if (!batchCounts) {
        console.error("No batch data available for the chart.");
        return;
    }

    const batchNames = Object.keys(batchCounts);
    const traineeCounts = Object.values(batchCounts);

    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: batchNames, // Use raw batch names
            datasets: [{
                label: 'Number of Trainees per Batch',
                data: traineeCounts,
                backgroundColor: [
                    '#8061c3',
                    '#c6b5eb',
                    '#6823fc',
                    '#4109b9',
                    '#2d175c',
                    '#7f719e '
                ],
                borderColor: [
                    'rgba(128, 97, 195, 1)',
                    'rgba(146, 113, 209, 1)',
                    'rgba(164, 130, 223, 1)',
                    'rgba(182, 146, 237, 1)',
                    'rgba(200, 163, 251, 1)',
                    'rgba(218, 180, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
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

    
// async function fetchBatchCertificationData() {
//     const collectionName = await getLatestCollection(); // Function to get the latest collection name
//     if (!collectionName) {
//         console.error("No collection name found");
//         return null;
//     }

//     try {
//         const colRef = collection(db, collectionName);
//         const snapshot = await getDocs(colRef);
//         const batchData = {};

//         snapshot.forEach(doc => {
//             const data = doc.data();
//             batchData[data.batchName] = data.certificationLevel; // Assuming each document has 'batchName' and 'certificationLevel'
//         });

//         return batchData;
//     } catch (error) {
//         console.error("Error fetching batch data:", error);
//         return null;
//     }
// }

// async function generateSingleCertificationBarChart(id) {
//     const batchData = await fetchBatchCertificationData();
//     if (!batchData) {
//         console.error("No batch data available for chart");
//         return;
//     }
    
//     const canvas = document.getElementById(id);
//     if (!canvas) {
//         console.error(`Canvas with id "certificationBarChart" not found`);
//         return;
//     }

//     const ctx = canvas.getContext('2d');

//     // Define certification levels from N5 (lowest) to N1 (highest)
//     const certificationLevels = ['0','N5', 'N4', 'N3', 'N2', 'N1'];
//     const batches = Object.keys(batchData);

//     // Map each batch to the correct y-value based on its certification level
//     const certificationIndexes = {
//         'N1': 5, 'N2': 4, 'N3': 3, 'N4': 2, 'N5': 1 ,'0':0
//     };

//     const chartData = {
//         labels: batches, // x-axis: batch names
//         datasets: [{
//             label: 'Certification Level',
//             data: batches.map(batch => certificationIndexes[batchData[batch]]),
//             backgroundColor: 'rgba(128, 97, 195, 0.5)',
//             borderColor: 'rgba(128, 97, 195, 1)',
//             borderWidth: 1
//         }]
//     };

//     new Chart(ctx, {
//         type: 'bar',
//         data: chartData,
//         options: {
//             responsive: true,
//             scales: {
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Batches'
//                     }
//                 },
//                 y: {
//                     type: 'category',
//                     labels: certificationLevels,
//                     reverse: true, // Flip the order to show N1 at the top
//                     title: {
//                         display: true,
//                         text: 'Certification Level'
//                     },
//                     ticks: {
//                         stepSize: 1,
//                         callback: function(value) {
//                             return certificationLevels[value];
//                         }
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function(context) {
//                             const certificationLevel = certificationLevels[context.raw];
//                             return `Certification Level: ${certificationLevel}`;
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }

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

function renderTotalSessionProgressBars(batchDetails,id) {
    const container = document.getElementById(id); // Assume there's a container for the progress bars

    // Clear existing content
    container.innerHTML = '';

    // Create progress bars for each batch
    for (const [batchName, details] of Object.entries(batchDetails)) {
        const { numberOfSessionsTillDate, maxSessions } = details;

        const progress = (numberOfSessionsTillDate / 300) * 100;

        const progressBarHTML = `
            <div class="progress-bar-container">
                <label>${batchName} - ${numberOfSessionsTillDate} Sessions</label>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
            </div>
        `;

        container.innerHTML += progressBarHTML;
    }
}
async function loadAndDisplayBatchDetails(id) {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (batchDetails) {
        renderTotalSessionProgressBars(batchDetails,id);
    }
}


function renderCertificationLevelChart(batchData, chartElementId) {
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

    // Destroy any existing chart instance if it exists
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
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis :'y',
            scales: {
                x: {
                    beginAtZero: true,
                    suggestedMax: 5, // Maximum value is 5 for N1
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            // Map numbers back to certification labels on y-axis
                            const reverseMap = { 5: "N1", 4: "N2", 3: "N3", 2: "N4", 1: "N5" };
                            return reverseMap[value];
                        }
                    },
                    title: {
                        display: true,
                        text: 'Certification Level'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Batch Name'
                    }
                }
            }
        }
    });
}

async function initCertificationChart(chartElementId) {
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
    renderCertificationLevelChart(batchDataArray, chartElementId);
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


    let selectedTemplate = "";
    
    images.forEach(image => {
        image.addEventListener('click', async function() {
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
                            const template1Header = document.getElementById("header-template1-h3");
                            template1Header.textContent = formatCollectionName(currentDate); // Display selected batch instead()
                            // console.log("filtered data:",filteredData)
                            await getAttendanceData(filteredData,"attendance-body-template1"); 
                            const traineeDetailsTemplate1 = document.getElementById("trainee-details-template1");

                            const traineeTable1 = await getTraineeDetails(filteredData,"trainee-details-template1") // Call your attendance data function
                            traineeDetailsTemplate1.appendChild(traineeTable1);

                            const evaluationTable1 = document.getElementById('evaluation-table-template1');
                            const table1 = createEvaluationTable(filteredData, 'evaluation-table-template1');
                            evaluationTable1.appendChild(table1);

                            const numberOfTrainees = document.getElementById("trainee-piechart-template1");
                            numberOfTrainees.textContent =  generateTraineePieChart('trainee-piechart-template1');

                            initCertificationChart("certificationBarChart")

                            initTrainerDetails('trainer-name-template1');

                            loadAndDisplayBatchDetails('progressBarsContainer-templae1')

                            break;
                        case "template2":
                            const template2Header = document.getElementById("template2-month");
                            template2Header.textContent = selectedBatch; // Display selected batch instead
                            await getAttendanceData(filteredData,"attendanceChart"); 
                            const traineeDetailsTemplate2 = document.getElementById("trainee-details-template2");
                            const traineeTable2 = await getTraineeDetails(filteredData,"trainee-details-template2") // Call your attendance data function
                            traineeDetailsTemplate2.appendChild(traineeTable2);
                            break;
                        case "template3":
                            const template3Header = document.getElementById("subtitle");
                            template3Header.textContent = selectedBatch; // Display selected batch instead
                            await getAttendanceData(filteredData,"t3graph"); 
                            
                            traineeTable = await getTraineeDetails(filteredData,"trainee-details-template3") // Call your attendance data function
                            traineeDetailsTemplate1.appendChild(traineeTable);
                            break;
                        case "template4":
                            const template4Header = document.getElementById("t4date");
                            template4Header.textContent = selectedBatch; // Display selected batch instead
                            await getAttendanceData(filteredData,"attendanceChart"); 
                            
                            traineeTable = await getTraineeDetails(filteredData,"trainee-details-template2") // Call your attendance data function
                            traineeDetailsTemplate1.appendChild(traineeTable);
                            break;
                    }
                }


                selectedTemplate.style.display = 'block'; // Show the selected template
            }
        });
    });


})




///-Change color//

const selectColor = document.getElementById("selectcolor");
    selectColor.addEventListener("change",changecolor)

    function changecolor(event){
        let value=event.target.value;
      
        console.log(value);

        let firstColorDiv=  selectedTemplate;
        console.log(firstColorDiv.classList[0]);
        // console.log(firstColorDiv.children[0].children[0])
        if (firstColorDiv.classList[0] == "template-one"){
            // switch(value){
            //     case "1":
            //         firstColorDiv.children[0].children[0].style.backgroundColor="#DC143C";
            //         firstColorDiv.children[0].children[1].children[0].style.backgroundColor="#e66a83";
            //         document.getElementById("learners-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("trainer-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("session-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("level-heading").style.backgroundColor="#DC143C"
            //         document.getElementById("duration-heading-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("duration-sessions-heading-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("attendance-heading-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("evaluation-heading-template1").style.backgroundColor="#DC143C"
            //         document.getElementById("batch-evaluation-heading-template1").style.backgroundColor="#DC143C"

            //     // document.getElementsByClassName("container-template2")[0].style.backgroundColor="red";
            //     // document.getElementsByClassName("box-template2")[0].style.backgroundColor="white";
            //         break;
            //     case "2":
                    
            //         firstColorDiv.children[0].children[1].children[0].style.backgroundColor="#77a6ca";
            //         firstColorDiv.children[0].children[0].style.backgroundColor="#64a2f5";
            //         document.getElementById("learners-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("trainer-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("session-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("level-heading").style.backgroundColor="#64a2f5"
            //         document.getElementById("duration-heading-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("duration-sessions-heading-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("attendance-heading-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("evaluation-heading-template1").style.backgroundColor="#64a2f5"
            //         document.getElementById("batch-evaluation-heading-template1").style.backgroundColor="#64a2f5"
            //         break;
            //     case "3":
            //         firstColorDiv.children[0].children[0].style.backgroundColor="#43bf73";
            //         firstColorDiv.children[0].children[1].children[0].style.backgroundColor="#75c794";
            //         document.getElementById("learners-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("trainer-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("session-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("level-heading").style.backgroundColor="#43bf73"
            //         document.getElementById("duration-heading-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("duration-sessions-heading-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("attendance-heading-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("evaluation-heading-template1").style.backgroundColor="#43bf73"
            //         document.getElementById("batch-evaluation-heading-template1").style.backgroundColor="#43bf73"
            //         break;
            //     case "4":
            //         firstColorDiv.children[0].children[0].style.backgroundColor="#8061c3";
            //         firstColorDiv.children[0].children[1].children[0].style.backgroundColor="#bda7ec";
            //         document.getElementById("learners-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("trainer-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("session-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("level-heading").style.backgroundColor="#8061c3"
            //         document.getElementById("duration-heading-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("duration-sessions-heading-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("attendance-heading-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("evaluation-heading-template1").style.backgroundColor="#8061c3"
            //         document.getElementById("batch-evaluation-heading-template1").style.backgroundColor="#8061c3"
            //         break;
            //     default:
            //         firstColorDiv.children[0].style.backgroundColor="#C3FFC0";  
            // }

            const colors = {
                "1": {
                    bg: "#DC143C",
                    accent: "#e66a83"
                },
                "2": {
                    bg: "#64a2f5",
                    accent: "#93bdf5"
                },
                "3": {
                    bg: "#43bf73",
                    accent: "#75c794"
                },
                "4": {
                    bg: "#8061c3",
                    accent: "#bda7ec"
                }
            };
            
            const commonElements = [
                "learners-template1",
                "trainer-template1",
                "session-template1",
                "level-heading",
                "duration-heading-template1",
                "duration-sessions-heading-template1",
                "attendance-heading-template1",
                "evaluation-heading-template1",
                "batch-evaluation-heading-template1"
            ];
            
            function applyColors(value) {
                const color = colors[value] || { bg: "#C3FFC0", accent: "" };
            
                // Set background color for the firstColorDiv children
                firstColorDiv.children[0].children[0].style.backgroundColor = color.bg;
                if (color.accent) {
                    firstColorDiv.children[0].children[1].children[0].style.backgroundColor = color.accent;
                }
            
                // Apply common background color to other elements
                commonElements.forEach(id => {
                    document.getElementById(id).style.backgroundColor = color.bg;
                });
            }
            
            // Example of calling the function
            applyColors(value);
            
        }
        else if(firstColorDiv.classList[0] == "template-two") {
            switch(value)
            {
                case "1":
                    firstColorDiv.children[0].style.backgroundColor="#DC143C";
                    

                    break;
                case "2":
                    firstColorDiv.children[0].style.backgroundColor="#64a2f5";
                    break;
                case "3":
                    firstColorDiv.children[0].style.backgroundColor="#43bf73";
                    break;
                case "4":
                    firstColorDiv.children[0].style.backgroundColor="#8061c3";
                    break;
                default:
                    firstColorDiv.children[0].style.backgroundColor="#C3FFC0";  
            }
        }
        else if(firstColorDiv.classList[0] == "template-three") {
            switch(value)
            {
                case "1":
                    firstColorDiv.children[0].style.backgroundColor="#DC143C";
                    document.getElementById("t3graph").style.backgroundColor="#e66a83";
                    document.getElementById("table-section").style.backgroundColor="#e66a83";
                    document.getElementById("t3batchname").style.color="white";
                    

                    break;
                case "2":
                    firstColorDiv.children[0].style.backgroundColor="#64a2f5";
                    document.getElementById("t3graph").style.backgroundColor="#5d94de";
                    document.getElementById("table-section").style.backgroundColor="#5d94de";
                    document.getElementById("t3batchname").style.color="#5d94de";
                    break;
                case "3":
                    firstColorDiv.children[0].style.backgroundColor="green";
                    break;
                case "4":
                    firstColorDiv.children[0].style.backgroundColor="violet";
                    break;
                default:
                    firstColorDiv.children[0].style.backgroundColor="#C3FFC0";  
            }
        }
        else if(firstColorDiv.classList[0] == "template-four") {
            switch(value)
            {
                case "1":
                    firstColorDiv.children[0].style.backgroundColor="red";
                    break;
                case "2":
                    firstColorDiv.children[0].style.backgroundColor="blue";
                    break;
                case "3":
                    firstColorDiv.children[0].style.backgroundColor="green";
                    break;
                case "4":
                    firstColorDiv.children[0].style.backgroundColor="violet";
                    break;
                default:
                    firstColorDiv.children[0].style.backgroundColor="#C3FFC0";  
            }
        }

        }
        

            
        


    