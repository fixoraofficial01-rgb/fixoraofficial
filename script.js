import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// FIREBASE CONFIG

const firebaseConfig = {
  apiKey: "AIzaSyCLL7TAhFYwEwk2a0Af_FBmABabwFOphgE",
  authDomain: "fixora-95558.firebaseapp.com",
  projectId: "fixora-95558",
  storageBucket: "fixora-95558.firebasestorage.app",
  messagingSenderId: "803491664750",
  appId: "1:803491664750:web:b4eaae2888945cd725677f",
  measurementId: "G-ETZTPV47QG"
};


// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// SECTIONS

const customerSection = document.getElementById("customerSection");

const painterSection = document.getElementById("painterSection");

const adminSection = document.getElementById("adminSection");


// ROLE SWITCHING

window.showCustomer = function(){

  customerSection.style.display = "block";

  painterSection.style.display = "none";

  adminSection.style.display = "none";

};

window.showPainter = function(){

  customerSection.style.display = "none";

  painterSection.style.display = "block";

  adminSection.style.display = "none";

};

window.showAdmin = function(){

  customerSection.style.display = "none";

  painterSection.style.display = "none";

  adminSection.style.display = "block";

};


// CUSTOMER BOOKING

const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", async function(e){

  e.preventDefault();

  const formData = new FormData(bookingForm);

  const bookingData = {

    name: formData.get("name"),

    mobile: formData.get("mobile"),

    address: formData.get("address"),

    work: formData.get("work"),

    materials: formData.get("materials"),

    status: "Pending",

    assignedPainter: "Not Assigned",

    createdAt: new Date()

  };

  await addDoc(collection(db, "bookings"), bookingData);

  alert("Booking Submitted");

  bookingForm.reset();

  getBookings();

});


// PAINTER REGISTRATION

const painterForm = document.getElementById("painterForm");

painterForm.addEventListener("submit", async function(e){

  e.preventDefault();

  const formData = new FormData(painterForm);

  const painterData = {

    name: formData.get("name"),

    mobile: formData.get("mobile"),

    experience: formData.get("experience"),

    area: formData.get("area"),

    radius: formData.get("radius"),

    createdAt: new Date()

  };

  await addDoc(collection(db, "painters"), painterData);

  alert("Painter Registered");

  painterForm.reset();

  getBookings();

});


// GET PAINTERS

async function getPainters(){

  const paintersSnapshot = await getDocs(collection(db, "painters"));

  let painters = [];

  paintersSnapshot.forEach((doc) => {

    painters.push(doc.data().name);

  });

  return painters;

}


// ADMIN DASHBOARD

const bookingsContainer = document.getElementById("bookingsContainer");


async function getBookings(){

  const painters = await getPainters();

  const querySnapshot = await getDocs(collection(db, "bookings"));

  bookingsContainer.innerHTML = "";

  querySnapshot.forEach((bookingDoc) => {

    const data = bookingDoc.data();

    let painterOptions = "";

    painters.forEach((painter) => {

      painterOptions += `
        <option value="${painter}">
          ${painter}
        </option>
      `;

    });

    bookingsContainer.innerHTML += `

      <div class="booking-card">

        <h3>${data.name}</h3>

        <p><strong>Mobile:</strong> ${data.mobile}</p>

        <p><strong>Address:</strong> ${data.address}</p>

        <p><strong>Work:</strong> ${data.work}</p>

        <p><strong>Status:</strong> ${data.status}</p>

        <p>
          <strong>Assigned Painter:</strong>
          ${data.assignedPainter}
        </p>

        <select id="painter-${bookingDoc.id}">
          <option>Select Painter</option>
          ${painterOptions}
        </select>

        <button onclick="assignPainter('${bookingDoc.id}')">
          Assign Painter
        </button>

      </div>

    `;

  });

}


// ASSIGN PAINTER

window.assignPainter = async function(bookingId){

  const select = document.getElementById(`painter-${bookingId}`);

  const painterName = select.value;

  if(painterName === "Select Painter"){

    alert("Please Select Painter");

    return;

  }

  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {

    assignedPainter: painterName,

    status: "Assigned"

  });

  alert("Painter Assigned");

  getBookings();

};


// PAINTER LOGIN

const loginForm = document.getElementById("loginForm");

const painterWorks = document.getElementById("painterWorks");


loginForm.addEventListener("submit", async function(e){

  e.preventDefault();

  const mobile = document.getElementById("loginMobile").value;

  const paintersSnapshot = await getDocs(collection(db, "painters"));

  let painterName = "";

  paintersSnapshot.forEach((doc) => {

    const painter = doc.data();

    if(painter.mobile === mobile){

      painterName = painter.name;

    }

  });

  if(painterName === ""){

    alert("Painter Not Found");

    return;

  }

  loadPainterWorks(painterName);

});


// LOAD PAINTER WORKS

async function loadPainterWorks(painterName){

  const bookingsSnapshot = await getDocs(collection(db, "bookings"));

  painterWorks.innerHTML = "";

  bookingsSnapshot.forEach((docData) => {

    const booking = docData.data();

    if(booking.assignedPainter === painterName){

      painterWorks.innerHTML += `

        <div class="booking-card">

          <h3>${booking.name}</h3>

          <p><strong>Mobile:</strong> ${booking.mobile}</p>

          <p><strong>Address:</strong> ${booking.address}</p>

          <p><strong>Work:</strong> ${booking.work}</p>

          <p><strong>Status:</strong> ${booking.status}</p>

          <button onclick="completeWork('${docData.id}')">
            Mark Completed
          </button>

        </div>

      `;

    }

  });

}


// COMPLETE WORK

window.completeWork = async function(bookingId){

  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {

    status: "Completed"

  });

  alert("Work Completed");

  getBookings();

};


// LOAD BOOKINGS

getBookings();