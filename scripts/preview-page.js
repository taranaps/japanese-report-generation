
function preview_togglepopup() {
        document.getElementById("preview-popup").classList.toggle("active");
    }
    
    function share_togglepopup() {
        document.getElementById("share-popup").classList.toggle("active");
    }

    async function sendEmail() {
        const form = document.getElementById('email-form');
        const formData = new FormData(form);

        try {
            const response = await fetch('http://localhost:3001/send-email', {  // Corrected server URL
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send email.");
        }
    }
    