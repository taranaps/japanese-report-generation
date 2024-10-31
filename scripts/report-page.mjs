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
    
            // Trainee Name cell
            const traineeCell = document.createElement('td');
            traineeCell.appendChild(document.createTextNode(item.traineeName));
            row.appendChild(traineeCell);
    
            // DU cell
            const duCell = document.createElement('td');
            duCell.appendChild(document.createTextNode(item.du));
            row.appendChild(duCell);
    
            // Attendance cell
            const attendanceCell = document.createElement('td');
            attendanceCell.appendChild(document.createTextNode(item.avgAttendance));
            row.appendChild(attendanceCell);
    
            table.appendChild(row);
        });
    
        // Append the table to the body or a specific container
    
        // document.createTable.appendChild(table);
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

    async function getAttendanceData(id) {
        try {
            // Await the latest collection name
            const collectionName = await getLatestCollection(); 
            if (!collectionName) {
                console.error("No collection name found");
                return;
            }
    
            const colRef = collection(db, collectionName);
    
            // Filter the data for batchName "Batch 1"
            const q = query(colRef, where("batchName", "==", "Batch 1"));
            const querySnapshot = await getDocs(q);
    
            // Map through the documents to retrieve data in JSON format
            const data = querySnapshot.docs.map(doc => doc.data());
    
            // Pass the data to generateChart
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
                    // console.log("Latest collection name:", latestCollectionName);
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

    async function fetchLatestCollectionData() {
        try {
            const latestCollectionName = await getLatestCollection();
            if (latestCollectionName) {
                const colRef = collection(db, latestCollectionName);
                const querySnapshot = await getDocs(colRef);

                const latestData = querySnapshot.docs.map(doc => doc.data());
                // console.log("Data from the latest collection:", latestData);
                // console.table(latestData);

                return latestData;
            } else {
                console.log("No latest collection to fetch.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching data from the latest collection:", error);
            return null;
        }
    }

    // Call this function where needed, e.g., on page load or a button click
    fetchLatestCollectionData().then(data => {
        try {
            if (data) {
                // const datava = document.getElementById("datafield");
                // Set text content to formatted JSON string
                console.log(data);
                // datava.textContent = JSON.stringify(data, null, 2); // Format the data for better readability
            }
        } catch (error) {
            console.error("Error displaying data:", error);
        }
});

    
    images.forEach(image => {
        image.addEventListener('click', function() {
            hideAllTemplates()
            const templateKey = this.getAttribute('data-template');
            selectTemplate=templateKey

            const selectedTemplate = document.getElementById(templateKey);
            if (selectedTemplate) {

            if(templateKey==="template1"){
                fetch("../data.json")
                .then(response => response.json())
                .then(content => {
                    let templatHeaderh3 = document.getElementById("header-template1-h3");
                    templatHeaderh3.textContent = content[0].month

                })
                .catch(error => console.error('Error fetching films:', error));
                getAttendanceData("attendance-body-template1")
            }
            if(templateKey==="template2"){
                fetch("../data.json")
                .then(response => response.json())
                .then(content =>{
                let templatHeaderh3 = document.getElementById("template2-month");
                templatHeaderh3.textContent = content[0].month

                })
                .catch(error => console.error('Error fetching films:', error));
            }
            if(templateKey==="template3"){
                fetch("../data.json")
                .then(response => response.json())
                .then(content =>{
                let templatHeaderh3 = document.getElementById("subtitle");
                templatHeaderh3.textContent = content[0].month

                })
                .catch(error => console.error('Error fetching films:', error));
            }
            if(templateKey==="template4"){
                fetch("../data.json")
                .then(response => response.json())
                .then(content =>{
                let templatHeaderh3 = document.getElementById("t4date");
                templatHeaderh3.textContent = content[0].month

                })
                .catch(error => console.error('Error fetching films:', error));
            }

            selectedTemplate.style.display = 'block';
            }
            copyHtml(selectTemplate)
        });
    });
})


 




function preview_togglepopup(){
    document.getElementById("preview-popup").classList.toggle("active");
}

function share_togglepopup(){
    document.getElementById("share-popup").classList.toggle("active");
}


// function copyHtml(templatekey) {
//     var sourceDiv = document.getElementById(templatekey);
//     var wrapperDiv = document.querySelector(".preview-report");

//     // Clone the source div including its content
//     var clonedContent = sourceDiv.cloneNode(true);

//     // Clear the wrapper div and append the cloned content
//     wrapperDiv.innerHTML = ''; // Clear previous content
//     wrapperDiv.appendChild(clonedContent); // Append cloned content

//     // Remove the source div's id from the cloned element to avoid conflicts
//     clonedContent.removeAttribute('id');

//     // Set the  margin
//     setmargin(selectTemplate);
    

    

//     // // Get the actual dimensions of the cloned content
//     var contentWidth = clonedContent.offsetWidth; // Get original width
//     var contentHeight = clonedContent.offsetHeight; // Get original height

//     // // Set the cloned content's width and height to its actual size
//     clonedContent.style.width = contentWidth + "px"; // Set width to original
//     clonedContent.style.height = contentHeight + "px"; // Set height to original
    

//     // Get the dimensions of the wrapper container
//     var targetWidth = wrapperDiv.offsetWidth;
//     var targetHeight = wrapperDiv.offsetHeight;

//     // Check if the content exceeds the grid container's dimensions
//     if (contentWidth > targetWidth || contentHeight > targetHeight) {
//         // Calculate the scaling factor to fit both dimensions (scale proportionally)
//         var scaleWidth = targetWidth / contentWidth;
//         var scaleHeight = targetHeight / contentHeight;

//         // Use the smaller scaling factor to maintain the aspect ratio
//         var scaleFactor = Math.min(scaleWidth, scaleHeight);

//         // Apply the scaling transformation
//         clonedContent.style.transform = "scale(" + scaleFactor + ")";
//         clonedContent.style.transformOrigin ="left"; // Set the origin for scaling

//         // Update the dimensions to reflect the scaled content
//         clonedContent.style.width = contentWidth + "px"; // Reset width for scaling
//         clonedContent.style.height = contentHeight + "px"; // Reset height for scaling
//     } else {
//         // If the content fits, reset transform and size
//         clonedContent.style.transform = ""; // Remove scaling
//         clonedContent.style.width = contentWidth + "px"; // Set width to original
//         clonedContent.style.height = contentHeight + "px"; // Set height to original
//     }
//     // Center the scroll position in the wrapper
//     wrapperDiv.scrollLeft = (wrapperDiv.scrollWidth - wrapperDiv.clientWidth) / 2;
//     wrapperDiv.scrollTop = (wrapperDiv.scrollHeight - wrapperDiv.clientHeight) / 2;

// }

function copyHtml(templatekey) {
    var sourceDiv = document.getElementById(templatekey);
    var wrapperDiv = document.querySelector(".preview-report");

    // Clone the source div including its content
    var clonedContent = sourceDiv.cloneNode(true);

    // Clear the wrapper div and append the cloned content
    wrapperDiv.innerHTML = ''; // Clear previous content
    wrapperDiv.appendChild(clonedContent); // Append cloned content

    // Remove the source div's id from the cloned element to avoid conflicts
    clonedContent.removeAttribute('id');

    if(templatekey==='template1'){

    }
   
   else if(templatekey==='template2'){
        clonedContent.style.marginLeft ="40px";
    
     }
     else if(templatekey==='template3'){
        clonedContent.style.marginLeft="70px";
        
     }
     else{
        clonedContent.style.marginLeft="40px";

     }

   

    // Get the actual dimensions of the cloned content
    var contentWidth = clonedContent.offsetWidth; // Get original width
    var contentHeight = clonedContent.offsetHeight; // Get original height

    // Set the cloned content's width and height to its actual size
    clonedContent.style.width = contentWidth + "px"; // Set width to original
    clonedContent.style.height = contentHeight + "px"; // Set height to original

    // Get the dimensions of the wrapper container
    var targetWidth = wrapperDiv.offsetWidth;
    var targetHeight = wrapperDiv.offsetHeight;

    // Check if the content exceeds the grid container's dimensions
    if (contentWidth > targetWidth || contentHeight > targetHeight) {
        // Calculate the scaling factor to fit both dimensions (scale proportionally)
        var scaleWidth = targetWidth / contentWidth;
        var scaleHeight = targetHeight / contentHeight;

        // Use the smaller scaling factor to maintain the aspect ratio
        var scaleFactor = Math.min(scaleWidth, scaleHeight);

        // Apply the scaling transformation
        clonedContent.style.transform = "scale(" + scaleFactor + ")";
        clonedContent.style.transformOrigin = "top left"; // Set the origin for scaling

        // Update the dimensions to reflect the scaled content
        clonedContent.style.width = contentWidth + "px"; // Reset width for scaling
        clonedContent.style.height = contentHeight + "px"; // Reset height for scaling
    } else {
        // If the content fits, reset transform and size
        clonedContent.style.transform = ""; // Remove scaling
        clonedContent.style.width = contentWidth + "px"; // Set width to original
        clonedContent.style.height = contentHeight + "px"; // Set height to original
    }

    // // Center the scroll position in the wrapper
    // wrapperDiv.scrollLeft = (wrapperDiv.scrollWidth - wrapperDiv.clientWidth) / 2; // Center horizontally
    // wrapperDiv.scrollTop = (wrapperDiv.scrollHeight - wrapperDiv.clientHeight) / 2; // Center vertically
}




    



 const dropdown = document.querySelectorAll('.dropdown');

dropdown.forEach(dropdown => {
    var select = dropdown.querySelector('.select');
    var caret = dropdown.querySelector('.caret');
    var menu = dropdown.querySelector('.menu');
    var options = dropdown.querySelectorAll('.menu li');
    var selected = dropdown.querySelector('.selected');
    var downloadButton = document.getElementById('download-button');
    const canvas = document.getElementById('canvas');

    
    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked');
        caret.classList.toggle('caret-rotate');
        menu.classList.toggle('menu-open');
    });

    function clearDownloadButtonListeners() {
        let newButton = downloadButton.cloneNode(true); 
        downloadButton.replaceWith(newButton); 
        downloadButton = document.getElementById('download-button'); 
    }

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;

            
            select.classList.remove('select-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');

            
            clearDownloadButtonListeners();
            downloadButton.disabled = false; 
            console.log(selected.innerText)

            if (selected.innerText === 'pdf') {
                downloadButton.addEventListener('click', downloadPDF);
            } else if (selected.innerText === 'jpg') {
                downloadButton.addEventListener('click', downloadJPG);
            } else {
                downloadButton.addEventListener('click', downloadPNG);
            }

            
            options.forEach(option => {
                option.classList.remove('active');
                option.style.backgroundColor = '';
            });
            option.classList.add('active');
            option.style.backgroundColor = '#dc143cfa';
        });
    });

    
    

    function downloadPDF() {
        
        const { jsPDF } = window.jspdf; // Import jsPDF
    
        // Capture the div with html2canvas
        html2canvas(document.getElementById(selectTemplate)).then(canvas => {
            var imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to image with full quality
    
            // Create jsPDF instance (Portrait, A4 page size)
            var pdf = new jsPDF('p', 'mm', 'a4');
    
            // Calculate width and height in mm (A4 size)
            var imgWidth = 210; // A4 width in mm
            var pageHeight = 297; // A4 height in mm
            var imgHeight = canvas.height * imgWidth / canvas.width;
            var heightLeft = imgHeight;
    
            var position = 0;
    
            // Add the first image to the PDF
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
    
            // Loop to add new pages if the content is taller than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight; // Calculate the position for the new page
                pdf.addPage(); // Create new page
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
    
            // Save the PDF with a filename
            pdf.save("report.pdf");
        });
    }
    

    function downloadJPG() {
        const element = document.getElementById(selectTemplate);

            // Use html2canvas to capture the div
            html2canvas(element).then((canvas) => {
                // Convert the canvas to JPEG
                canvas.toBlob((blob) => {
                    // Use FileSaver.js to save the blob directly without an anchor tag
                    saveAs(blob, 'report.jpeg'); // Specify the file name
                }, 'image/jpeg'); // Specify the image format
            });
    }
    

    
    

    
    function downloadPNG() {
        const element = document.getElementById(selectTemplate);

            // Use html2canvas to capture the div
            html2canvas(element).then((canvas) => {
                // Convert the canvas to PNG
                canvas.toBlob((blob) => {
                    // Use FileSaver.js to save the blob directly without an anchor tag
                    saveAs(blob, 'report.png'); // Specify the file name
                }, 'image/png'); // Specify the image format
            });
    }
});


    document.getElementById('send-email').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Prepare email parameters
        const emailParams = {
            subject: document.getElementById("subject-input").value,
            message: document.getElementById('message-input').value,
        };

        const serviceID = 'service_teoqtow';
        const templateID = 'template_p3guues';

        // Handle file attachment
        const file = document.getElementById('file-input').files[0]; // Get the first file
        if (file) {
            const reader = new FileReader();

            reader.onload = function() {
                const base64Data = reader.result.split(',')[1]; // Get base64 part
                // Set the correct MIME type for the attachment
                emailParams.attachment = {
                    content: base64Data,
                    filename: file.name,
                    type: file.type, // e.g. 'application/pdf'
                    disposition: 'attachment' // Specify this as an attachment
                };
                sendEmail(serviceID, templateID, emailParams);
            };

            reader.onerror = function(error) {
                console.error("Error reading file:", error);
                alert('Error reading file: ' + error.message);
            };

            reader.readAsDataURL(file); // Read the file as a data URL
        } else {
            sendEmail(serviceID, templateID, emailParams); // No attachment case
        }
    });

    function sendEmail(serviceID, templateID, emailParams) {
        emailjs.send(serviceID, templateID, emailParams)
            .then(response => {
                alert('Email sent successfully!');
                console.log("Success:", response.status, response.text);
            })
            .catch(error => {
                console.error('Failed to send email:', error);
                alert('Failed to send email. Check console for details.');
            });
    }



    