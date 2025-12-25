// ====== AUTH ======
const ADMIN_PASSWORD = ' ';
// ====== Get each Element =====
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("admin-dashboard");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("admin-password");
const loginError = document.getElementById("login-error");

//====Admin Login screen====
loginBtn.onclick = () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadRentals();
  } else {
    loginError.classList.remove("hidden");
  }
};

// ===== Menu button logic ===== //
function toggleMenu() {
  const menu = document.getElementById("dropdown-menu");
  menu.classList.toggle("hidden");
}

function goTo(path) {
  window.location.href = path;
}

function logout() {
  alert("Logout placeholder");
  // later: clear auth state
}

//===== Close dropdown when clicking outside ===== //
document.addEventListener("click", (e) => {
  const menu = document.getElementById("dropdown-menu");
  const button = document.querySelector(".menu-btn");

  if (!menu || !button) return;

  if (!menu.contains(e.target) && !button.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

//===== Returning books function =====//
async function returnBook(rentalId) {
  if (!rentalId) {
    console.error("Missing rentalId");
    return;
  }

  try {
    const res = await fetch("/rentals/return", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rental_id: rentalId })
    });
    console.log("Returning Rental", rentalId)

    if (!res.ok) {
      throw new Error("Failed to return book");
    }

    
    loadRentals();

  } catch (err) {
    console.error("Return failed:", err);
    alert("Failed to return book. Check console.");
  }
}

//===== Loads the active rentals table ===== //
async function loadRentals(){
    const res = await fetch("/rentals/active");
    const rentals = await res.json();
    console.log("rentals data", rentals)

    const table =document.getElementById('rentals-table');
    table.innerHTML = '';

    rentals.forEach(rental => {
        const tr = document.createElement('tr');
        tr.innerHTML=`
        <td>${rental.title}</td>
        <td>${rental.renter_name}</td>
        <td>${rental.due_date}</td>
        <td><button onclick='returnBook(${rental.rental_id})'>Return Book </button></td>`;
    
        table.appendChild(tr);

    });
}

// ====== MODAL STATE ======
let editingBookId = null;

// ====== MODAL CONTROLS (GLOBAL) ======
function openAddBook() {
  editingBookId = null;
  document.getElementById("modal-title").textContent = "Add Book";
  clearModal();
  openModal();
}

function openModal() {
  document.getElementById("book-modal").classList.add("show");
}

function closeModal() {
  document.getElementById("book-modal").classList.remove("show");
}

function clearModal() {
  document.getElementById("book-title").value = "";
  document.getElementById("book-author").value = "";
  document.getElementById("book-isbn").value = "";
  document.getElementById("book-total").value = "";
  document.getElementById("book-active").checked = true;
}

// ====== SAVE (STUB FOR NOW) ======
function saveBook() {
  console.log("Save book clicked");
  closeModal();
}
