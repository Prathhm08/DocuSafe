import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXa2gSpheTePvtWISj3RxW9CxHqdDGgPA",
  authDomain: "doc-share-b472b.firebaseapp.com",
  projectId: "doc-share-b472b",
  storageBucket: "doc-share-b472b.appspot.com",
  messagingSenderId: "299550245401",
  appId: "1:299550245401:web:eafa0ea11a4af8c04fe088",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const loggedInUserId = user.uid;
    localStorage.setItem("loggedInUserId", loggedInUserId);
    console.log("User authenticated:", user);

    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById("loggedUserFName").innerText =
            userData.firstName;
          document.getElementById("loggedUserEmail").innerText = userData.email;
          document.getElementById("loggedUserLName").innerText =
            userData.lastName;
          displayUserFiles();
        } else {
          console.log("No document found matching ID");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  } else {
    console.log("No user is signed in");
    window.location.href = "index.html";
  }
});

const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const logoutButton = document.getElementById("logout");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    const user = auth.currentUser;
    if (user) {
      const filePath = `user/${user.uid}/${file.name}`;
      console.log("Uploading file to path:", filePath);

      const fileRef = ref(storage, filePath);
      uploadBytes(fileRef, file)
        .then((snapshot) => {
          console.log("Uploaded a file!");
          displayUserFiles();
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    } else {
      console.log("No user is signed in");
    }
  }
});
function displayUserFiles() {
  const user = auth.currentUser;
  if (user) {
    const userFilesRef = ref(storage, `user/${user.uid}`);
    listAll(userFilesRef)
      .then((result) => {
        fileList.innerHTML = "";
        result.items.forEach((fileRef) => {
          getDownloadURL(fileRef)
            .then((url) => {
              const div = document.createElement("div");
              div.classList.add("file-container");
              const img = document.createElement("img");
              img.src = url;
              img.classList.add("file-image");
              const shareButton = document.createElement("button");
              shareButton.innerText = "Share";
              shareButton.classList.add("share-button");
              shareButton.addEventListener("click", () => {
                copyToClipboard(url);
              });
              const deleteButton = document.createElement("button");
              deleteButton.innerText = "Delete";
              deleteButton.classList.add("delete-button");
              deleteButton.addEventListener("click", () => {
                deleteFile(fileRef.fullPath);
              });
              div.appendChild(img);
              div.appendChild(shareButton);
              div.appendChild(deleteButton);
              fileList.appendChild(div);
            })
            .catch((error) => {
              console.error("Error getting file URL:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error listing user files:", error);
      });
  } else {
    console.log("No user is signed in");
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("URL copied to clipboard!");
      console.log("Text copied to clipboard");
    })
    .catch((error) => {
      console.error("Error copying text to clipboard:", error);
    });
}

function deleteFile(filePath) {
  const fileRef = ref(storage, filePath);
  deleteObject(fileRef)
    .then(() => {
      console.log("File deleted successfully");
      displayUserFiles();
    })
    .catch((error) => {
      console.error("Error deleting file:", error);
    });
}

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("loggedInUserId");
  signOut(auth)
    .then(() => {
      window.location.href = "../index.html";
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
});
