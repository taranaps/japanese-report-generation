// function preview_togglepopup(){
//     document.getElementById("preview-popup").classList.toggle("active");
// }

// function share_togglepopup(){
//     document.getElementById("share-popup").classList.toggle("active");
// }



// function copyHtml() {


//     var sourceDiv = document.getElementById(`${selectedTemplateID}`);
//     var wrapperDiv = document.querySelector(".preview-report");

//     // Clone the source div including its content
//     var clonedContent = sourceDiv.cloneNode(true);

//     // Clear the wrapper div and append the cloned content
//     wrapperDiv.innerHTML = ''; // Clear previous content
//     wrapperDiv.appendChild(clonedContent); // Append cloned content

//     // Remove the source div's id from the cloned element to avoid conflicts
//     clonedContent.removeAttribute('id');

//     // Get the dimensions of the wrapper container
//     var targetWidth = wrapperDiv.offsetWidth;
//     var targetHeight = wrapperDiv.offsetHeight;

//     // Get the dimensions of the A4-sized content
//     var contentWidth = clonedContent.offsetWidth; // Get original width
//     var contentHeight = clonedContent.offsetHeight; // Get original height

//     // Check if the content exceeds the grid container's dimensions
//     if (contentWidth > targetWidth || contentHeight > targetHeight) {
//         // Calculate the scaling factor to fit both dimensions (scale proportionally)
//         var scaleWidth = targetWidth / contentWidth;
//         var scaleHeight = targetHeight / contentHeight;

//         // Use the smaller scaling factor to maintain the aspect ratio
//         var scaleFactor = Math.min(scaleWidth, scaleHeight);

//         // Apply the scaling transformation
//         clonedContent.style.transform = "scale(" + scaleFactor + ")";
//         clonedContent.style.width = contentWidth + "px"; // Reset width for scaling
//         clonedContent.style.height = contentHeight + "px"; // Reset height for scaling
//     }

//     // Center the scroll position in the wrapper
//     wrapperDiv.scrollLeft = (wrapperDiv.scrollWidth - wrapperDiv.clientWidth) / 2;
//     wrapperDiv.scrollTop = (wrapperDiv.scrollHeight - wrapperDiv.clientHeight) / 2;
// }

//  const dropdown = document.querySelectorAll('.dropdown');

// dropdown.forEach(dropdown => {
//     var select = dropdown.querySelector('.select');
//     var caret = dropdown.querySelector('.caret');
//     var menu = dropdown.querySelector('.menu');
//     var options = dropdown.querySelectorAll('.menu li');
//     var selected = dropdown.querySelector('.selected');
//     var downloadButton = document.getElementById('downloadbutton');
//     const canvas = document.getElementById('canvas');

    
//     select.addEventListener('click', () => {
//         select.classList.toggle('select-clicked');
//         caret.classList.toggle('caret-rotate');
//         menu.classList.toggle('menu-open');
//     });

//     function clearDownloadButtonListeners() {
//         let newButton = downloadButton.cloneNode(true); 
//         downloadButton.replaceWith(newButton); 
//         downloadButton = document.getElementById('download-button'); 
//     }

//     options.forEach(option => {
//         option.addEventListener('click', () => {
//             selected.innerText = option.innerText;

            
//             select.classList.remove('select-clicked');
//             caret.classList.remove('caret-rotate');
//             menu.classList.remove('menu-open');

            
//             clearDownloadButtonListeners();
//             downloadButton.disabled = false; 

//             if (selected.innerText === 'pdf') {
//                 downloadButton.addEventListener('click', downloadPDF);
//             } else if (selected.innerText === 'jpg') {
//                 downloadButton.addEventListener('click', downloadJPG);
//             } else {
//                 downloadButton.addEventListener('click', downloadPNG);
//             }

            
//             options.forEach(option => {
//                 option.classList.remove('active');
//                 option.style.backgroundColor = '';
//             });
//             option.classList.add('active');
//             option.style.backgroundColor = '#dc143cfa';
//         });
//     });

    
    

//     function downloadPDF() {
//         const { jsPDF } = window.jspdf; // Import jsPDF
    
//         // Capture the div with html2canvas
//         html2canvas(document.querySelector("#preview-report")).then(canvas => {
//             var imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to image with full quality
    
//             // Create jsPDF instance (Portrait, A4 page size)
//             var pdf = new jsPDF('p', 'mm', 'a4');
    
//             // Calculate width and height in mm (A4 size)
//             var imgWidth = 210; // A4 width in mm
//             var pageHeight = 297; // A4 height in mm
//             var imgHeight = canvas.height * imgWidth / canvas.width;
//             var heightLeft = imgHeight;
    
//             var position = 0;
    
//             // Add the first image to the PDF
//             pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
//             heightLeft -= pageHeight;
    
//             // Loop to add new pages if the content is taller than one page
//             while (heightLeft > 0) {
//                 position = heightLeft - imgHeight; // Calculate the position for the new page
//                 pdf.addPage(); // Create new page
//                 pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
//                 heightLeft -= pageHeight;
//             }
    
//             // Save the PDF with a filename
//             pdf.save("report.pdf");
//         });
//     }
    

//     function downloadJPG() {
//         const element = document.getElementById("preview-report");

//             // Use html2canvas to capture the div
//             html2canvas(element).then((canvas) => {
//                 // Convert the canvas to JPEG
//                 canvas.toBlob((blob) => {
//                     // Use FileSaver.js to save the blob directly without an anchor tag
//                     saveAs(blob, 'report.jpeg'); // Specify the file name
//                 }, 'image/jpeg'); // Specify the image format
//             });
//     }
    

    
    

    
//     function downloadPNG() {
//         const element = document.getElementById("preview-report");

//             // Use html2canvas to capture the div
//             html2canvas(element).then((canvas) => {
//                 // Convert the canvas to PNG
//                 canvas.toBlob((blob) => {
//                     // Use FileSaver.js to save the blob directly without an anchor tag
//                     saveAs(blob, 'report.png'); // Specify the file name
//                 }, 'image/png'); // Specify the image format
//             });
//     }
// });


//     document.getElementById('send-email').addEventListener('click', function(event) {
//         event.preventDefault(); // Prevent the default form submission

//         // Prepare email parameters
//         const emailParams = {
//             to_email: document.getElementById('email-input').value,
//             subject: document.getElementById("subject-input").value,
//             message: document.getElementById('message-input').value,
//         };

//         const serviceID = 'service_teoqtow';
//         const templateID = 'template_p3guues';

//         // Handle file attachment
//         const file = document.getElementById('file-input').files[0]; // Get the first file
//         if (file) {
//             const reader = new FileReader();

//             reader.onload = function() {
//                 const base64Data = reader.result.split(',')[1]; // Get base64 part
//                 // Set the correct MIME type for the attachment
//                 emailParams.attachment = {
//                     content: base64Data,
//                     filename: file.name,
//                     type: file.type, // e.g. 'application/pdf'
//                     disposition: 'attachment' // Specify this as an attachment
//                 };
//                 sendEmail(serviceID, templateID, emailParams);
//             };

//             reader.onerror = function(error) {
//                 console.error("Error reading file:", error);
//                 alert('Error reading file: ' + error.message);
//             };

//             reader.readAsDataURL(file); // Read the file as a data URL
//         } else {
//             sendEmail(serviceID, templateID, emailParams); // No attachment case
//         }
//     });

//     function sendEmail(serviceID, templateID, emailParams) {
//         emailjs.send(serviceID, templateID, emailParams)
//             .then(response => {
//                 alert('Email sent successfully!');
//                 console.log("Success:", response.status, response.text);
//             })
//             .catch(error => {
//                 console.error('Failed to send email:', error);
//                 alert('Failed to send email. Check console for details.');
//             });
//     }



const images = document.querySelectorAll('.image-container img');
const templates = document.querySelectorAll('.workspace > div');

function hideAllTemplates() {
    templates.forEach(template => {
        template.style.display = 'none';
    });
}

images.forEach(image => {
    image.addEventListener('click', function () {
        hideAllTemplates();
        const templateKey = this.getAttribute('data-template');
        console.log(templateKey);

        const selectedTemplate = document.getElementById(templateKey);
        if (selectedTemplate) {
            selectedTemplate.style.display = 'block';
        }
    });
});

function preview_togglepopup() {
    document.getElementById("preview-popup").classList.toggle("active");
}

function share_togglepopup() {
    document.getElementById("share-popup").classList.toggle("active");
}

function copyHtml() {
    const sourceDiv = document.getElementById("template2");
    const wrapperDiv = document.querySelector(".preview-report");

    // Clone the source div including its content
    const clonedContent = sourceDiv.cloneNode(true);
    // Clear the wrapper div and append the cloned content
    wrapperDiv.innerHTML = ''; // Clear previous content
    wrapperDiv.appendChild(clonedContent); // Append cloned content

    // Remove the source div's id from the cloned element to avoid conflicts
    clonedContent.removeAttribute('id');

    // Get the dimensions of the wrapper container
    const targetWidth = wrapperDiv.offsetWidth;
    const targetHeight = wrapperDiv.offsetHeight;

    // Get the dimensions of the A4-sized content
    const contentWidth = clonedContent.offsetWidth; // Get original width
    const contentHeight = clonedContent.offsetHeight; // Get original height

    // Check if the content exceeds the grid container's dimensions
    if (contentWidth > targetWidth || contentHeight > targetHeight) {
        // Calculate the scaling factor to fit both dimensions (scale proportionally)
        const scaleWidth = targetWidth / contentWidth;
        const scaleHeight = targetHeight / contentHeight;

        // Use the smaller scaling factor to maintain the aspect ratio
        const scaleFactor = Math.min(scaleWidth, scaleHeight);

        // Apply the scaling transformation
        clonedContent.style.transform = "scale(" + scaleFactor + ")";
        clonedContent.style.width = contentWidth + "px"; // Reset width for scaling
        clonedContent.style.height = contentHeight + "px"; // Reset height for scaling
    }

    // Center the scroll position in the wrapper
    wrapperDiv.scrollLeft = (wrapperDiv.scrollWidth - wrapperDiv.clientWidth) / 2;
    wrapperDiv.scrollTop = (wrapperDiv.scrollHeight - wrapperDiv.clientHeight) / 2;
}

const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelectorAll('.menu li');
    const selected = dropdown.querySelector('.selected');
    let downloadButton = document.getElementById('download-button'); // Keep the button reference

    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked');
        caret.classList.toggle('caret-rotate');
        menu.classList.toggle('menu-open');
    });

    function clearDownloadButtonListeners() {
        const newButton = downloadButton.cloneNode(true);
        downloadButton.replaceWith(newButton);
        downloadButton = newButton; // Update reference to the new button
    }

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;

            select.classList.remove('select-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');

            clearDownloadButtonListeners();
            downloadButton.disabled = false;

            // Clear previous event listeners
            downloadButton.replaceWith(downloadButton.cloneNode(true)); // Clone and replace to clear listeners

            if (selected.innerText === 'pdf') {
                downloadButton.addEventListener('click', downloadPDF);
            } else if (selected.innerText === 'jpg') {
                downloadButton.addEventListener('click', downloadJPG);
            } else {
                downloadButton.addEventListener('click', downloadPNG);
            }

            options.forEach(opt => {
                opt.classList.remove('active');
                opt.style.backgroundColor = '';
            });
            option.classList.add('active');
            option.style.backgroundColor = '#dc143cfa';
        });
    });
});

function downloadPDF() {
    const { jsPDF } = window.jspdf; // Import jsPDF

    // Capture the div with html2canvas
    html2canvas(document.querySelector("#template2")).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to image with full quality

        // Create jsPDF instance (Portrait, A4 page size)
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Calculate width and height in mm (A4 size)
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

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
    const element = document.getElementById("preview-report");

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
    const element = document.getElementById("preview-report");

    // Use html2canvas to capture the div
    html2canvas(element).then((canvas) => {
        // Convert the canvas to PNG
        canvas.toBlob((blob) => {
            // Use FileSaver.js to save the blob directly without an anchor tag
            saveAs(blob, 'report.png'); // Specify the file name
        }, 'image/png'); // Specify the image format
    });
}

document.getElementById('send-email').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Prepare email parameters
    const emailParams = {
        to_email: document.getElementById('email-input').value,
        subject: document.getElementById("subject-input").value,
        message: document.getElementById('message-input').value,
    };

    const serviceID = 'service_teoqtow';
    const templateID = 'template_p3guues';

    // Handle file attachment
    const file = document.getElementById('file-input').files[0]; // Get the first file
    if (file) {
        const reader = new FileReader();

        reader.onload = function () {
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

        reader.onerror = function (error) {
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
