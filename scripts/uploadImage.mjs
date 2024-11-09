import {  ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";
import { storage,db} from "./firebaseConfig.mjs";
// import { collection, addDoc } from "firebase/firestore"
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
 
 
// Upload the file to Firebase Storage
 
async function uploadImageToFirebase(file) {
    const storagePath = `Reports/${file.name}`; // Define the path in Firebase Storage
    const fileRef = storageRef(storage, storagePath);
    let imageUrl = "";

    try {
        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(fileRef, file);
        console.log("Uploaded a blob or file!");

        // Get the download URL
        imageUrl = await getDownloadURL(snapshot.ref);
        console.log("File available at", imageUrl);

        // Prepare metadata to store in Firestore
        const metadata = {
            imageUrl: imageUrl,
            name: file.name,
            size: file.size, // File size in bytes
            type: file.type, // MIME type (e.g., "image/png")
            uploadedAt: new Date().toISOString()
        };

        // Save the image URL and metadata to Firestore under the "Reports" collection
        await addDoc(collection(db, "reports"), metadata);

        console.log("Image URL and metadata added to Firestore.");
    } catch (error) {
        console.error("Error uploading file:", error);
    }

    return imageUrl;
}
export default uploadImageToFirebase