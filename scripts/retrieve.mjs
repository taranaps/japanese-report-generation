import { db } from "./firebaseConfig.mjs"; // Your Firebase config import
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js"; // Firestore functions to retrieve documents

// Global variables to hold selected image data
document.addEventListener("DOMContentLoaded", async function () {
    await retrieveImages();
});

async function retrieveImages() {
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = ""; // Clear previous content

    try {
        // Fetch documents from Firestore (Reports collection)
        const querySnapshot = await getDocs(collection(db, "reports"));
        
        querySnapshot.forEach((doc) => {
            const imageUrl = doc.data().imageUrl;

            // Create a container div for each image
            const imageItem = document.createElement("div");
            imageItem.classList.add("image-item");

            // Create the image element
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "Thumbnail";
            img.classList.add("thumbnail");

            // Add click event to open the modal with the full image
            img.addEventListener("click", () => openModal(imageUrl));

            // Append the image to the image item div
            imageItem.appendChild(img);

            // Append the image item div to the main images container
            imagesContainer.appendChild(imageItem);
        });
    } catch (error) {
        console.error("Error retrieving images:", error);
    }
}

function openModal(imageUrl) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullSizeImage");

    modal.style.display = "block";
    modalImg.src = imageUrl;
}

document.getElementById("closeModal").onclick = function () {
    document.getElementById("imageModal").style.display = "none";
};

document.getElementById("copyUrlBtn").onclick = function() {
    const imageUrl = document.getElementById("fullSizeImage").src;

    // Use the Clipboard API to copy the image URL to the clipboard
    navigator.clipboard.writeText(imageUrl).then(function() {
        alert("Image URL copied to clipboard!");
    }).catch(function(err) {
        console.error("Failed to copy image URL: ", err);
    });
};




























