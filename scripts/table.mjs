import { db } from "./firebaseConfig.mjs";
import { collection, getDocs, getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const dataTable = document.getElementById('dataTable').querySelector('tbody');
    const collectionSelect = document.getElementById('collectionSelect');

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
        });
    } catch (error) {
        console.error("Error loading collections:", error);
        alert("Failed to load collections!");
    }

    // Retrieve collection names from meta document
    async function getCollectionNames() {
        const metaDocRef = doc(db, 'meta', 'collections');
        const metaDoc = await getDoc(metaDocRef);
        return metaDoc.exists() ? metaDoc.data().names : [];
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
                    </td>
                `;
                dataTable.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data!");
        }
    }
});