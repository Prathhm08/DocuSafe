import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXa2gSpheTePvtWISj3RxW9CxHqdDGgPA",
  authDomain: "doc-share-b472b.firebaseapp.com",
  projectId: "doc-share-b472b",
  storageBucket: "doc-share-b472b.appspot.com",
  messagingSenderId: "299550245401",
  appId: "1:299550245401:web:eafa0ea11a4af8c04fe088",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

const signUp = document.getElementById("submitSignUp");
signUp.addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("rEmail").value;
  const password = document.getElementById("rPassword").value;
  const firstName = document.getElementById("fName").value;
  const lastName = document.getElementById("lName").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await sendEmailVerification(user);

    const userData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      emailVerified: false,
    };
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, userData);
    showMessage(
      "Account Created Successfully. Please verify your email before logging in.",
      "signUpMessage"
    );
    window.location.href = "../html/register_login.html";
  } catch (error) {
    console.error("Error creating user", error);
    const errorCode = error.code;
    if (errorCode === "auth/email-already-in-use") {
      showMessage("Email Address Already Exists !!!", "signUpMessage");
    } else {
      showMessage("Unable to create User", "signUpMessage");
    }
  }
});

const signIn = document.getElementById("submitSignIn");
signIn.addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      showMessage(
        "Please verify your email before logging in.",
        "signInMessage"
      );
      auth.signOut();
      return;
    }

    localStorage.setItem("loggedInUserId", user.uid);
    showMessage("Login is successful", "signInMessage");
    window.location.href = "../html/homepage.html";
  } catch (error) {
    console.error("Error signing in", error);
    const errorCode = error.code;
    if (errorCode === "auth/invalid-credential") {
      showMessage("Incorrect Email or Password", "signInMessage");
    } else {
      showMessage("Account does not Exist", "signInMessage");
    }
  }
});
