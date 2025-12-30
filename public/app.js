  
  // ===== LOAD ACTIVE BOOKS TO USER PAGE ======
  async function loadBooks() {
  const res = await fetch("/books");
  const books = await res.json();



  const list = document.getElementById("books");
  list.innerHTML = "";

  books
    .filter(b => b.is_active == 1)
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

//===== CHECKOUT LOGIC USER PAGE =====
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

//=====HELPER FUNCTION TO CAPTURE ERROR ====
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


loadBooks();
