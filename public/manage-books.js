
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



  

//==== MANAGE BOOK TABLE =====
let showInactiveBooks = false;

async function loadBooksAdmin() {
  const res = await fetch("/books");
  const books = await res.json();

  const tbody = document.getElementById("manage-books-table");
  tbody.innerHTML = "";

  books
    .filter(book => showInactiveBooks || book.is_active === 1)
    .forEach(book => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${book.title}</td>
        <td>${book.total_copies}</td>
        <td>${book.is_active ? "Y" : "N"}</td>
        <td class="actions-cell"></td>
      `;

      const actionCell = tr.querySelector(".actions-cell");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.onclick = () => editBook(book);
      actionCell.appendChild(editBtn);

      // Deactivate / Reactivate button
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = book.is_active ? "Deactivate" : "Reactivate";
      toggleBtn.onclick = () =>
        book.is_active ? delBook(book.id) : reactivateBook(book.id);
      actionCell.appendChild(toggleBtn);

      tbody.appendChild(tr);
    });
}
function toggleInactiveBooks(checked) {
  showInactiveBooks = checked;
  loadBooksAdmin();
}

//==== Add/Edit/Delete & Book Modal ====

function openModal() {
  document.getElementById("book-modal").classList.add("show");
}

function closeModal() {
  document.getElementById("book-modal").classList.remove("show");
}

function clearModal() {
  document.querySelectorAll("#book-modal input").forEach(i => {
    if (i.type === "checkbox") i.checked = true;
    else i.value = "";
  });
}
  
let editingBookId =null;

  function editBook(book) {
    editingBookId = book.id;
    document.getElementById("modal-title").textContent = "Edit Book";
    document.getElementById("book-title").value = book.title;
    document.getElementById("book-author").value = book.author || "";
    document.getElementById("book-isbn").value = book.isbn || "";
    document.getElementById("book-total").value = book.total_copies;
    document.getElementById("book-active").checked = Number(book.is_active) === 1;

  openModal();
}

function addBook(){
  openModal()
}

async function saveBook() {
  const payload = {
    title: document.getElementById("book-title").value,
    author: document.getElementById("book-author").value,
    isbn: document.getElementById("book-isbn").value,
    total_copies: document.getElementById("book-total").value,
    is_active: document.getElementById("book-active").checked ? 1 : 0
  };

  const url = editingBookId ? `/books/${editingBookId}` : "/books";
  const method = editingBookId ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  closeModal();
  loadBooksAdmin();
}

async function delBook(book_id) {
  if (!confirm("Delete this book?")) return;

  try {
    const res = await fetch(`/books/${book_id}/deactivate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Deactivate failed");

    loadBooksAdmin(); // refresh table

  } catch (err) {
    console.error(err);
    alert("Failed to deactivate book");
  }
}




// EDIT BOOK LOGIC (TODO: Write a reactivateBook function, Clean up UI, make it pretty)
loadBooksAdmin()