  async function loadBooks() {
  const res = await fetch("/books");
  const books = await res.json();

  console.log("FULL BOOKS ARRAY:", books);

  const list = document.getElementById("books");
  list.innerHTML = "";

  books
    .filter(b => b.is_active == 1) // <-- schema match
    .forEach(book => {

      const li = document.createElement("li");
      li.className = "book-card";
      console.log('book',book)

      li.innerHTML = `
        <div>
          <h3>${book.title}</h3>
          <span class="badge ${book.available_copies > 0 ? "available" : "unavailable"}">
            ${book.available_copies > 0 ? `Available: ${book.available_copies}` : "Currently unavailable"}
          </span>
        </div>
      `;

      const btn = document.createElement("button");
      btn.textContent = "Rent";
      btn.disabled = book.available_copies === 0;
      btn.onclick = () => checkoutBook(book.id, book.title);

      li.appendChild(btn);
      list.appendChild(li);
    });
}


async function checkoutBook(bookId, title) {
  const renter = prompt("Enter your name to confirm checkout:");
  if (!renter) return;

  const res = await fetch("/rentals/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book_id: bookId, renter_name: renter })
  });

  if (res.ok) {
    showMessage(`✅ Successfully rented "${title}".`, "success");
    loadBooks();
  } else {
    showMessage("❌ Unable to complete checkout.", "error");
  }
}

//helper function to get error message
function showMessage(text, type) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = `message ${type}`;
}
let editingBookId = null;

function openAddBook() {
  alert("Clicked");
  editingBookId = null;
  document.getElementById("modal-title").textContent = "Add Book";
  clearModal();
  openModal();
}

function openEditBook(book) {
  editingBookId = book.id;
  document.getElementById("modal-title").textContent = "Edit Book";

  document.getElementById("book-title").value = book.title;
  document.getElementById("book-author").value = book.author || "";
  document.getElementById("book-isbn").value = book.isbn || "";
  document.getElementById("book-total").value = book.total_copies;
  document.getElementById("book-active").checked = Number(book.is_active) === 1;

  openModal();
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
  loadBooks(); // admin book list
}

function openModal() {
  document.getElementById("book-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("book-modal").classList.add("hidden");
}

function clearModal() {
  document.querySelectorAll("#book-modal input").forEach(i => {
    if (i.type === "checkbox") i.checked = true;
    else i.value = "";
  });
}



loadBooks();
